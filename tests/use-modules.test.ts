import { vi, describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useModules from "@/hooks/useModules";

vi.mock("@supabase/supabase-js", async () => {
  const actual = await vi.importActual("@supabase/supabase-js");
  return {
    ...actual,
    createClient: () => ({
      from: () => ({ select: async () => ({
        data: [
          { slug: "dashboard", title: "Dashboard", description: "Resumo geral" },
        ],
        error: null,
      }) }),
    }),
  };
});

describe("useModules", () => {
  it("fetches modules from Supabase", async () => {
    const { result } = renderHook(() => useModules());
    await waitFor(() => {
      expect(result.current.modules.length).toBeGreaterThan(0);
    });
    expect(result.current.modules[0].slug).toBe("dashboard");
  });
});
