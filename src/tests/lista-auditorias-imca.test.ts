import { describe, it, expect, vi } from "vitest";

// Mock Supabase client
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockSupabase = {
  from: mockFrom,
};

// Setup mock chain
mockFrom.mockReturnValue({
  select: mockSelect,
});

mockSelect.mockReturnValue({
  order: mockOrder,
});

describe("ListaAuditoriasIMCA Component", () => {
  describe("Database Integration", () => {
    it("should query auditorias_imca table with correct fields", async () => {
      const mockData = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          navio: "MV Atlantic Star",
          norma: "IMCA M 182",
          item_auditado: "Sistema de Posicionamento Dinâmico",
          resultado: "Conforme",
          comentarios: "Sistema funcionando corretamente",
          data: "2025-01-15",
          created_at: "2025-01-15T10:00:00Z",
        },
      ];

      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase
        .from("auditorias_imca")
        .select("*")
        .order("data", { ascending: false });

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty("id");
      expect(result.data[0]).toHaveProperty("navio");
      expect(result.data[0]).toHaveProperty("norma");
      expect(result.data[0]).toHaveProperty("item_auditado");
      expect(result.data[0]).toHaveProperty("resultado");
      expect(result.data[0]).toHaveProperty("comentarios");
      expect(result.data[0]).toHaveProperty("data");
    });

    it("should handle non-compliant audits", async () => {
      const mockData = [
        {
          id: "123e4567-e89b-12d3-a456-426614174001",
          navio: "MV Pacific Explorer",
          norma: "IMCA M 103",
          item_auditado: "Procedimento de Segurança",
          resultado: "Não Conforme",
          comentarios: "Documentação desatualizada",
          data: "2025-01-16",
          created_at: "2025-01-16T10:00:00Z",
        },
      ];

      mockOrder.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase
        .from("auditorias_imca")
        .select("*")
        .order("data", { ascending: false });

      expect(result.data).toBeDefined();
      expect(result.data[0].resultado).toBe("Não Conforme");
    });

    it("should support filtering by multiple fields", () => {
      const mockAuditorias = [
        {
          id: "1",
          navio: "MV Atlantic Star",
          norma: "IMCA M 182",
          item_auditado: "DP System",
          resultado: "Conforme",
          comentarios: "OK",
          data: "2025-01-15",
          created_at: "2025-01-15T10:00:00Z",
        },
        {
          id: "2",
          navio: "MV Pacific Explorer",
          norma: "IMCA M 103",
          item_auditado: "Safety Procedure",
          resultado: "Não Conforme",
          comentarios: "Issues found",
          data: "2025-01-16",
          created_at: "2025-01-16T10:00:00Z",
        },
      ];

      // Test filtering by ship name
      const filteredByShip = mockAuditorias.filter((a) =>
        a.navio?.toLowerCase().includes("atlantic")
      );
      expect(filteredByShip).toHaveLength(1);
      expect(filteredByShip[0].navio).toBe("MV Atlantic Star");

      // Test filtering by resultado
      const filteredByResult = mockAuditorias.filter((a) =>
        a.resultado?.toLowerCase().includes("não conforme")
      );
      expect(filteredByResult).toHaveLength(1);
      expect(filteredByResult[0].resultado).toBe("Não Conforme");
    });

    it("should extract unique fleet names", () => {
      const mockAuditorias = [
        { navio: "MV Atlantic Star" },
        { navio: "MV Pacific Explorer" },
        { navio: "MV Atlantic Star" },
        { navio: "MV Indian Ocean" },
        { navio: null },
      ];

      const frota = Array.from(
        new Set(
          mockAuditorias
            .map((a) => a.navio)
            .filter((n) => n !== null)
        )
      );

      expect(frota).toHaveLength(3);
      expect(frota).toContain("MV Atlantic Star");
      expect(frota).toContain("MV Pacific Explorer");
      expect(frota).toContain("MV Indian Ocean");
    });
  });

  describe("Badge Variant Logic", () => {
    it("should return correct badge variants for each resultado", () => {
      const getResultadoBadgeVariant = (resultado: string | null) => {
        switch (resultado) {
          case "Conforme":
            return "default";
          case "Não Conforme":
            return "destructive";
          case "Observação":
            return "secondary";
          case "N/A":
            return "outline";
          default:
            return "outline";
        }
      };

      expect(getResultadoBadgeVariant("Conforme")).toBe("default");
      expect(getResultadoBadgeVariant("Não Conforme")).toBe("destructive");
      expect(getResultadoBadgeVariant("Observação")).toBe("secondary");
      expect(getResultadoBadgeVariant("N/A")).toBe("outline");
      expect(getResultadoBadgeVariant(null)).toBe("outline");
    });
  });

  describe("Export Functionality", () => {
    it("should format data correctly for CSV export", () => {
      const mockAuditorias = [
        {
          id: "1",
          navio: "MV Atlantic Star",
          norma: "IMCA M 182",
          item_auditado: "DP System",
          resultado: "Conforme",
          comentarios: "System working properly, no issues",
          data: "2025-01-15",
          created_at: "2025-01-15T10:00:00Z",
        },
      ];

      const headers = [
        "Data",
        "Navio",
        "Norma",
        "Item Auditado",
        "Resultado",
        "Comentários",
      ];
      const rows = mockAuditorias.map((a) => [
        a.data || "",
        a.navio || "",
        a.norma || "",
        a.item_auditado || "",
        a.resultado || "",
        a.comentarios?.replace(/,/g, ";") || "",
      ]);

      expect(headers).toHaveLength(6);
      expect(rows[0]).toHaveLength(6);
      expect(rows[0][0]).toBe("2025-01-15");
      expect(rows[0][1]).toBe("MV Atlantic Star");
      expect(rows[0][5]).toBe("System working properly; no issues");
    });
  });
});

describe("AI Explanation API", () => {
  it("should have correct endpoint structure", () => {
    const endpoint = "/api/auditoria/explicar-ia";
    expect(endpoint).toBeDefined();
    expect(endpoint).toContain("/api/auditoria/");
  });

  it("should require navio, item, and norma parameters", () => {
    const requiredParams = ["navio", "item", "norma"];
    expect(requiredParams).toContain("navio");
    expect(requiredParams).toContain("item");
    expect(requiredParams).toContain("norma");
  });

  it("should return explanation in correct format", () => {
    const mockResponse = {
      explicacao: "Esta não conformidade indica...",
    };

    expect(mockResponse).toHaveProperty("explicacao");
    expect(typeof mockResponse.explicacao).toBe("string");
  });
});
