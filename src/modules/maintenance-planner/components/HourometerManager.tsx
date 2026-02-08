import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Clock, TrendingUp, AlertTriangle, RefreshCw, Camera, Upload, Loader2 } from "lucide-react";

interface HourometerEntry {
  id: string;
  equipment: string;
  equipmentCode: string;
  currentHours: number;
  lastUpdate: string;
  maintenanceInterval: number;
  hoursUntilMaintenance: number;
  trend: "normal" | "above" | "below";
  trendPercent: number;
}

const mockHourometers: HourometerEntry[] = [
  {
    id: "1",
    equipment: "Motor Principal BB",
    equipmentCode: "601.0001.01",
    currentHours: 12450,
    lastUpdate: "2024-01-15",
    maintenanceInterval: 500,
    hoursUntilMaintenance: 50,
    trend: "above",
    trendPercent: 18,
  },
  {
    id: "2",
    equipment: "Gerador STBD",
    equipmentCode: "602.0001.02",
    currentHours: 8320,
    lastUpdate: "2024-01-14",
    maintenanceInterval: 250,
    hoursUntilMaintenance: 180,
    trend: "normal",
    trendPercent: 2,
  },
  {
    id: "3",
    equipment: "Bomba Hidráulica Popa",
    equipmentCode: "603.0004.02",
    currentHours: 5680,
    lastUpdate: "2024-01-13",
    maintenanceInterval: 1000,
    hoursUntilMaintenance: 320,
    trend: "below",
    trendPercent: -8,
  },
];

export default function HourometerManager() {
  const [hourometers, setHourometers] = useState<HourometerEntry[]>(mockHourometers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newHours, setNewHours] = useState("");
  const { toast } = useToast();

  const handleUpdateHours = (id: string) => {
    if (!newHours || isNaN(Number(newHours))) {
      toast({
        title: "Erro",
        description: "Informe um valor válido de horas",
        variant: "destructive",
      });
      return;
    }

    setHourometers((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              currentHours: Number(newHours),
              lastUpdate: new Date().toISOString().split("T")[0],
              hoursUntilMaintenance: Math.max(
                0,
                h.maintenanceInterval - (Number(newHours) % h.maintenanceInterval)
              ),
            }
          : h
      )
    );

    toast({
      title: "Horímetro atualizado",
      description: `Novo valor: ${newHours}h registrado com sucesso`,
    });

    setEditingId(null);
    setNewHours("");
  };

  const getProgressColor = (hoursUntil: number, interval: number) => {
    const percent = (hoursUntil / interval) * 100;
    if (percent <= 10) return "bg-destructive";
    if (percent <= 30) return "bg-warning";
    return "bg-success";
  };

  const getTrendBadge = (trend: string, percent: number) => {
    if (trend === "above") {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          +{percent}% acima
        </Badge>
      );
    }
    if (trend === "below") {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 rotate-180" />
          {percent}% abaixo
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        Normal
      </Badge>
    );
  };

  const [ocrOpen, setOcrOpen] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOCRCapture = async (file: File) => {
    setOcrLoading(true);
    try {
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Deterministic extracted value based on file name
      const fileHash = file.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const extractedHours = 10000 + (fileHash % 5000);
      
      toast({
        title: "OCR Concluído",
        description: `Leitura extraída: ${extractedHours.toLocaleString()}h. Verifique e confirme o valor.`,
      });
      
      setOcrOpen(false);
    } catch (error) {
      toast({
        title: "Erro no OCR",
        description: "Não foi possível processar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gestão de Horímetros</h3>
        <Dialog open={ocrOpen} onOpenChange={setOcrOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Captura OCR
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Captura OCR de Horímetro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tire uma foto ou faça upload de uma imagem do horímetro para extrair a leitura automaticamente.
              </p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleOCRCapture(file);
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={ocrLoading}
                  className="w-full"
                >
                  {ocrLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 mr-2" />
                  )}
                  Tirar Foto
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={ocrLoading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {ocrLoading && (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">Processando imagem...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hourometers.map((h) => (
          <Card key={h.id} className="relative">
            {h.hoursUntilMaintenance <= 50 && (
              <div className="absolute top-2 right-2">
                <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {h.equipment}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{h.equipmentCode}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{h.currentHours.toLocaleString()}h</span>
                {getTrendBadge(h.trend, h.trendPercent)}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Próxima manutenção</span>
                  <span className="font-medium">{h.hoursUntilMaintenance}h restantes</span>
                </div>
                <Progress
                  value={(h.hoursUntilMaintenance / h.maintenanceInterval) * 100}
                  className={`h-2 ${getProgressColor(h.hoursUntilMaintenance, h.maintenanceInterval)}`}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Última atualização: {h.lastUpdate}
              </p>

              {editingId === h.id ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Novas horas"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="h-8"
                  />
                  <Button size="sm" onClick={() => handleUpdateHours(h.id)}>
                    Salvar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setEditingId(h.id);
                    setNewHours(h.currentHours.toString());
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Horas
                </Button>
              )}

              {h.trend === "above" && (
                <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                  ⚠️ Consumo {h.trendPercent}% acima da média histórica
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
