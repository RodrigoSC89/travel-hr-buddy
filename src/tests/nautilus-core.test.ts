/**
 * Tests for Nautilus Intelligence Core - Analyzer
 */

import { describe, it, expect } from "vitest";
import { analyzeLogs, generateSummary } from "@/ai/nautilus-core/analyzer";

describe("Nautilus Intelligence Core - Analyzer", () => {
  it("should detect missing file errors", () => {
    const logs = `
      Error: ENOENT: no such file or directory
      Cannot find module '@/components/Invalid'
    `;

    const result = analyzeLogs(logs, "Test Workflow", 1);

    expect(result.hasIssues).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].type).toBe("missing_file");
    expect(result.findings[0].severity).toBe("critical");
  });

  it("should detect low contrast issues", () => {
    const logs = `
      WCAG Violation: contrast ratio below 4.5:1
    `;

    const result = analyzeLogs(logs, "Test Workflow", 2);

    expect(result.hasIssues).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].type).toBe("low_contrast");
    expect(result.findings[0].severity).toBe("medium");
  });

  it("should detect reference errors", () => {
    const logs = `
      ReferenceError: someVariable is not defined
    `;

    const result = analyzeLogs(logs, "Test Workflow", 3);

    expect(result.hasIssues).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].type).toBe("reference_error");
    expect(result.findings[0].severity).toBe("critical");
  });

  it("should detect low coverage", () => {
    const logs = `
      Coverage: 78% (coverage < 85% threshold)
    `;

    const result = analyzeLogs(logs, "Test Workflow", 4);

    expect(result.hasIssues).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].type).toBe("low_coverage");
    expect(result.findings[0].severity).toBe("high");
  });

  it("should detect build failures", () => {
    const logs = `
      error TS2304: Cannot find name 'Component'
      Build failed with 1 error
    `;

    const result = analyzeLogs(logs, "Test Workflow", 5);

    expect(result.hasIssues).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].type).toBe("build_failure");
    expect(result.findings[0].severity).toBe("critical");
  });

  it("should detect test failures", () => {
    const logs = `
      FAIL src/tests/component.test.ts
      ✕ should render correctly
    `;

    const result = analyzeLogs(logs, "Test Workflow", 6);

    expect(result.hasIssues).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].type).toBe("test_failure");
    expect(result.findings[0].severity).toBe("high");
  });

  it("should detect suspended button issues", () => {
    const logs = `
      ⚠️ WCAG: suspended button detected in DOM
    `;

    const result = analyzeLogs(logs, "Test Workflow", 7);

    expect(result.hasIssues).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].type).toBe("suspended_button");
    expect(result.findings[0].severity).toBe("medium");
  });

  it("should detect Vercel deployment failures", () => {
    const logs = `
      Vercel deployment failed: Build exceeded time limit
    `;

    const result = analyzeLogs(logs, "Test Workflow", 8);

    expect(result.hasIssues).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].type).toBe("vercel_failure");
    expect(result.findings[0].severity).toBe("high");
  });

  it("should detect multiple issues in one log", () => {
    const logs = `
      error TS2304: Cannot find name 'Component'
      Build failed with 1 error
      Coverage: 78% (coverage < 85%)
      FAIL src/tests/component.test.ts
    `;

    const result = analyzeLogs(logs, "Test Workflow", 9);

    expect(result.hasIssues).toBe(true);
    expect(result.findings.length).toBeGreaterThan(1);
  });

  it("should return no issues for clean logs", () => {
    const logs = `
      Build successful
      All tests passed
      Coverage: 92%
    `;

    const result = analyzeLogs(logs, "Test Workflow", 10);

    expect(result.hasIssues).toBe(false);
    expect(result.findings).toHaveLength(0);
  });

  it("should generate summary correctly", () => {
    const logs = `
      error TS2304: Cannot find name 'Component'
      Build failed
    `;

    const result = analyzeLogs(logs, "Test Workflow", 11);
    const summary = generateSummary(result);

    expect(summary).toContain("Nautilus Intelligence Core");
    expect(summary).toContain("Test Workflow");
    expect(summary).toContain("Issues Detected");
    expect(summary).toContain("Build failure");
  });

  it("should extract context from logs", () => {
    const logs = `
      Line 1
      Line 2
      error TS2304: Cannot find name 'Component'
      Line 4
      Line 5
    `;

    const result = analyzeLogs(logs, "Test Workflow", 12);

    expect(result.findings[0].context).toBeDefined();
    expect(result.findings[0].context).toContain("error TS2304");
  });
});
