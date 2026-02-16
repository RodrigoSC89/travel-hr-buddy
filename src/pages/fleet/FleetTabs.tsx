import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Ship, Plus, Wrench, Fuel, CheckCircle, AlertTriangle,
  TrendingUp, BarChart3
} from "lucide-react";
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Line
} from "recharts";
import { FleetMapBox } from "@/components/fleet/FleetMapBox";
import { VesselCard } from "./VesselCard";
import { FleetAICopilot } from "./FleetAICopilot";
import type { EnrichedVessel, PerformanceMetric } from "./types";

interface FleetTabsProps {
  vessels: EnrichedVessel[];
  maintenance: Record<string, unknown>[];
  fuelTrend: { day: string; consumption: number; efficiency: number }[];
  performanceMetrics: PerformanceMetric[];
  selectedVessel: EnrichedVessel | null;
  loading: boolean;
  onSelectVessel: (v: EnrichedVessel) => void;
  onShowAddDialog: () => void;
  onToast: (opts: { title: string; description?: string }) => void;
}

export const FleetTabs = ({
  vessels, maintenance, fuelTrend, performanceMetrics,
  selectedVessel, loading, onSelectVessel, onShowAddDialog, onToast
}: FleetTabsProps) => (
  <>
    {/* Overview Tab */}
    <TabsContent value="overview" className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vessels.slice(0, 4).map(vessel => (
              <VesselCard key={vessel.id} vessel={vessel} onClick={() => onSelectVessel(vessel)} />
            ))}
          </div>
        </div>
        <div className="xl:col-span-1">
          <FleetAICopilot vessels={vessels} onToast={onToast} />
        </div>
      </div>
    </TabsContent>

    {/* Tracking Tab */}
    <TabsContent value="tracking">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- FleetMapBox expects VesselPosition[] */}
      <FleetMapBox
        vessels={vessels as unknown as Parameters<typeof FleetMapBox>[0]['vessels']}
        onSelectVessel={onSelectVessel as unknown as Parameters<typeof FleetMapBox>[0]['onSelectVessel']}
        selectedVessel={selectedVessel as unknown as Parameters<typeof FleetMapBox>[0]['selectedVessel']}
        height="600px"
        showList={true}
      />
    </TabsContent>

    {/* Vessels Tab */}
    <TabsContent value="vessels">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vessels.map(vessel => (
          <VesselCard key={vessel.id} vessel={vessel} onClick={() => onSelectVessel(vessel)} />
        ))}
        {vessels.length === 0 && !loading && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Ship className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Nenhuma embarcação cadastrada</h3>
              <p className="text-muted-foreground mb-4">Adicione sua primeira embarcação</p>
              <Button onClick={onShowAddDialog}><Plus className="h-4 w-4 mr-2" />Nova Embarcação</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </TabsContent>

    {/* Maintenance Tab */}
    <TabsContent value="maintenance">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Gestão de Manutenção
          </CardTitle>
          <CardDescription>Manutenções preventivas e corretivas</CardDescription>
        </CardHeader>
        <CardContent>
          {maintenance.length > 0 ? (
            <div className="space-y-3">
              {maintenance.slice(0, 10).map((m: Record<string, unknown>) => (
                <div key={m.id as string} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{(m.description as string) || "Manutenção Programada"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date((m.scheduled_date as string) || Date.now()).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge variant={(m.status as string) === "completed" ? "default" : "outline"}>
                    {(m.status as string) || "Pendente"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
              <p>Sem manutenções pendentes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>

    {/* Fuel Tab */}
    <TabsContent value="fuel">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Consumo de Combustível - 7 Dias
          </CardTitle>
          <CardDescription>Análise de consumo e eficiência energética</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={fuelTrend}>
              <defs>
                <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="consumption" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorConsumption)" name="Consumo (L)" />
              <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="hsl(var(--chart-2))" strokeWidth={3} name="Eficiência (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Analytics Tab */}
    <TabsContent value="analytics" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Radar de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" className="text-xs" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights de IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success/30">
              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Otimização Detectada</p>
                <p className="text-xs text-muted-foreground">Eficiência 8% acima da média do setor</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg border border-warning/30">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Manutenção Prevista</p>
                <p className="text-xs text-muted-foreground">1 embarcação requer manutenção em 5 dias</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Tendência Positiva</p>
                <p className="text-xs text-muted-foreground">Consumo de combustível reduziu 12% este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  </>
);
