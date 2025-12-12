/**
 * Environment Configuration Validator
 * 
 * Valida todas as variáveis de ambiente necessárias
 * e fornece mensagens de erro claras
 */

// @ts-ignore - process is available in Node.js runtime
declare const process: any;

interface EnvConfig {
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string;
  
  // OpenAI
  openaiApiKey: string;
  openaiModel: string;
  
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
 * Pega variável de ambiente com validação
 */
function getEnvVar(key: string, required: boolean = true, defaultValue?: string): string {
  // Suporta tanto NEXT_PUBLIC_ quanto VITE_
  const value = 
    process.env[key] || 
    process.env[`NEXT_PUBLIC_${key}`] || 
    process.env[`VITE_${key}`] ||
    defaultValue;
  
  if (required && !value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  
  return value || '';
}

/**
 * Valida URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida API key format
 */
function isValidApiKey(key: string, prefix?: string): boolean {
  if (!key || key.length < 20) {
    return false;
  }
  
  if (prefix && !key.startsWith(prefix)) {
    return false;
  }
  
  return true;
}

/**
 * Carrega e valida configuração
 */
export function loadEnvConfig(): EnvConfig {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // === REQUIRED VARS ===
  
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
  
  // OpenAI
  const openaiApiKey = getEnvVar('OPENAI_API_KEY', false) || getEnvVar('VITE_OPENAI_API_KEY', false);
  if (!openaiApiKey) {
    errors.push('Missing OPENAI_API_KEY');
  } else if (!isValidApiKey(openaiApiKey, 'sk-')) {
    errors.push('Invalid OPENAI_API_KEY format (should start with sk-)');
  }
  
  const openaiModel = getEnvVar('OPENAI_MODEL', false, 'gpt-4o-mini');
  
  // App URL
  const appUrl = getEnvVar('APP_URL', false) || getEnvVar('NEXT_PUBLIC_APP_URL', false) || 'http://localhost:3000';
  if (!isValidUrl(appUrl)) {
    errors.push('Invalid APP_URL format');
  }
  
  // Node ENV
  const nodeEnv = (getEnvVar('NODE_ENV', false, 'development') as 'development' | 'production' | 'test');
  
  // === OPTIONAL VARS ===
  
  // Service Role Key (opcional, mas recomendado para produção)
  const supabaseServiceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', false);
  if (nodeEnv === 'production' && !supabaseServiceRoleKey) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY not set (recommended for production)');
  }
  
  // StarFix (opcional)
  const starfixApiKey = getEnvVar('STARFIX_API_KEY', false);
  const starfixApiUrl = getEnvVar('STARFIX_API_URL', false);
  const starfixOrgId = getEnvVar('STARFIX_ORG_ID', false);
  
  if (starfixApiKey && (!starfixApiUrl || !starfixOrgId)) {
    warnings.push('STARFIX_API_KEY set but missing STARFIX_API_URL or STARFIX_ORG_ID');
  }
  
  // Terrastar (opcional)
  const terrastarApiKey = getEnvVar('TERRASTAR_API_KEY', false);
  const terrastarApiUrl = getEnvVar('TERRASTAR_API_URL', false);
  const terrastarServiceLevel = getEnvVar('TERRASTAR_SERVICE_LEVEL', false, 'PREMIUM') as 'BASIC' | 'PREMIUM' | 'RTK';
  
  if (terrastarApiKey && !terrastarApiUrl) {
    warnings.push('TERRASTAR_API_KEY set but missing TERRASTAR_API_URL');
  }
  
  // Security (recomendado para produção)
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
  
  // === PRINT RESULTS ===
  
  if (errors.length > 0) {
    errors.forEach(error => console.error(`❌ ENV ERROR: ${error}`));
    throw new Error('Invalid environment configuration. Please check .env file.');
  }
  
  if (warnings.length > 0) {
    warnings.forEach(warning => console.warn(`⚠️ ENV WARNING: ${warning}`));
  }
  
  console.log('✅ Environment configuration validated successfully');
  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    openaiApiKey,
    openaiModel,
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

/**
 * Singleton instance
 */
let configInstance: EnvConfig | null = null;

/**
 * Get validated config (cached)
 */
export function getConfig(): EnvConfig {
  if (!configInstance) {
    configInstance = loadEnvConfig();
  }
  return configInstance;
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: 'starfix' | 'terrastar' | 'ai'): boolean {
  const config = getConfig();
  
  switch (feature) {
    case 'starfix':
      return !!(config.starfixApiKey && config.starfixApiUrl && config.starfixOrgId);
    case 'terrastar':
      return !!(config.terrastarApiKey && config.terrastarApiUrl);
    case 'ai':
      return !!config.openaiApiKey;
    default:
      return false;
  }
}

/**
 * Print configuration summary (safe - no secrets)
 */
export function printConfigSummary(): void {
  const config = getConfig();
  
  console.log('=== Environment Config Summary ===');
  console.log(`Supabase URL: ${config.supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`OpenAI API Key: ${config.openaiApiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`StarFix: ${config.starfixApiKey ? '✅ Enabled' : '⚪ Disabled'}`);
  console.log(`Terrastar: ${config.terrastarApiKey ? '✅ Enabled' : '⚪ Disabled'}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log('==================================');
}

// Auto-validate on import (apenas em produção ou quando explicitamente configurado)
if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_ENV === 'true') {
  try {
    loadEnvConfig();
    printConfigSummary();
  } catch (error) {
    console.error('Failed to validate environment:', error);
    console.error('Failed to validate environment:', error);
    process.exit(1);
  }
}
