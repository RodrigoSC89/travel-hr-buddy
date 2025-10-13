/**
 * Environment Configuration
 *
 * Centralized environment variable management with type safety and validation.
 * All environment variables should be accessed through this file.
 */

interface EnvConfig {
  // App
  nodeEnv: string;
  appUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;

  // Supabase
  supabase: {
    url: string;
    publishableKey: string;
    projectId?: string;
  };

  // Sentry
  sentry?: {
    dsn: string;
    org?: string;
    project?: string;
  };

  // OpenAI
  openai?: {
    apiKey: string;
  };

  // Mapbox
  mapbox?: {
    accessToken: string;
    publicToken?: string;
  };

  // Weather
  weather?: {
    openWeatherApiKey: string;
  };

  // Travel APIs
  travel?: {
    amadeusApiKey?: string;
    amadeusApiSecret?: string;
    skyscannerApiKey?: string;
  };

  // Maritime
  maritime?: {
    marineTrafficApiKey?: string;
    vesselFinderApiKey?: string;
  };

  // Email
  email?: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    from?: string;
    to?: string;
  };

  // Feature Flags
  features: {
    voice: boolean;
    aiChat: boolean;
    travelApi: boolean;
  };
}

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, fallback = ""): string {
  return import.meta.env[key] || fallback;
}

/**
 * Get boolean environment variable
 */
function getBoolEnv(key: string, fallback = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === true;
}

/**
 * Get number environment variable
 */
function getNumberEnv(key: string, fallback = 0): number {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  const num = parseInt(value, 10);
  return isNaN(num) ? fallback : num;
}

/**
 * Environment configuration object
 */
export const env: EnvConfig = {
  // App
  nodeEnv: getEnv("VITE_NODE_ENV", import.meta.env.MODE),
  appUrl: getEnv("VITE_APP_URL", "http://localhost:8080"),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Supabase (required)
  supabase: {
    url: getEnv("VITE_SUPABASE_URL"),
    publishableKey: getEnv("VITE_SUPABASE_PUBLISHABLE_KEY"),
    projectId: getEnv("VITE_SUPABASE_PROJECT_ID"),
  },

  // Sentry (optional)
  sentry: getEnv("VITE_SENTRY_DSN")
    ? {
        dsn: getEnv("VITE_SENTRY_DSN"),
        org: getEnv("SENTRY_ORG"),
        project: getEnv("SENTRY_PROJECT"),
      }
    : undefined,

  // OpenAI (optional)
  openai: getEnv("VITE_OPENAI_API_KEY")
    ? {
        apiKey: getEnv("VITE_OPENAI_API_KEY"),
      }
    : undefined,

  // Mapbox (optional)
  mapbox: getEnv("VITE_MAPBOX_ACCESS_TOKEN")
    ? {
        accessToken: getEnv("VITE_MAPBOX_ACCESS_TOKEN"),
        publicToken: getEnv("MAPBOX_PUBLIC_TOKEN"),
      }
    : undefined,

  // Weather (optional)
  weather:
    getEnv("VITE_OPENWEATHER_API_KEY") || getEnv("OPENWEATHER_API_KEY")
      ? {
          openWeatherApiKey: getEnv("VITE_OPENWEATHER_API_KEY", getEnv("OPENWEATHER_API_KEY")),
        }
      : undefined,

  // Travel APIs (optional)
  travel:
    getEnv("VITE_AMADEUS_API_KEY") || getEnv("VITE_SKYSCANNER_API_KEY")
      ? {
          amadeusApiKey: getEnv("VITE_AMADEUS_API_KEY"),
          amadeusApiSecret: getEnv("VITE_AMADEUS_API_SECRET"),
          skyscannerApiKey: getEnv("VITE_SKYSCANNER_API_KEY"),
        }
      : undefined,

  // Maritime (optional)
  maritime:
    getEnv("MARINE_TRAFFIC_API_KEY") || getEnv("VESSEL_FINDER_API_KEY")
      ? {
          marineTrafficApiKey: getEnv("MARINE_TRAFFIC_API_KEY"),
          vesselFinderApiKey: getEnv("VESSEL_FINDER_API_KEY"),
        }
      : undefined,

  // Email (optional)
  email: getEnv("EMAIL_HOST")
    ? {
        host: getEnv("EMAIL_HOST"),
        port: getNumberEnv("EMAIL_PORT", 587),
        user: getEnv("EMAIL_USER"),
        pass: getEnv("EMAIL_PASS"),
        from: getEnv("EMAIL_FROM"),
        to: getEnv("EMAIL_TO"),
      }
    : undefined,

  // Feature Flags
  features: {
    voice: getBoolEnv("VITE_ENABLE_VOICE", true),
    aiChat: getBoolEnv("VITE_ENABLE_AI_CHAT", true),
    travelApi: getBoolEnv("VITE_ENABLE_TRAVEL_API", true),
  },
};

/**
 * Validate required environment variables
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required variables
  if (!env.supabase.url) {
    errors.push("VITE_SUPABASE_URL is required");
  }
  if (!env.supabase.publishableKey) {
    errors.push("VITE_SUPABASE_PUBLISHABLE_KEY is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof EnvConfig["features"]): boolean {
  return env.features[feature] ?? false;
}

/**
 * Get API key status for health checks
 */
export function getApiKeyStatus(): Record<string, boolean> {
  return {
    supabase: !!env.supabase.url && !!env.supabase.publishableKey,
    sentry: !!env.sentry?.dsn,
    openai: !!env.openai?.apiKey,
    mapbox: !!env.mapbox?.accessToken,
    weather: !!env.weather?.openWeatherApiKey,
    amadeus: !!env.travel?.amadeusApiKey,
    skyscanner: !!env.travel?.skyscannerApiKey,
    marineTraffic: !!env.maritime?.marineTrafficApiKey,
    vesselFinder: !!env.maritime?.vesselFinderApiKey,
  };
}

// Log validation results in development
if (env.isDevelopment) {
  const validation = validateEnv();
  if (!validation.valid) {
    console.warn("⚠️ Environment validation errors:", validation.errors);
  }
}
