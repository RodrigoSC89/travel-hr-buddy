/**
 * Supabase Server Client
 * For use in API routes and server-side operations
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

  return createSupabaseClient(supabaseUrl, supabaseKey);
}
