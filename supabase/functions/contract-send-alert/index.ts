/**
 * Contract Send Alert - Edge Function
 * Envio de alertas multi-canal (WhatsApp, Email, SMS, Telegram)
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertPayload {
  ruleId?: string;
  test?: boolean;
  channels: ('whatsapp' | 'email' | 'telegram' | 'sms')[];
  recipients: string[];
  message: string;
  subject?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AlertPayload = await req.json();
    const { channels, recipients, message, subject, priority = 'medium', test = false } = payload;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: Record<string, { success: boolean; error?: string }> = {};

    for (const channel of channels) {
      for (const recipient of recipients) {
        try {
          switch (channel) {
            case 'whatsapp': {
              const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
              const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
              const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

              if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
                results[`${channel}:${recipient}`] = { success: false, error: 'Twilio not configured' };
                continue;
              }

              const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
              const formData = new URLSearchParams({
                From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
                To: `whatsapp:${recipient}`,
                Body: message,
              });

              const twilioResponse = await fetch(twilioUrl, {
                method: 'POST',
                headers: {
                  'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
              });

              results[`${channel}:${recipient}`] = { success: twilioResponse.ok };
              break;
            }

            case 'email': {
              const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

              if (!SENDGRID_API_KEY) {
                results[`${channel}:${recipient}`] = { success: false, error: 'SendGrid not configured' };
                continue;
              }

              const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  personalizations: [{ to: [{ email: recipient }] }],
                  from: { email: 'alerts@nautione.com.br', name: 'NAUTI ONE Alerts' },
                  subject: subject || `[${priority.toUpperCase()}] Alerta de Contrato`,
                  content: [{ type: 'text/html', value: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <div style="background: ${priority === 'critical' ? '#dc2626' : priority === 'high' ? '#f59e0b' : '#3b82f6'}; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">⚠️ Alerta de Contrato</h1>
                      </div>
                      <div style="padding: 20px; background: #f9fafb;">
                        <p style="font-size: 16px; line-height: 1.6;">${message}</p>
                        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                          Prioridade: ${priority} | ${test ? 'TESTE' : 'Produção'}
                        </p>
                      </div>
                      <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                        NAUTI ONE - Sistema de Gestão Marítima
                      </div>
                    </div>
                  ` }],
                }),
              });

              results[`${channel}:${recipient}`] = { success: emailResponse.ok };
              break;
            }

            case 'sms': {
              const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
              const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
              const TWILIO_SMS_NUMBER = Deno.env.get('TWILIO_SMS_NUMBER');

              if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_SMS_NUMBER) {
                results[`${channel}:${recipient}`] = { success: false, error: 'Twilio SMS not configured' };
                continue;
              }

              const smsUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
              const smsFormData = new URLSearchParams({
                From: TWILIO_SMS_NUMBER,
                To: recipient,
                Body: message.substring(0, 160),
              });

              const smsResponse = await fetch(smsUrl, {
                method: 'POST',
                headers: {
                  'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: smsFormData,
              });

              results[`${channel}:${recipient}`] = { success: smsResponse.ok };
              break;
            }

            case 'telegram': {
              const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

              if (!TELEGRAM_BOT_TOKEN) {
                results[`${channel}:${recipient}`] = { success: false, error: 'Telegram not configured' };
                continue;
              }

              const telegramResponse = await fetch(
                `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: recipient,
                    text: message,
                    parse_mode: 'HTML',
                  }),
                }
              );

              results[`${channel}:${recipient}`] = { success: telegramResponse.ok };
              break;
            }
          }
        } catch (channelError) {
          console.error(`Error sending ${channel} to ${recipient}:`, channelError);
          results[`${channel}:${recipient}`] = { 
            success: false, 
            error: channelError instanceof Error ? channelError.message : 'Unknown error' 
          };
        }
      }
    }

    // Log alert in database
    await supabase.from('contract_alert_logs').insert({
      rule_id: payload.ruleId,
      channels,
      recipients,
      message,
      priority,
      is_test: test,
      results,
      sent_at: new Date().toISOString(),
    }).then(() => {}).catch(console.error);

    const successCount = Object.values(results).filter(r => r.success).length;
    const totalCount = Object.keys(results).length;

    return new Response(JSON.stringify({ 
      success: successCount > 0,
      results,
      summary: `${successCount}/${totalCount} alerts sent successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error("Error in contract-send-alert:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
