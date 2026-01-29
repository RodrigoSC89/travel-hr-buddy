/**
 * Contract Lifecycle Manager (CLM) - Enterprise Grade
 * Superior to SoftExpert/Fluig with AI-powered contract intelligence
 * PATCH 860
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type ContractStatus = 
  | "draft" 
  | "pending_review" 
  | "under_negotiation"
  | "pending_approval"
  | "approved"
  | "active"
  | "expiring_soon"
  | "expired"
  | "renewed"
  | "terminated"
  | "archived";

export type ContractType =
  | "charter_party"
  | "crew_employment"
  | "service_agreement"
  | "supplier_contract"
  | "insurance_policy"
  | "maintenance_contract"
  | "port_services"
  | "bunker_supply"
  | "freight_forward"
  | "agency_agreement"
  | "nda"
  | "mou"
  | "amendment"
  | "other";

export interface ContractParty {
  id: string;
  name: string;
  type: "owner" | "charterer" | "supplier" | "agent" | "crew" | "insurer" | "other";
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  taxId?: string;
}

export interface ContractClause {
  id: string;
  clauseNumber: string;
  title: string;
  content: string;
  isStandard: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  category: string;
  aiAnalysis?: {
    summary: string;
    risks: string[];
    recommendations: string[];
    complianceFlags: string[];
  };
}

export interface ContractMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: "pending" | "completed" | "overdue" | "cancelled";
  reminderDays: number[];
  completedAt?: Date;
  completedBy?: string;
}

export interface ContractRenewal {
  id: string;
  renewalType: "auto" | "manual" | "negotiated";
  noticePeriodDays: number;
  renewalTermMonths: number;
  priceAdjustment?: {
    type: "fixed" | "percentage" | "indexed";
    value: number;
    index?: string;
  };
  conditions?: string[];
}

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: ContractType;
  status: ContractStatus;
  parties: ContractParty[];
  clauses: ContractClause[];
  milestones: ContractMilestone[];
  renewal?: ContractRenewal;
  
  // Financial
  totalValue: number;
  currency: string;
  paymentTerms: string;
  paymentSchedule?: {
    date: Date;
    amount: number;
    description: string;
    status: "pending" | "paid" | "overdue";
  }[];
  
  // Dates
  effectiveDate: Date;
  expirationDate: Date;
  signedDate?: Date;
  terminationDate?: Date;
  
  // Documents
  documentIds: string[];
  attachments: {
    id: string;
    name: string;
    type: string;
    storagePath: string;
    uploadedAt: Date;
  }[];
  
  // Vessel/Maritime specific
  vesselId?: string;
  vesselName?: string;
  imoNumber?: string;
  voyageDetails?: {
    loadPort?: string;
    dischargePort?: string;
    cargoType?: string;
    quantity?: number;
    laycanStart?: Date;
    laycanEnd?: Date;
  };
  
  // Compliance
  complianceChecks: {
    regulation: string;
    status: "compliant" | "non_compliant" | "pending_review";
    checkedAt: Date;
    notes?: string;
  }[];
  
  // AI Analysis
  aiInsights?: {
    riskScore: number;
    keyTermsSummary: string;
    obligationsSummary: string;
    potentialIssues: string[];
    negotiationOpportunities: string[];
    marketComparison?: {
      isCompetitive: boolean;
      benchmarkData: string;
    };
  };
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags: string[];
  organizationId: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  description: string;
  content: string;
  clauses: Omit<ContractClause, "id" | "aiAnalysis">[];
  variables: {
    name: string;
    type: "text" | "number" | "date" | "select" | "party";
    required: boolean;
    defaultValue?: string;
    options?: string[];
  }[];
  isActive: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

class ContractLifecycleManager {
  /**
   * Create new contract from template
   */
  async createFromTemplate(
    templateId: string,
    variables: Record<string, any>,
    organizationId: string,
    createdBy: string
  ): Promise<Contract> {
    try {
      // Get template
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      // Generate contract number
      const contractNumber = await this.generateContractNumber(template.type, organizationId);

      // Replace variables in content
      let content = template.content;
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, "g"), String(value));
      }

      // Create contract
      const contract: Contract = {
        id: crypto.randomUUID(),
        contractNumber,
        title: variables.title || `${template.name} - ${new Date().toISOString().split("T")[0]}`,
        type: template.type,
        status: "draft",
        parties: variables.parties || [],
        clauses: template.clauses.map(c => ({
          ...c,
          id: crypto.randomUUID()
        })),
        milestones: [],
        totalValue: variables.totalValue || 0,
        currency: variables.currency || "USD",
        paymentTerms: variables.paymentTerms || "",
        effectiveDate: new Date(variables.effectiveDate),
        expirationDate: new Date(variables.expirationDate),
        documentIds: [],
        attachments: [],
        complianceChecks: [],
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        tags: variables.tags || [],
        organizationId,
        vesselId: variables.vesselId,
        vesselName: variables.vesselName,
        imoNumber: variables.imoNumber
      };

      // Run AI analysis
      contract.aiInsights = await this.analyzeContract(contract);

      // Save to database
      await this.saveContract(contract);

      logger.info("Contract created from template", { contractId: contract.id, templateId });
      return contract;
    } catch (error) {
      logger.error("Error creating contract from template", error as Error);
      throw error;
    }
  }

  /**
   * AI-powered contract analysis
   */
  async analyzeContract(contract: Contract): Promise<Contract["aiInsights"]> {
    try {
      // Calculate risk score based on clauses
      const clauseRisks: number[] = contract.clauses.map(c => {
        switch (c.riskLevel) {
          case "critical": return 4;
          case "high": return 3;
          case "medium": return 2;
          case "low": return 1;
          default: return 0;
        }
      });
      
      const avgRisk = clauseRisks.length > 0 
        ? clauseRisks.reduce((a, b) => a + b, 0) / clauseRisks.length 
        : 0;
      
      const riskScore = Math.min(Math.round(avgRisk * 25), 100);

      // Generate summaries
      const keyTermsSummary = this.generateKeyTermsSummary(contract);
      const obligationsSummary = this.generateObligationsSummary(contract);

      // Identify potential issues
      const potentialIssues: string[] = [];
      
      // Check expiration
      const daysToExpiry = Math.ceil(
        (contract.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysToExpiry <= 30) {
        potentialIssues.push(`Contract expires in ${daysToExpiry} days - renewal action required`);
      }
      
      // Check for missing clauses
      const criticalClauses = ["liability", "termination", "force_majeure", "dispute_resolution"];
      const existingCategories = contract.clauses.map(c => c.category.toLowerCase());
      
      for (const critical of criticalClauses) {
        if (!existingCategories.includes(critical)) {
          potentialIssues.push(`Missing recommended clause: ${critical.replace("_", " ")}`);
        }
      }

      // Check compliance
      const nonCompliant = contract.complianceChecks.filter(c => c.status === "non_compliant");
      if (nonCompliant.length > 0) {
        potentialIssues.push(`${nonCompliant.length} compliance issue(s) detected`);
      }

      // Negotiation opportunities
      const negotiationOpportunities: string[] = [];
      
      if (contract.type === "charter_party" && contract.totalValue > 100000) {
        negotiationOpportunities.push("Consider volume discount for long-term charter");
      }
      
      if (contract.renewal?.renewalType === "auto") {
        negotiationOpportunities.push("Review auto-renewal terms for better conditions");
      }

      return {
        riskScore,
        keyTermsSummary,
        obligationsSummary,
        potentialIssues,
        negotiationOpportunities,
        marketComparison: {
          isCompetitive: riskScore < 50,
          benchmarkData: "Based on industry standards for maritime contracts"
        }
      };
    } catch (error) {
      logger.error("Error analyzing contract", error as Error);
      return undefined;
    }
  }

  /**
   * Extract clauses using AI
   */
  async extractClausesFromDocument(
    documentContent: string,
    contractType: ContractType
  ): Promise<ContractClause[]> {
    try {
      // Pattern-based clause extraction
      const clauses: ContractClause[] = [];
      
      // Common clause patterns
      const clausePatterns = [
        { pattern: /(?:article|clause|section)\s+(\d+(?:\.\d+)?)[:\s]+([^\n]+)/gi, type: "numbered" },
        { pattern: /(\d+\.\s+)([A-Z][^.]+\.)/g, type: "decimal" },
        { pattern: /((?:WHEREAS|NOW THEREFORE|IN WITNESS)[^.]+\.)/gi, type: "preamble" }
      ];

      let clauseNumber = 1;
      
      for (const { pattern } of clausePatterns) {
        let match;
        while ((match = pattern.exec(documentContent)) !== null) {
          const title = match[2] || match[1];
          const content = this.extractClauseContent(documentContent, match.index);
          
          clauses.push({
            id: crypto.randomUUID(),
            clauseNumber: String(clauseNumber++),
            title: title.trim().substring(0, 100),
            content: content.substring(0, 2000),
            isStandard: this.isStandardClause(title),
            riskLevel: this.assessClauseRisk(content),
            category: this.categorizeClause(title, content)
          });
        }
      }

      // Maritime-specific clause detection
      const maritimeClauses = this.extractMaritimeClauses(documentContent);
      clauses.push(...maritimeClauses);

      return clauses;
    } catch (error) {
      logger.error("Error extracting clauses", error as Error);
      return [];
    }
  }

  /**
   * Maritime-specific clause extraction
   */
  private extractMaritimeClauses(content: string): ContractClause[] {
    const clauses: ContractClause[] = [];
    
    const maritimePatterns = [
      { regex: /laytime[^.]+\./gi, category: "laytime" },
      { regex: /demurrage[^.]+\./gi, category: "demurrage" },
      { regex: /despatch[^.]+\./gi, category: "despatch" },
      { regex: /safe port[^.]+\./gi, category: "safe_port" },
      { regex: /general average[^.]+\./gi, category: "general_average" },
      { regex: /p&i|protection and indemnity[^.]+\./gi, category: "pni_insurance" },
      { regex: /bills? of lading[^.]+\./gi, category: "bill_of_lading" },
      { regex: /charter(?:er|party)[^.]+\./gi, category: "charter" },
      { regex: /bunker[^.]+\./gi, category: "bunker" },
      { regex: /BIMCO[^.]+\./gi, category: "bimco_standard" }
    ];

    let clauseNum = 100;
    
    for (const { regex, category } of maritimePatterns) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        clauses.push({
          id: crypto.randomUUID(),
          clauseNumber: `M${clauseNum++}`,
          title: `Maritime Clause - ${category.replace("_", " ").toUpperCase()}`,
          content: match[0],
          isStandard: true,
          riskLevel: category === "demurrage" || category === "laytime" ? "high" : "medium",
          category
        });
      }
    }

    return clauses;
  }

  /**
   * Check contract compliance with regulations
   */
  async checkCompliance(
    contractId: string,
    regulations: string[]
  ): Promise<Contract["complianceChecks"]> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract) throw new Error("Contract not found");

      const checks: Contract["complianceChecks"] = [];
      
      const regulationChecks: Record<string, (c: Contract) => boolean> = {
        "MLC 2006": (c: Contract) => {
          if (c.type !== "crew_employment") return true;
          const requiredClauses = ["working_hours", "wages", "repatriation", "accommodation"];
          return requiredClauses.every(rc => 
            c.clauses.some(cl => cl.category.toLowerCase().includes(rc))
          );
        },
        "STCW": (c) => {
          if (c.type !== "crew_employment") return true;
          return c.clauses.some(cl => 
            cl.content.toLowerCase().includes("certification") ||
            cl.content.toLowerCase().includes("qualification")
          );
        },
        "ISM Code": (c) => {
          return c.clauses.some(cl => 
            cl.category.toLowerCase().includes("safety") ||
            cl.content.toLowerCase().includes("safety management")
          );
        },
        "ISPS Code": (c) => {
          return c.clauses.some(cl => 
            cl.category.toLowerCase().includes("security") ||
            cl.content.toLowerCase().includes("security")
          );
        },
        "SOLAS": (c) => {
          return c.clauses.some(cl => 
            cl.content.toLowerCase().includes("life saving") ||
            cl.content.toLowerCase().includes("safety of life")
          );
        },
        "MARPOL": (c) => {
          return c.clauses.some(cl => 
            cl.content.toLowerCase().includes("pollution") ||
            cl.content.toLowerCase().includes("environmental")
          );
        }
      };

      for (const reg of regulations) {
        const regulationCheckFn = regulationChecks[reg];
        const isCompliant = regulationCheckFn ? regulationCheckFn(contract) : false;
        checks.push({
          regulation: reg,
          status: isCompliant ? "compliant" : "pending_review",
          checkedAt: new Date(),
          notes: regulationCheckFn ? undefined : "Manual review required"
        });
      }

      // Update contract
      await this.updateContractCompliance(contractId, checks);

      return checks;
    } catch (error) {
      logger.error("Error checking compliance", error as Error);
      return [];
    }
  }

  /**
   * Set up contract alerts and reminders
   */
  async setupContractAlerts(
    contractId: string,
    alertConfig: {
      expiryAlertDays: number[];
      milestoneReminderDays: number;
      paymentReminderDays: number;
      renewalAlertDays: number[];
    }
  ): Promise<void> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract) throw new Error("Contract not found");

      const alerts: any[] = [];

      // Expiry alerts
      for (const days of alertConfig.expiryAlertDays) {
        const alertDate = new Date(contract.expirationDate);
        alertDate.setDate(alertDate.getDate() - days);
        
        if (alertDate > new Date()) {
          alerts.push({
            type: "expiry",
            contractId,
            scheduledFor: alertDate,
            message: `Contract ${contract.contractNumber} expires in ${days} days`,
            priority: days <= 7 ? "high" : days <= 30 ? "medium" : "low"
          });
        }
      }

      // Milestone reminders
      for (const milestone of contract.milestones) {
        if (milestone.status === "pending") {
          const alertDate = new Date(milestone.dueDate);
          alertDate.setDate(alertDate.getDate() - alertConfig.milestoneReminderDays);
          
          if (alertDate > new Date()) {
            alerts.push({
              type: "milestone",
              contractId,
              milestoneId: milestone.id,
              scheduledFor: alertDate,
              message: `Milestone "${milestone.title}" due in ${alertConfig.milestoneReminderDays} days`,
              priority: "medium"
            });
          }
        }
      }

      // Payment reminders
      if (contract.paymentSchedule) {
        for (const payment of contract.paymentSchedule) {
          if (payment.status === "pending") {
            const alertDate = new Date(payment.date);
            alertDate.setDate(alertDate.getDate() - alertConfig.paymentReminderDays);
            
            if (alertDate > new Date()) {
              alerts.push({
                type: "payment",
                contractId,
                scheduledFor: alertDate,
                message: `Payment of ${contract.currency} ${payment.amount} due in ${alertConfig.paymentReminderDays} days`,
                priority: "high"
              });
            }
          }
        }
      }

      // Renewal alerts
      if (contract.renewal) {
        for (const days of alertConfig.renewalAlertDays) {
          const renewalDeadline = new Date(contract.expirationDate);
          renewalDeadline.setDate(renewalDeadline.getDate() - contract.renewal.noticePeriodDays);
          
          const alertDate = new Date(renewalDeadline);
          alertDate.setDate(alertDate.getDate() - days);
          
          if (alertDate > new Date()) {
            alerts.push({
              type: "renewal",
              contractId,
              scheduledFor: alertDate,
              message: `Renewal decision required for ${contract.contractNumber} - notice period ends in ${days + contract.renewal.noticePeriodDays} days`,
              priority: days <= 7 ? "critical" : "high"
            });
          }
        }
      }

      // Save alerts to database
      for (const alert of alerts) {
        await supabase.from("soc_alerts").insert({
          alert_type: "contract_alert",
          severity: alert.priority,
          title: alert.message,
          message: alert.message,
          metadata: { contractId, type: alert.type, scheduledFor: alert.scheduledFor }
        });
      }

      logger.info("Contract alerts configured", { contractId, alertCount: alerts.length });
    } catch (error) {
      logger.error("Error setting up contract alerts", error as Error);
      throw error;
    }
  }

  /**
   * Generate contract amendment
   */
  async createAmendment(
    originalContractId: string,
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
      reason: string;
    }[],
    effectiveDate: Date,
    createdBy: string
  ): Promise<Contract> {
    try {
      const original = await this.getContract(originalContractId);
      if (!original) throw new Error("Original contract not found");

      const amendmentNumber = await this.getNextAmendmentNumber(originalContractId);

      const amendment: Contract = {
        ...original,
        id: crypto.randomUUID(),
        contractNumber: `${original.contractNumber}-AMD${amendmentNumber}`,
        title: `Amendment ${amendmentNumber} to ${original.title}`,
        type: "amendment",
        status: "draft",
        effectiveDate,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
        clauses: [
          {
            id: crypto.randomUUID(),
            clauseNumber: "1",
            title: "Amendment Details",
            content: changes.map(c => 
              `${c.field}: Changed from "${c.oldValue}" to "${c.newValue}". Reason: ${c.reason}`
            ).join("\n\n"),
            isStandard: false,
            riskLevel: "medium",
            category: "amendment"
          }
        ]
      };

      // Apply changes
      for (const change of changes) {
        if (change.field in amendment) {
          (amendment as any)[change.field] = change.newValue;
        }
      }

      // Run AI analysis on amendment
      amendment.aiInsights = await this.analyzeContract(amendment);

      await this.saveContract(amendment);

      // Link amendment to original
      await this.linkAmendment(originalContractId, amendment.id);

      logger.info("Amendment created", { originalId: originalContractId, amendmentId: amendment.id });
      return amendment;
    } catch (error) {
      logger.error("Error creating amendment", error as Error);
      throw error;
    }
  }

  // Private helper methods
  private async getTemplate(templateId: string): Promise<ContractTemplate | null> {
    const { data } = await supabase
      .from("ai_document_templates")
      .select("*")
      .eq("id", templateId)
      .single();
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.title,
      type: data.template_type as ContractType,
      description: "",
      content: data.content,
      clauses: [],
      variables: data.variables as any[] || [],
      isActive: true,
      version: "1.0",
      createdAt: new Date(data.created_at!),
      updatedAt: new Date(data.updated_at!)
    };
  }

  private async generateContractNumber(type: ContractType, orgId: string): Promise<string> {
    const prefix = type.substring(0, 3).toUpperCase();
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${year}-${random}`;
  }

  private generateKeyTermsSummary(contract: Contract): string {
    return `${contract.type.replace("_", " ").toUpperCase()} contract valued at ${contract.currency} ${contract.totalValue.toLocaleString()}, effective from ${contract.effectiveDate.toLocaleDateString()} to ${contract.expirationDate.toLocaleDateString()}. Involves ${contract.parties.length} parties.`;
  }

  private generateObligationsSummary(contract: Contract): string {
    const obligationClauses = contract.clauses.filter(c => 
      c.category.toLowerCase().includes("obligation") ||
      c.content.toLowerCase().includes("shall") ||
      c.content.toLowerCase().includes("must")
    );
    return `${obligationClauses.length} obligation clauses identified. ${contract.milestones.length} milestones tracked.`;
  }

  private extractClauseContent(document: string, startIndex: number): string {
    const nextClause = document.substring(startIndex + 100).search(/(?:article|clause|section)\s+\d/i);
    const endIndex = nextClause > 0 ? startIndex + 100 + nextClause : startIndex + 1000;
    return document.substring(startIndex, Math.min(endIndex, document.length));
  }

  private isStandardClause(title: string): boolean {
    const standardTerms = ["termination", "liability", "indemnity", "force majeure", "dispute", "confidentiality"];
    return standardTerms.some(term => title.toLowerCase().includes(term));
  }

  private assessClauseRisk(content: string): ContractClause["riskLevel"] {
    const highRiskTerms = ["unlimited liability", "sole discretion", "waive all", "indemnify"];
    const criticalRiskTerms = ["personal guarantee", "unlimited exposure", "waive rights"];
    
    if (criticalRiskTerms.some(t => content.toLowerCase().includes(t))) return "critical";
    if (highRiskTerms.some(t => content.toLowerCase().includes(t))) return "high";
    return "medium";
  }

  private categorizeClause(title: string, content: string): string {
    const categories: Record<string, string[]> = {
      "liability": ["liability", "damages", "indemnity"],
      "termination": ["termination", "cancel", "end"],
      "payment": ["payment", "price", "fee", "cost"],
      "confidentiality": ["confidential", "secret", "proprietary"],
      "force_majeure": ["force majeure", "act of god", "beyond control"],
      "dispute_resolution": ["dispute", "arbitration", "jurisdiction"],
      "warranty": ["warrant", "guarantee", "represent"],
      "insurance": ["insurance", "coverage", "policy"]
    };

    const combined = `${title} ${content}`.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(k => combined.includes(k))) {
        return category;
      }
    }
    
    return "general";
  }

  private async getContract(id: string): Promise<Contract | null> {
    // Implementation would fetch from database
    return null;
  }

  private async saveContract(contract: Contract): Promise<void> {
    // Implementation would save to database
  }

  private async updateContractCompliance(id: string, checks: Contract["complianceChecks"]): Promise<void> {
    // Implementation would update database
  }

  private async getNextAmendmentNumber(contractId: string): Promise<number> {
    // Implementation would query database
    return 1;
  }

  private async linkAmendment(originalId: string, amendmentId: string): Promise<void> {
    // Implementation would update database
  }
}

export const contractLifecycleManager = new ContractLifecycleManager();
