const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// --- CONFIGURATION ---
const BATCH_SIZE = 100; 
const REQUEST_INTERVAL_MS = 200; 
const MAX_RETRIES = 3;

// 1. Verify Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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
    console.log(`🌱 Starting Kaizen "Time-Walk" Ingestion...`);
    
    let lastCreatedAt = null; 
    let totalProcessed = 0;
    let hasMore = true;

    while (hasMore) {
        try {
            const params = {
                limit: BATCH_SIZE,
                includes: ['cover_art'],
                contentRating: ['safe', 'suggestive', 'erotica'], 
                originalLanguage: ['ja', 'ko', 'zh', 'zh-hk'],
                'order[createdAt]': 'asc' 
            };

            if (lastCreatedAt) {
                // 🚨 ARCHITECT FIX: Sanitize Date Format
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
                    raw_source_url: m.attributes.links?.raw || null,
                    cover_url: coverUrl,
                    total_chapters_raw: parseChapterCount(m.attributes.lastChapter),
                    updated_at: m.attributes.updatedAt || new Date().toISOString() 
                };
            });

            const { error } = await supabase.from('series').upsert(mangaList, { onConflict: 'mangadex_id' });
            
            if (error) console.error('❌ Upsert Error:', error.message);
            else console.log(`✅ Upserted ${mangaList.length} titles.`);

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
            console.error('❌ API Error:', err.message);
            if (err.response?.data) {
                console.error('   Data:', JSON.stringify(err.response.data));
                // If we STILL get a 400, we must stop to debug
                if (err.response.status === 400) break;
            }
            console.log('🔄 Retrying in 5s...');
            await delay(5000);
        }
    }
    
    console.log(`\n🎉 Final Count: ${totalProcessed} titles.`);
}

seedManga();