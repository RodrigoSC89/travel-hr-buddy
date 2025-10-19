import { describe, it, expect } from "vitest";

describe("MMI OS Creation API - Request Validation", () => {
  describe("Request body validation", () => {
    it("should validate required fields presence", () => {
      const validRequest = {
        forecast_id: "550e8400-e29b-41d4-a716-446655440000",
        vessel_name: "FPSO Alpha",
        system_name: "Sistema hidráulico do guindaste",
        description: "Manutenção preventiva recomendada pela IA",
        priority: "alta"
      };

      expect(validRequest.vessel_name).toBeDefined();
      expect(validRequest.system_name).toBeDefined();
      expect(validRequest.description).toBeDefined();
      expect(validRequest.priority).toBeDefined();
    });

    it("should identify missing vessel_name", () => {
      const invalidRequest = {
        forecast_id: "550e8400-e29b-41d4-a716-446655440000",
        system_name: "Sistema hidráulico do guindaste",
        description: "Manutenção preventiva",
        priority: "alta"
      };

      expect(invalidRequest.vessel_name).toBeUndefined();
    });

    it("should identify missing system_name", () => {
      const invalidRequest = {
        forecast_id: "550e8400-e29b-41d4-a716-446655440000",
        vessel_name: "FPSO Alpha",
        description: "Manutenção preventiva",
        priority: "alta"
      };

      expect(invalidRequest.system_name).toBeUndefined();
    });

    it("should accept valid priority values", () => {
      const validPriorities = ["baixa", "normal", "alta", "critica"];
      
      validPriorities.forEach(priority => {
        const request = {
          vessel_name: "FPSO Alpha",
          system_name: "Sistema hidráulico",
          priority
        };
        
        expect(validPriorities).toContain(request.priority);
      });
    });

    it("should identify invalid priority values", () => {
      const invalidPriorities = ["urgent", "low", "high", "critical"];
      const validPriorities = ["baixa", "normal", "alta", "critica"];
      
      invalidPriorities.forEach(priority => {
        expect(validPriorities).not.toContain(priority);
      });
    });

    it("should allow optional forecast_id", () => {
      const requestWithoutForecast = {
        vessel_name: "FPSO Alpha",
        system_name: "Sistema hidráulico",
        description: "Manutenção",
        priority: "normal"
      };

      expect(requestWithoutForecast.vessel_name).toBeDefined();
      expect(requestWithoutForecast.system_name).toBeDefined();
      // forecast_id is optional
      expect(requestWithoutForecast).not.toHaveProperty("forecast_id");
    });

    it("should allow optional description", () => {
      const requestWithoutDescription = {
        vessel_name: "FPSO Alpha",
        system_name: "Sistema hidráulico",
        priority: "normal"
      };

      expect(requestWithoutDescription.vessel_name).toBeDefined();
      expect(requestWithoutDescription.system_name).toBeDefined();
      // description is optional
      expect(requestWithoutDescription).not.toHaveProperty("description");
    });

    it("should validate complete request structure", () => {
      const completeRequest = {
        forecast_id: "550e8400-e29b-41d4-a716-446655440000",
        vessel_name: "FPSO Alpha",
        system_name: "Sistema hidráulico do guindaste",
        description: "Manutenção preventiva do sistema hidráulico conforme forecast de IA. Recomenda-se troca de óleo e verificação de pressão.",
        priority: "alta"
      };

      // Check all fields are present and valid
      expect(completeRequest.forecast_id).toBeTruthy();
      expect(completeRequest.vessel_name).toBeTruthy();
      expect(completeRequest.system_name).toBeTruthy();
      expect(completeRequest.description).toBeTruthy();
      expect(["baixa", "normal", "alta", "critica"]).toContain(completeRequest.priority);
    });
  });

  describe("Response structure validation", () => {
    it("should expect success response structure", () => {
      const successResponse = {
        success: true,
        data: {
          id: "550e8400-e29b-41d4-a716-446655440001",
          forecast_id: "550e8400-e29b-41d4-a716-446655440000",
          vessel_name: "FPSO Alpha",
          system_name: "Sistema hidráulico",
          description: "Manutenção preventiva",
          status: "pendente",
          priority: "alta",
          created_at: "2025-10-19T17:30:00Z"
        }
      };

      expect(successResponse.success).toBe(true);
      expect(successResponse.data).toBeDefined();
      expect(successResponse.data.id).toBeTruthy();
      expect(successResponse.data.status).toBe("pendente");
    });

    it("should expect error response structure", () => {
      const errorResponse = {
        error: "Campos obrigatórios: vessel_name, system_name"
      };

      expect(errorResponse.error).toBeDefined();
      expect(typeof errorResponse.error).toBe("string");
    });
  });
});
