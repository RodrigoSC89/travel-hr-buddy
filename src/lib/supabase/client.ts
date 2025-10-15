/**
 * Supabase Client Wrapper
 * Re-exports the Supabase client from the integrations folder
 */

import { supabase as supabaseClient } from "@/integrations/supabase/client";

export function createClient() {
  return supabaseClient;
}
