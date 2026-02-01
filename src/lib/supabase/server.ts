/**
 * Supabase Server Client
 * For use in API routes and server-side code
 * PATCH 870 - Uses centralized constants from edge-function-helper
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/edge-function-helper";

// For server-side, prefer service role key from env if available
const SERVICE_ROLE_KEY = typeof process !== "undefined" && process.env?.SUPABASE_SERVICE_ROLE_KEY
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : SUPABASE_ANON_KEY;

export function createClient() {
  return createSupabaseClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
