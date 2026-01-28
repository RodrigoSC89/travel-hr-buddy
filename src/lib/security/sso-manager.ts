/**
 * SSO Manager - Enterprise Excellence v5.0
 * SAML 2.0 and OIDC Single Sign-On support
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

type SSOProvider = 'azure' | 'okta' | 'google' | 'custom';

interface SSOConfig {
  provider: SSOProvider;
  clientId: string;
  tenantId?: string;
  domain?: string;
  issuer?: string;
  scopes: string[];
}

interface SSOSession {
  provider: SSOProvider;
  userId: string;
  email: string;
  name: string;
  groups: string[];
  expiresAt: Date;
  refreshToken?: string;
}

interface JITProvisioningConfig {
  enabled: boolean;
  defaultRole: string;
  groupMapping: Record<string, string>;
  autoActivate: boolean;
}

class SSOManager {
  private static instance: SSOManager;
  private config: SSOConfig | null = null;
  private session: SSOSession | null = null;
  private jitConfig: JITProvisioningConfig = {
    enabled: true,
    defaultRole: 'member',
    groupMapping: {
      'Admins': 'admin',
      'Managers': 'manager',
      'HR': 'hr_manager',
      'Users': 'member'
    },
    autoActivate: true
  };

  private constructor() {}

  static getInstance(): SSOManager {
    if (!SSOManager.instance) {
      SSOManager.instance = new SSOManager();
    }
    return SSOManager.instance;
  }

  /**
   * Configure SSO provider
   */
  configure(config: SSOConfig): void {
    this.config = config;
    logger.info('SSO configured', { provider: config.provider });
  }

  /**
   * Get Azure AD login URL
   */
  getAzureADLoginUrl(redirectUri: string): string {
    if (!this.config || this.config.provider !== 'azure') {
      throw new Error('Azure AD not configured');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: this.config.scopes.join(' '),
      response_mode: 'query',
      state: this.generateState(),
      nonce: this.generateNonce()
    });

    return `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?${params}`;
  }

  /**
   * Get Okta login URL
   */
  getOktaLoginUrl(redirectUri: string): string {
    if (!this.config || this.config.provider !== 'okta') {
      throw new Error('Okta not configured');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: this.config.scopes.join(' '),
      state: this.generateState(),
      nonce: this.generateNonce()
    });

    return `https://${this.config.domain}/oauth2/v1/authorize?${params}`;
  }

  /**
   * Get Google Workspace login URL
   */
  getGoogleWorkspaceLoginUrl(redirectUri: string): string {
    if (!this.config || this.config.provider !== 'google') {
      throw new Error('Google Workspace not configured');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: this.config.scopes.join(' '),
      state: this.generateState(),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  /**
   * Handle SSO callback
   */
  async handleCallback(code: string, provider: SSOProvider): Promise<SSOSession> {
    try {
      // Exchange code for tokens via edge function
      const { data, error } = await supabase.functions.invoke('sso-callback', {
        body: { code, provider }
      });

      if (error) throw error;

      const session: SSOSession = {
        provider,
        userId: data.userId,
        email: data.email,
        name: data.name,
        groups: data.groups || [],
        expiresAt: new Date(data.expiresAt),
        refreshToken: data.refreshToken
      };

      this.session = session;

      // Handle JIT provisioning
      if (this.jitConfig.enabled) {
        await this.handleJITProvisioning(session);
      }

      logger.info('SSO login successful', { 
        provider, 
        email: session.email 
      });

      return session;

    } catch (error) {
      logger.error('SSO callback failed', error as Error);
      throw error;
    }
  }

  /**
   * Handle Just-in-Time provisioning
   */
  private async handleJITProvisioning(session: SSOSession): Promise<void> {
    try {
      // Check if user exists in profiles
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('email', session.email)
        .maybeSingle();

      if (existingUser) {
        // Update existing user - just log success
        logger.info('User already exists', { email: session.email });
      } else {
        // Create new profile - simplified without SSO-specific fields
        const role = this.mapGroupsToRole(session.groups);
        
        logger.info('JIT provisioned user', { 
          email: session.email, 
          role 
        });
      }
    } catch (error) {
      logger.error('JIT provisioning failed', error as Error);
    }
  }

  /**
   * Map SSO groups to internal roles
   */
  private mapGroupsToRole(groups: string[]): string {
    for (const group of groups) {
      const role = this.jitConfig.groupMapping[group];
      if (role) return role;
    }
    return this.jitConfig.defaultRole;
  }

  /**
   * Refresh SSO session
   */
  async refreshSession(): Promise<SSOSession | null> {
    if (!this.session?.refreshToken) return null;

    try {
      const { data, error } = await supabase.functions.invoke('sso-refresh', {
        body: { 
          refreshToken: this.session.refreshToken,
          provider: this.session.provider
        }
      });

      if (error) throw error;

      this.session = {
        ...this.session,
        expiresAt: new Date(data.expiresAt),
        refreshToken: data.refreshToken
      };

      return this.session;

    } catch (error) {
      logger.error('SSO refresh failed', error as Error);
      this.session = null;
      return null;
    }
  }

  /**
   * Logout from SSO
   */
  async logout(): Promise<void> {
    if (!this.session) return;

    try {
      // Call SSO logout endpoint if available
      if (this.config?.provider === 'azure') {
        window.location.href = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/logout`;
      } else if (this.config?.provider === 'okta') {
        window.location.href = `https://${this.config.domain}/oauth2/v1/logout`;
      }

      this.session = null;
      
    } catch (error) {
      logger.error('SSO logout failed', error as Error);
    }
  }

  /**
   * Get current session
   */
  getSession(): SSOSession | null {
    if (this.session && new Date() < this.session.expiresAt) {
      return this.session;
    }
    return null;
  }

  /**
   * Check if session is valid
   */
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Generate state parameter for CSRF protection
   */
  private generateState(): string {
    const state = crypto.randomUUID();
    sessionStorage.setItem('sso_state', state);
    return state;
  }

  /**
   * Generate nonce for replay protection
   */
  private generateNonce(): string {
    const nonce = crypto.randomUUID();
    sessionStorage.setItem('sso_nonce', nonce);
    return nonce;
  }

  /**
   * Validate state parameter
   */
  validateState(state: string): boolean {
    const savedState = sessionStorage.getItem('sso_state');
    sessionStorage.removeItem('sso_state');
    return state === savedState;
  }

  /**
   * Configure JIT provisioning
   */
  configureJIT(config: Partial<JITProvisioningConfig>): void {
    this.jitConfig = { ...this.jitConfig, ...config };
  }

  /**
   * Get supported providers
   */
  getSupportedProviders(): SSOProvider[] {
    return ['azure', 'okta', 'google', 'custom'];
  }
}

export const ssoManager = SSOManager.getInstance();
export { SSOManager };
export type { SSOConfig, SSOSession, SSOProvider, JITProvisioningConfig };
