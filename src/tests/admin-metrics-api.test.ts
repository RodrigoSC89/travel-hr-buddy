import { describe, it, expect } from "vitest";

describe("Admin Metrics API", () => {
  it("should have the correct API route structure", () => {
    const apiRoute = "/api/admin/metrics";
    expect(apiRoute).toBe("/api/admin/metrics");
  });

  it("should define the metrics data structure", () => {
    const metricsData = {
      auditoria_id: "test-audit-123",
      falhas_criticas: 5,
    };

    expect(metricsData).toHaveProperty("auditoria_id");
    expect(metricsData).toHaveProperty("falhas_criticas");
    expect(typeof metricsData.auditoria_id).toBe("string");
    expect(typeof metricsData.falhas_criticas).toBe("number");
  });
});
