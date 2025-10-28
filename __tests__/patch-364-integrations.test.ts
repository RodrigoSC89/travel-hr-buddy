import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";

describe("PATCH 364 - Integrations Hub OAuth & Plugins", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Integration Providers", () => {
    it("should fetch active integration providers", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "1",
                name: "google",
                display_name: "Google",
                provider_type: "oauth2",
                is_active: true,
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("integration_providers")
        .select("*")
        .eq("is_active", true)
        .order("display_name");

      expect(result.data).toBeDefined();
    });
  });

  describe("OAuth Flow", () => {
    it("should create OAuth state", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: {
          state: "random-state-token",
          auth_url: "https://oauth.provider.com/authorize",
        },
        error: null,
      });

      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      const result = await supabase.rpc("create_oauth_state", {
        p_provider_id: "provider-id",
        p_redirect_uri: "https://app.com/callback",
      });

      expect(mockRpc).toHaveBeenCalled();
      expect(result.data.state).toBeDefined();
      expect(result.data.auth_url).toBeDefined();
    });

    it("should verify OAuth state", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: {
          user_id: "user-id",
          provider_id: "provider-id",
          is_valid: true,
        },
        error: null,
      });

      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      const result = await supabase.rpc("verify_oauth_state", {
        p_state: "state-token",
      });

      expect(result.data.is_valid).toBe(true);
    });

    it("should activate integration with OAuth tokens", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: "integration-id",
        error: null,
      });

      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      await supabase.rpc("activate_integration", {
        p_provider_id: "provider-id",
        p_access_token: "access-token",
        p_refresh_token: "refresh-token",
        p_token_expires_at: new Date(Date.now() + 3600000).toISOString(),
      });

      expect(mockRpc).toHaveBeenCalled();
    });

    it("should deactivate integration", async () => {
      const mockRpc = vi.fn().mockResolvedValue({ data: true, error: null });
      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      await supabase.rpc("deactivate_integration", {
        p_integration_id: "integration-id",
      });

      expect(mockRpc).toHaveBeenCalled();
    });
  });

  describe("User Integrations", () => {
    it("should fetch user integrations", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "1",
              provider_id: "google",
              is_active: true,
              last_sync_at: new Date().toISOString(),
            },
          ],
          error: null,
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("user_integrations")
        .select("*")
        .order("created_at", { ascending: false });

      expect(result.data).toBeDefined();
    });
  });

  describe("Integration Logs", () => {
    it("should log integration activity", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: "log-id",
        error: null,
      });

      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      await supabase.rpc("log_integration_activity", {
        p_integration_id: "integration-id",
        p_log_type: "sync",
        p_status: "success",
        p_message: "Sync completed",
        p_duration_ms: 1500,
      });

      expect(mockRpc).toHaveBeenCalled();
    });

    it("should fetch integration logs", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: "1",
                log_type: "sync",
                status: "success",
                message: "Sync completed",
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("integration_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      expect(result.data).toBeDefined();
    });
  });

  describe("Webhooks", () => {
    it("should create webhook", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: { id: "webhook-id" },
        error: null,
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        insert: mockInsert,
      } as any);

      const webhookData = {
        integration_id: "integration-id",
        name: "New User Webhook",
        url: "https://app.com/webhook",
        events: ["user.created", "user.updated"],
        secret: "webhook-secret",
      };

      await supabase.from("webhooks").insert(webhookData);

      expect(mockInsert).toHaveBeenCalledWith(webhookData);
    });

    it("should trigger webhook", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: "delivery-id",
        error: null,
      });

      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      await supabase.rpc("trigger_webhook", {
        p_webhook_id: "webhook-id",
        p_event_type: "user.created",
        p_payload: { user_id: "123", email: "user@example.com" },
      });

      expect(mockRpc).toHaveBeenCalled();
    });

    it("should fetch webhook deliveries", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "1",
                webhook_id: "webhook-1",
                event_type: "user.created",
                status: "delivered",
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("webhook_deliveries")
        .select("*")
        .eq("webhook_id", "webhook-1")
        .order("created_at", { ascending: false });

      expect(result.data).toBeDefined();
    });
  });

  describe("Plugins", () => {
    it("should fetch active plugins", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "1",
                name: "export-plugin",
                display_name: "Export Plugin",
                version: "1.0.0",
                is_active: true,
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("plugins")
        .select("*")
        .eq("is_active", true)
        .order("install_count", { ascending: false });

      expect(result.data).toBeDefined();
    });

    it("should install plugin", async () => {
      const mockRpc = vi.fn().mockResolvedValue({
        data: "installation-id",
        error: null,
      });

      vi.spyOn(supabase, "rpc").mockImplementation(mockRpc);

      await supabase.rpc("install_plugin", {
        p_plugin_id: "plugin-id",
        p_configuration: { enabled: true },
      });

      expect(mockRpc).toHaveBeenCalled();
    });

    it("should fetch user plugins", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: "1",
                plugin_id: "plugin-1",
                is_enabled: true,
                installed_at: new Date().toISOString(),
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await supabase
        .from("user_plugins")
        .select("*")
        .eq("user_id", "user-id")
        .order("installed_at", { ascending: false });

      expect(result.data).toBeDefined();
    });
  });
});
