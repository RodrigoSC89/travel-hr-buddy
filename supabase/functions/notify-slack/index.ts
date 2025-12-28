import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SlackMessage {
  text?: string;
  blocks?: any[];
  channel?: string;
  username?: string;
  icon_emoji?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, channel, severity = "info", title, details } = await req.json();
    const webhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");

    if (!webhookUrl) {
      console.error("SLACK_WEBHOOK_URL not configured");
      return new Response(
        JSON.stringify({ error: "Slack webhook URL not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message) {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Slack] Sending notification: severity=${severity}, title=${title}`);

    // Build Slack message with blocks for rich formatting
    const severityEmoji: Record<string, string> = {
      critical: "🚨",
      warning: "⚠️",
      info: "ℹ️",
      success: "✅",
    };

    const severityColor: Record<string, string> = {
      critical: "#FF0000",
      warning: "#FFA500",
      info: "#0000FF",
      success: "#00FF00",
    };

    const slackPayload: SlackMessage = {
      username: "Nautilus One",
      icon_emoji: "🧭",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${severityEmoji[severity] || "📢"} ${title || "Nautilus Alert"}`,
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: message,
          },
        },
      ],
    };

    if (details) {
      slackPayload.blocks!.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\`\`\`${JSON.stringify(details, null, 2)}\`\`\``,
        },
      });
    }

    slackPayload.blocks!.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📅 ${new Date().toISOString()} | 🧭 Nautilus One`,
        },
      ],
    });

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Slack] API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Slack API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Slack] Notification sent successfully`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Slack] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
