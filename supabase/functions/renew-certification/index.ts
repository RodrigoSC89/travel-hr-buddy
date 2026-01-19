import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

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

    const { certification_id, new_expiry_date, new_issue_date, issuing_authority, document_url } = await req.json();

    if (!certification_id || !new_expiry_date) {
      return errorResponse('Certification ID and new expiry date are required', 400);
    }

    const { data, error } = await supabase
      .from('crew_certifications')
      .update({
        expiry_date: new_expiry_date,
        issue_date: new_issue_date || new Date().toISOString(),
        issuing_authority,
        document_url,
        status: 'valid',
        updated_at: new Date().toISOString()
      })
      .eq('id', certification_id)
      .select()
      .single();

    if (error) {
      log('error', 'renew-certification', 'Failed to renew certification', { error: error.message });
      return errorResponse('Failed to renew certification', 500);
    }

    log('info', 'renew-certification', 'Certification renewed successfully', { certificationId: certification_id });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'renew-certification', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
