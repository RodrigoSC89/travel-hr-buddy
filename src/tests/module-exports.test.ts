/**
 * Module Exports Integrity Test
 * Ensures critical modules export their expected interfaces
 */
import { describe, it, expect } from "vitest";

describe("Core Module Exports", () => {
  it("should export supabase client", async () => {
    const mod = await import("@/integrations/supabase/client");
    expect(mod.supabase).toBeDefined();
    expect(mod.supabase.from).toBeDefined();
    expect(mod.supabase.auth).toBeDefined();
  });

  it("should export accessibility utilities", async () => {
    const mod = await import("@/lib/accessibility");
    expect(mod.announce).toBeDefined();
    expect(mod.createFocusTrap).toBeDefined();
    expect(mod.prefersReducedMotion).toBeDefined();
  });

  it("should export speech recognition API", async () => {
    const mod = await import("@/types/speech-recognition");
    expect(mod.getSpeechRecognitionAPI).toBeDefined();
  });
});

describe("Hook Exports", () => {
  it("should export accessibility hooks", async () => {
    const mod = await import("@/hooks/useAccessibility");
    expect(mod.useFocusTrap).toBeDefined();
    expect(mod.useAnnounce).toBeDefined();
    expect(mod.useMediaPreferences).toBeDefined();
    expect(mod.useEscapeKey).toBeDefined();
    expect(mod.useReturnFocus).toBeDefined();
  });
});

describe("Type Integrity", () => {
  it("should export Database types from supabase", async () => {
    const mod = await import("@/integrations/supabase/types");
    // Types are compile-time only, but the module should load
    expect(mod).toBeDefined();
  });
});
