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

    console.log(`[Slack] Sending notification: severity=${severity}, title=${title}, source=${source}`);

    const severityEmoji: Record<Severity, string> = {
      critical: "🚨",
      warning: "⚠️",
      info: "ℹ️",
      success: "✅",
    };

    const severityColor: Record<Severity, string> = {
      critical: "#DC2626",
      warning: "#F59E0B",
      info: "#3B82F6",
      success: "#10B981",
    };

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
        text: {
          type: "mrkdwn",
          text: message,
        },
      },
    ];

    // Add error details for critical/warning
    if ((severity === "critical" || severity === "warning") && (errorType || source)) {
      blocks.push({
        type: "section",
        fields: [
          ...(errorType ? [{ type: "mrkdwn", text: `*Error Type:*\n\`${errorType}\`` }] : []),
          ...(source ? [{ type: "mrkdwn", text: `*Source:*\n${source}` }] : []),
        ],
      });
    }

    // Add stack trace for critical errors
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

    // Add additional details
    if (details) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Details:*\n\`\`\`${JSON.stringify(details, null, 2).slice(0, 800)}\`\`\``,
        },
      });
    }

    // Footer
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `📅 ${new Date().toISOString()} | 🧭 Nautilus One v3.2.0`,
        },
      ],
    });

    // Add action button for critical errors
    if (severity === "critical") {
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "🔍 View in Sentry" },
            url: "https://sentry.io/organizations/your-org/issues/",
            style: "danger",
          },
        ],
      });
    }

    const slackPayload: SlackMessage = {
      username: "Nautilus One",
      icon_emoji: severity === "critical" ? "🚨" : "🧭",
      blocks,
    };

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
