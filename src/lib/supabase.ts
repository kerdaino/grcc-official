import { createClient } from "@supabase/supabase-js";

// Get values from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
