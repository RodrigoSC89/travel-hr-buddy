import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchJobs, postponeJob, createWorkOrder } from "@/services/mmi/jobsApi";

describe("MMI Jobs API Service", () => {
  beforeEach(() => {
    // Clear any mocks before each test
    vi.clearAllMocks();
  });

  describe("fetchJobs", () => {
    it("should return a list of jobs", async () => {
      const result = await fetchJobs();
      
      expect(result).toBeDefined();
      expect(result.jobs).toBeInstanceOf(Array);
      expect(result.jobs.length).toBeGreaterThan(0);
    });

    it("should return jobs with correct structure", async () => {
      const result = await fetchJobs();
      const firstJob = result.jobs[0];
      
      expect(firstJob).toHaveProperty("id");
      expect(firstJob).toHaveProperty("title");
      expect(firstJob).toHaveProperty("status");
      expect(firstJob).toHaveProperty("priority");
      expect(firstJob).toHaveProperty("due_date");
      expect(firstJob).toHaveProperty("component");
      expect(firstJob.component).toHaveProperty("name");
      expect(firstJob.component).toHaveProperty("asset");
      expect(firstJob.component.asset).toHaveProperty("name");
      expect(firstJob.component.asset).toHaveProperty("vessel");
    });

    it("should include AI suggestions for some jobs", async () => {
      const result = await fetchJobs();
      const jobsWithAI = result.jobs.filter(job => job.suggestion_ia);
      
      expect(jobsWithAI.length).toBeGreaterThan(0);
    });

    it("should mark some jobs as postponable", async () => {
      const result = await fetchJobs();
      const postponableJobs = result.jobs.filter(job => job.can_postpone);
      
      expect(postponableJobs.length).toBeGreaterThan(0);
    });
  });

  describe("postponeJob", () => {
    it("should successfully postpone an eligible job", async () => {
      const result = await postponeJob("JOB-001");
      
      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.message).toContain("sucesso");
    });

    it("should return new date when postponing", async () => {
      const result = await postponeJob("JOB-001");
      
      expect(result.new_date).toBeDefined();
      expect(typeof result.new_date).toBe("string");
    });

    it("should handle non-postponable jobs", async () => {
      const result = await postponeJob("JOB-002");
      
      expect(result.message).toBeDefined();
      // Should indicate it cannot be postponed
      expect(result.message.toLowerCase()).toContain("não pode");
    });

    it("should throw error for invalid job ID", async () => {
      await expect(postponeJob("INVALID-ID")).rejects.toThrow("Job não encontrado");
    });
  });

  describe("createWorkOrder", () => {
    it("should successfully create a work order", async () => {
      const result = await createWorkOrder("JOB-001");
      
      expect(result).toBeDefined();
      expect(result.os_id).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.message).toContain("sucesso");
    }, 15000); // Increased timeout to 15 seconds for external API calls

    it("should generate a valid OS ID", async () => {
      const result = await createWorkOrder("JOB-001");
      
      expect(result.os_id).toMatch(/^OS-\d{6}$/);
    });

    it("should throw error for invalid job ID", async () => {
      await expect(createWorkOrder("INVALID-ID")).rejects.toThrow("Job não encontrado");
    });
  });

  describe("Job data validation", () => {
    it("should have jobs with different priorities", async () => {
      const result = await fetchJobs();
      const priorities = new Set(result.jobs.map(job => job.priority));
      
      expect(priorities.size).toBeGreaterThan(1);
    });

    it("should have jobs with different statuses", async () => {
      const result = await fetchJobs();
      const statuses = new Set(result.jobs.map(job => job.status));
      
      expect(statuses.size).toBeGreaterThan(1);
    });

    it("should have valid date format for due_date", async () => {
      const result = await fetchJobs();
      
      result.jobs.forEach(job => {
        expect(job.due_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const date = new Date(job.due_date);
        expect(date).toBeInstanceOf(Date);
        expect(isNaN(date.getTime())).toBe(false);
      });
    });
  });

  describe("API timing", () => {
    it("should complete fetchJobs within reasonable time", async () => {
      const startTime = Date.now();
      await fetchJobs();
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(2000); // Less than 2 seconds
    });

    it("should complete postponeJob within reasonable time", async () => {
      const startTime = Date.now();
      await postponeJob("JOB-001");
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(2000); // Less than 2 seconds
    });

    it("should complete createWorkOrder within reasonable time", async () => {
      const startTime = Date.now();
      await createWorkOrder("JOB-001");
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(2000); // Less than 2 seconds
    });
  });
});
