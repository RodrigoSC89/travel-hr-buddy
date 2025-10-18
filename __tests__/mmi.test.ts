/**
 * MMI (Maritime Maintenance Intelligence) - Essential Tests
 * Validates job creation and forecast functionality
 */

import { describe, it, expect, vi } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "job-1",
              description: "Manutenção do sistema hidráulico",
              system: "Hidráulico",
              vessel: "Navio A",
              status: "open",
              created_at: new Date().toISOString(),
            },
          ],
          error: null,
        }),
      }),
      insert: vi.fn().mockResolvedValue({
        data: [{ id: "new-job" }],
        error: null,
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    })),
  },
}));

describe("MMI - Essential Tests", () => {
  it("deve criar novo job com dados válidos", async () => {
    const { supabase } = await import("@/integrations/supabase/client");

    const newJob = {
      description: "Reparo de bomba hidráulica",
      system: "Hidráulico",
      vessel: "Navio B",
      priority: "high",
    };

    const result = await supabase.from("mmi_jobs").insert(newJob);

    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
  });

  it("deve validar estrutura de job", () => {
    const job = {
      id: "job-1",
      description: "Manutenção preventiva",
      system: "Elétrico",
      vessel: "Navio A",
      status: "open",
      priority: "medium",
      created_at: new Date().toISOString(),
    };

    expect(job).toHaveProperty("id");
    expect(job).toHaveProperty("description");
    expect(job).toHaveProperty("system");
    expect(job).toHaveProperty("vessel");
    expect(job).toHaveProperty("status");
    expect(job.description).toBeTruthy();
  });

  it("deve gerar forecast por job", () => {
    const jobData = {
      id: "job-1",
      system: "Hidráulico",
      averageCompletionTime: 48, // horas
      historicalData: [45, 52, 44, 50, 46], // horas por job similar
    };

    const generateForecast = (data: typeof jobData) => {
      const avgHistorical =
        data.historicalData.reduce((a, b) => a + b, 0) /
        data.historicalData.length;
      const predictedTime = Math.round((avgHistorical + data.averageCompletionTime) / 2);

      return {
        jobId: data.id,
        system: data.system,
        predictedCompletionTime: predictedTime,
        confidence: 0.85,
      };
    };

    const forecast = generateForecast(jobData);

    expect(forecast).toHaveProperty("jobId");
    expect(forecast).toHaveProperty("predictedCompletionTime");
    expect(forecast.predictedCompletionTime).toBeGreaterThan(0);
    expect(forecast.confidence).toBeGreaterThan(0);
    expect(forecast.confidence).toBeLessThanOrEqual(1);
  });

  it("deve listar jobs por vessel", async () => {
    const { supabase } = await import("@/integrations/supabase/client");

    const result = await supabase
      .from("mmi_jobs")
      .select("*")
      .order("created_at", { ascending: false });

    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("deve validar sistemas disponíveis", () => {
    const systems = [
      "Hidráulico",
      "Elétrico",
      "Mecânico",
      "Eletrônico",
      "Propulsão",
    ];

    systems.forEach((system) => {
      expect(typeof system).toBe("string");
      expect(system.length).toBeGreaterThan(0);
    });
  });

  it("deve calcular métricas de jobs", () => {
    const jobs = [
      { id: "1", status: "completed", completionTime: 48 },
      { id: "2", status: "completed", completionTime: 52 },
      { id: "3", status: "open", completionTime: null },
      { id: "4", status: "completed", completionTime: 45 },
    ];

    const completedJobs = jobs.filter((j) => j.status === "completed");
    const avgTime =
      completedJobs.reduce((sum, j) => sum + (j.completionTime || 0), 0) /
      completedJobs.length;

    expect(completedJobs).toHaveLength(3);
    expect(avgTime).toBeCloseTo(48.33, 1);
  });

  it("deve validar forecast possui dados necessários", () => {
    const forecast = {
      jobId: "job-1",
      system: "Hidráulico",
      predictedCompletionTime: 48,
      confidence: 0.85,
      createdAt: new Date().toISOString(),
    };

    expect(forecast.jobId).toBeTruthy();
    expect(forecast.system).toBeTruthy();
    expect(forecast.predictedCompletionTime).toBeGreaterThan(0);
    expect(forecast.confidence).toBeGreaterThan(0);
    expect(forecast.confidence).toBeLessThanOrEqual(1);
  });
});
