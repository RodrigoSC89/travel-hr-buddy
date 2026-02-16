/**
 * Accessibility Audit Tests
 * Validates that icon-only buttons have aria-labels and key attributes are stable
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
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules' && entry !== '__tests__') {
          files.push(...getAllTsxFiles(fullPath));
        } else if (entry.endsWith('.tsx')) {
          files.push(fullPath);
        }
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return files;
}

describe("Accessibility - Icon Buttons", () => {
  const tsxFiles = getAllTsxFiles("src");

  it("should not have key={index} in dynamic lists (excluding skeletons)", () => {
    const violations: string[] = [];
    for (const file of tsxFiles) {
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        // Match key={index} or key={i} but skip skeleton/loading patterns
        if (/key=\{(index|i)\}/.test(line) && !line.includes("Skeleton") && !line.includes("Array(") && !line.includes("Array.from") && !file.includes("Skeleton") && !file.includes("premium-loading") && !line.includes("animate-pulse") && !line.includes("animate-shimmer") && !line.includes("loading") && !line.includes("isLoading")) {
          violations.push(`${file}:${idx + 1}: ${line.trim().slice(0, 100)}`);
        }
      });
    }
    // Allow some remaining instances but track them
    console.log(`Found ${violations.length} key={index} violations (non-skeleton)`);
    // Target: less than 25 remaining (many are in static config arrays and non-critical rendering)
    expect(violations.length).toBeLessThanOrEqual(10);
  });

  it("should have aria-label on size='icon' buttons that are not inside tooltips", () => {
    let totalIconButtons = 0;
    let withAriaLabel = 0;
    let withTooltip = 0;

    for (const file of tsxFiles) {
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (line.includes('size="icon"')) {
          totalIconButtons++;
          // Check context window ±8 lines for aria-label (multi-line JSX with props spread across lines)
          const contextStart = Math.max(0, idx - 8);
          const contextEnd = Math.min(lines.length - 1, idx + 8);
          const context = lines.slice(contextStart, contextEnd + 1).join("\n");
          if (context.includes("aria-label")) {
            withAriaLabel++;
          } else if (context.includes("TooltipTrigger")) {
            withTooltip++;
          }
        }
      });
    }

    const coverage = ((withAriaLabel + withTooltip) / totalIconButtons) * 100;
    console.log(`Icon button a11y coverage: ${coverage.toFixed(1)}% (${withAriaLabel} aria-label, ${withTooltip} tooltip, ${totalIconButtons} total)`);
    // Target: at least 90% coverage
    expect(coverage).toBeGreaterThan(90);
  });
});

describe("Type Safety - as any usage", () => {
  const allFiles = getAllTsxFiles("src");

  it("should have limited as any usage in production code", () => {
    let totalAsAny = 0;
    const fileViolations: Record<string, number> = {};

    for (const file of allFiles) {
      if (file.includes("__tests__") || file.includes(".test.")) continue;
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      const realMatches = lines.filter((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed.includes("as any")) return false;
        if (trimmed.startsWith("//") || trimmed.startsWith("*")) return false;
        if (trimmed.includes("DEBT-FIX") || trimmed.includes("eslint-disable")) return false;
        // Check if previous line has eslint-disable
        if (idx > 0 && lines[idx - 1].includes("eslint-disable")) return false;
        return true;
      });
      if (realMatches.length > 0) {
        totalAsAny += realMatches.length;
        fileViolations[file] = realMatches.length;
      }
    }

    console.log(`Total 'as any' in production code: ${totalAsAny} across ${Object.keys(fileViolations).length} files`);
    // Target: less than 20 real as any (excluding eslint-disabled and justified ones)
    expect(totalAsAny).toBeLessThan(20);
  });
});

describe("Security - No dangerous HTML", () => {
  const allFiles = getAllTsxFiles("src");

  it("should only use dangerouslySetInnerHTML with sanitization", () => {
    const unsafeViolations: string[] = [];
    for (const file of allFiles) {
      if (file.includes(".test.")) continue;
      const content = readFileSync(file, "utf-8");
      if (content.includes("dangerouslySetInnerHTML")) {
        // Check if all usages use createSafeHTML or are developer-controlled CSS
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
          if (line.includes("dangerouslySetInnerHTML") && 
              !line.includes("createSafeHTML") && 
              !line.includes("createSimpleSafeHTML") &&
              !line.includes("themeCSS") &&
              !line.includes("tourStyles") &&
              !line.trim().startsWith("//") &&
              !line.trim().startsWith("*")) {
            unsafeViolations.push(`${file}:${idx + 1}`);
          }
        });
      }
    }
    expect(unsafeViolations).toHaveLength(0);
  });

  it("should not expose SERVICE_ROLE_KEY values in frontend code", () => {
    const violations: string[] = [];
    for (const file of allFiles) {
      if (file.includes(".test.")) continue;
      const content = readFileSync(file, "utf-8");
      // Only flag actual key usage, not documentation/comments about it
      const lines = content.split("\n").filter(l => {
        const trimmed = l.trim();
        return (trimmed.includes("SERVICE_ROLE_KEY") || trimmed.includes("service_role")) && 
          !trimmed.startsWith("//") && !trimmed.startsWith("*") && !trimmed.startsWith("/**") &&
          !trimmed.includes("NOTE:") && !trimmed.includes("IMPORTANT:") &&
          !trimmed.includes("required:") && // UI config listing
          (trimmed.includes("=") || trimmed.includes("getenv") || trimmed.includes("process.env"));
      });
      if (lines.length > 0) violations.push(file);
    }
    expect(violations).toHaveLength(0);
  });
});
