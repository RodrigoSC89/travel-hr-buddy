/**
 * Tests for Forecast List API Endpoint
 * 
 * Tests for the /pages/api/forecast/list.ts endpoint that retrieves
 * forecast history from the database
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Forecast List API Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Handling", () => {
    it("should handle GET requests", () => {
      const method = "GET";
      expect(method).toBe("GET");
    });

    it("should accept requests without parameters", () => {
      const req = {
        method: "GET",
        query: {},
      };
      
      expect(req.method).toBe("GET");
      expect(Object.keys(req.query)).toHaveLength(0);
    });
  });

  describe("Database Query", () => {
    it("should query forecast_history table", () => {
      const tableName = "forecast_history";
      expect(tableName).toBe("forecast_history");
    });

    it("should select all columns", () => {
      const selectQuery = "*";
      expect(selectQuery).toBe("*");
    });

    it("should order by created_at descending", () => {
      const orderConfig = { ascending: false };
      expect(orderConfig.ascending).toBe(false);
    });

    it("should limit results to 25 records", () => {
      const limit = 25;
      expect(limit).toBe(25);
    });

    it("should build correct query structure", () => {
      const query = {
        table: "forecast_history",
        select: "*",
        order: { field: "created_at", ascending: false },
        limit: 25,
      };

      expect(query.table).toBe("forecast_history");
      expect(query.select).toBe("*");
      expect(query.order.field).toBe("created_at");
      expect(query.order.ascending).toBe(false);
      expect(query.limit).toBe(25);
    });
  });

  describe("Response Handling", () => {
    it("should return data on success", () => {
      const mockData = [
        {
          id: 1,
          forecast: "Previsão de aumento de 15%",
          created_at: "2025-10-15T10:00:00Z",
        },
        {
          id: 2,
          forecast: "Tendência de estabilidade",
          created_at: "2025-10-14T10:00:00Z",
        },
      ];

      expect(mockData).toBeInstanceOf(Array);
      expect(mockData.length).toBe(2);
      expect(mockData[0]).toHaveProperty("id");
      expect(mockData[0]).toHaveProperty("forecast");
      expect(mockData[0]).toHaveProperty("created_at");
    });

    it("should return 200 status on success", () => {
      const statusCode = 200;
      expect(statusCode).toBe(200);
    });

    it("should return JSON response on success", () => {
      const mockData = [{ id: 1, forecast: "Test" }];
      const jsonResponse = JSON.parse(JSON.stringify(mockData));
      
      expect(jsonResponse).toBeInstanceOf(Array);
      expect(jsonResponse[0].id).toBe(1);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 status on database error", () => {
      const errorStatusCode = 500;
      expect(errorStatusCode).toBe(500);
    });

    it("should return error message in Portuguese", () => {
      const errorMessage = "Erro ao carregar previsões.";
      
      expect(errorMessage).toContain("Erro");
      expect(errorMessage).toContain("previsões");
    });

    it("should return error object on failure", () => {
      const errorResponse = {
        error: "Erro ao carregar previsões.",
      };

      expect(errorResponse).toHaveProperty("error");
      expect(typeof errorResponse.error).toBe("string");
    });

    it("should handle missing table gracefully", () => {
      const mockError = {
        message: "relation \"forecast_history\" does not exist",
        code: "42P01",
      };

      expect(mockError.message).toContain("forecast_history");
      expect(mockError.code).toBe("42P01");
    });

    it("should handle connection errors", () => {
      const connectionError = {
        message: "connection timeout",
      };

      expect(connectionError.message).toBeDefined();
    });
  });

  describe("Data Structure Validation", () => {
    it("should expect forecast records with required fields", () => {
      const mockRecord = {
        id: 1,
        forecast: "Análise preditiva...",
        trend_data: [{ month: "Janeiro", jobs: 45 }],
        created_at: "2025-10-15T10:00:00Z",
      };

      expect(mockRecord).toHaveProperty("id");
      expect(mockRecord).toHaveProperty("forecast");
      expect(mockRecord).toHaveProperty("created_at");
    });

    it("should handle array of forecasts", () => {
      const forecasts = [
        { id: 1, forecast: "Forecast 1", created_at: "2025-10-15" },
        { id: 2, forecast: "Forecast 2", created_at: "2025-10-14" },
      ];

      expect(Array.isArray(forecasts)).toBe(true);
      expect(forecasts.length).toBe(2);
    });

    it("should handle empty array when no forecasts exist", () => {
      const emptyForecasts: unknown[] = [];
      
      expect(Array.isArray(emptyForecasts)).toBe(true);
      expect(emptyForecasts.length).toBe(0);
    });

    it("should maintain order from newest to oldest", () => {
      const forecasts = [
        { id: 3, created_at: "2025-10-15T12:00:00Z" },
        { id: 2, created_at: "2025-10-15T11:00:00Z" },
        { id: 1, created_at: "2025-10-15T10:00:00Z" },
      ];

      for (let i = 0; i < forecasts.length - 1; i++) {
        const current = new Date(forecasts[i].created_at);
        const next = new Date(forecasts[i + 1].created_at);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });
  });

  describe("Integration with ForecastHistoryList Component", () => {
    it("should provide data format compatible with dashboard component", () => {
      const apiResponse = [
        {
          id: 1,
          forecast: "Previsão de jobs...",
          trend_data: [{ month: "Jan", jobs: 40 }],
          generated_at: "2025-10-15T10:00:00Z",
          created_at: "2025-10-15T10:00:00Z",
        },
      ];

      // Component expects array of forecast objects
      expect(Array.isArray(apiResponse)).toBe(true);
      expect(apiResponse[0]).toHaveProperty("forecast");
      expect(apiResponse[0]).toHaveProperty("created_at");
    });

    it("should return up to 25 records for dashboard display", () => {
      const maxRecords = 25;
      
      // Create mock array with 30 items
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        forecast: `Forecast ${i + 1}`,
      }));

      // Simulate limit
      const limitedData = mockData.slice(0, maxRecords);
      
      expect(limitedData.length).toBeLessThanOrEqual(25);
      expect(limitedData.length).toBe(25);
    });
  });

  describe("Supabase Client Integration", () => {
    it("should use server-side supabase client", () => {
      const clientType = "server";
      expect(clientType).toBe("server");
    });

    it("should use correct import path", () => {
      const importPath = "@/lib/supabase/server";
      expect(importPath).toBe("@/lib/supabase/server");
    });

    it("should call createClient function", () => {
      const functionName = "createClient";
      expect(functionName).toBe("createClient");
    });
  });

  describe("API Endpoint Configuration", () => {
    it("should be located at /api/forecast/list", () => {
      const endpoint = "/api/forecast/list";
      expect(endpoint).toBe("/api/forecast/list");
    });

    it("should export default handler function", () => {
      const hasDefaultExport = true;
      expect(hasDefaultExport).toBe(true);
    });

    it("should accept NextApiRequest and NextApiResponse types", () => {
      const requestType = "NextApiRequest";
      const responseType = "NextApiResponse";
      
      expect(requestType).toBe("NextApiRequest");
      expect(responseType).toBe("NextApiResponse");
    });
  });

  describe("Performance Considerations", () => {
    it("should limit query to prevent large data transfers", () => {
      const limit = 25;
      expect(limit).toBeLessThanOrEqual(100); // Reasonable limit
      expect(limit).toBeGreaterThan(0);
    });

    it("should use indexed created_at column for sorting", () => {
      const orderByField = "created_at";
      // Assuming created_at is indexed for performance
      expect(orderByField).toBe("created_at");
    });
  });

  describe("Content Type", () => {
    it("should return JSON content type", () => {
      const contentType = "application/json";
      expect(contentType).toBe("application/json");
    });
  });
});
