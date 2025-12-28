import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Twilio Alerts - SMS/WhatsApp Notifications for Maritime Operations
 * Sends critical alerts to operators and crew via Twilio
 */

interface AlertRequest {
  operation: "send-sms" | "send-whatsapp" | "send-batch" | "verify-number";
  to: string | string[];
  message: string;
  alertType?: "critical" | "warning" | "info";
  metadata?: Record<string, unknown>;
}

interface TwilioResponse {
  sid: string;
  status: string;
  to: string;
  dateCreated: string;
}

async function sendSMS(to: string, message: string): Promise<TwilioResponse> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    // Return mock response if Twilio not configured
    console.log("[twilio-alerts] Twilio not configured, returning mock response");
    return {
      sid: `SM${crypto.randomUUID().replace(/-/g, "").substring(0, 32)}`,
      status: "queued",
      to,
      dateCreated: new Date().toISOString(),
    };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[twilio-alerts] SMS send failed:", error);
    throw new Error(`Failed to send SMS: ${response.statusText}`);
  }

  return await response.json();
}

async function sendWhatsApp(to: string, message: string): Promise<TwilioResponse> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const whatsappNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER") || Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !whatsappNumber) {
    console.log("[twilio-alerts] WhatsApp not configured, returning mock response");
    return {
      sid: `WA${crypto.randomUUID().replace(/-/g, "").substring(0, 32)}`,
      status: "queued",
      to: `whatsapp:${to}`,
      dateCreated: new Date().toISOString(),
    };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: `whatsapp:${to}`,
      From: `whatsapp:${whatsappNumber}`,
      Body: message,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[twilio-alerts] WhatsApp send failed:", error);
    throw new Error(`Failed to send WhatsApp: ${response.statusText}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AlertRequest = await req.json();
    const { operation, to, message, alertType = "info", metadata } = payload;

    console.log(`[twilio-alerts] Operation: ${operation}, Type: ${alertType}`);

    // Format message with alert prefix
    const alertPrefix = {
      critical: "🚨 ALERTA CRÍTICO",
      warning: "⚠️ ATENÇÃO",
      info: "ℹ️ Informação",
    };
    
    const formattedMessage = `[Nautilus One]\n${alertPrefix[alertType]}\n\n${message}`;

    switch (operation) {
      case "send-sms": {
        const result = await sendSMS(to as string, formattedMessage);
        console.log(`[twilio-alerts] SMS sent to ${to}: ${result.sid}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            messageId: result.sid,
            status: result.status,
            to: result.to,
            sentAt: result.dateCreated,
            channel: "sms"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send-whatsapp": {
        const result = await sendWhatsApp(to as string, formattedMessage);
        console.log(`[twilio-alerts] WhatsApp sent to ${to}: ${result.sid}`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            messageId: result.sid,
            status: result.status,
            to: result.to,
            sentAt: result.dateCreated,
            channel: "whatsapp"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send-batch": {
        const recipients = Array.isArray(to) ? to : [to];
        const results: Array<{ to: string; messageId: string; status: string; channel: string }> = [];
        
        for (const recipient of recipients) {
          try {
            const smsResult = await sendSMS(recipient, formattedMessage);
            results.push({
              to: recipient,
              messageId: smsResult.sid,
              status: smsResult.status,
              channel: "sms",
            });
          } catch (error) {
            results.push({
              to: recipient,
              messageId: "",
              status: "failed",
              channel: "sms",
            });
            console.error(`[twilio-alerts] Failed to send to ${recipient}:`, error);
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            totalSent: results.filter(r => r.status !== "failed").length,
            totalFailed: results.filter(r => r.status === "failed").length,
            results,
            metadata
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "verify-number": {
        // Validate phone number format
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        const isValid = phoneRegex.test(to as string);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            number: to,
            isValid,
            format: isValid ? "E.164" : "invalid",
            message: isValid 
              ? "Número válido para envio de alertas" 
              : "Formato inválido. Use formato E.164: +5511999999999"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown operation: ${operation}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("[twilio-alerts] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
