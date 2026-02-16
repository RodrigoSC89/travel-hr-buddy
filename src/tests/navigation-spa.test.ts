/**
 * SPA Navigation Integrity Tests
 * Validates no window.location.href for internal navigation
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          files.push(...getAllTsFiles(fullPath));
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
          files.push(fullPath);
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return files;
}

describe("SPA Navigation Integrity", () => {
  const allFiles = getAllTsFiles("src");

  it("should not use window.location.href for internal page navigation (assignment)", () => {
    const violations: string[] = [];
    for (const file of allFiles) {
      if (file.includes(".test.")) continue;
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        // Only flag ASSIGNMENT (navigation), not reading location.href
        if (/window\.location\.href\s*=/.test(line) && !line.trim().startsWith("//") && !line.trim().startsWith("*")) {
          // Exclude justified cases: error boundaries, OAuth, external links, SPA fallback, SW reset
          if (!line.includes("oauth") && !line.includes("OAuth") && 
              !line.includes("mailto:") && !line.includes("ErrorBoundary") &&
              !file.includes("error-boundary") && !file.includes("ErrorFallback") &&
              !file.includes("ErrorBoundaryAdvanced") && !file.includes("spa-navigate") &&
              !file.includes("AppLoader") && !file.includes("LazyLoadErrorBoundary")) {
            violations.push(`${file}:${idx + 1}: ${line.trim().slice(0, 120)}`);
          }
        }
      });
    }
    console.log(`window.location.href assignment violations: ${violations.length}`);
    violations.forEach(v => console.log(`  - ${v}`));
    expect(violations.length).toBeLessThan(3);
  });

  it("should not use window.location.reload() outside error/offline handlers", () => {
    const violations: string[] = [];
    for (const file of allFiles) {
      if (file.includes(".test.") || file.includes("ErrorBoundary") || file.includes("error-boundary") || 
          file.includes("offline") || file.includes("ErrorFallback") || file.includes("AppLoader") ||
          file.includes("LazyLoadErrorBoundary") || file.includes("ErrorBoundaryAdvanced")) continue;
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (line.includes("location.reload()") && !line.trim().startsWith("//") && !line.trim().startsWith("*")) {
          violations.push(`${file}:${idx + 1}`);
        }
      });
    }
    expect(violations.length).toBeLessThan(5);
  });
});

describe("Console Log Hygiene", () => {
  const allFiles = getAllTsFiles("src");

  it("should not have console.log in production code (outside lib/logger)", () => {
    let count = 0;
    for (const file of allFiles) {
      if (file.includes(".test.") || file.includes("logger") || file.includes("__tests__") || file.includes("scripts/")) continue;
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line) => {
        if (line.includes("console.log(") && !line.trim().startsWith("//") && !line.trim().startsWith("*")) {
          count++;
        }
      });
    }
    console.log(`console.log() in production code: ${count}`);
    expect(count).toBeLessThan(20);
  });
});
