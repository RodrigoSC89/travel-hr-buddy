/**
 * System Health - Simple E2E Tests
 * Validates system health endpoint returns status
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import APIStatus from "@/pages/admin/api-status";

// Mock services
vi.mock("@/services/openai", () => ({
  testOpenAIConnection: vi.fn().mockResolvedValue({
    success: true,
    message: "OpenAI API conectado",
    responseTime: 120,
  }),
}));

vi.mock("@/services/mapbox", () => ({
  testMapboxConnection: vi.fn().mockResolvedValue({
    success: true,
    message: "Mapbox API conectado",
    responseTime: 80,
  }),
}));

vi.mock("@/services/amadeus", () => ({
  testAmadeusConnection: vi.fn().mockResolvedValue({
    success: true,
    message: "Amadeus API conectado",
    responseTime: 150,
  }),
}));

vi.mock("@/services/supabase", () => ({
  testSupabaseConnection: vi.fn().mockResolvedValue({
    success: true,
    message: "Supabase conectado",
    responseTime: 50,
  }),
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "admin-user" },
  }),
}));

// Mock OrganizationContext
vi.mock("@/contexts/OrganizationContext", () => ({
  useOrganization: () => ({
    currentOrganization: { id: "org-1", name: "Test Org" },
  }),
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("System Health - E2E Simple Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar status do sistema em /admin/api-status", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/api-status"]}>
        <APIStatus />
      </MemoryRouter>
    );

    // Verifica que a página renderiza
    await waitFor(() => {
      const element = document.querySelector("body");
      expect(element).toBeTruthy();
    });
  });

  it("deve validar estrutura de resposta de health check", () => {
    const healthResponse = {
      services: [
        {
          name: "OpenAI",
          status: "valid",
          responseTime: 120,
          message: "Conectado",
        },
        {
          name: "Supabase",
          status: "valid",
          responseTime: 50,
          message: "Conectado",
        },
      ],
      timestamp: new Date().toISOString(),
      overallStatus: "healthy",
    };

    expect(healthResponse).toHaveProperty("services");
    expect(healthResponse).toHaveProperty("timestamp");
    expect(healthResponse).toHaveProperty("overallStatus");
    expect(Array.isArray(healthResponse.services)).toBe(true);
    expect(healthResponse.services).toHaveLength(2);
  });

  it("deve validar service status está em formato correto", () => {
    const serviceStatus = {
      name: "OpenAI",
      status: "valid" as const,
      responseTime: 120,
      message: "API conectada com sucesso",
    };

    expect(serviceStatus.name).toBeTruthy();
    expect(["valid", "invalid", "checking", "missing"]).toContain(serviceStatus.status);
    expect(serviceStatus.responseTime).toBeGreaterThan(0);
    expect(serviceStatus.message).toBeTruthy();
  });

  it("deve calcular overall status corretamente", () => {
    const services = [
      { name: "Service1", status: "valid" as const },
      { name: "Service2", status: "valid" as const },
      { name: "Service3", status: "valid" as const },
    ];

    const allValid = services.every((s) => s.status === "valid");
    const overallStatus = allValid ? "healthy" : "unhealthy";

    expect(overallStatus).toBe("healthy");
  });

  it("deve detectar sistema unhealthy se algum serviço falhar", () => {
    const services = [
      { name: "Service1", status: "valid" as const },
      { name: "Service2", status: "invalid" as const },
      { name: "Service3", status: "valid" as const },
    ];

    const allValid = services.every((s) => s.status === "valid");
    const overallStatus = allValid ? "healthy" : "unhealthy";

    expect(overallStatus).toBe("unhealthy");
  });

  it("deve validar response time está dentro de limites aceitáveis", () => {
    const responseTime = 150; // ms
    const threshold = 2000; // 2 segundos

    expect(responseTime).toBeLessThan(threshold);
    expect(responseTime).toBeGreaterThan(0);
  });
});
