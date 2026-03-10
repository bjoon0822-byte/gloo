import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.log("No Supabase keys");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
    console.log("Testing search for: 강남 피부과");

    let query = supabase.from('shops').select('*');
    query = query.or(`name.ilike.%피부과%,region.ilike.%피부과%,category.ilike.%피부과%`);
    query = query.or(`region.ilike.%강남%,address.ilike.%강남%,city.ilike.%강남%`);
    query = query.limit(5);

    const { data, error } = await query;
    if (error) {
        console.error("error:", error);
    } else {
        console.log(`Found ${data.length} results:`);
        data.forEach(s => console.log(`- ${s.name} (${s.region})`));
    }
}

testSupabase();
