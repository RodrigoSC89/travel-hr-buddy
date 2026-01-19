import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

interface CrewImportRow {
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  rank?: string;
  nationality?: string;
  date_of_birth?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const { rows, organization_id } = await req.json() as { rows: CrewImportRow[], organization_id: string };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return errorResponse('No data to import', 400);
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const row of rows) {
      if (!row.full_name) {
        results.failed++;
        results.errors.push(`Missing full_name for row`);
        continue;
      }

      const { error } = await supabase
        .from('crew_members')
        .insert({
          full_name: row.full_name,
          email: row.email,
          phone: row.phone,
          position: row.position,
          rank: row.rank,
          nationality: row.nationality,
          date_of_birth: row.date_of_birth,
          organization_id,
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (error) {
        results.failed++;
        results.errors.push(`Failed to import ${row.full_name}: ${error.message}`);
      } else {
        results.success++;
      }
    }

    log('info', 'bulk-import-crews', 'Bulk import completed', { 
      success: results.success, 
      failed: results.failed 
    });

    return jsonResponse({ 
      success: true, 
      imported: results.success,
      failed: results.failed,
      errors: results.errors.slice(0, 10)
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'bulk-import-crews', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
