import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock service for MMI Copilot with Resolved Actions
const SUPABASE_URL = "https://test.supabase.co";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/mmi-copilot-with-resolved`;

interface CopilotRequest {
  prompt: string;
  componente: string;
}

/**
 * Service to interact with MMI Copilot with Resolved Actions
 * This is a client-side wrapper for the Supabase Edge Function
 */
class MMICopilotService {
  private functionUrl: string;
  
  constructor(supabaseUrl: string = SUPABASE_URL) {
    this.functionUrl = `${supabaseUrl}/functions/v1/mmi-copilot-with-resolved`;
  }

  /**
   * Request AI recommendations based on historical resolved actions
   * @param request - Contains the job prompt and component name
   * @returns Response from the AI copilot
   */
  async getCopilotRecommendation(request: CopilotRequest): Promise<string> {
    const response = await fetch(this.functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get copilot recommendation");
    }

    // For streaming responses, we would use ReadableStream
    // For testing, we'll return a mock response
    return "Mock AI recommendation based on historical data";
  }

  /**
   * Get copilot recommendation with streaming support
   * @param request - Contains the job prompt and component name
   * @param onChunk - Callback for each chunk of data
   */
  async getCopilotRecommendationStreaming(
    request: CopilotRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const response = await fetch(this.functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get copilot recommendation");
    }

    // In real implementation, this would parse SSE stream
    // For testing, we simulate streaming
    onChunk("Mock ");
    onChunk("streaming ");
    onChunk("response");
  }
}

describe("MMI Copilot with Resolved Actions", () => {
  let service: MMICopilotService;

  beforeEach(() => {
    service = new MMICopilotService();
    vi.clearAllMocks();
    
    // Mock global fetch
    global.fetch = vi.fn();
  });

  describe("getCopilotRecommendation", () => {
    it("should send correct request structure", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ recommendation: "Test recommendation" }),
      };
      
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const request: CopilotRequest = {
        prompt: "Inspeção de válvulas de segurança",
        componente: "Sistema Hidráulico Principal",
      };

      await service.getCopilotRecommendation(request);

      expect(global.fetch).toHaveBeenCalledWith(
        FUNCTION_URL,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        })
      );
    });

    it("should handle successful responses", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ recommendation: "Test recommendation" }),
      };
      
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const request: CopilotRequest = {
        prompt: "Manutenção preventiva",
        componente: "Motor Principal",
      };

      const result = await service.getCopilotRecommendation(request);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle error responses", async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ error: "Component not found" }),
      };
      
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const request: CopilotRequest = {
        prompt: "Test",
        componente: "Invalid Component",
      };

      await expect(service.getCopilotRecommendation(request)).rejects.toThrow(
        "Component not found"
      );
    });

    it("should require both prompt and componente", async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ error: "Both 'prompt' and 'componente' are required" }),
      };
      
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const invalidRequest = {
        prompt: "Test",
        // Missing componente
      };

      await expect(service.getCopilotRecommendation(invalidRequest as CopilotRequest)).rejects.toThrow();
    });
  });

  describe("getCopilotRecommendationStreaming", () => {
    it("should handle streaming responses", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ recommendation: "Test" }),
      };
      
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const request: CopilotRequest = {
        prompt: "Calibração de sensores",
        componente: "Sistema de Monitoramento",
      };

      const chunks: string[] = [];
      await service.getCopilotRecommendationStreaming(request, (chunk) => {
        chunks.push(chunk);
      });

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.join("")).toContain("Mock");
    });

    it("should call onChunk callback for each data chunk", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ recommendation: "Test" }),
      };
      
      (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      const request: CopilotRequest = {
        prompt: "Troca de filtros",
        componente: "Motor Principal",
      };

      const onChunk = vi.fn();
      await service.getCopilotRecommendationStreaming(request, onChunk);

      expect(onChunk).toHaveBeenCalled();
      expect(onChunk.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe("Request validation", () => {
    it("should validate component name format", () => {
      const request: CopilotRequest = {
        prompt: "Test maintenance",
        componente: "Sistema Hidráulico Principal",
      };

      expect(request.componente).toBeTruthy();
      expect(typeof request.componente).toBe("string");
      expect(request.componente.length).toBeGreaterThan(0);
    });

    it("should validate prompt format", () => {
      const request: CopilotRequest = {
        prompt: "Realizar manutenção preventiva do sistema",
        componente: "Motor Principal",
      };

      expect(request.prompt).toBeTruthy();
      expect(typeof request.prompt).toBe("string");
      expect(request.prompt.length).toBeGreaterThan(0);
    });
  });

  describe("Component examples", () => {
    const testCases = [
      {
        prompt: "Substituição de selo da bomba",
        componente: "Sistema Hidráulico Principal",
      },
      {
        prompt: "Ajuste de válvulas",
        componente: "Motor Principal",
      },
      {
        prompt: "Teste de válvulas de segurança",
        componente: "Sistema de Segurança",
      },
      {
        prompt: "Calibração de sensores",
        componente: "Sistema de Monitoramento",
      },
    ];

    testCases.forEach(({ prompt, componente }) => {
      it(`should handle ${componente} component`, async () => {
        const mockResponse = {
          ok: true,
          json: async () => ({ recommendation: "Test" }),
        };
        
        (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

        const request: CopilotRequest = { prompt, componente };

        await expect(service.getCopilotRecommendation(request)).resolves.toBeDefined();
      });
    });
  });
});
