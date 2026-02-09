/**
 * Route Export Service
 * Exports calculated routes to PDF and GPX formats for navigation systems
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AlternativeRoute, HazardZone, Waypoint, WeatherRoutingResult } from "./weather-routing";

// ===============================
// GPX Export
// ===============================

/**
 * Generate GPX XML for a route
 * GPX is the standard format for GPS navigation devices
 */
export function generateGPX(route: AlternativeRoute, metadata?: {
  vesselName?: string;
  creator?: string;
}): string {
  const creator = metadata?.creator || "Nautilus One - Weather Routing";
  const vesselName = metadata?.vesselName || "Vessel";
  
  const formatCoord = (num: number) => num.toFixed(6);
  const formatTime = (date: Date) => date.toISOString();

  // Calculate estimated time for each waypoint
  let cumulativeHours = 0;
  const waypointsWithTime = route.waypoints.map((wp, index) => {
    if (index > 0 && route.segments[index - 1]) {
      cumulativeHours += route.segments[index - 1].duration;
    }
    const eta = new Date(route.eta.getTime() - (route.totalDuration - cumulativeHours) * 3600000);
    return { ...wp, eta };
  });

  const waypoints = waypointsWithTime.map((wp, index) => `
    <wpt lat="${formatCoord(wp.lat)}" lon="${formatCoord(wp.lon)}">
      <ele>0</ele>
      <time>${formatTime(wp.eta)}</time>
      <name>${wp.name || `WP${index + 1}`}</name>
      <desc>Waypoint ${index + 1} - ETA: ${wp.eta.toLocaleString("pt-BR")}</desc>
      <sym>${index === 0 ? "Flag, Green" : index === waypointsWithTime.length - 1 ? "Flag, Red" : "Waypoint"}</sym>
    </wpt>`).join("\n");

  const trackPoints = waypointsWithTime.map((wp) => `
        <trkpt lat="${formatCoord(wp.lat)}" lon="${formatCoord(wp.lon)}">
          <ele>0</ele>
          <time>${formatTime(wp.eta)}</time>
        </trkpt>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="${creator}"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${route.name} - ${vesselName}</name>
    <desc>${route.recommendation}</desc>
    <author>
      <name>Nautilus One Maritime System</name>
    </author>
    <time>${new Date().toISOString()}</time>
    <keywords>maritime,navigation,weather-routing,${route.type}</keywords>
  </metadata>

  ${waypoints}

  <trk>
    <name>${route.name}</name>
    <desc>Distância: ${route.totalDistance.toFixed(1)} nm | Duração: ${Math.floor(route.totalDuration / 24)}d ${Math.round(route.totalDuration % 24)}h | Combustível: ${route.fuelEstimate.toFixed(1)} ton</desc>
    <type>maritime_route</type>
    <trkseg>
      ${trackPoints}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Download GPX file
 */
export function downloadGPX(route: AlternativeRoute, vesselName?: string): void {
  const gpxContent = generateGPX(route, { vesselName });
  const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `rota-${route.id}-${new Date().toISOString().split("T")[0]}.gpx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ===============================
// PDF Export
// ===============================

interface PDFOptions {
  vesselName?: string;
  voyageNumber?: string;
  masterName?: string;
  includeWeather?: boolean;
  includeHazards?: boolean;
}

/**
 * Generate PDF report for a route
 */
export async function generateRoutePDF(
  result: WeatherRoutingResult,
  selectedRoute: AlternativeRoute,
  options: PDFOptions = {}
): Promise<Blob> {
  const doc = new jsPDF();
  const {
    vesselName = "MV Nautilus Explorer",
    voyageNumber = `V-${Date.now().toString(36).toUpperCase()}`,
    masterName = "",
    includeWeather = true,
    includeHazards = true,
  } = options;

  const formatDate = (date: Date) => date.toLocaleDateString("pt-BR");
  const formatDateTime = (date: Date) => date.toLocaleString("pt-BR");

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175);
  doc.text("PLANO DE VIAGEM", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("Weather Routing - Nautilus One", 105, 28, { align: "center" });

  // Voyage Info Box
  doc.setDrawColor(200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 35, 182, 35, 3, 3, "FD");

  doc.setFontSize(10);
  doc.setTextColor(60);
  
  doc.text(`Embarcação: ${vesselName}`, 20, 45);
  doc.text(`Viagem: ${voyageNumber}`, 120, 45);
  
  doc.text(`Origem: ${selectedRoute.waypoints[0]?.name || "N/A"}`, 20, 53);
  doc.text(`Destino: ${selectedRoute.waypoints[selectedRoute.waypoints.length - 1]?.name || "N/A"}`, 120, 53);
  
  doc.text(`Gerado em: ${formatDateTime(new Date())}`, 20, 61);
  if (masterName) doc.text(`Comandante: ${masterName}`, 120, 61);

  // Route Summary
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Resumo da Rota", 14, 80);

  doc.setFontSize(10);
  doc.setTextColor(60);

  // KPI Cards
  const kpis = [
    { label: "Tipo de Rota", value: selectedRoute.name },
    { label: "Distância Total", value: `${selectedRoute.totalDistance.toFixed(1)} nm` },
    { label: "Duração Estimada", value: `${Math.floor(selectedRoute.totalDuration / 24)}d ${Math.round(selectedRoute.totalDuration % 24)}h` },
    { label: "ETA", value: formatDateTime(selectedRoute.eta) },
    { label: "Combustível Est.", value: `${selectedRoute.fuelEstimate.toFixed(1)} ton` },
    { label: "Score de Risco", value: `${selectedRoute.riskScore.toFixed(0)}%` },
  ];

  let xPos = 14;
  let yPos = 88;
  kpis.forEach((kpi, i) => {
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(xPos, yPos, 58, 18, 2, 2, "F");
    
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(kpi.label, xPos + 4, yPos + 6);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(kpi.value, xPos + 4, yPos + 14);

    xPos += 62;
    if ((i + 1) % 3 === 0) {
      xPos = 14;
      yPos += 22;
    }
  });

  // Waypoints Table
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Waypoints da Rota", 14, 140);

  const waypointRows = selectedRoute.waypoints.map((wp, index) => {
    const segment = selectedRoute.segments[index];
    return [
      (index + 1).toString(),
      wp.name || `WP${index + 1}`,
      `${wp.lat.toFixed(4)}°`,
      `${wp.lon.toFixed(4)}°`,
      segment ? `${segment.bearing.toFixed(0)}°` : "-",
      segment ? `${segment.distance.toFixed(1)} nm` : "-",
    ];
  });

  autoTable(doc, {
    startY: 145,
    head: [["#", "Nome", "Latitude", "Longitude", "Rumo", "Distância"]],
    body: waypointRows,
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
    },
  });

  let currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Weather Risks
  if (includeWeather && selectedRoute.weatherRisks.length > 0) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Riscos Meteorológicos", 14, currentY);

    const weatherRows = selectedRoute.weatherRisks.map((risk, i) => [
      (i + 1).toString(),
      `${risk.position.lat.toFixed(2)}°, ${risk.position.lon.toFixed(2)}°`,
      risk.type.toUpperCase(),
      risk.severity.toUpperCase(),
      risk.description,
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [["#", "Posição", "Tipo", "Severidade", "Descrição"]],
      body: weatherRows,
      theme: "striped",
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 9 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Hazard Zones
  if (includeHazards && result.hazardZones.length > 0) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Zonas de Risco Identificadas", 14, currentY);

    const hazardRows = result.hazardZones.map((zone) => [
      zone.name,
      zone.type === "piracy" ? "Pirataria" : zone.type === "weather" ? "Meteorológico" : "Tráfego",
      zone.severity.toUpperCase(),
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [["Zona", "Tipo", "Severidade"]],
      body: hazardRows,
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] },
      styles: { fontSize: 9 },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Recommendations
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Recomendações", 14, currentY);

  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(selectedRoute.recommendation, 14, currentY + 8, { maxWidth: 180 });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Nautilus One - Weather Routing | Página ${i} de ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }

  return doc.output("blob");
}

/**
 * Download PDF file
 */
export async function downloadRoutePDF(
  result: WeatherRoutingResult,
  selectedRoute: AlternativeRoute,
  options?: PDFOptions
): Promise<void> {
  const blob = await generateRoutePDF(result, selectedRoute, options);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `plano-viagem-${selectedRoute.id}-${new Date().toISOString().split("T")[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ===============================
// Export All Routes
// ===============================

/**
 * Export all routes comparison to PDF
 */
export async function downloadRoutesComparisonPDF(
  result: WeatherRoutingResult,
  vesselName?: string
): Promise<void> {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 64, 175);
  doc.text("COMPARATIVO DE ROTAS", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text("Weather Routing - Nautilus One", 105, 28, { align: "center" });
  doc.text(`Embarcação: ${vesselName || "N/A"} | Gerado: ${new Date().toLocaleString("pt-BR")}`, 105, 36, { align: "center" });

  // Routes comparison table
  const allRoutes = [result.recommendedRoute, ...result.alternatives];
  
  const routeRows = allRoutes.map((route, index) => [
    index === 0 ? "★ " + route.name : route.name,
    `${route.totalDistance.toFixed(0)} nm`,
    `${Math.floor(route.totalDuration / 24)}d ${Math.round(route.totalDuration % 24)}h`,
    `${route.fuelEstimate.toFixed(1)} ton`,
    `${route.riskScore.toFixed(0)}%`,
    route.weatherRisks.length.toString(),
  ]);

  autoTable(doc, {
    startY: 45,
    head: [["Rota", "Distância", "Duração", "Combustível", "Risco", "Alertas"]],
    body: routeRows,
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 10 },
  });

  // Hazards summary
  if (result.hazardZones.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Zonas de Risco na Região", 14, (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15);

    const hazardRows = result.hazardZones.map(z => [
      z.name,
      z.type === "piracy" ? "Pirataria" : "Meteorológico",
      z.severity.toUpperCase(),
    ]);

    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20,
      head: [["Zona", "Tipo", "Severidade"]],
      body: hazardRows,
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68] },
    });
  }

  // Download
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `comparativo-rotas-${new Date().toISOString().split("T")[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default {
  generateGPX,
  downloadGPX,
  generateRoutePDF,
  downloadRoutePDF,
  downloadRoutesComparisonPDF,
};
