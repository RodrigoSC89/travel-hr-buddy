/**
 * Twilio Integration Service
 * Handles SMS, WhatsApp, and Voice communications
 */
import { supabase } from "@/integrations/supabase/client";

export interface SMSOptions {
  to: string;
  message: string;
  from?: string;
}

export interface WhatsAppOptions {
  to: string;
  message: string;
  mediaUrl?: string;
}

export interface VoiceCallOptions {
  to: string;
  message: string;
  voice?: "alice" | "man" | "woman";
  language?: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class TwilioIntegration {
  /**
   * Send SMS message
   */
  static async sendSMS(options: SMSOptions): Promise<SMSResult> {
    try {
      const { data, error } = await supabase.functions.invoke("twilio-send-sms", {
        body: {
          to: options.to,
          body: options.message,
          from: options.from,
        },
      });

      if (error) throw new Error(error.message);

      return {
        success: true,
        messageId: data?.messageSid,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to send SMS",
      };
    }
  }

  /**
   * Send WhatsApp message
   */
  static async sendWhatsApp(options: WhatsAppOptions): Promise<SMSResult> {
    try {
      const { data, error } = await supabase.functions.invoke("twilio-send-whatsapp", {
        body: {
          to: options.to,
          body: options.message,
          mediaUrl: options.mediaUrl,
        },
      });

      if (error) throw new Error(error.message);

      return {
        success: true,
        messageId: data?.messageSid,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to send WhatsApp message",
      };
    }
  }

  /**
   * Send alert via SMS (convenience method for system alerts)
   */
  static async sendAlert(
    phoneNumber: string, 
    alertTitle: string, 
    alertMessage: string,
    priority: "low" | "normal" | "high" | "urgent" = "normal"
  ): Promise<SMSResult> {
    const priorityEmoji = {
      low: "ℹ️",
      normal: "📢",
      high: "⚠️",
      urgent: "🚨",
    };

    const message = `${priorityEmoji[priority]} ${alertTitle}\n\n${alertMessage}\n\n- Nauti One`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send certificate expiry alert
   */
  static async sendCertificateExpiryAlert(
    phoneNumber: string,
    crewName: string,
    certificateType: string,
    daysRemaining: number
  ): Promise<SMSResult> {
    const urgency = daysRemaining <= 7 ? "urgent" : daysRemaining <= 15 ? "high" : "normal";
    
    return this.sendAlert(
      phoneNumber,
      "Certificado Expirando",
      `O certificado ${certificateType} de ${crewName} expira em ${daysRemaining} dias. Por favor, providencie a renovação.`,
      urgency
    );
  }

  /**
   * Send maintenance reminder
   */
  static async sendMaintenanceReminder(
    phoneNumber: string,
    equipmentName: string,
    dueDate: string
  ): Promise<SMSResult> {
    return this.sendAlert(
      phoneNumber,
      "Manutenção Programada",
      `Manutenção do ${equipmentName} programada para ${dueDate}. Verifique os detalhes no sistema.`,
      "normal"
    );
  }

  /**
   * Send weather alert
   */
  static async sendWeatherAlert(
    phoneNumber: string,
    alertType: string,
    location: string,
    details: string
  ): Promise<SMSResult> {
    return this.sendAlert(
      phoneNumber,
      `Alerta Meteorológico: ${alertType}`,
      `Região: ${location}\n${details}`,
      "high"
    );
  }
}

// Convenience exports
export const sendTwilioSMS = TwilioIntegration.sendSMS.bind(TwilioIntegration);
export const sendTwilioWhatsApp = TwilioIntegration.sendWhatsApp.bind(TwilioIntegration);
export const sendTwilioAlert = TwilioIntegration.sendAlert.bind(TwilioIntegration);
