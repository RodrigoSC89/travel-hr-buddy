/**
 * PATCH 651 - PDF Report Generator
 * Automated report generation for modules
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportConfig {
  title: string;
  module: string;
  date: Date;
  author?: string;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  content: string | string[] | TableData;
  type: "text" | "list" | "table";
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private yPosition: number;
  private pageHeight: number;
  private margin: number;

  constructor() {
    this.doc = new jsPDF();
    this.yPosition = 20;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 20;
  }

  /**
   * Generate a module report
   */
  async generateModuleReport(config: ReportConfig): Promise<Blob> {
    // Header
    this.addHeader(config);

    // Metadata
    this.addMetadata(config);

    // Sections
    for (const section of config.sections) {
      this.addSection(section);
    }

    // Footer on all pages
    this.addFooters();

    return this.doc.output("blob");
  }

  /**
   * Add header to the document
   */
  private addHeader(config: ReportConfig) {
    this.doc.setFontSize(24);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(config.title, this.margin, this.yPosition);
    this.yPosition += 10;

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(`Module: ${config.module}`, this.margin, this.yPosition);
    this.yPosition += 15;

    // Horizontal line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.yPosition, 190, this.yPosition);
    this.yPosition += 10;
  }

  /**
   * Add metadata section
   */
  private addMetadata(config: ReportConfig) {
    this.doc.setFontSize(10);
    this.doc.setTextColor(80, 80, 80);

    const dateStr = config.date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    this.doc.text(`Generated: ${dateStr}`, this.margin, this.yPosition);
    
    if (config.author) {
      this.yPosition += 5;
      this.doc.text(`Author: ${config.author}`, this.margin, this.yPosition);
    }

    this.yPosition += 15;
  }

  /**
   * Add a content section
   */
  private addSection(section: ReportSection) {
    // Check if we need a new page
    if (this.yPosition > this.pageHeight - 40) {
      this.doc.addPage();
      this.yPosition = 20;
    }

    // Section title
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(section.title, this.margin, this.yPosition);
    this.yPosition += 10;

    // Section content
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");

    switch (section.type) {
      case "text":
        this.addText(section.content as string);
        break;
      case "list":
        this.addList(section.content as string[]);
        break;
      case "table":
        this.addTable(section.content as TableData);
        break;
    }

    this.yPosition += 10;
  }

  /**
   * Add text content
   */
  private addText(text: string) {
    const lines = this.doc.splitTextToSize(text, 170);
    
    for (const line of lines) {
      if (this.yPosition > this.pageHeight - 30) {
        this.doc.addPage();
        this.yPosition = 20;
      }
      this.doc.text(line, this.margin, this.yPosition);
      this.yPosition += 7;
    }
  }

  /**
   * Add list content
   */
  private addList(items: string[]) {
    for (const item of items) {
      if (this.yPosition > this.pageHeight - 30) {
        this.doc.addPage();
        this.yPosition = 20;
      }
      this.doc.text(`• ${item}`, this.margin + 5, this.yPosition);
      this.yPosition += 7;
    }
  }

  /**
   * Add table content
   */
  private addTable(tableData: TableData) {
    autoTable(this.doc, {
      startY: this.yPosition,
      head: [tableData.headers],
      body: tableData.rows,
      margin: { left: this.margin },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Update yPosition after table
    const finalY = (this.doc as any).lastAutoTable.finalY;
    this.yPosition = finalY + 10;
  }

  /**
   * Add page numbers to all pages
   */
  private addFooters() {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(9);
      this.doc.setTextColor(150, 150, 150);
      
      const pageText = `Page ${i} of ${pageCount}`;
      const textWidth = this.doc.getTextWidth(pageText);
      
      this.doc.text(
        pageText,
        this.doc.internal.pageSize.width / 2 - textWidth / 2,
        this.pageHeight - 10
      );

      // Add watermark
      this.doc.text(
        "Nautilus One - Confidential",
        this.margin,
        this.pageHeight - 10
      );
    }
  }

  /**
   * Download the generated PDF
   */
  download(filename: string) {
    this.doc.save(filename);
  }
}

/**
 * Helper function to generate a standard module report
 */
export async function generateStandardModuleReport(
  moduleName: string,
  data: {
    summary: string;
    metrics: { label: string; value: string }[];
    activities: string[];
    recommendations: string[];
  }
): Promise<Blob> {
  const generator = new PDFReportGenerator();

  const config: ReportConfig = {
    title: `${moduleName} - Status Report`,
    module: moduleName,
    date: new Date(),
    author: "Nautilus One System",
    sections: [
      {
        title: "Executive Summary",
        content: data.summary,
        type: "text",
      },
      {
        title: "Key Metrics",
        content: {
          headers: ["Metric", "Value"],
          rows: data.metrics.map((m) => [m.label, m.value]),
        },
        type: "table",
      },
      {
        title: "Recent Activities",
        content: data.activities,
        type: "list",
      },
      {
        title: "Recommendations",
        content: data.recommendations,
        type: "list",
      },
    ],
  };

  return await generator.generateModuleReport(config);
}

/**
 * Example usage function
 */
export async function generateSGSOReport(): Promise<void> {
  const blob = await generateStandardModuleReport("SGSO", {
    summary:
      "The SGSO module is performing optimally with 95% compliance rate. All critical audits are up-to-date, and there are no pending high-priority action items.",
    metrics: [
      { label: "Total Audits", value: "24" },
      { label: "Completed This Month", value: "8" },
      { label: "Open Non-Conformities", value: "3" },
      { label: "Compliance Rate", value: "95%" },
      { label: "Average Resolution Time", value: "4.2 days" },
    ],
    activities: [
      "Completed external IMCA audit with zero findings",
      "Updated safety procedures documentation",
      "Trained 12 crew members on new safety protocols",
      "Closed 5 non-conformities ahead of schedule",
    ],
    recommendations: [
      "Schedule quarterly safety refresher training",
      "Update emergency response procedures",
      "Review and update risk assessment matrices",
      "Implement automated audit reminders",
    ],
  });

  // Download the report
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sgso-report-${new Date().toISOString().split("T")[0]}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
