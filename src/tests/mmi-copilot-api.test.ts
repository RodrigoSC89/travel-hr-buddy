import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCopilotSuggestions, streamCopilotSuggestions } from "@/services/mmi/copilotApi";
import { supabase } from "@/integrations/supabase/client";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe("MMI Copilot API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCopilotSuggestions", () => {
    it("should call the mmi-copilot function with correct parameters", async () => {
      const mockResponse = {
        data: {
          reply: "Test suggestion",
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const mockOnChunk = vi.fn();
      const prompt = "Gerador com ruído incomum";

      await getCopilotSuggestions(prompt, mockOnChunk);

      expect(supabase.functions.invoke).toHaveBeenCalledWith("mmi-copilot", {
        body: { prompt },
      });
      expect(mockOnChunk).toHaveBeenCalledWith("Test suggestion");
    });

    it("should handle errors from the function call", async () => {
      const mockError = new Error("Function error");
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockOnChunk = vi.fn();

      await expect(
        getCopilotSuggestions("test prompt", mockOnChunk)
      ).rejects.toThrow();
    });

    it("should handle different response formats", async () => {
      const mockResponse = {
        data: {
          text: "Alternative format",
        },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const mockOnChunk = vi.fn();
      await getCopilotSuggestions("test", mockOnChunk);

      expect(mockOnChunk).toHaveBeenCalled();
    });
  });

  describe("streamCopilotSuggestions", () => {
    it("should handle streaming environment check", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const mockOnChunk = vi.fn();

      // This will fail due to missing environment variables in test,
      // but we're testing that it tries to get the session
      await expect(
        streamCopilotSuggestions("test", mockOnChunk)
      ).rejects.toThrow();

      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
  });

  describe("Input validation", () => {
    it("should handle empty prompts gracefully", async () => {
      const mockResponse = {
        data: { reply: "Please provide a description" },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const mockOnChunk = vi.fn();
      await getCopilotSuggestions("", mockOnChunk);

      // Should still make the call even with empty prompt
      expect(supabase.functions.invoke).toHaveBeenCalled();
    });

    it("should handle long prompts", async () => {
      const longPrompt = "A".repeat(1000);
      const mockResponse = {
        data: { reply: "Suggestion for long prompt" },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const mockOnChunk = vi.fn();
      await getCopilotSuggestions(longPrompt, mockOnChunk);

      expect(supabase.functions.invoke).toHaveBeenCalledWith("mmi-copilot", {
        body: { prompt: longPrompt },
      });
    });
  });

  describe("Callback handling", () => {
    it("should call onChunk callback with received data", async () => {
      const mockResponse = {
        data: { reply: "Test data" },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      const chunks: string[] = [];
      const onChunk = (text: string) => {
        chunks.push(text);
      };

      await getCopilotSuggestions("test", onChunk);

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0]).toBe("Test data");
    });

    it("should handle multiple callback invocations", async () => {
      const mockResponse = {
        data: { reply: "Multi-part response" },
        error: null,
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);

      let callCount = 0;
      const onChunk = () => {
        callCount++;
      };

      await getCopilotSuggestions("test", onChunk);

      expect(callCount).toBeGreaterThan(0);
    });
  });
});
