/**
 * External Integrations - Central Export
 * All external service integrations in one place
 */

// Stripe - Payments & Subscriptions
export {
  StripeIntegration,
  createStripeCheckout,
  openStripePortal,
  checkStripeSubscription,
  type StripeCheckoutOptions,
  type StripeCustomerPortalOptions,
  type SubscriptionStatus,
} from "./stripe-integration";

// Twilio - SMS, WhatsApp, Voice
export {
  TwilioIntegration,
  sendTwilioSMS,
  sendTwilioWhatsApp,
  sendTwilioAlert,
  type SMSOptions,
  type WhatsAppOptions,
  type VoiceCallOptions,
  type SMSResult,
} from "./twilio-integration";

// Email - Resend/SendGrid
export {
  EmailIntegration,
  sendEmail,
  sendCertificateExpiryEmail,
  sendMaintenanceReminderEmail,
  sendWeatherAlertEmail,
  type EmailOptions,
  type EmailAttachment,
  type EmailResult,
  type EmailTemplateData,
} from "./email-integration";

// Weather APIs
export {
  WeatherIntegration,
  getMaritimeWeather,
  getWeatherForecast,
  getWeatherAlerts,
  type WeatherData,
  type WeatherForecast,
  type WeatherAlert,
} from "./weather-integration";

// Combined notification helper
export { sendMultiChannelNotification } from "./notification-dispatcher";
