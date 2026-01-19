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

    const { session_id } = await req.json();

    if (!session_id) {
      return errorResponse('Session ID is required', 400);
    }

    // Update session as revoked
    const { error } = await supabase
      .from('active_sessions')
      .update({ is_active: false })
      .eq('id', session_id)
      .eq('user_id', user.id);

    if (error) {
      return errorResponse('Failed to revoke session', 500);
    }

    log('info', 'revoke-session', 'Session revoked', { userId: user.id, sessionId: session_id });

    return jsonResponse({ success: true, message: 'Session revoked' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'revoke-session', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
