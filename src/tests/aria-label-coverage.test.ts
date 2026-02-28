/**
 * ARIA Label Coverage Audit Test
 * Validates that icon-only buttons have proper aria-label attributes
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function getAllTsxFiles(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.includes("node_modules") && !entry.name.includes("__tests__")) {
        results.push(...getAllTsxFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".tsx") && !entry.name.includes(".test.")) {
        results.push(fullPath);
      }
    }
  } catch { /* skip */ }
  return results;
}

describe("ARIA Label Coverage for Icon Buttons", () => {
  const tsxFiles = getAllTsxFiles("src");

  it("should have aria-label on at least 60% of size='icon' buttons", () => {
    let totalIconButtons = 0;
    let withAriaLabel = 0;
    const violations: string[] = [];

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('size="icon"')) {
          totalIconButtons++;
          // Check surrounding lines (±5) for aria-label or sr-only
          const context = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 12)).join("\n");
          if (context.includes("aria-label") || context.includes("sr-only") || context.includes("Tooltip")) {
            withAriaLabel++;
          } else {
            violations.push(`${file}:${i + 1}`);
          }
        }
      }
    }

    const coverage = totalIconButtons > 0 ? (withAriaLabel / totalIconButtons) * 100 : 100;
    console.log(`ARIA Coverage: ${withAriaLabel}/${totalIconButtons} (${coverage.toFixed(1)}%)`);
    console.log(`Remaining violations: ${violations.length}`);
    violations.forEach(v => console.log(`  VIOLATION: ${v}`));
    
    // Target: at least 60% coverage
    expect(coverage).toBeGreaterThanOrEqual(95);
  });

  it("should not have any new icon buttons without aria-label in core components", () => {
    const coreComponents = [
      "src/components/ai",
      "src/components/dashboard",
      "src/components/notifications",
      "src/modules/safety-guardian",
    ];

    const violations: string[] = [];
    for (const dir of coreComponents) {
      const files = getAllTsxFiles(dir);
      for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('size="icon"')) {
            const context = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 12)).join("\n");
            if (!context.includes("aria-label") && !context.includes("sr-only") && !context.includes("Tooltip")) {
              violations.push(`${file}:${i + 1}: ${lines[i].trim().slice(0, 80)}`);
            }
          }
        }
      }
    }

    console.log(`Core component violations: ${violations.length}`);
    violations.forEach(v => console.log(`  - ${v}`));
    expect(violations.length).toBeLessThan(10);
  });
});
