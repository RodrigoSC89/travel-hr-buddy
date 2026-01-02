import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, Ship, Calendar, Target, 
  BarChart3, Activity, Filter, Download
} from 'lucide-react';
import { useOVIDInspection, OVIDInspection } from '@/hooks/useOVIDInspection';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ComposedChart, Bar,
  ReferenceLine, Legend
} from 'recharts';
import { format, subMonths, subYears, isAfter, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type PeriodFilter = '3m' | '6m' | '1y' | '2y' | 'all';

interface OVIDHistoricalEvolutionProps {
  initialVessel?: string;
}

export const OVIDHistoricalEvolution: React.FC<OVIDHistoricalEvolutionProps> = ({
  initialVessel,
}) => {
  const [inspections, setInspections] = useState<OVIDInspection[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>(initialVessel || 'all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('1y');
  const [isLoading, setIsLoading] = useState(true);
  const { loadHistory } = useOVIDInspection();

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadHistory();
      setInspections(data);
      setIsLoading(false);
    };
    fetchData();
  }, [loadHistory]);

  // Unique vessels
  const vessels = useMemo(() => [...new Set(inspections.map(i => i.vessel_name))], [inspections]);

  // Filter by period
  const getFilterDate = (filter: PeriodFilter): Date | null => {
    const now = new Date();
    switch (filter) {
      case '3m': return subMonths(now, 3);
      case '6m': return subMonths(now, 6);
      case '1y': return subYears(now, 1);
      case '2y': return subYears(now, 2);
      default: return null;
    }
  };

  // Filtered inspections
  const filteredInspections = useMemo(() => {
    let result = selectedVessel === 'all' 
      ? inspections 
      : inspections.filter(i => i.vessel_name === selectedVessel);

    const filterDate = getFilterDate(periodFilter);
    if (filterDate) {
      result = result.filter(i => isAfter(parseISO(i.inspection_date), filterDate));
    }

    return result.sort((a, b) => 
      new Date(a.inspection_date).getTime() - new Date(b.inspection_date).getTime()
    );
  }, [inspections, selectedVessel, periodFilter]);

  // Chart data
  const chartData = useMemo(() => {
    return filteredInspections.map(i => ({
      date: format(parseISO(i.inspection_date), 'dd/MM/yy', { locale: ptBR }),
      fullDate: format(parseISO(i.inspection_date), 'dd MMM yyyy', { locale: ptBR }),
      vessel: i.vessel_name,
      score: i.compliance_score,
      compliant: i.compliant_count,
      nonCompliant: i.non_compliant_count,
      target: 85, // Compliance target
    }));
  }, [filteredInspections]);

  // Statistics
  const stats = useMemo(() => {
    if (filteredInspections.length === 0) return null;

    const scores = filteredInspections.map(i => i.compliance_score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const latest = scores[scores.length - 1];
    const first = scores[0];
    const trend = latest - first;

    return { avg, max, min, latest, trend, count: filteredInspections.length };
  }, [filteredInspections]);

  // Moving average calculation
  const chartDataWithMA = useMemo(() => {
    const windowSize = 3;
    return chartData.map((item, index) => {
      if (index < windowSize - 1) {
        return { ...item, movingAvg: null };
      }
      const sum = chartData
        .slice(index - windowSize + 1, index + 1)
        .reduce((acc, curr) => acc + curr.score, 0);
      return { ...item, movingAvg: Math.round(sum / windowSize) };
    });
  }, [chartData]);

  const periodOptions = [
    { value: '3m', label: '3 Meses' },
    { value: '6m', label: '6 Meses' },
    { value: '1y', label: '1 Ano' },
    { value: '2y', label: '2 Anos' },
    { value: 'all', label: 'Todo Período' },
  ];

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3">
          <Activity className="w-6 h-6 animate-pulse text-primary" />
          <span>Carregando dados históricos...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Evolução Histórica de Score
          </h3>
          <p className="text-sm text-muted-foreground">
            Análise temporal do desempenho em inspeções OVID
          </p>
        </div>
        <div className="flex gap-2">
          {periodOptions.map(opt => (
            <Button
              key={opt.value}
              variant={periodFilter === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodFilter(opt.value as PeriodFilter)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Vessel Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-primary" />
              <span className="font-medium">Embarcação:</span>
            </div>
            <Select value={selectedVessel} onValueChange={setSelectedVessel}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecione uma embarcação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Embarcações</SelectItem>
                {vessels.map(v => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {stats && (
              <div className="flex items-center gap-4 ml-auto text-sm">
                <Badge variant="outline">
                  {stats.count} inspeções no período
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Score Médio</p>
                <p className={`text-2xl font-bold ${
                  stats.avg >= 85 ? 'text-green-500' : 
                  stats.avg >= 70 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {stats.avg}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Último Score</p>
                <p className={`text-2xl font-bold ${
                  stats.latest >= 85 ? 'text-green-500' : 
                  stats.latest >= 70 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {stats.latest}%
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Máximo</p>
                <p className="text-2xl font-bold text-green-500">{stats.max}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Mínimo</p>
                <p className="text-2xl font-bold text-red-500">{stats.min}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className={stats.trend >= 0 ? 'border-green-500/30' : 'border-red-500/30'}>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Tendência</p>
                <div className="flex items-center justify-center gap-1">
                  <p className={`text-2xl font-bold ${stats.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stats.trend > 0 ? '+' : ''}{stats.trend}
                  </p>
                  {stats.trend > 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : stats.trend < 0 ? (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="evolution">Evolução</TabsTrigger>
          <TabsTrigger value="trend">Com Tendência</TabsTrigger>
          <TabsTrigger value="detail">Detalhado</TabsTrigger>
        </TabsList>

        <TabsContent value="evolution">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Evolução do Score de Conformidade
              </CardTitle>
              <CardDescription>
                {selectedVessel === 'all' ? 'Todas as embarcações' : selectedVessel} - {periodOptions.find(p => p.value === periodFilter)?.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        `${value}%`,
                        name === 'score' ? 'Score' : name
                      ]}
                      labelFormatter={(label) => chartData.find(d => d.date === label)?.fullDate || label}
                    />
                    <ReferenceLine y={85} stroke="hsl(142, 76%, 36%)" strokeDasharray="5 5" label={{ value: 'Meta 85%', position: 'right', className: 'text-xs fill-green-500' }} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="url(#scoreGradient)"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  Nenhuma inspeção encontrada para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Score com Média Móvel
              </CardTitle>
              <CardDescription>
                Linha de tendência com média móvel de 3 inspeções
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartDataWithMA.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartDataWithMA}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <ReferenceLine y={85} stroke="hsl(142, 76%, 36%)" strokeDasharray="5 5" />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAvg"
                      name="Média Móvel"
                      stroke="hsl(45, 93%, 47%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  Nenhuma inspeção encontrada para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Análise Detalhada
              </CardTitle>
              <CardDescription>
                Score vs Não Conformidades por inspeção
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis yAxisId="left" domain={[0, 100]} className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <ReferenceLine yAxisId="left" y={85} stroke="hsl(142, 76%, 36%)" strokeDasharray="5 5" />
                    <Bar
                      yAxisId="right"
                      dataKey="nonCompliant"
                      name="Não Conformidades"
                      fill="hsl(0, 84%, 60%)"
                      opacity={0.6}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="score"
                      name="Score (%)"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  Nenhuma inspeção encontrada para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      {stats && filteredInspections.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 Insights Automáticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">Desempenho Geral</p>
                <p className="text-muted-foreground">
                  {stats.avg >= 85 
                    ? 'Excelente desempenho! Score médio acima da meta de 85%.' 
                    : stats.avg >= 70 
                    ? 'Bom desempenho, mas há espaço para melhorias até atingir a meta de 85%.'
                    : 'Atenção necessária! Score médio abaixo de 70% indica necessidade de ações corretivas.'}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">Tendência</p>
                <p className="text-muted-foreground">
                  {stats.trend > 5 
                    ? `Tendência positiva de ${stats.trend} pontos. Continue com as boas práticas!` 
                    : stats.trend < -5 
                    ? `Tendência negativa de ${Math.abs(stats.trend)} pontos. Recomenda-se revisão dos processos.`
                    : 'Desempenho estável ao longo do período analisado.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
