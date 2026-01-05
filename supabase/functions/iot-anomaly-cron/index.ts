/**
 * IoT Anomaly Cron - Automatic anomaly detection and notifications
 * Runs every 5 minutes to check for critical sensor anomalies
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SensorReading {
  id: string;
  equipment_id: string;
  equipment_name: string;
  sensor_type: string;
  value: number;
  unit: string;
  min_threshold: number | null;
  max_threshold: number | null;
  is_anomaly: boolean;
  created_at: string;
}

interface NotificationPayload {
  channel: string;
  type: 'slack' | 'discord' | 'email' | 'push';
  message: string;
  severity: 'warning' | 'critical';
  data: Record<string, unknown>;
}

async function sendSlackNotification(webhookUrl: string, payload: NotificationPayload) {
  const emoji = payload.severity === 'critical' ? '🚨' : '⚠️';
  const color = payload.severity === 'critical' ? '#dc2626' : '#f59e0b';
  
  const slackPayload = {
    attachments: [{
      color,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} IoT Anomaly Alert - ${payload.severity.toUpperCase()}`,
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: payload.message
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `*Nautilus One* | ${new Date().toISOString()}`
            }
          ]
        }
      ]
    }]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });
    return response.ok;
  } catch (error) {
    console.error('Slack notification failed:', error);
    return false;
  }
}

async function sendDiscordNotification(webhookUrl: string, payload: NotificationPayload) {
  const emoji = payload.severity === 'critical' ? '🚨' : '⚠️';
  const color = payload.severity === 'critical' ? 0xdc2626 : 0xf59e0b;
  
  const discordPayload = {
    embeds: [{
      title: `${emoji} IoT Anomaly Alert`,
      description: payload.message,
      color,
      footer: {
        text: 'Nautilus One Maritime System'
      },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });
    return response.ok;
  } catch (error) {
    console.error('Discord notification failed:', error);
    return false;
  }
}

async function sendEmailNotification(anomalies: SensorReading[]) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const notificationEmail = Deno.env.get('NOTIFICATION_EMAIL');
  
  if (!resendApiKey || !notificationEmail) {
    console.log('Email notification not configured');
    return false;
  }

  const criticalCount = anomalies.filter(a => {
    if (!a.max_threshold || !a.min_threshold) return false;
    const midpoint = (a.min_threshold + a.max_threshold) / 2;
    const range = (a.max_threshold - a.min_threshold) / 2;
    return Math.abs(a.value - midpoint) / range > 0.75;
  }).length;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${criticalCount > 0 ? '#dc2626' : '#f59e0b'};">
        ${criticalCount > 0 ? '🚨' : '⚠️'} IoT Anomaly Alert
      </h2>
      <p>Detected <strong>${anomalies.length}</strong> anomalies (${criticalCount} critical) in the last 5 minutes.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Equipment</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Sensor</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Value</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Threshold</th>
          </tr>
        </thead>
        <tbody>
          ${anomalies.slice(0, 10).map(a => `
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${a.equipment_name}</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${a.sensor_type}</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; color: #dc2626;">${a.value} ${a.unit}</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${a.min_threshold} - ${a.max_threshold}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">
        This is an automated alert from Nautilus One Maritime System
      </p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nautilus One <alerts@nautilus.one>',
        to: [notificationEmail],
        subject: `${criticalCount > 0 ? '🚨 CRITICAL' : '⚠️ Warning'}: ${anomalies.length} IoT Anomalies Detected`,
        html: emailHtml,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Email notification failed:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for anomalies in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: anomalies, error } = await supabase
      .from('equipment_sensors')
      .select('*')
      .eq('is_anomaly', true)
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (!anomalies || anomalies.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No anomalies detected in the last 5 minutes',
          anomaliesCount: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate severity
    const criticalAnomalies = anomalies.filter((a: SensorReading) => {
      if (!a.max_threshold || !a.min_threshold) return false;
      const midpoint = (a.min_threshold + a.max_threshold) / 2;
      const range = (a.max_threshold - a.min_threshold) / 2;
      return Math.abs(a.value - midpoint) / range > 0.75;
    });

    const severity = criticalAnomalies.length > 0 ? 'critical' : 'warning';
    
    // Build notification message
    const message = anomalies.slice(0, 5).map((a: SensorReading) => 
      `• *${a.equipment_name}* (${a.sensor_type}): ${a.value} ${a.unit}`
    ).join('\n');

    const payload: NotificationPayload = {
      channel: 'iot-alerts',
      type: 'slack',
      message: `*${anomalies.length} anomalies detected* (${criticalAnomalies.length} critical)\n\n${message}`,
      severity,
      data: {
        totalAnomalies: anomalies.length,
        criticalCount: criticalAnomalies.length,
        timestamp: new Date().toISOString(),
      }
    };

    const notifications: string[] = [];

    // Send Slack notification
    const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL');
    if (slackWebhook) {
      const slackResult = await sendSlackNotification(slackWebhook, payload);
      if (slackResult) notifications.push('slack');
    }

    // Send Discord notification
    const discordWebhook = Deno.env.get('DISCORD_WEBHOOK_URL');
    if (discordWebhook) {
      const discordResult = await sendDiscordNotification(discordWebhook, payload);
      if (discordResult) notifications.push('discord');
    }

    // Send email notification for critical anomalies
    if (criticalAnomalies.length > 0) {
      const emailResult = await sendEmailNotification(anomalies as SensorReading[]);
      if (emailResult) notifications.push('email');
    }

    // Log to ai_self_healing_logs for tracking
    await supabase.from('ai_self_healing_logs').insert({
      event_type: 'iot_anomaly_notification',
      issue_description: `${anomalies.length} sensor anomalies detected (${criticalAnomalies.length} critical)`,
      severity: severity,
      module_affected: 'iot_monitoring',
      action_taken: `Notifications sent: ${notifications.join(', ') || 'none configured'}`,
      action_result: 'success',
      metadata: {
        anomalies_count: anomalies.length,
        critical_count: criticalAnomalies.length,
        notifications_sent: notifications,
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${anomalies.length} anomalies`,
        anomaliesCount: anomalies.length,
        criticalCount: criticalAnomalies.length,
        notificationsSent: notifications,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error in IoT anomaly cron:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
