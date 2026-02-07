/**
 * M033 - TCE Calculator Panel
 * Time Charter Equivalent calculator with multi-scenario analysis
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calculator, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { TCECalculatorService, type TCECalculation } from "@/services/operations/voyage-optimizer.service";

export function TCECalculatorPanel() {
  const [params, setParams] = useState({
    freight_revenue: 500000,
    demurrage: 0,
    dispatch: 0,
    fuel_cost: 150000,
    port_costs: 30000,
    canal_fees: 0,
    agency_fees: 5000,
    other_costs: 10000,
    voyage_days: 25,
  });

  const [result, setResult] = useState<{
    base: TCECalculation;
    scenarios: Array<TCECalculation & { label: string; delta_vs_base: number }>;
  } | null>(null);

  const handleCalculate = () => {
    const scenarios = [
      { label: "Otimista (fuel -10%, revenue +5%)", fuel_delta: -10, revenue_delta: 5, days_delta: 0 },
      { label: "Pessimista (fuel +15%, +3 dias)", fuel_delta: 15, revenue_delta: 0, days_delta: 3 },
      { label: "Congestionamento (+5 dias)", fuel_delta: 5, revenue_delta: 0, days_delta: 5 },
      { label: "Speed Up (-2 dias, fuel +8%)", fuel_delta: 8, revenue_delta: 0, days_delta: -2 },
    ];

    setResult(TCECalculatorService.calculateScenarios(params, scenarios));
  };

  const updateParam = (key: keyof typeof params, value: string) => {
    setParams(p => ({ ...p, [key]: Number(value) || 0 }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          TCE Calculator
        </h2>
        <p className="text-sm text-muted-foreground">Time Charter Equivalent com análise multi-cenário</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Parâmetros da Viagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-emerald-600">Receitas</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div><Label className="text-[10px]">Frete (USD)</Label><Input type="number" value={params.freight_revenue} onChange={e => updateParam("freight_revenue", e.target.value)} className="h-8 text-sm" /></div>
                <div><Label className="text-[10px]">Demurrage</Label><Input type="number" value={params.demurrage} onChange={e => updateParam("demurrage", e.target.value)} className="h-8 text-sm" /></div>
                <div><Label className="text-[10px]">Dispatch</Label><Input type="number" value={params.dispatch} onChange={e => updateParam("dispatch", e.target.value)} className="h-8 text-sm" /></div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs font-medium text-red-600">Custos de Viagem</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div><Label className="text-[10px]">Combustível</Label><Input type="number" value={params.fuel_cost} onChange={e => updateParam("fuel_cost", e.target.value)} className="h-8 text-sm" /></div>
                <div><Label className="text-[10px]">Portuários</Label><Input type="number" value={params.port_costs} onChange={e => updateParam("port_costs", e.target.value)} className="h-8 text-sm" /></div>
                <div><Label className="text-[10px]">Canal</Label><Input type="number" value={params.canal_fees} onChange={e => updateParam("canal_fees", e.target.value)} className="h-8 text-sm" /></div>
                <div><Label className="text-[10px]">Agência</Label><Input type="number" value={params.agency_fees} onChange={e => updateParam("agency_fees", e.target.value)} className="h-8 text-sm" /></div>
                <div><Label className="text-[10px]">Outros</Label><Input type="number" value={params.other_costs} onChange={e => updateParam("other_costs", e.target.value)} className="h-8 text-sm" /></div>
                <div><Label className="text-[10px]">Dias Viagem</Label><Input type="number" value={params.voyage_days} onChange={e => updateParam("voyage_days", e.target.value)} className="h-8 text-sm" /></div>
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full mt-4">
              <BarChart3 className="h-4 w-4 mr-2" />
              Calcular TCE + Cenários
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {/* Base TCE */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  TCE Base
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-3">
                  <p className="text-3xl font-bold text-primary">${result.base.tce_per_day.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">USD / dia</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between"><span>Receita Bruta</span><span className="font-mono text-emerald-600">${result.base.gross_revenue.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Custos Viagem</span><span className="font-mono text-red-600">${result.base.voyage_costs.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Lucro</span><span className="font-mono font-bold">${(result.base.gross_revenue - result.base.voyage_costs).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Dias</span><span className="font-mono">{result.base.voyage_days}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Scenarios */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cenários Comparativos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.scenarios.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                    <span className="flex-1">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">${s.tce_per_day.toLocaleString()}/d</span>
                      <Badge variant="outline" className={s.delta_vs_base >= 0 ? "text-emerald-600" : "text-red-600"}>
                        {s.delta_vs_base >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {s.delta_vs_base >= 0 ? "+" : ""}{s.delta_vs_base.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
