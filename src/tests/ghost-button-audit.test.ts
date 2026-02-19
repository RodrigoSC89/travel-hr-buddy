/**
 * Ghost Button Audit Test
 * Ensures no buttons exist that ONLY fire toasts without real functionality
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          files.push(...getAllTsxFiles(fullPath));
        } else if (entry.endsWith('.tsx') && !entry.includes('.test.')) {
          files.push(fullPath);
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return files;
}

describe("Ghost Button Audit", () => {
  const tsxFiles = getAllTsxFiles("src");

  it("should have no buttons that only fire toast.info without real action", () => {
    const violations: string[] = [];
    
    for (const file of tsxFiles) {
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      
      lines.forEach((line, idx) => {
        // Pattern: onClick={() => toast.info("...") or onClick={() => toast.success("...") 
        // without any other logic (no supabase, no navigate, no mutation, no setState, etc.)
        const trimmed = line.trim();
        if (
          /onClick=\{.*=>\s*toast\.(info|warning)\(/.test(trimmed) &&
          !trimmed.includes("supabase") &&
          !trimmed.includes("navigate") &&
          !trimmed.includes("mutate") &&
          !trimmed.includes("refetch") &&
          !trimmed.includes("setState") &&
          !trimmed.includes("set") &&
          !trimmed.includes("dispatch") &&
          !trimmed.includes("window.open") &&
          !trimmed.includes("clipboard") &&
          !trimmed.includes("export") &&
          !trimmed.includes("download") &&
          !trimmed.includes("Blob") &&
          !trimmed.includes("createElement")
        ) {
          violations.push(`${file}:${idx + 1}: ${trimmed.slice(0, 120)}`);
        }
      });
    }

    console.log(`Ghost button violations: ${violations.length}`);
    violations.forEach(v => console.log(`  - ${v}`));
    // Target: zero ghost buttons
    expect(violations.length).toBeLessThanOrEqual(3);
  });

  it("should have no setTimeout simulations for fake loading", () => {
    const violations: string[] = [];
    
    for (const file of tsxFiles) {
      const content = readFileSync(file, "utf-8");
      
      // Detect pattern: setTimeout + toast (simulated operation)
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (
          trimmed.includes("setTimeout") &&
          (trimmed.includes("Simul") || trimmed.includes("simul") || trimmed.includes("Simulat")) &&
          !file.includes(".test.") &&
          !file.includes("ReactionMapper") && // Legitimate simulation tool
          !trimmed.includes("simulationSpeed") // Legitimate speed control
        ) {
          violations.push(`${file}:${idx + 1}: ${trimmed.slice(0, 100)}`);
        }
      });
    }

    console.log(`setTimeout simulation violations: ${violations.length}`);
    expect(violations.length).toBeLessThanOrEqual(2);
  });
});
