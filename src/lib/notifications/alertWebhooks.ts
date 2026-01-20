import { supabase } from '@/integrations/supabase/client';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertPayload {
  title: string;
  message: string;
  severity: AlertSeverity;
  source: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send alert to configured webhooks (Slack, Discord)
 */
export const sendAlert = async (payload: AlertPayload): Promise<boolean> => {
  const timestamp = payload.timestamp || new Date().toISOString();
  
  try {
    // Call edge function to send notifications
    const { error } = await supabase.functions.invoke('send-alert-notification', {
      body: {
        ...payload,
        timestamp
      }
    });

    if (error) {
      console.error('Failed to send alert:', error);
      return false;
    }

    // Log alert - using console for now as access_logs schema may vary
    console.log('[Alert Logged]', {
      action: 'ALERT_SENT',
      source: payload.source,
      severity: payload.severity,
      title: payload.title,
      timestamp
    });

    return true;
  } catch (error) {
    console.error('Alert sending error:', error);
    return false;
  }
};

/**
 * Send critical system alert
 */
export const sendCriticalAlert = async (
  title: string, 
  message: string, 
  source: string
): Promise<boolean> => {
  return sendAlert({
    title: `🚨 CRITICAL: ${title}`,
    message,
    severity: 'critical',
    source
  });
};

/**
 * Send warning alert
 */
export const sendWarningAlert = async (
  title: string, 
  message: string, 
  source: string
): Promise<boolean> => {
  return sendAlert({
    title: `⚠️ WARNING: ${title}`,
    message,
    severity: 'warning',
    source
  });
};

/**
 * Send info notification
 */
export const sendInfoAlert = async (
  title: string, 
  message: string, 
  source: string
): Promise<boolean> => {
  return sendAlert({
    title: `ℹ️ ${title}`,
    message,
    severity: 'info',
    source
  });
};

/**
 * Health check failure alert
 */
export const sendHealthCheckFailure = async (
  service: string,
  details: string
): Promise<boolean> => {
  return sendCriticalAlert(
    `Service Degradation: ${service}`,
    details,
    'health-monitor'
  );
};

/**
 * Deployment notification
 */
export const sendDeploymentNotification = async (
  version: string,
  environment: string,
  status: 'started' | 'completed' | 'failed'
): Promise<boolean> => {
  const emoji = status === 'completed' ? '✅' : status === 'failed' ? '❌' : '🚀';
  const severity: AlertSeverity = status === 'failed' ? 'critical' : 'info';
  
  return sendAlert({
    title: `${emoji} Deployment ${status.toUpperCase()}`,
    message: `Version ${version} deployment to ${environment} ${status}`,
    severity,
    source: 'deployment',
    metadata: { version, environment, status }
  });
};
