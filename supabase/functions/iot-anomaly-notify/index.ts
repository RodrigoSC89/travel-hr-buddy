/**
 * IoT Anomaly Notification Edge Function
 * Sends notifications when critical anomalies are detected in equipment sensors
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnomalyPayload {
  sensor_id: string;
  equipment_id: string;
  equipment_name: string;
  sensor_type: string;
  value: number;
  unit: string;
  min_threshold: number;
  max_threshold: number;
  severity: 'warning' | 'critical';
  vessel_id?: string;
}

async function sendSlackNotification(webhookUrl: string, anomaly: AnomalyPayload) {
  const severityEmoji = anomaly.severity === 'critical' ? '🚨' : '⚠️';
  const severityColor = anomaly.severity === 'critical' ? '#dc2626' : '#f59e0b';
  
  const payload = {
    attachments: [
      {
        color: severityColor,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${severityEmoji} IoT Sensor Anomaly Detected`,
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Equipment:*\n${anomaly.equipment_name}`
              },
              {
                type: 'mrkdwn',
                text: `*Sensor Type:*\n${anomaly.sensor_type}`
              },
              {
                type: 'mrkdwn',
                text: `*Current Value:*\n${anomaly.value} ${anomaly.unit}`
              },
              {
                type: 'mrkdwn',
                text: `*Threshold:*\n${anomaly.min_threshold} - ${anomaly.max_threshold} ${anomaly.unit}`
              }
            ]
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Severity: *${anomaly.severity.toUpperCase()}* | Vessel: ${anomaly.vessel_id || 'Unknown'} | ${new Date().toISOString()}`
              }
            ]
          }
        ]
      }
    ]
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return response.ok;
}

async function sendDiscordNotification(webhookUrl: string, anomaly: AnomalyPayload) {
  const severityEmoji = anomaly.severity === 'critical' ? '🚨' : '⚠️';
  const severityColor = anomaly.severity === 'critical' ? 0xdc2626 : 0xf59e0b;

  const payload = {
    embeds: [
      {
        title: `${severityEmoji} IoT Sensor Anomaly Detected`,
        color: severityColor,
        fields: [
          { name: 'Equipment', value: anomaly.equipment_name, inline: true },
          { name: 'Sensor Type', value: anomaly.sensor_type, inline: true },
          { name: 'Severity', value: anomaly.severity.toUpperCase(), inline: true },
          { name: 'Current Value', value: `${anomaly.value} ${anomaly.unit}`, inline: true },
          { name: 'Threshold', value: `${anomaly.min_threshold} - ${anomaly.max_threshold} ${anomaly.unit}`, inline: true },
          { name: 'Vessel', value: anomaly.vessel_id || 'Unknown', inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Nautilus IoT Monitoring' }
      }
    ]
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return response.ok;
}

async function sendEmailNotification(
  resendApiKey: string, 
  anomaly: AnomalyPayload,
  recipients: string[]
) {
  const severityEmoji = anomaly.severity === 'critical' ? '🚨' : '⚠️';
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${anomaly.severity === 'critical' ? '#dc2626' : '#f59e0b'}">
        ${severityEmoji} IoT Sensor Anomaly Detected
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Equipment</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${anomaly.equipment_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Sensor Type</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${anomaly.sensor_type}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Current Value</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: ${anomaly.severity === 'critical' ? '#dc2626' : '#f59e0b'}; font-weight: bold;">
            ${anomaly.value} ${anomaly.unit}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Normal Range</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${anomaly.min_threshold} - ${anomaly.max_threshold} ${anomaly.unit}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Severity</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; font-weight: bold; color: ${anomaly.severity === 'critical' ? '#dc2626' : '#f59e0b'};">
            ${anomaly.severity}
          </td>
        </tr>
      </table>
      <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
        Detected at ${new Date().toISOString()} | Nautilus IoT Monitoring System
      </p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Nautilus IoT <alerts@nautilus.dev>',
      to: recipients,
      subject: `${severityEmoji} [${anomaly.severity.toUpperCase()}] IoT Anomaly: ${anomaly.equipment_name} - ${anomaly.sensor_type}`,
      html
    })
  });

  return response.ok;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL');
    const discordWebhook = Deno.env.get('DISCORD_WEBHOOK_URL');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();

    // Handle direct anomaly notification
    if (body.anomaly) {
      const anomaly = body.anomaly as AnomalyPayload;
      const notifications: Promise<boolean>[] = [];
      const channels: string[] = [];

      if (slackWebhook) {
        notifications.push(sendSlackNotification(slackWebhook, anomaly));
        channels.push('slack');
      }

      if (discordWebhook) {
        notifications.push(sendDiscordNotification(discordWebhook, anomaly));
        channels.push('discord');
      }

      if (resendApiKey && body.email_recipients?.length > 0) {
        notifications.push(sendEmailNotification(resendApiKey, anomaly, body.email_recipients));
        channels.push('email');
      }

      if (notifications.length === 0) {
        console.warn('[IoT Notify] No notification channels configured');
        return new Response(JSON.stringify({
          success: false,
          error: 'No notification channels configured'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const results = await Promise.allSettled(notifications);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

      // Log notification to database
      await supabase.from('audit_logs').insert({
        action: 'iot_anomaly_notification',
        resource_type: 'equipment_sensors',
        resource_id: anomaly.sensor_id,
        metadata: {
          anomaly,
          channels,
          successCount,
          totalChannels: channels.length
        }
      }).catch((insertErr: Error) => console.warn('Failed to log notification:', insertErr));

      console.log(`[IoT Notify] Sent ${successCount}/${channels.length} notifications for ${anomaly.equipment_name}`);

      return new Response(JSON.stringify({
        success: true,
        channels,
        successCount,
        anomaly
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle batch check for recent anomalies
    if (body.check_recent) {
      const minutesBack = body.minutes_back || 5;
      const since = new Date(Date.now() - minutesBack * 60 * 1000).toISOString();

      const { data: anomalies, error: fetchError } = await supabase
        .from('equipment_sensors')
        .select('*')
        .eq('is_anomaly', true)
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      console.log(`[IoT Notify] Found ${anomalies?.length || 0} anomalies in last ${minutesBack} minutes`);

      // Send notifications for critical anomalies (values significantly out of range)
      const criticalAnomalies = (anomalies || []).filter((a: any) => {
        const deviation = Math.abs(a.value - (a.min_threshold + a.max_threshold) / 2);
        const range = a.max_threshold - a.min_threshold;
        return deviation > range * 0.75; // More than 75% deviation from center
      });

      if (criticalAnomalies.length > 0 && (slackWebhook || discordWebhook)) {
        for (const anomaly of criticalAnomalies.slice(0, 5)) { // Limit to 5 notifications
          const payload: AnomalyPayload = {
            sensor_id: anomaly.id,
            equipment_id: anomaly.equipment_id,
            equipment_name: anomaly.equipment_name,
            sensor_type: anomaly.sensor_type,
            value: anomaly.value,
            unit: anomaly.unit,
            min_threshold: anomaly.min_threshold,
            max_threshold: anomaly.max_threshold,
            severity: 'critical',
            vessel_id: anomaly.vessel_id
          };

          if (slackWebhook) await sendSlackNotification(slackWebhook, payload);
          if (discordWebhook) await sendDiscordNotification(discordWebhook, payload);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        anomalies_found: anomalies?.length || 0,
        critical_count: criticalAnomalies.length,
        notifications_sent: Math.min(criticalAnomalies.length, 5)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid request. Provide "anomaly" object or "check_recent: true"'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[IoT Notify] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
