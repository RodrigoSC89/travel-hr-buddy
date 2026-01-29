/**
 * Document Templates Engine
 * AI-powered template generation and management
 * PATCH 865 - All-in-One EDMS
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  type: TemplateType;
  content: string;
  variables: TemplateVariable[];
  sections: TemplateSection[];
  metadata: TemplateMetadata;
  regulations: string[];
  version: string;
  status: "draft" | "active" | "archived";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export type TemplateCategory = 
  | "contracts"
  | "policies"
  | "procedures"
  | "checklists"
  | "reports"
  | "forms"
  | "certificates"
  | "manuals"
  | "correspondence"
  | "compliance";

export type TemplateType =
  | "crew_contract"
  | "safety_checklist"
  | "incident_report"
  | "maintenance_log"
  | "training_certificate"
  | "voyage_plan"
  | "port_arrival"
  | "cargo_manifest"
  | "insurance_claim"
  | "regulatory_report"
  | "custom";

export interface TemplateVariable {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "multiselect" | "boolean" | "signature" | "image";
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: string[];
  validation?: VariableValidation;
  aiSuggestion?: boolean;
  source?: "crew_db" | "vessel_db" | "user_input" | "ai_generated";
}

export interface VariableValidation {
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  customValidator?: string;
}

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  order: number;
  isRequired: boolean;
  isConditional: boolean;
  condition?: string;
  subsections?: TemplateSection[];
}

export interface TemplateMetadata {
  author: string;
  department: string;
  documentNumber?: string;
  effectiveDate?: Date;
  reviewDate?: Date;
  approvalRequired: boolean;
  approvers?: string[];
  tags: string[];
  language: string;
  pageSettings: PageSettings;
}

export interface PageSettings {
  size: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  margins: { top: number; right: number; bottom: number; left: number };
  header?: string;
  footer?: string;
  watermark?: string;
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  templateName: string;
  title: string;
  content: string;
  filledVariables: Record<string, unknown>;
  generatedBy: string;
  generatedAt: Date;
  status: "draft" | "pending_approval" | "approved" | "signed";
  approvals: DocumentApproval[];
  signatures: DocumentSignature[];
}

export interface DocumentApproval {
  approverId: string;
  approverName: string;
  status: "pending" | "approved" | "rejected";
  comments?: string;
  timestamp?: Date;
}

export interface DocumentSignature {
  signerId: string;
  signerName: string;
  signatureData: string;
  timestamp: Date;
  ipAddress?: string;
}

// Maritime-specific templates
const MARITIME_TEMPLATES: Partial<DocumentTemplate>[] = [
  {
    name: "Seafarer Employment Agreement (SEA)",
    category: "contracts",
    type: "crew_contract",
    description: "MLC 2006 compliant employment agreement for seafarers",
    regulations: ["MLC 2006"],
    variables: [
      { id: "v1", name: "seafarer_name", label: "Seafarer Full Name", type: "text", required: true, source: "crew_db" },
      { id: "v2", name: "position", label: "Position/Rank", type: "select", required: true, options: ["Master", "Chief Officer", "2nd Officer", "3rd Officer", "Chief Engineer", "2nd Engineer", "3rd Engineer", "Bosun", "AB", "OS", "Oiler", "Cook", "Steward"] },
      { id: "v3", name: "vessel_name", label: "Vessel Name", type: "text", required: true, source: "vessel_db" },
      { id: "v4", name: "imo_number", label: "IMO Number", type: "text", required: true, source: "vessel_db" },
      { id: "v5", name: "contract_start", label: "Contract Start Date", type: "date", required: true },
      { id: "v6", name: "contract_duration", label: "Contract Duration (months)", type: "number", required: true },
      { id: "v7", name: "monthly_wage", label: "Monthly Basic Wage", type: "number", required: true },
      { id: "v8", name: "currency", label: "Currency", type: "select", required: true, options: ["USD", "EUR", "GBP"] }
    ]
  },
  {
    name: "Pre-Departure Safety Checklist",
    category: "checklists",
    type: "safety_checklist",
    description: "ISM Code compliant pre-departure safety verification",
    regulations: ["ISM Code", "SOLAS"],
    variables: [
      { id: "v1", name: "vessel_name", label: "Vessel Name", type: "text", required: true },
      { id: "v2", name: "departure_port", label: "Departure Port", type: "text", required: true },
      { id: "v3", name: "destination_port", label: "Destination Port", type: "text", required: true },
      { id: "v4", name: "departure_date", label: "Departure Date/Time", type: "date", required: true },
      { id: "v5", name: "master_name", label: "Master's Name", type: "text", required: true },
      { id: "v6", name: "crew_count", label: "Total Crew on Board", type: "number", required: true }
    ]
  },
  {
    name: "Incident/Accident Report",
    category: "reports",
    type: "incident_report",
    description: "Comprehensive incident reporting form per ISM Code Section 9",
    regulations: ["ISM Code", "MLC 2006"],
    variables: [
      { id: "v1", name: "incident_date", label: "Incident Date/Time", type: "date", required: true },
      { id: "v2", name: "incident_location", label: "Location (Lat/Long or Port)", type: "text", required: true },
      { id: "v3", name: "incident_type", label: "Incident Type", type: "select", required: true, options: ["Personal Injury", "Near Miss", "Property Damage", "Environmental", "Security", "Operational"] },
      { id: "v4", name: "severity", label: "Severity Level", type: "select", required: true, options: ["Minor", "Moderate", "Serious", "Critical"] },
      { id: "v5", name: "persons_involved", label: "Persons Involved", type: "text", required: true },
      { id: "v6", name: "description", label: "Incident Description", type: "text", required: true, aiSuggestion: true }
    ]
  },
  {
    name: "Training Record Certificate",
    category: "certificates",
    type: "training_certificate",
    description: "STCW compliant training completion certificate",
    regulations: ["STCW"],
    variables: [
      { id: "v1", name: "trainee_name", label: "Trainee Name", type: "text", required: true },
      { id: "v2", name: "training_title", label: "Training Course Title", type: "text", required: true },
      { id: "v3", name: "training_type", label: "Training Type", type: "select", required: true, options: ["Basic Safety Training", "Advanced Firefighting", "Medical Care", "Survival Craft", "GMDSS", "Bridge Resource Management", "Engine Room Resource Management"] },
      { id: "v4", name: "completion_date", label: "Completion Date", type: "date", required: true },
      { id: "v5", name: "valid_until", label: "Valid Until", type: "date", required: true },
      { id: "v6", name: "instructor_name", label: "Instructor Name", type: "text", required: true },
      { id: "v7", name: "certificate_number", label: "Certificate Number", type: "text", required: true, source: "ai_generated" }
    ]
  },
  {
    name: "Voyage Plan",
    category: "procedures",
    type: "voyage_plan",
    description: "SOLAS Chapter V compliant voyage planning document",
    regulations: ["SOLAS", "STCW"],
    variables: [
      { id: "v1", name: "vessel_name", label: "Vessel Name", type: "text", required: true },
      { id: "v2", name: "voyage_number", label: "Voyage Number", type: "text", required: true },
      { id: "v3", name: "departure_port", label: "Departure Port", type: "text", required: true },
      { id: "v4", name: "arrival_port", label: "Arrival Port", type: "text", required: true },
      { id: "v5", name: "waypoints", label: "Number of Waypoints", type: "number", required: true },
      { id: "v6", name: "estimated_duration", label: "Estimated Duration (days)", type: "number", required: true },
      { id: "v7", name: "weather_routing", label: "Weather Routing Service", type: "boolean", required: false }
    ]
  },
  {
    name: "Port State Control Deficiency Response",
    category: "compliance",
    type: "regulatory_report",
    description: "Response form for PSC inspection deficiencies",
    regulations: ["SOLAS", "MARPOL", "MLC 2006"],
    variables: [
      { id: "v1", name: "inspection_date", label: "Inspection Date", type: "date", required: true },
      { id: "v2", name: "port", label: "Port of Inspection", type: "text", required: true },
      { id: "v3", name: "inspector_name", label: "Inspector Name", type: "text", required: true },
      { id: "v4", name: "deficiency_code", label: "Deficiency Code", type: "text", required: true },
      { id: "v5", name: "corrective_action", label: "Corrective Action Taken", type: "text", required: true, aiSuggestion: true },
      { id: "v6", name: "completion_date", label: "Correction Completion Date", type: "date", required: true }
    ]
  }
];

class DocumentTemplatesEngine {
  private templates: Map<string, DocumentTemplate> = new Map();
  private generatedDocuments: Map<string, GeneratedDocument> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Initialize default maritime templates
   */
  private initializeDefaultTemplates(): void {
    MARITIME_TEMPLATES.forEach((template, index) => {
      const fullTemplate: DocumentTemplate = {
        id: `template-${index + 1}`,
        name: template.name!,
        description: template.description || "",
        category: template.category!,
        type: template.type!,
        content: this.generateTemplateContent(template),
        variables: (template.variables || []).map(v => ({
          ...v,
          validation: v.validation || {}
        } as TemplateVariable)),
        sections: [],
        metadata: {
          author: "Nauti One System",
          department: "Operations",
          approvalRequired: true,
          tags: template.regulations || [],
          language: "en",
          pageSettings: {
            size: "A4",
            orientation: "portrait",
            margins: { top: 25, right: 20, bottom: 25, left: 20 }
          }
        },
        regulations: template.regulations || [],
        version: "1.0.0",
        status: "active",
        createdBy: "system",
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      };

      this.templates.set(fullTemplate.id, fullTemplate);
    });
  }

  /**
   * Generate template content structure
   */
  private generateTemplateContent(template: Partial<DocumentTemplate>): string {
    return `
# ${template.name}

## Document Information
- **Category**: ${template.category}
- **Type**: ${template.type}
- **Regulations**: ${(template.regulations || []).join(", ")}

## Description
${template.description}

## Variables
${(template.variables || []).map(v => `- **${v.label}**: {{${v.name}}}`).join("\n")}

---
*This document is generated by Nauti One EDMS*
    `.trim();
  }

  /**
   * Create a new template
   */
  async createTemplate(
    template: Omit<DocumentTemplate, "id" | "createdAt" | "updatedAt" | "usageCount">
  ): Promise<DocumentTemplate> {
    const newTemplate: DocumentTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };

    this.templates.set(newTemplate.id, newTemplate);

    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: `Created template: ${newTemplate.name}`,
        module_name: "document_templates",
        interaction_type: "template_created",
        ai_response: JSON.stringify({ templateId: newTemplate.id, category: newTemplate.category })
      });
    } catch (error) {
      logger.error("Error logging template creation", error as Error);
    }

    return newTemplate;
  }

  /**
   * Generate document from template with AI assistance
   */
  async generateDocument(
    templateId: string,
    variables: Record<string, unknown>,
    generatedBy: string,
    options?: {
      title?: string;
      aiEnhance?: boolean;
    }
  ): Promise<GeneratedDocument | null> {
    const template = this.templates.get(templateId);
    if (!template) {
      logger.error("Template not found", new Error("Not found"), { templateId });
      return null;
    }

    // Validate required variables
    const missingRequired = template.variables
      .filter(v => v.required && !variables[v.name])
      .map(v => v.label);

    if (missingRequired.length > 0) {
      logger.error("Missing required variables", new Error("Validation error"), { missingRequired });
      return null;
    }

    // Fill template with variables
    let filledContent = template.content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      filledContent = filledContent.replace(regex, String(value));
    }

    // AI enhancement if enabled
    if (options?.aiEnhance) {
      filledContent = await this.aiEnhanceContent(filledContent, template);
    }

    const document: GeneratedDocument = {
      id: `doc-${Date.now()}`,
      templateId,
      templateName: template.name,
      title: options?.title || template.name,
      content: filledContent,
      filledVariables: variables,
      generatedBy,
      generatedAt: new Date(),
      status: template.metadata.approvalRequired ? "pending_approval" : "draft",
      approvals: template.metadata.approvers?.map(approverId => ({
        approverId,
        approverName: approverId,
        status: "pending" as const
      })) || [],
      signatures: []
    };

    this.generatedDocuments.set(document.id, document);
    template.usageCount++;

    return document;
  }

  /**
   * AI-enhance document content
   */
  private async aiEnhanceContent(
    content: string,
    template: DocumentTemplate
  ): Promise<string> {
    // In production, call AI service for enhancement
    // Here we add formatting improvements
    const enhanced = content
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    logger.info("AI enhanced document", { 
      templateId: template.id,
      originalLength: content.length,
      enhancedLength: enhanced.length
    });

    return enhanced;
  }

  /**
   * AI-suggest variable values based on context
   */
  async suggestVariableValues(
    templateId: string,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const template = this.templates.get(templateId);
    if (!template) return {};

    const suggestions: Record<string, unknown> = {};

    for (const variable of template.variables) {
      if (variable.aiSuggestion) {
        // In production, use AI to generate suggestions
        if (variable.name === "certificate_number") {
          suggestions[variable.name] = `CERT-${Date.now().toString(36).toUpperCase()}`;
        }
      }
      
      // Auto-fill from sources
      if (variable.source === "ai_generated") {
        suggestions[variable.name] = `AUTO-${Date.now().toString(36).toUpperCase()}`;
      }
    }

    return suggestions;
  }

  /**
   * Clone template
   */
  async cloneTemplate(templateId: string, newName: string, createdBy: string): Promise<DocumentTemplate | null> {
    const original = this.templates.get(templateId);
    if (!original) return null;

    const cloned: DocumentTemplate = {
      ...JSON.parse(JSON.stringify(original)),
      id: `template-${Date.now()}`,
      name: newName,
      version: "1.0.0",
      status: "draft",
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };

    this.templates.set(cloned.id, cloned);
    return cloned;
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<DocumentTemplate>
  ): Promise<DocumentTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const updated: DocumentTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date()
    };

    // Increment version for significant changes
    if (updates.content || updates.variables || updates.sections) {
      const [major, minor, patch] = updated.version.split(".").map(Number);
      updated.version = `${major}.${minor}.${patch + 1}`;
    }

    this.templates.set(templateId, updated);
    return updated;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: TemplateCategory): DocumentTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => t.category === category && t.status === "active");
  }

  /**
   * Get templates by regulation
   */
  getTemplatesByRegulation(regulation: string): DocumentTemplate[] {
    return Array.from(this.templates.values())
      .filter(t => t.regulations.includes(regulation) && t.status === "active");
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): DocumentTemplate[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values())
      .filter(t => 
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
  }

  /**
   * Get all active templates
   */
  getAllTemplates(): DocumentTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.status === "active");
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): DocumentTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get generated document
   */
  getGeneratedDocument(documentId: string): GeneratedDocument | undefined {
    return this.generatedDocuments.get(documentId);
  }

  /**
   * Approve generated document
   */
  async approveDocument(
    documentId: string,
    approverId: string,
    comments?: string
  ): Promise<boolean> {
    const document = this.generatedDocuments.get(documentId);
    if (!document) return false;

    const approval = document.approvals.find(a => a.approverId === approverId);
    if (approval) {
      approval.status = "approved";
      approval.comments = comments;
      approval.timestamp = new Date();
    }

    // Check if all approvals are complete
    const allApproved = document.approvals.every(a => a.status === "approved");
    if (allApproved) {
      document.status = "approved";
    }

    return true;
  }

  /**
   * Archive template
   */
  async archiveTemplate(templateId: string): Promise<boolean> {
    const template = this.templates.get(templateId);
    if (!template) return false;

    template.status = "archived";
    template.updatedAt = new Date();
    return true;
  }

  /**
   * Get template statistics
   */
  getTemplateStats(): {
    totalTemplates: number;
    activeTemplates: number;
    byCategory: Record<string, number>;
    mostUsed: DocumentTemplate[];
  } {
    const templates = Array.from(this.templates.values());
    const active = templates.filter(t => t.status === "active");

    const byCategory: Record<string, number> = {};
    for (const t of active) {
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    }

    const mostUsed = [...templates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    return {
      totalTemplates: templates.length,
      activeTemplates: active.length,
      byCategory,
      mostUsed
    };
  }
}

export const documentTemplatesEngine = new DocumentTemplatesEngine();
