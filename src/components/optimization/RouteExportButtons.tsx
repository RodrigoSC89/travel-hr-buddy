/**
 * Route Export Buttons Component
 * Exports optimized routes to PDF and GPX formats
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Download, FileText, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { OptimizedRoute, RouteWaypoint } from "@/lib/optimization/quantum-router";
import { logger } from '@/lib/logger';

interface RouteExportButtonsProps {
  route: OptimizedRoute | null;
  routeName?: string;
  className?: string;
}

export function RouteExportButtons({ route, routeName = "rota-otimizada", className }: RouteExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    if (!route) {
      toast.error("Nenhuma rota para exportar");
      return;
    }

    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(88, 28, 135); // Purple
      doc.text("Quantum Route Optimizer", 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, 30);

      // Route Summary
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Resumo da Rota Otimizada", 20, 45);

      doc.setFontSize(11);
      const summaryY = 55;
      doc.text(`Distância Total: ${route.totalDistance.toLocaleString()} milhas náuticas`, 20, summaryY);
      doc.text(`Duração Estimada: ${Math.round(route.totalDuration)} horas`, 20, summaryY + 8);
      doc.text(`Combustível Estimado: ${route.totalFuel.toFixed(1)} toneladas`, 20, summaryY + 16);
      doc.text(`Score de Risco: ${route.riskScore}/100`, 20, summaryY + 24);
      doc.text(`Confiança da Otimização: ${(route.confidence * 100).toFixed(1)}%`, 20, summaryY + 32);
      doc.text(`Iterações QAOA: ${route.iterations}`, 20, summaryY + 40);

      // Savings
      doc.setFontSize(14);
      doc.setTextColor(34, 197, 94); // Green
      doc.text("Economia Estimada", 20, summaryY + 55);
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Combustível: ${route.savings.fuelSaved.toFixed(1)} toneladas`, 20, summaryY + 65);
      doc.text(`Custo: $${route.savings.costSaved.toLocaleString()}`, 20, summaryY + 73);
      doc.text(`Tempo: ${route.savings.timeSaved.toFixed(1)} horas`, 20, summaryY + 81);

      // Waypoints
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Waypoints da Rota", 20, summaryY + 96);

      doc.setFontSize(10);
      let wpY = summaryY + 106;
      route.waypoints.forEach((wp, i) => {
        if (wpY > 270) {
          doc.addPage();
          wpY = 20;
        }
        doc.text(`${i + 1}. ${wp.name} (${wp.lat.toFixed(4)}, ${wp.lng.toFixed(4)})`, 25, wpY);
        wpY += 7;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Nauti One - Sistema de Otimização Marítima", 20, 285);

      doc.save(`${routeName}-${Date.now()}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      logger.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToGPX = () => {
    if (!route) {
      toast.error("Nenhuma rota para exportar");
      return;
    }

    setIsExporting(true);
    try {
      const gpxContent = generateGPX(route.waypoints, routeName);
      
      const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${routeName}-${Date.now()}.gpx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("GPX exportado com sucesso!");
    } catch (error) {
      logger.error("Erro ao exportar GPX:", error);
      toast.error("Erro ao exportar GPX");
    } finally {
      setIsExporting(false);
    }
  };

  const generateGPX = (waypoints: RouteWaypoint[], name: string): string => {
    const now = new Date().toISOString();
    
    const waypointElements = waypoints
      .map((wp, i) => `
    <wpt lat="${wp.lat}" lon="${wp.lng}">
      <name>${wp.name}</name>
      <desc>Waypoint ${i + 1} - ${wp.type || "waypoint"}</desc>
      <sym>${wp.type === "origin" ? "Flag, Green" : wp.type === "destination" ? "Flag, Red" : "Navaid, Amber"}</sym>
    </wpt>`)
      .join("");

    const trackPoints = waypoints
      .map((wp) => `        <trkpt lat="${wp.lat}" lon="${wp.lng}"><name>${wp.name}</name></trkpt>`)
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Nauti One - Quantum Router"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${name}</name>
    <desc>Rota otimizada via Quantum Router QAOA</desc>
    <author><name>Nauti One</name></author>
    <time>${now}</time>
  </metadata>
${waypointElements}
  <trk>
    <name>${name}</name>
    <desc>Rota marítima otimizada</desc>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>`;
  };

  if (!route) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToGPX}>
          <MapPin className="h-4 w-4 mr-2" />
          Exportar GPX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
