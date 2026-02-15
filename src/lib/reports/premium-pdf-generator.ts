/**
 * Sprint 6: Premium PDF Generator with Deep Ocean Branding
 * Enterprise-grade PDF reports with branded headers, footers, and styling
 */

// Lazy load jsPDF
let jsPDFModule: typeof import("jspdf").default | null = null;
let autoTableModule: typeof import("jspdf-autotable").default | null = null;

const loadPDFLibs = async () => {
  if (!jsPDFModule) {
    const { default: jsPDF } = await import("jspdf");
    jsPDFModule = jsPDF;
  }
  if (!autoTableModule) {
    const { default: autoTable } = await import("jspdf-autotable");
    autoTableModule = autoTable;
  }
  return { jsPDF: jsPDFModule, autoTable: autoTableModule };
};

// Deep Ocean Brand Colors (HSL → RGB for PDF)
const BRAND = {
  primary: [15, 52, 96] as [number, number, number],
  secondary: [0, 119, 182] as [number, number, number],
  accent: [0, 180, 216] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  bg: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

export interface PremiumReportConfig {
  title: string;
  subtitle?: string;
  module: string;
  date?: Date;
  author?: string;
  vesselName?: string;
  companyName?: string;
  confidential?: boolean;
  sections: PremiumSection[];
}

export interface PremiumSection {
  title: string;
  icon?: string;
  content: string | string[] | PremiumTableData;
  type: "text" | "list" | "table" | "kpi-grid" | "status-summary";
}

export interface PremiumTableData {
  headers: string[];
  rows: string[][];
  highlightColumn?: number;
}

export interface KPIData {
  label: string;
  value: string;
  trend?: "up" | "down" | "stable";
  status?: "good" | "warning" | "critical";
}

export class PremiumPDFGenerator {
  private doc!: InstanceType<typeof import("jspdf").default>;
  private autoTable!: typeof import("jspdf-autotable").default;
  private y = 0;
  private pageW = 210;
  private pageH = 297;
  private margin = 15;
  private contentW = 180;

  static async create(): Promise<PremiumPDFGenerator> {
    const gen = new PremiumPDFGenerator();
    const { jsPDF, autoTable } = await loadPDFLibs();
    gen.doc = new jsPDF({ unit: "mm", format: "a4" });
    gen.autoTable = autoTable;
    gen.contentW = gen.pageW - gen.margin * 2;
    return gen;
  }

  async generate(config: PremiumReportConfig): Promise<Blob> {
    this.addCoverPage(config);
    
    for (const section of config.sections) {
      this.checkPageBreak(40);
      this.addSectionHeader(section.title);

      switch (section.type) {
        case "text": this.addText(section.content as string); break;
        case "list": this.addList(section.content as string[]); break;
        case "table": this.addStyledTable(section.content as PremiumTableData); break;
        case "kpi-grid": this.addKPIGrid(section.content as unknown as KPIData[]); break;
        case "status-summary": this.addText(section.content as string); break;
      }
      this.y += 8;
    }

    this.addAllFooters(config);
    return this.doc.output("blob");
  }

  private addCoverPage(config: PremiumReportConfig) {
    // Background gradient stripe
    this.doc.setFillColor(...BRAND.primary as [number, number, number]);
    this.doc.rect(0, 0, this.pageW, 85, "F");

    // Accent stripe
    this.doc.setFillColor(...BRAND.accent as [number, number, number]);
    this.doc.rect(0, 85, this.pageW, 3, "F");

    // Logo text
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(12);
    this.doc.setTextColor(...BRAND.white as [number, number, number]);
    this.doc.text("⚓ NAUTI ONE", this.margin, 20);

    // Title
    this.doc.setFontSize(28);
    this.doc.text(config.title, this.margin, 45);

    // Subtitle
    if (config.subtitle) {
      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(config.subtitle, this.margin, 58);
    }

    // Module badge
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(`Módulo: ${config.module}`, this.margin, 72);

    // Metadata section below the header
    this.y = 100;
    this.doc.setTextColor(...BRAND.text as [number, number, number]);
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    const date = config.date || new Date();
    const meta = [
      `Data: ${date.toLocaleDateString("pt-BR")}`,
      config.author ? `Autor: ${config.author}` : null,
      config.vesselName ? `Embarcação: ${config.vesselName}` : null,
      config.companyName ? `Empresa: ${config.companyName}` : null,
    ].filter(Boolean) as string[];

    meta.forEach((line) => {
      this.doc.text(line, this.margin, this.y);
      this.y += 6;
    });

    if (config.confidential) {
      this.y += 4;
      this.doc.setFillColor(...BRAND.danger as [number, number, number]);
      this.doc.roundedRect(this.margin, this.y - 4, 40, 7, 2, 2, "F");
      this.doc.setTextColor(...BRAND.white as [number, number, number]);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("🔒 CONFIDENCIAL", this.margin + 3, this.y + 1);
      this.doc.setTextColor(...BRAND.text as [number, number, number]);
      this.y += 10;
    }

    // Separator
    this.y += 5;
    this.doc.setDrawColor(...BRAND.accent as [number, number, number]);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.y, this.pageW - this.margin, this.y);
    this.y += 10;
  }

  private addSectionHeader(title: string) {
    this.doc.setFillColor(...BRAND.secondary as [number, number, number]);
    this.doc.roundedRect(this.margin, this.y - 5, this.contentW, 9, 2, 2, "F");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(...BRAND.white as [number, number, number]);
    this.doc.text(title.toUpperCase(), this.margin + 4, this.y + 1);
    this.doc.setTextColor(...BRAND.text as [number, number, number]);
    this.y += 10;
  }

  private addText(text: string) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    const lines = this.doc.splitTextToSize(text, this.contentW);
    for (const line of lines) {
      this.checkPageBreak(7);
      this.doc.text(line, this.margin, this.y);
      this.y += 5;
    }
  }

  private addList(items: string[]) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    items.forEach((item) => {
      this.checkPageBreak(7);
      this.doc.setFillColor(...BRAND.accent as [number, number, number]);
      this.doc.circle(this.margin + 2, this.y - 1.2, 1, "F");
      this.doc.text(item, this.margin + 6, this.y);
      this.y += 6;
    });
  }

  private addStyledTable(data: PremiumTableData) {
    this.autoTable(this.doc, {
      startY: this.y,
      head: [data.headers],
      body: data.rows,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: BRAND.text,
      },
      headStyles: {
        fillColor: BRAND.primary,
        textColor: BRAND.white,
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: BRAND.bg,
      },
      columnStyles: data.highlightColumn !== undefined ? {
        [data.highlightColumn]: { fontStyle: "bold" as const, textColor: BRAND.secondary as [number, number, number] },
      } : {},
    });

    const docExt = this.doc as InstanceType<typeof import("jspdf").default> & { lastAutoTable?: { finalY: number } };
    this.y = (docExt.lastAutoTable?.finalY ?? this.y) + 5;
  }

  private addKPIGrid(kpis: KPIData[]) {
    const cols = Math.min(kpis.length, 4);
    const boxW = (this.contentW - (cols - 1) * 4) / cols;
    const boxH = 22;

    kpis.forEach((kpi, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      if (col === 0 && row > 0) this.y += boxH + 4;
      this.checkPageBreak(boxH + 4);

      const x = this.margin + col * (boxW + 4);
      const statusColor = kpi.status === "good" ? BRAND.success
        : kpi.status === "warning" ? BRAND.warning
        : kpi.status === "critical" ? BRAND.danger
        : BRAND.secondary;

      this.doc.setFillColor(...statusColor as [number, number, number]);
      this.doc.roundedRect(x, this.y, boxW, boxH, 2, 2, "F");

      this.doc.setTextColor(...BRAND.white as [number, number, number]);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(16);
      this.doc.text(kpi.value, x + boxW / 2, this.y + 10, { align: "center" });

      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(kpi.label, x + boxW / 2, this.y + 17, { align: "center" });
    });

    this.doc.setTextColor(...BRAND.text as [number, number, number]);
    this.y += boxH + 8;
  }

  private checkPageBreak(needed: number) {
    if (this.y + needed > this.pageH - 25) {
      this.doc.addPage();
      this.y = 20;
    }
  }

  private addAllFooters(config: PremiumReportConfig) {
    const pages = this.doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      this.doc.setPage(i);

      // Footer stripe
      this.doc.setFillColor(...BRAND.primary as [number, number, number]);
      this.doc.rect(0, this.pageH - 12, this.pageW, 12, "F");

      this.doc.setTextColor(...BRAND.white as [number, number, number]);
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "normal");

      this.doc.text(
        `Nauti One — ${config.companyName || "Maritime Management"} — Confidencial`,
        this.margin,
        this.pageH - 5
      );
      this.doc.text(
        `Página ${i} de ${pages}`,
        this.pageW - this.margin,
        this.pageH - 5,
        { align: "right" }
      );
    }
  }

  download(filename: string) {
    this.doc.save(filename);
  }
}

/**
 * Quick helper to generate and download a premium report
 */
export async function generatePremiumReport(config: PremiumReportConfig): Promise<void> {
  const gen = await PremiumPDFGenerator.create();
  const blob = await gen.generate(config);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nauti-one-${config.module.toLowerCase().replace(/\s/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
