/**
 * OAuth Service
 * Handles OAuth2 authentication flows for third-party integrations
 * Supports: Google Drive, Outlook, Slack
 * Features: CSRF protection, secure credential storage, event logging
 */

import { supabase } from "@/integrations/supabase/client";

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authUrl: string;
  tokenUrl: string;
}

interface OAuthProvider {
  google_drive: OAuthConfig;
  outlook: OAuthConfig;
  slack: OAuthConfig;
}

interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface IntegrationCredential {
  provider: string;
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  scope: string;
}

// OAuth Provider Configurations
const OAUTH_PROVIDERS: OAuthProvider = {
  google_drive: {
    clientId: process.env.VITE_GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET || '',
    redirectUri: `${window.location.origin}/auth/callback/google`,
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token'
  },
  outlook: {
    clientId: process.env.VITE_OUTLOOK_CLIENT_ID || '',
    clientSecret: process.env.VITE_OUTLOOK_CLIENT_SECRET || '',
    redirectUri: `${window.location.origin}/auth/callback/outlook`,
    scope: [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/Calendars.Read'
    ],
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
  },
  slack: {
    clientId: process.env.VITE_SLACK_CLIENT_ID || '',
    clientSecret: process.env.VITE_SLACK_CLIENT_SECRET || '',
    redirectUri: `${window.location.origin}/auth/callback/slack`,
    scope: [
      'channels:read',
      'chat:write',
      'users:read',
      'files:write'
    ],
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access'
  }
};

export class OAuthService {
  /**
   * Generate a cryptographically secure state parameter for CSRF protection
   */
  private static generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store state in session storage for CSRF validation
   */
  private static storeState(provider: string, state: string): void {
    sessionStorage.setItem(`oauth_state_${provider}`, state);
    sessionStorage.setItem(`oauth_state_${provider}_timestamp`, Date.now().toString());
  }

  /**
   * Validate state parameter to prevent CSRF attacks
   */
  private static validateState(provider: string, state: string): boolean {
    const storedState = sessionStorage.getItem(`oauth_state_${provider}`);
    const timestamp = sessionStorage.getItem(`oauth_state_${provider}_timestamp`);
    
    // State should match and be less than 10 minutes old
    const isValid = storedState === state && 
      timestamp && 
      (Date.now() - parseInt(timestamp)) < 10 * 60 * 1000;
    
    // Clean up
    sessionStorage.removeItem(`oauth_state_${provider}`);
    sessionStorage.removeItem(`oauth_state_${provider}_timestamp`);
    
    return Boolean(isValid);
  }

  /**
   * Initiate OAuth flow for a provider
   */
  static async initiateOAuth(provider: keyof OAuthProvider): Promise<void> {
    const config = OAUTH_PROVIDERS[provider];
    
    if (!config || !config.clientId) {
      throw new Error(`OAuth not configured for provider: ${provider}`);
    }

    // Generate and store state for CSRF protection
    const state = this.generateState();
    this.storeState(provider, state);

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope.join(' '),
      state,
      access_type: 'offline', // Request refresh token
      prompt: 'consent'
    });

    const authUrl = `${config.authUrl}?${params.toString()}`;

    // Log integration event
    await this.logIntegrationEvent(provider, 'oauth_initiated', { state });

    // Redirect to OAuth provider
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  static async handleCallback(
    provider: keyof OAuthProvider,
    code: string,
    state: string
  ): Promise<OAuthToken> {
    // Validate state to prevent CSRF
    if (!this.validateState(provider, state)) {
      await this.logIntegrationEvent(provider, 'oauth_csrf_violation', { state });
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    const config = OAUTH_PROVIDERS[provider];
    
    // Exchange authorization code for access token
    const tokenParams = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri
    });

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString()
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${error}`);
      }

      const tokens: OAuthToken = await response.json();

      // Store credentials securely
      await this.storeCredentials(provider, tokens);

      // Log success
      await this.logIntegrationEvent(provider, 'oauth_completed', {
        scope: tokens.scope
      });

      return tokens;
    } catch (error) {
      await this.logIntegrationEvent(provider, 'oauth_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Store OAuth credentials securely in Supabase
   */
  private static async storeCredentials(
    provider: string,
    tokens: OAuthToken
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // In a production environment, tokens should be encrypted before storage
    const credential: IntegrationCredential = {
      provider,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      scope: tokens.scope
    };

    const { error } = await supabase
      .from('integration_credentials' as any)
      .upsert({
        user_id: userData.user.id,
        provider,
        access_token: credential.access_token,
        refresh_token: credential.refresh_token,
        expires_at: credential.expires_at,
        scope: credential.scope,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to store credentials: ${error.message}`);
    }
  }

  /**
   * Refresh OAuth token when expired
   */
  static async refreshToken(provider: keyof OAuthProvider): Promise<OAuthToken> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Get stored credentials
    const { data: credentials, error: fetchError } = await supabase
      .from('integration_credentials' as any)
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('provider', provider)
      .single();

    if (fetchError || !(credentials as any)?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const config = OAUTH_PROVIDERS[provider];
    
    const tokenParams = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: (credentials as any).refresh_token,
      grant_type: 'refresh_token'
    });

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString()
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens: OAuthToken = await response.json();
      
      // Update stored credentials
      await this.storeCredentials(provider, tokens);

      await this.logIntegrationEvent(provider, 'token_refreshed', {});

      return tokens;
    } catch (error) {
      await this.logIntegrationEvent(provider, 'token_refresh_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get valid access token (refreshing if necessary)
   */
  static async getAccessToken(provider: keyof OAuthProvider): Promise<string> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data: credentials, error } = await supabase
      .from('integration_credentials' as any)
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('provider', provider)
      .single();

    if (error || !credentials) {
      throw new Error(`No credentials found for ${provider}`);
    }

    // Check if token is expired (with 5-minute buffer)
    const expiresAt = new Date((credentials as any).expires_at);
    const now = new Date(Date.now() + 5 * 60 * 1000);

    if (now >= expiresAt) {
      // Token expired, refresh it
      const tokens = await this.refreshToken(provider);
      return tokens.access_token;
    }

    return (credentials as any).access_token;
  }

  /**
   * Disconnect/revoke OAuth integration
   */
  static async disconnect(provider: keyof OAuthProvider): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('integration_credentials' as any)
      .delete()
      .eq('user_id', userData.user.id)
      .eq('provider', provider);

    if (error) {
      throw new Error(`Failed to disconnect: ${error.message}`);
    }

    await this.logIntegrationEvent(provider, 'disconnected', {});
  }

  /**
   * Check if integration is connected
   */
  static async isConnected(provider: keyof OAuthProvider): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return false;
    }

    const { data, error } = await supabase
      .from('integration_credentials' as any)
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('provider', provider)
      .single();

    return !error && !!data;
  }

  /**
   * Log integration events for auditing
   */
  private static async logIntegrationEvent(
    provider: string,
    event: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      await supabase
        .from('integration_logs' as any)
        .insert({
          user_id: userData.user?.id,
          provider,
          action: event,
          status: event.includes('failed') || event.includes('violation') ? 'error' : 'success',
          request_data: metadata
        } as any);
    } catch (error) {
      console.error('Failed to log integration event:', error);
    }
  }

  /**
   * Get integration logs for a provider
   */
  static async getIntegrationLogs(
    provider?: string,
    limit: number = 50
  ): Promise<any[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return [];
    }

    let query = supabase
      .from('integration_logs' as any)
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (provider) {
      query = query.eq('provider', provider);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch integration logs:', error);
      return [];
    }

    return data || [];
  }
}
