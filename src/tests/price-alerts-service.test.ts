import { describe, it, expect, vi, beforeEach } from "vitest";
import { priceAlertsService } from "../services/price-alerts-service";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe("Price Alerts Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAlerts", () => {
    it("should fetch all alerts for the current user", async () => {
      const mockAlerts = [
        {
          id: "1",
          user_id: "user1",
          product_name: "Test Product",
          target_price: 100,
          current_price: 90,
          product_url: "https://example.com",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockAlerts,
          error: null,
        }),
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await priceAlertsService.getAlerts();

      expect(supabase.from).toHaveBeenCalledWith("price_alerts");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(result).toEqual(mockAlerts);
    });

    it("should throw error when fetch fails", async () => {
      const mockError = new Error("Database error");

      const mockSelect = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      await expect(priceAlertsService.getAlerts()).rejects.toThrow("Database error");
    });
  });

  describe("createAlert", () => {
    it("should create a new alert", async () => {
      const mockUser = { id: "user1" };
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: mockUser },
      });

      const mockAlert = {
        id: "1",
        user_id: "user1",
        product_name: "New Product",
        target_price: 100,
        product_url: "https://example.com",
        is_active: true,
      });

      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: mockAlert,
          error: null,
        }),
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const input = {
        product_name: "New Product",
        target_price: 100,
        product_url: "https://example.com",
      });

      const result = await priceAlertsService.createAlert(input);

      expect(supabase.from).toHaveBeenCalledWith("price_alerts");
      expect(result).toEqual(mockAlert);
    });

    it("should throw error when user is not authenticated", async () => {
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
      });

      const input = {
        product_name: "New Product",
        target_price: 100,
        product_url: "https://example.com",
      });

      await expect(priceAlertsService.createAlert(input)).rejects.toThrow(
        "User not authenticated"
      );
    });
  });

  describe("deleteAlert", () => {
    it("should delete an alert", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        error: null,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      await priceAlertsService.deleteAlert("1");

      expect(supabase.from).toHaveBeenCalledWith("price_alerts");
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
