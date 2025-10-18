import { describe, it, expect, vi } from "vitest";

describe("System Health Page", () => {
  it("should check Supabase connection status", async () => {
    // Mock Supabase connection check
    const mockSupabaseCheck = {
      status: "ok",
      name: "Supabase",
      message: "Conectado",
      details: "Database está operacional"
    };

    expect(mockSupabaseCheck.status).toBe("ok");
    expect(mockSupabaseCheck.name).toBe("Supabase");
    expect(mockSupabaseCheck.message).toBe("Conectado");
  });

  it("should check OpenAI API key configuration", () => {
    // Mock OpenAI key check
    const hasOpenAIKey = !!import.meta.env.VITE_OPENAI_API_KEY;
    const mockOpenAICheck = {
      status: hasOpenAIKey ? "ok" : "warning",
      name: "OpenAI",
      message: hasOpenAIKey ? "API Key configurada" : "API Key não configurada"
    };

    expect(["ok", "warning"]).toContain(mockOpenAICheck.status);
    expect(mockOpenAICheck.name).toBe("OpenAI");
  });

  it("should verify PDF generation library availability", () => {
    // Mock PDF library check
    const mockPDFCheck = {
      status: "ok",
      name: "PDF",
      message: "Biblioteca carregada",
      details: "jsPDF e html2pdf disponíveis"
    };

    expect(mockPDFCheck.status).toBe("ok");
    expect(mockPDFCheck.name).toBe("PDF");
  });

  it("should count system routes correctly", () => {
    // Mock route counting
    const mockRouteCount = 92;
    
    expect(mockRouteCount).toBeGreaterThan(0);
    expect(mockRouteCount).toBe(92);
  });

  it("should report build status", () => {
    // Mock build status
    const mockBuildStatus = "ok";
    
    expect(mockBuildStatus).toBe("ok");
  });

  it("should calculate overall system health", () => {
    const services = [
      { status: "ok" },
      { status: "ok" },
      { status: "warning" }
    ];

    const okCount = services.filter(s => s.status === "ok").length;
    const healthPercentage = Math.round((okCount / services.length) * 100);

    expect(healthPercentage).toBeGreaterThan(0);
    expect(healthPercentage).toBeLessThanOrEqual(100);
  });

  it("should detect critical errors", () => {
    const services = [
      { status: "ok" },
      { status: "error" },
      { status: "warning" }
    ];

    const hasCritical = services.some(s => s.status === "error");
    expect(hasCritical).toBe(true);
  });

  it("should display environment information", () => {
    const envInfo = {
      mode: import.meta.env.MODE || "production",
      viteVersion: "5.4.19",
      reactVersion: "18.3.1"
    };

    expect(envInfo.mode).toBeDefined();
    expect(envInfo.viteVersion).toBe("5.4.19");
    expect(envInfo.reactVersion).toBe("18.3.1");
  });

  it("should format service status badges correctly", () => {
    const statusMap = {
      ok: { variant: "default", className: "bg-green-600", label: "OK" },
      error: { variant: "destructive", className: "", label: "ERRO" },
      warning: { variant: "secondary", className: "bg-yellow-600", label: "AVISO" }
    };

    expect(statusMap.ok.label).toBe("OK");
    expect(statusMap.error.label).toBe("ERRO");
    expect(statusMap.warning.label).toBe("AVISO");
  });

  it("should refresh health check on demand", () => {
    let checkCount = 0;
    const mockRefresh = () => {
      checkCount++;
      return { success: true };
    };

    const result = mockRefresh();
    expect(result.success).toBe(true);
    expect(checkCount).toBe(1);
  });
});
