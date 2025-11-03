/**
 * PATCH 605 - ESG Report Export Service
 * Export ESG and emissions data to PDF and XLSX formats
 */

import { logger } from "@/lib/logger";
import * as XLSX from "xlsx";
import type { ESGReport, ESGMetric, EmissionLog } from "../types";

// Dynamically import html2pdf
let html2pdfModule: any = null;

async function loadHtml2Pdf() {
  if (html2pdfModule) return html2pdfModule;
  
  if (typeof window !== "undefined") {
    try {
      html2pdfModule = (await import("html2pdf.js")).default;
    } catch (error) {
      logger.error("html2pdf.js not available:", error);
      throw new Error("html2pdf.js is required for PDF export");
    }
  }
  
  return html2pdfModule;
}

export class ESGReportExporter {
  /**
   * Export ESG report to PDF format
   */
  static async exportESGReportPDF(report: ESGReport): Promise<void> {
    logger.info(`[ESG Exporter] Exporting report ${report.reportId} to PDF...`);

    try {
      const html = this.generateReportHTML(report);
      const html2pdf = await loadHtml2Pdf();

      const filename = `ESG_Report_${report.reportingPeriod}_${Date.now()}.pdf`;

      await html2pdf().from(html).set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      }).save();

      logger.info(`[ESG Exporter] PDF export complete: ${filename}`);
    } catch (error) {
      logger.error("[ESG Exporter] PDF export failed:", error);
      throw error;
    }
  }

  /**
   * Export ESG report to XLSX format
   */
  static async exportESGReportXLSX(report: ESGReport): Promise<void> {
    logger.info(`[ESG Exporter] Exporting report ${report.reportId} to XLSX...`);

    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ["ESG Report Summary"],
        ["Report ID:", report.reportId],
        ["Reporting Period:", report.reportingPeriod],
        ["Generated At:", report.generatedAt.toLocaleString()],
        [""],
        ["Total Emissions:", `${report.summary.totalEmissions.toFixed(2)} tonnes`],
        ["Average EEXI:", report.summary.avgEEXI?.toFixed(2) || "N/A"],
        ["CII Rating:", report.summary.ciiRating || "N/A"],
        ["Compliance Rate:", `${report.summary.complianceRate.toFixed(1)}%`],
        [""],
        ["Key Findings:"],
        ...report.summary.keyFindings.map(f => [f]),
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // ESG Metrics sheet
      const metricsData = [
        ["Metric Type", "Value", "Unit", "Date", "Status", "Target", "Baseline", "Notes"],
        ...report.metrics.map(m => [
          m.metricType,
          m.value,
          m.unit,
          m.measurementDate.toLocaleDateString(),
          m.complianceStatus || "",
          m.targetValue || "",
          m.baselineValue || "",
          m.notes || ""
        ])
      ];

      const wsMetrics = XLSX.utils.aoa_to_sheet(metricsData);
      XLSX.utils.book_append_sheet(wb, wsMetrics, "ESG Metrics");

      // Emissions sheet
      const emissionsData = [
        ["Type", "Amount", "Unit", "Date", "Vessel", "Fuel Type", "EEXI", "CII Rating", "Verified"],
        ...report.emissions.map(e => [
          e.emissionType,
          e.amount,
          e.unit,
          e.measurementDate.toLocaleDateString(),
          e.vesselId || "",
          e.fuelType || "",
          e.eexiValue || "",
          e.ciiRating || "",
          e.verified ? "Yes" : "No"
        ])
      ];

      const wsEmissions = XLSX.utils.aoa_to_sheet(emissionsData);
      XLSX.utils.book_append_sheet(wb, wsEmissions, "Emissions Log");

      // Forecast sheet (if available)
      if (report.forecast) {
        const forecastData = [
          ["Emissions Forecast"],
          ["Period:", report.forecast.period],
          ["Confidence:", `${(report.forecast.confidence * 100).toFixed(0)}%`],
          [""],
          ["Emission Type", "Predicted Amount (tonnes)"],
          ["CO2", report.forecast.predictedEmissions.co2.toFixed(2)],
          ["SOx", report.forecast.predictedEmissions.sox.toFixed(2)],
          ["NOx", report.forecast.predictedEmissions.nox.toFixed(2)],
          ["Total GHG", report.forecast.predictedEmissions.total_ghg.toFixed(2)],
          [""],
          ["Factors:"],
          ...report.forecast.factors.map(f => [f]),
          [""],
          ["Recommendations:"],
          ...report.forecast.recommendations.map(r => [r]),
        ];

        const wsForecast = XLSX.utils.aoa_to_sheet(forecastData);
        XLSX.utils.book_append_sheet(wb, wsForecast, "Forecast");
      }

      // Write file
      const filename = `ESG_Report_${report.reportingPeriod}_${Date.now()}.xlsx`;
      XLSX.writeFile(wb, filename);

      logger.info(`[ESG Exporter] XLSX export complete: ${filename}`);
    } catch (error) {
      logger.error("[ESG Exporter] XLSX export failed:", error);
      throw error;
    }
  }

  /**
   * Export report in specified format
   */
  static async exportESGReport(
    report: ESGReport,
    format: "PDF" | "XLSX"
  ): Promise<void> {
    if (format === "PDF") {
      await this.exportESGReportPDF(report);
    } else if (format === "XLSX") {
      await this.exportESGReportXLSX(report);
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate HTML content for PDF export
   */
  private static generateReportHTML(report: ESGReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ESG Report - ${report.reportingPeriod}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 5px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .summary-box {
      background: #f1f5f9;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .summary-box h3 {
      margin-top: 0;
      color: #1e40af;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 20px 0;
    }
    .metric-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      padding: 15px;
      border-radius: 6px;
    }
    .metric-card h4 {
      margin: 0 0 10px 0;
      color: #64748b;
      font-size: 14px;
      text-transform: uppercase;
    }
    .metric-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px;
      text-align: left;
    }
    th {
      background: #f1f5f9;
      font-weight: bold;
      color: #1e40af;
    }
    .status-compliant {
      color: #16a34a;
      font-weight: bold;
    }
    .status-at-risk {
      color: #ea580c;
      font-weight: bold;
    }
    .status-non-compliant {
      color: #dc2626;
      font-weight: bold;
    }
    .cii-rating {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
    }
    .cii-A { background: #16a34a; color: white; }
    .cii-B { background: #84cc16; color: white; }
    .cii-C { background: #eab308; color: black; }
    .cii-D { background: #ea580c; color: white; }
    .cii-E { background: #dc2626; color: white; }
    .findings {
      background: #fef3c7;
      padding: 15px;
      border-left: 4px solid #f59e0b;
      margin: 20px 0;
    }
    .findings ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>ESG & EEXI Compliance Report</h1>
      <p><strong>Reporting Period:</strong> ${report.reportingPeriod}</p>
      <p><strong>Report ID:</strong> ${report.reportId}</p>
    </div>
    <div>
      <p><strong>Generated:</strong> ${report.generatedAt.toLocaleString()}</p>
      ${report.vesselId ? `<p><strong>Vessel:</strong> ${report.vesselId}</p>` : ""}
    </div>
  </div>

  <div class="summary-box">
    <h3>Executive Summary</h3>
    <div class="metric-grid">
      <div class="metric-card">
        <h4>Total Emissions</h4>
        <div class="value">${report.summary.totalEmissions.toFixed(2)}</div>
        <p>tonnes CO₂e</p>
      </div>
      <div class="metric-card">
        <h4>Compliance Rate</h4>
        <div class="value">${report.summary.complianceRate.toFixed(1)}%</div>
        <p>of metrics compliant</p>
      </div>
      ${report.summary.avgEEXI ? `
      <div class="metric-card">
        <h4>Average EEXI</h4>
        <div class="value">${report.summary.avgEEXI.toFixed(2)}</div>
        <p>energy efficiency index</p>
      </div>
      ` : ""}
      ${report.summary.ciiRating ? `
      <div class="metric-card">
        <h4>CII Rating</h4>
        <div class="value"><span class="cii-rating cii-${report.summary.ciiRating}">${report.summary.ciiRating}</span></div>
        <p>carbon intensity indicator</p>
      </div>
      ` : ""}
    </div>
  </div>

  ${report.summary.keyFindings.length > 0 ? `
  <div class="findings">
    <h3>Key Findings</h3>
    <ul>
      ${report.summary.keyFindings.map(f => `<li>${f}</li>`).join("")}
    </ul>
  </div>
  ` : ""}

  <h2>ESG Metrics</h2>
  <table>
    <thead>
      <tr>
        <th>Metric Type</th>
        <th>Value</th>
        <th>Unit</th>
        <th>Date</th>
        <th>Status</th>
        <th>Target</th>
      </tr>
    </thead>
    <tbody>
      ${report.metrics.map(m => `
        <tr>
          <td>${m.metricType.replace(/_/g, " ")}</td>
          <td>${m.value}</td>
          <td>${m.unit}</td>
          <td>${m.measurementDate.toLocaleDateString()}</td>
          <td class="status-${m.complianceStatus || "pending"}">${m.complianceStatus || "pending"}</td>
          <td>${m.targetValue || "N/A"}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <h2>Emissions Log</h2>
  <table>
    <thead>
      <tr>
        <th>Type</th>
        <th>Amount (tonnes)</th>
        <th>Date</th>
        <th>Fuel Type</th>
        <th>EEXI</th>
        <th>CII Rating</th>
        <th>Verified</th>
      </tr>
    </thead>
    <tbody>
      ${report.emissions.slice(0, 20).map(e => `
        <tr>
          <td>${e.emissionType.toUpperCase()}</td>
          <td>${e.amount.toFixed(2)}</td>
          <td>${e.measurementDate.toLocaleDateString()}</td>
          <td>${e.fuelType || "N/A"}</td>
          <td>${e.eexiValue?.toFixed(2) || "N/A"}</td>
          <td>${e.ciiRating ? `<span class="cii-rating cii-${e.ciiRating}">${e.ciiRating}</span>` : "N/A"}</td>
          <td>${e.verified ? "✓" : "✗"}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  ${report.forecast ? `
    <h2>Emissions Forecast</h2>
    <div class="summary-box">
      <p><strong>Period:</strong> ${report.forecast.period}</p>
      <p><strong>Confidence:</strong> ${(report.forecast.confidence * 100).toFixed(0)}%</p>
      <h4>Predicted Emissions:</h4>
      <ul>
        <li>CO₂: ${report.forecast.predictedEmissions.co2.toFixed(2)} tonnes</li>
        <li>SOx: ${report.forecast.predictedEmissions.sox.toFixed(2)} tonnes</li>
        <li>NOx: ${report.forecast.predictedEmissions.nox.toFixed(2)} tonnes</li>
        <li>Total GHG: ${report.forecast.predictedEmissions.total_ghg.toFixed(2)} tonnes</li>
      </ul>
      ${report.forecast.recommendations.length > 0 ? `
        <h4>Recommendations:</h4>
        <ul>
          ${report.forecast.recommendations.map(r => `<li>${r}</li>`).join("")}
        </ul>
      ` : ""}
    </div>
  ` : ""}

  <div class="footer">
    <p>This report was automatically generated by the ESG & EEXI Compliance Tracker</p>
    <p>© ${new Date().getFullYear()} - All rights reserved</p>
  </div>
</body>
</html>
    `.trim();
  }
}
