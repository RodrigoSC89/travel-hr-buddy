import { describe, it, expect } from "vitest";

describe("useCRUD Hook", () => {
  it("exports useCRUD function", async () => {
    const mod = await import("@/hooks/useCRUD");
    expect(mod.useCRUD).toBeDefined();
    expect(typeof mod.useCRUD).toBe("function");
  });

  it("exports useMaintenanceJobs hook", async () => {
    const mod = await import("@/hooks/useCRUD");
    expect(mod.useMaintenanceJobs).toBeDefined();
  });

  it("exports useComplianceRecords hook", async () => {
    const mod = await import("@/hooks/useCRUD");
    expect(mod.useComplianceRecords).toBeDefined();
  });
});
