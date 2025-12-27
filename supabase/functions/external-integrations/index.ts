import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
  source: string;
}

interface SlackMessage {
  channel?: string;
  text: string;
  blocks?: unknown[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      operation, 
      payload,
      webhookUrl,
      slackWebhook,
      channel
    } = await req.json();

    console.log(`[external-integrations] Operation: ${operation}`);

    switch (operation) {
      case "slack": {
        // Send message to Slack
        const SLACK_WEBHOOK = slackWebhook || Deno.env.get("SLACK_WEBHOOK_URL");
        
        if (!SLACK_WEBHOOK) {
          return new Response(
            JSON.stringify({ error: "Slack webhook not configured" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const slackPayload: SlackMessage = {
          channel: channel || "#nautilus-alerts",
          text: payload.text || "Nautilus Alert",
          blocks: payload.blocks || [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `🚢 Nautilus One Alert`,
                emoji: true
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: payload.message || payload.text
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `📍 Source: ${payload.source || "Nautilus System"} | ⏰ ${new Date().toISOString()}`
                }
              ]
            }
          ]
        };

        const slackResponse = await fetch(SLACK_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slackPayload)
        });

        if (!slackResponse.ok) {
          throw new Error(`Slack error: ${await slackResponse.text()}`);
        }

        console.log("[external-integrations] Slack message sent successfully");
        return new Response(
          JSON.stringify({ success: true, platform: "slack" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "webhook": {
        // Send to custom webhook
        if (!webhookUrl) {
          return new Response(
            JSON.stringify({ error: "Webhook URL required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const webhookPayload: WebhookPayload = {
          event: payload.event || "custom_event",
          data: payload.data || payload,
          timestamp: new Date().toISOString(),
          source: "nautilus-one"
        };

        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-Nautilus-Signature": "v1=" + Date.now() // Simple signature
          },
          body: JSON.stringify(webhookPayload)
        });

        console.log(`[external-integrations] Webhook sent to ${webhookUrl}: ${webhookResponse.status}`);
        return new Response(
          JSON.stringify({ 
            success: webhookResponse.ok, 
            status: webhookResponse.status,
            platform: "webhook"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "whatsapp": {
        // WhatsApp via Twilio
        const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
        const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
        const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM");

        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
          console.log("[external-integrations] Twilio not configured, simulating WhatsApp");
          return new Response(
            JSON.stringify({ 
              success: true, 
              simulated: true,
              message: "WhatsApp integration simulated (Twilio not configured)",
              platform: "whatsapp"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const to = payload.to;
        const message = payload.message;

        if (!to || !message) {
          return new Response(
            JSON.stringify({ error: "Missing 'to' or 'message' for WhatsApp" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append("From", `whatsapp:${TWILIO_WHATSAPP_FROM}`);
        formData.append("To", `whatsapp:${to}`);
        formData.append("Body", message);

        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData
        });

        const twilioResult = await twilioResponse.json();
        console.log("[external-integrations] Twilio WhatsApp response:", twilioResult);

        return new Response(
          JSON.stringify({ 
            success: twilioResponse.ok, 
            sid: twilioResult.sid,
            platform: "whatsapp"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "email": {
        // Simple email notification (placeholder for future SMTP/Resend integration)
        console.log("[external-integrations] Email notification:", payload);
        return new Response(
          JSON.stringify({ 
            success: true, 
            simulated: true,
            message: "Email integration placeholder",
            platform: "email"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "push": {
        // Web Push notification (placeholder)
        console.log("[external-integrations] Push notification:", payload);
        return new Response(
          JSON.stringify({ 
            success: true, 
            simulated: true,
            message: "Push notification placeholder",
            platform: "push"
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
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[external-integrations] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
