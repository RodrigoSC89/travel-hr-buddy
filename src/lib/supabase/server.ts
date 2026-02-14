/**
 * Supabase Server Client
 * 
 * IMPORTANT: This file re-exports the standard client.
 * The SUPABASE_SERVICE_ROLE_KEY must NEVER appear in frontend code.
 * For admin/elevated operations, use Edge Functions with server-side keys.
 * 
 * @see supabase/functions/ for server-side operations
 */

export { supabase as createClient } from '@/integrations/supabase/client';
