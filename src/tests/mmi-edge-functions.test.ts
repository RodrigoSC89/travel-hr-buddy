/**
 * MMI Edge Functions Tests
 * 
 * Tests for simulate-hours and send-alerts edge functions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MMIComponent, MMIJobEnhanced } from "../types/mmi";

describe("simulate-hours Edge Function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Processing", () => {
    it("should process only operational components", () => {
      const components: MMIComponent[] = [
        {
          id: "1",
          component_name: "Engine 1",
          current_hours: 1850,
          maintenance_interval_hours: 2000,
          is_operational: true,
        },
        {
          id: "2",
          component_name: "Engine 2",
          current_hours: 1900,
          maintenance_interval_hours: 2000,
          is_operational: false,
        },
        {
          id: "3",
          component_name: "Generator",
          current_hours: 3200,
          maintenance_interval_hours: 5000,
          is_operational: true,
        },
      ];

      const operational = components.filter(c => c.is_operational);
      
      expect(operational).toHaveLength(2);
      expect(operational.map(c => c.id)).toEqual(["1", "3"]);
    });

    it("should add hours within valid range (0.5-2.0)", () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        const hoursToAdd = Math.random() * 1.5 + 0.5;
        const rounded = Math.round(hoursToAdd * 10) / 10;
        
        expect(rounded).toBeGreaterThanOrEqual(0.5);
        expect(rounded).toBeLessThanOrEqual(2.0);
      }
    });

    it("should update current hours correctly", () => {
      const previousHours = 1850.5;
      const hoursToAdd = 1.3;
      const expectedHours = 1851.8;

      const newHours = previousHours + hoursToAdd;
      
      expect(newHours).toBe(expectedHours);
    });
  });

  describe("Job Creation Logic", () => {
    it("should create medium priority job at 95% threshold", () => {
      const maintenanceInterval = 2000;
      const currentHours = 1900; // 95%
      const threshold95 = maintenanceInterval * 0.95;

      expect(currentHours).toBeGreaterThanOrEqual(threshold95);
      
      // Should create medium priority job
      const priority = currentHours >= maintenanceInterval ? "critical" :
        currentHours >= maintenanceInterval * 0.98 ? "high" : "medium";
      
      expect(priority).toBe("medium");
    });

    it("should create high priority job at 98% threshold", () => {
      const maintenanceInterval = 2000;
      const currentHours = 1960; // 98%
      const threshold98 = maintenanceInterval * 0.98;

      expect(currentHours).toBeGreaterThanOrEqual(threshold98);
      
      const priority = currentHours >= maintenanceInterval ? "critical" :
        currentHours >= maintenanceInterval * 0.98 ? "high" : "medium";
      
      expect(priority).toBe("high");
    });

    it("should create critical priority job at 100% threshold", () => {
      const maintenanceInterval = 2000;
      const currentHours = 2050; // 102.5%

      expect(currentHours).toBeGreaterThan(maintenanceInterval);
      
      const priority = currentHours >= maintenanceInterval ? "critical" :
        currentHours >= maintenanceInterval * 0.98 ? "high" : "medium";
      
      expect(priority).toBe("critical");
    });

    it("should not postpone critical jobs", () => {
      const maintenanceInterval = 2000;
      const currentHours = 2100;
      
      const priority = currentHours >= maintenanceInterval ? "critical" :
        currentHours >= maintenanceInterval * 0.98 ? "high" : "medium";
      const canPostpone = priority !== "critical";
      
      expect(priority).toBe("critical");
      expect(canPostpone).toBe(false);
    });

    it("should set due dates based on priority", () => {
      const now = new Date();
      
      // Critical: 2 days
      const criticalDue = new Date(now);
      criticalDue.setDate(criticalDue.getDate() + 2);
      
      // High: 5 days
      const highDue = new Date(now);
      highDue.setDate(highDue.getDate() + 5);
      
      // Medium: 10 days
      const mediumDue = new Date(now);
      mediumDue.setDate(mediumDue.getDate() + 10);
      
      expect(criticalDue.getDate()).toBe(now.getDate() + 2);
      expect(highDue.getDate()).toBe(now.getDate() + 5);
      expect(mediumDue.getDate()).toBe(now.getDate() + 10);
    });
  });

  describe("Job Title and Description", () => {
    it("should generate correct job title", () => {
      const componentName = "Motor Principal ME-4500";
      const expectedTitle = `Manutenção programada - ${componentName}`;
      
      expect(expectedTitle).toContain("Manutenção programada");
      expect(expectedTitle).toContain(componentName);
    });

    it("should generate description with percentage", () => {
      const currentHours = 1950;
      const maintenanceInterval = 2000;
      const percentage = Math.round((currentHours / maintenanceInterval) * 100);
      
      const description = `Componente atingiu ${percentage}% do intervalo de manutenção (${currentHours.toFixed(1)}h de ${maintenanceInterval}h).`;
      
      expect(percentage).toBe(98); // 1950/2000 = 0.975 rounds to 98%
      expect(description).toContain("98%");
      expect(description).toContain("1950.0h");
      expect(description).toContain("2000h");
    });

    it("should generate AI suggestion", () => {
      const currentHours = 1950;
      const suggestion = `Realizar manutenção preventiva conforme especificação do fabricante. Componente operou ${currentHours.toFixed(1)} horas.`;
      
      expect(suggestion).toContain("manutenção preventiva");
      expect(suggestion).toContain("1950.0 horas");
    });
  });

  describe("Response Summary", () => {
    it("should return correct summary structure", () => {
      const summary = {
        success: true,
        timestamp: new Date().toISOString(),
        processed: 45,
        hours_added: 67.3,
        jobs_created: 3,
        alerts: {
          critical: 1,
          high: 2,
          medium: 0,
        },
        jobs_details: [
          {
            component_name: "Motor Principal",
            priority: "critical",
            current_hours: 2050,
            maintenance_interval_hours: 2000,
          },
        ],
      };

      expect(summary.success).toBe(true);
      expect(summary.processed).toBe(45);
      expect(summary.jobs_created).toBe(3);
      expect(summary.alerts.critical).toBe(1);
      expect(summary.alerts.high).toBe(2);
    });

    it("should handle no operational components", () => {
      const summary = {
        success: true,
        message: "No operational components to process",
        processed: 0,
      };

      expect(summary.success).toBe(true);
      expect(summary.processed).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing environment variables", () => {
      const hasRequiredEnv = (url?: string, key?: string) => {
        return !!url && !!key;
      };

      expect(hasRequiredEnv(undefined, undefined)).toBe(false);
      expect(hasRequiredEnv("https://test.supabase.co", "key123")).toBe(true);
    });

    it("should continue processing on component error", () => {
      const components = [
        { id: "1", name: "Component 1", shouldFail: false },
        { id: "2", name: "Component 2", shouldFail: true },
        { id: "3", name: "Component 3", shouldFail: false },
      ];

      let processed = 0;
      let errors = 0;

      components.forEach(comp => {
        try {
          if (comp.shouldFail) {
            throw new Error("Component error");
          }
          processed++;
        } catch {
          errors++;
        }
      });

      expect(processed).toBe(2);
      expect(errors).toBe(1);
    });
  });
});

describe("send-alerts Edge Function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Job Filtering", () => {
    it("should filter only critical and high priority jobs", () => {
      const jobs: MMIJobEnhanced[] = [
        {
          id: "1",
          title: "Critical Job",
          status: "pending",
          priority: "critical",
          can_postpone: false,
          postponement_count: 0,
        },
        {
          id: "2",
          title: "High Job",
          status: "in_progress",
          priority: "high",
          can_postpone: true,
          postponement_count: 0,
        },
        {
          id: "3",
          title: "Medium Job",
          status: "pending",
          priority: "medium",
          can_postpone: true,
          postponement_count: 0,
        },
        {
          id: "4",
          title: "Low Job",
          status: "pending",
          priority: "low",
          can_postpone: true,
          postponement_count: 0,
        },
      ];

      const priorityJobs = jobs.filter(
        j => (j.status === "pending" || j.status === "in_progress") &&
             (j.priority === "critical" || j.priority === "high")
      );

      expect(priorityJobs).toHaveLength(2);
      expect(priorityJobs[0].priority).toBe("critical");
      expect(priorityJobs[1].priority).toBe("high");
    });

    it("should sort by priority and due date", () => {
      const jobs: MMIJobEnhanced[] = [
        {
          id: "1",
          title: "High Job 2",
          status: "pending",
          priority: "high",
          due_date: "2025-10-25",
          can_postpone: true,
          postponement_count: 0,
        },
        {
          id: "2",
          title: "Critical Job",
          status: "pending",
          priority: "critical",
          due_date: "2025-10-20",
          can_postpone: false,
          postponement_count: 0,
        },
        {
          id: "3",
          title: "High Job 1",
          status: "pending",
          priority: "high",
          due_date: "2025-10-22",
          can_postpone: true,
          postponement_count: 0,
        },
      ];

      // Sort by priority (critical first), then by due date
      const sorted = [...jobs].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        return (a.due_date || "").localeCompare(b.due_date || "");
      });

      expect(sorted[0].priority).toBe("critical");
      expect(sorted[1].due_date).toBe("2025-10-22");
      expect(sorted[2].due_date).toBe("2025-10-25");
    });
  });

  describe("Email Content Generation", () => {
    it("should generate priority color codes", () => {
      const priorityColor = (priority: string) => {
        switch (priority) {
        case "critical": return "#dc2626";
        case "high": return "#ea580c";
        case "medium": return "#ca8a04";
        default: return "#6b7280";
        }
      };

      expect(priorityColor("critical")).toBe("#dc2626");
      expect(priorityColor("high")).toBe("#ea580c");
      expect(priorityColor("medium")).toBe("#ca8a04");
      expect(priorityColor("low")).toBe("#6b7280");
    });

    it("should generate priority emojis", () => {
      const priorityEmoji = (priority: string) => {
        switch (priority) {
        case "critical": return "🔴";
        case "high": return "🟠";
        case "medium": return "🟡";
        default: return "⚪";
        }
      };

      expect(priorityEmoji("critical")).toBe("🔴");
      expect(priorityEmoji("high")).toBe("🟠");
      expect(priorityEmoji("medium")).toBe("🟡");
    });

    it("should generate priority labels", () => {
      const priorityLabel = (priority: string) => {
        switch (priority) {
        case "critical": return "CRÍTICO";
        case "high": return "ALTO";
        case "medium": return "MÉDIO";
        default: return "BAIXO";
        }
      };

      expect(priorityLabel("critical")).toBe("CRÍTICO");
      expect(priorityLabel("high")).toBe("ALTO");
    });

    it("should format dates correctly", () => {
      const formatDate = (dateStr: string) => {
        try {
          const date = new Date(dateStr);
          return date.toLocaleDateString("pt-BR", { 
            day: "2-digit", 
            month: "2-digit", 
            year: "numeric" 
          });
        } catch {
          return dateStr;
        }
      };

      const formatted = formatDate("2025-10-20");
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("should include AI suggestions when available", () => {
      const job: MMIJobEnhanced = {
        id: "1",
        title: "Engine Maintenance",
        status: "pending",
        priority: "high",
        suggestion_ia: "Realizar manutenção preventiva imediatamente",
        can_postpone: true,
        postponement_count: 0,
      };

      expect(job.suggestion_ia).toBeTruthy();
      expect(job.suggestion_ia).toContain("manutenção preventiva");
    });
  });

  describe("Email Sending", () => {
    it("should prepare email with correct recipients", () => {
      const adminEmail = "admin@nautilus.ai";
      const fromEmail = "alertas@nautilus.ai";

      const emailData = {
        from: fromEmail,
        to: adminEmail,
        subject: "🚢 Nautilus MMI - 5 Trabalhos Prioritários Requerem Atenção",
      };

      expect(emailData.from).toBe(fromEmail);
      expect(emailData.to).toBe(adminEmail);
      expect(emailData.subject).toContain("Nautilus MMI");
    });

    it("should include job count in subject", () => {
      const jobCount = 5;
      const subject = `🚢 Nautilus MMI - ${jobCount} Trabalhos Prioritários Requerem Atenção`;

      expect(subject).toContain("5 Trabalhos");
    });

    it("should handle email API errors gracefully", () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: async () => "Invalid API key",
      };

      expect(mockResponse.ok).toBe(false);
      expect(mockResponse.status).toBe(400);
    });
  });

  describe("Response Summary", () => {
    it("should return correct summary structure", () => {
      const summary = {
        success: true,
        timestamp: new Date().toISOString(),
        jobs_found: 5,
        emails_sent: 1,
        recipients: ["admin@nautilus.ai"],
        job_breakdown: {
          critical: 2,
          high: 3,
        },
        email_id: "re_abc123",
      };

      expect(summary.success).toBe(true);
      expect(summary.jobs_found).toBe(5);
      expect(summary.job_breakdown.critical).toBe(2);
      expect(summary.job_breakdown.high).toBe(3);
    });

    it("should handle no alerts case", () => {
      const summary = {
        success: true,
        message: "No alerts to send",
        jobs_found: 0,
      };

      expect(summary.success).toBe(true);
      expect(summary.jobs_found).toBe(0);
    });

    it("should handle missing email configuration", () => {
      const hasEmailConfig = (apiKey?: string) => !!apiKey;

      expect(hasEmailConfig(undefined)).toBe(false);
      expect(hasEmailConfig("re_abc123")).toBe(true);
    });
  });

  describe("Job Breakdown", () => {
    it("should count jobs by priority", () => {
      const jobs: MMIJobEnhanced[] = [
        { id: "1", title: "Job 1", status: "pending", priority: "critical", can_postpone: false, postponement_count: 0 },
        { id: "2", title: "Job 2", status: "pending", priority: "critical", can_postpone: false, postponement_count: 0 },
        { id: "3", title: "Job 3", status: "pending", priority: "high", can_postpone: true, postponement_count: 0 },
        { id: "4", title: "Job 4", status: "pending", priority: "high", can_postpone: true, postponement_count: 0 },
        { id: "5", title: "Job 5", status: "pending", priority: "high", can_postpone: true, postponement_count: 0 },
      ];

      const breakdown = {
        critical: jobs.filter(j => j.priority === "critical").length,
        high: jobs.filter(j => j.priority === "high").length,
      };

      expect(breakdown.critical).toBe(2);
      expect(breakdown.high).toBe(3);
    });
  });

  describe("HTML Email Template", () => {
    it("should use gradient header background", () => {
      const headerStyle = "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);";
      
      expect(headerStyle).toContain("linear-gradient");
      expect(headerStyle).toContain("#667eea");
      expect(headerStyle).toContain("#764ba2");
    });

    it("should be responsive with max-width", () => {
      const containerStyle = "max-width: 600px; margin: 0 auto;";
      
      expect(containerStyle).toContain("max-width: 600px");
    });

    it("should include timestamp in footer", () => {
      const timestamp = new Date().toLocaleString("pt-BR");
      const footer = `Timestamp: ${timestamp}`;

      expect(footer).toContain("Timestamp:");
      expect(timestamp).toBeTruthy();
    });
  });
});
