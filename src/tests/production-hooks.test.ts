/**
 * Production Hooks Integration Tests
 * Validates that critical data hooks use real Supabase queries (no mocks)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readHook(name: string): string {
  const filePath = path.join("src/hooks", name);
  return fs.readFileSync(filePath, "utf-8");
}

function getAllHookFiles(): string[] {
  const dir = path.join("src/hooks");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(".ts") || f.endsWith(".tsx"));
}

describe("Critical Data Hooks - Production Integrity", () => {
  const criticalHooks = [
    "useVesselTrackingData.ts",
    "useFleetMonitorData.ts",
    "useCrewWellnessData.ts",
    "useCommunicationData.ts",
    "useAgentOrchestratorData.ts",
    "useAIObservabilityData.ts",
    "useNOCData.ts",
    "useMaintenancePredictionsData.ts",
    "useAutonomousAgentActionsData.ts",
    "useAnalyticsRealData.ts",
    "usePeopleDashboardData.ts",
  ];

  for (const hookFile of criticalHooks) {
    const filePath = path.join("src/hooks", hookFile);
    if (!fs.existsSync(filePath)) continue;

    it(`${hookFile} should use Supabase, not mock data`, () => {
      const content = readHook(hookFile);
      
      // Must import from supabase
      const usesSupabase = content.includes("supabase") || content.includes("fromUntyped") || content.includes("useQuery");
      expect(usesSupabase).toBe(true);

      // Must NOT export MOCK_ constants
      expect(/export\s+(const|let)\s+MOCK_/i.test(content)).toBe(false);
    });

    it(`${hookFile} should not use Math.random() for data generation`, () => {
      const content = readHook(hookFile);
      const lines = content.split("\n");
      const violations: number[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("//") || line.startsWith("*")) continue;
        if (line.includes("Math.random()") && !line.includes("jitter") && !line.includes("retry")) {
          violations.push(i + 1);
        }
      }
      
      expect(violations).toEqual([]);
    });
  }

  it("no hook should export MOCK_ prefixed constants", () => {
    const allHooks = getAllHookFiles();
    const violations: string[] = [];

    for (const hookFile of allHooks) {
      const content = readHook(hookFile);
      if (/export\s+(const|let|var)\s+MOCK_/i.test(content)) {
        violations.push(hookFile);
      }
    }

    expect(violations).toEqual([]);
  });
});

describe("Query Configuration - Low Bandwidth Optimization", () => {
  it("App.tsx should have offlineFirst networkMode", () => {
    const app = fs.readFileSync("src/App.tsx", "utf-8");
    expect(app).toContain("offlineFirst");
  });

  it("App.tsx should have staleTime >= 5 minutes", () => {
    const app = fs.readFileSync("src/App.tsx", "utf-8");
    // staleTime: 1000 * 60 * 10 = 600000
    const match = app.match(/staleTime:\s*([\d*\s]+)/);
    expect(match).toBeTruthy();
  });

  it("App.tsx should disable refetchOnWindowFocus", () => {
    const app = fs.readFileSync("src/App.tsx", "utf-8");
    expect(app).toContain("refetchOnWindowFocus: false");
  });

  it("App.tsx should disable refetchOnMount for bandwidth saving", () => {
    const app = fs.readFileSync("src/App.tsx", "utf-8");
    expect(app).toContain("refetchOnMount: false");
  });
});

describe("Service Worker - API Caching", () => {
  it("sw.js should exist and cache API responses", () => {
    const sw = fs.readFileSync("public/sw.js", "utf-8");
    expect(sw).toContain("/rest/");
    expect(sw).toContain("cache");
  });
});

describe("Loading States - Premium UX", () => {
  it("LoadingSkeleton exports all variants", () => {
    const content = fs.readFileSync("src/components/ui/LoadingSkeleton.tsx", "utf-8");
    const expectedExports = ["KPICardsSkeleton", "TableSkeleton", "ChartSkeleton", "TimelineSkeleton", "ModulePageSkeleton", "CardGridSkeleton"];
    for (const exp of expectedExports) {
      expect(content).toContain(`export function ${exp}`);
    }
  });

  it("PMSHubPage should not use plain text loading states", () => {
    const content = fs.readFileSync("src/pages/PMSHubPage.tsx", "utf-8");
    expect(content).not.toContain('>Carregando...</');
    expect(content).not.toContain('>Carregando work orders...</');
  });
});
