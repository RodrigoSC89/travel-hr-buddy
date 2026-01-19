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

    const { alert_id, phone_numbers, message, priority } = await req.json();

    if (!phone_numbers || phone_numbers.length === 0 || !message) {
      return errorResponse('Phone numbers and message are required', 400);
    }

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      return errorResponse('Twilio credentials not configured', 500);
    }

    const results = [];
    const priorityPrefix = priority === 'critical' ? '🚨 CRITICAL: ' : priority === 'high' ? '⚠️ ALERT: ' : '';
    const fullMessage = priorityPrefix + message;

    for (const phoneNumber of phone_numbers) {
      try {
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              To: phoneNumber,
              From: twilioPhoneNumber,
              Body: fullMessage
            })
          }
        );

        const result = await response.json();
        results.push({
          phone: phoneNumber,
          success: response.ok,
          message_sid: result.sid,
          status: result.status
        });
      } catch (err) {
        results.push({
          phone: phoneNumber,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    // Log alert sending
    await supabase.from('alert_notifications').insert({
      alert_id,
      notification_type: 'sms',
      recipients: phone_numbers,
      message: fullMessage,
      priority,
      results,
      sent_by: user.id,
      sent_at: new Date().toISOString()
    });

    const successCount = results.filter(r => r.success).length;
    log('info', 'send-sms-alert', 'SMS alerts sent', { 
      total: phone_numbers.length, 
      success: successCount,
      priority 
    });

    return jsonResponse({
      success: true,
      data: {
        total_sent: phone_numbers.length,
        successful: successCount,
        failed: phone_numbers.length - successCount,
        results
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'send-sms-alert', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
