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

    const { crew_member_id, exam_type, exam_date, result, next_exam_date, doctor_name, clinic_name, notes, document_url } = await req.json();

    if (!crew_member_id || !exam_type || !exam_date || !result) {
      return errorResponse('Crew member ID, exam type, date and result are required', 400);
    }

    const { data, error } = await supabase
      .from('crew_medical_exams')
      .insert({
        crew_member_id,
        exam_type,
        exam_date,
        result,
        next_exam_date,
        doctor_name,
        clinic_name,
        notes,
        document_url,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      log('error', 'add-medical-exam', 'Failed to add medical exam', { error: error.message });
      return errorResponse('Failed to add medical exam', 500);
    }

    log('info', 'add-medical-exam', 'Medical exam added successfully', { crewMemberId: crew_member_id });
    return jsonResponse({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'add-medical-exam', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
