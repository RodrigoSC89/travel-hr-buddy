/**
 * PATCH 879 - Template PDF Renderer Service
 * Type-safe - Renders templates to PDF with placeholder substitution
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface PDFRenderOptions {
  orientation?: "portrait" | "landscape";
  pageSize?: "A4" | "A3" | "Letter" | "Legal";
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  headerFooter?: {
    header?: string;
    footer?: string;
  };
}

export interface PlaceholderValues {
  [key: string]: string | number | boolean | Date;
}

// Aligned with actual template_placeholders schema
interface TemplatePlaceholder {
  id: string;
  template_id: string;
  placeholder_key: string;
  placeholder_label: string;
  placeholder_type: string;
  is_required: boolean | null;
  default_value: string | null;
  options: Json;
  created_at: string | null;
}

// Aligned with actual rendered_documents schema
interface RenderedDocument {
  id: string;
  template_id: string;
  title: string;
  format: string;
  html_content: string | null;
  variables: Json;
  pdf_url: string | null;
  rendered_at: string | null;
  rendered_by: string | null;
  created_at: string | null;
}

// Helper to safely get content from JSONB
function getTemplateContent(content: Json | null): string {
  if (content === null) return "";
  if (typeof content === "string") return content;
  if (typeof content === "object" && !Array.isArray(content)) {
    const obj = content as Record<string, unknown>;
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.content === "string") return obj.content;
    return JSON.stringify(content);
  }
  return String(content);
}

export class TemplatePDFRenderer {
  /**
   * Render a template to PDF with placeholder substitution
   */
  async renderTemplateToPDF(
    templateId: string,
    placeholderValues: PlaceholderValues,
    options: PDFRenderOptions = {}
  ): Promise<{ pdfUrl: string; documentId: string }> {
    try {
      // 1. Fetch template
      const { data: template, error: templateError } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;
      if (!template) throw new Error("Template not found");

      // 2. Fetch template placeholders
      const { data: placeholders, error: placeholdersError } = await supabase
        .from("template_placeholders")
        .select("*")
        .eq("template_id", templateId);

      if (placeholdersError) throw placeholdersError;

      // 3. Validate required placeholders
      const requiredPlaceholders = (placeholders || [])
        .filter(p => p.is_required)
        .map(p => p.placeholder_key);

      const missingRequired = requiredPlaceholders.filter(
        key => !placeholderValues[key]
      );

      if (missingRequired.length > 0) {
        throw new Error(`Missing required placeholders: ${missingRequired.join(", ")}`);
      }

      // 4. Substitute placeholders in content
      const templateContent = getTemplateContent(template.content);
      let renderedContent = templateContent;
      for (const [key, value] of Object.entries(placeholderValues)) {
        const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        renderedContent = renderedContent.replace(placeholder, String(value));
      }

      // 5. Create rendered document record
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) throw new Error("User not authenticated");

      const { data: renderedDoc, error: docError } = await supabase
        .from("rendered_documents")
        .insert({
          template_id: templateId,
          title: `${template.title ?? "Document"} - ${new Date().toISOString().split("T")[0]}`,
          format: "pdf",
          html_content: renderedContent,
          variables: placeholderValues as unknown as Json,
          rendered_by: user.id,
          rendered_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (docError) throw docError;

      // 6. Generate PDF blob
      const pdfBlob = await this.generatePDFBlob(renderedContent, options);

      // 7. Upload to workspace_files storage
      const fileName = `rendered-docs/${renderedDoc.id}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("workspace_files")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 8. Get public URL
      const { data: urlData } = supabase.storage
        .from("workspace_files")
        .getPublicUrl(fileName);

      // 9. Update rendered document with PDF URL
      const { error: updateError } = await supabase
        .from("rendered_documents")
        .update({
          pdf_url: urlData.publicUrl,
        })
        .eq("id", renderedDoc.id);

      if (updateError) throw updateError;

      return {
        pdfUrl: urlData.publicUrl,
        documentId: renderedDoc.id
      };
    } catch (error) {
      console.error("Error rendering template to PDF:", error);
      throw error;
    }
  }

  /**
   * Generate PDF blob from HTML content
   */
  private async generatePDFBlob(
    htmlContent: string,
    options: PDFRenderOptions
  ): Promise<Blob> {
    // Simulate PDF generation - in production use jsPDF or server-side
    const pdfContent = `
PDF Document
============
${htmlContent}

Settings:
- Orientation: ${options.orientation || "portrait"}
- Page Size: ${options.pageSize || "A4"}
- Margins: ${JSON.stringify(options.margins || {})}
    `;

    return new Blob([pdfContent], { type: "application/pdf" });
  }

  /**
   * Get rendered document by ID
   */
  async getRenderedDocument(documentId: string): Promise<RenderedDocument | null> {
    try {
      const { data, error } = await supabase
        .from("rendered_documents")
        .select("*")
        .eq("id", documentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching rendered document:", error);
      throw error;
    }
  }

  /**
   * List rendered documents for current user
   */
  async listRenderedDocuments(filters?: {
    templateId?: string;
    limit?: number;
  }): Promise<RenderedDocument[]> {
    try {
      let query = supabase
        .from("rendered_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.templateId) {
        query = query.eq("template_id", filters.templateId);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error listing rendered documents:", error);
      throw error;
    }
  }

  /**
   * Delete rendered document
   */
  async deleteRenderedDocument(documentId: string): Promise<void> {
    try {
      // Get document to find PDF URL
      const doc = await this.getRenderedDocument(documentId);

      // Delete from storage if PDF exists
      if (doc?.pdf_url) {
        const fileName = `rendered-docs/${documentId}.pdf`;
        await supabase.storage.from("workspace_files").remove([fileName]);
      }

      // Delete document record
      const { error } = await supabase
        .from("rendered_documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting rendered document:", error);
      throw error;
    }
  }
}

export const templatePDFRenderer = new TemplatePDFRenderer();
