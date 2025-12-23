const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Client, Databases, Query, ID } = require('node-appwrite');
const axios = require('axios');

// --- CONFIGURATION ---
const BATCH_SIZE = 50; // 🚨 ARCHITECT UPDATE: Lowered for Appwrite Rate Limits
const REQUEST_INTERVAL_MS = 200; 
const WRITE_DELAY_MS = 50; // Throttle individual writes

// 1. Verify Environment Variables
if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.APPWRITE_API_KEY) {
    console.error('❌ Error: Missing Appwrite credentials.');
    process.exit(1);
}

// 2. Initialize Appwrite Admin Client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SERIES;

// --- HELPER FUNCTIONS ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function normalizeSourceStatus(status) {
    const statusMap = { 'ongoing': 'ongoing', 'completed': 'completed', 'hiatus': 'hiatus', 'cancelled': 'cancelled' };
    return statusMap[status] || 'ongoing'; 
}

function parseChapterCount(lastChapter) {
    if (!lastChapter) return 0;
    const parsed = parseFloat(lastChapter);
    return isNaN(parsed) ? 0 : parsed;
}

async function seedManga() {
    console.log(`🌱 Starting Kaizen "Time-Walk" Ingestion (Appwrite Engine)...`);
    
    let lastCreatedAt = null; 
    let totalProcessed = 0;
    let hasMore = true;

    while (hasMore) {
        try {
            // 1. Fetch from MangaDex
            const params = {
                limit: BATCH_SIZE,
                includes: ['cover_art'],
                contentRating: ['safe', 'suggestive', 'erotica'], 
                originalLanguage: ['ja', 'ko', 'zh', 'zh-hk'],
                'order[createdAt]': 'asc' 
            };

            if (lastCreatedAt) {
                // API requires "YYYY-MM-DDTHH:mm:ss", removing "+00:00"
                params['createdAtSince'] = lastCreatedAt.substring(0, 19);
            }

            console.log(`\n📦 Fetching Batch... (Cursor: ${params['createdAtSince'] || 'START'})`);

            const response = await axios.get(`https://api.mangadex.org/manga`, { params });
            const rawData = response.data.data;

            if (!rawData || rawData.length === 0) {
                console.log('✅ No more data found. Ingestion Complete.');
                hasMore = false;
                break;
            }

            // 2. Transform Data
            const mangaList = rawData.map(m => {
                const coverRel = m.relationships.find(r => r.type === 'cover_art');
                const coverUrl = coverRel?.attributes?.fileName 
                    ? `https://uploads.mangadex.org/covers/${m.id}/${coverRel.attributes.fileName}.256.jpg` 
                    : null;

                let title = "Unknown Title";
                if (m.attributes.title) {
                    title = m.attributes.title.en || m.attributes.title['ja-ro'] || Object.values(m.attributes.title)[0];
                }

                return {
                    mangadex_id: m.id,
                    title: title?.substring(0, 255) || "Unknown",
                    description: (m.attributes.description?.en || "").substring(0, 5000),
                    status_raw: normalizeSourceStatus(m.attributes.status), 
                    status_scan: 'ongoing', 
                    cover_url: coverUrl,
                    // Appwrite doesn't like nulls for numbers sometimes, defaulting to 0 is safer
                    total_chapters_raw: parseChapterCount(m.attributes.lastChapter),
                    updated_at: m.attributes.updatedAt || new Date().toISOString() 
                };
            });

            // 3. Appwrite Ingestion (Iterative Upsert)
            process.stdout.write('   Writing: ');
            
            for (const manga of mangaList) {
                try {
                    // Check if document exists by unique business key (mangadex_id)
                    const existing = await databases.listDocuments(DB_ID, COL_ID, [
                        Query.equal('mangadex_id', manga.mangadex_id)
                    ]);

                    if (existing.total > 0) {
                        // UPDATE
                        const docId = existing.documents[0].$id;
                        // We only update specific fields to avoid overwriting user custom data if any
                        await databases.updateDocument(DB_ID, COL_ID, docId, manga);
                        process.stdout.write('.');
                    } else {
                        // CREATE
                        await databases.createDocument(DB_ID, COL_ID, ID.unique(), manga);
                        process.stdout.write('+');
                    }
                } catch (writeErr) {
                    // Log but continue (don't break the batch)
                    console.error(`\n   ❌ Write Error [${manga.title}]:`, writeErr.message);
                }
                
                // Throttle to be kind to the backend
                await delay(WRITE_DELAY_MS);
            }

            totalProcessed += mangaList.length;

            // Update Cursor
            const lastItem = rawData[rawData.length - 1];
            
            // Prevent infinite loop on same second
            if (lastItem.attributes.createdAt === lastCreatedAt && rawData.length < BATCH_SIZE) {
                 hasMore = false; 
            }
            lastCreatedAt = lastItem.attributes.createdAt;

            await delay(REQUEST_INTERVAL_MS);

        } catch (err) {
            console.error('\n❌ API Error:', err.message);
            if (err.response?.data) {
                console.error('   Data:', JSON.stringify(err.response.data));
                if (err.response.status === 400) break;
            }
            console.log('🔄 Retrying in 5s...');
            await delay(5000);
        }
    }
    
    console.log(`\n🎉 Final Count: ${totalProcessed} titles.`);
}

seedManga();