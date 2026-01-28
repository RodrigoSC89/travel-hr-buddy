/**
 * Enterprise SSO Manager
 * SAML 2.0 and OIDC integration for enterprise authentication
 * Phase 3: Enterprise Security
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface SSOProvider {
  id: string;
  name: string;
  type: "saml" | "oidc";
  enabled: boolean;
  domain?: string;
  metadata_url?: string;
  client_id?: string;
  issuer?: string;
  icon?: string;
}

export interface SSOConfig {
  providers: SSOProvider[];
  enforced_for_domains: string[];
  allow_password_fallback: boolean;
  auto_provision_users: boolean;
  default_role: string;
}

// Built-in enterprise SSO providers
export const ENTERPRISE_SSO_PROVIDERS: SSOProvider[] = [
  {
    id: "azure_ad",
    name: "Microsoft Entra ID (Azure AD)",
    type: "oidc",
    enabled: false,
    icon: "microsoft",
  },
  {
    id: "okta",
    name: "Okta",
    type: "oidc",
    enabled: false,
    icon: "key",
  },
  {
    id: "google_workspace",
    name: "Google Workspace",
    type: "oidc",
    enabled: false,
    icon: "chrome",
  },
  {
    id: "onelogin",
    name: "OneLogin",
    type: "saml",
    enabled: false,
    icon: "shield",
  },
  {
    id: "ping_identity",
    name: "Ping Identity",
    type: "saml",
    enabled: false,
    icon: "fingerprint",
  },
];

/**
 * Enterprise SSO Manager
 * Handles SSO configuration, login flows, and user provisioning
 */
export class EnterpriseSSOManager {
  private config: SSOConfig | null = null;

  /**
   * Initialize SSO configuration for organization
   */
  async initialize(organizationId: string): Promise<void> {
    try {
      // SSO config would be stored in organization_settings or a dedicated table
      // For now, use default config
      this.config = this.getDefaultConfig();
      logger.info("[SSO] Configuration loaded", { organizationId });
    } catch (error) {
      logger.error("[SSO] Failed to load configuration", error);
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * Get default SSO configuration
   */
  private getDefaultConfig(): SSOConfig {
    return {
      providers: ENTERPRISE_SSO_PROVIDERS,
      enforced_for_domains: [],
      allow_password_fallback: true,
      auto_provision_users: true,
      default_role: "member",
    };
  }

  /**
   * Check if SSO is required for email domain
   */
  isSSORequired(email: string): boolean {
    if (!this.config) return false;

    const domain = email.split("@")[1]?.toLowerCase();
    return this.config.enforced_for_domains.includes(domain);
  }

  /**
   * Get enabled SSO providers
   */
  getEnabledProviders(): SSOProvider[] {
    return this.config?.providers.filter((p) => p.enabled) || [];
  }

  /**
   * Initiate SSO login flow
   */
  async initiateSSO(
    providerId: string,
    redirectTo?: string
  ): Promise<{ url: string } | { error: string }> {
    const provider = this.config?.providers.find((p) => p.id === providerId);

    if (!provider || !provider.enabled) {
      return { error: "SSO provider not found or not enabled" };
    }

    try {
      // Map to Supabase OAuth providers
      const supabaseProvider = this.mapToSupabaseProvider(providerId);

      if (supabaseProvider) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: supabaseProvider,
          options: {
            redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
            scopes: this.getScopes(providerId),
          },
        });

        if (error) throw error;
        return { url: data.url };
      }

      // For custom SAML providers, use edge function
      const response = await supabase.functions.invoke("sso-initiate", {
        body: { providerId, redirectTo },
      });

      if (response.error) throw response.error;
      return { url: response.data.url };
    } catch (error) {
      logger.error("[SSO] Failed to initiate login", { providerId, error: String(error) });
      return { error: "Failed to initiate SSO login" };
    }
  }

  /**
   * Map custom provider ID to Supabase OAuth provider
   */
  private mapToSupabaseProvider(
    providerId: string
  ): "azure" | "google" | null {
    switch (providerId) {
      case "azure_ad":
        return "azure";
      case "google_workspace":
        return "google";
      default:
        return null;
    }
  }

  /**
   * Get OAuth scopes for provider
   */
  private getScopes(providerId: string): string {
    switch (providerId) {
      case "azure_ad":
        return "openid profile email User.Read";
      case "google_workspace":
        return "openid profile email";
      case "okta":
        return "openid profile email groups";
      default:
        return "openid profile email";
    }
  }

  /**
   * Handle SSO callback and provision user
   */
  async handleCallback(params: {
    code?: string;
    state?: string;
    samlResponse?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Supabase handles OAuth callback automatically
      // For SAML, we need custom handling
      if (params.samlResponse) {
        const response = await supabase.functions.invoke("sso-callback", {
          body: params,
        });

        if (response.error) throw response.error;

        // Sign in with returned session
        if (response.data.access_token) {
          await supabase.auth.setSession({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
          });
        }
      }

      // Auto-provision user if enabled
      if (this.config?.auto_provision_users) {
        await this.provisionUser();
      }

      logger.info("[SSO] Callback handled successfully");
      return { success: true };
    } catch (error) {
      logger.error("[SSO] Callback error", error);
      return { success: false, error: "SSO authentication failed" };
    }
  }

  /**
   * Auto-provision user after SSO login
   */
  private async provisionUser(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Check if user already exists in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        // Create profile for new SSO user
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
          avatar_url: user.user_metadata?.avatar_url,
        });

        logger.info("[SSO] User provisioned", { userId: user.id });
      }
    } catch (error) {
      logger.warn("[SSO] User provisioning skipped", { error: String(error) });
    }
  }

  /**
   * Update SSO configuration
   */
  async updateConfig(
    organizationId: string,
    updates: Partial<SSOConfig>
  ): Promise<void> {
    const newConfig = { ...this.config, ...updates };

    // Store config in organization metadata or dedicated table
    // For now, just update in memory
    this.config = newConfig as SSOConfig;
    logger.info("[SSO] Configuration updated", { organizationId });
  }
}

// Singleton instance
export const ssoManager = new EnterpriseSSOManager();
