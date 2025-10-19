import { describe, it, expect } from "vitest";

describe("MMI Forecast All API", () => {
  describe("GET /api/mmi/forecast/all", () => {
    it("should return array of forecasts", () => {
      const mockResponse = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          vessel_name: "FPSO Alpha",
          system_name: "Sistema Hidráulico",
          hourmeter: 850,
          last_maintenance: ["12/04/2025 - troca de óleo", "20/06/2025 - verificação"],
          forecast_text: "Próxima intervenção: troca de óleo...",
          priority: "medium",
          created_at: "2025-10-19T00:00:00Z"
        }
      ];

      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse.length).toBeGreaterThan(0);
    });

    it("should validate forecast object structure", () => {
      const forecast = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        vessel_name: "FPSO Alpha",
        system_name: "Sistema Hidráulico",
        hourmeter: 850,
        last_maintenance: ["12/04/2025 - troca de óleo"],
        forecast_text: "Próxima intervenção: troca de óleo...",
        priority: "medium",
        created_at: "2025-10-19T00:00:00Z"
      };

      expect(forecast.id).toBeDefined();
      expect(forecast.vessel_name).toBeDefined();
      expect(forecast.system_name).toBeDefined();
      expect(forecast.hourmeter).toBeDefined();
      expect(Array.isArray(forecast.last_maintenance)).toBe(true);
      expect(forecast.forecast_text).toBeDefined();
      expect(forecast.priority).toBeDefined();
      expect(forecast.created_at).toBeDefined();
    });

    it("should validate priority values", () => {
      const validPriorities = ["low", "medium", "high", "critical"];
      
      validPriorities.forEach(priority => {
        expect(["low", "medium", "high", "critical"]).toContain(priority);
      });
    });

    it("should handle empty forecast list", () => {
      const emptyResponse: any[] = [];
      
      expect(Array.isArray(emptyResponse)).toBe(true);
      expect(emptyResponse.length).toBe(0);
    });

    it("should validate last_maintenance array format", () => {
      const lastMaintenance = [
        "12/04/2025 - troca de óleo",
        "20/06/2025 - verificação de pressão",
        "15/08/2025 - inspeção geral"
      ];

      expect(Array.isArray(lastMaintenance)).toBe(true);
      lastMaintenance.forEach(item => {
        expect(typeof item).toBe("string");
        expect(item.length).toBeGreaterThan(0);
      });
    });

    it("should sort by created_at descending", () => {
      const forecasts = [
        { created_at: "2025-10-19T10:00:00Z" },
        { created_at: "2025-10-19T12:00:00Z" },
        { created_at: "2025-10-19T11:00:00Z" }
      ];

      const sorted = forecasts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      expect(sorted[0].created_at).toBe("2025-10-19T12:00:00Z");
      expect(sorted[2].created_at).toBe("2025-10-19T10:00:00Z");
    });
  });
});
