/**
 * Carbon Credit Trading Simulator
 * EU ETS compliance and carbon credit portfolio management
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Download, TrendingUp, TrendingDown, Leaf, DollarSign, BarChart3, ShoppingCart, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EU_ETS_PRICE_HISTORY = [
  { month: "Jul 24", price: 65.2, volume: 1200 },
  { month: "Aug 24", price: 62.8, volume: 980 },
  { month: "Sep 24", price: 68.1, volume: 1450 },
  { month: "Oct 24", price: 71.3, volume: 1100 },
  { month: "Nov 24", price: 74.5, volume: 1320 },
  { month: "Dec 24", price: 72.0, volume: 890 },
  { month: "Jan 25", price: 76.8, volume: 1560 },
  { month: "Feb 25", price: 79.2, volume: 1700 },
];

const COMPLIANCE_SCHEDULE = [
  { year: 2024, coverage: 40, phase: "Phase-in" },
  { year: 2025, coverage: 70, phase: "Phase-in" },
  { year: 2026, coverage: 100, phase: "Full" },
];

export function CarbonCreditTradingTab() {
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");
  const [tradeVolume, setTradeVolume] = useState("500");
  const [tradePrice, setTradePrice] = useState("79.20");

  const { data: etsData = [] } = useQuery({
    queryKey: ["eu-ets-tracking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eu_ets_tracking" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) return [];
      return data || [];
    },
    staleTime: 120000,
  });

  const portfolio = useMemo(() => {
    const totalEmissions = etsData.reduce((s: number, d: any) => s + (d.total_emissions_mt || 0), 0);
    const currentYear = new Date().getFullYear();
    const schedule = COMPLIANCE_SCHEDULE.find(s => s.year === currentYear) || COMPLIANCE_SCHEDULE[2];
    const requiredAllowances = Math.ceil(totalEmissions * (schedule.coverage / 100));
    const currentPrice = EU_ETS_PRICE_HISTORY[EU_ETS_PRICE_HISTORY.length - 1].price;
    const estimatedCost = requiredAllowances * currentPrice;
    const holdingAllowances = Math.round(requiredAllowances * 0.6); // Simulated portfolio
    const shortage = Math.max(0, requiredAllowances - holdingAllowances);

    return {
      totalEmissions: totalEmissions || 12450,
      coveragePercent: schedule.coverage,
      requiredAllowances: requiredAllowances || 8715,
      holdingAllowances: holdingAllowances || 5229,
      shortage: shortage || 3486,
      currentPrice,
      estimatedCost: estimatedCost || 690228,
      shortageCost: (shortage || 3486) * currentPrice,
    };
  }, [etsData]);

  const executeTrade = () => {
    const vol = parseInt(tradeVolume);
    const price = parseFloat(tradePrice);
    const total = vol * price;
    toast.success(`Ordem de ${tradeAction === "buy" ? "compra" : "venda"}: ${vol} EUA @ €${price} = €${total.toLocaleString()}`);
  };

  const exportCSV = () => {
    const rows = [
      "Metric,Value",
      `Total Emissions (MT CO2),${portfolio.totalEmissions}`,
      `Coverage %,${portfolio.coveragePercent}%`,
      `Required Allowances,${portfolio.requiredAllowances}`,
      `Holding Allowances,${portfolio.holdingAllowances}`,
      `Shortage,${portfolio.shortage}`,
      `Current EUA Price,€${portfolio.currentPrice}`,
      `Shortage Cost,€${portfolio.shortageCost.toLocaleString()}`,
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "carbon_credits.csv"; a.click();
    toast.success("Exportado!");
  };

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center">
          <Leaf className="h-4 w-4 mx-auto text-success mb-1" />
          <div className="text-xl font-bold">{portfolio.totalEmissions.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">MT CO₂ (Fleet)</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
          <div className="text-xl font-bold">€{portfolio.currentPrice}</div>
          <div className="text-[10px] text-muted-foreground">EUA Price</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <BarChart3 className="h-4 w-4 mx-auto text-warning mb-1" />
          <div className="text-xl font-bold">{portfolio.holdingAllowances.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">Allowances Held</div>
        </CardContent></Card>
        <Card className={portfolio.shortage > 0 ? "border-destructive/30" : "border-success/30"}>
          <CardContent className="p-3 text-center">
            <AlertTriangle className={`h-4 w-4 mx-auto mb-1 ${portfolio.shortage > 0 ? "text-destructive" : "text-success"}`} />
            <div className={`text-xl font-bold ${portfolio.shortage > 0 ? "text-destructive" : "text-success"}`}>{portfolio.shortage.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">Shortage ({portfolio.coveragePercent}% coverage)</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* EUA Price Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />EUA Price History</CardTitle>
              <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-3 w-3 mr-1" />CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={EU_ETS_PRICE_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[55, 85]} />
                <Tooltip />
                <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} name="€/EUA" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trading Panel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><ShoppingCart className="h-4 w-4" />Trading Desk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={tradeAction} onValueChange={(v: any) => setTradeAction(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Comprar EUA</SelectItem>
                <SelectItem value="sell">Vender EUA</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <label className="text-xs font-medium">Volume (MT)</label>
              <Input type="number" value={tradeVolume} onChange={e => setTradeVolume(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium">Preço (€/EUA)</label>
              <Input type="number" step="0.01" value={tradePrice} onChange={e => setTradePrice(e.target.value)} />
            </div>
            <div className="p-2 rounded bg-muted/30 text-center">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-lg font-bold">€{(parseInt(tradeVolume || "0") * parseFloat(tradePrice || "0")).toLocaleString()}</div>
            </div>
            <Button className="w-full" onClick={executeTrade} variant={tradeAction === "buy" ? "default" : "outline"}>
              {tradeAction === "buy" ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {tradeAction === "buy" ? "Comprar" : "Vender"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Phase-in */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">EU ETS Maritime Phase-in Schedule</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {COMPLIANCE_SCHEDULE.map(s => (
              <div key={s.year} className={`p-3 rounded-lg border text-center ${s.year === new Date().getFullYear() ? "border-primary bg-primary/5" : ""}`}>
                <div className="text-lg font-bold">{s.year}</div>
                <Progress value={s.coverage} className="h-2 my-2" />
                <Badge variant={s.coverage === 100 ? "default" : "outline"}>{s.coverage}% — {s.phase}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
