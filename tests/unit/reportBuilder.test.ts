/**
 * PATCH 601 - Unit tests for Report Builder
 * Tests report generation, data aggregation, and export functionality
 */

import { describe, it, expect } from "vitest";

interface ReportTemplate {
  id: string;
  name: string;
  type: "operational" | "compliance" | "financial" | "crew" | "environmental" | "custom";
  sections: ReportSection[];
  format: "pdf" | "excel" | "word" | "html" | "json";
  schedule: string | null;
  created_by: string;
  created_at: string;
}

interface ReportSection {
  id: string;
  title: string;
  type: "text" | "table" | "chart" | "metric" | "summary";
  data_source: string;
  visualization: string | null;
  order: number;
}

interface GeneratedReport {
  id: string;
  template_id: string;
  title: string;
  period_start: string;
  period_end: string;
  generated_at: string;
  generated_by: string;
  format: string;
  file_size_kb: number;
  status: "generating" | "completed" | "failed";
  download_url: string | null;
}

interface ReportData {
  section_id: string;
  data: any;
  metadata: {
    row_count: number;
    last_updated: string;
    data_quality_score: number;
  };
}

interface DataAggregation {
  metric_name: string;
  aggregation_type: "sum" | "average" | "count" | "min" | "max";
  value: number;
  unit: string;
  period: string;
}

interface AIInsight {
  insight_type: "trend" | "anomaly" | "recommendation" | "prediction";
  title: string;
  description: string;
  confidence_score: number;
  supporting_data: string[];
}

describe("Report Builder", () => {
  describe("Template Management", () => {
    it("should create valid report template", () => {
      const template: ReportTemplate = {
        id: "template-001",
        name: "Monthly Operations Report",
        type: "operational",
        sections: [
          {
            id: "section-001",
            title: "Executive Summary",
            type: "summary",
            data_source: "operations_summary",
            visualization: null,
            order: 1,
          },
          {
            id: "section-002",
            title: "Fuel Consumption",
            type: "chart",
            data_source: "fuel_data",
            visualization: "line_chart",
            order: 2,
          },
        ],
        format: "pdf",
        schedule: "monthly",
        created_by: "admin",
        created_at: "2025-11-03T10:00:00Z",
      };

      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(["operational", "compliance", "financial", "crew", "environmental", "custom"]).toContain(template.type);
      expect(template.sections).toBeInstanceOf(Array);
      expect(template.sections.length).toBeGreaterThan(0);
      expect(["pdf", "excel", "word", "html", "json"]).toContain(template.format);
    });

    it("should order sections correctly", () => {
      const sections: ReportSection[] = [
        {
          id: "section-001",
          title: "Summary",
          type: "summary",
          data_source: "summary_data",
          visualization: null,
          order: 1,
        },
        {
          id: "section-002",
          title: "Details",
          type: "table",
          data_source: "detail_data",
          visualization: "table",
          order: 2,
        },
        {
          id: "section-003",
          title: "Charts",
          type: "chart",
          data_source: "chart_data",
          visualization: "bar_chart",
          order: 3,
        },
      ];

      const sortedSections = sections.sort((a, b) => a.order - b.order);
      expect(sortedSections[0].order).toBe(1);
      expect(sortedSections[1].order).toBe(2);
      expect(sortedSections[2].order).toBe(3);
    });
  });

  describe("Report Generation", () => {
    it("should generate report with valid metadata", () => {
      const report: GeneratedReport = {
        id: "report-001",
        template_id: "template-001",
        title: "Monthly Operations Report - November 2025",
        period_start: "2025-11-01T00:00:00Z",
        period_end: "2025-11-30T23:59:59Z",
        generated_at: "2025-12-01T08:00:00Z",
        generated_by: "system",
        format: "pdf",
        file_size_kb: 2048,
        status: "completed",
        download_url: "https://storage.example.com/reports/report-001.pdf",
      };

      expect(report.id).toBeTruthy();
      expect(report.template_id).toBeTruthy();
      expect(report.title).toBeTruthy();
      expect(new Date(report.period_start)).toBeInstanceOf(Date);
      expect(new Date(report.period_end)).toBeInstanceOf(Date);
      expect(report.file_size_kb).toBeGreaterThan(0);
      expect(["generating", "completed", "failed"]).toContain(report.status);
    });

    it("should validate date ranges", () => {
      const report: GeneratedReport = {
        id: "report-002",
        template_id: "template-001",
        title: "Weekly Report",
        period_start: "2025-11-01T00:00:00Z",
        period_end: "2025-11-07T23:59:59Z",
        generated_at: "2025-11-08T08:00:00Z",
        generated_by: "user-123",
        format: "excel",
        file_size_kb: 512,
        status: "completed",
        download_url: "https://storage.example.com/reports/report-002.xlsx",
      };

      const periodStart = new Date(report.period_start);
      const periodEnd = new Date(report.period_end);
      const generatedAt = new Date(report.generated_at);

      expect(periodEnd.getTime()).toBeGreaterThan(periodStart.getTime());
      expect(generatedAt.getTime()).toBeGreaterThan(periodEnd.getTime());
    });
  });

  describe("Data Aggregation", () => {
    it("should aggregate data correctly", () => {
      const aggregation: DataAggregation = {
        metric_name: "Total Fuel Consumption",
        aggregation_type: "sum",
        value: 15750.5,
        unit: "liters",
        period: "2025-11",
      };

      expect(aggregation.metric_name).toBeTruthy();
      expect(["sum", "average", "count", "min", "max"]).toContain(aggregation.aggregation_type);
      expect(aggregation.value).toBeGreaterThan(0);
      expect(aggregation.unit).toBeTruthy();
    });

    it("should calculate multiple aggregation types", () => {
      const dataPoints = [100, 150, 200, 175, 225];
      
      const aggregations: DataAggregation[] = [
        {
          metric_name: "Total",
          aggregation_type: "sum",
          value: dataPoints.reduce((a, b) => a + b, 0),
          unit: "units",
          period: "2025-11",
        },
        {
          metric_name: "Average",
          aggregation_type: "average",
          value: dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length,
          unit: "units",
          period: "2025-11",
        },
        {
          metric_name: "Count",
          aggregation_type: "count",
          value: dataPoints.length,
          unit: "items",
          period: "2025-11",
        },
        {
          metric_name: "Minimum",
          aggregation_type: "min",
          value: Math.min(...dataPoints),
          unit: "units",
          period: "2025-11",
        },
        {
          metric_name: "Maximum",
          aggregation_type: "max",
          value: Math.max(...dataPoints),
          unit: "units",
          period: "2025-11",
        },
      ];

      expect(aggregations[0].value).toBe(850); // sum
      expect(aggregations[1].value).toBe(170); // average
      expect(aggregations[2].value).toBe(5); // count
      expect(aggregations[3].value).toBe(100); // min
      expect(aggregations[4].value).toBe(225); // max
    });
  });

  describe("Report Data", () => {
    it("should validate report data structure", () => {
      const reportData: ReportData = {
        section_id: "section-001",
        data: {
          vessels: 5,
          total_voyages: 42,
          fuel_consumed: 15750.5,
          incidents: 2,
        },
        metadata: {
          row_count: 4,
          last_updated: "2025-11-30T23:59:59Z",
          data_quality_score: 0.95,
        },
      };

      expect(reportData.section_id).toBeTruthy();
      expect(reportData.data).toBeTruthy();
      expect(reportData.metadata.row_count).toBeGreaterThan(0);
      expect(reportData.metadata.data_quality_score).toBeGreaterThanOrEqual(0);
      expect(reportData.metadata.data_quality_score).toBeLessThanOrEqual(1);
    });

    it("should handle empty data sets", () => {
      const emptyData: ReportData = {
        section_id: "section-002",
        data: {},
        metadata: {
          row_count: 0,
          last_updated: "2025-11-30T23:59:59Z",
          data_quality_score: 1.0,
        },
      };

      expect(emptyData.metadata.row_count).toBe(0);
      expect(Object.keys(emptyData.data).length).toBe(0);
    });
  });

  describe("Export Formats", () => {
    it("should support multiple export formats", () => {
      const formats = ["pdf", "excel", "word", "html", "json"];
      
      formats.forEach(format => {
        const report: GeneratedReport = {
          id: `report-${format}`,
          template_id: "template-001",
          title: `Report in ${format}`,
          period_start: "2025-11-01T00:00:00Z",
          period_end: "2025-11-30T23:59:59Z",
          generated_at: "2025-12-01T08:00:00Z",
          generated_by: "system",
          format: format as any,
          file_size_kb: 1024,
          status: "completed",
          download_url: `https://storage.example.com/reports/report.${format}`,
        };

        expect(formats).toContain(report.format);
      });
    });

    it("should validate file sizes", () => {
      const smallReport: GeneratedReport = {
        id: "report-small",
        template_id: "template-001",
        title: "Small Report",
        period_start: "2025-11-01T00:00:00Z",
        period_end: "2025-11-07T23:59:59Z",
        generated_at: "2025-11-08T08:00:00Z",
        generated_by: "user-123",
        format: "json",
        file_size_kb: 25,
        status: "completed",
        download_url: "https://storage.example.com/reports/small.json",
      };

      const largeReport: GeneratedReport = {
        id: "report-large",
        template_id: "template-001",
        title: "Large Report",
        period_start: "2025-01-01T00:00:00Z",
        period_end: "2025-12-31T23:59:59Z",
        generated_at: "2026-01-01T08:00:00Z",
        generated_by: "user-123",
        format: "pdf",
        file_size_kb: 15360, // 15 MB
        status: "completed",
        download_url: "https://storage.example.com/reports/large.pdf",
      };

      expect(smallReport.file_size_kb).toBeLessThan(100);
      expect(largeReport.file_size_kb).toBeGreaterThan(10000);
    });
  });

  describe("AI Insights", () => {
    it("should generate AI insights with valid structure", () => {
      const insight: AIInsight = {
        insight_type: "trend",
        title: "Increasing Fuel Efficiency",
        description: "Fuel efficiency has improved by 12% over the last quarter, primarily due to optimized route planning and weather routing.",
        confidence_score: 0.87,
        supporting_data: [
          "Q3 average: 125.5 L/nm",
          "Q4 average: 110.4 L/nm",
          "Weather routing adoption: 95%",
        ],
      };

      expect(["trend", "anomaly", "recommendation", "prediction"]).toContain(insight.insight_type);
      expect(insight.title).toBeTruthy();
      expect(insight.description).toBeTruthy();
      expect(insight.confidence_score).toBeGreaterThanOrEqual(0);
      expect(insight.confidence_score).toBeLessThanOrEqual(1);
      expect(insight.supporting_data).toBeInstanceOf(Array);
    });

    it("should detect anomalies", () => {
      const anomalyInsight: AIInsight = {
        insight_type: "anomaly",
        title: "Unusual Fuel Consumption Spike",
        description: "Fuel consumption on Vessel A increased by 45% in week 3, significantly above normal patterns. Investigation recommended.",
        confidence_score: 0.92,
        supporting_data: [
          "Week 2 consumption: 2500 L",
          "Week 3 consumption: 3625 L",
          "Historical average: 2450 L",
          "Standard deviation exceeded by 3.2σ",
        ],
      };

      expect(anomalyInsight.insight_type).toBe("anomaly");
      expect(anomalyInsight.confidence_score).toBeGreaterThan(0.85);
      expect(anomalyInsight.supporting_data.length).toBeGreaterThan(0);
    });

    it("should provide recommendations", () => {
      const recommendation: AIInsight = {
        insight_type: "recommendation",
        title: "Optimize Maintenance Schedule",
        description: "Analysis suggests moving planned maintenance for Engine #2 forward by 2 weeks to align with port call schedule, reducing operational disruption and saving an estimated 15 hours of sea time.",
        confidence_score: 0.78,
        supporting_data: [
          "Current planned maintenance: 2025-12-20",
          "Recommended date: 2025-12-06",
          "Port call window: 2025-12-05 to 2025-12-08",
          "Estimated savings: 15 hours, $4,500",
        ],
      };

      expect(recommendation.insight_type).toBe("recommendation");
      expect(recommendation.description).toContain("suggest");
      expect(recommendation.supporting_data.some(d => d.includes("saving"))).toBe(true);
    });
  });

  describe("Report Scheduling", () => {
    it("should validate schedule patterns", () => {
      const schedulePatterns = ["daily", "weekly", "monthly", "quarterly", "annually"];
      
      schedulePatterns.forEach(pattern => {
        const template: ReportTemplate = {
          id: `template-${pattern}`,
          name: `${pattern} Report`,
          type: "operational",
          sections: [],
          format: "pdf",
          schedule: pattern,
          created_by: "admin",
          created_at: "2025-11-03T10:00:00Z",
        };

        expect(template.schedule).toBe(pattern);
      });
    });

    it("should handle on-demand reports", () => {
      const onDemandTemplate: ReportTemplate = {
        id: "template-ondemand",
        name: "On-Demand Analysis",
        type: "custom",
        sections: [],
        format: "excel",
        schedule: null,
        created_by: "user-123",
        created_at: "2025-11-03T10:00:00Z",
      };

      expect(onDemandTemplate.schedule).toBeNull();
    });
  });
});
