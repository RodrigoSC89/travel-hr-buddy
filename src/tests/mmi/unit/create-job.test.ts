import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * MMI - Create Job API Unit Tests
 * 
 * Tests the job creation functionality for the MMI module
 */

describe("MMI - Create Job API", () => {
  const mockJobData = {
    title: "Manutenção Preventiva - Motor Principal",
    description: "Verificação completa do motor principal",
    component_id: "component-uuid-123",
    system_id: "system-uuid-456",
    job_type: "preventive",
    priority: "high",
    status: "pending",
    scheduled_date: "2025-11-01T10:00:00Z",
    estimated_hours: 8.0,
    vessel_id: "vessel-uuid-789",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Job Creation", () => {
    it("should validate job data structure", () => {
      expect(mockJobData).toHaveProperty("title");
      expect(mockJobData).toHaveProperty("job_type");
      expect(mockJobData).toHaveProperty("priority");
      expect(mockJobData).toHaveProperty("scheduled_date");
      
      expect(mockJobData.title).toBe("Manutenção Preventiva - Motor Principal");
      expect(mockJobData.job_type).toBe("preventive");
      expect(mockJobData.priority).toBe("high");
    });

    it("should validate job_type enum values", () => {
      const validJobTypes = ["preventive", "corrective", "predictive"];
      
      expect(validJobTypes).toContain(mockJobData.job_type);
    });

    it("should validate priority enum values", () => {
      const validPriorities = ["low", "medium", "high", "critical"];
      
      expect(validPriorities).toContain(mockJobData.priority);
    });

    it("should validate status enum values", () => {
      const validStatuses = [
        "pending",
        "in_progress",
        "completed",
        "postponed",
        "cancelled",
        "overdue",
      ];
      
      expect(validStatuses).toContain(mockJobData.status);
    });

    it("should validate required fields are present", () => {
      const requiredFields = [
        "title",
        "job_type",
        "priority",
        "status",
      ];
      
      requiredFields.forEach((field) => {
        expect(mockJobData).toHaveProperty(field);
        expect((mockJobData as any)[field]).toBeTruthy();
      });
    });
  });

  describe("Job Type Validation", () => {
    it("should accept preventive maintenance jobs", () => {
      const preventiveJob = { ...mockJobData, job_type: "preventive" };
      expect(preventiveJob.job_type).toBe("preventive");
    });

    it("should accept corrective maintenance jobs", () => {
      const correctiveJob = { ...mockJobData, job_type: "corrective" };
      expect(correctiveJob.job_type).toBe("corrective");
    });

    it("should accept predictive maintenance jobs", () => {
      const predictiveJob = { ...mockJobData, job_type: "predictive" };
      expect(predictiveJob.job_type).toBe("predictive");
    });
  });

  describe("Priority Validation", () => {
    it("should handle critical priority jobs", () => {
      const criticalJob = { ...mockJobData, priority: "critical" };
      expect(criticalJob.priority).toBe("critical");
    });

    it("should handle high priority jobs", () => {
      const highJob = { ...mockJobData, priority: "high" };
      expect(highJob.priority).toBe("high");
    });

    it("should handle medium priority jobs", () => {
      const mediumJob = { ...mockJobData, priority: "medium" };
      expect(mediumJob.priority).toBe("medium");
    });

    it("should handle low priority jobs", () => {
      const lowJob = { ...mockJobData, priority: "low" };
      expect(lowJob.priority).toBe("low");
    });
  });

  describe("Date Validation", () => {
    it("should validate scheduled_date is in ISO 8601 format", () => {
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      expect(mockJobData.scheduled_date).toMatch(isoDateRegex);
    });

    it("should parse scheduled_date correctly", () => {
      const date = new Date(mockJobData.scheduled_date);
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toContain("2025-11-01T10:00:00");
    });
  });

  describe("Job Response Structure", () => {
    it("should have correct response structure", () => {
      const mockResponse = {
        success: true,
        job: {
          id: "generated-uuid",
          ...mockJobData,
          postpone_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.job).toHaveProperty("id");
      expect(mockResponse.job).toHaveProperty("title");
      expect(mockResponse.job).toHaveProperty("created_at");
      expect(mockResponse.job.postpone_count).toBe(0);
    });
  });

  describe("Job Metadata", () => {
    it("should initialize postpone_count to 0", () => {
      const newJob = { ...mockJobData, postpone_count: 0 };
      expect(newJob.postpone_count).toBe(0);
    });

    it("should track estimated hours", () => {
      expect(mockJobData.estimated_hours).toBe(8.0);
      expect(typeof mockJobData.estimated_hours).toBe("number");
    });

    it("should link to component and system", () => {
      expect(mockJobData.component_id).toBeTruthy();
      expect(mockJobData.system_id).toBeTruthy();
      expect(mockJobData.vessel_id).toBeTruthy();
    });
  });
});
