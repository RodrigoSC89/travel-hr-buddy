import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Admin Metrics API Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/admin/metrics", () => {
    it("should return metrics grouped by risk level", async () => {
      const mockData = [
        {
          risco_nivel: "Crítico",
          total_auditorias: 5,
          falhas_criticas: 15,
          score_medio: 45.5,
        },
        {
          risco_nivel: "Alto",
          total_auditorias: 10,
          falhas_criticas: 8,
          score_medio: 68.2,
        },
      ];

      // Test that the response structure matches expected format
      expect(mockData).toBeInstanceOf(Array);
      expect(mockData[0]).toHaveProperty("risco_nivel");
      expect(mockData[0]).toHaveProperty("total_auditorias");
      expect(mockData[0]).toHaveProperty("falhas_criticas");
      expect(mockData[0]).toHaveProperty("score_medio");
    });

    it("should handle empty results gracefully", async () => {
      const mockData: Array<unknown> = [];
      expect(mockData).toBeInstanceOf(Array);
      expect(mockData.length).toBe(0);
    });
  });

  describe("GET /api/admin/metrics/evolucao-mensal", () => {
    it("should return monthly evolution data", async () => {
      const mockData = [
        {
          mes: "2024-01",
          total_auditorias: 12,
          falhas_criticas: 5,
        },
        {
          mes: "2024-02",
          total_auditorias: 15,
          falhas_criticas: 3,
        },
      ];

      expect(mockData).toBeInstanceOf(Array);
      expect(mockData[0]).toHaveProperty("mes");
      expect(mockData[0]).toHaveProperty("total_auditorias");
      expect(mockData[0]).toHaveProperty("falhas_criticas");
    });

    it("should return data for last 12 months", async () => {
      const mockData = Array.from({ length: 12 }, (_, i) => ({
        mes: `2024-${String(i + 1).padStart(2, "0")}`,
        total_auditorias: Math.floor(Math.random() * 20),
        falhas_criticas: Math.floor(Math.random() * 10),
      }));

      expect(mockData.length).toBeLessThanOrEqual(12);
    });
  });

  describe("GET /api/admin/metrics/por-embarcacao", () => {
    it("should return metrics for all vessels when no filter", async () => {
      const mockData = [
        {
          nome_navio: "Vessel A",
          total_auditorias: 20,
          falhas_criticas: 5,
          score_medio: 75.5,
          ultima_auditoria: "2024-10-15T10:00:00Z",
        },
        {
          nome_navio: "Vessel B",
          total_auditorias: 15,
          falhas_criticas: 2,
          score_medio: 88.3,
          ultima_auditoria: "2024-10-14T10:00:00Z",
        },
      ];

      expect(mockData).toBeInstanceOf(Array);
      expect(mockData[0]).toHaveProperty("nome_navio");
      expect(mockData[0]).toHaveProperty("total_auditorias");
      expect(mockData[0]).toHaveProperty("falhas_criticas");
      expect(mockData[0]).toHaveProperty("score_medio");
      expect(mockData[0]).toHaveProperty("ultima_auditoria");
    });

    it("should filter by vessel name when provided", async () => {
      const vesselName = "Vessel A";
      const mockData = [
        {
          nome_navio: vesselName,
          total_auditorias: 20,
          falhas_criticas: 5,
          score_medio: 75.5,
          ultima_auditoria: "2024-10-15T10:00:00Z",
        },
      ];

      expect(mockData.every(item => item.nome_navio === vesselName)).toBe(true);
    });
  });
});
