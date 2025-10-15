/**
 * Supabase Client Helper
 * Re-exports the Supabase client from integrations for use in lib modules
 */

import { supabase } from "@/integrations/supabase/client";

export function createClient() {
  return supabase;
}
