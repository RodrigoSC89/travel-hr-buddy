import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthRequest {
  integration_id: string;
  provider: string;
  code: string;
  state?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const body: OAuthRequest = await req.json();
    const { integration_id, provider, code } = body;

    // Get integration details
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integrations_registry')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integration not found');
    }

    // Exchange code for tokens based on provider
    let tokenData;
    
    if (provider === 'google') {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: integration.oauth_client_id,
          client_secret: integration.oauth_client_secret,
          redirect_uri: integration.oauth_redirect_uri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange OAuth code');
      }

      tokenData = await tokenResponse.json();
    } else if (provider === 'zapier') {
      // Zapier OAuth flow
      const tokenResponse = await fetch('https://zapier.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_id: integration.oauth_client_id,
          client_secret: integration.oauth_client_secret,
          redirect_uri: integration.oauth_redirect_uri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange OAuth code');
      }

      tokenData = await tokenResponse.json();
    } else {
      throw new Error('Unsupported provider');
    }

    // Update integration with tokens
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (tokenData.expires_in || 3600));

    const { error: updateError } = await supabaseClient
      .from('integrations_registry')
      .update({
        oauth_access_token: tokenData.access_token,
        oauth_refresh_token: tokenData.refresh_token,
        oauth_token_expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .eq('id', integration_id);

    if (updateError) {
      throw updateError;
    }

    // Log the successful OAuth callback
    await supabaseClient
      .from('integration_logs')
      .insert({
        integration_id,
        event_type: 'oauth_callback',
        status: 'success',
        request_data: { provider, code: 'REDACTED' },
        response_data: { expires_in: tokenData.expires_in },
      });

    return new Response(
      JSON.stringify({ success: true, message: 'OAuth integration successful' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('OAuth error:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
