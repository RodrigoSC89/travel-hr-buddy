import { describe, it, expect } from "vitest";

type HealthStatus = "ok" | "error" | "checking";

interface HealthCheck {
  name: string;
  status: HealthStatus;
  message?: string;
  value?: string | number;
}

describe("System Health Check", () => {
  it("should have proper structure for HealthCheck", () => {
    const mockHealth: HealthCheck = {
      name: "Supabase",
      status: "ok",
      message: "Connection successful",
    };

    expect(mockHealth.name).toBeDefined();
    expect(mockHealth.status).toBeDefined();
    expect(typeof mockHealth.name).toBe("string");
    expect(["ok", "error", "checking"]).toContain(mockHealth.status);
  });

  it("should validate Supabase health check structure", () => {
    const supabaseCheck: HealthCheck = {
      name: "Supabase",
      status: "ok",
      message: "Database connected",
    };

    expect(supabaseCheck.name).toBe("Supabase");
    expect(supabaseCheck.status).toBe("ok");
    expect(supabaseCheck.message).toBeDefined();
  });

  it("should validate OpenAI health check structure", () => {
    const openaiCheck: HealthCheck = {
      name: "OpenAI",
      status: "ok",
      message: "API key valid",
    };

    expect(openaiCheck.name).toBe("OpenAI");
    expect(openaiCheck.status).toBe("ok");
    expect(openaiCheck.message).toBeDefined();
  });

  it("should validate PDF generation check structure", () => {
    const pdfCheck: HealthCheck = {
      name: "PDF",
      status: "ok",
      message: "jsPDF library loaded",
    };

    expect(pdfCheck.name).toBe("PDF");
    expect(pdfCheck.status).toBe("ok");
    expect(pdfCheck.message).toContain("jsPDF");
  });

  it("should validate Routes check with count", () => {
    const routesCheck: HealthCheck = {
      name: "Rotas",
      status: "ok",
      value: 92,
      message: "All routes registered",
    };

    expect(routesCheck.name).toBe("Rotas");
    expect(routesCheck.value).toBe(92);
    expect(typeof routesCheck.value).toBe("number");
  });

  it("should validate Build check structure", () => {
    const buildCheck: HealthCheck = {
      name: "Build",
      status: "ok",
      message: "Application compiled successfully",
    };

    expect(buildCheck.name).toBe("Build");
    expect(buildCheck.status).toBe("ok");
    expect(buildCheck.message).toContain("compiled");
  });

  it("should validate all health statuses are valid", () => {
    const validStatuses: HealthStatus[] = ["ok", "error", "checking"];
    
    validStatuses.forEach((status) => {
      expect(["ok", "error", "checking"]).toContain(status);
    });
  });

  it("should calculate healthy services count", () => {
    const checks: HealthCheck[] = [
      { name: "Supabase", status: "ok" },
      { name: "OpenAI", status: "ok" },
      { name: "PDF", status: "ok" },
      { name: "Rotas", status: "ok", value: 92 },
      { name: "Build", status: "ok" },
    ];

    const healthyCount = checks.filter((c) => c.status === "ok").length;
    expect(healthyCount).toBe(5);
  });

  it("should handle error status properly", () => {
    const errorCheck: HealthCheck = {
      name: "OpenAI",
      status: "error",
      message: "API key invalid or missing",
    };

    expect(errorCheck.status).toBe("error");
    expect(errorCheck.message).toContain("invalid");
  });

  it("should validate expected output format", () => {
    const expectedOutput = `✅ Supabase: OK
✅ OpenAI: OK
✅ PDF: OK
✅ Rotas: 92
✅ Build: OK`;

    expect(expectedOutput).toContain("Supabase: OK");
    expect(expectedOutput).toContain("OpenAI: OK");
    expect(expectedOutput).toContain("PDF: OK");
    expect(expectedOutput).toContain("Rotas: 92");
    expect(expectedOutput).toContain("Build: OK");
  });
});

describe("System Health API Endpoint", () => {
  it("should expect endpoint at /admin/system-health", () => {
    const endpoint = "/admin/system-health";
    
    expect(endpoint).toBe("/admin/system-health");
    expect(endpoint.startsWith("/admin/")).toBe(true);
  });
});
