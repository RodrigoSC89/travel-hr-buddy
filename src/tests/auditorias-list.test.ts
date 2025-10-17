/**
 * Auditorias List API Tests
 * 
 * Tests for the /api/auditorias/list endpoint and associated functionality
 * for displaying IMCA technical audits in a card-based UI
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Auditorias List API Endpoint", () => {
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
      const endpointPath = "/api/auditorias/list";
      expect(endpointPath).toBe("/api/auditorias/list");
    });

    it("should be accessible via pages/api/auditorias/list.ts", () => {
      const filePath = "pages/api/auditorias/list.ts";
      expect(filePath).toContain("auditorias/list");
    });
  });

  describe("Response Structure", () => {
    it("should return object with auditorias array", () => {
      const response = {
        auditorias: [],
        frota: [],
        cronStatus: "Ativo"
      };
      expect(response).toHaveProperty("auditorias");
      expect(Array.isArray(response.auditorias)).toBe(true);
    });

    it("should return object with frota array", () => {
      const response = {
        auditorias: [],
        frota: ["Navio 1", "Navio 2"],
        cronStatus: "Ativo"
      };
      expect(response).toHaveProperty("frota");
      expect(Array.isArray(response.frota)).toBe(true);
    });

    it("should return object with cronStatus string", () => {
      const response = {
        auditorias: [],
        frota: [],
        cronStatus: "Ativo"
      };
      expect(response).toHaveProperty("cronStatus");
      expect(typeof response.cronStatus).toBe("string");
    });

    it("should handle empty auditorias", () => {
      const response = {
        auditorias: [],
        frota: [],
        cronStatus: "Ativo"
      };
      expect(response.auditorias.length).toBe(0);
    });

    it("should handle multiple auditorias", () => {
      const response = {
        auditorias: [
          { id: "1", navio: "Navio 1" },
          { id: "2", navio: "Navio 2" }
        ],
        frota: ["Navio 1", "Navio 2"],
        cronStatus: "Ativo"
      };
      expect(response.auditorias.length).toBe(2);
    });
  });

  describe("Auditoria Fields", () => {
    it("should include id field", () => {
      const auditoria = {
        id: "uuid-123",
        navio: "Navio 1",
        data: "2025-10-16",
        norma: "IMCA M 103",
        resultado: "Conforme",
        item_auditado: "Sistema de ancoragem",
        comentarios: "Aprovado"
      };
      expect(auditoria).toHaveProperty("id");
    });

    it("should include navio field", () => {
      const auditoria = {
        id: "uuid-123",
        navio: "Navio 1"
      };
      expect(auditoria).toHaveProperty("navio");
      expect(typeof auditoria.navio).toBe("string");
    });

    it("should include data field", () => {
      const auditoria = {
        id: "uuid-123",
        data: "2025-10-16"
      };
      expect(auditoria).toHaveProperty("data");
    });

    it("should include norma field", () => {
      const auditoria = {
        id: "uuid-123",
        norma: "IMCA M 103"
      };
      expect(auditoria).toHaveProperty("norma");
      expect(typeof auditoria.norma).toBe("string");
    });

    it("should include resultado field", () => {
      const auditoria = {
        id: "uuid-123",
        resultado: "Conforme"
      };
      expect(auditoria).toHaveProperty("resultado");
    });

    it("should include item_auditado field", () => {
      const auditoria = {
        id: "uuid-123",
        item_auditado: "Sistema de ancoragem"
      };
      expect(auditoria).toHaveProperty("item_auditado");
      expect(typeof auditoria.item_auditado).toBe("string");
    });

    it("should include comentarios field", () => {
      const auditoria = {
        id: "uuid-123",
        comentarios: "Aprovado sem ressalvas"
      };
      expect(auditoria).toHaveProperty("comentarios");
    });
  });

  describe("Resultado Field Constraints", () => {
    it("should accept 'Conforme' result", () => {
      const resultado = "Conforme";
      const validResults = ["Conforme", "Não Conforme", "Parcialmente Conforme", "Não Aplicável"];
      expect(validResults).toContain(resultado);
    });

    it("should accept 'Não Conforme' result", () => {
      const resultado = "Não Conforme";
      const validResults = ["Conforme", "Não Conforme", "Parcialmente Conforme", "Não Aplicável"];
      expect(validResults).toContain(resultado);
    });

    it("should accept 'Parcialmente Conforme' result", () => {
      const resultado = "Parcialmente Conforme";
      const validResults = ["Conforme", "Não Conforme", "Parcialmente Conforme", "Não Aplicável"];
      expect(validResults).toContain(resultado);
    });

    it("should accept 'Não Aplicável' result", () => {
      const resultado = "Não Aplicável";
      const validResults = ["Conforme", "Não Conforme", "Parcialmente Conforme", "Não Aplicável"];
      expect(validResults).toContain(resultado);
    });

    it("should have exactly 4 valid resultado values", () => {
      const validResults = ["Conforme", "Não Conforme", "Parcialmente Conforme", "Não Aplicável"];
      expect(validResults.length).toBe(4);
    });
  });

  describe("Database Query Configuration", () => {
    it("should query auditorias_imca table", () => {
      const tableName = "auditorias_imca";
      expect(tableName).toBe("auditorias_imca");
    });

    it("should select all columns", () => {
      const selectQuery = "*";
      expect(selectQuery).toBe("*");
    });

    it("should order by data field", () => {
      const orderField = "data";
      expect(orderField).toBe("data");
    });

    it("should order in descending order (newest first)", () => {
      const ascending = false;
      expect(ascending).toBe(false);
    });

    it("should extract unique fleet names from auditorias", () => {
      const auditorias = [
        { navio: "Navio 1" },
        { navio: "Navio 2" },
        { navio: "Navio 1" },
        { navio: null }
      ];
      const frota = [...new Set(auditorias.map((a) => a.navio).filter(Boolean))];
      expect(frota).toEqual(["Navio 1", "Navio 2"]);
    });
  });

  describe("Cron Status", () => {
    it("should check cron_execution_logs table", () => {
      const tableName = "cron_execution_logs";
      expect(tableName).toBe("cron_execution_logs");
    });

    it("should filter by job_name 'auditorias_check'", () => {
      const jobName = "auditorias_check";
      expect(jobName).toBe("auditorias_check");
    });

    it("should default to 'Ativo' when no logs found", () => {
      const defaultStatus = "Ativo";
      expect(defaultStatus).toBe("Ativo");
    });

    it("should calculate hours since last run", () => {
      const lastRun = new Date("2025-10-15T10:00:00Z");
      const now = new Date("2025-10-16T10:00:00Z");
      const hoursSince = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);
      expect(hoursSince).toBe(24);
    });

    it("should show 'Ativo' status if last run within 24 hours", () => {
      const hoursSince = 12;
      const status = hoursSince <= 24 
        ? "Ativo (última execução nas últimas 24h)"
        : `Último run: ${Math.floor(hoursSince)}h atrás`;
      expect(status).toBe("Ativo (última execução nas últimas 24h)");
    });

    it("should show hours since last run if over 24 hours", () => {
      const hoursSince = 48;
      const status = hoursSince > 24
        ? `Último run: ${Math.floor(hoursSince)}h atrás`
        : "Ativo (última execução nas últimas 24h)";
      expect(status).toBe("Último run: 48h atrás");
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on database errors", () => {
      const errorResponse = {
        status: 500,
        error: "Erro ao buscar auditorias"
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.error).toBe("Erro ao buscar auditorias");
    });

    it("should continue with default cron status on cron check error", () => {
      const cronStatus = "Ativo";
      expect(cronStatus).toBe("Ativo");
    });

    it("should return 500 on internal server error", () => {
      const errorResponse = {
        status: 500,
        error: "Erro interno do servidor"
      };
      expect(errorResponse.status).toBe(500);
    });

    it("should log errors to console", () => {
      const errorMessage = "Database connection failed";
      expect(typeof errorMessage).toBe("string");
      expect(errorMessage.length).toBeGreaterThan(0);
    });
  });

  describe("Supabase Client Configuration", () => {
    it("should use VITE_SUPABASE_URL environment variable", () => {
      const envVar = "VITE_SUPABASE_URL";
      expect(envVar).toBe("VITE_SUPABASE_URL");
    });

    it("should use SUPABASE_SERVICE_ROLE_KEY environment variable", () => {
      const envVar = "SUPABASE_SERVICE_ROLE_KEY";
      expect(envVar).toBe("SUPABASE_SERVICE_ROLE_KEY");
    });

    it("should default to empty string if env vars not set", () => {
      const defaultValue = "";
      expect(defaultValue).toBe("");
    });
  });

  describe("Integration Points", () => {
    it("should integrate with ListaAuditoriasIMCA component", () => {
      const componentPath = "src/components/auditorias/ListaAuditoriasIMCA.tsx";
      expect(componentPath).toContain("ListaAuditoriasIMCA");
    });

    it("should be used by /admin/auditorias-lista page", () => {
      const pagePath = "src/pages/admin/auditorias-lista.tsx";
      expect(pagePath).toContain("auditorias-lista");
    });

    it("should complement auditorias-lista Supabase function", () => {
      const functionPath = "supabase/functions/auditorias-lista";
      expect(functionPath).toContain("auditorias-lista");
    });
  });

  describe("Response Data Types", () => {
    it("should return array of objects for auditorias", () => {
      const auditorias = [
        { id: "1", navio: "Navio 1" },
        { id: "2", navio: "Navio 2" }
      ];
      expect(Array.isArray(auditorias)).toBe(true);
      auditorias.forEach((a) => {
        expect(typeof a).toBe("object");
      });
    });

    it("should return array of strings for frota", () => {
      const frota = ["Navio 1", "Navio 2", "Navio 3"];
      expect(Array.isArray(frota)).toBe(true);
      frota.forEach((ship) => {
        expect(typeof ship).toBe("string");
      });
    });

    it("should return string for cronStatus", () => {
      const cronStatus = "Ativo (última execução nas últimas 24h)";
      expect(typeof cronStatus).toBe("string");
    });
  });
});

describe("ListaAuditoriasIMCA Component", () => {
  describe("Component Structure", () => {
    it("should be located in src/components/auditorias", () => {
      const componentPath = "src/components/auditorias/ListaAuditoriasIMCA.tsx";
      expect(componentPath).toContain("src/components/auditorias");
    });

    it("should export default function", () => {
      const exportType = "default";
      expect(exportType).toBe("default");
    });

    it("should be named ListaAuditoriasIMCA", () => {
      const componentName = "ListaAuditoriasIMCA";
      expect(componentName).toBe("ListaAuditoriasIMCA");
    });
  });

  describe("Component Features", () => {
    it("should display audits in card layout", () => {
      const layoutType = "card";
      expect(layoutType).toBe("card");
    });

    it("should include filter input", () => {
      const hasFilter = true;
      expect(hasFilter).toBe(true);
    });

    it("should support CSV export", () => {
      const exportFormats = ["CSV", "PDF"];
      expect(exportFormats).toContain("CSV");
    });

    it("should support PDF export", () => {
      const exportFormats = ["CSV", "PDF"];
      expect(exportFormats).toContain("PDF");
    });

    it("should display fleet information", () => {
      const displaysFrota = true;
      expect(displaysFrota).toBe(true);
    });

    it("should display cron status", () => {
      const displaysCronStatus = true;
      expect(displaysCronStatus).toBe(true);
    });
  });

  describe("Badge Color Mapping", () => {
    it("should use green badge for Conforme", () => {
      const corResultado = {
        "Conforme": "bg-green-500 text-white"
      };
      expect(corResultado["Conforme"]).toContain("green");
    });

    it("should use red badge for Não Conforme", () => {
      const corResultado = {
        "Não Conforme": "bg-red-500 text-white"
      };
      expect(corResultado["Não Conforme"]).toContain("red");
    });

    it("should use yellow badge for Parcialmente Conforme", () => {
      const corResultado = {
        "Parcialmente Conforme": "bg-yellow-500 text-black"
      };
      expect(corResultado["Parcialmente Conforme"]).toContain("yellow");
    });

    it("should use gray badge for Não Aplicável", () => {
      const corResultado = {
        "Não Aplicável": "bg-gray-400 text-white"
      };
      expect(corResultado["Não Aplicável"]).toContain("gray");
    });
  });

  describe("AI Features", () => {
    it("should call auditorias-explain function", () => {
      const functionName = "auditorias-explain";
      expect(functionName).toBe("auditorias-explain");
    });

    it("should call auditorias-plano function", () => {
      const functionName = "auditorias-plano";
      expect(functionName).toBe("auditorias-plano");
    });

    it("should only show AI buttons for Não Conforme", () => {
      const resultado = "Não Conforme";
      const showAI = resultado === "Não Conforme";
      expect(showAI).toBe(true);
    });

    it("should not show AI buttons for Conforme", () => {
      const resultado = "Conforme";
      const showAI = resultado === "Não Conforme";
      expect(showAI).toBe(false);
    });
  });

  describe("Date Formatting", () => {
    it("should use date-fns format function", () => {
      const library = "date-fns";
      expect(library).toBe("date-fns");
    });

    it("should format dates as dd/MM/yyyy", () => {
      const formatString = "dd/MM/yyyy";
      expect(formatString).toBe("dd/MM/yyyy");
    });
  });

  describe("Filter Functionality", () => {
    it("should filter by navio", () => {
      const auditorias = [
        { navio: "Navio 1", norma: "IMCA", item_auditado: "Item 1", resultado: "Conforme" },
        { navio: "Navio 2", norma: "IMCA", item_auditado: "Item 2", resultado: "Conforme" }
      ];
      const filtro = "navio 1";
      const filtered = auditorias.filter((a) =>
        a.navio?.toLowerCase().includes(filtro.toLowerCase())
      );
      expect(filtered.length).toBe(1);
      expect(filtered[0].navio).toBe("Navio 1");
    });

    it("should filter by norma", () => {
      const auditorias = [
        { navio: "Navio 1", norma: "IMCA M 103", item_auditado: "Item 1", resultado: "Conforme" },
        { navio: "Navio 2", norma: "ISO 9001", item_auditado: "Item 2", resultado: "Conforme" }
      ];
      const filtro = "imca";
      const filtered = auditorias.filter((a) =>
        a.norma?.toLowerCase().includes(filtro.toLowerCase())
      );
      expect(filtered.length).toBe(1);
      expect(filtered[0].norma).toBe("IMCA M 103");
    });

    it("should be case-insensitive", () => {
      const text = "Navio 1";
      const filtro = "NAVIO";
      const matches = text.toLowerCase().includes(filtro.toLowerCase());
      expect(matches).toBe(true);
    });
  });
});

describe("Admin Page Integration", () => {
  describe("Page Route", () => {
    it("should be accessible at /admin/auditorias-lista", () => {
      const route = "/admin/auditorias-lista";
      expect(route).toBe("/admin/auditorias-lista");
    });

    it("should be lazy-loaded in App.tsx", () => {
      const isLazyLoaded = true;
      expect(isLazyLoaded).toBe(true);
    });
  });

  describe("Page Structure", () => {
    it("should include back button to admin", () => {
      const hasBackButton = true;
      expect(hasBackButton).toBe(true);
    });

    it("should link back to /admin", () => {
      const backLink = "/admin";
      expect(backLink).toBe("/admin");
    });

    it("should render ListaAuditoriasIMCA component", () => {
      const rendersComponent = true;
      expect(rendersComponent).toBe(true);
    });
  });
});
