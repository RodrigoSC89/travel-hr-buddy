/**
 * Tests for Supabase client integration
 */
import { describe, it, expect } from "vitest";

describe("Supabase Client", () => {
  it("exports a valid supabase client", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.storage).toBeDefined();
  });

  it("supabase.from returns chainable query builder", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const query = supabase.from("vessels");
    expect(query.select).toBeDefined();
    expect(query.insert).toBeDefined();
    expect(query.update).toBeDefined();
    expect(query.delete).toBeDefined();
  });

  it("dynamic table access via Function pattern works", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    // The (supabase.from as Function) pattern requires binding to maintain context
    const boundFrom = supabase.from.bind(supabase);
    const query = boundFrom("vessels");
    expect(query.select).toBeDefined();
  });
});
