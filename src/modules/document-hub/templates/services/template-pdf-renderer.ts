/**
 * PATCH 482 - Template PDF Rendering Service
 * Renders document templates to PDF with placeholder substitution
 */

import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

export interface PDFRenderOptions {
  pageSize?: "A4" | "Letter" | "Legal";
  orientation?: "portrait" | "landscape";
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  headerText?: string;
  footerText?: string;
  headerEnabled?: boolean;
  footerEnabled?: boolean;
}

export interface TemplatePlaceholderData {
  [key: string]: string | number | Date;
}

export class TemplatePDFRenderer {
  private defaultOptions: PDFRenderOptions = {
    pageSize: "A4",
    orientation: "portrait",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
    headerEnabled: true,
    footerEnabled: true
  };

  /**
   * Render a template to PDF
   */
  async renderTemplateToPDF(
    templateId: string,
    placeholderData: TemplatePlaceholderData,
    options?: PDFRenderOptions
  ): Promise<Blob> {
    try {
      // Fetch template
      const { data: template, error: templateError } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError || !template) {
        throw new Error("Template not found");
      }

      // Merge options with template settings and defaults
      const pdfSettings = template.pdf_settings || {};
      const mergedOptions = {
        ...this.defaultOptions,
        ...pdfSettings,
        ...options
      };

      // Substitute placeholders in content
      const processedContent = this.substitutePlaceholders(
        template.content,
        placeholderData
      );

      // Generate PDF
      const pdf = await this.generatePDF(
        template.name,
        processedContent,
        mergedOptions
      );

      // Convert to blob
      const pdfBlob = pdf.output("blob");

      // Save rendered document record
      await this.saveRenderedDocument(
        templateId,
        template.name,
        processedContent,
        pdfBlob,
        placeholderData
      );

      return pdfBlob;
    } catch (error) {
      console.error("Error rendering template to PDF:", error);
      throw error;
    }
  }

  /**
   * Substitute placeholders in content
   */
  private substitutePlaceholders(
    content: string,
    data: TemplatePlaceholderData
  ): string {
    let processed = content;

    // Replace all {{placeholder}} with actual values
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      const stringValue = this.formatValue(value);
      processed = processed.replace(regex, stringValue);
    });

    // Remove any unreplaced placeholders
    processed = processed.replace(/{{[^}]+}}/g, "[Not Provided]");

    return processed;
  }

  /**
   * Format value for display
   */
  private formatValue(value: any): string {
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  }

  /**
   * Generate PDF from processed content
   */
  private async generatePDF(
    title: string,
    content: string,
    options: PDFRenderOptions
  ): Promise<jsPDF> {
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: "mm",
      format: options.pageSize?.toLowerCase()
    });

    const margins = options.margins!;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const textWidth = pageWidth - margins.left - margins.right;

    let yPosition = margins.top;

    // Add header
    if (options.headerEnabled) {
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(
        options.headerText || title,
        margins.left,
        margins.top - 5
      );
      pdf.line(
        margins.left,
        margins.top,
        pageWidth - margins.right,
        margins.top
      );
      yPosition = margins.top + 10;
    }

    // Add title
    pdf.setFontSize(18);
    pdf.setTextColor(0);
    pdf.text(title, margins.left, yPosition);
    yPosition += 15;

    // Process content (simple HTML to text conversion)
    const textContent = this.htmlToText(content);
    
    pdf.setFontSize(12);
    pdf.setTextColor(0);

    // Split text into lines that fit the page width
    const lines = pdf.splitTextToSize(textContent, textWidth);

    // Add lines to PDF with page breaks
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margins.bottom - 10) {
        pdf.addPage();
        yPosition = margins.top;
      }
      pdf.text(line, margins.left, yPosition);
      yPosition += 7;
    });

    // Add footer
    if (options.footerEnabled) {
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          options.footerText || `Page ${i} of ${totalPages}`,
          margins.left,
          pageHeight - margins.bottom + 5
        );
        pdf.text(
          new Date().toLocaleDateString(),
          pageWidth - margins.right - 30,
          pageHeight - margins.bottom + 5
        );
      }
    }

    return pdf;
  }

  /**
   * Simple HTML to text conversion
   */
  private htmlToText(html: string): string {
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, " ");
    
    // Decode HTML entities
    text = text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();
    
    return text;
  }

  /**
   * Save rendered document record
   */
  private async saveRenderedDocument(
    templateId: string,
    title: string,
    content: string,
    pdfBlob: Blob,
    metadata: any
  ) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Upload PDF to storage
      const fileName = `rendered-${Date.now()}.pdf`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, pdfBlob);

      if (uploadError) {
        console.error("Error uploading PDF:", uploadError);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      // Save record
      await supabase.from("rendered_documents").insert({
        template_id: templateId,
        user_id: user.id,
        title,
        content,
        format: "pdf",
        pdf_url: publicUrl,
        metadata: {
          placeholders: metadata,
          rendered_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error saving rendered document:", error);
    }
  }

  /**
   * Download PDF
   */
  downloadPDF(blob: Blob, filename: string = "document.pdf") {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const templatePDFRenderer = new TemplatePDFRenderer();
