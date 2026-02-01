/**
 * OAuth Providers Configuration
 * PATCH v27: Unified OAuth handling for Google, GitHub, Microsoft
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export type OAuthProvider = 'google' | 'github' | 'azure';

interface OAuthConfig {
  provider: OAuthProvider;
  displayName: string;
  icon: string;
  scopes?: string[];
}

export const OAUTH_PROVIDERS: Record<OAuthProvider, OAuthConfig> = {
  google: {
    provider: 'google',
    displayName: 'Google',
    icon: 'google',
    scopes: ['email', 'profile'],
  },
  github: {
    provider: 'github',
    displayName: 'GitHub',
    icon: 'github',
    scopes: ['user:email'],
  },
  azure: {
    provider: 'azure',
    displayName: 'Microsoft',
    icon: 'microsoft',
    scopes: ['email', 'profile', 'openid'],
  },
};

/**
 * Get valid redirect URL based on current environment
 */
function getRedirectUrl(): string {
  const { origin, hostname } = window.location;
  
  // Production domains
  if (hostname === 'nautione.com.br' || hostname === 'www.nautione.com.br') {
    return 'https://nautione.com.br/auth/callback';
  }
  
  // Vercel production
  if (hostname === 'travel-hr-buddy.vercel.app') {
    return 'https://travel-hr-buddy.vercel.app/auth/callback';
  }
  
  // Lovable preview/published
  if (hostname.includes('lovable.app')) {
    return `${origin}/auth/callback`;
  }
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${origin}/auth/callback`;
  }
  
  // Default fallback - use production
  return 'https://nautione.com.br/auth/callback';
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<{ error: Error | null }> {
  try {
    const redirectTo = getRedirectUrl();
    
    logger.info(`OAuth login initiated`, { provider, redirectTo });

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      logger.error('OAuth sign in failed', error, { provider });
      return { error };
    }

    return { error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('OAuth login failed');
    logger.error('OAuth exception', error, { provider });
    return { error };
  }
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback(): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      logger.error('OAuth callback failed', error);
      return { success: false, error: error.message };
    }

    if (data.session) {
      logger.info('OAuth callback successful', { 
        userId: data.session.user.id,
        provider: data.session.user.app_metadata.provider 
      });
      return { success: true };
    }

    return { success: false, error: 'No session found' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('OAuth callback exception', err);
    return { success: false, error: message };
  }
}

/**
 * Get available OAuth providers
 */
export function getAvailableProviders(): OAuthConfig[] {
  return Object.values(OAUTH_PROVIDERS);
}

/**
 * Check if provider is configured in Supabase
 */
export async function isProviderEnabled(provider: OAuthProvider): Promise<boolean> {
  // This would need to be checked via admin API or tested empirically
  // For now, return true as the providers are configured
  return true;
}
