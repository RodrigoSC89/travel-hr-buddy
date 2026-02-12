/**
 * Environment Configuration Validator
 * 
 * Valida todas as variáveis de ambiente necessárias
 * e fornece mensagens de erro claras
 * 
 * NOTE: OpenAI keys are managed server-side via edge functions.
 * No VITE_OPENAI_API_KEY needed in frontend.
 */
import { logger } from "@/lib/logger";

interface EnvConfig {
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string;
  
  // StarFix (opcional)
  starfixApiKey?: string;
  starfixApiUrl?: string;
  starfixOrgId?: string;
  
  // Terrastar (opcional)
  terrastarApiKey?: string;
  terrastarApiUrl?: string;
  terrastarServiceLevel?: 'BASIC' | 'PREMIUM' | 'RTK';
  
  // Security
  sessionSecret?: string;
  jwtSecret?: string;
  
  // App
  appUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
}

/**
 * Pega variável de ambiente com validação (Vite-compatible)
 */
function getEnvVar(key: string, required: boolean = true, defaultValue?: string): string {
  const env = import.meta.env as Record<string, string | undefined>;
  
  const value = 
    env[key] || 
    env[`VITE_${key}`] ||
    defaultValue;
  
  if (required && !value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  
  return value || '';
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Carrega e valida configuração
 */
export function loadEnvConfig(): EnvConfig {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Supabase
  const supabaseUrl = getEnvVar('SUPABASE_URL', false) || getEnvVar('VITE_SUPABASE_URL', false);
  if (!supabaseUrl) {
    errors.push('Missing SUPABASE_URL or VITE_SUPABASE_URL');
  } else if (!isValidUrl(supabaseUrl)) {
    errors.push('Invalid SUPABASE_URL format');
  }
  
  const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY', false) || getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY', false);
  if (!supabaseAnonKey) {
    errors.push('Missing SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY');
  }
  
  // App URL
  const appUrl = getEnvVar('APP_URL', false) || 'http://localhost:3000';
  
  // Node ENV
  const nodeEnv = (getEnvVar('NODE_ENV', false, 'development') as 'development' | 'production' | 'test');
  
  // === OPTIONAL VARS ===
  const supabaseServiceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', false);
  if (nodeEnv === 'production' && !supabaseServiceRoleKey) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY not set (recommended for production)');
  }
  
  const starfixApiKey = getEnvVar('STARFIX_API_KEY', false);
  const starfixApiUrl = getEnvVar('STARFIX_API_URL', false);
  const starfixOrgId = getEnvVar('STARFIX_ORG_ID', false);
  
  if (starfixApiKey && (!starfixApiUrl || !starfixOrgId)) {
    warnings.push('STARFIX_API_KEY set but missing STARFIX_API_URL or STARFIX_ORG_ID');
  }
  
  const terrastarApiKey = getEnvVar('TERRASTAR_API_KEY', false);
  const terrastarApiUrl = getEnvVar('TERRASTAR_API_URL', false);
  const terrastarServiceLevel = getEnvVar('TERRASTAR_SERVICE_LEVEL', false, 'PREMIUM') as 'BASIC' | 'PREMIUM' | 'RTK';
  
  if (terrastarApiKey && !terrastarApiUrl) {
    warnings.push('TERRASTAR_API_KEY set but missing TERRASTAR_API_URL');
  }
  
  const sessionSecret = getEnvVar('SESSION_SECRET', false);
  const jwtSecret = getEnvVar('JWT_SECRET', false);
  
  if (nodeEnv === 'production') {
    if (!sessionSecret || sessionSecret.length < 32) {
      warnings.push('SESSION_SECRET should be at least 32 characters in production');
    }
    if (!jwtSecret || jwtSecret.length < 32) {
      warnings.push('JWT_SECRET should be at least 32 characters in production');
    }
  }
  
  if (errors.length > 0) {
    logger.error('CONFIGURATION ERRORS:', undefined, { errors });
    throw new Error('Invalid environment configuration. Please check .env file.');
  }
  
  if (warnings.length > 0) {
    logger.warn('CONFIGURATION WARNINGS:', { warnings });
  }
  
  logger.info('Environment configuration validated successfully');

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    starfixApiKey,
    starfixApiUrl,
    starfixOrgId,
    terrastarApiKey,
    terrastarApiUrl,
    terrastarServiceLevel,
    sessionSecret,
    jwtSecret,
    appUrl,
    nodeEnv,
  };
}

let configInstance: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!configInstance) {
    configInstance = loadEnvConfig();
  }
  return configInstance;
}

/**
 * Check if feature is enabled
 * AI is always enabled via edge functions (server-side keys)
 */
export function isFeatureEnabled(feature: 'starfix' | 'terrastar' | 'ai'): boolean {
  if (feature === 'ai') return true; // AI uses server-side keys via edge functions
  
  const config = getConfig();
  switch (feature) {
    case 'starfix':
      return !!(config.starfixApiKey && config.starfixApiUrl && config.starfixOrgId);
    case 'terrastar':
      return !!(config.terrastarApiKey && config.terrastarApiUrl);
    default:
      return false;
  }
}

export function printConfigSummary(): void {
  const config = getConfig();
  
  logger.debug('\n📋 CONFIGURATION SUMMARY:\n');
  logger.debug(`  Environment: ${config.nodeEnv}`);
  logger.debug(`  App URL: ${config.appUrl}`);
  logger.debug(`  Supabase: ${config.supabaseUrl}`);
  logger.debug(`  AI Features: ✅ Enabled (server-side via edge functions)`);
  logger.debug(`  StarFix Integration: ${isFeatureEnabled('starfix') ? '✅ Enabled' : '❌ Disabled'}`);
  logger.debug(`  Terrastar Integration: ${isFeatureEnabled('terrastar') ? '✅ Enabled' : '❌ Disabled'}`);
  logger.debug('');
}
