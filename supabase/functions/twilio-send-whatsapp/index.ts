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

    const { to, message, media_url } = await req.json();

    if (!to || !message) {
      return errorResponse('Phone number and message are required', 400);
    }

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      return errorResponse('Twilio WhatsApp credentials not configured', 500);
    }

    const formParams: Record<string, string> = {
      To: `whatsapp:${to}`,
      From: `whatsapp:${twilioWhatsAppNumber}`,
      Body: message
    };

    if (media_url) {
      formParams['MediaUrl'] = media_url;
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(formParams)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      log('error', 'twilio-send-whatsapp', 'Twilio API error', { error: errorData });
      return errorResponse('Failed to send WhatsApp message', 500);
    }

    const result = await response.json();

    // Log the WhatsApp send
    await supabase.from('notification_logs').insert({
      type: 'whatsapp',
      recipient: to,
      content: message,
      status: 'sent',
      provider: 'twilio',
      provider_message_id: result.sid,
      sent_by: user.id,
      sent_at: new Date().toISOString()
    });

    log('info', 'twilio-send-whatsapp', 'WhatsApp message sent successfully', { to, messageSid: result.sid });
    return jsonResponse({
      success: true,
      data: {
        message_sid: result.sid,
        status: result.status,
        to: result.to
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'twilio-send-whatsapp', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
