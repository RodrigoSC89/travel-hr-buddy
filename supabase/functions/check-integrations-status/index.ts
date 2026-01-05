import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntegrationStatus {
  name: string;
  configured: boolean;
  lastTest?: string;
  status: "connected" | "disconnected" | "error";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const integrations: IntegrationStatus[] = [
      {
        name: "Slack",
        configured: !!slackWebhookUrl && slackWebhookUrl.length > 10,
        status: slackWebhookUrl && slackWebhookUrl.length > 10 ? "connected" : "disconnected",
      },
      {
        name: "Discord",
        configured: !!discordWebhookUrl && discordWebhookUrl.length > 10,
        status: discordWebhookUrl && discordWebhookUrl.length > 10 ? "connected" : "disconnected",
      },
      {
        name: "Email (Resend)",
        configured: !!resendApiKey && resendApiKey.length > 10,
        status: resendApiKey && resendApiKey.length > 10 ? "connected" : "disconnected",
      },
    ];

    console.log("[IntegrationsStatus] Checked:", integrations.map(i => `${i.name}=${i.status}`).join(", "));

    return new Response(
      JSON.stringify({ integrations, timestamp: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[IntegrationsStatus] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
