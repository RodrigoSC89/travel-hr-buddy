/**
 * PATCH 346: Integrations Hub v2 - Service Layer
 * Service for managing webhooks, OAuth connections, and integration plugins
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type {
  WebhookIntegration,
  WebhookEvent,
  OAuthConnection,
  IntegrationPlugin,
  IntegrationLog,
  IntegrationDashboardStats,
  IntegrationProvider,
} from "@/types/integrations";

export class IntegrationsService {
  // Webhook Integrations
  static async getIntegrations(): Promise<WebhookIntegration[]> {
    const { data, error } = await supabase
      .from("webhook_integrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as any;
  }

  static async getIntegration(id: string): Promise<WebhookIntegration | null> {
    const { data, error } = await supabase
      .from("webhook_integrations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as any;
  }

  static async createIntegration(
    integration: Partial<WebhookIntegration>
  ): Promise<WebhookIntegration> {
    const { data, error } = await supabase
      .from("webhook_integrations")
      .insert(integration as any)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  }

  static async updateIntegration(
    id: string,
    updates: Partial<WebhookIntegration>
  ): Promise<WebhookIntegration> {
    const { data, error } = await supabase
      .from("webhook_integrations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  }

  static async deleteIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from("webhook_integrations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async toggleIntegration(id: string, enabled: boolean): Promise<void> {
    await this.updateIntegration(id, {
      status: enabled ? "active" : "inactive",
    });
  }

  // Webhook Events
  static async getWebhookEvents(integrationId?: string): Promise<WebhookEvent[]> {
    let query = supabase
      .from("webhook_events")
      .select("*")
      .order("triggered_at", { ascending: false })
      .limit(100);

    if (integrationId) {
      query = query.eq("integration_id", integrationId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as any;
  }

  static async dispatchWebhookEvent(
    integrationId: string,
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<string> {
    const { data, error } = await (supabase as any).rpc("dispatch_webhook_event", {
      p_integration_id: integrationId,
      p_event_type: eventType,
      p_payload: payload,
    });

    if (error) throw error;
    return data as any;
  }

  // OAuth Connections
  static async getOAuthConnections(): Promise<OAuthConnection[]> {
    const { data, error } = await supabase
      .from("oauth_connections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as any;
  }

  static async getOAuthConnection(
    provider: IntegrationProvider
  ): Promise<OAuthConnection | null> {
    const { data, error } = await supabase
      .from("oauth_connections")
      .select("*")
      .eq("provider", provider)
      .maybeSingle();

    if (error) throw error;
    return data as any;
  }

  static async saveOAuthConnection(
    connection: Partial<OAuthConnection>
  ): Promise<OAuthConnection> {
    const { data, error } = await supabase
      .from("oauth_connections")
      .upsert(connection as any)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  }

  static async disconnectOAuth(provider: IntegrationProvider): Promise<void> {
    const { error } = await supabase
      .from("oauth_connections")
      .delete()
      .eq("provider", provider);

    if (error) throw error;
  }

  static async refreshOAuthToken(
    provider: IntegrationProvider
  ): Promise<OAuthConnection> {
    // In production, this would call the OAuth provider's token refresh endpoint
    const connection = await this.getOAuthConnection(provider);
    if (!connection || !connection.refresh_token) {
      throw new Error("No refresh token available");
    }

    // Placeholder - implement actual refresh logic
    return connection;
  }

  // Integration Plugins
  static async getPlugins(): Promise<IntegrationPlugin[]> {
    const { data, error } = await supabase
      .from("integration_plugins")
      .select("*")
      .order("display_name");

    if (error) throw error;
    return (data || []) as any;
  }

  static async getEnabledPlugins(): Promise<IntegrationPlugin[]> {
    const { data, error } = await supabase
      .from("integration_plugins")
      .select("*")
      .eq("is_enabled", true)
      .order("display_name");

    if (error) throw error;
    return (data || []) as any;
  }

  static async togglePlugin(id: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from("integration_plugins")
      .update({ is_enabled: enabled })
      .eq("id", id);

    if (error) throw error;
  }

  // Integration Logs
  static async getLogs(limit = 100): Promise<IntegrationLog[]> {
    const { data, error } = await supabase
      .from("integration_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as any;
  }

  static async createLog(log: Partial<IntegrationLog>): Promise<void> {
    const { error } = await supabase.from("integration_logs").insert(log as any);
    if (error) throw error;
  }

  // Dashboard Stats
  static async getDashboardStats(): Promise<IntegrationDashboardStats> {
    const [integrations, events, logs] = await Promise.all([
      this.getIntegrations(),
      this.getWebhookEvents(),
      this.getLogs(20),
    ]);

    const activeIntegrations = integrations.filter((i) => i.status === "active");
    const totalEvents = events.length;
    const successfulEvents = events.filter((e) => e.status === "success").length;
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
    const scopeStr = scope.join(" ");

    const urls: Record<IntegrationProvider, string> = {
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopeStr}&state=${state}`,
      microsoft: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopeStr}&state=${state}`,
      zapier: `https://zapier.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`,
      slack: `https://slack.com/oauth/v2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopeStr}&state=${state}`,
      custom: redirectUri,
    };

    return urls[provider] || "";
  }

  // PATCH 385: Enhanced OAuth Flows (Google, Slack, Notion)
  static async initiateGoogleOAuth(redirectUri: string): Promise<string> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    const scope = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/drive.readonly",
    ];
    
    return this.getOAuthUrl("google", clientId, redirectUri, scope);
  }

  static async initiateSlackOAuth(redirectUri: string): Promise<string> {
    const clientId = import.meta.env.VITE_SLACK_CLIENT_ID || "";
    const scope = [
      "channels:read",
      "chat:write",
      "users:read",
      "team:read",
    ];
    
    return this.getOAuthUrl("slack", clientId, redirectUri, scope);
  }

  static async initiateNotionOAuth(redirectUri: string): Promise<string> {
    const clientId = import.meta.env.VITE_NOTION_CLIENT_ID || "";
    const state = Math.random().toString(36).substring(7);
    
    return `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${redirectUri}&state=${state}`;
  }

  static async handleOAuthCallback(
    provider: IntegrationProvider,
    code: string,
    redirectUri: string
  ): Promise<OAuthConnection> {
    // This would typically call your backend to exchange the code for tokens
    // For security, OAuth token exchange should happen server-side
    
    const { data, error } = await supabase.functions.invoke("oauth-exchange", {
      body: { provider, code, redirectUri },
    });

    if (error) throw error;

    // Save the connection
    const connection = await this.saveOAuthConnection({
      provider,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_at: data.expires_at,
      scope: data.scope,
      status: "connected",
      provider_user_id: data.user_id,
    });

    await this.createLog({
      level: "info",
      message: `OAuth connection established for ${provider}`,
      context: { provider },
    });

    return connection;
  }

  // PATCH 385: Configurable Webhooks
  static async configureWebhook(
    integration: Partial<WebhookIntegration>,
    events: string[],
    headers?: Record<string, string>
  ): Promise<WebhookIntegration> {
    const secretKey = this.generateWebhookSecret();
    
    const webhookIntegration = await this.createIntegration({
      ...integration,
      events,
      headers: headers || {},
      secret_key: secretKey,
      status: "active",
    });

    await this.createLog({
      level: "info",
      message: `Webhook configured: ${integration.name}`,
      context: { integration_id: webhookIntegration.id, events },
    });

    return webhookIntegration;
  }

  static generateWebhookSecret(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let secret = "whsec_";
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  static async testWebhook(integrationId: string): Promise<boolean> {
    try {
      const integration = await this.getIntegration(integrationId);
      if (!integration) {
        throw new Error("Integration not found");
      }

      const testPayload = {
        event: "test",
        timestamp: new Date().toISOString(),
        data: { message: "This is a test webhook event" },
      });

      await this.dispatchWebhookEvent(integrationId, "test", testPayload);
      
      return true;
    } catch (error) {
      logger.error("Webhook test failed", error as Error, { integrationId });
      return false;
    }
  }

  // PATCH 385: Modular Plugin System
  static async installPlugin(plugin: Partial<IntegrationPlugin>): Promise<IntegrationPlugin> {
    const { data, error } = await supabase
      .from("integration_plugins")
      .insert({
        ...plugin,
        is_enabled: true,
        version: plugin.version || "1.0.0",
      } as any)
      .select()
      .single();

    if (error) throw error;

    await this.createLog({
      level: "info",
      message: `Plugin installed: ${plugin.display_name}`,
      context: { plugin_id: data.id },
    });

    return data as any;
  }

  static async uninstallPlugin(pluginId: string): Promise<void> {
    const { error } = await supabase
      .from("integration_plugins")
      .delete()
      .eq("id", pluginId);

    if (error) throw error;

    await this.createLog({
      level: "info",
      message: `Plugin uninstalled: ${pluginId}`,
      context: { plugin_id: pluginId },
    });
  }

  static async configurePlugin(
    pluginId: string,
    config: Record<string, unknown>
  ): Promise<void> {
    const plugin = await this.getPluginById(pluginId);
    if (!plugin) {
      throw new Error("Plugin not found");
    }

    // Validate config against schema if available
    if (plugin.config_schema) {
      this.validatePluginConfig(config, plugin.config_schema);
    }

    const { error } = await supabase
      .from("integration_plugins")
      .update({ 
        metadata: { ...plugin.metadata, config },
        updated_at: new Date().toISOString(),
      })
      .eq("id", pluginId);

    if (error) throw error;

    await this.createLog({
      level: "info",
      message: `Plugin configured: ${plugin.display_name}`,
      context: { plugin_id: pluginId },
    });
  }

  static async getPluginById(pluginId: string): Promise<IntegrationPlugin | null> {
    const { data, error } = await supabase
      .from("integration_plugins")
      .select("*")
      .eq("id", pluginId)
      .single();

    if (error) throw error;
    return data as any;
  }

  static validatePluginConfig(
    config: Record<string, unknown>,
    schema: Record<string, unknown>
  ): boolean {
    // Simple validation - in production use a library like Ajv
    for (const key in schema) {
      const schemaField = schema[key] as { required?: boolean };
      if (schemaField.required && !config[key]) {
        throw new Error(`Required field missing: ${key}`);
      }
    }
    return true;
  }

  static async executePlugin(
    pluginId: string,
    action: string,
    params?: Record<string, unknown>
  ): Promise<any> {
    const plugin = await this.getPluginById(pluginId);
    if (!plugin || !plugin.is_enabled) {
      throw new Error("Plugin not available");
    }

    await this.createLog({
      level: "info",
      message: `Plugin execution: ${plugin.display_name} - ${action}`,
      context: { plugin_id: pluginId, action, params },
    });

    // In production, this would delegate to plugin execution engine
    return { success: true, result: "Plugin executed successfully" };
  }

  // PATCH 385: Integration Status Dashboard
  static async getIntegrationStatusPanel(): Promise<any> {
    const stats = await this.getDashboardStats();
    const connections = await this.getOAuthConnections();
    const plugins = await this.getPlugins();

    const oauthStatus = connections.reduce((acc, conn) => {
      acc[conn.provider] = {
        connected: conn.status === "connected",
        last_sync: conn.last_sync_at,
        expires_at: conn.expires_at,
      });
      return acc;
    }, {} as Record<string, any>);

    const pluginStatus = plugins.map(p => ({
      id: p.id,
      name: p.display_name,
      enabled: p.is_enabled,
      version: p.version,
      provider: p.provider,
    }));

    return {
      summary: {
        total_integrations: stats.total_integrations,
        active_integrations: stats.active_integrations,
        total_events_24h: stats.total_events,
        success_rate: Math.round(stats.success_rate * 100) / 100,
      },
      oauth_connections: oauthStatus,
      plugins: pluginStatus,
      recent_activity: stats.recent_logs.slice(0, 5),
      health_status: this.calculateHealthStatus(stats),
    };
  }

  static calculateHealthStatus(stats: IntegrationDashboardStats): string {
    if (stats.success_rate >= 95) return "healthy";
    if (stats.success_rate >= 80) return "degraded";
    return "critical";
  }

  // PATCH 385: Metrics and Monitoring
  static async getIntegrationMetrics(days = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: events, error } = await supabase
      .from("webhook_events")
      .select("*")
      .gte("triggered_at", startDate.toISOString());

    if (error) throw error;

    const eventsByDay = new Map<string, { success: number; failed: number }>();
    
    for (const event of events || []) {
      if (!event.triggered_at) continue;
      const day = event.triggered_at.split("T")[0];
      const current = eventsByDay.get(day) || { success: 0, failed: 0 };
      
      if (event.status === "success") {
        current.success++;
      } else {
        current.failed++;
      }
      
      eventsByDay.set(day, current);
    }

    const eventsByIntegration = new Map<string, number>();
    for (const event of events || []) {
      if (!event.integration_id) continue;
      const count = eventsByIntegration.get(event.integration_id) || 0;
      eventsByIntegration.set(event.integration_id, count + 1);
    }

    return {
      total_events: events?.length || 0,
      success_count: events?.filter((e: any) => e.status === "success").length || 0,
      failure_count: events?.filter((e: any) => e.status === "failed").length || 0,
      by_day: Array.from(eventsByDay.entries()).map(([day, stats]) => ({
        date: day,
        ...stats,
      })),
      by_integration: Array.from(eventsByIntegration.entries()).map(([id, count]) => ({
        integration_id: id,
        event_count: count,
      })),
    };
  }
}
