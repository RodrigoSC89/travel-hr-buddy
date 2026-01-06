/**
 * Route History Panel Component
 * Displays saved routes with reload and compare functionality
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  History,
  Clock,
  Route,
  Fuel,
  AlertTriangle,
  RefreshCw,
  Trash2,
  GitCompare,
  MapPin,
  Anchor,
  CheckCircle,
  X,
  Edit,
  Save,
  Map,
  DollarSign,
} from "lucide-react";

// Average bunker prices in USD/ton (updated periodically)
const BUNKER_PRICES = {
  VLSFO: 580, // Very Low Sulfur Fuel Oil (0.5% S) - most common
  MGO: 720,   // Marine Gas Oil
  HFO: 450,   // Heavy Fuel Oil (3.5% S) - restricted areas only
  LNG: 800,   // LNG equivalent $/ton
};
import { RouteComparisonMap } from "./RouteComparisonMap";
import { cn } from "@/lib/utils";
import { useRouteHistory, StoredRoute } from "@/hooks/useRouteHistory";
import { WeatherRoutingResult, AlternativeRoute } from "@/lib/routing/weather-routing";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RouteHistoryPanelProps {
  className?: string;
  onLoadRoute?: (result: WeatherRoutingResult) => void;
  onCompareRoutes?: (routes: WeatherRoutingResult[]) => void;
  vesselId?: string;
}

export function RouteHistoryPanel({
  className,
  onLoadRoute,
  onCompareRoutes,
  vesselId,
}: RouteHistoryPanelProps) {
  const { routes, isLoading, deleteRoute, isDeleting, updateRouteName, refetch } = useRouteHistory({ vesselId });
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  const handleToggleCompare = (routeId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(routeId)) {
        return prev.filter((id) => id !== routeId);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 routes for comparison
      }
      return [...prev, routeId];
    });
  };

  const handleCompare = () => {
    const selectedRoutes = routes
      .filter((r) => selectedForCompare.includes(r.id))
      .map((r) => r.route_data);
    
    if (selectedRoutes.length >= 2) {
      setCompareDialogOpen(true);
      onCompareRoutes?.(selectedRoutes);
    }
  };

  const handleStartEdit = (route: StoredRoute) => {
    setEditingId(route.id);
    setEditName(route.name || getDefaultRouteName(route));
  };

  const handleSaveEdit = (routeId: string) => {
    updateRouteName({ routeId, name: editName });
    setEditingId(null);
  };

  const getDefaultRouteName = (route: StoredRoute) => {
    const origin = route.origin.name || `${route.origin.lat.toFixed(2)}, ${route.origin.lon.toFixed(2)}`;
    const dest = route.destination.name || `${route.destination.lat.toFixed(2)}, ${route.destination.lon.toFixed(2)}`;
    return `${origin} → ${dest}`;
  };

  const getComparisonData = () => {
    return routes
      .filter((r) => selectedForCompare.includes(r.id))
      .map((r) => ({
        id: r.id,
        name: r.name || getDefaultRouteName(r),
        route: r.route_data.recommendedRoute,
        createdAt: r.created_at,
      }));
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Rotas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Histórico de Rotas
              </CardTitle>
              <CardDescription>
                {routes.length} rota(s) salva(s) - selecione até 3 para comparar
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              {selectedForCompare.length >= 2 && (
                <Button
                  size="sm"
                  onClick={handleCompare}
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  Comparar ({selectedForCompare.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma rota calculada ainda</p>
              <p className="text-sm">Calcule uma rota para vê-la aqui</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {routes.map((route) => (
                  <div
                    key={route.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      selectedForCompare.includes(route.id)
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {editingId === route.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-8 text-sm"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleSaveEdit(route.id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {route.name || getDefaultRouteName(route)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleStartEdit(route)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(route.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={selectedForCompare.includes(route.id) ? "default" : "outline"}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleCompare(route.id)}
                          disabled={!selectedForCompare.includes(route.id) && selectedForCompare.length >= 3}
                        >
                          {selectedForCompare.includes(route.id) ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <GitCompare className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-500" />
                        <span>{route.origin.name || "Origem"}</span>
                      </div>
                      <span>→</span>
                      <div className="flex items-center gap-1">
                        <Anchor className="h-3 w-3 text-blue-500" />
                        <span>{route.destination.name || "Destino"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <Route className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-medium">
                          {route.route_data.recommendedRoute.totalDistance.toFixed(0)} nm
                        </p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <Clock className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-medium">
                          {Math.floor(route.route_data.recommendedRoute.totalDuration / 24)}d{" "}
                          {Math.round(route.route_data.recommendedRoute.totalDuration % 24)}h
                        </p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <Fuel className="h-3 w-3 mx-auto mb-1 text-amber-500" />
                        <p className="font-medium">
                          {route.route_data.recommendedRoute.fuelEstimate.toFixed(1)} ton
                        </p>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <AlertTriangle className="h-3 w-3 mx-auto mb-1 text-orange-500" />
                        <p className="font-medium">{route.hazards_count} riscos</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onLoadRoute?.(route.route_data)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Carregar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteRoute(route.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Comparison Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Comparação de Rotas
            </DialogTitle>
            <DialogDescription>
              Comparando {selectedForCompare.length} rotas selecionadas
            </DialogDescription>
          </DialogHeader>

          {/* Map Comparison */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Map className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Visualização no Mapa</span>
            </div>
            <RouteComparisonMap
              routes={getComparisonData().map((item, idx) => ({
                id: item.id,
                name: item.name,
                route: item.route,
              }))}
              height="350px"
            />
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedForCompare.length}, 1fr)` }}>
            {getComparisonData().map((item, idx) => (
              <ComparisonColumn
                key={item.id}
                name={item.name}
                route={item.route}
                createdAt={item.createdAt}
                highlight={idx === 0}
                colorIndex={idx}
              />
            ))}
          </div>

          <ComparisonSummary routes={getComparisonData().map((d) => d.route)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Distinct colors for comparison (matching RouteComparisonMap)
const COMPARISON_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red  
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
];

interface ComparisonColumnProps {
  name: string;
  route: AlternativeRoute;
  createdAt: string;
  highlight?: boolean;
  colorIndex?: number;
}

function ComparisonColumn({ name, route, createdAt, highlight, colorIndex = 0 }: ComparisonColumnProps) {
  const color = COMPARISON_COLORS[colorIndex % COMPARISON_COLORS.length];
  
  return (
    <Card className={cn("relative overflow-hidden", highlight && "border-primary")}>
      {/* Color indicator bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1" 
        style={{ backgroundColor: color }}
      />
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <CardTitle className="text-sm truncate">{name}</CardTitle>
        </div>
        <CardDescription className="text-xs">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <MetricRow icon={Route} label="Distância" value={`${route.totalDistance.toFixed(0)} nm`} />
        <MetricRow
          icon={Clock}
          label="Duração"
          value={`${Math.floor(route.totalDuration / 24)}d ${Math.round(route.totalDuration % 24)}h`}
        />
        <MetricRow icon={Fuel} label="Combustível" value={`${route.fuelEstimate.toFixed(1)} ton`} />
        <MetricRow
          icon={DollarSign}
          label="Custo Est."
          value={`$${(route.fuelEstimate * BUNKER_PRICES.VLSFO).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          valueClass="text-amber-500"
        />
        <MetricRow
          icon={AlertTriangle}
          label="Risco"
          value={`${route.riskScore.toFixed(0)}%`}
          valueClass={route.riskScore > 40 ? "text-destructive" : "text-emerald-500"}
        />
      </CardContent>
    </Card>
  );
}

interface MetricRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}

function MetricRow({ icon: Icon, label, value, valueClass }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className={cn("font-medium", valueClass)}>{value}</span>
    </div>
  );
}

interface ComparisonSummaryProps {
  routes: AlternativeRoute[];
}

function ComparisonSummary({ routes }: ComparisonSummaryProps) {
  if (routes.length < 2) return null;

  const findBest = (key: keyof AlternativeRoute, lowest: boolean = true) => {
    const values = routes.map((r) => r[key] as number);
    const bestValue = lowest ? Math.min(...values) : Math.max(...values);
    return routes.findIndex((r) => (r[key] as number) === bestValue);
  };

  const bestDistanceIdx = findBest("totalDistance");
  const bestDurationIdx = findBest("totalDuration");
  const bestFuelIdx = findBest("fuelEstimate");
  const bestRiskIdx = findBest("riskScore");

  // Calculate differences between routes
  const getDifferences = () => {
    const diffs: {
      label: string;
      route1: number;
      route2: number;
      diff: number;
      diffPercent: number;
      unit: string;
      better: 1 | 2;
      metric: string;
    }[] = [];

    for (let i = 0; i < routes.length; i++) {
      for (let j = i + 1; j < routes.length; j++) {
        const r1 = routes[i];
        const r2 = routes[j];

        // Distance
        const distDiff = r1.totalDistance - r2.totalDistance;
        const distPercent = (distDiff / Math.max(r1.totalDistance, r2.totalDistance)) * 100;
        diffs.push({
          label: `Rota ${i + 1} vs ${j + 1}`,
          route1: r1.totalDistance,
          route2: r2.totalDistance,
          diff: Math.abs(distDiff),
          diffPercent: Math.abs(distPercent),
          unit: "nm",
          better: distDiff > 0 ? 2 : 1,
          metric: "distância",
        });

        // Duration
        const durDiff = r1.totalDuration - r2.totalDuration;
        const durPercent = (durDiff / Math.max(r1.totalDuration, r2.totalDuration)) * 100;
        diffs.push({
          label: `Rota ${i + 1} vs ${j + 1}`,
          route1: r1.totalDuration,
          route2: r2.totalDuration,
          diff: Math.abs(durDiff),
          diffPercent: Math.abs(durPercent),
          unit: "h",
          better: durDiff > 0 ? 2 : 1,
          metric: "tempo",
        });

        // Fuel
        const fuelDiff = r1.fuelEstimate - r2.fuelEstimate;
        const fuelPercent = (fuelDiff / Math.max(r1.fuelEstimate, r2.fuelEstimate)) * 100;
        diffs.push({
          label: `Rota ${i + 1} vs ${j + 1}`,
          route1: r1.fuelEstimate,
          route2: r2.fuelEstimate,
          diff: Math.abs(fuelDiff),
          diffPercent: Math.abs(fuelPercent),
          unit: "ton",
          better: fuelDiff > 0 ? 2 : 1,
          metric: "combustível",
        });

        // Risk
        const riskDiff = r1.riskScore - r2.riskScore;
        const riskPercent = (riskDiff / Math.max(r1.riskScore, r2.riskScore || 1)) * 100;
        diffs.push({
          label: `Rota ${i + 1} vs ${j + 1}`,
          route1: r1.riskScore,
          route2: r2.riskScore,
          diff: Math.abs(riskDiff),
          diffPercent: Math.abs(riskPercent),
          unit: "%",
          better: riskDiff > 0 ? 2 : 1,
          metric: "risco",
        });
      }
    }

    return diffs;
  };

  // Calculate potential savings if best options are chosen
  const calculateSavings = () => {
    const worstDistance = Math.max(...routes.map((r) => r.totalDistance));
    const bestDistance = Math.min(...routes.map((r) => r.totalDistance));
    const distanceSaving = worstDistance - bestDistance;
    const distancePercent = (distanceSaving / worstDistance) * 100;

    const worstDuration = Math.max(...routes.map((r) => r.totalDuration));
    const bestDuration = Math.min(...routes.map((r) => r.totalDuration));
    const durationSaving = worstDuration - bestDuration;
    const durationPercent = (durationSaving / worstDuration) * 100;

    const worstFuel = Math.max(...routes.map((r) => r.fuelEstimate));
    const bestFuel = Math.min(...routes.map((r) => r.fuelEstimate));
    const fuelSaving = worstFuel - bestFuel;
    const fuelPercent = (fuelSaving / worstFuel) * 100;

    // Calculate cost savings in USD
    const costSaving = fuelSaving * BUNKER_PRICES.VLSFO;
    const worstCost = worstFuel * BUNKER_PRICES.VLSFO;
    const costPercent = (costSaving / worstCost) * 100;

    const worstRisk = Math.max(...routes.map((r) => r.riskScore));
    const bestRisk = Math.min(...routes.map((r) => r.riskScore));
    const riskReduction = worstRisk - bestRisk;

    return { 
      distanceSaving, distancePercent,
      durationSaving, durationPercent,
      fuelSaving, fuelPercent,
      costSaving, costPercent,
      riskReduction,
    };
  };

  const savings = calculateSavings();

  return (
    <div className="space-y-4">
      {/* Best Route Badges */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-3">Melhores Opções por Critério</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Badge variant="outline" className="justify-center py-2" style={{ borderColor: COMPARISON_COLORS[bestDistanceIdx] }}>
            <Route className="h-3 w-3 mr-1" />
            Menor distância: Rota {bestDistanceIdx + 1}
          </Badge>
          <Badge variant="outline" className="justify-center py-2" style={{ borderColor: COMPARISON_COLORS[bestDurationIdx] }}>
            <Clock className="h-3 w-3 mr-1" />
            Mais rápida: Rota {bestDurationIdx + 1}
          </Badge>
          <Badge variant="outline" className="justify-center py-2" style={{ borderColor: COMPARISON_COLORS[bestFuelIdx] }}>
            <Fuel className="h-3 w-3 mr-1" />
            Mais econômica: Rota {bestFuelIdx + 1}
          </Badge>
          <Badge variant="outline" className="justify-center py-2" style={{ borderColor: COMPARISON_COLORS[bestRiskIdx] }}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            Menor risco: Rota {bestRiskIdx + 1}
          </Badge>
        </div>
      </div>

      {/* Savings Analysis */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
        <h4 className="font-medium mb-3 text-emerald-600 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Economia Potencial (melhor vs pior rota)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SavingCard
            icon={Route}
            label="Distância"
            value={`${savings.distanceSaving.toFixed(0)} nm`}
            percent={savings.distancePercent}
          />
          <SavingCard
            icon={Clock}
            label="Tempo"
            value={`${Math.floor(savings.durationSaving)}h`}
            percent={savings.durationPercent}
          />
          <SavingCard
            icon={Fuel}
            label="Combustível"
            value={`${savings.fuelSaving.toFixed(1)} ton`}
            percent={savings.fuelPercent}
          />
          <SavingCard
            icon={DollarSign}
            label="Economia USD"
            value={`$${savings.costSaving.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
            percent={savings.costPercent}
            isCost
          />
          <SavingCard
            icon={AlertTriangle}
            label="Redução de Risco"
            value={`${savings.riskReduction.toFixed(0)} pts`}
            percent={null}
            isRisk
          />
        </div>
        
        {/* Bunker Price Reference */}
        <div className="mt-3 pt-3 border-t border-emerald-500/20 text-xs text-muted-foreground flex items-center justify-between">
          <span>Preço VLSFO referência: ${BUNKER_PRICES.VLSFO}/ton</span>
          <span className="text-emerald-500">
            {savings.costSaving > 0 && `💰 Economia de $${savings.costSaving.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD`}
          </span>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      {routes.length === 2 && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3">Comparação Detalhada</h4>
          <div className="space-y-2">
            <ComparisonRow
              label="Distância"
              value1={routes[0].totalDistance}
              value2={routes[1].totalDistance}
              unit="nm"
              format={(v) => v.toFixed(0)}
              lowerIsBetter
            />
            <ComparisonRow
              label="Duração"
              value1={routes[0].totalDuration}
              value2={routes[1].totalDuration}
              unit="h"
              format={(v) => `${Math.floor(v / 24)}d ${Math.round(v % 24)}h`}
              lowerIsBetter
            />
            <ComparisonRow
              label="Combustível"
              value1={routes[0].fuelEstimate}
              value2={routes[1].fuelEstimate}
              unit="ton"
              format={(v) => v.toFixed(1)}
              lowerIsBetter
            />
            <ComparisonRow
              label="Custo (USD)"
              value1={routes[0].fuelEstimate * BUNKER_PRICES.VLSFO}
              value2={routes[1].fuelEstimate * BUNKER_PRICES.VLSFO}
              unit=""
              format={(v) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
              lowerIsBetter
            />
            <ComparisonRow
              label="Risco"
              value1={routes[0].riskScore}
              value2={routes[1].riskScore}
              unit="%"
              format={(v) => v.toFixed(0)}
              lowerIsBetter
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface SavingCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  percent: number | null;
  isRisk?: boolean;
  isCost?: boolean;
}

function SavingCard({ icon: Icon, label, value, percent, isRisk, isCost }: SavingCardProps) {
  const iconColor = isCost ? "text-amber-500" : "text-emerald-600";
  const valueColor = isCost ? "text-amber-500" : "text-emerald-600";
  const percentColor = isCost ? "text-amber-400" : "text-emerald-500";
  
  return (
    <div className="text-center p-3 bg-background/60 rounded-lg">
      <Icon className={cn("h-4 w-4 mx-auto mb-1", iconColor)} />
      <p className={cn("font-semibold", valueColor)}>{value}</p>
      {percent !== null && (
        <p className={cn("text-xs", percentColor)}>-{percent.toFixed(1)}%</p>
      )}
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

interface ComparisonRowProps {
  label: string;
  value1: number;
  value2: number;
  unit: string;
  format: (v: number) => string;
  lowerIsBetter?: boolean;
}

function ComparisonRow({ label, value1, value2, unit, format, lowerIsBetter = true }: ComparisonRowProps) {
  const diff = value1 - value2;
  const diffPercent = (Math.abs(diff) / Math.max(value1, value2)) * 100;
  const route1Better = lowerIsBetter ? diff < 0 : diff > 0;
  const route2Better = lowerIsBetter ? diff > 0 : diff < 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-24 text-muted-foreground">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        <span className={cn(
          "flex-1 text-center px-2 py-1 rounded",
          route1Better ? "bg-emerald-500/20 text-emerald-600 font-medium" : "bg-muted"
        )}>
          <span 
            className="inline-block w-2 h-2 rounded-full mr-1"
            style={{ backgroundColor: COMPARISON_COLORS[0] }}
          />
          {format(value1)} {unit}
        </span>
        <span className="text-muted-foreground text-xs w-20 text-center">
          {diff !== 0 && (
            <>
              {route2Better ? "+" : "-"}{diffPercent.toFixed(1)}%
            </>
          )}
          {diff === 0 && "="}
        </span>
        <span className={cn(
          "flex-1 text-center px-2 py-1 rounded",
          route2Better ? "bg-emerald-500/20 text-emerald-600 font-medium" : "bg-muted"
        )}>
          <span 
            className="inline-block w-2 h-2 rounded-full mr-1"
            style={{ backgroundColor: COMPARISON_COLORS[1] }}
          />
          {format(value2)} {unit}
        </span>
      </div>
    </div>
  );
}

export default RouteHistoryPanel;
