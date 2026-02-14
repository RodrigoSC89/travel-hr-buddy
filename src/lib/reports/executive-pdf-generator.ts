/**
 * Executive PDF Report Generator
 * Generates weekly KPI reports with crew wellness, IoT sensors, and fleet data
 */

import { getJsPDF, getAutoTable } from '@/lib/pdf/lazy-pdf';
import { supabase } from "@/integrations/supabase/client";

interface ReportData {
  period: { start: Date; end: Date };
  wellness: {
    totalCheckins: number;
    avgWellness: number;
    crewAtRisk: number;
    byCategory: { category: string; avg: number }[];
  };
  iot: {
    totalReadings: number;
    anomalies: number;
    criticalAlerts: number;
    byType: { type: string; count: number; anomalies: number }[];
  };
  fleet: {
    totalVessels: number;
    activeVessels: number;
    avgFuelEfficiency: number;
  };
}

export async function fetchReportData(): Promise<ReportData> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  // Fetch wellness data
  const { data: wellnessData } = await supabase
    .from("crew_health_checkins")
    .select("*")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  const wellness = wellnessData || [];
  
  // Calculate wellness score from available fields
  const calcWellnessScore = (w: typeof wellness[0]) => 
    Math.round((w.mood + w.energy_level + w.sleep_quality + (10 - w.stress_level)) / 4 * 10);
  
  const avgWellness = wellness.length > 0
    ? wellness.reduce((sum, w) => sum + calcWellnessScore(w), 0) / wellness.length
    : 0;
  const crewAtRisk = wellness.filter(w => calcWellnessScore(w) < 50).length;

  // Fetch IoT data
  const { data: iotData } = await supabase
    .from("equipment_sensors")
    .select("*")
    .gte("reading_timestamp", startDate.toISOString())
    .lte("reading_timestamp", endDate.toISOString());

  const iot = iotData || [];
  const anomalies = iot.filter(s => s.is_anomaly).length;
  const criticalAlerts = iot.filter(s => s.sensor_status === "critical").length;

  // Group IoT by type
  const iotByType: Record<string, { count: number; anomalies: number }> = {};
  iot.forEach(sensor => {
    const type = sensor.sensor_type || "unknown";
    if (!iotByType[type]) iotByType[type] = { count: 0, anomalies: 0 };
    iotByType[type].count++;
    if (sensor.is_anomaly) iotByType[type].anomalies++;
  });

  return {
    period: { start: startDate, end: endDate },
    wellness: {
      totalCheckins: wellness.length,
      avgWellness: Math.round(avgWellness),
      crewAtRisk,
      byCategory: [
        { category: "Energy", avg: Math.round(wellness.reduce((s, w) => s + (w.energy_level || 0), 0) / Math.max(wellness.length, 1) * 10) },
        { category: "Stress", avg: Math.round(100 - wellness.reduce((s, w) => s + (w.stress_level || 0), 0) / Math.max(wellness.length, 1) * 10) },
        { category: "Sleep", avg: Math.round(wellness.reduce((s, w) => s + (w.sleep_quality || 0), 0) / Math.max(wellness.length, 1) * 10) },
      ],
    },
    iot: {
      totalReadings: iot.length,
      anomalies,
      criticalAlerts,
      byType: Object.entries(iotByType).map(([type, data]) => ({
        type,
        count: data.count,
        anomalies: data.anomalies,
      })),
    },
    fleet: {
      totalVessels: 5,
      activeVessels: 4,
      avgFuelEfficiency: 85,
    },
  };
}

export async function generateExecutivePDF(): Promise<Blob> {
  const data = await fetchReportData();
  const JsPDF = await getJsPDF();
  const autoTable = await getAutoTable();
  const doc = new JsPDF();
  
  const formatDate = (date: Date) => date.toLocaleDateString("pt-BR");

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175);
  doc.text("Nauti One - Relatório Executivo", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Período: ${formatDate(data.period.start)} - ${formatDate(data.period.end)}`, 105, 30, { align: "center" });
  doc.text(`Gerado em: ${formatDate(new Date())} às ${new Date().toLocaleTimeString("pt-BR")}`, 105, 37, { align: "center" });

  // Summary Cards
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Resumo Executivo", 14, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(60);
  
  // KPI boxes
  const kpis = [
    { label: "Wellness Médio", value: `${data.wellness.avgWellness}%`, color: data.wellness.avgWellness >= 70 ? [34, 197, 94] : [239, 68, 68] },
    { label: "Tripulantes em Risco", value: data.wellness.crewAtRisk.toString(), color: data.wellness.crewAtRisk === 0 ? [34, 197, 94] : [239, 68, 68] },
    { label: "Alertas Críticos IoT", value: data.iot.criticalAlerts.toString(), color: data.iot.criticalAlerts === 0 ? [34, 197, 94] : [239, 68, 68] },
    { label: "Anomalias Detectadas", value: data.iot.anomalies.toString(), color: [59, 130, 246] },
  ];

  let xPos = 14;
  kpis.forEach((kpi, i) => {
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.roundedRect(xPos, 55, 44, 25, 3, 3, "F");
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.text(kpi.value, xPos + 22, 67, { align: "center" });
    doc.setFontSize(8);
    doc.text(kpi.label, xPos + 22, 75, { align: "center" });
    xPos += 48;
  });

  // Wellness Section
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.text("Wellness da Tripulação", 14, 95);

  autoTable(doc, {
    startY: 100,
    head: [["Categoria", "Score Médio", "Status"]],
    body: data.wellness.byCategory.map(cat => [
      cat.category,
      `${cat.avg}%`,
      cat.avg >= 70 ? "✓ Bom" : cat.avg >= 50 ? "⚠ Atenção" : "✗ Crítico",
    ]),
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175] },
  });

  // IoT Section
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jspdf-autotable extends doc with lastAutoTable
  const finalY = (doc as unknown as Record<string, { finalY: number }>).lastAutoTable?.finalY || 130;
  doc.setFontSize(14);
  doc.text("Monitoramento IoT", 14, finalY + 15);

  autoTable(doc, {
    startY: finalY + 20,
    head: [["Tipo Sensor", "Leituras", "Anomalias", "Taxa Anomalia"]],
    body: data.iot.byType.map(sensor => [
      sensor.type,
      sensor.count.toString(),
      sensor.anomalies.toString(),
      `${sensor.count > 0 ? Math.round((sensor.anomalies / sensor.count) * 100) : 0}%`,
    ]),
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175] },
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Nauti One - Sistema de Gestão Marítima | Confidencial", 105, 285, { align: "center" });

  return doc.output("blob");
}

export async function downloadExecutiveReport(): Promise<void> {
  const blob = await generateExecutivePDF();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nautilus-executive-report-${new Date().toISOString().split("T")[0]}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
