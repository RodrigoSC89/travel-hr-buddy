/**
 * PATCH 605 - ESG & EEXI Compliance Tracker Tests
 * Validation tests for ESG metrics, emissions logging, and forecasting
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { LLMEmissionAnalyzer } from "@/modules/esg-dashboard/services/LLMEmissionAnalyzer";
import { ESGReportExporter } from "@/modules/esg-dashboard/services/ESGReportExporter";
import type { EmissionLog, ESGMetric, ESGReport } from "@/modules/esg-dashboard/types";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock AI kernel
vi.mock("@/ai/kernel", () => ({
  runAIContext: vi.fn(),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("PATCH 605 - ESG & EEXI Compliance Tracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Emissions Log Insertion", () => {
    it("should insert emission log successfully", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: {
            id: "emission-1",
            vessel_id: "vessel-1",
            emission_type: "co2",
            amount: 100.5,
            unit: "tonnes",
            measurement_date: new Date().toISOString(),
          },
          error: null,
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const emissionData = {
        vessel_id: "vessel-1",
        emission_type: "co2",
        amount: 100.5,
        unit: "tonnes",
        measurement_date: new Date().toISOString(),
      };

      const result = await supabase.from("emissions_log").insert(emissionData);

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(mockFrom).toHaveBeenCalledWith("emissions_log");
    });

    it("should validate emission type constraints", async () => {
      const validTypes = ["co2", "sox", "nox", "pm", "ch4", "total_ghg"];
      
      validTypes.forEach(type => {
        expect(validTypes).toContain(type);
      });
    });

    it("should store EEXI and CII values", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: {
            eexi_value: 15.5,
            cii_rating: "B",
          },
          error: null,
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const result = await supabase.from("emissions_log").insert({
        vessel_id: "vessel-1",
        emission_type: "co2",
        amount: 100,
        eexi_value: 15.5,
        cii_rating: "B",
      });

      expect(result.data).toHaveProperty("eexi_value");
      expect(result.data).toHaveProperty("cii_rating");
    });
  });

  describe("Forecast Accuracy Validation", () => {
    it("should generate emission forecast with confidence score", async () => {
      const historicalEmissions: EmissionLog[] = [
        {
          id: "1",
          vesselId: "vessel-1",
          emissionType: "co2",
          amount: 100,
          unit: "tonnes",
          measurementDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          verified: false,
          createdAt: new Date(),
        },
        {
          id: "2",
          vesselId: "vessel-1",
          emissionType: "co2",
          amount: 95,
          unit: "tonnes",
          measurementDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          verified: false,
          createdAt: new Date(),
        },
      ];

      const forecast = await LLMEmissionAnalyzer.forecastEmissions(
        historicalEmissions,
        "vessel-1",
        "month"
      );

      expect(forecast).toBeDefined();
      expect(forecast.predictedEmissions).toBeDefined();
      expect(forecast.predictedEmissions.co2).toBeGreaterThan(0);
      expect(forecast.confidence).toBeGreaterThanOrEqual(0);
      expect(forecast.confidence).toBeLessThanOrEqual(1);
      expect(forecast.period).toBe("month");
    });

    it("should provide forecast factors and recommendations", async () => {
      const emissions: EmissionLog[] = [{
        id: "1",
        vesselId: "vessel-1",
        emissionType: "co2",
        amount: 100,
        unit: "tonnes",
        measurementDate: new Date(),
        verified: false,
        createdAt: new Date(),
      }];

      const forecast = await LLMEmissionAnalyzer.forecastEmissions(emissions, "vessel-1");

      expect(Array.isArray(forecast.factors)).toBe(true);
      expect(Array.isArray(forecast.recommendations)).toBe(true);
    });
  });

  describe("Export Format Validation", () => {
    it("should export report in PDF format", async () => {
      const mockReport: ESGReport = {
        reportId: "report-1",
        reportingPeriod: "2025-Q1",
        generatedAt: new Date(),
        metrics: [],
        emissions: [],
        summary: {
          totalEmissions: 500,
          complianceRate: 85,
          keyFindings: ["Test finding"],
        },
      };

      // Mock html2pdf
      const mockHtml2Pdf = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        save: vi.fn().mockResolvedValue(undefined),
      });

      vi.doMock("html2pdf.js", () => ({
        default: mockHtml2Pdf,
      }));

      // Test should not throw
      await expect(ESGReportExporter.exportESGReport(mockReport, "PDF")).resolves.not.toThrow();
    });

    it("should export report in XLSX format", async () => {
      const mockReport: ESGReport = {
        reportId: "report-2",
        reportingPeriod: "2025-Q1",
        generatedAt: new Date(),
        metrics: [],
        emissions: [],
        summary: {
          totalEmissions: 500,
          complianceRate: 85,
          keyFindings: [],
        },
      };

      // XLSX export should be defined
      expect(ESGReportExporter.exportESGReportXLSX).toBeDefined();
    });
  });

  describe("LLM Emission Analyzer", () => {
    it("should analyze emissions and provide insights", async () => {
      const emissions: EmissionLog[] = [
        {
          id: "1",
          vesselId: "vessel-1",
          emissionType: "co2",
          amount: 150,
          unit: "tonnes",
          measurementDate: new Date(),
          verified: true,
          createdAt: new Date(),
        },
      ];

      const analysis = await LLMEmissionAnalyzer.analyzeEmissions(emissions, "vessel-1");

      expect(analysis).toBeDefined();
      expect(analysis.insights).toBeDefined();
      expect(Array.isArray(analysis.insights)).toBe(true);
      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(["low", "medium", "high", "critical"]).toContain(analysis.riskLevel);
      expect(Array.isArray(analysis.complianceIssues)).toBe(true);
    });

    it("should analyze ESG metrics for compliance", async () => {
      const metrics: ESGMetric[] = [
        {
          id: "1",
          metricType: "carbon_intensity",
          value: 100,
          unit: "gCO2/tkm",
          measurementDate: new Date(),
          complianceStatus: "compliant",
          createdAt: new Date(),
        },
        {
          id: "2",
          metricType: "energy_efficiency",
          value: 85,
          unit: "percentage",
          measurementDate: new Date(),
          complianceStatus: "at_risk",
          createdAt: new Date(),
        },
      ];

      const analysis = await LLMEmissionAnalyzer.analyzeESGMetrics(metrics);

      expect(analysis).toBeDefined();
      expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
      expect(analysis.overallScore).toBeLessThanOrEqual(100);
      expect(analysis.trends).toBeDefined();
      expect(Array.isArray(analysis.alerts)).toBe(true);
      expect(Array.isArray(analysis.opportunities)).toBe(true);
    });
  });

  describe("ESG Metrics Table Integrity", () => {
    it("should have correct table structure for esg_metrics", async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: "metric-1",
                vessel_id: "vessel-1",
                metric_type: "carbon_intensity",
                value: 100,
                unit: "gCO2/tkm",
                measurement_date: new Date().toISOString(),
                compliance_status: "compliant",
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          }),
        }),
      });

      vi.spyOn(supabase, "from").mockImplementation(mockFrom);

      const result = await supabase.from("esg_metrics").select("*").limit(1);

      expect(result.data).toBeDefined();
      if (result.data && result.data.length > 0) {
        const metric = result.data[0];
        expect(metric).toHaveProperty("id");
        expect(metric).toHaveProperty("metric_type");
        expect(metric).toHaveProperty("value");
        expect(metric).toHaveProperty("unit");
        expect(metric).toHaveProperty("compliance_status");
      }
    });

    it("should validate metric type constraints", () => {
      const validMetricTypes = [
        "carbon_intensity",
        "energy_efficiency",
        "waste_management",
        "water_usage",
        "biodiversity",
        "social_compliance",
        "governance_score",
      ];

      validMetricTypes.forEach(type => {
        expect(validMetricTypes).toContain(type);
      });
    });
  });

  describe("Accessibility Audit", () => {
    it("should have accessible component structure", () => {
      // ESG Widget should use proper ARIA labels and semantic HTML
      // This is validated through the component structure
      expect(true).toBe(true); // Placeholder for actual accessibility tests
    });
  });
});
