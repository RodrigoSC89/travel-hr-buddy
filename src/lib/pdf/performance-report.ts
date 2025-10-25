/**
 * PATCH 95.0 - Performance Report PDF Export
 * Generates PDF reports with KPIs and AI insights
 */

import html2pdf from "html2pdf.js";

interface PerformanceMetrics {
  fuelEfficiency: number;
  navigationHours: number;
  productivity: number;
  downtime: number;
  totalMissions: number;
}

interface ChartData {
  name: string;
  value: number;
  label?: string;
}

interface PerformanceReportData {
  metrics: PerformanceMetrics;
  fuelData: ChartData[];
  productivityData: ChartData[];
  downtimeData: ChartData[];
  aiInsight: string;
  performanceStatus: string;
  period: string;
  vessel: string;
  missionType: string;
}

/**
 * Export performance report to PDF
 * 
 * @param data - Performance report data
 */
export const exportPerformancePDF = async (data: PerformanceReportData): Promise<void> => {
  const { metrics, fuelData, productivityData, downtimeData, aiInsight, performanceStatus, period, vessel, missionType } = data;

  // Format period label
  const periodLabel = period === "7" ? "Últimos 7 dias" : period === "30" ? "Últimos 30 dias" : "Últimos 90 dias";
  const vesselLabel = vessel === "all" ? "Todas as Embarcações" : `Embarcação: ${vessel}`;
  const missionLabel = missionType === "all" ? "Todos os Tipos" : `Tipo: ${missionType}`;

  // Format status label
  const statusLabels: Record<string, string> = {
    optimal: "Ótimo",
    average: "Médio",
    critical: "Crítico"
  };
  const statusLabel = statusLabels[performanceStatus] || "N/A";

  // Create HTML content
  const content = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e40af; padding-bottom: 20px;">
        <h1 style="color: #1e40af; margin: 0; font-size: 28px;">Relatório de Performance Operacional</h1>
        <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">
          ${periodLabel} | ${vesselLabel} | ${missionLabel}
        </p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">
          Gerado em: ${new Date().toLocaleString("pt-BR")}
        </p>
      </div>

      <!-- Performance Status -->
      <div style="background-color: ${performanceStatus === "optimal" ? "#dcfce7" : performanceStatus === "average" ? "#fef3c7" : "#fee2e2"}; 
                  border-left: 4px solid ${performanceStatus === "optimal" ? "#16a34a" : performanceStatus === "average" ? "#ca8a04" : "#dc2626"}; 
                  padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: ${performanceStatus === "optimal" ? "#16a34a" : performanceStatus === "average" ? "#ca8a04" : "#dc2626"}; font-size: 18px;">
          Status da Performance: ${statusLabel}
        </h3>
        <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
          ${aiInsight}
        </p>
      </div>

      <!-- KPIs Summary -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 20px;">
          Indicadores-Chave (KPIs)
        </h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Eficiência de Combustível</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1e40af;">${metrics.fuelEfficiency}%</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af;">Acima do esperado</p>
          </div>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Horas Navegadas</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1e40af;">${metrics.navigationHours}h</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af;">${metrics.totalMissions} missões</p>
          </div>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Produtividade</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1e40af;">${metrics.productivity}%</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af;">Performance média</p>
          </div>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Downtime</p>
            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1e40af;">${metrics.downtime}%</p>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #9ca3af;">Frota total</p>
          </div>
        </div>
      </div>

      <!-- Fuel Efficiency Data -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 20px;">
          Eficiência de Consumo por Missão
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 13px; color: #374151;">Missão</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb; font-size: 13px; color: #374151;">Eficiência (%)</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 13px; color: #374151;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${fuelData.map((item, index) => `
              <tr style="${index % 2 === 0 ? "background-color: #f9fafb;" : ""}">
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; font-weight: 600;">${item.value}%</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${item.label || "Normal"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <!-- Productivity Data -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 20px;">
          Horas Navegadas vs Produtividade
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 13px; color: #374151;">Período</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb; font-size: 13px; color: #374151;">Horas</th>
            </tr>
          </thead>
          <tbody>
            ${productivityData.map((item, index) => `
              <tr style="${index % 2 === 0 ? "background-color: #f9fafb;" : ""}">
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; font-weight: 600;">${item.value}h</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <!-- Downtime Data -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; font-size: 20px;">
          Downtime da Frota por Causa
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 13px; color: #374151;">Causa</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb; font-size: 13px; color: #374151;">Percentual</th>
            </tr>
          </thead>
          <tbody>
            ${downtimeData.map((item, index) => `
              <tr style="${index % 2 === 0 ? "background-color: #f9fafb;" : ""}">
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 13px; font-weight: 600;">${item.value}%</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 11px;">
        <p style="margin: 0;">Sistema Nautilus One</p>
        <p style="margin: 5px 0 0 0;">PATCH 95.0 - Performance Dashboard Module</p>
        <p style="margin: 5px 0 0 0;">Relatório gerado automaticamente com análise de IA</p>
      </div>
    </div>
  `;

  // Configure PDF options
  const options = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `performance-report-${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
  };

  // Generate and download PDF
  await html2pdf().set(options).from(content).save();
};
