/**
 * M027 - Bunker Optimizer Panel
 * Fuel procurement optimization across global ports
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fuel, TrendingDown, MapPin, DollarSign, Loader2, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { BunkerOptimizerService, type BunkerPlan } from "@/services/operations/voyage-optimizer.service";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function BunkerOptimizerPanel() {
  const { toast } = useToast();
  const [fuelType, setFuelType] = useState<"VLSFO" | "MGO" | "HSFO">("VLSFO");
  const [quantity, setQuantity] = useState(500);
  const [routePorts, setRoutePorts] = useState("");
  const [results, setResults] = useState<BunkerPlan[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptimize = () => {
    const ports = routePorts.split(",").map(p => p.trim()).filter(Boolean);
    const plans = BunkerOptimizerService.findOptimalPort({
      route_ports: ports,
      fuel_type: fuelType,
      quantity_mt: quantity,
    });
    setResults(plans);
    toast({ title: `⛽ ${plans.length} opções de bunker analisadas` });
  };

  const handleAIAnalysis = async () => {
    if (results.length === 0) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("voyage-copilot-ai", {
        body: {
          type: "bunker_plan",
          voyage: {
            origin: routePorts.split(",")[0]?.trim() || "Santos",
            destination: routePorts.split(",").pop()?.trim() || "Rotterdam",
            fuel_type: fuelType,
          },
          context: {
            quantity_mt: quantity,
            local_options: results.slice(0, 3),
          },
        },
      });
      if (error) throw error;
      setAiInsight(data.raw || JSON.stringify(data.result));
      toast({ title: "🧠 Análise AI do bunker concluída" });
    } catch (err) {
      toast({ title: "Erro na análise AI", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const cheapest = results[0]?.total_cost || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Fuel className="h-5 w-5 text-primary" />
          Bunker Optimizer
        </h2>
        <p className="text-sm text-muted-foreground">Otimização de combustível em 500+ portos globais</p>
      </div>

      {/* Input */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <Label className="text-xs">Tipo Combustível</Label>
              <Select value={fuelType} onValueChange={v => setFuelType(v as typeof fuelType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VLSFO">VLSFO (0.5%S)</SelectItem>
                  <SelectItem value="MGO">MGO (0.1%S)</SelectItem>
                  <SelectItem value="HSFO">HSFO (3.5%S)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Quantidade (MT)</Label>
              <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Portos da Rota (separados por vírgula)</Label>
              <Input value={routePorts} onChange={e => setRoutePorts(e.target.value)} placeholder="Santos, Las Palmas, Rotterdam" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleOptimize} className="flex-1">
              <DollarSign className="h-4 w-4 mr-2" />
              Comparar Preços
            </Button>
            <Button variant="outline" onClick={handleAIAnalysis} disabled={isLoading || results.length === 0}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Brain className="h-4 w-4 mr-1" />}
              Análise AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((plan, i) => (
            <motion.div key={plan.port} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={i === 0 ? "border-emerald-500/30 bg-emerald-500/5" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span className="font-semibold">{plan.port}</span>
                          {i === 0 && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Melhor Preço</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{plan.fuel_type} • {plan.quantity_mt} MT</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${plan.total_cost.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">${plan.price_per_mt.toFixed(0)}/MT</p>
                      {plan.savings_vs_alternative > 0 && (
                        <p className="text-xs text-red-500 flex items-center gap-1 justify-end">
                          <TrendingDown className="h-3 w-3" />
                          +${plan.savings_vs_alternative.toLocaleString()} vs melhor
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Savings Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3 text-center">
              <p className="text-sm">
                <span className="font-medium">Economia máxima possível:</span>{" "}
                <span className="text-lg font-bold text-primary">
                  ${(results[results.length - 1]?.total_cost - cheapest).toLocaleString()}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insight */}
      {aiInsight && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Análise AI — Bunker Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-xs whitespace-pre-wrap">{aiInsight}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
