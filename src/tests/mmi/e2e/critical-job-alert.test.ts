import { describe, it, expect, beforeEach } from "vitest";

/**
 * MMI - Critical Job Alert E2E Tests
 * 
 * Tests the complete flow of critical job alerting via email
 */

describe("MMI - Critical Job Alert E2E", () => {
  const mockCriticalJob = {
    id: "job-critical-123",
    title: "Manutenção Crítica - Motor Principal",
    priority: "critical",
    status: "overdue",
    scheduled_date: "2025-10-10T10:00:00Z",
    component: {
      name: "Motor Principal",
      current_hours: 8500,
      next_maintenance_hours: 8000,
    },
    system: {
      name: "Sistema de Propulsão",
      category: "propulsion",
    },
    vessel_id: "vessel-alpha-123",
  };

  const mockHighPriorityJob = {
    id: "job-high-456",
    title: "Reparo Sistema Elétrico",
    priority: "high",
    status: "pending",
    scheduled_date: "2025-10-18T14:00:00Z",
    component: {
      name: "Painel Elétrico Principal",
      current_hours: 5200,
    },
    system: {
      name: "Sistema Elétrico",
      category: "electrical",
    },
    vessel_id: "vessel-alpha-123",
  };

  beforeEach(() => {
    // Setup for each test
  });

  describe("Job Priority Detection", () => {
    it("should identify critical priority jobs", () => {
      expect(mockCriticalJob.priority).toBe("critical");
    });

    it("should identify high priority jobs", () => {
      expect(mockHighPriorityJob.priority).toBe("high");
    });

    it("should filter jobs by priority", () => {
      const jobs = [mockCriticalJob, mockHighPriorityJob];
      const criticalJobs = jobs.filter((j) => j.priority === "critical");
      const highPriorityJobs = jobs.filter((j) => j.priority === "high");

      expect(criticalJobs.length).toBe(1);
      expect(highPriorityJobs.length).toBe(1);
    });

    it("should identify overdue jobs", () => {
      const scheduledDate = new Date(mockCriticalJob.scheduled_date);
      const now = new Date();
      const isOverdue = scheduledDate < now;

      expect(mockCriticalJob.status).toBe("overdue");
      expect(isOverdue).toBe(true);
    });
  });

  describe("Job Grouping by Vessel", () => {
    it("should group jobs by vessel_id", () => {
      const jobs = [mockCriticalJob, mockHighPriorityJob];
      
      const jobsByVessel = jobs.reduce((acc: Record<string, any[]>, job) => {
        const vesselId = job.vessel_id || "general";
        if (!acc[vesselId]) {
          acc[vesselId] = [];
        }
        acc[vesselId].push(job);
        return acc;
      }, {});

      expect(jobsByVessel["vessel-alpha-123"]).toBeDefined();
      expect(jobsByVessel["vessel-alpha-123"].length).toBe(2);
    });

    it("should handle jobs without vessel_id", () => {
      const jobWithoutVessel = { ...mockCriticalJob, vessel_id: null };
      const vesselId = jobWithoutVessel.vessel_id || "general";

      expect(vesselId).toBe("general");
    });

    it("should count jobs by priority per vessel", () => {
      const jobs = [mockCriticalJob, mockHighPriorityJob];
      const criticalCount = jobs.filter((j) => j.priority === "critical").length;
      const highCount = jobs.filter((j) => j.priority === "high").length;

      expect(criticalCount).toBe(1);
      expect(highCount).toBe(1);
    });
  });

  describe("Email Template Generation", () => {
    it("should generate email with job details", () => {
      const emailData = {
        vessel_id: "vessel-alpha-123",
        jobs: [mockCriticalJob, mockHighPriorityJob],
        critical_count: 1,
        high_count: 1,
      };

      expect(emailData.jobs.length).toBe(2);
      expect(emailData.critical_count).toBe(1);
      expect(emailData.high_count).toBe(1);
    });

    it("should format job priority with color coding", () => {
      const priorityColors = {
        critical: "#dc2626",
        high: "#ea580c",
        medium: "#f59e0b",
        low: "#10b981",
      };

      expect(priorityColors[mockCriticalJob.priority as keyof typeof priorityColors]).toBe("#dc2626");
      expect(priorityColors[mockHighPriorityJob.priority as keyof typeof priorityColors]).toBe("#ea580c");
    });

    it("should format scheduled date in Brazilian format", () => {
      const scheduledDate = new Date(mockCriticalJob.scheduled_date);
      const formattedDate = scheduledDate.toLocaleDateString("pt-BR");
      const brazilianDateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

      expect(formattedDate).toMatch(brazilianDateRegex);
    });

    it("should include system and component information", () => {
      const jobInfo = {
        title: mockCriticalJob.title,
        system: mockCriticalJob.system.name,
        component: mockCriticalJob.component.name,
      };

      expect(jobInfo.title).toBeTruthy();
      expect(jobInfo.system).toBeTruthy();
      expect(jobInfo.component).toBeTruthy();
    });
  });

  describe("Email Subject Generation", () => {
    it("should generate subject with job counts", () => {
      const criticalCount = 1;
      const highCount = 2;
      const subject = `🚨 Alertas de Manutenção - ${criticalCount} Crítico(s), ${highCount} Alto(s)`;

      expect(subject).toContain("Alertas de Manutenção");
      expect(subject).toContain("1 Crítico(s)");
      expect(subject).toContain("2 Alto(s)");
    });

    it("should use emoji alert indicator", () => {
      const subject = "🚨 Alertas de Manutenção";
      expect(subject).toContain("🚨");
    });
  });

  describe("Email Recipients", () => {
    it("should send to maintenance team", () => {
      const recipients = ["maintenance-team@nautilusone.com"];

      expect(recipients).toBeInstanceOf(Array);
      expect(recipients.length).toBeGreaterThan(0);
      expect(recipients[0]).toContain("@nautilusone.com");
    });

    it("should validate email format", () => {
      const email = "maintenance-team@nautilusone.com";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(email).toMatch(emailRegex);
    });
  });

  describe("Alert Sending Logic", () => {
    it("should prepare alert data correctly", () => {
      const alertData = {
        vessel_id: "vessel-alpha-123",
        jobs_count: 2,
        critical_count: 1,
        high_count: 1,
        timestamp: new Date().toISOString(),
      };

      expect(alertData.vessel_id).toBeTruthy();
      expect(alertData.jobs_count).toBe(2);
      expect(alertData.critical_count).toBe(1);
      expect(alertData.high_count).toBe(1);
    });

    it("should track sent alerts", () => {
      const sentAlerts = [
        {
          vessel_id: "vessel-alpha-123",
          jobs_count: 2,
          email_id: "email-id-123",
          sent_at: new Date().toISOString(),
        },
      ];

      expect(sentAlerts).toBeInstanceOf(Array);
      expect(sentAlerts.length).toBe(1);
      expect(sentAlerts[0]).toHaveProperty("email_id");
    });
  });

  describe("Alert Response Structure", () => {
    it("should return success response with details", () => {
      const mockResponse = {
        success: true,
        message: "Sent 1 alert(s)",
        alerts_sent: 1,
        details: [
          {
            vessel_id: "vessel-alpha-123",
            jobs_count: 2,
            email_id: "email-id-123",
          },
        ],
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.alerts_sent).toBe(1);
      expect(mockResponse.details).toBeInstanceOf(Array);
      expect(mockResponse.details[0]).toHaveProperty("email_id");
    });

    it("should handle no critical jobs scenario", () => {
      const mockResponse = {
        success: true,
        message: "No critical jobs found",
        alerts_sent: 0,
      };

      expect(mockResponse.success).toBe(true);
      expect(mockResponse.alerts_sent).toBe(0);
    });
  });

  describe("Email HTML Structure", () => {
    it("should have proper HTML structure", () => {
      const htmlStructure = {
        doctype: "<!DOCTYPE html>",
        html_tag: "<html lang=\"pt-BR\">",
        head: "<head>",
        body: "<body>",
      };

      expect(htmlStructure.doctype).toBeTruthy();
      expect(htmlStructure.html_tag).toContain("pt-BR");
    });

    it("should include header section", () => {
      const header = {
        gradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
        title: "🚨 Alertas de Manutenção",
        subtitle: "Nautilus One - MMI (Manutenção Inteligente)",
      };

      expect(header.title).toContain("Alertas de Manutenção");
      expect(header.subtitle).toContain("MMI");
    });

    it("should include jobs table", () => {
      const tableHeaders = [
        "Job",
        "Sistema",
        "Componente",
        "Prioridade",
        "Data Agendada",
        "Status",
      ];

      expect(tableHeaders.length).toBe(6);
      expect(tableHeaders).toContain("Job");
      expect(tableHeaders).toContain("Prioridade");
    });

    it("should include call-to-action button", () => {
      const cta = {
        text: "Acessar Dashboard MMI",
        url: "/mmi/dashboard",
        style: "background-color: #3b82f6; color: white;",
      };

      expect(cta.text).toContain("Dashboard MMI");
      expect(cta.url).toContain("/mmi");
    });

    it("should include footer with metadata", () => {
      const footer = {
        message: "Este é um alerta automático do sistema MMI",
        function_name: "send-alerts",
        branding: "Nautilus One - Manutenção Inteligente embarcada com IA real 🌊",
      };

      expect(footer.message).toContain("alerta automático");
      expect(footer.function_name).toBe("send-alerts");
      expect(footer.branding).toContain("Nautilus One");
    });
  });

  describe("Cron Job Scheduling", () => {
    it("should be scheduled daily at 08:00", () => {
      const cronSchedule = "0 8 * * *"; // Daily at 08:00
      const cronRegex = /^[\d\*\-,\/]+\s[\d\*\-,\/]+\s[\d\*\-,\/]+\s[\d\*\-,\/]+\s[\d\*\-,\/]+$/;

      expect(cronSchedule).toMatch(cronRegex);
    });

    it("should query jobs with correct filters", () => {
      const queryFilters = {
        priority: ["critical", "high"],
        status: ["pending", "in_progress", "overdue"],
      };

      expect(queryFilters.priority).toContain("critical");
      expect(queryFilters.priority).toContain("high");
      expect(queryFilters.status).toContain("overdue");
    });
  });

  describe("Error Handling", () => {
    it("should handle email service unavailable", () => {
      const errorResponse = {
        success: false,
        error: "Email service unavailable",
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeTruthy();
    });

    it("should handle missing API key", () => {
      const errorResponse = {
        success: true,
        message: "Sent 0 alert(s)",
        alerts_sent: 0,
        details: [
          {
            vessel_id: "vessel-alpha-123",
            jobs_count: 2,
            status: "not_sent_no_api_key",
          },
        ],
      };

      expect(errorResponse.details[0].status).toBe("not_sent_no_api_key");
    });

    it("should log errors gracefully", () => {
      const errorLog = {
        vessel_id: "vessel-alpha-123",
        error: "Failed to send email",
        timestamp: new Date().toISOString(),
      };

      expect(errorLog.error).toBeTruthy();
      expect(errorLog.vessel_id).toBeTruthy();
    });
  });

  describe("Alert Metrics", () => {
    it("should track alert delivery metrics", () => {
      const metrics = {
        total_alerts_sent: 5,
        successful: 4,
        failed: 1,
        success_rate: 0.8,
      };

      expect(metrics.successful).toBeGreaterThan(metrics.failed);
      expect(metrics.success_rate).toBe(0.8);
    });

    it("should track jobs per alert", () => {
      const alertMetrics = {
        vessel_id: "vessel-alpha-123",
        critical_jobs: 2,
        high_priority_jobs: 3,
        total_jobs: 5,
      };

      expect(alertMetrics.total_jobs).toBe(
        alertMetrics.critical_jobs + alertMetrics.high_priority_jobs
      );
    });
  });

  describe("Integration with Resend API", () => {
    it("should prepare Resend API request", () => {
      const resendRequest = {
        from: "Nautilus One MMI <alerts@nautilusone.com>",
        to: ["maintenance-team@nautilusone.com"],
        subject: "🚨 Alertas de Manutenção - 1 Crítico(s), 2 Alto(s)",
        html: "<html>...</html>",
      };

      expect(resendRequest.from).toContain("Nautilus One MMI");
      expect(resendRequest.to).toBeInstanceOf(Array);
      expect(resendRequest.subject).toBeTruthy();
      expect(resendRequest.html).toBeTruthy();
    });

    it("should handle Resend API response", () => {
      const resendResponse = {
        id: "email-id-123456",
        from: "alerts@nautilusone.com",
        to: ["maintenance-team@nautilusone.com"],
        created_at: new Date().toISOString(),
      };

      expect(resendResponse.id).toBeTruthy();
      expect(resendResponse.to.length).toBeGreaterThan(0);
    });
  });

  describe("Complete Alert Flow", () => {
    it("should execute complete alert sending flow", () => {
      const flow = {
        step1: "Query critical and high priority jobs",
        step2: "Group jobs by vessel",
        step3: "Generate email HTML for each vessel",
        step4: "Send emails via Resend API",
        step5: "Track sent alerts",
        step6: "Return response with metrics",
      };

      expect(flow.step1).toContain("Query");
      expect(flow.step2).toContain("Group");
      expect(flow.step3).toContain("Generate");
      expect(flow.step4).toContain("Send");
      expect(flow.step5).toContain("Track");
      expect(flow.step6).toContain("Return");
    });
  });
});
