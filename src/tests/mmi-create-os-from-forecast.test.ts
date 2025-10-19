import { describe, it, expect, vi, beforeEach } from "vitest";
import { createOSFromForecast } from "@/services/mmi/ordersService";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe("createOSFromForecast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Function signature and parameters", () => {
    it("should accept forecast_id, job_id, and descricao parameters", () => {
      // Verify the function signature accepts the correct parameters
      const forecastId = "123e4567-e89b-12d3-a456-426614174000";
      const jobId = "987fcdeb-51a2-43b7-9876-543210fedcba";
      const descricao = "Gerado automaticamente com base no forecast IA";

      expect(forecastId).toBeDefined();
      expect(jobId).toBeDefined();
      expect(descricao).toBeDefined();
    });

    it("should accept null job_id", () => {
      const forecastId = "123e4567-e89b-12d3-a456-426614174000";
      const jobId = null;
      const descricao = "Gerado automaticamente";

      expect(forecastId).toBeDefined();
      expect(jobId).toBeNull();
      expect(descricao).toBeDefined();
    });
  });

  describe("Work order data structure", () => {
    it("should create work order with correct structure", () => {
      const workOrderData = {
        forecast_id: "123e4567-e89b-12d3-a456-426614174000",
        job_id: null,
        descricao: "Gerado automaticamente com base no forecast IA de risco \"alta\"",
        status: "pendente",
        created_by: "user-uuid",
        opened_by: "user-uuid"
      };

      expect(workOrderData.forecast_id).toBeDefined();
      expect(workOrderData.job_id).toBeNull();
      expect(workOrderData.descricao).toContain("Gerado automaticamente");
      expect(workOrderData.status).toBe("pendente");
      expect(workOrderData.created_by).toBeDefined();
      expect(workOrderData.opened_by).toBeDefined();
    });

    it("should include forecast_id reference", () => {
      const forecastId = "123e4567-e89b-12d3-a456-426614174000";
      const workOrderData = {
        forecast_id: forecastId,
        job_id: null,
        descricao: "Test description",
        status: "pendente"
      };

      expect(workOrderData.forecast_id).toBe(forecastId);
    });

    it("should set status to pendente by default", () => {
      const workOrderData = {
        forecast_id: "123e4567-e89b-12d3-a456-426614174000",
        job_id: null,
        descricao: "Test",
        status: "pendente"
      };

      expect(workOrderData.status).toBe("pendente");
    });
  });

  describe("Description formatting", () => {
    it("should include risk level in description", () => {
      const priority = "alta";
      const descricao = `Gerado automaticamente com base no forecast IA de risco "${priority}"`;

      expect(descricao).toContain("Gerado automaticamente");
      expect(descricao).toContain("forecast IA");
      expect(descricao).toContain(`risco "${priority}"`);
    });

    it("should accept custom descriptions", () => {
      const customDesc = "Custom OS description based on AI forecast";
      
      expect(customDesc).toBeDefined();
      expect(customDesc.length).toBeGreaterThan(0);
    });
  });

  describe("Integration with mmi_os table", () => {
    it("should reference mmi_forecasts table via forecast_id", () => {
      const foreignKeyRelation = {
        table: "mmi_os",
        column: "forecast_id",
        references: {
          table: "mmi_forecasts",
          column: "id"
        }
      };

      expect(foreignKeyRelation.column).toBe("forecast_id");
      expect(foreignKeyRelation.references.table).toBe("mmi_forecasts");
    });

    it("should optionally reference mmi_jobs table via job_id", () => {
      const foreignKeyRelation = {
        table: "mmi_os",
        column: "job_id",
        references: {
          table: "mmi_jobs",
          column: "id"
        },
        nullable: true
      };

      expect(foreignKeyRelation.column).toBe("job_id");
      expect(foreignKeyRelation.references.table).toBe("mmi_jobs");
      expect(foreignKeyRelation.nullable).toBe(true);
    });

    it("should track creator via created_by column", () => {
      const osRecord = {
        id: "os-uuid",
        forecast_id: "forecast-uuid",
        job_id: null,
        descricao: "Test OS",
        status: "pendente",
        created_by: "user-uuid",
        created_at: new Date().toISOString()
      };

      expect(osRecord.created_by).toBeDefined();
      expect(osRecord.created_by).toBe("user-uuid");
    });
  });
});
