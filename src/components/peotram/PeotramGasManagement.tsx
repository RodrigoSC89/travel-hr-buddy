import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Fuel, AlertTriangle, TrendingDown, BarChart3 } from "lucide-react";

interface GasInventory {
  id: string;
  gas_type: string;
  symbol: string;
  icon: string;
  total_capacity_m3: number;
  current_level_m3: number;
  daily_consumption_m3: number;
  critical_level_percent: number;
  unit_cost_usd: number;
  last_refill: string;
  storage_locations: string[];
}

const GASES: GasInventory[] = [
  { id: "1", gas_type: "Hélio", symbol: "He", icon: "🫧", total_capacity_m3: 500, current_level_m3: 340, daily_consumption_m3: 25, critical_level_percent: 20, unit_cost_usd: 180, last_refill: "2026-01-28", storage_locations: ["Quad #1 (200m³)", "Quad #2 (200m³)", "Reserve (100m³)"] },
  { id: "2", gas_type: "Oxigênio", symbol: "O₂", icon: "💨", total_capacity_m3: 200, current_level_m3: 155, daily_consumption_m3: 8, critical_level_percent: 25, unit_cost_usd: 25, last_refill: "2026-02-05", storage_locations: ["Main Tank (150m³)", "Emergency (50m³)"] },
  { id: "3", gas_type: "Nitrogênio", symbol: "N₂", icon: "🌬️", total_capacity_m3: 150, current_level_m3: 120, daily_consumption_m3: 5, critical_level_percent: 15, unit_cost_usd: 15, last_refill: "2026-02-01", storage_locations: ["Main Tank (100m³)", "Backup (50m³)"] },
  { id: "4", gas_type: "Mix BIBS (EGS)", symbol: "EGS", icon: "🚨", total_capacity_m3: 50, current_level_m3: 48, daily_consumption_m3: 0.5, critical_level_percent: 30, unit_cost_usd: 250, last_refill: "2026-02-10", storage_locations: ["Emergency Supply (50m³)"] },
];

export function PeotramGasManagement() {
  const [gases] = useState(GASES);

  const getLevel = (g: GasInventory) => Math.round((g.current_level_m3 / g.total_capacity_m3) * 100);
  const getDaysRemaining = (g: GasInventory) => g.daily_consumption_m3 > 0 ? Math.floor(g.current_level_m3 / g.daily_consumption_m3) : Infinity;
  const isCritical = (g: GasInventory) => getLevel(g) <= g.critical_level_percent;
  const isWarning = (g: GasInventory) => getLevel(g) <= g.critical_level_percent * 1.5 && !isCritical(g);

  const totalValue = gases.reduce((a, g) => a + g.current_level_m3 * g.unit_cost_usd, 0);
  const criticalCount = gases.filter(isCritical).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{gases.length}</p>
            <p className="text-xs text-muted-foreground">Tipos de Gás</p>
          </CardContent>
        </Card>
        <Card className={criticalCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className={`text-2xl font-bold ${criticalCount > 0 ? "text-destructive" : "text-green-600"}`}>
              {criticalCount > 0 ? `⚠️ ${criticalCount}` : "✅ 0"}
            </p>
            <p className="text-xs text-muted-foreground">Nível Crítico</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">${(totalValue / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">Valor Inventário</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold">{Math.min(...gases.map(getDaysRemaining).filter(d => d !== Infinity))}d</p>
            <p className="text-xs text-muted-foreground">Menor Autonomia</p>
          </CardContent>
        </Card>
      </div>

      {/* Gas Cards */}
      {gases.map(gas => {
        const level = getLevel(gas);
        const daysRemaining = getDaysRemaining(gas);
        const critical = isCritical(gas);
        const warning = isWarning(gas);

        return (
          <Card key={gas.id} className={critical ? "border-destructive/50 bg-destructive/5" : warning ? "border-warning/50 bg-warning/5" : ""}>
            <CardContent className="pt-4 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{gas.icon}</span>
                  <div>
                    <h4 className="font-semibold">{gas.gas_type} ({gas.symbol})</h4>
                    <p className="text-xs text-muted-foreground">Custo: ${gas.unit_cost_usd}/m³ • Consumo: {gas.daily_consumption_m3} m³/dia</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${critical ? "text-destructive" : warning ? "text-warning" : "text-green-600"}`}>
                    {level}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {gas.current_level_m3}/{gas.total_capacity_m3} m³
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Progress value={level} className={`h-3 ${critical ? "[&>div]:bg-destructive" : warning ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Nível crítico: {gas.critical_level_percent}%</span>
                  <span className={`font-medium ${daysRemaining <= 5 ? "text-destructive" : daysRemaining <= 10 ? "text-warning" : ""}`}>
                    ⏱️ Autonomia: {daysRemaining === Infinity ? "N/A" : `${daysRemaining} dias`}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex flex-wrap gap-1">
                  {gas.storage_locations.map((loc, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{loc}</Badge>
                  ))}
                </div>
                <span className="text-muted-foreground">Último refill: {new Date(gas.last_refill).toLocaleDateString("pt-BR")}</span>
              </div>

              {critical && (
                <div className="flex items-center gap-2 p-2 bg-destructive/20 rounded text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">NÍVEL CRÍTICO — Solicitar reabastecimento imediato!</span>
                  <Button size="sm" variant="destructive" className="ml-auto text-xs h-6" onClick={() => toast.success("Solicitação de reabastecimento enviada!")}>
                    Solicitar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
