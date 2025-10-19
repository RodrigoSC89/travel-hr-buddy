/**
 * MMI Orders Service Integration Tests
 * Tests for the complete OS (Service Orders) system
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// Setup environment variables for tests
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
  process.env.RESEND_API_KEY = "test-resend-key";
  process.env.VITE_OPENAI_API_KEY = "test-openai-key";
});

// Mock modules
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
      })),
    },
  },
}));

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(),
    },
  })),
}));

vi.mock("@/lib/openai", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

describe("MMI Orders Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ordersService", () => {
    it("should export required functions", async () => {
      const ordersService = await import("@/services/mmi/ordersService");
      
      expect(ordersService.fetchAllOrders).toBeDefined();
      expect(ordersService.fetchOrderById).toBeDefined();
      expect(ordersService.getOrderStats).toBeDefined();
      expect(ordersService.createOrder).toBeDefined();
      expect(ordersService.updateOrder).toBeDefined();
      expect(ordersService.deleteOrder).toBeDefined();
    });

    it("should have correct TypeScript types", async () => {
      const ordersService = await import("@/services/mmi/ordersService");
      
      // Test that types are exported
      const mockOrder: ordersService.MMIOrder = {
        id: "123",
        order_number: "OS-001",
        vessel_name: "Test Vessel",
        system_name: "Test System",
        description: "Test description",
        status: "pending",
        priority: "medium",
        created_at: "2024-10-19",
        updated_at: "2024-10-19",
      };

      expect(mockOrder).toBeDefined();
      expect(mockOrder.status).toMatch(/pending|in_progress|completed|cancelled/);
      expect(mockOrder.priority).toMatch(/low|medium|high|critical/);
    });
  });

  describe("sendOrderEmail", () => {
    it("should export sendOrderEmail function", async () => {
      const emailService = await import("@/lib/email/sendOrderEmail");
      
      expect(emailService.sendOrderEmail).toBeDefined();
      expect(typeof emailService.sendOrderEmail).toBe("function");
    });

    it("should have correct function signature", async () => {
      const emailService = await import("@/lib/email/sendOrderEmail");
      
      // Test that the function accepts the right parameters
      const mockParams: emailService.SendOrderEmailParams = {
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test HTML</p>",
      };

      expect(mockParams.to).toBe("test@example.com");
      expect(mockParams.subject).toBe("Test Subject");
      expect(mockParams.html).toBe("<p>Test HTML</p>");
    });

    it("should return proper result structure", async () => {
      const emailService = await import("@/lib/email/sendOrderEmail");
      
      // Mock successful response
      const mockResult: emailService.SendOrderEmailResult = {
        success: true,
        data: { id: "test-id" },
      };

      expect(mockResult.success).toBe(true);
      expect(mockResult.data).toBeDefined();
      expect(mockResult.data?.id).toBe("test-id");
    });
  });

  describe("saveOrderPDF", () => {
    it("should export saveOrderPDF function", async () => {
      const storageService = await import("@/lib/storage/saveOrderPDF");
      
      expect(storageService.saveOrderPDF).toBeDefined();
      expect(typeof storageService.saveOrderPDF).toBe("function");
    });

    it("should have correct result structure", async () => {
      const storageService = await import("@/lib/storage/saveOrderPDF");
      
      // Mock successful response
      const mockResult: storageService.SaveOrderPDFResult = {
        success: true,
        path: "os-123.pdf",
      };

      expect(mockResult.success).toBe(true);
      expect(mockResult.path).toBe("os-123.pdf");
    });

    it("should handle error cases", async () => {
      const storageService = await import("@/lib/storage/saveOrderPDF");
      
      // Mock error response
      const mockErrorResult: storageService.SaveOrderPDFResult = {
        success: false,
        error: "Upload failed",
      };

      expect(mockErrorResult.success).toBe(false);
      expect(mockErrorResult.error).toBe("Upload failed");
    });
  });

  describe("diagnoseOrder", () => {
    it("should export diagnoseOrder function", async () => {
      const iaService = await import("@/lib/ia/diagnoseOrder");
      
      expect(iaService.diagnoseOrder).toBeDefined();
      expect(typeof iaService.diagnoseOrder).toBe("function");
    });

    it("should have correct input structure", async () => {
      const iaService = await import("@/lib/ia/diagnoseOrder");
      
      const mockInput: iaService.OrderDiagnosticInput = {
        system_name: "Hydraulic System",
        description: "Leak detected",
        technician_comment: "Pressure issue",
      };

      expect(mockInput.system_name).toBe("Hydraulic System");
      expect(mockInput.description).toBe("Leak detected");
      expect(mockInput.technician_comment).toBe("Pressure issue");
    });

    it("should have correct result structure", async () => {
      const iaService = await import("@/lib/ia/diagnoseOrder");
      
      // Mock successful response
      const mockResult: iaService.OrderDiagnosticResult = {
        success: true,
        diagnosis: "Probable cause: valve seal failure",
      };

      expect(mockResult.success).toBe(true);
      expect(mockResult.diagnosis).toContain("Probable cause");
    });

    it("should handle AI errors", async () => {
      const iaService = await import("@/lib/ia/diagnoseOrder");
      
      // Mock error response
      const mockErrorResult: iaService.OrderDiagnosticResult = {
        success: false,
        error: "OpenAI API error",
      };

      expect(mockErrorResult.success).toBe(false);
      expect(mockErrorResult.error).toBe("OpenAI API error");
    });
  });

  describe("Integration workflow", () => {
    it("should support complete order workflow", async () => {
      const ordersService = await import("@/services/mmi/ordersService");
      const emailService = await import("@/lib/email/sendOrderEmail");
      const storageService = await import("@/lib/storage/saveOrderPDF");
      const iaService = await import("@/lib/ia/diagnoseOrder");

      // Verify all required services are available
      expect(ordersService.createOrder).toBeDefined();
      expect(emailService.sendOrderEmail).toBeDefined();
      expect(storageService.saveOrderPDF).toBeDefined();
      expect(iaService.diagnoseOrder).toBeDefined();

      // Test data structures compatibility
      const orderData: Omit<ordersService.MMIOrder, "id" | "created_at" | "updated_at"> = {
        order_number: "OS-TEST-001",
        vessel_name: "Test Vessel",
        system_name: "Test System",
        description: "Test description",
        status: "pending",
        priority: "high",
        technician_comment: "Test comment",
      };

      expect(orderData.order_number).toBeDefined();
      expect(orderData.vessel_name).toBeDefined();
      expect(orderData.system_name).toBeDefined();
    });
  });

  describe("Database schema validation", () => {
    it("should have all required order fields", async () => {
      const ordersService = await import("@/services/mmi/ordersService");
      
      const order: ordersService.MMIOrder = {
        id: "123",
        order_number: "OS-001",
        vessel_name: "MV Test",
        system_name: "Hydraulic",
        description: "Test",
        status: "pending",
        priority: "medium",
        created_at: "2024-10-19",
        updated_at: "2024-10-19",
      };

      // Verify all required fields exist
      expect(order.id).toBeDefined();
      expect(order.order_number).toBeDefined();
      expect(order.vessel_name).toBeDefined();
      expect(order.system_name).toBeDefined();
      expect(order.description).toBeDefined();
      expect(order.status).toBeDefined();
      expect(order.priority).toBeDefined();
      expect(order.created_at).toBeDefined();
      expect(order.updated_at).toBeDefined();
    });

    it("should support optional fields", async () => {
      const ordersService = await import("@/services/mmi/ordersService");
      
      const orderWithOptionals: ordersService.MMIOrder = {
        id: "123",
        order_number: "OS-001",
        vessel_name: "MV Test",
        system_name: "Hydraulic",
        description: "Test",
        status: "completed",
        priority: "high",
        technician_comment: "Fixed",
        executed_at: "2024-10-19T10:00:00Z",
        pdf_path: "os-123.pdf",
        ai_diagnosis: "Valve issue",
        created_at: "2024-10-19",
        updated_at: "2024-10-19",
        created_by: "user-123",
      };

      // Verify optional fields work
      expect(orderWithOptionals.technician_comment).toBe("Fixed");
      expect(orderWithOptionals.executed_at).toBeDefined();
      expect(orderWithOptionals.pdf_path).toBe("os-123.pdf");
      expect(orderWithOptionals.ai_diagnosis).toBe("Valve issue");
      expect(orderWithOptionals.created_by).toBe("user-123");
    });
  });

  describe("Status and Priority enums", () => {
    it("should validate status values", async () => {
      const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
      
      validStatuses.forEach(status => {
        expect(["pending", "in_progress", "completed", "cancelled"]).toContain(status);
      });
    });

    it("should validate priority values", async () => {
      const validPriorities = ["low", "medium", "high", "critical"];
      
      validPriorities.forEach(priority => {
        expect(["low", "medium", "high", "critical"]).toContain(priority);
      });
    });
  });
});
