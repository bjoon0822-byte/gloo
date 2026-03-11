import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials in .env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clearDB() {
    try {
        console.log("Starting deletion of old dummy shops from Supabase...");
        
        // Fetch all IDs first to bypass the 1000 limit, or loop until empty
        let totalDeleted = 0;
        let hasMore = true;

        while (hasMore) {
            const { data: shops, error: fetchErr } = await supabase.from('shops').select('id').limit(1000);
            if (fetchErr) throw fetchErr;

            if (!shops || shops.length === 0) {
                hasMore = false;
                break;
            }

            const ids = shops.map(s => s.id);
            const { error: delErr } = await supabase.from('shops').delete().in('id', ids);
            if (delErr) throw delErr;

            totalDeleted += ids.length;
            console.log(`Deleted ${totalDeleted} shops...`);
        }

        console.log(`✅ Successfully wiped ${totalDeleted} shops from Supabase!`);
    } catch (error) {
        console.error("Deletion failed:", error);
    }
}

clearDB();
