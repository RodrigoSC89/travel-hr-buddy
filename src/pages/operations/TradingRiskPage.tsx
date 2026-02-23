import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, BarChart3, Shield, DollarSign, AlertTriangle, Plus, Activity } from "lucide-react";

const MOCK_FFA_POSITIONS = [
  { route: "TD3C (VLCC AG-China)", direction: "Long", quantity: "5 lots", entryPrice: "$28,500/day", currentPrice: "$31,200/day", pnl: "+$405,000", expiry: "Mar 2026", status: "open" },
  { route: "TC2 (37kt MR Cont-USAC)", direction: "Short", quantity: "3 lots", entryPrice: "$18,200/day", currentPrice: "$16,800/day", pnl: "+$126,000", expiry: "Apr 2026", status: "open" },
  { route: "C5 (Capesize W.Aus-China)", direction: "Long", quantity: "8 lots", entryPrice: "$12.50/mt", currentPrice: "$11.80/mt", pnl: "-$112,000", expiry: "Mar 2026", status: "open" },
  { route: "TD20 (Suezmax WAF-UKC)", direction: "Long", quantity: "2 lots", entryPrice: "$22,000/day", currentPrice: "$24,500/day", pnl: "+$150,000", expiry: "May 2026", status: "open" },
];

const MOCK_BUNKER_HEDGES = [
  { fuel: "VLSFO 0.5%", port: "Singapore", volume: "5,000 MT", fixedPrice: "$585/MT", spotPrice: "$610/MT", savings: "+$125,000", expiry: "Q1 2026" },
  { fuel: "MGO", port: "Rotterdam", volume: "2,000 MT", fixedPrice: "$780/MT", spotPrice: "$755/MT", savings: "-$50,000", expiry: "Q1 2026" },
  { fuel: "HSFO 380", port: "Fujairah", volume: "8,000 MT", fixedPrice: "$420/MT", spotPrice: "$445/MT", savings: "+$200,000", expiry: "Q2 2026" },
];

const MOCK_RISK_METRICS = [
  { metric: "Value at Risk (VaR) - 95%", value: "$1.2M", trend: "stable" },
  { metric: "Expected Shortfall (CVaR)", value: "$1.8M", trend: "up" },
  { metric: "Net FFA Exposure", value: "$569,000", trend: "up" },
  { metric: "Bunker Hedge Ratio", value: "72%", trend: "stable" },
  { metric: "Mark-to-Market (Total)", value: "+$694,000", trend: "up" },
  { metric: "Counterparty Risk Score", value: "Low", trend: "stable" },
];

export default function TradingRiskPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Trading & Risk Management
          </h1>
          <p className="text-muted-foreground">FFA Derivatives, Bunker Hedging & Maritime Risk Analytics</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Posição</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><DollarSign className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">P&L Total</p><p className="text-2xl font-bold text-green-400">+$694K</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Shield className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">VaR (95%)</p><p className="text-2xl font-bold">$1.2M</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Activity className="h-8 w-8 text-purple-400" /><div><p className="text-sm text-muted-foreground">Posições Abertas</p><p className="text-2xl font-bold">4 FFA + 3 Bunker</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><BarChart3 className="h-8 w-8 text-orange-400" /><div><p className="text-sm text-muted-foreground">Hedge Ratio</p><p className="text-2xl font-bold">72%</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="ffa">
        <TabsList>
          <TabsTrigger value="ffa">FFA Positions</TabsTrigger>
          <TabsTrigger value="bunker">Bunker Hedging</TabsTrigger>
          <TabsTrigger value="risk">Risk Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="ffa">
          <Card>
            <CardHeader><CardTitle>Forward Freight Agreements (FFA)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rota</TableHead>
                    <TableHead>Direção</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Preço Entrada</TableHead>
                    <TableHead>Preço Atual</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Vencimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_FFA_POSITIONS.map((pos, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{pos.route}</TableCell>
                      <TableCell>
                        <Badge className={pos.direction === "Long" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                          {pos.direction === "Long" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {pos.direction}
                        </Badge>
                      </TableCell>
                      <TableCell>{pos.quantity}</TableCell>
                      <TableCell>{pos.entryPrice}</TableCell>
                      <TableCell>{pos.currentPrice}</TableCell>
                      <TableCell className={pos.pnl.startsWith("+") ? "text-green-400 font-medium" : "text-red-400 font-medium"}>{pos.pnl}</TableCell>
                      <TableCell>{pos.expiry}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bunker">
          <Card>
            <CardHeader><CardTitle>Bunker Fuel Hedging</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Combustível</TableHead>
                    <TableHead>Porto</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Preço Fixado</TableHead>
                    <TableHead>Spot Atual</TableHead>
                    <TableHead>Economia</TableHead>
                    <TableHead>Vencimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_BUNKER_HEDGES.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{h.fuel}</TableCell>
                      <TableCell>{h.port}</TableCell>
                      <TableCell>{h.volume}</TableCell>
                      <TableCell>{h.fixedPrice}</TableCell>
                      <TableCell>{h.spotPrice}</TableCell>
                      <TableCell className={h.savings.startsWith("+") ? "text-green-400 font-medium" : "text-red-400 font-medium"}>{h.savings}</TableCell>
                      <TableCell>{h.expiry}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_RISK_METRICS.map((m, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">{m.metric}</p>
                  <p className="text-2xl font-bold">{m.value}</p>
                  <Badge variant="outline" className="mt-2">
                    {m.trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : <Activity className="h-3 w-3 mr-1" />}
                    {m.trend}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
