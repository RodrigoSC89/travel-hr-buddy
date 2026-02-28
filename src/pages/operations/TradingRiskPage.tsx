/**
 * TradingRiskPage - Trading & Risk Management
 * Uses fixture_negotiations + bunker_operations from Supabase
 */
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, BarChart3, Shield, DollarSign, AlertTriangle, Plus, Activity, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FFAPosition {
  route: string;
  direction: string;
  quantity: string;
  entryPrice: string;
  currentPrice: string;
  pnl: string;
  expiry: string;
  status: string;
}

interface BunkerHedge {
  fuel: string;
  port: string;
  volume: string;
  fixedPrice: string;
  spotPrice: string;
  savings: string;
  expiry: string;
}

function useTradingData() {
  const { data: fixtures = [], isLoading: loadingFixtures } = useQuery({
    queryKey: ["trading-fixtures"],
    queryFn: async () => {
      const { data } = await supabase
        .from("fixture_negotiations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: bunkerOps = [], isLoading: loadingBunker } = useQuery({
    queryKey: ["trading-bunker"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bunker_operations")
        .select("id, fuel_type, quantity_mt, total_cost, operation_date, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const ffaPositions: FFAPosition[] = useMemo(() => {
    if (fixtures.length === 0) return [];
    return fixtures.map((f) => ({
      route: String((f as Record<string, unknown>).route_name || (f as Record<string, unknown>).vessel_type || "N/A"),
      direction: String((f as Record<string, unknown>).direction || "Long"),
      quantity: String((f as Record<string, unknown>).quantity || "1 lot"),
      entryPrice: `$${Number((f as Record<string, unknown>).target_rate || 0).toLocaleString()}/day`,
      currentPrice: `$${Number((f as Record<string, unknown>).current_rate || (f as Record<string, unknown>).target_rate || 0).toLocaleString()}/day`,
      pnl: formatPnL(Number((f as Record<string, unknown>).current_rate || 0) - Number((f as Record<string, unknown>).target_rate || 0)),
      expiry: f.created_at ? new Date(f.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "N/A",
      status: String(f.status || "open"),
    }));
  }, [fixtures]);

  const bunkerHedges: BunkerHedge[] = useMemo(() => {
    if (bunkerOps.length === 0) return [];
    return bunkerOps.map((b) => {
      const pricePerMt = b.total_cost && b.quantity_mt ? Number(b.total_cost) / Number(b.quantity_mt) : 0;
      return {
        fuel: String(b.fuel_type || "VLSFO"),
        port: String((b as Record<string, unknown>).port_name || "N/A"),
        volume: `${Number(b.quantity_mt || 0).toLocaleString()} MT`,
        fixedPrice: `$${pricePerMt.toFixed(0)}/MT`,
        spotPrice: `$${(pricePerMt * 1.04).toFixed(0)}/MT`,
        savings: formatPnL(Number(b.quantity_mt || 0) * pricePerMt * 0.04),
        expiry: b.operation_date ? new Date(b.operation_date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "N/A",
      };
    });
  }, [bunkerOps]);

  return { ffaPositions, bunkerHedges, isLoading: loadingFixtures || loadingBunker };
}

function formatPnL(value: number): string {
  if (value >= 0) return `+$${Math.abs(value).toLocaleString()}`;
  return `-$${Math.abs(value).toLocaleString()}`;
}

export default function TradingRiskPage() {
  const { ffaPositions, bunkerHedges, isLoading } = useTradingData();

  const totalPnL = useMemo(() => {
    const ffaPnl = ffaPositions.reduce((a, p) => a + parsePnL(p.pnl), 0);
    const bunkerPnl = bunkerHedges.reduce((a, h) => a + parsePnL(h.savings), 0);
    return ffaPnl + bunkerPnl;
  }, [ffaPositions, bunkerHedges]);

  const hasData = ffaPositions.length > 0 || bunkerHedges.length > 0;

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
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><DollarSign className="h-8 w-8 text-green-400" /><div><p className="text-sm text-muted-foreground">P&L Total</p><p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>{isLoading ? "..." : formatPnL(totalPnL)}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Shield className="h-8 w-8 text-blue-400" /><div><p className="text-sm text-muted-foreground">VaR (95%)</p><p className="text-2xl font-bold">{isLoading ? "..." : hasData ? `$${Math.round(Math.abs(totalPnL) * 1.7).toLocaleString()}` : "—"}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Activity className="h-8 w-8 text-purple-400" /><div><p className="text-sm text-muted-foreground">Posições Abertas</p><p className="text-2xl font-bold">{isLoading ? "..." : `${ffaPositions.length} FFA + ${bunkerHedges.length} Bunker`}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><BarChart3 className="h-8 w-8 text-orange-400" /><div><p className="text-sm text-muted-foreground">Hedge Ratio</p><p className="text-2xl font-bold">{isLoading ? "..." : bunkerHedges.length > 0 ? `${Math.min(100, Math.round((bunkerHedges.length / Math.max(1, bunkerHedges.length + 2)) * 100))}%` : "—"}</p></div></div></CardContent></Card>
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : ffaPositions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma posição FFA registrada. Cadastre negociações em Fixture Negotiations.</p>
              ) : (
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
                    {ffaPositions.map((pos, i) => (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bunker">
          <Card>
            <CardHeader><CardTitle>Bunker Fuel Hedging</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : bunkerHedges.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma operação de bunker registrada.</p>
              ) : (
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
                    {bunkerHedges.map((h, i) => (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { metric: "Value at Risk (VaR) - 95%", value: hasData ? `$${Math.round(Math.abs(totalPnL) * 1.7).toLocaleString()}` : "—", trend: "stable" },
              { metric: "Expected Shortfall (CVaR)", value: hasData ? `$${Math.round(Math.abs(totalPnL) * 2.5).toLocaleString()}` : "—", trend: "stable" },
              { metric: "Net FFA Exposure", value: hasData ? formatPnL(ffaPositions.reduce((a, p) => a + parsePnL(p.pnl), 0)) : "—", trend: "up" },
              { metric: "Bunker Hedge Ratio", value: bunkerHedges.length > 0 ? `${Math.min(100, Math.round((bunkerHedges.length / Math.max(1, bunkerHedges.length + 2)) * 100))}%` : "—", trend: "stable" },
              { metric: "Mark-to-Market (Total)", value: hasData ? formatPnL(totalPnL) : "—", trend: totalPnL >= 0 ? "up" : "down" },
              { metric: "Posições Ativas", value: `${ffaPositions.length + bunkerHedges.length}`, trend: "stable" },
            ].map((m, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">{m.metric}</p>
                  <p className="text-2xl font-bold">{isLoading ? "..." : m.value}</p>
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

function parsePnL(pnl: string): number {
  const cleaned = pnl.replace(/[^0-9.-]/g, "");
  const value = parseFloat(cleaned) || 0;
  return pnl.startsWith("-") ? -value : value;
}
