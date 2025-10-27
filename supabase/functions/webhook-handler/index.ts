import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
};

// Verify webhook signature
async function verifySignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return expectedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get webhook path parameters (integration_id from URL)
    const url = new URL(req.url);
    const integration_id = url.searchParams.get('integration_id');

    if (!integration_id) {
      throw new Error('Missing integration_id parameter');
    }

    // Get integration details
    const { data: integration, error: integrationError } = await supabaseClient
      .from('integrations_registry')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integration not found');
    }

    // Read the raw body
    const body = await req.text();
    const signature = req.headers.get('x-webhook-signature') || '';

    // Verify signature if webhook_secret is configured
    if (integration.webhook_secret) {
      const isValid = await verifySignature(body, signature, integration.webhook_secret);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
    }

    // Parse the webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (e) {
      webhookData = { raw: body };
    }

    // Process webhook based on provider
    let processedData = webhookData;
    
    if (integration.provider === 'zapier') {
      // Process Zapier webhook format
      processedData = {
        event: webhookData.event || 'unknown',
        data: webhookData.data || webhookData,
        timestamp: webhookData.timestamp || new Date().toISOString(),
      };
    } else if (integration.provider === 'make') {
      // Process Make.com webhook format
      processedData = {
        scenario_id: webhookData.scenario_id,
        execution_id: webhookData.execution_id,
        data: webhookData.data || webhookData,
        timestamp: new Date().toISOString(),
      };
    }

    // Log the webhook receipt
    const { error: logError } = await supabaseClient
      .from('integration_logs')
      .insert({
        integration_id,
        event_type: 'webhook_received',
        status: 'success',
        request_data: {
          headers: Object.fromEntries(req.headers.entries()),
          provider: integration.provider,
        },
        response_data: processedData,
      });

    if (logError) {
      console.error('Failed to log webhook:', logError);
    }

    // Store webhook data in integration config if needed
    const currentConfig = integration.config || {};
    const updatedConfig = {
      ...currentConfig,
      last_webhook_received: new Date().toISOString(),
      webhook_count: (currentConfig.webhook_count || 0) + 1,
    };

    await supabaseClient
      .from('integrations_registry')
      .update({ config: updatedConfig })
      .eq('id', integration_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook received and processed',
        data: processedData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);

    // Try to log the error if we have an integration_id
    const url = new URL(req.url);
    const integration_id = url.searchParams.get('integration_id');
    
    if (integration_id) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );

      await supabaseClient
        .from('integration_logs')
        .insert({
          integration_id,
          event_type: 'webhook_received',
          status: 'error',
          error_message: error.message,
        })
        .catch(console.error);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
