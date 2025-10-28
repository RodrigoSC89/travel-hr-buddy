/**
 * PATCH 346: Integrations Hub v2 - Service Layer
 * Service for managing webhooks, OAuth connections, and integration plugins
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  WebhookIntegration,
  WebhookEvent,
  OAuthConnection,
  IntegrationPlugin,
  IntegrationLog,
  IntegrationDashboardStats,
  IntegrationProvider,
} from '@/types/integrations';

export class IntegrationsService {
  // Webhook Integrations
  static async getIntegrations(): Promise<WebhookIntegration[]> {
    const { data, error } = await supabase
      .from('webhook_integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getIntegration(id: string): Promise<WebhookIntegration | null> {
    const { data, error } = await supabase
      .from('webhook_integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createIntegration(
    integration: Partial<WebhookIntegration>
  ): Promise<WebhookIntegration> {
    const { data, error } = await supabase
      .from('webhook_integrations')
      .insert(integration)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateIntegration(
    id: string,
    updates: Partial<WebhookIntegration>
  ): Promise<WebhookIntegration> {
    const { data, error } = await supabase
      .from('webhook_integrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('webhook_integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async toggleIntegration(id: string, enabled: boolean): Promise<void> {
    await this.updateIntegration(id, {
      status: enabled ? 'active' : 'inactive',
    });
  }

  // Webhook Events
  static async getWebhookEvents(integrationId?: string): Promise<WebhookEvent[]> {
    let query = supabase
      .from('webhook_events')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(100);

    if (integrationId) {
      query = query.eq('integration_id', integrationId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async dispatchWebhookEvent(
    integrationId: string,
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<string> {
    const { data, error } = await supabase.rpc('dispatch_webhook_event', {
      p_integration_id: integrationId,
      p_event_type: eventType,
      p_payload: payload,
    });

    if (error) throw error;
    return data;
  }

  // OAuth Connections
  static async getOAuthConnections(): Promise<OAuthConnection[]> {
    const { data, error } = await supabase
      .from('oauth_connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getOAuthConnection(
    provider: IntegrationProvider
  ): Promise<OAuthConnection | null> {
    const { data, error } = await supabase
      .from('oauth_connections')
      .select('*')
      .eq('provider', provider)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async saveOAuthConnection(
    connection: Partial<OAuthConnection>
  ): Promise<OAuthConnection> {
    const { data, error } = await supabase
      .from('oauth_connections')
      .upsert(connection)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async disconnectOAuth(provider: IntegrationProvider): Promise<void> {
    const { error } = await supabase
      .from('oauth_connections')
      .delete()
      .eq('provider', provider);

    if (error) throw error;
  }

  static async refreshOAuthToken(
    provider: IntegrationProvider
  ): Promise<OAuthConnection> {
    // In production, this would call the OAuth provider's token refresh endpoint
    const connection = await this.getOAuthConnection(provider);
    if (!connection || !connection.refresh_token) {
      throw new Error('No refresh token available');
    }

    // Placeholder - implement actual refresh logic
    return connection;
  }

  // Integration Plugins
  static async getPlugins(): Promise<IntegrationPlugin[]> {
    const { data, error } = await supabase
      .from('integration_plugins')
      .select('*')
      .order('display_name');

    if (error) throw error;
    return data || [];
  }

  static async getEnabledPlugins(): Promise<IntegrationPlugin[]> {
    const { data, error } = await supabase
      .from('integration_plugins')
      .select('*')
      .eq('is_enabled', true)
      .order('display_name');

    if (error) throw error;
    return data || [];
  }

  static async togglePlugin(id: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('integration_plugins')
      .update({ is_enabled: enabled })
      .eq('id', id);

    if (error) throw error;
  }

  // Integration Logs
  static async getLogs(limit = 100): Promise<IntegrationLog[]> {
    const { data, error } = await supabase
      .from('integration_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async createLog(log: Partial<IntegrationLog>): Promise<void> {
    const { error } = await supabase.from('integration_logs').insert(log);
    if (error) throw error;
  }

  // Dashboard Stats
  static async getDashboardStats(): Promise<IntegrationDashboardStats> {
    const [integrations, events, logs] = await Promise.all([
      this.getIntegrations(),
      this.getWebhookEvents(),
      this.getLogs(20),
    ]);

    const activeIntegrations = integrations.filter((i) => i.status === 'active');
    const totalEvents = events.length;
    const successfulEvents = events.filter((e) => e.status === 'success').length;
    const successRate = totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0;

    return {
      total_integrations: integrations.length,
      active_integrations: activeIntegrations.length,
      total_events: totalEvents,
      success_rate: successRate,
      recent_events: events.slice(0, 10),
      recent_logs: logs.slice(0, 10),
    };
  }

  // OAuth Flow Helpers
  static getOAuthUrl(
    provider: IntegrationProvider,
    clientId: string,
    redirectUri: string,
    scope: string[]
  ): string {
    const state = Math.random().toString(36).substring(7);
    const scopeStr = scope.join(' ');

    const urls: Record<IntegrationProvider, string> = {
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopeStr}&state=${state}`,
      microsoft: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopeStr}&state=${state}`,
      zapier: `https://zapier.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`,
      slack: `https://slack.com/oauth/v2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopeStr}&state=${state}`,
      custom: redirectUri,
    };

    return urls[provider] || '';
  }
}
