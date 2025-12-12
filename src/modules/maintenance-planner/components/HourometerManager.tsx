import { useState, useMemo, useCallback } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Clock, TrendingUp, AlertTriangle, RefreshCw, Camera } from "lucide-react";

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
      };
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
    };

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gestão de Horímetros</h3>
        <Button variant="outline" size="sm">
          <Camera className="h-4 w-4 mr-2" />
          Captura OCR
        </Button>
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
                    onChange={handleChange}
                    className="h-8"
                  />
                  <Button size="sm" onClick={() => handlehandleUpdateHours}>
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
