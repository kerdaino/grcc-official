// src/lib/supabaseServer.ts
// Server-only Supabase client (uses SERVICE ROLE key)
// NOTE: never import this file in client components.

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseServer = createClient(url, serviceRole, {
  auth: { persistSession: false },
});
