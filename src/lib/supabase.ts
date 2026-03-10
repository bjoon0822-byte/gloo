import { createClient } from '@supabase/supabase-js';

declare const process: any;

// Access env variables across Node (process.env) or Vite/Browser (import.meta.env)
const supabaseUrl = typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL
    ? process.env.VITE_SUPABASE_URL
    : (import.meta as any).env?.VITE_SUPABASE_URL;

const supabaseAnonKey = typeof process !== 'undefined' && process.env.VITE_SUPABASE_ANON_KEY
    ? process.env.VITE_SUPABASE_ANON_KEY
    : (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables.");
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
