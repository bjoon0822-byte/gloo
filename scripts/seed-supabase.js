import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from web/.env
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials in .env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonFilePath = path.resolve(__dirname, '../src/data/shops.json'); // Adjust path as needed

async function seedDatabase() {
    try {
        console.log(`Starting data migration to Supabase...`);

        // Read JSON file
        const rawData = fs.readFileSync(jsonFilePath, 'utf8');
        const shops = JSON.parse(rawData);

        console.log(`Successfully loaded ${shops.length} shops from JSON.`);

        // Process and format data to match Supabase schema
        const formattedShops = shops.map((s) => ({
            id: s.id,
            name: s.name,
            region: s.region || "서울 강남구", // fallback if missing
            city: s.city || "강남",
            category: s.category || "기타",
            image_url: s.image_url || null,
            operating_hours: s.operating_hours || null,
            rating: parseFloat(s.rating) || null,
            lat: parseFloat(s.lat) || null,
            lng: parseFloat(s.lng) || null,
            address: s.address || null,
            treatments: s.treatments || []
        }));

        // Insert into Supabase in batches of 1000 to avoid request payload limits
        const CHUNK_SIZE = 1000;

        for (let i = 0; i < formattedShops.length; i += CHUNK_SIZE) {
            const chunk = formattedShops.slice(i, i + CHUNK_SIZE);
            console.log(`Uploading batch ${i / CHUNK_SIZE + 1} (${chunk.length} items)...`);

            const { data, error } = await supabase
                .from('shops') // Assumes the table name is 'shops'
                .upsert(chunk, { onConflict: 'id' });

            if (error) {
                console.error(`Error uploading batch ${i / CHUNK_SIZE + 1}:`, error.message);
                throw error;
            }
        }

        console.log(`✅ Successfully seeded ${shops.length} shops to Supabase!`);

    } catch (error) {
        console.error("Migration failed:", error);
    }
}

seedDatabase();
