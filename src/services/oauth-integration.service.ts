/**
 * OAuth Integration Service
 * 
 * Handles OAuth2 authentication flows for various integration providers
 * Supports Google Drive, Outlook, Slack and other OAuth2-based services
 */

export interface OAuthProvider {
  id: string;
  name: string;
  authUrl: string;
  tokenUrl: string;
  scope: string[];
  clientId?: string;
  redirectUri: string;
}

export interface OAuthCredentials {
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scope: string;
}

export interface IntegrationLog {
  id: string;
  integration_id: string;
  event_type: 'auth' | 'sync' | 'error' | 'action';
  status: 'success' | 'failure';
  message: string;
  timestamp: string;
  details?: Record<string, any>;
}

export class OAuthIntegrationService {
  // OAuth Provider Configurations
  private static PROVIDERS: { [key: string]: OAuthProvider } = {
    'google-drive': {
      id: 'google-drive',
      name: 'Google Drive',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scope: ['https://www.googleapis.com/auth/drive.file'],
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
    },
    'outlook': {
      id: 'outlook',
      name: 'Microsoft Outlook',
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scope: ['https://graph.microsoft.com/Mail.Read', 'https://graph.microsoft.com/Mail.Send'],
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
    },
    'slack': {
      id: 'slack',
      name: 'Slack',
      authUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      scope: ['chat:write', 'channels:read', 'users:read'],
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
    },
  };

  /**
   * Initialize OAuth flow for a provider
   */
  static initiateOAuthFlow(providerId: string): void {
    const provider = this.PROVIDERS[providerId];
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}`);
    }

    // Store state for CSRF protection
    const state = this.generateState();
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_provider', providerId);

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: provider.clientId || 'demo_client_id',
      redirect_uri: provider.redirectUri,
      scope: provider.scope.join(' '),
      response_type: 'code',
      state,
      access_type: 'offline', // Request refresh token
      prompt: 'consent',
    });

    const authUrl = `${provider.authUrl}?${params.toString()}`;

    // Open OAuth flow in popup or redirect
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      authUrl,
      'OAuth Authorization',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }

  /**
   * Handle OAuth callback
   */
  static async handleOAuthCallback(
    code: string,
    state: string,
    providerId: string
  ): Promise<OAuthCredentials> {
    // Verify state to prevent CSRF attacks
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    const provider = this.PROVIDERS[providerId];
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}`);
    }

    // In a real implementation, this would exchange the code for tokens
    // For demo purposes, we return mock credentials
    const credentials: OAuthCredentials = {
      provider: providerId,
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
      scope: provider.scope.join(' '),
    };

    // Clean up session storage
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_provider');

    return credentials;
  }

  /**
   * Store OAuth credentials securely
   */
  static async storeCredentials(
    userId: string,
    credentials: OAuthCredentials
  ): Promise<void> {
    // In a real implementation, credentials would be encrypted and stored securely
    // Using Supabase vault or similar secure storage
    const encryptedCredentials = this.encryptCredentials(credentials);

    // Store in local storage for demo (NOT RECOMMENDED for production)
    const storageKey = `oauth_creds_${userId}_${credentials.provider}`;
    localStorage.setItem(storageKey, JSON.stringify(encryptedCredentials));

    // Log the authentication event
    await this.logIntegrationEvent({
      integration_id: credentials.provider,
      event_type: 'auth',
      status: 'success',
      message: `Successfully authenticated with ${credentials.provider}`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Retrieve stored credentials
   */
  static async getCredentials(
    userId: string,
    provider: string
  ): Promise<OAuthCredentials | null> {
    const storageKey = `oauth_creds_${userId}_${provider}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return null;
    }

    try {
      const encryptedCreds = JSON.parse(stored);
      return this.decryptCredentials(encryptedCreds);
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(
    provider: string,
    refreshToken: string
  ): Promise<OAuthCredentials> {
    const providerConfig = this.PROVIDERS[provider];
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    // In a real implementation, this would call the token endpoint
    // For demo, return mock refreshed credentials
    return {
      provider,
      accessToken: `refreshed_token_${Date.now()}`,
      refreshToken,
      expiresAt: Date.now() + 3600 * 1000,
      scope: providerConfig.scope.join(' '),
    };
  }

  /**
   * Revoke OAuth credentials
   */
  static async revokeCredentials(userId: string, provider: string): Promise<void> {
    const storageKey = `oauth_creds_${userId}_${provider}`;
    localStorage.removeItem(storageKey);

    await this.logIntegrationEvent({
      integration_id: provider,
      event_type: 'auth',
      status: 'success',
      message: `Revoked credentials for ${provider}`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Test integration connection
   */
  static async testConnection(provider: string, credentials: OAuthCredentials): Promise<boolean> {
    try {
      // In a real implementation, this would make a test API call
      // For demo, simulate success/failure randomly
      const isConnected = Math.random() > 0.2; // 80% success rate

      await this.logIntegrationEvent({
        integration_id: provider,
        event_type: 'action',
        status: isConnected ? 'success' : 'failure',
        message: isConnected 
          ? `Connection test successful for ${provider}`
          : `Connection test failed for ${provider}`,
        timestamp: new Date().toISOString(),
      });

      return isConnected;
    } catch (error) {
      await this.logIntegrationEvent({
        integration_id: provider,
        event_type: 'error',
        status: 'failure',
        message: `Connection test error: ${error}`,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  /**
   * Log integration events
   */
  private static async logIntegrationEvent(log: Omit<IntegrationLog, 'id'>): Promise<void> {
    // In a real implementation, this would save to Supabase
    const fullLog: IntegrationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...log,
    };

    // Store in session storage for demo
    const logs = this.getIntegrationLogs();
    logs.unshift(fullLog);
    sessionStorage.setItem('integration_logs', JSON.stringify(logs.slice(0, 100))); // Keep last 100
  }

  /**
   * Get integration logs
   */
  static getIntegrationLogs(integrationId?: string): IntegrationLog[] {
    const stored = sessionStorage.getItem('integration_logs');
    if (!stored) {
      return [];
    }

    try {
      const logs: IntegrationLog[] = JSON.parse(stored);
      if (integrationId) {
        return logs.filter(log => log.integration_id === integrationId);
      }
      return logs;
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate random state for CSRF protection
   */
  private static generateState(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Encrypt credentials (simplified for demo)
   */
  private static encryptCredentials(credentials: OAuthCredentials): string {
    // In production, use proper encryption (Web Crypto API, etc.)
    return btoa(JSON.stringify(credentials));
  }

  /**
   * Decrypt credentials (simplified for demo)
   */
  private static decryptCredentials(encrypted: string): OAuthCredentials {
    // In production, use proper decryption
    return JSON.parse(atob(encrypted));
  }

  /**
   * Get list of available OAuth providers
   */
  static getAvailableProviders(): OAuthProvider[] {
    return Object.values(this.PROVIDERS);
  }

  /**
   * Check if provider is configured
   */
  static isProviderConfigured(providerId: string): boolean {
    return providerId in this.PROVIDERS;
  }
}
