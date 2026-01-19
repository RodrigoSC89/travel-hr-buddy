import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const { token, new_password } = await req.json();

    if (!token || !new_password) {
      return errorResponse('Token and new password are required', 400);
    }

    if (new_password.length < 8) {
      return errorResponse('Password must be at least 8 characters', 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify token and update password
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });

    if (error) {
      log('error', 'reset-password', 'Token verification failed', { error: error.message });
      return errorResponse('Invalid or expired token', 400);
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      data.user!.id,
      { password: new_password }
    );

    if (updateError) {
      return errorResponse('Failed to update password', 500);
    }

    log('info', 'reset-password', 'Password reset successful', { userId: data.user?.id });

    return jsonResponse({ success: true, message: 'Password updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'reset-password', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
