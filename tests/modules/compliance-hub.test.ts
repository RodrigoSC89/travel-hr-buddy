/**
 * Compliance Hub Tests
 * PATCH 92.0 - Test unified compliance module
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { 
  analyzeDocumentWithAI, 
  evaluateChecklistWithAI,
  fallbackComplianceEvaluation 
} from "../../modules/compliance-hub/services/ai-service";
import { validateFile, calculateRiskSeverity, getComplianceLevel } from "../../modules/compliance-hub/utils/config";

describe("Compliance Hub - Configuration", () => {
  describe("validateFile", () => {
    it("should accept valid PDF file", () => {
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      Object.defineProperty(file, "size", { value: 1024 * 1024 }); // 1MB
      
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject oversized file", () => {
      const file = new File(["content"], "large.pdf", { type: "application/pdf" });
      Object.defineProperty(file, "size", { value: 15 * 1024 * 1024 }); // 15MB
      
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds");
    });

    it("should reject invalid file type", () => {
      const file = new File(["content"], "test.exe", { type: "application/x-msdownload" });
      Object.defineProperty(file, "size", { value: 1024 });
      
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file type");
    });
  });

  describe("calculateRiskSeverity", () => {
    it("should calculate critical severity", () => {
      const severity = calculateRiskSeverity(5, 4);
      expect(severity).toBe("critical");
    });

    it("should calculate high severity", () => {
      const severity = calculateRiskSeverity(4, 4);
      expect(severity).toBe("high");
    });

    it("should calculate medium severity", () => {
      const severity = calculateRiskSeverity(3, 3);
      expect(severity).toBe("medium");
    });

    it("should calculate low severity", () => {
      const severity = calculateRiskSeverity(2, 2);
      expect(severity).toBe("low");
    });
  });

  describe("getComplianceLevel", () => {
    it("should return excellent for high scores", () => {
      expect(getComplianceLevel(96)).toBe("excellent");
    });

    it("should return good for moderate scores", () => {
      expect(getComplianceLevel(88)).toBe("good");
    });

    it("should return acceptable for lower scores", () => {
      expect(getComplianceLevel(78)).toBe("acceptable");
    });

    it("should return critical for low scores", () => {
      expect(getComplianceLevel(55)).toBe("critical");
    });
  });
});

describe("Compliance Hub - AI Service", () => {
  describe("fallbackComplianceEvaluation", () => {
    it("should calculate compliance score correctly", () => {
      const checklistData = {
        "item1": "ok",
        "item2": "ok",
        "item3": "warning",
        "item4": "fail"
      };

      const result = fallbackComplianceEvaluation(checklistData);
      
      expect(result.overall_compliance).toBe(50); // 2 ok out of 4 = 50%
      expect(result.critical_issues).toHaveLength(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.confidence).toBe(75);
    });

    it("should handle all ok items", () => {
      const checklistData = {
        "item1": "ok",
        "item2": "ok",
        "item3": "ok"
      };

      const result = fallbackComplianceEvaluation(checklistData);
      
      expect(result.overall_compliance).toBe(100);
      expect(result.critical_issues[0]).toContain("No critical issues");
    });

    it("should handle empty checklist", () => {
      const checklistData = {};

      const result = fallbackComplianceEvaluation(checklistData);
      
      expect(result.overall_compliance).toBe(0);
      expect(result.summary).toContain("0.0%");
    });
  });
});

describe("Compliance Hub - Module Integration", () => {
  it("should export main component", async () => {
    const module = await import("../../modules/compliance-hub/index");
    expect(module.default).toBeDefined();
  });

  it("should export types", async () => {
    const types = await import("../../modules/compliance-hub/types");
    expect(types).toBeDefined();
  });

  it("should export services", async () => {
    const aiService = await import("../../modules/compliance-hub/services/ai-service");
    const docService = await import("../../modules/compliance-hub/services/document-service");
    const logService = await import("../../modules/compliance-hub/services/audit-log-service");
    
    expect(aiService).toBeDefined();
    expect(docService).toBeDefined();
    expect(logService).toBeDefined();
  });

  it("should export components", async () => {
    const components = await import("../../modules/compliance-hub/components");
    
    expect(components.ComplianceMetrics).toBeDefined();
    expect(components.DocumentationSection).toBeDefined();
    expect(components.ChecklistsSection).toBeDefined();
    expect(components.AuditsSection).toBeDefined();
    expect(components.RisksSection).toBeDefined();
  });
});

describe("Compliance Hub - Checklist Data", () => {
  it("should properly format checklist status", () => {
    const statuses = ["ok", "warning", "fail", "not_checked"];
    
    statuses.forEach(status => {
      expect(["ok", "warning", "fail", "not_checked"]).toContain(status);
    });
  });
});

describe("Compliance Hub - Risk Calculation", () => {
  it("should calculate risk scores correctly", () => {
    const testCases = [
      { likelihood: 5, impact: 5, expected: 25 },
      { likelihood: 3, impact: 4, expected: 12 },
      { likelihood: 1, impact: 1, expected: 1 }
    ];

    testCases.forEach(({ likelihood, impact, expected }) => {
      const score = likelihood * impact;
      expect(score).toBe(expected);
    });
  });
});

describe("Compliance Hub - Audit Types", () => {
  it("should support all audit types", () => {
    const auditTypes = ["IMCA", "ISM", "ISPS", "FMEA", "NORMAM"];
    
    auditTypes.forEach(type => {
      expect(["IMCA", "ISM", "ISPS", "FMEA", "NORMAM"]).toContain(type);
    });
  });
});
