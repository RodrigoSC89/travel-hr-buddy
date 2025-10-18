import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "../../../pages/api/sgso/effectiveness";

// Mock Supabase
const mockRpc = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    rpc: mockRpc,
  })),
}));

describe("SGSO Effectiveness API", () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    jsonMock = vi.fn();
    statusMock = vi.fn(() => ({ json: jsonMock }));
    req = {
      method: "GET",
      query: {},
    };
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe("HTTP Method Validation", () => {
    it("should return 405 for non-GET requests", async () => {
      req.method = "POST";
      await handler(req as NextApiRequest, res as NextApiResponse);
      expect(statusMock).toHaveBeenCalledWith(405);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Método não permitido." });
    });

    it("should allow GET requests", async () => {
      mockRpc.mockResolvedValueOnce({ data: [], error: null });
      await handler(req as NextApiRequest, res as NextApiResponse);
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe("Overall Effectiveness Data", () => {
    it("should fetch overall effectiveness data when by_vessel is not set", async () => {
      const mockData = [
        {
          categoria: "Erro humano",
          total_incidencias: 12,
          incidencias_repetidas: 3,
          efetividade: 75.0,
          tempo_medio_resolucao: 4.2,
        },
        {
          categoria: "Falha técnica",
          total_incidencias: 9,
          incidencias_repetidas: 1,
          efetividade: 88.89,
          tempo_medio_resolucao: 2.7,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(mockRpc).toHaveBeenCalledWith("calculate_sgso_effectiveness");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockData);
    });

    it("should return empty array when no data available", async () => {
      mockRpc.mockResolvedValueOnce({ data: [], error: null });

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith([]);
    });

    it("should return empty array when data is null", async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: null });

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith([]);
    });
  });

  describe("Vessel-Specific Effectiveness Data", () => {
    it("should fetch vessel-specific data when by_vessel=true", async () => {
      req.query = { by_vessel: "true" };

      const mockData = [
        {
          embarcacao: "DP Shuttle Tanker X",
          categoria: "Erro humano",
          total_incidencias: 5,
          incidencias_repetidas: 1,
          efetividade: 80.0,
          tempo_medio_resolucao: 3.5,
        },
        {
          embarcacao: "DP DSV Subsea Alpha",
          categoria: "Falha técnica",
          total_incidencias: 4,
          incidencias_repetidas: 0,
          efetividade: 100.0,
          tempo_medio_resolucao: 1.8,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(mockRpc).toHaveBeenCalledWith("calculate_sgso_effectiveness_by_vessel");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockData);
    });

    it("should fetch overall data when by_vessel=false", async () => {
      req.query = { by_vessel: "false" };

      const mockData = [
        {
          categoria: "Comunicação",
          total_incidencias: 6,
          incidencias_repetidas: 0,
          efetividade: 100.0,
          tempo_medio_resolucao: 1.3,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(mockRpc).toHaveBeenCalledWith("calculate_sgso_effectiveness");
      expect(statusMock).toHaveBeenCalledWith(200);
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors for overall data", async () => {
      const dbError = { message: "Database connection failed" };
      mockRpc.mockResolvedValueOnce({ data: null, error: dbError });

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: dbError.message });
    });

    it("should handle database errors for vessel data", async () => {
      req.query = { by_vessel: "true" };
      const dbError = { message: "Query execution failed" };
      mockRpc.mockResolvedValueOnce({ data: null, error: dbError });

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: dbError.message });
    });

    it("should handle unexpected exceptions", async () => {
      mockRpc.mockRejectedValueOnce(new Error("Unexpected error"));

      await handler(req as NextApiRequest, res as NextApiResponse);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Erro interno do servidor." });
    });
  });

  describe("Data Structure Validation", () => {
    it("should return data with correct structure for overall effectiveness", async () => {
      const mockData = [
        {
          categoria: "Falha organizacional",
          total_incidencias: 8,
          incidencias_repetidas: 2,
          efetividade: 75.0,
          tempo_medio_resolucao: 6.1,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      await handler(req as NextApiRequest, res as NextApiResponse);

      const returnedData = jsonMock.mock.calls[0][0];
      expect(returnedData).toBeInstanceOf(Array);
      expect(returnedData[0]).toHaveProperty("categoria");
      expect(returnedData[0]).toHaveProperty("total_incidencias");
      expect(returnedData[0]).toHaveProperty("incidencias_repetidas");
      expect(returnedData[0]).toHaveProperty("efetividade");
      expect(returnedData[0]).toHaveProperty("tempo_medio_resolucao");
    });

    it("should return data with correct structure for vessel effectiveness", async () => {
      req.query = { by_vessel: "true" };

      const mockData = [
        {
          embarcacao: "Test Vessel",
          categoria: "Erro humano",
          total_incidencias: 3,
          incidencias_repetidas: 0,
          efetividade: 100.0,
          tempo_medio_resolucao: 2.0,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      await handler(req as NextApiRequest, res as NextApiResponse);

      const returnedData = jsonMock.mock.calls[0][0];
      expect(returnedData).toBeInstanceOf(Array);
      expect(returnedData[0]).toHaveProperty("embarcacao");
      expect(returnedData[0]).toHaveProperty("categoria");
      expect(returnedData[0]).toHaveProperty("total_incidencias");
      expect(returnedData[0]).toHaveProperty("incidencias_repetidas");
      expect(returnedData[0]).toHaveProperty("efetividade");
      expect(returnedData[0]).toHaveProperty("tempo_medio_resolucao");
    });

    it("should handle null resolution times", async () => {
      const mockData = [
        {
          categoria: "Comunicação",
          total_incidencias: 5,
          incidencias_repetidas: 0,
          efetividade: 100.0,
          tempo_medio_resolucao: null,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      await handler(req as NextApiRequest, res as NextApiResponse);

      const returnedData = jsonMock.mock.calls[0][0];
      expect(returnedData[0].tempo_medio_resolucao).toBeNull();
    });
  });

  describe("Effectiveness Calculation Logic", () => {
    it("should handle 100% effectiveness (no repeated incidents)", async () => {
      const mockData = [
        {
          categoria: "Comunicação",
          total_incidencias: 10,
          incidencias_repetidas: 0,
          efetividade: 100.0,
          tempo_medio_resolucao: 2.5,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      await handler(req as NextApiRequest, res as NextApiResponse);

      const returnedData = jsonMock.mock.calls[0][0];
      expect(returnedData[0].efetividade).toBe(100.0);
    });

    it("should handle low effectiveness (many repeated incidents)", async () => {
      const mockData = [
        {
          categoria: "Erro humano",
          total_incidencias: 10,
          incidencias_repetidas: 8,
          efetividade: 20.0,
          tempo_medio_resolucao: 5.0,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      await handler(req as NextApiRequest, res as NextApiResponse);

      const returnedData = jsonMock.mock.calls[0][0];
      expect(returnedData[0].efetividade).toBe(20.0);
    });

    it("should handle various effectiveness levels", async () => {
      const mockData = [
        {
          categoria: "Erro humano",
          total_incidencias: 12,
          incidencias_repetidas: 3,
          efetividade: 75.0,
          tempo_medio_resolucao: 4.2,
        },
        {
          categoria: "Falha técnica",
          total_incidencias: 9,
          incidencias_repetidas: 1,
          efetividade: 88.89,
          tempo_medio_resolucao: 2.7,
        },
        {
          categoria: "Comunicação",
          total_incidencias: 6,
          incidencias_repetidas: 0,
          efetividade: 100.0,
          tempo_medio_resolucao: 1.3,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      await handler(req as NextApiRequest, res as NextApiResponse);

      const returnedData = jsonMock.mock.calls[0][0];
      expect(returnedData).toHaveLength(3);
      expect(returnedData[0].efetividade).toBe(75.0);
      expect(returnedData[1].efetividade).toBe(88.89);
      expect(returnedData[2].efetividade).toBe(100.0);
    });
  });
});
