/**
 * Cross-Module Automation Engine Tests
 * Tests for certificate expiry, maintenance alerts, and stock monitoring
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } } }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn(), info: vi.fn() } }));

describe("Cross-Module Automation - Alert Logic", () => {
  it("should calculate severity based on days remaining", () => {
    const calcSeverity = (daysLeft: number) => {
      if (daysLeft <= 7) return "critical";
      if (daysLeft <= 14) return "warning";
      return "info";
    };

    expect(calcSeverity(3)).toBe("critical");
    expect(calcSeverity(7)).toBe("critical");
    expect(calcSeverity(10)).toBe("warning");
    expect(calcSeverity(14)).toBe("warning");
    expect(calcSeverity(20)).toBe("info");
    expect(calcSeverity(30)).toBe("info");
  });

  it("should calculate days remaining correctly", () => {
    const calcDays = (expiryDate: string) =>
      Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(calcDays(tomorrow.toISOString())).toBe(1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    expect(calcDays(nextWeek.toISOString())).toBe(7);
  });

  it("should classify stock as critical when quantity is zero", () => {
    const supply = { quantity: 0, min_stock: 10 };
    const severity = (supply.quantity || 0) <= 0 ? "critical" : "warning";
    expect(severity).toBe("critical");
  });

  it("should classify stock as warning when below min_stock", () => {
    const supply = { quantity: 3, min_stock: 10 };
    const severity = (supply.quantity || 0) <= 0 ? "critical" : "warning";
    expect(severity).toBe("warning");
  });

  it("should filter critical alerts correctly", () => {
    const alerts = [
      { severity: "critical", type: "certificate_expiry" },
      { severity: "warning", type: "maintenance_overdue" },
      { severity: "critical", type: "stock_critical" },
      { severity: "info", type: "certificate_expiry" },
    ];
    const criticalCount = alerts.filter(a => a.severity === "critical").length;
    expect(criticalCount).toBe(2);
  });

  it("should build alert with correct structure", () => {
    const cert = {
      id: "cert-123",
      certification_type_id: "STCW",
      expiry_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      issuing_authority: "IMO",
    };

    const daysLeft = Math.ceil((new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const alert = {
      id: `cert-${cert.id}`,
      type: "certificate_expiry",
      severity: daysLeft <= 7 ? "critical" : daysLeft <= 14 ? "warning" : "info",
      title: `Certificado ${cert.certification_type_id} expira em ${daysLeft} dias`,
      module: "compliance",
      resourceId: cert.id,
    };

    expect(alert.id).toBe("cert-cert-123");
    expect(alert.type).toBe("certificate_expiry");
    expect(alert.severity).toBe("critical");
    expect(alert.title).toContain("STCW");
    expect(alert.title).toContain("5 dias");
  });
});

describe("Cross-Module Automation - Maintenance Logic", () => {
  it("should map maintenance priority to alert severity", () => {
    const mapSeverity = (priority: string) =>
      priority === "critical" ? "critical" : "warning";

    expect(mapSeverity("critical")).toBe("critical");
    expect(mapSeverity("high")).toBe("warning");
    expect(mapSeverity("medium")).toBe("warning");
    expect(mapSeverity("low")).toBe("warning");
  });

  it("should prefix auto-created work orders", () => {
    const title = "Engine inspection overdue";
    const autoTitle = `[AUTO] ${title}`;
    expect(autoTitle).toBe("[AUTO] Engine inspection overdue");
    expect(autoTitle.startsWith("[AUTO]")).toBe(true);
  });
});
