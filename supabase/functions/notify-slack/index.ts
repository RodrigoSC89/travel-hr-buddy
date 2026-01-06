import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Severity = "critical" | "warning" | "info" | "success";
type AlertType = "crew" | "vessel" | "compliance" | "equipment" | "bunker" | "system" | "security";

interface NotificationPayload {
  message: string;
  severity?: Severity;
  title?: string;
  details?: Record<string, unknown>;
  source?: string;
  errorType?: string;
  stackTrace?: string;
  emailTo?: string;
  alertType?: AlertType;
  vesselId?: string;
  vesselName?: string;
  actionUrl?: string;
  actionLabel?: string;
}

const severityEmoji: Record<Severity, string> = {
  critical: "🚨",
  warning: "⚠️",
  info: "ℹ️",
  success: "✅",
};

const alertTypeEmoji: Record<AlertType, string> = {
  crew: "👤",
  vessel: "🚢",
  compliance: "📋",
  equipment: "⚙️",
  bunker: "⛽",
  system: "🖥️",
  security: "🔐",
};

const severityColor: Record<Severity, string> = {
  critical: "#DC2626",
  warning: "#F59E0B",
  info: "#3B82F6",
  success: "#10B981",
};

const teamsThemeColor: Record<Severity, string> = {
  critical: "FF0000",
  warning: "FFA500",
  info: "0078D7",
  success: "00FF00",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    const { 
      message, 
      severity = "info", 
      title, 
      details, 
      source, 
      errorType, 
      stackTrace, 
      emailTo,
      alertType = "system",
      vesselId,
      vesselName,
      actionUrl,
      actionLabel
    } = payload;

    if (!message) {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const slackWebhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    const discordWebhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
    const teamsWebhookUrl = Deno.env.get("TEAMS_WEBHOOK_URL");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const results: { slack?: boolean; discord?: boolean; teams?: boolean; email?: boolean } = {};
    let anyChannelConfigured = false;

    const baseUrl = "https://ead06aad-a7d4-45d3-bdf7-e23796c6ac50.lovableproject.com";
    const alertUrl = actionUrl || `${baseUrl}/central-comando/alertas`;

    console.log(`[Notify] Processing: severity=${severity}, type=${alertType}, title=${title}, source=${source}`);

    // ========== SLACK ==========
    if (slackWebhookUrl && slackWebhookUrl.length > 20) {
      anyChannelConfigured = true;
      try {
        const blocks: any[] = [
          {
            type: "header",
            text: { 
              type: "plain_text", 
              text: `${severityEmoji[severity]} ${alertTypeEmoji[alertType]} ${title || "Nautilus Alert"}`, 
              emoji: true 
            },
          },
          { type: "section", text: { type: "mrkdwn", text: message } },
        ];

        // Add vessel info if available
        if (vesselName || vesselId) {
          blocks.push({
            type: "section",
            fields: [
              ...(vesselName ? [{ type: "mrkdwn", text: `*Vessel:* ${vesselName}` }] : []),
              ...(vesselId ? [{ type: "mrkdwn", text: `*ID:* \`${vesselId}\`` }] : []),
            ],
          });
        }

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

        // Action buttons
        blocks.push({
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: actionLabel || "View Details", emoji: true },
              url: alertUrl,
              style: severity === "critical" ? "danger" : "primary"
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Dashboard", emoji: true },
              url: `${baseUrl}/central-comando`
            }
          ]
        });

        blocks.push({
          type: "context",
          elements: [{ type: "mrkdwn", text: `📅 ${new Date().toISOString()} | 🧭 Nautilus One` }],
        });

        const slackResponse = await fetch(slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            username: "Nautilus One", 
            icon_emoji: "🧭", 
            blocks,
            attachments: [{
              color: severityColor[severity],
              fallback: `${title}: ${message}`
            }]
          }),
        });

        results.slack = slackResponse.ok;
        console.log(`[Slack] ${slackResponse.ok ? "✓" : "✗"} Status: ${slackResponse.status}`);
      } catch (err) {
        console.error("[Slack] Error:", err);
        results.slack = false;
      }
    }

    // ========== MICROSOFT TEAMS ==========
    if (teamsWebhookUrl && teamsWebhookUrl.length > 20) {
      anyChannelConfigured = true;
      try {
        const facts = [
          { name: "Severity", value: severity.toUpperCase() },
          { name: "Type", value: alertType },
          { name: "Timestamp", value: new Date().toLocaleString("pt-BR") },
        ];

        if (vesselName) facts.push({ name: "Vessel", value: vesselName });
        if (source) facts.push({ name: "Source", value: source });
        if (errorType) facts.push({ name: "Error Type", value: errorType });

        const teamsPayload = {
          "@type": "MessageCard",
          "@context": "http://schema.org/extensions",
          themeColor: teamsThemeColor[severity],
          summary: `${severityEmoji[severity]} ${title || "Nautilus Alert"}`,
          sections: [
            {
              activityTitle: `${severityEmoji[severity]} ${alertTypeEmoji[alertType]} ${title || "Nautilus Alert"}`,
              activitySubtitle: `Nautilus One Maritime Platform`,
              activityImage: "https://ead06aad-a7d4-45d3-bdf7-e23796c6ac50.lovableproject.com/favicon.ico",
              facts,
              text: message,
              markdown: true
            }
          ],
          potentialAction: [
            {
              "@type": "OpenUri",
              name: actionLabel || "View in Nautilus",
              targets: [{ os: "default", uri: alertUrl }]
            },
            {
              "@type": "OpenUri", 
              name: "Open Dashboard",
              targets: [{ os: "default", uri: `${baseUrl}/central-comando` }]
            }
          ]
        };

        // Add acknowledge action for critical alerts
        if (severity === "critical") {
          teamsPayload.potentialAction.push({
            "@type": "ActionCard",
            name: "Acknowledge Alert",
            inputs: [
              {
                "@type": "TextInput",
                id: "comment",
                isMultiline: false,
                title: "Add comment (optional)"
              }
            ],
            actions: [
              {
                "@type": "HttpPOST",
                name: "Acknowledge",
                target: `${baseUrl}/api/alerts/acknowledge`
              }
            ]
          } as any);
        }

        const teamsResponse = await fetch(teamsWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teamsPayload),
        });

        results.teams = teamsResponse.ok;
        console.log(`[Teams] ${teamsResponse.ok ? "✓" : "✗"} Status: ${teamsResponse.status}`);
      } catch (err) {
        console.error("[Teams] Error:", err);
        results.teams = false;
      }
    }

    // ========== DISCORD ==========
    if (discordWebhookUrl && discordWebhookUrl.length > 20) {
      anyChannelConfigured = true;
      try {
        const fields = [
          { name: "Type", value: `${alertTypeEmoji[alertType]} ${alertType}`, inline: true },
          { name: "Severity", value: severity.toUpperCase(), inline: true },
        ];

        if (vesselName) fields.push({ name: "Vessel", value: vesselName, inline: true });
        if (errorType) fields.push({ name: "Error", value: `\`${errorType}\``, inline: true });
        if (source) fields.push({ name: "Source", value: source, inline: true });

        const embed = {
          title: `${severityEmoji[severity]} ${title || "Nautilus Alert"}`,
          description: message,
          color: parseInt(severityColor[severity].replace("#", ""), 16),
          fields,
          footer: { text: "Nautilus One Maritime Platform" },
          timestamp: new Date().toISOString(),
          url: alertUrl
        };

        const discordResponse = await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            username: "Nautilus One", 
            avatar_url: "https://ead06aad-a7d4-45d3-bdf7-e23796c6ac50.lovableproject.com/favicon.ico",
            embeds: [embed] 
          }),
        });

        results.discord = discordResponse.ok;
        console.log(`[Discord] ${discordResponse.ok ? "✓" : "✗"} Status: ${discordResponse.status}`);
      } catch (err) {
        console.error("[Discord] Error:", err);
        results.discord = false;
      }
    }

    // ========== EMAIL (Resend) ==========
    if (resendApiKey && resendApiKey.length > 10) {
      anyChannelConfigured = true;
      try {
        const htmlContent = `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: ${severityColor[severity]}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">${severityEmoji[severity]} ${alertTypeEmoji[alertType]} ${title || "Nautilus Alert"}</h1>
              ${vesselName ? `<p style="margin: 8px 0 0 0; opacity: 0.9;">Vessel: ${vesselName}</p>` : ""}
            </div>
            <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="font-size: 16px; color: #334155; margin: 0 0 16px 0;">${message}</p>
              ${source ? `<p style="margin: 8px 0;"><strong>Source:</strong> ${source}</p>` : ""}
              ${errorType ? `<p style="margin: 8px 0;"><strong>Type:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${errorType}</code></p>` : ""}
              ${stackTrace ? `<pre style="background: #1e293b; color: #f1f5f9; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${stackTrace.slice(0, 500)}</pre>` : ""}
              ${details ? `<pre style="background: #f1f5f9; padding: 12px; border-radius: 4px; font-size: 12px;">${JSON.stringify(details, null, 2).slice(0, 500)}</pre>` : ""}
              <div style="margin-top: 20px;">
                <a href="${alertUrl}" style="display: inline-block; background: ${severityColor[severity]}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                  ${actionLabel || "View Details"} →
                </a>
              </div>
            </div>
            <div style="background: #f1f5f9; padding: 12px 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">📅 ${new Date().toLocaleString("pt-BR")} | 🧭 Nautilus One v3.2.0</p>
            </div>
          </div>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Nautilus One <onboarding@resend.dev>",
            to: [emailTo || "admin@nautilus.one"],
            subject: `${severityEmoji[severity]} ${title || "Alerta Nautilus"} - ${severity.toUpperCase()}`,
            html: htmlContent,
          }),
        });

        const emailResult = await emailResponse.json();
        results.email = emailResponse.ok;
        console.log(`[Email] ${emailResponse.ok ? "✓" : "✗"} ID: ${emailResult.id || "N/A"}`);
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
          message: "Alert logged internally (no external channels configured)",
          configuredChannels: []
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anySuccess = results.slack || results.discord || results.teams || results.email;
    const configuredChannels = Object.entries(results)
      .filter(([_, success]) => success !== undefined)
      .map(([channel]) => channel);

    console.log(`[Notify] Complete: Slack=${results.slack}, Teams=${results.teams}, Discord=${results.discord}, Email=${results.email}`);

    return new Response(
      JSON.stringify({ 
        success: anySuccess, 
        results,
        configuredChannels,
        timestamp: new Date().toISOString()
      }),
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
