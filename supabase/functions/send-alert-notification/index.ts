import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertPayload {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  source: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AlertPayload = await req.json();
    const { title, message, severity, source, timestamp, metadata } = payload;

    const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL');
    const discordWebhook = Deno.env.get('DISCORD_WEBHOOK_URL');

    const results = {
      slack: false,
      discord: false
    };

    // Send to Slack
    if (slackWebhook) {
      try {
        const slackPayload = {
          username: 'Nauti One Monitor',
          icon_emoji: severity === 'critical' ? ':rotating_light:' : severity === 'warning' ? ':warning:' : ':information_source:',
          attachments: [{
            color: severity === 'critical' ? '#dc3545' : severity === 'warning' ? '#ffc107' : '#17a2b8',
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: title,
                  emoji: true
                }
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: message
                }
              },
              {
                type: 'context',
                elements: [
                  {
                    type: 'mrkdwn',
                    text: `*Source:* ${source} | *Time:* ${new Date(timestamp).toLocaleString()}`
                  }
                ]
              }
            ]
          }]
        };

        const slackResponse = await fetch(slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackPayload)
        });

        results.slack = slackResponse.ok;
      } catch (error) {
        console.error('Slack notification failed:', error);
      }
    }

    // Send to Discord
    if (discordWebhook) {
      try {
        const discordPayload = {
          username: 'Nauti One Monitor',
          embeds: [{
            title: title,
            description: message,
            color: severity === 'critical' ? 0xdc3545 : severity === 'warning' ? 0xffc107 : 0x17a2b8,
            fields: [
              {
                name: 'Source',
                value: source,
                inline: true
              },
              {
                name: 'Severity',
                value: severity.toUpperCase(),
                inline: true
              }
            ],
            timestamp: timestamp,
            footer: {
              text: 'Nauti One Production Monitor'
            }
          }]
        };

        const discordResponse = await fetch(discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordPayload)
        });

        results.discord = discordResponse.ok;
      } catch (error) {
        console.error('Discord notification failed:', error);
      }
    }

    console.log(`Alert sent - Slack: ${results.slack}, Discord: ${results.discord}`);

    return new Response(
      JSON.stringify({ 
        success: results.slack || results.discord,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Alert notification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
