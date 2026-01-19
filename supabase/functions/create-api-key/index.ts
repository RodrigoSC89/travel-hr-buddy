import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'nk_';
  let key = prefix;
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
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

    const { name, permissions, expires_in_days } = await req.json();

    if (!name) {
      return errorResponse('API key name is required', 400);
    }

    const apiKey = generateApiKey();
    const expiresAt = expires_in_days 
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: apiKey, // In production, hash this
        permissions: permissions || ['read'],
        expires_at: expiresAt,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return errorResponse('Failed to create API key', 500);
    }

    log('info', 'create-api-key', 'API key created', { userId: user.id, keyId: data.id });

    return jsonResponse({ 
      success: true, 
      api_key: apiKey, // Only shown once
      key_id: data.id,
      expires_at: expiresAt
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'create-api-key', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
