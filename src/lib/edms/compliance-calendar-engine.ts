/**
 * Compliance Calendar Engine - Regulatory Deadline Management
 * Maritime-focused with ISM, MLC, STCW, SOLAS, MARPOL integration
 * PATCH 862
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type RegulationType =
  | "MLC_2006"
  | "STCW"
  | "ISM_CODE"
  | "ISPS_CODE"
  | "SOLAS"
  | "MARPOL"
  | "IMDG"
  | "BWM"
  | "CLC"
  | "FUND"
  | "HNS"
  | "AFS"
  | "HONG_KONG"
  | "POLAR_CODE"
  | "IGF_CODE"
  | "EU_MRV"
  | "IMO_DCS"
  | "EEXI"
  | "CII"
  | "FLAG_STATE"
  | "CLASS"
  | "PSC"
  | "INTERNAL";

export type ComplianceStatus =
  | "compliant"
  | "expiring_soon"
  | "expired"
  | "pending_renewal"
  | "under_review"
  | "non_compliant"
  | "not_applicable"
  | "exempted";

export type ComplianceItemType =
  | "certificate"
  | "survey"
  | "audit"
  | "inspection"
  | "drill"
  | "training"
  | "document"
  | "permit"
  | "license"
  | "endorsement"
  | "declaration"
  | "report"
  | "plan"
  | "manual";

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  type: ComplianceItemType;
  regulation: RegulationType;
  regulationReference: string;
  
  // Dates
  issueDate: Date;
  expiryDate: Date;
  nextRenewalDate?: Date;
  lastReviewDate?: Date;
  
  // Status
  status: ComplianceStatus;
  statusHistory: {
    status: ComplianceStatus;
    changedAt: Date;
    changedBy: string;
    notes?: string;
  }[];
  
  // Vessel/Crew
  vesselId?: string;
  vesselName?: string;
  crewMemberId?: string;
  crewMemberName?: string;
  
  // Documents
  documentIds: string[];
  certificateNumber?: string;
  issuingAuthority?: string;
  
  // Reminders
  reminderSchedule: {
    daysBeforeExpiry: number;
    notified: boolean;
    notifiedAt?: Date;
  }[];
  
  // AI Predictions
  aiPredictions?: {
    renewalComplexity: "low" | "medium" | "high";
    estimatedProcessingDays: number;
    potentialIssues: string[];
    recommendedStartDate: Date;
    complianceRiskScore: number;
  };
  
  // Actions
  requiredActions: {
    id: string;
    action: string;
    assignedTo?: string;
    dueDate: Date;
    status: "pending" | "in_progress" | "completed" | "overdue";
    completedAt?: Date;
  }[];
  
  // Metadata
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  notes: string;
  attachments: string[];
}

export interface ComplianceMatrix {
  vesselId: string;
  vesselName: string;
  imoNumber: string;
  flagState: string;
  classificationSociety: string;
  
  categories: {
    category: string;
    regulations: RegulationType[];
    items: ComplianceItem[];
    overallStatus: ComplianceStatus;
    compliancePercentage: number;
    nextDeadline?: Date;
  }[];
  
  summary: {
    totalItems: number;
    compliant: number;
    expiringSoon: number;
    expired: number;
    nonCompliant: number;
    overallScore: number;
  };
  
  upcomingDeadlines: {
    item: ComplianceItem;
    daysRemaining: number;
    priority: "critical" | "high" | "medium" | "low";
  }[];
  
  generatedAt: Date;
}

export interface ComplianceAlert {
  id: string;
  itemId: string;
  type: "expiry" | "renewal" | "action" | "inspection" | "deficiency" | "psc";
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  dueDate: Date;
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  escalatedTo?: string[];
  metadata: Record<string, any>;
}

class ComplianceCalendarEngine {
  private readonly DEFAULT_REMINDER_DAYS = [90, 60, 30, 14, 7, 3, 1];

  /**
   * Create compliance item with AI-assisted recommendations
   */
  async createComplianceItem(
    item: Omit<ComplianceItem, "id" | "createdAt" | "updatedAt" | "statusHistory" | "aiPredictions">
  ): Promise<ComplianceItem> {
    try {
      const newItem: ComplianceItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        statusHistory: [{
          status: item.status,
          changedAt: new Date(),
          changedBy: item.createdBy,
          notes: "Initial creation"
        }],
        reminderSchedule: item.reminderSchedule || this.DEFAULT_REMINDER_DAYS.map(days => ({
          daysBeforeExpiry: days,
          notified: false
        }))
      };

      // Generate AI predictions
      newItem.aiPredictions = await this.generateAIPredictions(newItem);

      // Save to database
      await this.saveComplianceItem(newItem);

      // Schedule reminders
      await this.scheduleReminders(newItem);

      logger.info("Compliance item created", { itemId: newItem.id, type: newItem.type });
      return newItem;
    } catch (error) {
      logger.error("Error creating compliance item", error as Error);
      throw error;
    }
  }

  /**
   * Generate vessel compliance matrix
   */
  async generateComplianceMatrix(vesselId: string): Promise<ComplianceMatrix> {
    try {
      // Fetch vessel details
      const { data: vessel } = await supabase
        .from("vessels")
        .select("*")
        .eq("id", vesselId)
        .single();

      if (!vessel) throw new Error("Vessel not found");

      // Fetch all compliance items for vessel
      const items = await this.getVesselComplianceItems(vesselId);

      // Categorize items
      const categories = this.categorizeComplianceItems(items);

      // Calculate summary
      const summary = this.calculateComplianceSummary(items);

      // Get upcoming deadlines
      const upcomingDeadlines = this.getUpcomingDeadlines(items);

      const matrix: ComplianceMatrix = {
        vesselId,
        vesselName: vessel.name,
        imoNumber: vessel.imo_number || "",
        flagState: vessel.flag_state || "",
        classificationSociety: (vessel.metadata as any)?.classificationSociety || "",
        categories,
        summary,
        upcomingDeadlines,
        generatedAt: new Date()
      };

      logger.info("Compliance matrix generated", { vesselId });
      return matrix;
    } catch (error) {
      logger.error("Error generating compliance matrix", error as Error);
      throw error;
    }
  }

  /**
   * AI-powered compliance predictions
   */
  private async generateAIPredictions(item: ComplianceItem): Promise<ComplianceItem["aiPredictions"]> {
    try {
      const daysToExpiry = Math.ceil(
        (item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Determine complexity based on regulation and type
      const complexityFactors: Record<string, number> = {
        survey: 3,
        audit: 3,
        certificate: 2,
        inspection: 2,
        training: 1,
        drill: 1,
        document: 1,
        permit: 2,
        license: 2,
        endorsement: 2,
        declaration: 1,
        report: 1,
        plan: 2,
        manual: 2
      };

      const regulationComplexity: Record<RegulationType, number> = {
        ISM_CODE: 3,
        ISPS_CODE: 3,
        SOLAS: 3,
        MLC_2006: 2,
        STCW: 2,
        MARPOL: 2,
        POLAR_CODE: 3,
        IGF_CODE: 3,
        CLASS: 3,
        PSC: 2,
        FLAG_STATE: 2,
        EEXI: 2,
        CII: 2,
        EU_MRV: 2,
        IMO_DCS: 2,
        IMDG: 1,
        BWM: 2,
        CLC: 1,
        FUND: 1,
        HNS: 1,
        AFS: 1,
        HONG_KONG: 1,
        INTERNAL: 1
      };

      const typeComplexity = complexityFactors[item.type] || 2;
      const regComplexity = regulationComplexity[item.regulation] || 2;
      const totalComplexity = (typeComplexity + regComplexity) / 2;

      let renewalComplexity: "low" | "medium" | "high";
      if (totalComplexity >= 2.5) renewalComplexity = "high";
      else if (totalComplexity >= 1.5) renewalComplexity = "medium";
      else renewalComplexity = "low";

      // Estimate processing days
      const processingDays = {
        low: 14,
        medium: 30,
        high: 60
      }[renewalComplexity];

      // Calculate recommended start date
      const recommendedStartDate = new Date(item.expiryDate);
      recommendedStartDate.setDate(recommendedStartDate.getDate() - processingDays - 30);

      // Identify potential issues
      const potentialIssues: string[] = [];

      if (daysToExpiry < processingDays) {
        potentialIssues.push("Insufficient time for renewal - expedited process required");
      }

      if (item.type === "certificate" && !item.certificateNumber) {
        potentialIssues.push("Missing certificate number - verification required");
      }

      if (item.requiredActions.some(a => a.status === "overdue")) {
        potentialIssues.push("Overdue actions may delay renewal");
      }

      // Calculate risk score
      let riskScore = 0;
      if (daysToExpiry <= 0) riskScore = 100;
      else if (daysToExpiry <= 7) riskScore = 90;
      else if (daysToExpiry <= 14) riskScore = 75;
      else if (daysToExpiry <= 30) riskScore = 50;
      else if (daysToExpiry <= 60) riskScore = 25;
      else if (daysToExpiry <= 90) riskScore = 10;
      else riskScore = 0;

      // Adjust for overdue actions
      const overdueCount = item.requiredActions.filter(a => a.status === "overdue").length;
      riskScore = Math.min(100, riskScore + overdueCount * 10);

      return {
        renewalComplexity,
        estimatedProcessingDays: processingDays,
        potentialIssues,
        recommendedStartDate,
        complianceRiskScore: riskScore
      };
    } catch (error) {
      logger.error("Error generating AI predictions", error as Error);
      return undefined;
    }
  }

  /**
   * Check and send reminders for upcoming expirations
   */
  async processReminders(): Promise<{
    processed: number;
    sent: number;
    alerts: ComplianceAlert[];
  }> {
    try {
      const alerts: ComplianceAlert[] = [];
      let processed = 0;
      let sent = 0;

      // Get all items with upcoming expirations
      const items = await this.getItemsNeedingReminders();

      for (const item of items) {
        processed++;
        const daysToExpiry = Math.ceil(
          (item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        // Check which reminders need to be sent
        for (const reminder of item.reminderSchedule) {
          if (!reminder.notified && daysToExpiry <= reminder.daysBeforeExpiry) {
            // Create alert
            const alert = await this.createAlert(item, daysToExpiry);
            alerts.push(alert);

            // Mark reminder as sent
            reminder.notified = true;
            reminder.notifiedAt = new Date();
            sent++;
          }
        }

        // Update item with reminder status
        await this.updateComplianceItem(item.id, {
          reminderSchedule: item.reminderSchedule
        });
      }

      logger.info("Reminders processed", { processed, sent });
      return { processed, sent, alerts };
    } catch (error) {
      logger.error("Error processing reminders", error as Error);
      throw error;
    }
  }

  /**
   * Get PSC readiness assessment
   */
  async assessPSCReadiness(vesselId: string): Promise<{
    readinessScore: number;
    status: "ready" | "needs_attention" | "not_ready";
    criticalItems: ComplianceItem[];
    recommendations: string[];
    riskAreas: { area: string; risk: "low" | "medium" | "high"; details: string }[];
  }> {
    try {
      const matrix = await this.generateComplianceMatrix(vesselId);
      
      const pscCriticalRegulations: RegulationType[] = [
        "SOLAS", "MARPOL", "MLC_2006", "STCW", "ISM_CODE", "ISPS_CODE"
      ];

      const criticalItems: ComplianceItem[] = [];
      const riskAreas: { area: string; risk: "low" | "medium" | "high"; details: string }[] = [];

      for (const category of matrix.categories) {
        for (const item of category.items) {
          if (pscCriticalRegulations.includes(item.regulation)) {
            if (item.status === "expired" || item.status === "non_compliant") {
              criticalItems.push(item);
            }
          }
        }
      }

      // Calculate readiness score
      let readinessScore = 100;
      
      // Deduct for expired items
      readinessScore -= criticalItems.filter(i => i.status === "expired").length * 15;
      
      // Deduct for expiring soon
      readinessScore -= criticalItems.filter(i => i.status === "expiring_soon").length * 5;
      
      // Deduct for overdue actions
      const overdueActions = criticalItems.flatMap(i => 
        i.requiredActions.filter(a => a.status === "overdue")
      ).length;
      readinessScore -= overdueActions * 10;

      readinessScore = Math.max(0, readinessScore);

      // Determine status
      let status: "ready" | "needs_attention" | "not_ready";
      if (readinessScore >= 80) status = "ready";
      else if (readinessScore >= 50) status = "needs_attention";
      else status = "not_ready";

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (criticalItems.some(i => i.regulation === "MLC_2006")) {
        recommendations.push("Review MLC 2006 compliance - crew-related documentation at risk");
      }
      
      if (criticalItems.some(i => i.type === "certificate")) {
        recommendations.push("Urgent certificate renewal required");
      }

      if (overdueActions > 0) {
        recommendations.push(`Complete ${overdueActions} overdue action(s) immediately`);
      }

      // Assess risk areas
      const safetyItems = criticalItems.filter(i => 
        i.regulation === "SOLAS" || i.regulation === "ISM_CODE"
      );
      
      if (safetyItems.length > 0) {
        riskAreas.push({
          area: "Safety Management",
          risk: safetyItems.length > 2 ? "high" : "medium",
          details: `${safetyItems.length} item(s) requiring attention`
        });
      }

      const envItems = criticalItems.filter(i => i.regulation === "MARPOL");
      if (envItems.length > 0) {
        riskAreas.push({
          area: "Environmental Compliance",
          risk: envItems.length > 2 ? "high" : "medium",
          details: `${envItems.length} MARPOL item(s) requiring attention`
        });
      }

      return {
        readinessScore,
        status,
        criticalItems,
        recommendations,
        riskAreas
      };
    } catch (error) {
      logger.error("Error assessing PSC readiness", error as Error);
      throw error;
    }
  }

  /**
   * Generate regulatory calendar for upcoming inspections/surveys
   */
  async generateRegulatoryCalendar(
    vesselId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    events: {
      date: Date;
      title: string;
      type: ComplianceItemType;
      regulation: RegulationType;
      item: ComplianceItem;
      priority: "critical" | "high" | "medium" | "low";
    }[];
    summary: {
      totalEvents: number;
      byMonth: Record<string, number>;
      byType: Record<ComplianceItemType, number>;
      byRegulation: Record<RegulationType, number>;
    };
  }> {
    try {
      const items = await this.getVesselComplianceItems(vesselId);
      
      const events: any[] = [];
      const byMonth: Record<string, number> = {};
      const byType: Record<string, number> = {};
      const byRegulation: Record<string, number> = {};

      for (const item of items) {
        // Check expiry date
        if (item.expiryDate >= startDate && item.expiryDate <= endDate) {
          const monthKey = item.expiryDate.toISOString().substring(0, 7);
          byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
          byType[item.type] = (byType[item.type] || 0) + 1;
          byRegulation[item.regulation] = (byRegulation[item.regulation] || 0) + 1;

          const daysToExpiry = Math.ceil(
            (item.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          events.push({
            date: item.expiryDate,
            title: `${item.title} - Expiry`,
            type: item.type,
            regulation: item.regulation,
            item,
            priority: daysToExpiry <= 7 ? "critical" : 
                     daysToExpiry <= 30 ? "high" : 
                     daysToExpiry <= 60 ? "medium" : "low"
          });
        }

        // Check required actions
        for (const action of item.requiredActions) {
          if (action.dueDate >= startDate && action.dueDate <= endDate && 
              action.status !== "completed") {
            events.push({
              date: action.dueDate,
              title: `${item.title} - ${action.action}`,
              type: item.type,
              regulation: item.regulation,
              item,
              priority: action.status === "overdue" ? "critical" : "high"
            });
          }
        }
      }

      // Sort events by date
      events.sort((a, b) => a.date.getTime() - b.date.getTime());

      return {
        events,
        summary: {
          totalEvents: events.length,
          byMonth,
          byType: byType as Record<ComplianceItemType, number>,
          byRegulation: byRegulation as Record<RegulationType, number>
        }
      };
    } catch (error) {
      logger.error("Error generating regulatory calendar", error as Error);
      throw error;
    }
  }

  // Private helper methods
  private categorizeComplianceItems(items: ComplianceItem[]): ComplianceMatrix["categories"] {
    const categoryMap: Record<string, { regulations: RegulationType[]; items: ComplianceItem[] }> = {
      "Safety Management": {
        regulations: ["ISM_CODE", "SOLAS"],
        items: []
      },
      "Security": {
        regulations: ["ISPS_CODE"],
        items: []
      },
      "Environmental": {
        regulations: ["MARPOL", "BWM", "AFS", "EU_MRV", "IMO_DCS", "EEXI", "CII"],
        items: []
      },
      "Crew Compliance": {
        regulations: ["MLC_2006", "STCW"],
        items: []
      },
      "Classification & Flag": {
        regulations: ["CLASS", "FLAG_STATE", "PSC"],
        items: []
      },
      "Cargo & Dangerous Goods": {
        regulations: ["IMDG", "CLC", "FUND", "HNS"],
        items: []
      },
      "Special Operations": {
        regulations: ["POLAR_CODE", "IGF_CODE", "HONG_KONG"],
        items: []
      },
      "Internal Procedures": {
        regulations: ["INTERNAL"],
        items: []
      }
    };

    for (const item of items) {
      for (const [category, config] of Object.entries(categoryMap)) {
        if (config.regulations.includes(item.regulation)) {
          config.items.push(item);
          break;
        }
      }
    }

    return Object.entries(categoryMap).map(([category, config]) => {
      const compliant = config.items.filter(i => i.status === "compliant").length;
      const total = config.items.length;

      return {
        category,
        regulations: config.regulations,
        items: config.items,
        overallStatus: this.calculateCategoryStatus(config.items),
        compliancePercentage: total > 0 ? Math.round((compliant / total) * 100) : 100,
        nextDeadline: this.getNextDeadline(config.items)
      };
    });
  }

  private calculateCategoryStatus(items: ComplianceItem[]): ComplianceStatus {
    if (items.some(i => i.status === "expired" || i.status === "non_compliant")) {
      return "non_compliant";
    }
    if (items.some(i => i.status === "expiring_soon")) {
      return "expiring_soon";
    }
    if (items.every(i => i.status === "compliant")) {
      return "compliant";
    }
    return "pending_renewal";
  }

  private getNextDeadline(items: ComplianceItem[]): Date | undefined {
    const upcoming = items
      .filter(i => i.expiryDate > new Date())
      .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
    return upcoming[0]?.expiryDate;
  }

  private calculateComplianceSummary(items: ComplianceItem[]): ComplianceMatrix["summary"] {
    const compliant = items.filter(i => i.status === "compliant").length;
    const expiringSoon = items.filter(i => i.status === "expiring_soon").length;
    const expired = items.filter(i => i.status === "expired").length;
    const nonCompliant = items.filter(i => i.status === "non_compliant").length;

    return {
      totalItems: items.length,
      compliant,
      expiringSoon,
      expired,
      nonCompliant,
      overallScore: items.length > 0 
        ? Math.round((compliant / items.length) * 100)
        : 100
    };
  }

  private getUpcomingDeadlines(items: ComplianceItem[]): ComplianceMatrix["upcomingDeadlines"] {
    const now = new Date();
    const upcoming = items
      .filter(i => i.expiryDate > now)
      .map(item => {
        const daysRemaining = Math.ceil(
          (item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          item,
          daysRemaining,
          priority: daysRemaining <= 7 ? "critical" as const :
                   daysRemaining <= 30 ? "high" as const :
                   daysRemaining <= 60 ? "medium" as const : "low" as const
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 10);

    return upcoming;
  }

  private async getVesselComplianceItems(vesselId: string): Promise<ComplianceItem[]> {
    // Would fetch from database - returning mock for now
    return [];
  }

  private async getItemsNeedingReminders(): Promise<ComplianceItem[]> {
    // Would fetch from database
    return [];
  }

  private async createAlert(item: ComplianceItem, daysToExpiry: number): Promise<ComplianceAlert> {
    const alert: ComplianceAlert = {
      id: crypto.randomUUID(),
      itemId: item.id,
      type: "expiry",
      priority: daysToExpiry <= 7 ? "critical" : daysToExpiry <= 30 ? "high" : "medium",
      title: `${item.title} expires in ${daysToExpiry} days`,
      message: `${item.type} under ${item.regulation} requires attention`,
      dueDate: item.expiryDate,
      createdAt: new Date(),
      metadata: {
        regulation: item.regulation,
        vesselId: item.vesselId
      }
    };

    // Save alert
    await supabase.from("soc_alerts").insert({
      alert_type: "compliance_expiry",
      severity: alert.priority,
      title: alert.title,
      message: alert.message,
      vessel_id: item.vesselId,
      metadata: alert.metadata
    });

    return alert;
  }

  private async saveComplianceItem(item: ComplianceItem): Promise<void> {
    // Would save to database
  }

  private async updateComplianceItem(id: string, updates: Partial<ComplianceItem>): Promise<void> {
    // Would update database
  }

  private async scheduleReminders(item: ComplianceItem): Promise<void> {
    // Would create scheduled tasks for reminders
  }
}

export const complianceCalendarEngine = new ComplianceCalendarEngine();
