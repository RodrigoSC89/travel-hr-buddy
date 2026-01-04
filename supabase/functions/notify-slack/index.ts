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

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

type Severity = "critical" | "warning" | "info" | "success";

interface NotificationPayload {
  message: string;
  channel?: string;
  severity?: Severity;
  title?: string;
  details?: Record<string, unknown>;
  source?: string;
  errorType?: string;
  stackTrace?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { message, severity = "info", title, details, source, errorType, stackTrace } = payload;
    
    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");

    if (!slackWebhookUrl && !discordWebhookUrl) {
      console.error("No webhook URLs configured (SLACK_WEBHOOK_URL or DISCORD_WEBHOOK_URL)");
      return new Response(
        JSON.stringify({ error: "No webhook URLs configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message) {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Notify] Sending notification: severity=${severity}, title=${title}, source=${source}`);

    const severityEmoji: Record<Severity, string> = {
      critical: "🚨",
      warning: "⚠️",
      info: "ℹ️",
      success: "✅",
    };

    const severityColor: Record<Severity, number> = {
      critical: 0xDC2626,
      warning: 0xF59E0B,
      info: 0x3B82F6,
      success: 0x10B981,
    };

    const results: { slack?: boolean; discord?: boolean } = {};

    // Send to Slack
    if (slackWebhookUrl) {
      try {
        const blocks: any[] = [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `${severityEmoji[severity]} ${title || "Nautilus Alert"}`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: message },
          },
        ];

        if ((severity === "critical" || severity === "warning") && (errorType || source)) {
          blocks.push({
            type: "section",
            fields: [
              ...(errorType ? [{ type: "mrkdwn", text: `*Error Type:*\n\`${errorType}\`` }] : []),
              ...(source ? [{ type: "mrkdwn", text: `*Source:*\n${source}` }] : []),
            ],
          });
        }

        if (severity === "critical" && stackTrace) {
          const truncatedStack = stackTrace.slice(0, 500);
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Stack Trace:*\n\`\`\`${truncatedStack}${stackTrace.length > 500 ? "..." : ""}\`\`\``,
            },
          });
        }

        if (details) {
          blocks.push({
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Details:*\n\`\`\`${JSON.stringify(details, null, 2).slice(0, 800)}\`\`\``,
            },
          });
        }

        blocks.push({
          type: "context",
          elements: [{ type: "mrkdwn", text: `📅 ${new Date().toISOString()} | 🧭 Nautilus One v3.2.0` }],
        });

        if (severity === "critical") {
          blocks.push({
            type: "actions",
            elements: [{
              type: "button",
              text: { type: "plain_text", text: "🔍 View in Sentry" },
              url: "https://sentry.io/organizations/your-org/issues/",
              style: "danger",
            }],
          });
        }

        const slackPayload: SlackMessage = {
          username: "Nautilus One",
          icon_emoji: severity === "critical" ? "🚨" : "🧭",
          blocks,
        };

        const slackResponse = await fetch(slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slackPayload),
        });

        results.slack = slackResponse.ok;
        console.log(`[Slack] ${slackResponse.ok ? "✓" : "✗"} Status: ${slackResponse.status}`);
      } catch (err) {
        console.error("[Slack] Error:", err);
        results.slack = false;
      }
    }

    // Send to Discord (backup)
    if (discordWebhookUrl) {
      try {
        const embed: DiscordEmbed = {
          title: `${severityEmoji[severity]} ${title || "Nautilus Alert"}`,
          description: message,
          color: severityColor[severity],
          fields: [],
          footer: { text: "Nautilus One v3.2.0" },
          timestamp: new Date().toISOString(),
        };

        if (errorType) embed.fields!.push({ name: "Error Type", value: `\`${errorType}\``, inline: true });
        if (source) embed.fields!.push({ name: "Source", value: source, inline: true });
        
        if (severity === "critical" && stackTrace) {
          embed.fields!.push({ 
            name: "Stack Trace", 
            value: `\`\`\`${stackTrace.slice(0, 1000)}${stackTrace.length > 1000 ? "..." : ""}\`\`\`` 
          });
        }

        if (details) {
          embed.fields!.push({ 
            name: "Details", 
            value: `\`\`\`json\n${JSON.stringify(details, null, 2).slice(0, 500)}\`\`\`` 
          });
        }

        const discordPayload = {
          username: "Nautilus One",
          avatar_url: "https://i.imgur.com/8cVgwGx.png",
          embeds: [embed],
        };

        const discordResponse = await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload),
        });

        results.discord = discordResponse.ok;
        console.log(`[Discord] ${discordResponse.ok ? "✓" : "✗"} Status: ${discordResponse.status}`);
      } catch (err) {
        console.error("[Discord] Error:", err);
        results.discord = false;
      }
    }

    const anySuccess = results.slack || results.discord;
    console.log(`[Notify] Complete: Slack=${results.slack}, Discord=${results.discord}`);

    return new Response(
      JSON.stringify({ success: anySuccess, results }),
      { status: anySuccess ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Notify] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});