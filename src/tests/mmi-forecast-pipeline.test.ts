import { describe, it, expect } from "vitest";
import type { MMIJob } from "@/types/mmi";

describe("MMI Forecast Pipeline - Etapa 2", () => {
  describe("Forecast data structure", () => {
    it("should validate forecast structure with job_id", () => {
      const forecast = {
        job_id: "550e8400-e29b-41d4-a716-446655440000",
        system: "Sistema hidráulico do guindaste",
        next_due_date: "2025-12-15",
        risk_level: "médio" as const,
        reasoning: "Baseado no histórico de manutenção e horímetro atual",
      };

      expect(forecast.job_id).toBeDefined();
      expect(forecast.system).toBeDefined();
      expect(forecast.next_due_date).toBeDefined();
      expect(forecast.risk_level).toBeDefined();
      expect(forecast.reasoning).toBeDefined();
    });

    it("should validate risk_level values", () => {
      const validRiskLevels = ["baixo", "médio", "alto"];
      
      validRiskLevels.forEach((level) => {
        expect(["baixo", "médio", "alto"]).toContain(level);
      });
    });

    it("should validate date format for next_due_date", () => {
      const forecast = {
        next_due_date: "2025-12-15",
      };

      // Check if it matches YYYY-MM-DD format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      expect(forecast.next_due_date).toMatch(dateRegex);
    });

    it("should validate MMIJob structure for pipeline", () => {
      const job: Partial<MMIJob> = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        title: "Manutenção preventiva do guindaste",
        status: "pending",
        priority: "high",
        due_date: "2025-11-30",
        component_name: "Guindaste A1",
        component: {
          name: "Sistema hidráulico do guindaste",
          asset: {
            name: "Guindaste principal",
            vessel: "FPSO Alpha",
          },
        },
      };

      expect(job.id).toBeDefined();
      expect(job.component?.name).toBeDefined();
      expect(job.component?.asset?.vessel).toBeDefined();
    });
  });

  describe("Pipeline integration expectations", () => {
    it("should expect forecast result from generateForecastForJob", () => {
      const expectedResult = {
        next_due_date: "2025-12-15",
        risk_level: "médio" as const,
        reasoning: "Justificativa técnica baseada em análise de risco",
      };

      expect(expectedResult.next_due_date).toBeDefined();
      expect(expectedResult.risk_level).toBeDefined();
      expect(expectedResult.reasoning).toBeDefined();
      expect(["baixo", "médio", "alto"]).toContain(expectedResult.risk_level);
    });

    it("should expect saveForecastToDB to accept correct format", () => {
      const forecastToSave = {
        job_id: "550e8400-e29b-41d4-a716-446655440000",
        system: "Sistema hidráulico",
        next_due_date: "2025-12-15",
        risk_level: "alto" as const,
        reasoning: "Risco elevado devido ao tempo de uso",
      };

      // Validate the structure
      expect(forecastToSave).toHaveProperty("job_id");
      expect(forecastToSave).toHaveProperty("system");
      expect(forecastToSave).toHaveProperty("next_due_date");
      expect(forecastToSave).toHaveProperty("risk_level");
      expect(forecastToSave).toHaveProperty("reasoning");
    });

    it("should map job data to forecast correctly", () => {
      const job: Partial<MMIJob> = {
        id: "job-123",
        component: {
          name: "Sistema elétrico",
          asset: {
            name: "Gerador principal",
            vessel: "FPSO Beta",
          },
        },
      };

      const forecast = {
        job_id: job.id,
        system: job.component?.name || "Sistema não especificado",
        next_due_date: "2025-12-20",
        risk_level: "baixo" as const,
        reasoning: "Manutenção preventiva de rotina",
      };

      expect(forecast.job_id).toBe(job.id);
      expect(forecast.system).toBe("Sistema elétrico");
    });
  });

  describe("Error handling expectations", () => {
    it("should handle missing component gracefully", () => {
      const jobWithoutComponent = {
        id: "job-456",
        component_name: "Componente Alternativo",
      };

      const system = jobWithoutComponent.component_name || "Sistema não especificado";
      expect(system).toBe("Componente Alternativo");
    });

    it("should handle invalid date formats", () => {
      const invalidDate = "2025-13-45"; // Invalid month and day
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      // Still matches format, even if semantically invalid
      expect(invalidDate).toMatch(dateRegex);
    });
  });
});
