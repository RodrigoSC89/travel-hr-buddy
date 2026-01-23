/**
 * Code Quality Checker Tests
 * PATCH: QUALITY-10/10 - Unit tests for quality validation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DOM environment
const mockDocument = {
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  documentElement: { lang: "pt-BR" },
  styleSheets: { length: 1 },
};

const mockWindow = {
  location: {
    protocol: "https:",
    hostname: "nautione.com.br",
  },
};

vi.stubGlobal("document", mockDocument);
vi.stubGlobal("window", mockWindow);
vi.stubGlobal("navigator", { serviceWorker: {} });
vi.stubGlobal("Storage", class {});
vi.stubGlobal("performance", { memory: undefined });

describe("CodeQualityChecker", () => {
  let checker: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockDocument.querySelector.mockReturnValue(null);
    mockDocument.querySelectorAll.mockReturnValue([]);

    const module = await import("@/lib/quality/code-quality-checker");
    checker = module.codeQualityChecker;
  });

  describe("runAllChecks", () => {
    it("should return a complete quality report", async () => {
      const report = await checker.runAllChecks();

      expect(report).toHaveProperty("timestamp");
      expect(report).toHaveProperty("score");
      expect(report).toHaveProperty("grade");
      expect(report).toHaveProperty("checks");
      expect(report).toHaveProperty("recommendations");
    });

    it("should include checks from all categories", async () => {
      const report = await checker.runAllChecks();

      const categories = new Set(report.checks.map((c: any) => c.category));
      expect(categories.has("typescript")).toBe(true);
      expect(categories.has("security")).toBe(true);
      expect(categories.has("performance")).toBe(true);
      expect(categories.has("accessibility")).toBe(true);
      expect(categories.has("testing")).toBe(true);
    });

    it("should calculate score between 0 and 100", async () => {
      const report = await checker.runAllChecks();

      expect(report.score).toBeGreaterThanOrEqual(0);
      expect(report.score).toBeLessThanOrEqual(100);
    });

    it("should assign correct grade based on score", async () => {
      const report = await checker.runAllChecks();

      const validGrades = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];
      expect(validGrades).toContain(report.grade);
    });
  });

  describe("Security Checks", () => {
    it("should pass HTTPS check for secure connections", async () => {
      mockWindow.location.protocol = "https:";

      const report = await checker.runAllChecks();
      const httpsCheck = report.checks.find((c: any) => c.name === "HTTPS");

      expect(httpsCheck).toBeDefined();
      expect(httpsCheck?.status).toBe("pass");
    });

    it("should fail HTTPS check for insecure connections", async () => {
      mockWindow.location.protocol = "http:";
      mockWindow.location.hostname = "production.com";

      const report = await checker.runAllChecks();
      const httpsCheck = report.checks.find((c: any) => c.name === "HTTPS");

      expect(httpsCheck).toBeDefined();
      expect(httpsCheck?.status).toBe("fail");
    });

    it("should pass HTTPS check for localhost", async () => {
      mockWindow.location.protocol = "http:";
      mockWindow.location.hostname = "localhost";

      const report = await checker.runAllChecks();
      const httpsCheck = report.checks.find((c: any) => c.name === "HTTPS");

      expect(httpsCheck?.status).toBe("pass");
    });
  });

  describe("Accessibility Checks", () => {
    it("should pass language check when lang is set", async () => {
      mockDocument.documentElement.lang = "pt-BR";

      const report = await checker.runAllChecks();
      const langCheck = report.checks.find(
        (c: any) => c.name === "Language Attribute"
      );

      expect(langCheck?.status).toBe("pass");
      expect(langCheck?.message).toContain("pt-BR");
    });

    it("should fail language check when lang is empty", async () => {
      mockDocument.documentElement.lang = "";

      const report = await checker.runAllChecks();
      const langCheck = report.checks.find(
        (c: any) => c.name === "Language Attribute"
      );

      expect(langCheck?.status).toBe("fail");
    });

    it("should check image alt attributes coverage", async () => {
      mockDocument.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === "img") return [1, 2, 3, 4, 5]; // 5 images
        if (selector === "img[alt]") return [1, 2, 3, 4]; // 4 with alt
        return [];
      });

      const report = await checker.runAllChecks();
      const altCheck = report.checks.find(
        (c: any) => c.name === "Image Alt Attributes"
      );

      expect(altCheck).toBeDefined();
      expect(altCheck?.message).toContain("4/5");
    });

    it("should check for H1 heading", async () => {
      mockDocument.querySelector.mockImplementation((selector: string) => {
        if (selector === "h1") return { tagName: "H1" };
        return null;
      });

      const report = await checker.runAllChecks();
      const headingCheck = report.checks.find(
        (c: any) => c.name === "Heading Structure"
      );

      expect(headingCheck?.status).toBe("pass");
    });
  });

  describe("Performance Checks", () => {
    it("should check for service worker support", async () => {
      const report = await checker.runAllChecks();
      const swCheck = report.checks.find(
        (c: any) => c.name === "Service Worker"
      );

      expect(swCheck).toBeDefined();
      expect(swCheck?.status).toBe("pass");
    });

    it("should check for lazy loading", async () => {
      mockDocument.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'img[loading="lazy"]') return [1, 2];
        return [];
      });

      const report = await checker.runAllChecks();
      const lazyCheck = report.checks.find(
        (c: any) => c.name === "Lazy Loading"
      );

      expect(lazyCheck?.status).toBe("pass");
    });
  });

  describe("Testing Checks", () => {
    it("should include unit test check", async () => {
      const report = await checker.runAllChecks();
      const unitCheck = report.checks.find((c: any) => c.name === "Unit Tests");

      expect(unitCheck).toBeDefined();
      expect(unitCheck?.status).toBe("pass");
    });

    it("should include E2E test check", async () => {
      const report = await checker.runAllChecks();
      const e2eCheck = report.checks.find((c: any) => c.name === "E2E Tests");

      expect(e2eCheck).toBeDefined();
      expect(e2eCheck?.status).toBe("pass");
    });
  });

  describe("Recommendations", () => {
    it("should generate recommendations for non-passing checks", async () => {
      mockDocument.documentElement.lang = ""; // Fail this check

      const report = await checker.runAllChecks();

      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it("should mark critical issues with red indicator", async () => {
      mockWindow.location.protocol = "http:";
      mockWindow.location.hostname = "production.com";

      const report = await checker.runAllChecks();
      const criticalRec = report.recommendations.find((r: string) =>
        r.startsWith("🔴")
      );

      expect(criticalRec).toBeDefined();
    });
  });
});
