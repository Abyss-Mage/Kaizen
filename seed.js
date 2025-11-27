require('dotenv').config({ path: './.env' });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// 1. Verify Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- NEW HELPER FUNCTION ---
// Maps MangaDex statuses to your Database's strict allowed values
function normalizeStatus(status) {
    const statusMap = {
        'ongoing': 'ongoing',
        'completed': 'completed',
        'hiatus': 'ongoing',    // Treat hiatus as ongoing
        'cancelled': 'dropped'  // Treat cancelled as dropped
    };
    return statusMap[status] || 'ongoing'; // Default fallback
}

async function seedManga() {
    let offset = 0;
    const LIMIT = 100;
    const BATCHES = 5; 

    console.log(`🌱 Starting Seed Process... Target: ${BATCHES * LIMIT} Titles`);

    for(let i=0; i < BATCHES; i++) {
        console.log(`\n📦 Fetching Batch ${i+1}/${BATCHES} (Offset: ${offset})...`);
        
        try {
            const response = await axios.get(`https://api.mangadex.org/manga`, {
                params: {
                    limit: LIMIT,
                    offset: offset,
                    'includes[]': 'cover_art',
                    'contentRating[]': ['safe', 'suggestive'],
                    'order[followedCount]': 'desc' 
                }
            });

            const mangaList = response.data.data.map(m => {
                const coverRel = m.relationships.find(r => r.type === 'cover_art');
                const fileName = coverRel ? coverRel.attributes?.fileName : null;
                const coverUrl = fileName 
                    ? `https://uploads.mangadex.org/covers/${m.id}/${fileName}.256.jpg` 
                    : null;

                // Safely handle missing titles
                let title = "Unknown Title";
                if (m.attributes.title) {
                    title = m.attributes.title.en || Object.values(m.attributes.title)[0] || "Unknown";
                }

                return {
                    mangadex_id: m.id,
                    title: title,
                    description: m.attributes.description ? (m.attributes.description.en || "") : "",
                    // USE THE HELPER FUNCTION HERE
                    status_scan: normalizeStatus(m.attributes.status), 
                    raw_source_url: m.attributes.links?.raw || null,
                    cover_url: coverUrl,
                    total_chapters_scan: 0, 
                    total_chapters_raw: 0 
                };
            });

            const { error } = await supabase
                .from('series')
                .upsert(mangaList, { onConflict: 'mangadex_id' });
            
            if (error) {
                console.error('❌ Supabase Error:', error.message);
                // Print the first failing item to help debug
                console.log('Failed Item Sample:', mangaList[0]);
            } else {
                console.log(`✅ Batch ${i+1} Inserted Successfully`);
            }

        } catch (err) {
            console.error('❌ API Error:', err.message);
        }
        
        offset += LIMIT;
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('\n🎉 Seeding Complete!');
}

seedManga();