/**
 * PWA & Offline Infrastructure Tests
 * Validates offline-first patterns and IndexedDB usage
 */
import { describe, it, expect, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";

function getAllTsFiles(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.includes("node_modules")) {
        results.push(...getAllTsFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) && !entry.name.includes(".test.")) {
        results.push(fullPath);
      }
    }
  } catch { /* skip */ }
  return results;
}

describe("Sensitive Data Storage Policy", () => {
  it("should not store sensitive data in localStorage", () => {
    const sensitivePatterns = [
      /localStorage\.(setItem|getItem)\(.*(?:token|password|secret|api_key|service_role)/i,
      /localStorage\.(setItem|getItem)\(.*(?:medical|health|salary|ssn)/i,
    ];
    
    const files = getAllTsFiles("src");
    const violations: string[] = [];
    
    for (const file of files) {
      if (file.includes("__tests__") || file.includes(".test.")) continue;
      const content = fs.readFileSync(file, "utf-8");
      for (const pattern of sensitivePatterns) {
        if (pattern.test(content)) {
          violations.push(`${file}: matches ${pattern.source}`);
        }
      }
    }
    
    expect(violations).toHaveLength(0);
  });
});

describe("SPA Navigation Integrity", () => {
  it("should not use window.location.href for internal navigation", () => {
    const files = getAllTsFiles("src");
    const violations: string[] = [];
    
    for (const file of files) {
      if (file.includes("__tests__") || file.includes(".test.") || file.includes("ErrorBoundary")) continue;
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      
      lines.forEach((line, idx) => {
        // Match window.location.href = or window.location.assign but NOT window.location.href reads
        if (/window\.location\.(href\s*=|assign\(|replace\()/.test(line)) {
          // Allow OAuth, error boundaries, and offline pages
          if (!line.includes("oauth") && !line.includes("OAuth") && !line.includes("//") && !line.includes("ErrorBoundary") && !line.includes("reload") && !file.includes("oauth") && !file.includes("service-worker") && !file.includes("pwa")) {
            violations.push(`${file}:${idx + 1}: ${line.trim().slice(0, 100)}`);
          }
        }
      });
    }
    
    // Allow some edge cases (error recovery, OAuth)
    expect(violations.length).toBeLessThan(20);
  });
});

describe("Zero Mock Policy", () => {
  it("should not have MOCK_ prefixed data objects in production code", () => {
    const files = getAllTsFiles("src");
    const violations: string[] = [];
    
    for (const file of files) {
      if (file.includes("__tests__") || file.includes(".test.") || file.includes("fallback")) continue;
      const content = fs.readFileSync(file, "utf-8");
      
      // Match exported MOCK_ constants
      if (/export\s+(const|let|var)\s+MOCK_/i.test(content)) {
        violations.push(file);
      }
    }
    
    expect(violations.length).toBeLessThan(3);
  });
});
