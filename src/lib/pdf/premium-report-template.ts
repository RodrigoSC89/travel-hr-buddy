/**
 * Premium PDF Report Template - Deep Ocean Command Center
 * Uses jsPDF for branded maritime reports
 */

interface ReportConfig {
  title: string;
  subtitle?: string;
  author?: string;
  vesselName?: string;
  date?: string;
  data: Record<string, unknown>[];
  columns: { header: string; key: string; width?: number }[];
}

// Lazy load jsPDF only when needed
async function getJsPDF() {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  return { jsPDF, autoTable };
}

// Deep Ocean brand colors
const COLORS = {
  navy: [10, 22, 40] as [number, number, number],
  cyan: [0, 242, 255] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  gray: [148, 163, 184] as [number, number, number],
  lightBg: [241, 245, 249] as [number, number, number],
};

export async function generatePremiumReport(config: ReportConfig): Promise<Blob> {
  const { jsPDF } = await getJsPDF();
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // ===== HEADER BAR =====
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 45, "F");

  // Cyan accent line
  doc.setFillColor(...COLORS.cyan);
  doc.rect(0, 45, pageWidth, 2, "F");

  // Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(config.title, 15, 22);

  // Subtitle
  if (config.subtitle) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.cyan);
    doc.text(config.subtitle, 15, 32);
  }

  // Brand & date (right side)
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text("NAUTILUS ONE", pageWidth - 15, 15, { align: "right" });
  doc.text(
    `Maritime Command System`,
    pageWidth - 15,
    21,
    { align: "right" }
  );
  doc.setTextColor(...COLORS.white);
  doc.text(
    config.date || new Date().toLocaleDateString("pt-BR"),
    pageWidth - 15,
    32,
    { align: "right" }
  );

  // ===== META INFO BAR =====
  let yPos = 55;
  if (config.vesselName || config.author) {
    doc.setFillColor(...COLORS.lightBg);
    doc.rect(10, yPos - 5, pageWidth - 20, 14, "F");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    
    if (config.vesselName) {
      doc.text(`Embarcação: ${config.vesselName}`, 15, yPos + 2);
    }
    if (config.author) {
      doc.text(`Gerado por: ${config.author}`, pageWidth / 2, yPos + 2);
    }
    yPos += 18;
  }

  // ===== DATA TABLE =====
  const headers = config.columns.map((c) => c.header);
  const body = config.data.map((row) =>
    config.columns.map((c) => String(row[c.key] ?? "—"))
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsPDF-autotable plugin extends doc prototype
  (doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable({
    startY: yPos,
    head: [headers],
    body,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: COLORS.navy,
      textColor: COLORS.white,
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 10, right: 10 },
  });

  // ===== FOOTER =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    // Footer bar
    doc.setFillColor(...COLORS.navy);
    doc.rect(0, pageHeight - 15, pageWidth, 15, "F");

    // Cyan accent
    doc.setFillColor(...COLORS.cyan);
    doc.rect(0, pageHeight - 15, pageWidth, 0.5, "F");

    doc.setFontSize(7);
    doc.setTextColor(...COLORS.gray);
    doc.text(
      "Documento gerado automaticamente pelo Nautilus One • Maritime Command System",
      15,
      pageHeight - 6
    );
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 15,
      pageHeight - 6,
      { align: "right" }
    );
  }

  return doc.output("blob");
}

/**
 * Trigger download of a premium report
 */
export async function downloadPremiumReport(
  config: ReportConfig,
  filename?: string
) {
  const blob = await generatePremiumReport(config);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `${config.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
