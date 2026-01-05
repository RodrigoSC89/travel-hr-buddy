import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Severity = "critical" | "warning" | "info" | "success";

interface NotificationPayload {
  message: string;
  severity?: Severity;
  title?: string;
  details?: Record<string, unknown>;
  source?: string;
  errorType?: string;
  stackTrace?: string;
  emailTo?: string;
}

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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { message, severity = "info", title, details, source, errorType, stackTrace, emailTo } = payload;

    if (!message) {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const results: { slack?: boolean; discord?: boolean; email?: boolean } = {};
    let anyChannelConfigured = false;

    console.log(`[Notify] Processing: severity=${severity}, title=${title}, source=${source}`);

    // Send to Slack (optional)
    if (slackWebhookUrl && slackWebhookUrl.length > 20) {
      anyChannelConfigured = true;
      try {
        const blocks: any[] = [
          {
            type: "header",
            text: { type: "plain_text", text: `${severityEmoji[severity]} ${title || "Nautilus Alert"}`, emoji: true },
          },
          { type: "section", text: { type: "mrkdwn", text: message } },
        ];

        if (source || errorType) {
          blocks.push({
            type: "section",
            fields: [
              ...(errorType ? [{ type: "mrkdwn", text: `*Error:* \`${errorType}\`` }] : []),
              ...(source ? [{ type: "mrkdwn", text: `*Source:* ${source}` }] : []),
            ],
          });
        }

        if (severity === "critical" && stackTrace) {
          blocks.push({
            type: "section",
            text: { type: "mrkdwn", text: `*Stack:*\n\`\`\`${stackTrace.slice(0, 400)}\`\`\`` },
          });
        }

        blocks.push({
          type: "context",
          elements: [{ type: "mrkdwn", text: `📅 ${new Date().toISOString()} | 🧭 Nautilus One` }],
        });

        const slackResponse = await fetch(slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "Nautilus One", icon_emoji: "🧭", blocks }),
        });

        results.slack = slackResponse.ok;
        console.log(`[Slack] ${slackResponse.ok ? "✓" : "✗"} Status: ${slackResponse.status}`);
      } catch (err) {
        console.error("[Slack] Error:", err);
        results.slack = false;
      }
    }

    // Send to Discord (optional)
    if (discordWebhookUrl && discordWebhookUrl.length > 20) {
      anyChannelConfigured = true;
      try {
        const embed = {
          title: `${severityEmoji[severity]} ${title || "Nautilus Alert"}`,
          description: message,
          color: parseInt(severityColor[severity].replace("#", ""), 16),
          fields: [
            ...(errorType ? [{ name: "Error", value: `\`${errorType}\``, inline: true }] : []),
            ...(source ? [{ name: "Source", value: source, inline: true }] : []),
          ],
          footer: { text: "Nautilus One" },
          timestamp: new Date().toISOString(),
        };

        const discordResponse = await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "Nautilus One", embeds: [embed] }),
        });

        results.discord = discordResponse.ok;
        console.log(`[Discord] ${discordResponse.ok ? "✓" : "✗"} Status: ${discordResponse.status}`);
      } catch (err) {
        console.error("[Discord] Error:", err);
        results.discord = false;
      }
    }

    // Send via Email (Resend) - Primary method
    if (resendApiKey && resendApiKey.length > 10) {
      anyChannelConfigured = true;
      try {
        const resend = new Resend(resendApiKey);
        
        const htmlContent = `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: ${severityColor[severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">${severityEmoji[severity]} ${title || "Nautilus Alert"}</h1>
            </div>
            <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="font-size: 16px; color: #334155; margin: 0 0 16px 0;">${message}</p>
              ${source ? `<p style="margin: 8px 0;"><strong>Fonte:</strong> ${source}</p>` : ""}
              ${errorType ? `<p style="margin: 8px 0;"><strong>Tipo:</strong> <code>${errorType}</code></p>` : ""}
              ${stackTrace ? `<pre style="background: #1e293b; color: #f1f5f9; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${stackTrace.slice(0, 500)}</pre>` : ""}
              ${details ? `<pre style="background: #f1f5f9; padding: 12px; border-radius: 4px; font-size: 12px;">${JSON.stringify(details, null, 2).slice(0, 500)}</pre>` : ""}
            </div>
            <div style="background: #f1f5f9; padding: 12px 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">📅 ${new Date().toLocaleString("pt-BR")} | 🧭 Nautilus One v3.2.0</p>
            </div>
          </div>
        `;

        const emailResponse = await resend.emails.send({
          from: "Nautilus One <onboarding@resend.dev>",
          to: [emailTo || "admin@nautilus.one"],
          subject: `${severityEmoji[severity]} ${title || "Alerta Nautilus"} - ${severity.toUpperCase()}`,
          html: htmlContent,
        });

        results.email = !emailResponse.error;
        console.log(`[Email] ${!emailResponse.error ? "✓" : "✗"} ID: ${emailResponse.data?.id || "N/A"}`);
      } catch (err) {
        console.error("[Email] Error:", err);
        results.email = false;
      }
    }

    // If no channels configured, log internally but don't fail
    if (!anyChannelConfigured) {
      console.log("[Notify] No external channels configured - alert logged internally only");
      return new Response(
        JSON.stringify({ 
          success: true, 
          results: { internal: true },
          message: "Alert logged internally (no external channels configured)"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anySuccess = results.slack || results.discord || results.email;
    console.log(`[Notify] Complete: Slack=${results.slack}, Discord=${results.discord}, Email=${results.email}`);

    return new Response(
      JSON.stringify({ success: anySuccess, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Notify] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
