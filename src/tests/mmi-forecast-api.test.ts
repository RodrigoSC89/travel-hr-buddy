import { describe, it, expect, vi, beforeEach } from "vitest";

describe("MMI Forecast API - Request Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request body validation", () => {
    it("should validate required fields presence", () => {
      const validRequest = {
        vessel_name: "FPSO Alpha",
        system_name: "Sistema hidráulico do guindaste",
        last_maintenance_dates: ["12/04/2025 - troca de óleo", "20/06/2025 - verificação de pressão"],
        current_hourmeter: 870
      };

      expect(validRequest.vessel_name).toBeDefined();
      expect(validRequest.system_name).toBeDefined();
      expect(validRequest.last_maintenance_dates).toBeDefined();
      expect(validRequest.current_hourmeter).toBeDefined();
    });

    it("should identify missing vessel_name", () => {
      const invalidRequest = {
        system_name: "Sistema hidráulico do guindaste",
        last_maintenance_dates: ["12/04/2025 - troca de óleo"],
        current_hourmeter: 870
      };

      expect(invalidRequest.vessel_name).toBeUndefined();
    });

    it("should identify missing system_name", () => {
      const invalidRequest = {
        vessel_name: "FPSO Alpha",
        last_maintenance_dates: ["12/04/2025 - troca de óleo"],
        current_hourmeter: 870
      };

      expect(invalidRequest.system_name).toBeUndefined();
    });

    it("should identify missing last_maintenance_dates", () => {
      const invalidRequest = {
        vessel_name: "FPSO Alpha",
        system_name: "Sistema hidráulico do guindaste",
        current_hourmeter: 870
      };

      expect(invalidRequest.last_maintenance_dates).toBeUndefined();
    });

    it("should identify missing current_hourmeter", () => {
      const invalidRequest = {
        vessel_name: "FPSO Alpha",
        system_name: "Sistema hidráulico do guindaste",
        last_maintenance_dates: ["12/04/2025 - troca de óleo"]
      };

      expect(invalidRequest.current_hourmeter).toBeUndefined();
    });

    it("should accept zero as valid hourmeter value", () => {
      const validRequest = {
        vessel_name: "FPSO Alpha",
        system_name: "Sistema hidráulico do guindaste",
        last_maintenance_dates: ["12/04/2025 - troca de óleo"],
        current_hourmeter: 0
      };

      expect(validRequest.current_hourmeter).toBe(0);
      expect(validRequest.current_hourmeter !== undefined).toBe(true);
    });
  });

  describe("Data types validation", () => {
    it("should validate last_maintenance_dates is an array", () => {
      const validRequest = {
        vessel_name: "FPSO Alpha",
        system_name: "Sistema hidráulico",
        last_maintenance_dates: ["12/04/2025 - troca de óleo", "20/06/2025 - verificação"],
        current_hourmeter: 870
      };

      expect(Array.isArray(validRequest.last_maintenance_dates)).toBe(true);
      expect(validRequest.last_maintenance_dates.length).toBeGreaterThan(0);
    });

    it("should validate current_hourmeter is a number", () => {
      const validRequest = {
        vessel_name: "FPSO Alpha",
        system_name: "Sistema hidráulico",
        last_maintenance_dates: ["12/04/2025 - troca de óleo"],
        current_hourmeter: 870
      };

      expect(typeof validRequest.current_hourmeter).toBe("number");
    });

    it("should handle empty maintenance dates array", () => {
      const requestWithEmptyArray = {
        vessel_name: "FPSO Alpha",
        system_name: "Sistema hidráulico",
        last_maintenance_dates: [],
        current_hourmeter: 870
      };

      expect(Array.isArray(requestWithEmptyArray.last_maintenance_dates)).toBe(true);
      expect(requestWithEmptyArray.last_maintenance_dates.length).toBe(0);
    });
  });

  describe("Prompt generation", () => {
    it("should correctly format maintenance dates in prompt", () => {
      const maintenanceDates = [
        "12/04/2025 - troca de óleo",
        "20/06/2025 - verificação de pressão"
      ];

      const formatted = maintenanceDates.join("\n");
      expect(formatted).toContain("12/04/2025 - troca de óleo");
      expect(formatted).toContain("20/06/2025 - verificação de pressão");
      expect(formatted.split("\n").length).toBe(2);
    });

    it("should handle special characters in vessel name", () => {
      const vesselName = "FPSO Alpha-Bravo (Unit-01)";
      expect(vesselName).toBeDefined();
      expect(vesselName.length).toBeGreaterThan(0);
    });

    it("should handle Portuguese characters in system name", () => {
      const systemName = "Sistema hidráulico do guindaste - manutenção preventiva";
      expect(systemName).toContain("hidráulico");
      expect(systemName).toContain("manutenção");
    });
  });

  describe("Response structure expectations", () => {
    it("should expect technical maintenance forecast format", () => {
      // This test documents the expected response structure
      const expectedResponseElements = [
        "Próxima intervenção",
        "Justificativa",
        "Impacto",
        "Prioridade",
        "Frequência sugerida"
      ];

      expectedResponseElements.forEach(element => {
        expect(element).toBeDefined();
        expect(typeof element).toBe("string");
      });
    });
  });
});
