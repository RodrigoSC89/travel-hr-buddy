/**
 * Alert Notification Client
 * Helper library to send SMS and Email alerts via Supabase Edge Functions
 * Patch 144.0
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type AlertPriority = "low" | "medium" | "high" | "critical";

export interface SMSAlertOptions {
  to: string;
  message: string;
  priority?: AlertPriority;
}

export interface EmailAlertOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  priority?: AlertPriority;
  cc?: string[];
  bcc?: string[];
}

export interface AlertResponse {
  success: boolean;
  simulated?: boolean;
  message?: string;
  messageId?: string;
  error?: string;
  details?: any;
}

/**
 * Sends an SMS alert via Twilio
 */
export async function sendSMSAlert(options: SMSAlertOptions): Promise<AlertResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("send-alert-sms", {
      body: options,
    });

    if (error) {
      throw error;
    }

    return data as AlertResponse;
  } catch (error) {
    logger.error("Error sending SMS alert", error as Error, { 
      to: options.to,
      priority: options.priority 
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sends an email alert via SendGrid
 */
export async function sendEmailAlert(options: EmailAlertOptions): Promise<AlertResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("send-alert-email", {
      body: options,
    });

    if (error) {
      throw error;
    }

    return data as AlertResponse;
  } catch (error) {
    logger.error("Error sending email alert", error as Error, { 
      to: options.to,
      subject: options.subject,
      priority: options.priority 
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sends both SMS and Email alerts for critical notifications
 */
export async function sendCriticalAlert(
  smsOptions: SMSAlertOptions,
  emailOptions: EmailAlertOptions
): Promise<{ sms: AlertResponse; email: AlertResponse }> {
  const [smsResult, emailResult] = await Promise.all([
    sendSMSAlert({ ...smsOptions, priority: "critical" }),
    sendEmailAlert({ ...emailOptions, priority: "critical" }),
  ]);

  return {
    sms: smsResult,
    email: emailResult,
  };
}

/**
 * Pre-configured alert templates for common scenarios
 */
export const AlertTemplates = {
  engineFailure: (vesselName: string) => ({
    subject: `Motor Principal em Falha - ${vesselName}`,
    message: `🚨 ALERTA CRÍTICO: Motor principal do ${vesselName} reportou falha. Ação imediata necessária.`,
    html: `
      <h2 style="color: #dc2626;">🚨 Alerta Crítico de Embarcação</h2>
      <p><strong>Embarcação:</strong> ${vesselName}</p>
      <p><strong>Tipo de Alerta:</strong> Falha no Motor Principal</p>
      <p><strong>Ação Requerida:</strong> Imediata</p>
      <p>Por favor, contate a embarcação imediatamente e inicie o protocolo de emergência.</p>
    `,
  }),

  connectivityLoss: (systemName: string, duration: number) => ({
    subject: `Perda de Conectividade - ${systemName}`,
    message: `⚠️ ALERTA: ${systemName} perdeu conectividade há ${duration} minutos.`,
    html: `
      <h2 style="color: #f59e0b;">⚠️ Alerta de Conectividade</h2>
      <p><strong>Sistema:</strong> ${systemName}</p>
      <p><strong>Duração:</strong> ${duration} minutos</p>
      <p>O sistema perdeu conectividade. Tentando reconexão automática via sistemas de backup.</p>
    `,
  }),

  weatherWarning: (location: string, severity: string) => ({
    subject: `Aviso Meteorológico - ${location}`,
    message: `🌪️ AVISO: Condições meteorológicas severas detectadas em ${location}. Severidade: ${severity}`,
    html: `
      <h2 style="color: #dc2626;">🌪️ Aviso Meteorológico</h2>
      <p><strong>Localização:</strong> ${location}</p>
      <p><strong>Severidade:</strong> ${severity}</p>
      <p>Condições meteorológicas adversas detectadas. Recomenda-se alterar rota ou buscar abrigo.</p>
    `,
  }),

  vesselCollisionRisk: (vesselName: string, distance: number) => ({
    subject: `Risco de Colisão - ${vesselName}`,
    message: `⚠️ RISCO DE COLISÃO: Embarcação detectada a ${distance}m do ${vesselName}. Ação evasiva recomendada.`,
    html: `
      <h2 style="color: #dc2626;">⚠️ Alerta de Risco de Colisão</h2>
      <p><strong>Embarcação:</strong> ${vesselName}</p>
      <p><strong>Distância:</strong> ${distance} metros</p>
      <p><strong>Ação Recomendada:</strong> Manobra evasiva imediata</p>
      <p>Sistema AIS detectou embarcação em rota de colisão. Contatar ponte imediatamente.</p>
    `,
  }),
};

// Export a hook for React components
export function useAlertNotifications() {
  const sendSMS = async (options: SMSAlertOptions) => {
    return await sendSMSAlert(options);
  };

  const sendEmail = async (options: EmailAlertOptions) => {
    return await sendEmailAlert(options);
  };

  const sendCritical = async (
    smsOptions: SMSAlertOptions,
    emailOptions: EmailAlertOptions
  ) => {
    return await sendCriticalAlert(smsOptions, emailOptions);
  };

  return {
    sendSMS,
    sendEmail,
    sendCritical,
    templates: AlertTemplates,
  };
}
