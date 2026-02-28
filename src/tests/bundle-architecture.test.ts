/**
 * Bundle Architecture & Performance Test Suite
 * Validates that heavy dependencies use dynamic imports and architecture is optimized
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

function getAllFiles(dir: string, ext: string): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist') {
          files.push(...getAllFiles(fullPath, ext));
        } else if (entry.endsWith(ext) && !entry.includes('.test.')) {
          files.push(fullPath);
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return files;
}

describe("Bundle Optimization - Heavy Dependencies", () => {
  const allFiles = [...getAllFiles("src", ".ts"), ...getAllFiles("src", ".tsx")];

  it("should not statically import 'three' as namespace (import * as THREE)", () => {
    const violations: string[] = [];
    for (const file of allFiles) {
      const content = readFileSync(file, "utf-8");
      if (/import\s+\*\s+as\s+THREE\s+from\s+["']three["']/.test(content)) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it("should dynamically import onnxruntime-web", () => {
    const violations: string[] = [];
    for (const file of allFiles) {
      const content = readFileSync(file, "utf-8");
      // Static import of the module itself (not type-only) is a violation
      if (/^import\s+(?!type).*from\s+["']onnxruntime-web["']/m.test(content)) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it("should dynamically import mapbox-gl", () => {
    const violations: string[] = [];
    for (const file of allFiles) {
      if (file.includes("mapbox-shim") || file.includes("heavy-libs-loader")) continue;
      const content = readFileSync(file, "utf-8");
      if (/^import\s+(?!type).*from\s+["']mapbox-gl["']/m.test(content)) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it("should dynamically import tensorflow", () => {
    const violations: string[] = [];
    for (const file of allFiles) {
      const content = readFileSync(file, "utf-8");
      if (/^import\s+(?!type).*from\s+["']@tensorflow\/tfjs["']/m.test(content)) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });
});

describe("Lazy Loading Architecture", () => {
  it("should have lazy-pages.ts for route code splitting", () => {
    expect(existsSync("src/routes/lazy-pages.ts") || existsSync("src/routes/lazy-pages.tsx")).toBe(true);
  });

  it("lazy-pages should use React.lazy for all page imports", () => {
    const lazyFile = existsSync("src/routes/lazy-pages.ts")
      ? readFileSync("src/routes/lazy-pages.ts", "utf-8")
      : existsSync("src/routes/lazy-pages.tsx")
        ? readFileSync("src/routes/lazy-pages.tsx", "utf-8")
        : "";
    const lazyCount = (lazyFile.match(/lazy\s*\(/g) || []).length;
    // Should have many lazy imports
    expect(lazyCount).toBeGreaterThan(10);
  });

  it("should have route prefetch utility", () => {
    expect(existsSync("src/lib/performance/route-prefetch.ts")).toBe(true);
  });
});

describe("Performance Provider Architecture", () => {
  it("PerformanceProvider should exist and export usePerformance", () => {
    const content = readFileSync("src/components/ui/PerformanceProvider.tsx", "utf-8");
    expect(content).toContain("export function PerformanceProvider");
    expect(content).toContain("export function usePerformance");
  });

  it("App.tsx should wrap with PerformanceProvider", () => {
    const content = readFileSync("src/App.tsx", "utf-8");
    expect(content).toContain("PerformanceProvider");
  });

  it("should have useResilientQuery for low-bandwidth resilience", () => {
    expect(existsSync("src/hooks/useResilientQuery.ts")).toBe(true);
    const content = readFileSync("src/hooks/useResilientQuery.ts", "utf-8");
    expect(content).toContain("exponential");
    expect(content).toContain("fallbackData");
  });
});

describe("Page Transitions & UX Polish", () => {
  it("should have SmoothPageTransition component", () => {
    expect(existsSync("src/components/ui/SmoothPageTransition.tsx")).toBe(true);
  });

  it("AuthenticatedLayout should use page transitions", () => {
    const content = readFileSync("src/routes/AuthenticatedLayout.tsx", "utf-8");
    expect(content).toContain("PageTransition") ;
  });

  it("should have EmptyState component", () => {
    expect(existsSync("src/components/ui/EmptyState.tsx")).toBe(true);
  });

  it("should have HubEmptyState for mega-hubs", () => {
    expect(existsSync("src/components/ui/HubEmptyState.tsx")).toBe(true);
  });

  it("should have loading skeleton variants", () => {
    const content = readFileSync("src/components/ui/LoadingSkeleton.tsx", "utf-8");
    expect(content).toContain("KPICardsSkeleton");
    expect(content).toContain("TableSkeleton");
    expect(content).toContain("ChartSkeleton");
  });
});

describe("Error Handling Architecture", () => {
  it("should have LazyLoadErrorBoundary in App.tsx", () => {
    const content = readFileSync("src/App.tsx", "utf-8");
    expect(content).toContain("LazyLoadErrorBoundary");
  });

  it("should have ModuleErrorBoundary for per-module isolation", () => {
    expect(existsSync("src/components/error/ModuleErrorBoundary.tsx")).toBe(true);
  });

  it("should handle unhandled rejections globally", () => {
    const content = readFileSync("src/App.tsx", "utf-8");
    expect(content).toContain("unhandledrejection");
  });
});

describe("PWA & Offline Architecture", () => {
  it("should have service worker", () => {
    expect(existsSync("public/sw.js")).toBe(true);
  });

  it("should have PWA manifest", () => {
    expect(existsSync("public/manifest.json") || existsSync("public/manifest.webmanifest")).toBe(true);
  });

  it("should have IndexedDB offline database", () => {
    expect(existsSync("src/lib/offline/db.ts")).toBe(true);
  });

  it("should have sync queue for offline mutations", () => {
    expect(existsSync("src/lib/offline/sync-queue.ts")).toBe(true);
  });
});
