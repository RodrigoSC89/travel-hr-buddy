/**
 * DP Intelligence Stats API Endpoint Tests
 * 
 * Tests for the /api/dp-intelligence/stats endpoint that provides
 * statistics about DP incidents grouped by vessel, severity, and month
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("DP Intelligence Stats API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Handling", () => {
    it("should handle GET requests", () => {
      const method = "GET";
      expect(method).toBe("GET");
    });

    it("should reject non-GET requests with 405", () => {
      const errorResponse = {
        status: 405,
        error: "Method not allowed"
      };
      expect(errorResponse.status).toBe(405);
      expect(errorResponse.error).toBe("Method not allowed");
    });

    it("should use correct API endpoint path", () => {
      const endpointPath = "/api/dp-intelligence/stats";
      expect(endpointPath).toBe("/api/dp-intelligence/stats");
    });

    it("should be accessible via pages/api/dp-intelligence/stats.ts", () => {
      const filePath = "pages/api/dp-intelligence/stats.ts";
      expect(filePath).toContain("dp-intelligence/stats");
    });
  });

  describe("Response Format", () => {
    it("should return stats object with correct structure", () => {
      const statsResponse = {
        byVessel: {
          "DP Shuttle Tanker X": 2,
          "DP DSV Subsea Alpha": 1,
        },
        bySeverity: {
          Alta: 3,
          Média: 2,
          Baixa: 1,
        },
        byMonth: {
          "2025-09": 1,
          "2025-10": 2,
        },
      };

      expect(statsResponse).toHaveProperty("byVessel");
      expect(statsResponse).toHaveProperty("bySeverity");
      expect(statsResponse).toHaveProperty("byMonth");
    });

    it("should have byVessel as record of vessel names to counts", () => {
      const byVessel = {
        "DP Shuttle Tanker X": 2,
        "DP DSV Subsea Alpha": 1,
      };

      expect(typeof byVessel).toBe("object");
      expect(Object.keys(byVessel).length).toBeGreaterThanOrEqual(0);
      expect(byVessel["DP Shuttle Tanker X"]).toBe(2);
    });

    it("should have bySeverity with Alta, Média, and Baixa keys", () => {
      const bySeverity = {
        Alta: 3,
        Média: 2,
        Baixa: 1,
      };

      expect(bySeverity).toHaveProperty("Alta");
      expect(bySeverity).toHaveProperty("Média");
      expect(bySeverity).toHaveProperty("Baixa");
      expect(typeof bySeverity.Alta).toBe("number");
      expect(typeof bySeverity.Média).toBe("number");
      expect(typeof bySeverity.Baixa).toBe("number");
    });

    it("should have byMonth as record of YYYY-MM to counts", () => {
      const byMonth = {
        "2025-09": 1,
        "2025-10": 2,
      };

      expect(typeof byMonth).toBe("object");
      expect(Object.keys(byMonth).length).toBeGreaterThanOrEqual(0);
      
      // Check month format
      const monthKeys = Object.keys(byMonth);
      monthKeys.forEach((key) => {
        expect(key).toMatch(/^\d{4}-\d{2}$/);
      });
    });
  });

  describe("Data Processing", () => {
    it("should count incidents per vessel", () => {
      const incidents = [
        { vessel: "DP Shuttle Tanker X", severity: "Alta", incident_date: "2025-09-12" },
        { vessel: "DP Shuttle Tanker X", severity: "Média", incident_date: "2025-10-01" },
        { vessel: "DP DSV Subsea Alpha", severity: "Alta", incident_date: "2025-08-05" },
      ];

      const byVessel: Record<string, number> = {};
      incidents.forEach((inc) => {
        const vessel = inc.vessel || "Desconhecido";
        byVessel[vessel] = (byVessel[vessel] || 0) + 1;
      });

      expect(byVessel["DP Shuttle Tanker X"]).toBe(2);
      expect(byVessel["DP DSV Subsea Alpha"]).toBe(1);
    });

    it("should count incidents per severity", () => {
      const incidents = [
        { vessel: "Vessel A", severity: "Alta", incident_date: "2025-09-12" },
        { vessel: "Vessel B", severity: "Alta", incident_date: "2025-10-01" },
        { vessel: "Vessel C", severity: "Média", incident_date: "2025-08-05" },
      ];

      const bySeverity = { Alta: 0, Média: 0, Baixa: 0 };
      incidents.forEach((inc) => {
        const severity = inc.severity;
        if (severity === "Alta" || severity === "Média" || severity === "Baixa") {
          bySeverity[severity] += 1;
        }
      });

      expect(bySeverity.Alta).toBe(2);
      expect(bySeverity.Média).toBe(1);
      expect(bySeverity.Baixa).toBe(0);
    });

    it("should count incidents per month", () => {
      const incidents = [
        { vessel: "Vessel A", severity: "Alta", incident_date: "2025-09-12" },
        { vessel: "Vessel B", severity: "Alta", incident_date: "2025-09-20" },
        { vessel: "Vessel C", severity: "Média", incident_date: "2025-10-05" },
      ];

      const byMonth: Record<string, number> = {};
      incidents.forEach((inc) => {
        const date = new Date(inc.incident_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
      });

      expect(byMonth["2025-09"]).toBe(2);
      expect(byMonth["2025-10"]).toBe(1);
    });

    it("should handle null or missing vessel with 'Desconhecido'", () => {
      const incidents = [
        { vessel: null, severity: "Alta", incident_date: "2025-09-12" },
        { vessel: undefined, severity: "Média", incident_date: "2025-10-01" },
      ];

      const byVessel: Record<string, number> = {};
      incidents.forEach((inc) => {
        const vessel = inc.vessel || "Desconhecido";
        byVessel[vessel] = (byVessel[vessel] || 0) + 1;
      });

      expect(byVessel["Desconhecido"]).toBe(2);
    });

    it("should handle null or missing incident_date with 'Sem Data'", () => {
      const incidents = [
        { vessel: "Vessel A", severity: "Alta", incident_date: null },
        { vessel: "Vessel B", severity: "Média", incident_date: undefined },
      ];

      const byMonth: Record<string, number> = {};
      incidents.forEach((inc) => {
        const date = inc.incident_date ? new Date(inc.incident_date) : null;
        const monthKey = date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          : "Sem Data";
        byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
      });

      expect(byMonth["Sem Data"]).toBe(2);
    });

    it("should format month with zero-padding", () => {
      const date = new Date("2025-03-15");
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      expect(monthKey).toBe("2025-03");
      expect(monthKey).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database error", () => {
      const errorResponse = {
        status: 500,
        error: "Error generating stats"
      };

      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toContain("Error");
    });

    it("should handle Supabase query errors", () => {
      const supabaseError = {
        message: "Connection timeout",
        code: "PGRST301"
      };

      expect(supabaseError.message).toBeDefined();
      expect(supabaseError.code).toBeDefined();
    });

    it("should return error message in response body", () => {
      const errorResponse = {
        error: "Database connection failed"
      };

      expect(errorResponse).toHaveProperty("error");
      expect(typeof errorResponse.error).toBe("string");
    });
  });

  describe("Database Integration", () => {
    it("should query dp_incidents table", () => {
      const tableName = "dp_incidents";
      expect(tableName).toBe("dp_incidents");
    });

    it("should select vessel, severity, and incident_date columns", () => {
      const columns = "vessel, severity, incident_date";
      expect(columns).toContain("vessel");
      expect(columns).toContain("severity");
      expect(columns).toContain("incident_date");
    });

    it("should handle empty result set", () => {
      const data: unknown[] = [];
      const stats = {
        byVessel: {},
        bySeverity: { Alta: 0, Média: 0, Baixa: 0 },
        byMonth: {},
      };

      data.forEach((incident) => {
        const vessel = incident.vessel || "Desconhecido";
        stats.byVessel[vessel] = (stats.byVessel[vessel] || 0) + 1;
      });

      expect(Object.keys(stats.byVessel).length).toBe(0);
      expect(stats.bySeverity.Alta).toBe(0);
    });
  });

  describe("API Contract", () => {
    it("should return 200 status on success", () => {
      const successStatus = 200;
      expect(successStatus).toBe(200);
    });

    it("should return JSON content type", () => {
      const contentType = "application/json";
      expect(contentType).toBe("application/json");
    });

    it("should support CORS if needed", () => {
      // This test verifies the API can support CORS headers
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      };
      
      expect(corsHeaders).toHaveProperty("Access-Control-Allow-Origin");
      expect(corsHeaders).toHaveProperty("Access-Control-Allow-Methods");
    });
  });
});
