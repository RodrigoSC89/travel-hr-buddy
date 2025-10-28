/**
 * PATCH 397 - Document Templates Service
 * Dynamic template creation, editing, and PDF generation
 */

import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

export interface DocumentTemplate {
  id?: string;
  name: string;
  description?: string;
  category: string;
  templateType: "report" | "certificate" | "contract" | "form" | "letter" | "other";
  content: Record<string, any>;
  placeholders: Array<{ key: string; label: string; type: string }>;
  styles: Record<string, any>;
  layout: Record<string, any>;
  version: number;
  isActive: boolean;
  isPublic: boolean;
  permissions: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratedDocument {
  id?: string;
  templateId: string;
  name: string;
  generatedContent: Record<string, any>;
  pdfUrl?: string;
  dataContext: Record<string, any>;
  status: "draft" | "generated" | "approved" | "archived";
  createdAt?: string;
}

export class DocumentTemplateService {
  
  /**
   * Create new document template
   */
  async createTemplate(template: DocumentTemplate): Promise<DocumentTemplate | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("document_templates")
        .insert({
          name: template.name,
          description: template.description,
          category: template.category,
          template_type: template.templateType,
          content: template.content,
          placeholders: template.placeholders,
          styles: template.styles || {},
          layout: template.layout || {},
          version: 1,
          is_active: template.isActive !== false,
          is_public: template.isPublic || false,
          permissions: template.permissions || {},
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToTemplate(data);
    } catch (error) {
      console.error("Error creating template:", error);
      return null;
    }
  }

  /**
   * Update template and create new version
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<DocumentTemplate>,
    changeSummary?: string
  ): Promise<DocumentTemplate | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Get current template
      const { data: currentTemplate } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (!currentTemplate) {
        throw new Error("Template not found");
      }

      // Create version history entry
      await supabase.from("document_template_versions").insert({
        template_id: templateId,
        version_number: currentTemplate.version,
        content: currentTemplate.content,
        placeholders: currentTemplate.placeholders,
        styles: currentTemplate.styles,
        layout: currentTemplate.layout,
        change_summary: changeSummary,
        changed_by: user?.id,
      });

      // Update template with incremented version
      const { data, error } = await supabase
        .from("document_templates")
        .update({
          ...this.mapToDbFormat(updates),
          version: currentTemplate.version + 1,
          updated_by: user?.id,
        })
        .eq("id", templateId)
        .select()
        .single();

      if (error) throw error;

      return this.mapToTemplate(data);
    } catch (error) {
      console.error("Error updating template:", error);
      return null;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<DocumentTemplate | null> {
    try {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (error) throw error;

      return this.mapToTemplate(data);
    } catch (error) {
      console.error("Error fetching template:", error);
      return null;
    }
  }

  /**
   * Get all templates with filters
   */
  async getTemplates(filters?: {
    category?: string;
    isActive?: boolean;
    isPublic?: boolean;
  }): Promise<DocumentTemplate[]> {
    try {
      let query = supabase
        .from("document_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive);
      }
      if (filters?.isPublic !== undefined) {
        query = query.eq("is_public", filters.isPublic);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.mapToTemplate);
    } catch (error) {
      console.error("Error fetching templates:", error);
      return [];
    }
  }

  /**
   * Get template version history
   */
  async getTemplateHistory(templateId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("document_template_versions")
        .select("*")
        .eq("template_id", templateId)
        .order("version_number", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching template history:", error);
      return [];
    }
  }

  /**
   * Generate document from template with data
   */
  async generateDocument(
    templateId: string,
    documentName: string,
    dataContext: Record<string, any>
  ): Promise<GeneratedDocument | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Get template
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      // Replace placeholders in content with actual data
      const generatedContent = this.replacePlaceholders(
        template.content,
        dataContext
      );

      // Create generated document record
      const { data, error } = await supabase
        .from("generated_documents")
        .insert({
          template_id: templateId,
          name: documentName,
          generated_content: generatedContent,
          data_context: dataContext,
          status: "draft",
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToGeneratedDocument(data);
    } catch (error) {
      console.error("Error generating document:", error);
      return null;
    }
  }

  /**
   * Generate PDF from document
   */
  async generatePDF(documentId: string): Promise<string | null> {
    try {
      // Get generated document
      const { data: docData } = await supabase
        .from("generated_documents")
        .select("*, document_templates(*)")
        .eq("id", documentId)
        .single();

      if (!docData) {
        throw new Error("Document not found");
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add content to PDF
      this.addContentToPDF(pdf, docData.generated_content, docData.document_templates?.styles);

      // Convert to blob
      const pdfBlob = pdf.output("blob");

      // Upload to Supabase Storage
      const fileName = `documents/${documentId}/${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("generated-documents")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("generated-documents")
        .getPublicUrl(fileName);

      const pdfUrl = urlData.publicUrl;

      // Update document with PDF URL
      await supabase
        .from("generated_documents")
        .update({
          pdf_url: pdfUrl,
          pdf_generated_at: new Date().toISOString(),
          status: "generated",
        })
        .eq("id", documentId);

      return pdfUrl;
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  }

  /**
   * Replace placeholders in content with actual data
   */
  private replacePlaceholders(
    content: any,
    dataContext: Record<string, any>
  ): any {
    if (typeof content === "string") {
      let result = content;
      Object.entries(dataContext).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, "g"), String(value));
      });
      return result;
    }

    if (Array.isArray(content)) {
      return content.map((item) => this.replacePlaceholders(item, dataContext));
    }

    if (typeof content === "object" && content !== null) {
      const result: any = {};
      Object.entries(content).forEach(([key, value]) => {
        result[key] = this.replacePlaceholders(value, dataContext);
      });
      return result;
    }

    return content;
  }

  /**
   * Add content to PDF document
   */
  private addContentToPDF(
    pdf: jsPDF,
    content: any,
    styles?: Record<string, any>
  ): void {
    // Simple implementation - can be enhanced with rich formatting
    const fontSize = styles?.fontSize || 12;
    const lineHeight = styles?.lineHeight || 7;
    
    pdf.setFontSize(fontSize);

    let yPosition = 20;
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - (margin * 2);

    const addText = (text: string) => {
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    };

    // Process content
    if (typeof content === "string") {
      addText(content);
    } else if (content.title) {
      pdf.setFontSize(fontSize + 6);
      addText(content.title);
      pdf.setFontSize(fontSize);
      yPosition += 5;
    }

    if (content.body) {
      addText(content.body);
    }

    if (content.sections && Array.isArray(content.sections)) {
      content.sections.forEach((section: any) => {
        if (section.heading) {
          pdf.setFontSize(fontSize + 2);
          yPosition += 5;
          addText(section.heading);
          pdf.setFontSize(fontSize);
          yPosition += 2;
        }
        if (section.text) {
          addText(section.text);
        }
      });
    }
  }

  /**
   * Map database record to template
   */
  private mapToTemplate(data: any): DocumentTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      templateType: data.template_type,
      content: data.content,
      placeholders: data.placeholders,
      styles: data.styles,
      layout: data.layout,
      version: data.version,
      isActive: data.is_active,
      isPublic: data.is_public,
      permissions: data.permissions,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Map template to database format
   */
  private mapToDbFormat(template: Partial<DocumentTemplate>): any {
    const dbData: any = {};
    if (template.name !== undefined) dbData.name = template.name;
    if (template.description !== undefined) dbData.description = template.description;
    if (template.category !== undefined) dbData.category = template.category;
    if (template.templateType !== undefined) dbData.template_type = template.templateType;
    if (template.content !== undefined) dbData.content = template.content;
    if (template.placeholders !== undefined) dbData.placeholders = template.placeholders;
    if (template.styles !== undefined) dbData.styles = template.styles;
    if (template.layout !== undefined) dbData.layout = template.layout;
    if (template.isActive !== undefined) dbData.is_active = template.isActive;
    if (template.isPublic !== undefined) dbData.is_public = template.isPublic;
    if (template.permissions !== undefined) dbData.permissions = template.permissions;
    return dbData;
  }

  /**
   * Map database record to generated document
   */
  private mapToGeneratedDocument(data: any): GeneratedDocument {
    return {
      id: data.id,
      templateId: data.template_id,
      name: data.name,
      generatedContent: data.generated_content,
      pdfUrl: data.pdf_url,
      dataContext: data.data_context,
      status: data.status,
      createdAt: data.created_at,
    };
  }
}

export const documentTemplateService = new DocumentTemplateService();
