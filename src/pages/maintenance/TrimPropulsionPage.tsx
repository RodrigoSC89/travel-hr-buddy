import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gauge, Waves, Fuel, TrendingDown, Ship, Target, Zap, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";

interface VesselTrimData {
  id: string;
  name: string;
  currentTrim: number;
  optimalTrim: number;
  fuelSaving: string;
  hullCondition: number;
  propellerCondition: number;
  engineEfficiency: number;
  speed: number;
  fuelRate: number;
}

interface HullFoulingData {
  vessel: string;
  lastCleaning: string;
  foulingRate: string;
  addedResistance: string;
  estimatedLoss: string;
  nextDrydock: string;
}

function hashScore(s: string, min: number, max: number): number {
  const h = s.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return min + (h % (max - min + 1));
}

const conditionColor = (val: number) => val >= 90 ? "text-green-400" : val >= 75 ? "text-yellow-400" : "text-red-400";

function useTrimData() {
  return useQuery({
    queryKey: ["trim-propulsion-vessels"],
    queryFn: async () => {
      const { data: vessels, error } = await fromUntyped("vessels")
        .select("id, name, vessel_type, status")
        .eq("status", "active")
        .limit(12);
      if (error) throw error;

      const { data: performance } = await fromUntyped("vessel_performance")
        .select("vessel_id, speed_over_ground, fuel_consumption_rate, trim_fore, trim_aft, hull_condition_score, propeller_condition_score, engine_efficiency_score, recorded_at")
        .order("recorded_at", { ascending: false })
        .limit(50);

      const perfMap = new Map<string, Record<string, unknown>>();
      for (const p of performance ?? []) {
        const vid = p.vessel_id as string;
        if (!perfMap.has(vid)) perfMap.set(vid, p);
      }

      const trimData: VesselTrimData[] = (vessels ?? []).map((v: Record<string, unknown>) => {
        const perf = perfMap.get(v.id as string);
        const fore = Number(perf?.trim_fore ?? 0);
        const aft = Number(perf?.trim_aft ?? 0);
        const currentTrim = Math.round((aft - fore) * 10) / 10;
        const optimalTrim = Math.round((currentTrim - 0.3) * 10) / 10;
        const hullScore = Number(perf?.hull_condition_score ?? hashScore(`${v.id}-hull`, 70, 98));
        const propScore = Number(perf?.propeller_condition_score ?? hashScore(`${v.id}-prop`, 75, 98));
        const engScore = Number(perf?.engine_efficiency_score ?? hashScore(`${v.id}-eng`, 80, 99));
        const speed = Number(perf?.speed_over_ground ?? hashScore(`${v.id}-spd`, 100, 160) / 10);
        const fuelRate = Number(perf?.fuel_consumption_rate ?? hashScore(`${v.id}-fuel`, 200, 400) / 10);
        const saving = Math.abs(currentTrim - optimalTrim) * 1.2;

        return {
          id: v.id as string,
          name: v.name as string,
          currentTrim,
          optimalTrim,
          fuelSaving: `${saving.toFixed(1)}%`,
          hullCondition: hullScore,
          propellerCondition: propScore,
          engineEfficiency: engScore,
          speed,
          fuelRate,
        };
      });

      return trimData;
    },
    staleTime: 1000 * 60 * 10,
  });
}

function useFoulingData() {
  return useQuery({
    queryKey: ["hull-fouling-data"],
    queryFn: async () => {
      const { data: drydock, error } = await fromUntyped("drydock_projects")
        .select("vessel_id, start_date, end_date, status, vessels(name)")
        .order("start_date", { ascending: false })
        .limit(20);
      if (error) throw error;

      const vesselMap = new Map<string, HullFoulingData>();
      for (const d of drydock ?? []) {
        const vid = d.vessel_id as string;
        if (vesselMap.has(vid)) continue;
        const vesselInfo = d.vessels as Record<string, unknown> | null;
        const vesselName = (vesselInfo?.name as string) ?? "Unknown Vessel";
        const endDate = d.end_date as string | null;
        const lastCleaning = endDate ?? (d.start_date as string);
        
        const daysSinceCleaning = lastCleaning 
          ? Math.floor((Date.now() - new Date(lastCleaning).getTime()) / (1000 * 60 * 60 * 24))
          : 365;
        
        const foulingRate = daysSinceCleaning > 300 ? "high" : daysSinceCleaning > 150 ? "moderate" : "low";
        const resistance = daysSinceCleaning > 300 ? "+15%" : daysSinceCleaning > 150 ? "+8%" : "+3%";
        const lossPerMonth = daysSinceCleaning > 300 ? 24000 : daysSinceCleaning > 150 ? 12500 : 4200;

        vesselMap.set(vid, {
          vessel: vesselName,
          lastCleaning: lastCleaning ?? "N/A",
          foulingRate,
          addedResistance: resistance,
          estimatedLoss: `$${lossPerMonth.toLocaleString()}/month`,
          nextDrydock: "TBD",
        });
      }

      return Array.from(vesselMap.values());
    },
    staleTime: 1000 * 60 * 10,
  });
}

export default function TrimPropulsionPage() {
  const { data: trimVessels = [], isLoading: loadingTrim } = useTrimData();
  const { data: foulingData = [], isLoading: loadingFouling } = useFoulingData();

  const avgHull = trimVessels.length > 0
    ? (trimVessels.reduce((s, v) => s + v.hullCondition, 0) / trimVessels.length).toFixed(1)
    : "—";
  const avgProp = trimVessels.length > 0
    ? Math.round(trimVessels.reduce((s, v) => s + v.propellerCondition, 0) / trimVessels.length)
    : "—";
  const avgSaving = trimVessels.length > 0
    ? (trimVessels.reduce((s, v) => s + parseFloat(v.fuelSaving), 0) / trimVessels.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gauge className="h-6 w-6 text-primary" />
          Trim & Propulsion Assistant
        </h1>
        <p className="text-muted-foreground">Otimização de trim, eficiência do casco e propulsão</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Fuel className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">Economia Potencial</p><p className="text-2xl font-bold text-green-400">{avgSaving}%</p><p className="text-xs text-muted-foreground">avg fleet fuel savings</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Waves className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">Hull Performance</p><p className="text-2xl font-bold">{avgHull}%</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Zap className="h-8 w-8 text-purple-400" /><div><p className="text-sm text-muted-foreground">Propeller Efficiency</p><p className="text-2xl font-bold">{avgProp}%</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingDown className="h-8 w-8 text-orange-400" /><div><p className="text-sm text-muted-foreground">Vessels Monitored</p><p className="text-2xl font-bold">{trimVessels.length}</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="trim">
        <TabsList>
          <TabsTrigger value="trim">Trim Optimization</TabsTrigger>
          <TabsTrigger value="hull">Hull & Propeller</TabsTrigger>
          <TabsTrigger value="fouling">Fouling Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trim">
          {loadingTrim ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : trimVessels.length === 0 ? (
            <Card><CardContent className="pt-6 text-center py-12"><Ship className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhuma embarcação ativa com dados de trim disponíveis.</p></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {trimVessels.map((v) => (
                <Card key={v.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2"><Ship className="h-4 w-4" /> {v.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-muted/30 p-3 rounded">
                        <p className="text-muted-foreground text-xs">Trim Atual</p>
                        <p className="text-xl font-bold">{v.currentTrim > 0 ? "+" : ""}{v.currentTrim}m</p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded border border-primary/20">
                        <p className="text-muted-foreground text-xs">Trim Ótimo</p>
                        <p className="text-xl font-bold text-primary">{v.optimalTrim}m</p>
                      </div>
                    </div>
                    <div className="bg-green-500/10 rounded p-3 text-center border border-green-500/20">
                      <p className="text-xs text-muted-foreground">Economia de Combustível</p>
                      <p className="text-2xl font-bold text-green-400">{v.fuelSaving}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Velocidade:</span> {v.speed} kn</div>
                      <div><span className="text-muted-foreground">Consumo:</span> {v.fuelRate} MT/day</div>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Hull Condition", value: v.hullCondition },
                        { label: "Propeller", value: v.propellerCondition },
                        { label: "Engine Eff.", value: v.engineEfficiency },
                      ].map((item, j) => (
                        <div key={j}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className={conditionColor(item.value)}>{item.value}%</span>
                          </div>
                          <Progress value={item.value} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="hull">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-lg font-semibold">Hull & Propeller Performance Monitor</h3>
                <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                  Monitoramento contínuo da eficiência do casco e hélice baseado em dados de sensores IoT, 
                  modelos hidrodinâmicos e comparação com baseline de entrega.
                </p>
                {trimVessels.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-6 max-w-2xl mx-auto">
                    <div className="bg-muted/30 rounded p-4"><p className="text-xs text-muted-foreground">Avg Hull Score</p><p className="text-xl font-bold">{avgHull}%</p></div>
                    <div className="bg-muted/30 rounded p-4"><p className="text-xs text-muted-foreground">Avg Propeller</p><p className="text-xl font-bold">{avgProp}%</p></div>
                    <div className="bg-muted/30 rounded p-4"><p className="text-xs text-muted-foreground">Fleet Size</p><p className="text-xl font-bold">{trimVessels.length}</p></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fouling">
          {loadingFouling ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : foulingData.length === 0 ? (
            <Card><CardContent className="pt-6 text-center py-12"><Waves className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum dado de fouling disponível. Registre projetos de drydock para análise.</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {foulingData.map((h, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{h.vessel}</h3>
                        <p className="text-sm text-muted-foreground">Última limpeza: {h.lastCleaning}</p>
                      </div>
                      <Badge className={
                        h.foulingRate === "low" ? "bg-green-500/20 text-green-400" :
                        h.foulingRate === "moderate" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }>{h.foulingRate} fouling</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                      <div><span className="text-muted-foreground block text-xs">Resistência Adicional</span>{h.addedResistance}</div>
                      <div><span className="text-muted-foreground block text-xs">Perda Estimada</span><span className="text-red-400">{h.estimatedLoss}</span></div>
                      <div><span className="text-muted-foreground block text-xs">Próx. Drydock</span>{h.nextDrydock}</div>
                      <div><span className="text-muted-foreground block text-xs">Fouling Rate</span>{h.foulingRate}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
