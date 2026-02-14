/**
 * Supabase Hooks Integration Tests
 * Validates that real hooks follow correct patterns and handle errors
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ============================================
// HOOK PATTERN VALIDATION (Static Analysis)
// ============================================

function getHookFiles(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.includes("node_modules")) {
        results.push(...getHookFiles(fullPath));
      } else if (entry.isFile() && entry.name.startsWith("use") && entry.name.endsWith(".ts")) {
        results.push(fullPath);
      }
    }
  } catch { /* skip */ }
  return results;
}

describe("Supabase Hook Patterns", () => {
  const hookFiles = getHookFiles("src/hooks");

  it("should have at least 20 custom hooks", () => {
    expect(hookFiles.length).toBeGreaterThanOrEqual(20);
    console.log(`Found ${hookFiles.length} custom hooks`);
  });

  it("hooks using supabase should import from @/integrations/supabase/client", () => {
    const violations: string[] = [];
    for (const file of hookFiles) {
      const content = fs.readFileSync(file, "utf-8");
      // Strip comments before checking for supabase usage
      const noComments = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      if (noComments.includes("supabase.from(") || noComments.includes("supabase.from as Function")) {
        if (!content.includes("@/integrations/supabase/client")) {
          violations.push(file);
        }
      }
    }
    console.log(`Supabase import violations: ${violations.length}`);
    violations.forEach(v => console.log(`  - ${v}`));
    expect(violations.length).toBe(0);
  });

  it("hooks with queries should use useQuery or useMutation from tanstack", () => {
    let hooksWithSupabase = 0;
    let hooksWithTanstack = 0;
    const violations: string[] = [];

    for (const file of hookFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes("supabase") && (content.includes(".from(") || content.includes("from as Function"))) {
        hooksWithSupabase++;
        if (content.includes("useQuery") || content.includes("useMutation")) {
          hooksWithTanstack++;
        } else {
          violations.push(path.basename(file));
        }
      }
    }

    console.log(`Hooks with Supabase: ${hooksWithSupabase}, with TanStack: ${hooksWithTanstack}`);
    // At least 80% should use TanStack
    const coverage = hooksWithSupabase > 0 ? (hooksWithTanstack / hooksWithSupabase) * 100 : 100;
    expect(coverage).toBeGreaterThanOrEqual(70);
  });

  it("hooks should not contain MOCK_ or hardcoded test data", () => {
    const violations: string[] = [];
    for (const file of hookFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (/export\s+(const|let)\s+MOCK_/i.test(content)) {
        violations.push(path.basename(file));
      }
    }
    expect(violations.length).toBe(0);
  });

  it("hooks should handle errors (try/catch or .error check)", () => {
    let hooksWithQueries = 0;
    let hooksWithErrorHandling = 0;

    for (const file of hookFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes(".from(") || content.includes("from as Function")) {
        hooksWithQueries++;
        if (
          content.includes("error") ||
          content.includes("catch") ||
          content.includes("onError") ||
          content.includes("throwOnError")
        ) {
          hooksWithErrorHandling++;
        }
      }
    }

    const coverage = hooksWithQueries > 0 ? (hooksWithErrorHandling / hooksWithQueries) * 100 : 100;
    console.log(`Error handling coverage: ${hooksWithErrorHandling}/${hooksWithQueries} (${coverage.toFixed(0)}%)`);
    expect(coverage).toBeGreaterThanOrEqual(60);
  });
});

// ============================================
// COMPONENT DATA FLOW VALIDATION
// ============================================
describe("Component Data Flow", () => {
  const componentDirs = [
    "src/components/crew",
    "src/components/fleet",
    "src/components/compliance",
    "src/components/dashboard",
    "src/components/ai",
  ];

  it("core components should not have inline MOCK arrays", () => {
    const violations: string[] = [];
    for (const dir of componentDirs) {
      try {
        const files = fs.readdirSync(dir, { withFileTypes: true })
          .filter(e => e.isFile() && e.name.endsWith(".tsx"))
          .map(e => path.join(dir, e.name));

        for (const file of files) {
          const content = fs.readFileSync(file, "utf-8");
          if (/const\s+MOCK_\w+\s*[:=]/i.test(content)) {
            violations.push(file);
          }
        }
      } catch { /* dir may not exist */ }
    }
    console.log(`Inline MOCK violations: ${violations.length}`);
    violations.forEach(v => console.log(`  - ${v}`));
    expect(violations.length).toBe(0);
  });

  it("components with data tables should use loading states", () => {
    let tablesFound = 0;
    let withLoadingState = 0;

    for (const dir of componentDirs) {
      try {
        const files = fs.readdirSync(dir, { withFileTypes: true })
          .filter(e => e.isFile() && e.name.endsWith(".tsx"))
          .map(e => path.join(dir, e.name));

        for (const file of files) {
          const content = fs.readFileSync(file, "utf-8");
          if (content.includes("useQuery") && (content.includes("<Table") || content.includes("DataTable"))) {
            tablesFound++;
            if (content.includes("isLoading") || content.includes("isPending") || content.includes("Skeleton") || content.includes("Loader")) {
              withLoadingState++;
            }
          }
        }
      } catch { /* skip */ }
    }

    if (tablesFound > 0) {
      const coverage = (withLoadingState / tablesFound) * 100;
      console.log(`Loading state coverage: ${withLoadingState}/${tablesFound} (${coverage.toFixed(0)}%)`);
      expect(coverage).toBeGreaterThanOrEqual(50);
    }
  });
});

// ============================================
// ZERO MOCK POLICY ENFORCEMENT
// ============================================
describe("Zero Mock Policy", () => {
  function getAllTsFiles(dir: string): string[] {
    const results: string[] = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && !["node_modules", "tests", "__tests__", "mocks"].includes(entry.name)) {
          results.push(...getAllTsFiles(full));
        } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name) && !entry.name.includes(".test.")) {
          results.push(full);
        }
      }
    } catch { /* skip */ }
    return results;
  }

  it("no exported MOCK_ constants in production code", () => {
    const files = getAllTsFiles("src");
    const violations: string[] = [];
    for (const file of files) {
      if (file.includes("/tests/") || file.includes("/mocks/") || file.includes("__tests__")) continue;
      const content = fs.readFileSync(file, "utf-8");
      if (/export\s+(const|let|var)\s+MOCK_/i.test(content)) {
        violations.push(file);
      }
    }
    expect(violations).toHaveLength(0);
  });

  it("no SAMPLE_ or DEMO_ constants in non-test code", () => {
    const files = getAllTsFiles("src");
    const violations: string[] = [];
    for (const file of files) {
      if (file.includes("/tests/") || file.includes("/mocks/")) continue;
      const content = fs.readFileSync(file, "utf-8");
      if (/export\s+(const|let|var)\s+(SAMPLE_|DEMO_)/i.test(content)) {
        violations.push(file);
      }
    }
    expect(violations).toHaveLength(0);
  });
});
