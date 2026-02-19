/**
 * Market Intelligence Panel — Baltic Indices, TCE Benchmarks, Freight Routes, Bunker Prices
 * Fecha o gap #1: Voyage Market Data (vs Veson)
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Minus, BarChart3, Fuel, Globe, RefreshCw, Anchor } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend, Cell } from 'recharts';
import { toast } from 'sonner';
import {
  getBalticIndices, getMarketTCEBenchmarks, getFreightRoutes, getBunkerPrices,
  type BalticIndexData, type MarketTCEBenchmark, type FreightRouteData, type BunkerPriceData,
} from '@/lib/maritime/market-intelligence';

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-success" />;
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export function MarketIntelligencePanel() {
  const [tab, setTab] = useState('baltic');
  const indices = useMemo(() => getBalticIndices(), []);
  const benchmarks = useMemo(() => getMarketTCEBenchmarks(), []);
  const routes = useMemo(() => getFreightRoutes(), []);
  const bunkers = useMemo(() => getBunkerPrices(), []);

  const exportCSV = () => {
    const csv = ['Index,Code,Current,Change,Change%,WeekAgo,MonthAgo,YearAgo,Trend,Seasonality',
      ...indices.map(i => `${i.index},${i.code},${i.current},${i.change},${i.changePct},${i.weekAgo},${i.monthAgo},${i.yearAgo},${i.trend},${i.seasonality}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `market-intelligence-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Market data exportado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> Market Intelligence
          </h3>
          <p className="text-sm text-muted-foreground">Baltic Indices • TCE Benchmarks • Freight Routes • Bunker Prices — Dados estimados da indústria</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> Export</Button>
          <Badge variant="outline" className="text-xs">Atualização diária estimada</Badge>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="baltic" className="gap-1"><BarChart3 className="h-3.5 w-3.5" /> Baltic Index</TabsTrigger>
          <TabsTrigger value="tce" className="gap-1"><Anchor className="h-3.5 w-3.5" /> TCE Benchmark</TabsTrigger>
          <TabsTrigger value="freight" className="gap-1"><Globe className="h-3.5 w-3.5" /> Freight Routes</TabsTrigger>
          <TabsTrigger value="bunker" className="gap-1"><Fuel className="h-3.5 w-3.5" /> Bunker Prices</TabsTrigger>
        </TabsList>

        {/* BALTIC INDICES */}
        <TabsContent value="baltic" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {indices.slice(0, 4).map(idx => (
              <Card key={idx.code} className={idx.trend === 'up' ? 'border-success/30' : idx.trend === 'down' ? 'border-destructive/30' : ''}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{idx.code}</p>
                  <p className="text-2xl font-bold">{idx.current.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendIcon trend={idx.trend} />
                    <span className={`text-sm font-medium ${idx.changePct > 0 ? 'text-success' : idx.changePct < 0 ? 'text-destructive' : ''}`}>
                      {idx.changePct > 0 ? '+' : ''}{idx.changePct}%
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-2">{idx.seasonality}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Baltic Indices Overview</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={indices}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="code" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" name="Current" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                  <Bar dataKey="monthAgo" name="30d ago" fill="hsl(var(--muted-foreground))" opacity={0.4} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4">Index</th><th className="text-left py-3 px-4">Code</th>
                    <th className="text-right py-3 px-4">Current</th><th className="text-right py-3 px-4">Δ Week</th>
                    <th className="text-right py-3 px-4">Δ%</th><th className="text-right py-3 px-4">Month Ago</th>
                    <th className="text-right py-3 px-4">Year Ago</th><th className="text-center py-3 px-4">Forecast 30d</th>
                    <th className="text-center py-3 px-4">Season</th>
                  </tr></thead>
                  <tbody>
                    {indices.map(idx => (
                      <tr key={idx.code} className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">{idx.index}</td>
                        <td className="py-3 px-4"><Badge variant="outline" className="text-xs">{idx.code}</Badge></td>
                        <td className="py-3 px-4 text-right font-bold">{idx.current.toLocaleString()}</td>
                        <td className={`py-3 px-4 text-right ${idx.change > 0 ? 'text-success' : idx.change < 0 ? 'text-destructive' : ''}`}>
                          {idx.change > 0 ? '+' : ''}{idx.change}
                        </td>
                        <td className={`py-3 px-4 text-right font-medium ${idx.changePct > 0 ? 'text-success' : idx.changePct < 0 ? 'text-destructive' : ''}`}>
                          {idx.changePct > 0 ? '+' : ''}{idx.changePct}%
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{idx.monthAgo.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{idx.yearAgo.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">{idx.forecastNext30d.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={idx.seasonality === 'Peak Season' ? 'default' : idx.seasonality === 'Low Season' ? 'secondary' : 'outline'} className="text-[10px]">
                            {idx.seasonality}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TCE BENCHMARKS */}
        <TabsContent value="tce" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Market TCE Rates by Vessel Type</CardTitle>
              <CardDescription>Spot rates, period rates, supply/demand indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={benchmarks}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="vesselType" fontSize={10} angle={-20} textAnchor="end" height={60} />
                  <YAxis fontSize={11} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}/day`} />
                  <Legend />
                  <Bar dataKey="spotRate" name="Spot" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                  <Bar dataKey="periodRate1yr" name="1yr Period" fill="hsl(210,70%,55%)" radius={[4,4,0,0]} />
                  <Bar dataKey="periodRate3yr" name="3yr Period" fill="hsl(160,60%,45%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4">Vessel</th><th className="text-left py-3 px-4">Size</th>
                    <th className="text-right py-3 px-4">Spot $/d</th><th className="text-right py-3 px-4">1yr $/d</th>
                    <th className="text-right py-3 px-4">3yr $/d</th><th className="text-center py-3 px-4">Supply</th>
                    <th className="text-center py-3 px-4">Demand %</th><th className="text-center py-3 px-4">Orderbook %</th>
                  </tr></thead>
                  <tbody>
                    {benchmarks.map(b => (
                      <tr key={b.vesselType} className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">{b.vesselType}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{b.size}</td>
                        <td className="py-3 px-4 text-right font-bold text-primary">${b.spotRate.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">${b.periodRate1yr.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">${b.periodRate3yr.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">{b.supply.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={b.demand >= 90 ? 'default' : b.demand >= 80 ? 'secondary' : 'outline'} className="text-xs">{b.demand}%</Badge>
                        </td>
                        <td className="py-3 px-4 text-center text-xs">{b.orderbook}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FREIGHT ROUTES */}
        <TabsContent value="freight" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4">Route</th><th className="text-left py-3 px-4">Code</th>
                    <th className="text-left py-3 px-4">Size</th><th className="text-right py-3 px-4">Current</th>
                    <th className="text-right py-3 px-4">Δ 7d</th><th className="text-right py-3 px-4">Δ 30d</th>
                    <th className="text-right py-3 px-4">52w High</th><th className="text-right py-3 px-4">52w Low</th>
                    <th className="text-center py-3 px-4">Season</th>
                  </tr></thead>
                  <tbody>
                    {routes.map(r => (
                      <tr key={r.code} className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">{r.route}</td>
                        <td className="py-3 px-4"><Badge variant="outline" className="text-xs">{r.code}</Badge></td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{r.size}</td>
                        <td className="py-3 px-4 text-right font-bold">{r.unit === '$/day' ? `$${r.currentRate.toLocaleString()}` : `$${r.currentRate}`}{r.unit === '$/MT' ? '/MT' : '/d'}</td>
                        <td className={`py-3 px-4 text-right ${r.change7d > 0 ? 'text-success' : r.change7d < 0 ? 'text-destructive' : ''}`}>
                          {r.change7d > 0 ? '+' : ''}{r.unit === '$/day' ? `$${r.change7d.toLocaleString()}` : `$${r.change7d}`}
                        </td>
                        <td className={`py-3 px-4 text-right ${r.change30d > 0 ? 'text-success' : r.change30d < 0 ? 'text-destructive' : ''}`}>
                          {r.change30d > 0 ? '+' : ''}{r.unit === '$/day' ? `$${r.change30d.toLocaleString()}` : `$${r.change30d}`}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{r.unit === '$/day' ? `$${r.high52w.toLocaleString()}` : `$${r.high52w}`}</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{r.unit === '$/day' ? `$${r.low52w.toLocaleString()}` : `$${r.low52w}`}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={r.seasonal === 'peak' ? 'default' : r.seasonal === 'trough' ? 'destructive' : 'outline'} className="text-[10px]">
                            {r.seasonal === 'peak' ? '🔥 Peak' : r.seasonal === 'trough' ? '📉 Trough' : 'Normal'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BUNKER PRICES */}
        <TabsContent value="bunker" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Global Bunker Prices ($/MT)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bunkers}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="port" fontSize={10} />
                  <YAxis fontSize={11} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip formatter={(v: number) => `$${v}/MT`} />
                  <Legend />
                  <Bar dataKey="vlsfo" name="VLSFO" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                  <Bar dataKey="hsfo" name="HSFO" fill="hsl(35,80%,55%)" radius={[4,4,0,0]} />
                  <Bar dataKey="mgo" name="MGO" fill="hsl(160,60%,45%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left py-3 px-4">Port</th>
                    <th className="text-right py-3 px-4">VLSFO</th><th className="text-right py-3 px-4">HSFO</th>
                    <th className="text-right py-3 px-4">MGO</th><th className="text-right py-3 px-4">LNG</th>
                    <th className="text-right py-3 px-4">Δ VLSFO 7d</th><th className="text-right py-3 px-4">Spread V/H</th>
                  </tr></thead>
                  <tbody>
                    {bunkers.map(b => (
                      <tr key={b.port} className="border-b hover:bg-muted/20">
                        <td className="py-3 px-4 font-medium">{b.port}</td>
                        <td className="py-3 px-4 text-right font-bold">${b.vlsfo}</td>
                        <td className="py-3 px-4 text-right">${b.hsfo}</td>
                        <td className="py-3 px-4 text-right">${b.mgo}</td>
                        <td className="py-3 px-4 text-right text-muted-foreground">{b.lng ? `$${b.lng}` : '—'}</td>
                        <td className={`py-3 px-4 text-right ${b.changeVlsfo7d > 0 ? 'text-destructive' : 'text-success'}`}>
                          {b.changeVlsfo7d > 0 ? '+' : ''}${b.changeVlsfo7d}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">${b.spreadVlsfoHsfo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MarketIntelligencePanel;
