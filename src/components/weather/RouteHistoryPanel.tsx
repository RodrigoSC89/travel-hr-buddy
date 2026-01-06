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
} from "lucide-react";
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
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Comparação de Rotas
            </DialogTitle>
            <DialogDescription>
              Comparando {selectedForCompare.length} rotas selecionadas
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedForCompare.length}, 1fr)` }}>
            {getComparisonData().map((item, idx) => (
              <ComparisonColumn
                key={item.id}
                name={item.name}
                route={item.route}
                createdAt={item.createdAt}
                highlight={idx === 0}
              />
            ))}
          </div>

          <ComparisonSummary routes={getComparisonData().map((d) => d.route)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ComparisonColumnProps {
  name: string;
  route: AlternativeRoute;
  createdAt: string;
  highlight?: boolean;
}

function ComparisonColumn({ name, route, createdAt, highlight }: ComparisonColumnProps) {
  return (
    <Card className={cn(highlight && "border-primary")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{name}</CardTitle>
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

  const bestDistance = findBest("totalDistance");
  const bestDuration = findBest("totalDuration");
  const bestFuel = findBest("fuelEstimate");
  const bestRisk = findBest("riskScore");

  return (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
      <h4 className="font-medium mb-3">Resumo da Comparação</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Badge variant="outline" className="justify-center py-2">
          <Route className="h-3 w-3 mr-1" />
          Menor distância: Rota {bestDistance + 1}
        </Badge>
        <Badge variant="outline" className="justify-center py-2">
          <Clock className="h-3 w-3 mr-1" />
          Mais rápida: Rota {bestDuration + 1}
        </Badge>
        <Badge variant="outline" className="justify-center py-2">
          <Fuel className="h-3 w-3 mr-1" />
          Mais econômica: Rota {bestFuel + 1}
        </Badge>
        <Badge variant="outline" className="justify-center py-2">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Menor risco: Rota {bestRisk + 1}
        </Badge>
      </div>
    </div>
  );
}

export default RouteHistoryPanel;
