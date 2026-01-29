/**
 * Centralized Environment Configuration
 * All environment variables with production fallbacks
 * This eliminates runtime undefined errors from VITE_* variables
 * 
 * CRITICAL: No validation that throws errors - always provide fallbacks
 */

// Safe getter that never throws
function safeGetEnv(key: string): string | undefined {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] as string | undefined;
    }
  } catch {
    // Ignore errors
  }
  return undefined;
}

// ============================================================
// SUPABASE - Production Hardcoded Values (CRITICAL)
// ============================================================
export const SUPABASE_URL = 
  safeGetEnv('VITE_SUPABASE_URL') || 
  "https://vnbptmixvwropvanyhdb.supabase.co";

export const SUPABASE_ANON_KEY = 
  safeGetEnv('VITE_SUPABASE_ANON_KEY') ||
  safeGetEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE";

// Aliases for backward compatibility
export const SUPABASE_PUBLISHABLE_KEY = SUPABASE_ANON_KEY;
export const VITE_SUPABASE_URL = SUPABASE_URL;
export const VITE_SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
export const VITE_SUPABASE_PUBLISHABLE_KEY = SUPABASE_ANON_KEY;

// ============================================================
// EDGE FUNCTIONS URL
// ============================================================
export const EDGE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

// ============================================================
// MAPBOX - Optional
// ============================================================
export const MAPBOX_TOKEN = 
  safeGetEnv('VITE_MAPBOX_ACCESS_TOKEN') ||
  safeGetEnv('VITE_MAPBOX_TOKEN') ||
  "";

export const MAPBOX_ACCESS_TOKEN = MAPBOX_TOKEN;

// ============================================================
// OPENAI - Optional (uses Edge Functions for security)
// ============================================================
export const OPENAI_API_KEY = 
  safeGetEnv('VITE_OPENAI_API_KEY') || 
  "";

export const OPENAI_MODEL = 
  safeGetEnv('VITE_OPENAI_MODEL') || 
  "gpt-4o-mini";

// ============================================================
// SENTRY - Optional
// ============================================================
export const SENTRY_DSN = 
  safeGetEnv('VITE_SENTRY_DSN') || 
  "";

// ============================================================
// POSTHOG - Optional Analytics
// ============================================================
export const POSTHOG_KEY = 
  safeGetEnv('VITE_POSTHOG_KEY') || 
  "";

export const POSTHOG_HOST = 
  safeGetEnv('VITE_POSTHOG_HOST') || 
  "https://app.posthog.com";

// ============================================================
// MQTT - Optional IoT
// ============================================================
export const MQTT_URL = 
  safeGetEnv('VITE_MQTT_URL') || 
  "";

export const MQTT_USER = 
  safeGetEnv('VITE_MQTT_USER') || 
  "";

export const MQTT_PASS = 
  safeGetEnv('VITE_MQTT_PASS') || 
  "";

// ============================================================
// OAUTH - Optional Calendar Integration
// ============================================================
export const GOOGLE_CLIENT_ID = 
  safeGetEnv('VITE_GOOGLE_CLIENT_ID') || 
  "";

export const MICROSOFT_CLIENT_ID = 
  safeGetEnv('VITE_MICROSOFT_CLIENT_ID') || 
  "";

// ============================================================
// FIREBASE - Optional
// ============================================================
export const FIREBASE_API_KEY = 
  safeGetEnv('VITE_FIREBASE_API_KEY') || 
  "";

export const FIREBASE_AUTH_DOMAIN = 
  safeGetEnv('VITE_FIREBASE_AUTH_DOMAIN') || 
  "";

export const FIREBASE_PROJECT_ID = 
  safeGetEnv('VITE_FIREBASE_PROJECT_ID') || 
  "";

export const FIREBASE_STORAGE_BUCKET = 
  safeGetEnv('VITE_FIREBASE_STORAGE_BUCKET') || 
  "";

export const FIREBASE_MESSAGING_SENDER_ID = 
  safeGetEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || 
  "";

export const FIREBASE_APP_ID = 
  safeGetEnv('VITE_FIREBASE_APP_ID') || 
  "";

export const FIREBASE_VAPID_KEY = 
  safeGetEnv('VITE_FIREBASE_VAPID_KEY') || 
  "";

// ============================================================
// ELEVEN LABS - Voice AI
// ============================================================
export const ELEVEN_LABS_API_KEY = 
  safeGetEnv('VITE_ELEVEN_LABS_API_KEY') || 
  "";

// ============================================================
// FEATURE FLAGS
// ============================================================
export const ENABLE_AUTH_PROTECTION = 
  safeGetEnv('VITE_ENABLE_AUTH_PROTECTION') === "true";

export const ENABLE_LOGGING = 
  safeGetEnv('VITE_ENABLE_LOGGING') !== "false";

// ============================================================
// APP CONFIG
// ============================================================
export const APP_ENV = 
  safeGetEnv('MODE') || 
  "production";

export const IS_DEVELOPMENT = APP_ENV === "development";
export const IS_PRODUCTION = APP_ENV === "production";

export const APP_URL = 
  safeGetEnv('VITE_APP_URL') || 
  safeGetEnv('APP_URL') ||
  "https://nautione.com.br";

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get Supabase auth headers for Edge Function calls
 */
export function getSupabaseHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    ...additionalHeaders,
  };
}

/**
 * Build Edge Function URL
 */
export function getEdgeFunctionUrl(functionName: string): string {
  return `${EDGE_FUNCTIONS_URL}/${functionName}`;
}

/**
 * Check if a service is configured
 */
export function isServiceConfigured(serviceName: 'supabase' | 'mapbox' | 'openai' | 'sentry' | 'posthog' | 'mqtt' | 'firebase'): boolean {
  switch (serviceName) {
    case 'supabase':
      return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
    case 'mapbox':
      return Boolean(MAPBOX_TOKEN);
    case 'openai':
      return Boolean(OPENAI_API_KEY);
    case 'sentry':
      return Boolean(SENTRY_DSN);
    case 'posthog':
      return Boolean(POSTHOG_KEY);
    case 'mqtt':
      return Boolean(MQTT_URL);
    case 'firebase':
      return Boolean(FIREBASE_API_KEY);
    default:
      return false;
  }
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: 'starfix' | 'terrastar' | 'ai' | 'sentry' | 'posthog'): boolean {
  switch (feature) {
    case 'ai':
      return Boolean(OPENAI_API_KEY);
    case 'sentry':
      return Boolean(SENTRY_DSN);
    case 'posthog':
      return Boolean(POSTHOG_KEY);
    default:
      return false;
  }
}

// ============================================================
// LEGACY INTERFACE FOR BACKWARD COMPATIBILITY
// ============================================================

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string;
  openaiApiKey: string;
  openaiModel: string;
  starfixApiKey?: string;
  starfixApiUrl?: string;
  starfixOrgId?: string;
  terrastarApiKey?: string;
  terrastarApiUrl?: string;
  terrastarServiceLevel?: 'BASIC' | 'PREMIUM' | 'RTK';
  sessionSecret?: string;
  jwtSecret?: string;
  appUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
}

/**
 * Get validated config - NEVER throws, always returns valid config
 */
export function getConfig(): EnvConfig {
  return {
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: safeGetEnv('SUPABASE_SERVICE_ROLE_KEY'),
    openaiApiKey: OPENAI_API_KEY,
    openaiModel: OPENAI_MODEL,
    starfixApiKey: safeGetEnv('STARFIX_API_KEY'),
    starfixApiUrl: safeGetEnv('STARFIX_API_URL'),
    starfixOrgId: safeGetEnv('STARFIX_ORG_ID'),
    terrastarApiKey: safeGetEnv('TERRASTAR_API_KEY'),
    terrastarApiUrl: safeGetEnv('TERRASTAR_API_URL'),
    terrastarServiceLevel: (safeGetEnv('TERRASTAR_SERVICE_LEVEL') as 'BASIC' | 'PREMIUM' | 'RTK') || 'PREMIUM',
    sessionSecret: safeGetEnv('SESSION_SECRET'),
    jwtSecret: safeGetEnv('JWT_SECRET'),
    appUrl: APP_URL,
    nodeEnv: IS_DEVELOPMENT ? 'development' : 'production',
  };
}

/**
 * Legacy function - no longer validates, just returns config
 */
export function loadEnvConfig(): EnvConfig {
  return getConfig();
}

/**
 * Print configuration summary (safe - no secrets)
 */
export function printConfigSummary(): void {
  if (IS_DEVELOPMENT) {
    // eslint-disable-next-line no-console
    console.info('📋 ENV CONFIG:', {
      supabase: SUPABASE_URL,
      openaiModel: OPENAI_MODEL,
      mapbox: Boolean(MAPBOX_TOKEN),
      sentry: Boolean(SENTRY_DSN),
      posthog: Boolean(POSTHOG_KEY),
    });
  }
}

// ============================================================
// DEFAULT EXPORT
// ============================================================
export const envConfig = {
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    edgeFunctionsUrl: EDGE_FUNCTIONS_URL,
  },
  mapbox: {
    token: MAPBOX_TOKEN,
  },
  openai: {
    apiKey: OPENAI_API_KEY,
    model: OPENAI_MODEL,
  },
  sentry: {
    dsn: SENTRY_DSN,
  },
  posthog: {
    key: POSTHOG_KEY,
    host: POSTHOG_HOST,
  },
  mqtt: {
    url: MQTT_URL,
    user: MQTT_USER,
    pass: MQTT_PASS,
  },
  firebase: {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID,
    vapidKey: FIREBASE_VAPID_KEY,
  },
  features: {
    authProtection: ENABLE_AUTH_PROTECTION,
    logging: ENABLE_LOGGING,
  },
  app: {
    env: APP_ENV,
    url: APP_URL,
    isDev: IS_DEVELOPMENT,
    isProd: IS_PRODUCTION,
  },
  getHeaders: getSupabaseHeaders,
  getEdgeFunctionUrl,
  isConfigured: isServiceConfigured,
  isFeatureEnabled,
};

export default envConfig;
