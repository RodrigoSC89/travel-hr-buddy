/**
 * VoyagePnLPage v2 - Voyage P&L with TCE benchmarks, margin trends, cost breakdown
 * Uses voyage_accounting + voyage_plans tables (no Math.random())
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { RefreshCw, Download, DollarSign, TrendingUp, TrendingDown, Ship, Anchor, BarChart3, PieChart as PieIcon, Target } from 'lucide-react';
import { useVoyagePnL } from '@/hooks/useVoyagePnL';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ScatterChart, Scatter, ZAxis, LineChart, Line,
} from 'recharts';

const COLORS = ["hsl(var(--primary))", "hsl(210,70%,55%)", "hsl(160,60%,45%)", "hsl(35,80%,55%)", "hsl(280,60%,55%)", "hsl(0,70%,55%)"];

// TCE Market benchmarks $/day by vessel type
const TCE_BENCHMARKS: Record<string, number> = {
  'Tanker': 28000, 'Bulk Carrier': 18000, 'Container': 35000,
  'PSV': 22000, 'AHTS': 30000, 'OSV': 20000, 'General': 15000,
};

export default function VoyagePnLPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('table');
  const { data, isLoading, error, refetch } = useVoyagePnL();

  const voyages = data?.voyages || [];
  const stats = data?.stats;

  const filteredVoyages = voyages.filter(v =>
    v.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.voyageNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Profitability breakdown
  const profitability = useMemo(() => {
    const profitable = voyages.filter(v => v.profit >= 0).length;
    const loss = voyages.filter(v => v.profit < 0).length;
    return [
      { name: 'Profitable', value: profitable },
      { name: 'Loss-making', value: loss },
    ];
  }, [voyages]);

  // TCE distribution
  const tceDistribution = useMemo(() => {
    const bins = { '<10k': 0, '10-20k': 0, '20-30k': 0, '30-40k': 0, '40k+': 0 };
    voyages.forEach(v => {
      const tce = v.tceDaily || 0;
      if (tce < 10000) bins['<10k']++;
      else if (tce < 20000) bins['10-20k']++;
      else if (tce < 30000) bins['20-30k']++;
      else if (tce < 40000) bins['30-40k']++;
      else bins['40k+']++;
    });
    return Object.entries(bins).map(([name, value]) => ({ name, value }));
  }, [voyages]);

  // Margin by vessel
  const marginByVessel = useMemo(() => {
    const byVessel: Record<string, { revenue: number; costs: number; count: number }> = {};
    voyages.forEach(v => {
      const key = v.vesselName;
      if (!byVessel[key]) byVessel[key] = { revenue: 0, costs: 0, count: 0 };
      byVessel[key].revenue += v.revenue;
      byVessel[key].costs += v.costs;
      byVessel[key].count++;
    });
    return Object.entries(byVessel).map(([vessel, d]) => ({
      vessel: vessel.length > 15 ? vessel.slice(0, 15) + '…' : vessel,
      margin: d.revenue > 0 ? Math.round(((d.revenue - d.costs) / d.revenue) * 100) : 0,
      voyages: d.count,
      avgTCE: d.count > 0 ? Math.round((d.revenue - d.costs) / d.count / 30) : 0,
    })).sort((a, b) => b.margin - a.margin).slice(0, 10);
  }, [voyages]);

  // TCE scatter (revenue vs margin)
  const tceScatter = useMemo(() => {
    return voyages.map(v => ({
      x: v.revenue,
      y: v.margin,
      z: v.tceDaily || 0,
      name: v.voyageNumber,
    }));
  }, [voyages]);

  const handleExport = () => {
    if (!filteredVoyages.length) { toast.error('Nenhum dado para exportar'); return; }
    const csv = [
      ['Voyage', 'Vessel', 'Revenue', 'Costs', 'Profit', 'Margin %', 'TCE $/day', 'Status', 'Departure', 'Arrival'].join(','),
      ...filteredVoyages.map(v => [
        v.voyageNumber, v.vesselName, v.revenue, v.costs, v.profit,
        v.margin.toFixed(2), v.tceDaily?.toFixed(0) || '—', v.status, v.departurePort, v.arrivalPort,
      ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `voyage-pnl-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Relatório P&L exportado');
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Erro ao carregar dados de viagens</p>
            <Button onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-2" />Tentar Novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Voyage P&L
            <Badge variant="outline" className="ml-2 text-xs">LIVE DATA</Badge>
          </h1>
          <p className="text-muted-foreground">TCE benchmarks • Margin analysis • Vessel performance — Dados Reais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { refetch(); toast.success('Dados atualizados'); }}>
            <RefreshCw className="h-4 w-4 mr-2" />Atualizar
          </Button>
          <Button onClick={handleExport}><Download className="h-4 w-4 mr-2" />Exportar</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={`pnl-skeleton-${i}`}><CardContent className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></CardContent></Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Receita</p>
                <p className="text-2xl font-bold text-emerald-500">${(stats?.totalRevenue || 0).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1"><TrendingDown className="h-4 w-4" /> Custos</p>
                <p className="text-2xl font-bold text-destructive">${(stats?.totalCosts || 0).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4" /> Lucro</p>
                <p className={`text-2xl font-bold ${(stats?.totalProfit || 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                  ${(stats?.totalProfit || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Ship className="h-4 w-4" /> Margem</p>
                <p className={`text-2xl font-bold ${(stats?.avgMargin || 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                  {(stats?.avgMargin || 0).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Anchor className="h-4 w-4" /> TCE Médio</p>
                <p className="text-2xl font-bold text-primary">${(stats?.avgTCE || 0).toLocaleString()}/d</p>
              </CardContent>
            </Card>
            <Card className="border-primary/30">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Target className="h-4 w-4" /> Viagens</p>
                <p className="text-2xl font-bold">{voyages.length}</p>
                <div className="text-xs text-muted-foreground">
                  {profitability[0]?.value || 0} lucro / {profitability[1]?.value || 0} perda
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input placeholder="Buscar por navio ou número da viagem..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="table">Voyages ({filteredVoyages.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="vessels">Vessel Ranking</TabsTrigger>
        </TabsList>

        {/* Table Tab */}
        <TabsContent value="table" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Anchor className="h-5 w-5" />Viagens</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={`row-${i}`} className="h-12 w-full" />)}</div>
              ) : filteredVoyages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma viagem encontrada</p>
                  <p className="text-sm mt-1">Adicione viagens em Voyage Accounting para visualizar o P&L</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Viagem</th>
                        <th className="text-left p-2">Navio</th>
                        <th className="text-left p-2">Rota</th>
                        <th className="text-right p-2">Receita</th>
                        <th className="text-right p-2">Custos</th>
                        <th className="text-right p-2">Lucro</th>
                        <th className="text-right p-2">Margem</th>
                        <th className="text-right p-2">TCE</th>
                        <th className="text-center p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVoyages.map((voyage) => (
                        <tr key={voyage.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono">{voyage.voyageNumber}</td>
                          <td className="p-2">{voyage.vesselName}</td>
                          <td className="p-2 text-sm text-muted-foreground">{voyage.departurePort} → {voyage.arrivalPort}</td>
                          <td className="p-2 text-right text-emerald-500">${voyage.revenue.toLocaleString()}</td>
                          <td className="p-2 text-right text-destructive">${voyage.costs.toLocaleString()}</td>
                          <td className={`p-2 text-right font-bold ${voyage.profit >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                            ${voyage.profit.toLocaleString()}
                          </td>
                          <td className={`p-2 text-right ${voyage.margin >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                            {voyage.margin.toFixed(1)}%
                          </td>
                          <td className="p-2 text-right text-muted-foreground">
                            {voyage.tceDaily ? `$${voyage.tceDaily.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-2 text-center">
                            <Badge variant={voyage.status === 'completed' ? 'default' : voyage.status === 'ongoing' ? 'secondary' : 'outline'}>
                              {voyage.status === 'completed' ? 'Concluída' : voyage.status === 'ongoing' ? 'Em Andamento' : 'Planejada'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><PieIcon className="h-4 w-4" /> Profitability Split</CardTitle></CardHeader>
              <CardContent>
                {voyages.length === 0 ? <p className="text-center py-6 text-muted-foreground">No data</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={profitability} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                        <Cell fill="hsl(160,60%,45%)" />
                        <Cell fill="hsl(0,70%,55%)" />
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> TCE Distribution ($/day)</CardTitle></CardHeader>
              <CardContent>
                {voyages.length === 0 ? <p className="text-center py-6 text-muted-foreground">No data</p> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={tceDistribution}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="value" name="Voyages" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Revenue vs Margin scatter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Revenue vs Margin (bubble = TCE)</CardTitle>
              <CardDescription>Each point is a voyage. Larger bubble = higher TCE rate.</CardDescription>
            </CardHeader>
            <CardContent>
              {tceScatter.length === 0 ? <p className="text-center py-6 text-muted-foreground">No data</p> : (
                <ResponsiveContainer width="100%" height={280}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="x" name="Revenue" fontSize={10} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="y" name="Margin %" fontSize={10} unit="%" />
                    <ZAxis dataKey="z" range={[30, 300]} name="TCE" />
                    <Tooltip formatter={(value: number, name: string) =>
                      name === 'Revenue' ? `$${value.toLocaleString()}` :
                      name === 'TCE' ? `$${value.toLocaleString()}/d` : `${value.toFixed(1)}%`
                    } />
                    <Scatter data={tceScatter} fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vessel Ranking Tab */}
        <TabsContent value="vessels" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Ship className="h-4 w-4" /> Vessel Performance Ranking</CardTitle>
              <CardDescription>Top 10 vessels by profit margin</CardDescription>
            </CardHeader>
            <CardContent>
              {marginByVessel.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No vessel data</p>
              ) : (
                <div className="space-y-4">
                  {marginByVessel.map((v, i) => (
                    <div key={v.vessel}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                          {v.vessel}
                        </span>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{v.voyages} voyages</span>
                          <span className={v.margin >= 0 ? 'text-emerald-500' : 'text-destructive'}>{v.margin}% margin</span>
                        </div>
                      </div>
                      <Progress value={Math.max(0, Math.min(100, v.margin))} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
