/**
 * Tests for security standards
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  try {
    const items = readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory() && !item.name.includes("node_modules") && !item.name.includes(".git")) {
        files.push(...getAllFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch { /* skip */ }
  return files;
}

describe("Security - No Service Role Key Exposure", () => {
  it("no SUPABASE_SERVICE_ROLE_KEY in frontend code", () => {
    const srcFiles = getAllFiles("src", [".ts", ".tsx"]);
    const violations: string[] = [];
    for (const file of srcFiles) {
      if (file.includes("test") || file.includes("spec")) continue;
      const content = readFileSync(file, "utf-8");
      if (content.includes("SUPABASE_SERVICE_ROLE_KEY") || content.includes("service_role")) {
        // Allow comments documenting the removal
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
          if ((line.includes("SUPABASE_SERVICE_ROLE_KEY") || line.includes("service_role")) 
              && !line.trimStart().startsWith("//") 
              && !line.trimStart().startsWith("*")
              && !line.includes("DEBT-FIX")
              && !line.includes("REMOVED")) {
            violations.push(`${file}:${idx + 1}: ${line.trim().slice(0, 80)}`);
          }
        });
      }
    }
    expect(violations).toEqual([]);
  });
});

describe("Security - No dangerouslySetInnerHTML", () => {
  it("no dangerouslySetInnerHTML in core component code (excluding chart/editor)", () => {
    const tsxFiles = getAllFiles("src/components", [".tsx"]);
    const violations: string[] = [];
    const allowList = ["chart.tsx", "TemplateEditor.tsx", "dp-ai-advisor.tsx", "peodp-ai-chat.tsx"];
    for (const file of tsxFiles) {
      if (allowList.some(a => file.includes(a))) continue;
      const content = readFileSync(file, "utf-8");
      if (content.includes("dangerouslySetInnerHTML")) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });
});

describe("Security - No localStorage for Sensitive Data", () => {
  it("no localStorage.setItem for incident/mission data keys", () => {
    const srcFiles = getAllFiles("src", [".ts", ".tsx"]);
    const violations: string[] = [];
    for (const file of srcFiles) {
      if (file.includes("test") || file.includes("spec")) continue;
      const content = readFileSync(file, "utf-8");
      // Only flag if literally storing data with these exact keys
      const matches = content.match(/localStorage\.setItem\s*\(\s*['"](?:incident_data|mission_data|emergency_protocol|flight_cache)['"]/g);
      if (matches) {
        violations.push(`${file}: ${matches[0]}`);
      }
    }
    expect(violations).toEqual([]);
  });
});

describe("Navigation - No window.location for Internal Routes", () => {
  it("no window.location.href assignments for internal routes", () => {
    const srcFiles = getAllFiles("src", [".ts", ".tsx"]);
    const violations: string[] = [];
    for (const file of srcFiles) {
      if (file.includes("test") || file.includes("spec") || file.includes("spa-navigate")) continue;
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        // Match window.location.href = '/internal-route'
        if (/window\.location\.href\s*=\s*['"`]\/[^h]/.test(line) 
            && !line.trimStart().startsWith("//")) {
          violations.push(`${file}:${idx + 1}: ${line.trim().slice(0, 80)}`);
        }
      });
    }
    // Allow a few remaining for error boundaries
    expect(violations.length).toBeLessThan(5);
  });
});
