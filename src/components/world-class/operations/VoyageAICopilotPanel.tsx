/**
 * M026 - Voyage AI Copilot Panel
 * Complete voyage planning with AI-powered route, bunker, P&L and risk analysis
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Navigation, Fuel, DollarSign, AlertTriangle, Ship, 
  Brain, Loader2, MapPin, Wind, TrendingUp, Route 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { VoyageCopilotClient, type VoyagePlan } from "@/services/operations/voyage-optimizer.service";
import { logger } from "@/lib/logger";

type AnalysisTab = "route" | "bunker" | "pnl" | "risks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- AI response shape is deeply dynamic per analysis type
type AIResult = Record<string, any>;

export function VoyageAICopilotPanel() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalysisTab>("route");
  const [result, setResult] = useState<AIResult | null>(null);
  const [voyage, setVoyage] = useState<VoyagePlan>({
    origin: "",
    destination: "",
    vessel_type: "Tanker",
    cargo_type: "Crude Oil",
    speed_knots: 12,
    fuel_type: "VLSFO",
    charter_rate: 15000,
    distance_nm: 0,
  });

  const handlePlan = async () => {
    if (!voyage.origin || !voyage.destination) {
      toast({ title: "Preencha origem e destino", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const data = await VoyageCopilotClient.planVoyage(voyage);
      setResult(data.result);
      toast({ title: "🧠 Planejamento concluído com IA" });
    } catch (err) {
      logger.error("Voyage planning error", err as Error);
      toast({ title: "Erro no planejamento", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRouteResult = () => {
    if (!result?.route) return null;
    const r = result.route;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold">{r.distance_nm?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Distância (NM)</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold">{r.eta_days?.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">ETA (dias)</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold">{result.optimal_speed_knots || voyage.speed_knots}</p>
            <p className="text-xs text-muted-foreground">Veloc. Ótima (kts)</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold">{result.co2_emissions_mt?.toFixed(0) || "N/A"}</p>
            <p className="text-xs text-muted-foreground">CO₂ (MT)</p>
          </CardContent></Card>
        </div>
        {r.waypoints?.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Waypoints</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {r.waypoints.map((wp: { name: string; reason: string }) => (
                <div key={wp.name} className="flex items-center gap-2 text-xs">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="font-medium">{wp.name}</span>
                  <span className="text-muted-foreground">— {wp.reason}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {r.weather_advisory && (
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-3 flex items-start gap-2">
              <Wind className="h-4 w-4 text-warning mt-0.5" />
              <p className="text-xs">{r.weather_advisory}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPnLResult = () => {
    if (!result?.pnl) return null;
    const p = result.pnl;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-success">${p.estimated_revenue_usd?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Receita</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-destructive">${p.total_costs_usd?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Custos Totais</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold text-primary">${p.estimated_profit_usd?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Lucro Estimado</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold">${p.tce_usd_day?.toLocaleString()}/dia</p>
            <p className="text-xs text-muted-foreground">TCE</p>
          </CardContent></Card>
        </div>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Breakdown de Custos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs"><span>Combustível</span><span className="font-mono">${p.fuel_costs_usd?.toLocaleString()}</span></div>
            <div className="flex justify-between text-xs"><span>Custos Portuários</span><span className="font-mono">${p.port_costs_usd?.toLocaleString()}</span></div>
            <Separator />
            <div className="flex justify-between text-xs font-bold"><span>Margem</span><span>{p.margin_percent?.toFixed(1)}%</span></div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBunkerResult = () => {
    if (!result?.bunker) return null;
    const b = result.bunker;
    return (
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Fuel className="h-4 w-4" /> Plano de Abastecimento</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Porto Recomendado</Label><p className="font-semibold">{b.recommended_port}</p></div>
            <div><Label className="text-xs">Combustível</Label><p className="font-semibold">{b.fuel_type}</p></div>
            <div><Label className="text-xs">Consumo Total</Label><p className="font-semibold">{b.total_consumption_mt} MT</p></div>
            <div><Label className="text-xs">Custo Estimado</Label><p className="font-semibold text-primary">${b.estimated_cost_usd?.toLocaleString()}</p></div>
            <div><Label className="text-xs">Tempo Abastecimento</Label><p className="font-semibold">{b.bunkering_time_hours}h</p></div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRisksResult = () => {
    if (!result?.risks) return null;
    const severityColors: Record<string, string> = {
      low: "bg-success/10 text-success",
      medium: "bg-warning/10 text-warning",
      high: "bg-warning/20 text-warning",
      critical: "bg-destructive/10 text-destructive",
    };
    return (
      <div className="space-y-2">
        {result.risks.map((risk: { type: string; severity: string; description: string; mitigation: string }) => (
          <Card key={`${risk.type}-${risk.severity}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-sm font-medium">{risk.type}</span>
                </div>
                <Badge variant="outline" className={severityColors[risk.severity] || ""}>{risk.severity}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{risk.description}</p>
              <p className="text-xs"><span className="font-medium">Mitigação:</span> {risk.mitigation}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Voyage AI Copilot
          </h2>
          <p className="text-sm text-muted-foreground">Planejamento inteligente de viagens com IA (Veson-class)</p>
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <Label className="text-xs">Porto Origem</Label>
              <Input value={voyage.origin} onChange={e => setVoyage(v => ({ ...v, origin: e.target.value }))} placeholder="Santos" />
            </div>
            <div>
              <Label className="text-xs">Porto Destino</Label>
              <Input value={voyage.destination} onChange={e => setVoyage(v => ({ ...v, destination: e.target.value }))} placeholder="Rotterdam" />
            </div>
            <div>
              <Label className="text-xs">Tipo Navio</Label>
              <Select value={voyage.vessel_type} onValueChange={v => setVoyage(prev => ({ ...prev, vessel_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tanker">Tanker</SelectItem>
                  <SelectItem value="Bulk Carrier">Bulk Carrier</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                  <SelectItem value="PSV">PSV</SelectItem>
                  <SelectItem value="AHTS">AHTS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Velocidade (kts)</Label>
              <Input type="number" value={voyage.speed_knots} onChange={e => setVoyage(v => ({ ...v, speed_knots: Number(e.target.value) }))} />
            </div>
            <div>
              <Label className="text-xs">Tipo Carga</Label>
              <Input value={voyage.cargo_type} onChange={e => setVoyage(v => ({ ...v, cargo_type: e.target.value }))} placeholder="Crude Oil" />
            </div>
            <div>
              <Label className="text-xs">Combustível</Label>
              <Select value={voyage.fuel_type} onValueChange={v => setVoyage(prev => ({ ...prev, fuel_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VLSFO">VLSFO</SelectItem>
                  <SelectItem value="MGO">MGO</SelectItem>
                  <SelectItem value="HSFO">HSFO</SelectItem>
                  <SelectItem value="LNG">LNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Charter Rate ($/dia)</Label>
              <Input type="number" value={voyage.charter_rate} onChange={e => setVoyage(v => ({ ...v, charter_rate: Number(e.target.value) }))} />
            </div>
            <div>
              <Label className="text-xs">Distância (NM)</Label>
              <Input type="number" value={voyage.distance_nm || ""} onChange={e => setVoyage(v => ({ ...v, distance_nm: Number(e.target.value) }))} placeholder="Auto" />
            </div>
          </div>
          <Button onClick={handlePlan} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
            {isLoading ? "Analisando com IA..." : "Planejar Viagem Completa"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as AnalysisTab)}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="route" className="text-xs"><Route className="h-3 w-3 mr-1" />Rota</TabsTrigger>
                <TabsTrigger value="bunker" className="text-xs"><Fuel className="h-3 w-3 mr-1" />Bunker</TabsTrigger>
                <TabsTrigger value="pnl" className="text-xs"><DollarSign className="h-3 w-3 mr-1" />P&L</TabsTrigger>
                <TabsTrigger value="risks" className="text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Riscos</TabsTrigger>
              </TabsList>
              <div className="mt-4">
                <TabsContent value="route">{renderRouteResult()}</TabsContent>
                <TabsContent value="bunker">{renderBunkerResult()}</TabsContent>
                <TabsContent value="pnl">{renderPnLResult()}</TabsContent>
                <TabsContent value="risks">{renderRisksResult()}</TabsContent>
              </div>
            </Tabs>

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <Card className="mt-4 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Recomendações AI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec: string) => (
                      <li key={rec} className="text-xs flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
