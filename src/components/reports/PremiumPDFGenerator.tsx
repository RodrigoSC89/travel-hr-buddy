/**
 * Premium PDF Generator - Deep Ocean Branded Reports
 * Enterprise-grade PDF generation for maritime operations
 */

import { useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReportConfig {
  title: string;
  subtitle?: string;
  type: "fleet" | "crew" | "compliance" | "maintenance" | "finance" | "esg";
  data: Record<string, unknown>[];
  columns: { header: string; key: string; width?: number }[];
  kpis?: { label: string; value: string | number; trend?: "up" | "down" | "stable" }[];
  confidential?: boolean;
}

// Deep Ocean color palette (HSL → RGB for jsPDF)
const COLORS = {
  deepOcean: [15, 23, 42] as [number, number, number],      // hsl(222 47% 11%)
  oceanBlue: [30, 64, 175] as [number, number, number],     // hsl(224 76% 48%)
  accentCyan: [6, 182, 212] as [number, number, number],    // hsl(186 94% 43%)
  white: [255, 255, 255] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  textDark: [30, 41, 59] as [number, number, number],
  textMuted: [100, 116, 139] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [234, 179, 8] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
};

function drawCoverPage(doc: jsPDF, config: ReportConfig) {
  const { width, height } = doc.internal.pageSize;

  // Deep Ocean gradient background
  doc.setFillColor(...COLORS.deepOcean);
  doc.rect(0, 0, width, height, "F");

  // Accent line
  doc.setFillColor(...COLORS.accentCyan);
  doc.rect(0, height * 0.4, width, 3, "F");

  // Brand text
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("NAUTILUS ONE", 20, 40);

  // Report type badge
  doc.setFillColor(...COLORS.oceanBlue);
  doc.roundedRect(20, 50, 60, 10, 2, 2, "F");
  doc.setFontSize(8);
  doc.text(config.type.toUpperCase() + " REPORT", 30, 57);

  // Title
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(config.title, width - 40);
  doc.text(titleLines, 20, height * 0.35);

  // Subtitle
  if (config.subtitle) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.accentCyan);
    doc.text(config.subtitle, 20, height * 0.35 + titleLines.length * 14 + 10);
  }

  // Date & metadata
  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), "dd MMM yyyy HH:mm")}`, 20, height - 40);
  doc.text("Maritime HR Management Platform", 20, height - 30);

  // Confidential watermark
  if (config.confidential) {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(60);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsPDF GState lacks proper typings
    doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
    doc.text("CONFIDENTIAL", width / 2, height / 2, { angle: 45, align: "center" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
  }
}

function drawKPISection(doc: jsPDF, kpis: ReportConfig["kpis"], startY: number): number {
  if (!kpis || kpis.length === 0) return startY;

  const { width } = doc.internal.pageSize;
  const kpiWidth = (width - 40 - (kpis.length - 1) * 8) / kpis.length;
  let x = 20;

  kpis.forEach((kpi) => {
    // KPI card background
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(x, startY, kpiWidth, 30, 3, 3, "F");

    // Value
    doc.setTextColor(...COLORS.deepOcean);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(String(kpi.value), x + kpiWidth / 2, startY + 14, { align: "center" });

    // Label
    doc.setTextColor(...COLORS.textMuted);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(kpi.label, x + kpiWidth / 2, startY + 24, { align: "center" });

    // Trend indicator
    if (kpi.trend) {
      const trendColor = kpi.trend === "up" ? COLORS.success : kpi.trend === "down" ? COLORS.danger : COLORS.textMuted;
      const trendIcon = kpi.trend === "up" ? "▲" : kpi.trend === "down" ? "▼" : "●";
      doc.setTextColor(...trendColor);
      doc.setFontSize(8);
      doc.text(trendIcon, x + kpiWidth - 8, startY + 8);
    }

    x += kpiWidth + 8;
  });

  return startY + 40;
}

function drawDataTable(doc: jsPDF, config: ReportConfig, startY: number) {
  const headers = config.columns.map(c => c.header);
  const body = config.data.map(row =>
    config.columns.map(c => String(row[c.key] ?? "—"))
  );

  autoTable(doc, {
    head: [headers],
    body,
    startY,
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 4,
      textColor: COLORS.textDark,
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: COLORS.deepOcean,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    margin: { left: 20, right: 20 },
  });
}

function drawFooter(doc: jsPDF, pageNumber: number) {
  const { width, height } = doc.internal.pageSize;

  doc.setDrawColor(...COLORS.accentCyan);
  doc.setLineWidth(0.5);
  doc.line(20, height - 20, width - 20, height - 20);

  doc.setTextColor(...COLORS.textMuted);
  doc.setFontSize(7);
  doc.text("Nautilus One - Maritime HR Management", 20, height - 12);
  doc.text(`Page ${pageNumber}`, width - 20, height - 12, { align: "right" });
  doc.text("© " + new Date().getFullYear() + " All rights reserved", width / 2, height - 12, { align: "center" });
}

export function usePremiumPDF() {
  const generateReport = useCallback(async (config: ReportConfig) => {
    try {
      toast.loading("Generating PDF report...", { id: "pdf-gen" });

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      // Cover page
      drawCoverPage(doc, config);

      // Content page
      doc.addPage();
      let currentY = 40;

      // Page header
      doc.setTextColor(...COLORS.deepOcean);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(config.title, 20, currentY);
      currentY += 25;

      // KPIs
      if (config.kpis) {
        currentY = drawKPISection(doc, config.kpis, currentY);
      }

      // Data table
      if (config.data.length > 0) {
        drawDataTable(doc, config, currentY);
      }

      // Add footer to all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i - 1);
      }

      // Save
      const fileName = `nautilus-${config.type}-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(fileName);

      toast.success("Report generated successfully!", { id: "pdf-gen", duration: 3000 });
      return fileName;
    } catch (error) {
      toast.error("Failed to generate report", { id: "pdf-gen" });
      throw error;
    }
  }, []);

  return { generateReport };
}
