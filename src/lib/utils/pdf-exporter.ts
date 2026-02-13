/**
 * PDF Export Utility
 * PATCH: Feature Implementation - PDF Export for MMI Jobs and Reports
 */

import { format } from "date-fns";
import { getJsPDF, getAutoTable } from "@/lib/pdf/lazy-pdf";
import { ptBR } from "date-fns/locale";

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  orientation?: "portrait" | "landscape";
  includeTimestamp?: boolean;
  logo?: string;
}

interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

class PDFExporter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsPDF instance loaded dynamically with vendor-specific API
  private doc: any;
  private yPosition: number = 20;
  private pageWidth: number = 210;
  private pageHeight: number = 297;
  private margin: number = 20;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- autoTable plugin loaded dynamically
  private autoTableFn: any;

  private constructor() {}

  static async create(options: PDFExportOptions): Promise<PDFExporter> {
    const instance = new PDFExporter();
    const [JsPDF, autoTableFn] = await Promise.all([getJsPDF(), getAutoTable()]);
    instance.autoTableFn = autoTableFn;
    instance.doc = new JsPDF({
      orientation: options.orientation || "portrait",
      unit: "mm",
      format: "a4",
    });

    instance.pageWidth = instance.doc.internal.pageSize.getWidth();
    instance.pageHeight = instance.doc.internal.pageSize.getHeight();
    instance.addHeader(options);
    return instance;
  }

  private addHeader(options: PDFExportOptions): void {
    // Title
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(options.title, this.margin, this.yPosition);
    this.yPosition += 10;

    // Subtitle
    if (options.subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(100);
      this.doc.text(options.subtitle, this.margin, this.yPosition);
      this.yPosition += 8;
    }

    // Timestamp
    if (options.includeTimestamp !== false) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(150);
      const timestamp = format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      });
      this.doc.text(`Gerado em: ${timestamp}`, this.margin, this.yPosition);
      this.yPosition += 10;
    }

    // Reset text color
    this.doc.setTextColor(0);

    // Divider line
    this.doc.setDrawColor(200);
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition);
    this.yPosition += 10;
  }

  addSection(title: string): void {
    this.checkPageBreak(15);

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin, this.yPosition);
    this.yPosition += 8;
  }

  addParagraph(text: string): void {
    this.checkPageBreak(10);

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");

    const lines = this.doc.splitTextToSize(text, this.pageWidth - this.margin * 2);
    this.doc.text(lines, this.margin, this.yPosition);
    this.yPosition += lines.length * 5 + 5;
  }

  addTable(data: TableData): void {
    this.checkPageBreak(20);

    this.autoTableFn(this.doc, {
      head: [data.headers],
      body: data.rows,
      startY: this.yPosition,
      margin: { left: this.margin, right: this.margin },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
    });

    // Update Y position after table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsPDF autoTable plugin extends doc
    const finalY = (this.doc as Record<string, { finalY: number }>).lastAutoTable.finalY;
    this.yPosition = finalY + 10;
  }

  addKeyValue(label: string, value: string): void {
    this.checkPageBreak(8);

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`${label}:`, this.margin, this.yPosition);

    this.doc.setFont("helvetica", "normal");
    this.doc.text(value, this.margin + 40, this.yPosition);
    this.yPosition += 6;
  }

  addSpacer(height: number = 10): void {
    this.yPosition += height;
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.yPosition + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.yPosition = this.margin;
    }
  }

  addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(150);

      // Page number
      this.doc.text(
        `Página ${i} de ${pageCount}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: "center" }
      );

      // Company name
      this.doc.text(
        "Nauti One - Sistema de Gestão Marítima",
        this.margin,
        this.pageHeight - 10
      );
    }
  }

  save(filename: string): void {
    this.addFooter();
    this.doc.save(`${filename}.pdf`);
  }

  getBlob(): Blob {
    this.addFooter();
    return this.doc.output("blob");
  }
}

// Specific export functions

export async function exportJobToPDF(job: {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  dueDate?: Date;
  metrics?: Record<string, unknown>;
}): Promise<void> {
  const pdf = await PDFExporter.create({
    title: "Ordem de Serviço",
    subtitle: job.title,
  });

  pdf.addSection("Informações Gerais");
  pdf.addKeyValue("ID", job.id);
  pdf.addKeyValue("Status", job.status);
  if (job.priority) pdf.addKeyValue("Prioridade", job.priority);
  if (job.assignee) pdf.addKeyValue("Responsável", job.assignee);
  if (job.dueDate) {
    pdf.addKeyValue("Data Limite", format(job.dueDate, "dd/MM/yyyy", { locale: ptBR }));
  }

  if (job.description) {
    pdf.addSpacer();
    pdf.addSection("Descrição");
    pdf.addParagraph(job.description);
  }

  if (job.metrics && Object.keys(job.metrics).length > 0) {
    pdf.addSpacer();
    pdf.addSection("Métricas");
    Object.entries(job.metrics).forEach(([key, value]) => {
      pdf.addKeyValue(key, String(value));
    });
  }

  pdf.save(`job-${job.id}`);
}

export async function exportTableToPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  filename: string
): Promise<void> {
  const pdf = await PDFExporter.create({
    title,
    orientation: headers.length > 5 ? "landscape" : "portrait",
  });

  pdf.addTable({ headers, rows });
  pdf.save(filename);
}

export async function exportReportToPDF(
  title: string,
  sections: { title: string; content: string }[],
  filename: string
): Promise<void> {
  const pdf = await PDFExporter.create({ title });

  sections.forEach((section) => {
    pdf.addSection(section.title);
    pdf.addParagraph(section.content);
    pdf.addSpacer();
  });

  pdf.save(filename);
}

export { PDFExporter };
