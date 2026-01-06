/**
 * Route Export Dialog Component
 * Modal for exporting routes to PDF and GPX formats
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  Navigation,
  Ship,
  User,
  Loader2,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { AlternativeRoute, WeatherRoutingResult } from "@/lib/routing/weather-routing";
import { downloadRoutePDF, downloadGPX, downloadRoutesComparisonPDF } from "@/lib/routing/route-export";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface RouteExportDialogProps {
  result: WeatherRoutingResult;
  selectedRoute: AlternativeRoute;
  trigger?: React.ReactNode;
}

export function RouteExportDialog({
  result,
  selectedRoute,
  trigger,
}: RouteExportDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  
  // Form state
  const [vesselName, setVesselName] = useState("MV Nautilus Explorer");
  const [voyageNumber, setVoyageNumber] = useState(`V-${Date.now().toString(36).toUpperCase()}`);
  const [masterName, setMasterName] = useState("");
  const [includeWeather, setIncludeWeather] = useState(true);
  const [includeHazards, setIncludeHazards] = useState(true);

  const handleExportPDF = async () => {
    setExporting("pdf");
    try {
      await downloadRoutePDF(result, selectedRoute, {
        vesselName,
        voyageNumber,
        masterName,
        includeWeather,
        includeHazards,
      });
      toast({
        title: "PDF Exportado",
        description: "Plano de viagem salvo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Falha ao gerar PDF.",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const handleExportGPX = async () => {
    setExporting("gpx");
    try {
      downloadGPX(selectedRoute, vesselName);
      toast({
        title: "GPX Exportado",
        description: "Rota salva para uso em sistemas de navegação.",
      });
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Falha ao gerar GPX.",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const handleExportComparison = async () => {
    setExporting("comparison");
    try {
      await downloadRoutesComparisonPDF(result, vesselName);
      toast({
        title: "Comparativo Exportado",
        description: "Comparativo de todas as rotas salvo.",
      });
    } catch (error) {
      toast({
        title: "Erro na Exportação",
        description: "Falha ao gerar comparativo.",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Rota
          </DialogTitle>
          <DialogDescription>
            Exporte a rota calculada para uso em sistemas de navegação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected Route Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedRoute.name}</span>
              </div>
              <Badge variant="outline">
                {selectedRoute.totalDistance.toFixed(0)} nm
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {selectedRoute.waypoints.length} waypoints
              </span>
              <span>ETA: {selectedRoute.eta.toLocaleDateString("pt-BR")}</span>
            </div>
          </div>

          <Separator />

          {/* Vessel Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vesselName" className="flex items-center gap-1">
                <Ship className="h-3 w-3" />
                Embarcação
              </Label>
              <Input
                id="vesselName"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                placeholder="Nome da embarcação"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voyageNumber">Nº Viagem</Label>
              <Input
                id="voyageNumber"
                value={voyageNumber}
                onChange={(e) => setVoyageNumber(e.target.value)}
                placeholder="V-12345"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="masterName" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Comandante (opcional)
            </Label>
            <Input
              id="masterName"
              value={masterName}
              onChange={(e) => setMasterName(e.target.value)}
              placeholder="Nome do comandante"
            />
          </div>

          <Separator />

          {/* PDF Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Opções do PDF</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="includeWeather" className="text-sm text-muted-foreground">
                Incluir riscos meteorológicos
              </Label>
              <Switch
                id="includeWeather"
                checked={includeWeather}
                onCheckedChange={setIncludeWeather}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="includeHazards" className="text-sm text-muted-foreground">
                Incluir zonas de risco
              </Label>
              <Switch
                id="includeHazards"
                checked={includeHazards}
                onCheckedChange={setIncludeHazards}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* GPX Export */}
          <Button
            variant="outline"
            onClick={handleExportGPX}
            disabled={exporting !== null}
            className="w-full sm:w-auto"
          >
            {exporting === "gpx" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4 mr-2" />
            )}
            Exportar GPX
          </Button>

          {/* Comparison PDF */}
          <Button
            variant="outline"
            onClick={handleExportComparison}
            disabled={exporting !== null}
            className="w-full sm:w-auto"
          >
            {exporting === "comparison" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Comparativo
          </Button>

          {/* Main PDF Export */}
          <Button
            onClick={handleExportPDF}
            disabled={exporting !== null}
            className="w-full sm:w-auto"
          >
            {exporting === "pdf" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RouteExportDialog;
