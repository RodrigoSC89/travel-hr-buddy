/**
 * Template System Service - PATCH 434
 * Unified template management with PDF generation and Document Hub integration
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import jsPDF from "jspdf";
import "jspdf-autotable";

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  options?: string[]; // For select fields
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
}

export interface TemplateMetadata {
  id?: string;
  name: string;
  description?: string;
  category: string;
  version: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface Template {
  id?: string;
  metadata: TemplateMetadata;
  fields: TemplateField[];
  content: string; // HTML template with placeholders {{fieldName}}
  css?: string; // Custom CSS for PDF generation
  documentType?: string;
  userId?: string;
}

export interface GeneratedDocument {
  id?: string;
  templateId: string;
  templateName: string;
  fieldValues: Record<string, any>;
  generatedHtml: string;
  generatedPdf?: Blob;
  createdAt: string;
  userId?: string;
}

class TemplateSystemService {
  /**
   * Create or update a template
   */
  async saveTemplate(template: Template, userId: string): Promise<Template> {
    try {
      logger.info("Saving template", { name: template.metadata.name });

      const templateData = {
        name: template.metadata.name,
        description: template.metadata.description,
        category: template.metadata.category,
        version: template.metadata.version,
        author: template.metadata.author || userId,
        tags: template.metadata.tags || [],
        is_active: template.metadata.isActive !== false,
        fields: template.fields,
        content: template.content,
        css: template.css,
        document_type: template.documentType,
        user_id: userId,
      };

      if (template.id) {
        // Update existing template
        const { data, error } = await supabase
          .from("document_templates")
          .update({ ...templateData, updated_at: new Date().toISOString() })
          .eq("id", template.id)
          .select()
          .single();

        if (error) throw error;
        return this.mapDatabaseTemplate(data);
      } else {
        // Create new template
        const { data, error } = await supabase
          .from("document_templates")
          .insert(templateData)
          .select()
          .single();

        if (error) throw error;
        return this.mapDatabaseTemplate(data);
      }
    } catch (error) {
      logger.error("Failed to save template", error);
      throw error;
    }
  }

  /**
   * Get all templates for a user
   */
  async getUserTemplates(userId: string): Promise<Template[]> {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .or(`user_id.eq.${userId},is_active.eq.true`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(this.mapDatabaseTemplate);
    } catch (error) {
      logger.error("Failed to get templates", error);
      return [];
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<Template[]> {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;

      return data.map(this.mapDatabaseTemplate);
    } catch (error) {
      logger.error("Failed to get templates by category", error);
      return [];
    }
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string): Promise<Template | null> {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (error) throw error;

      return this.mapDatabaseTemplate(data);
    } catch (error) {
      logger.error("Failed to get template", error);
      return null;
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("document_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      logger.info("Template deleted", { templateId });
    } catch (error) {
      logger.error("Failed to delete template", error);
      throw error;
    }
  }

  /**
   * Generate a document from a template
   */
  async generateDocument(
    templateId: string,
    fieldValues: Record<string, any>,
    userId: string
  ): Promise<GeneratedDocument> {
    try {
      logger.info("Generating document from template", { templateId });

      // Get template
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      // Validate field values
      this.validateFieldValues(template.fields, fieldValues);

      // Replace placeholders in content
      let generatedHtml = template.content;
      template.fields.forEach((field) => {
        const value = fieldValues[field.name] || field.defaultValue || "";
        const placeholder = new RegExp(`{{${field.name}}}`, "g");
        generatedHtml = generatedHtml.replace(placeholder, String(value));
      });

      // Generate PDF
      const pdfBlob = await this.generatePDF(generatedHtml, template.css || "");

      const document: GeneratedDocument = {
        templateId,
        templateName: template.metadata.name,
        fieldValues,
        generatedHtml,
        generatedPdf: pdfBlob,
        createdAt: new Date().toISOString(),
        userId,
      };

      // Save to database
      await this.saveGeneratedDocument(document);

      return document;
    } catch (error) {
      logger.error("Failed to generate document", error);
      throw error;
    }
  }

  /**
   * Generate PDF from HTML content using jsPDF
   */
  private async generatePDF(htmlContent: string, css: string): Promise<Blob> {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add custom styling
      if (css) {
        // Apply CSS styles to content (simplified for PDF)
        const styledHtml = `<style>${css}</style>${htmlContent}`;
        htmlContent = styledHtml;
      }

      // Parse HTML and add to PDF
      // Note: This is a simplified version. For complex HTML, consider using html2canvas + jsPDF
      const lines = this.parseHtmlToText(htmlContent);
      let y = 20;
      const lineHeight = 7;
      const margin = 20;
      const pageHeight = doc.internal.pageSize.height;

      lines.forEach((line) => {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });

      return doc.output("blob");
    } catch (error) {
      logger.error("Failed to generate PDF", error);
      throw error;
    }
  }

  /**
   * Parse HTML to plain text for PDF (simplified)
   */
  private parseHtmlToText(html: string): string[] {
    // Remove HTML tags and get text content
    const text = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();

    // Split into lines
    return text.split("\n").map((line) => line.trim()).filter((line) => line);
  }

  /**
   * Save generated document to database
   */
  private async saveGeneratedDocument(document: GeneratedDocument): Promise<void> {
    try {
      const { error } = await supabase.from("generated_documents").insert({
        template_id: document.templateId,
        template_name: document.templateName,
        field_values: document.fieldValues,
        generated_html: document.generatedHtml,
        created_at: document.createdAt,
        user_id: document.userId,
      });

      if (error) throw error;
    } catch (error) {
      logger.error("Failed to save generated document", error);
      throw error;
    }
  }

  /**
   * Get generated documents for a user
   */
  async getGeneratedDocuments(userId: string): Promise<GeneratedDocument[]> {
    try {
      const { data, error } = await supabase
        .from("generated_documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (
        data?.map((d) => ({
          id: d.id,
          templateId: d.template_id,
          templateName: d.template_name,
          fieldValues: d.field_values,
          generatedHtml: d.generated_html,
          createdAt: d.created_at,
          userId: d.user_id,
        })) || []
      );
    } catch (error) {
      logger.error("Failed to get generated documents", error);
      return [];
    }
  }

  /**
   * Validate field values against template fields
   */
  private validateFieldValues(
    fields: TemplateField[],
    values: Record<string, any>
  ): void {
    fields.forEach((field) => {
      const value = values[field.name];

      // Check required fields
      if (field.required && (value === undefined || value === null || value === "")) {
        throw new Error(`Field "${field.label}" is required`);
      }

      // Validate based on type
      if (value !== undefined && value !== null) {
        switch (field.type) {
          case "number":
            if (isNaN(Number(value))) {
              throw new Error(`Field "${field.label}" must be a number`);
            }
            if (field.validation?.min !== undefined && Number(value) < field.validation.min) {
              throw new Error(
                `Field "${field.label}" must be at least ${field.validation.min}`
              );
            }
            if (field.validation?.max !== undefined && Number(value) > field.validation.max) {
              throw new Error(
                `Field "${field.label}" must be at most ${field.validation.max}`
              );
            }
            break;

          case "date":
            if (isNaN(Date.parse(value))) {
              throw new Error(`Field "${field.label}" must be a valid date`);
            }
            break;

          case "select":
            if (field.options && !field.options.includes(value)) {
              throw new Error(
                `Field "${field.label}" must be one of: ${field.options.join(", ")}`
              );
            }
            break;
        }

        // Pattern validation
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(String(value))) {
            throw new Error(
              field.validation.message || `Field "${field.label}" has invalid format`
            );
          }
        }
      }
    });
  }

  /**
   * Helper: Map database record to Template
   */
  private mapDatabaseTemplate(data: any): Template {
    return {
      id: data.id,
      metadata: {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        version: data.version,
        author: data.author,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        tags: data.tags || [],
        isActive: data.is_active,
      },
      fields: data.fields || [],
      content: data.content || "",
      css: data.css,
      documentType: data.document_type,
      userId: data.user_id,
    };
  }

  /**
   * Create a sample template (for testing/demo)
   */
  createSampleTemplate(): Template {
    return {
      metadata: {
        name: "Standard Report",
        description: "A standard report template with common fields",
        category: "reports",
        version: "1.0.0",
        tags: ["report", "standard"],
        isActive: true,
      },
      fields: [
        {
          id: "title",
          name: "title",
          label: "Report Title",
          type: "text",
          required: true,
          placeholder: "Enter report title",
        },
        {
          id: "author",
          name: "author",
          label: "Author",
          type: "text",
          required: true,
        },
        {
          id: "date",
          name: "date",
          label: "Report Date",
          type: "date",
          required: true,
        },
        {
          id: "summary",
          name: "summary",
          label: "Executive Summary",
          type: "textarea",
          required: true,
          placeholder: "Provide a brief summary",
        },
        {
          id: "category",
          name: "category",
          label: "Category",
          type: "select",
          options: ["Safety", "Operations", "Maintenance", "Compliance"],
          required: true,
        },
      ],
      content: `
        <h1>{{title}}</h1>
        <p><strong>Author:</strong> {{author}}</p>
        <p><strong>Date:</strong> {{date}}</p>
        <p><strong>Category:</strong> {{category}}</p>
        <h2>Executive Summary</h2>
        <p>{{summary}}</p>
      `,
      css: `
        h1 { color: #2563eb; font-size: 24px; margin-bottom: 20px; }
        h2 { color: #1e40af; font-size: 18px; margin-top: 20px; }
        p { margin: 10px 0; line-height: 1.6; }
      `,
      documentType: "report",
    };
  }
}

export const templateSystemService = new TemplateSystemService();
