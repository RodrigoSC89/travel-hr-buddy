/**
 * Deterministic Quality Enforcement Tests
 * Ensures production code follows quality mandates
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function getProductionFiles(dir: string, ext: string): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.includes("node_modules") && !entry.name.includes("__tests__") && entry.name !== "tests") {
        results.push(...getProductionFiles(fullPath, ext));
      } else if (entry.isFile() && entry.name.endsWith(ext) && !entry.name.includes(".test.")) {
        results.push(fullPath);
      }
    }
  } catch { /* skip */ }
  return results;
}

describe("Zero console.log in Production", () => {
  it("should have no console.log in production components", () => {
    const files = getProductionFiles("src/components", ".tsx");
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("console.log(") && !lines[i].trim().startsWith("//")) {
          violations.push(`${file}:${i + 1}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});

describe("No Fake Latency Simulation", () => {
  it("should not use setTimeout loops to simulate progress", () => {
    const files = getProductionFiles("src/components", ".tsx");
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      // Pattern: for loop with setTimeout inside that updates progress (fake progress)
      if (/for\s*\([^)]*\)\s*\{[^}]*setTimeout[^}]*set(?:Progress|AnalyzeProgress)/s.test(content)) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });
});

describe("Math.random Policy", () => {
  it("should only use Math.random in Monte Carlo or decorative effects", () => {
    const files = getProductionFiles("src/components", ".tsx");
    const violations: string[] = [];
    const allowedFiles = ["MonteCarloRiskSimulator", "cinematic-effects"];
    for (const file of files) {
      if (allowedFiles.some(a => file.includes(a))) continue;
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("Math.random()") && !lines[i].trim().startsWith("//")) {
          violations.push(`${file}:${i + 1}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});

describe("No key={index} on Dynamic Data Lists", () => {
  it("should not use index keys in component data maps (skeletons excluded)", () => {
    const files = getProductionFiles("src/components", ".tsx");
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (/key=\{index\}/.test(lines[i])) {
          // Check context - if it's skeleton/loading, it's acceptable
          const context = lines.slice(Math.max(0, i - 3), i + 3).join("\n");
          if (!context.includes("Skeleton") && !context.includes("animate-pulse") && 
              !context.includes("shimmer") && !context.includes("Array.from") &&
              !context.includes("[1,2,3]") && !context.includes("[...Array")) {
            violations.push(`${file}:${i + 1}: ${lines[i].trim().slice(0, 80)}`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
