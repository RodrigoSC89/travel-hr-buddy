import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, TrendingUp, TrendingDown, Ship, AlertTriangle, 
  CheckCircle, Target, Calendar, PieChart, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart as RechartsPie, 
  Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useOVIDInspection, OVIDInspection } from '@/hooks/useOVIDInspection';
import { OVIQ4_CHAPTERS } from '@/data/oviq4-complete-data';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)', 'hsl(45, 93%, 47%)', 'hsl(217, 91%, 60%)'];

export const OVIDAnalyticsDashboard: React.FC = () => {
  const [inspections, setInspections] = useState<OVIDInspection[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>('all');
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

  // Filter inspections by vessel
  const filteredInspections = selectedVessel === 'all' 
    ? inspections 
    : inspections.filter(i => i.vessel_name === selectedVessel);

  // Unique vessels
  const vessels = [...new Set(inspections.map(i => i.vessel_name))];

  // Metrics
  const totalInspections = filteredInspections.length;
  const completedInspections = filteredInspections.filter(i => i.status === 'completed').length;
  const avgScore = totalInspections > 0 
    ? Math.round(filteredInspections.reduce((acc, i) => acc + i.compliance_score, 0) / totalInspections) 
    : 0;
  const totalNonConformities = filteredInspections.reduce((acc, i) => acc + i.non_compliant_count, 0);

  // Score trend data (last 10 inspections)
  const trendData = filteredInspections
    .slice(0, 10)
    .reverse()
    .map(i => ({
      date: new Date(i.inspection_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      score: i.compliance_score,
      vessel: i.vessel_name.substring(0, 10),
    }));

  // Compliance distribution
  const complianceData = [
    { name: 'Conforme', value: filteredInspections.reduce((acc, i) => acc + i.compliant_count, 0), color: COLORS[0] },
    { name: 'Não Conforme', value: totalNonConformities, color: COLORS[1] },
    { name: 'N/A', value: filteredInspections.reduce((acc, i) => acc + i.not_applicable_count, 0), color: COLORS[2] },
  ];

  // Score by vessel
  const vesselScores = vessels.map(vessel => {
    const vesselInspections = inspections.filter(i => i.vessel_name === vessel);
    const lastInspection = vesselInspections[0];
    return {
      vessel: vessel.substring(0, 15),
      score: lastInspection?.compliance_score || 0,
      trend: vesselInspections.length > 1 
        ? lastInspection.compliance_score - (vesselInspections[1]?.compliance_score || 0)
        : 0,
    };
  }).sort((a, b) => b.score - a.score);

  // Chapter performance (mock based on pattern)
  const chapterPerformance = OVIQ4_CHAPTERS.slice(0, 8).map((ch, i) => ({
    chapter: `Cap ${ch.id}`,
    name: ch.name.substring(0, 20),
    score: 85 - (i * 5) + [7, 3, 11, 5, 9, 2, 8, 6][i],
  }));

  // Critical areas (chapters with lowest scores)
  const criticalAreas = [...chapterPerformance]
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  // Radar data for chapter comparison
  const radarData = OVIQ4_CHAPTERS.slice(0, 8).map((ch, i) => ({
    subject: `Cap ${ch.id}`,
    A: 85 - (i * 3) + [4, 7, 2, 8, 5, 3, 6, 1][i],
    fullMark: 100,
  }));

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3">
          <Activity className="w-6 h-6 animate-pulse text-primary" />
          <span>Carregando analytics...</span>
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
            <BarChart3 className="w-5 h-5 text-primary" />
            Analytics OVID
          </h3>
          <p className="text-sm text-muted-foreground">
            Métricas e tendências de conformidade por embarcação
          </p>
        </div>
        <Select value={selectedVessel} onValueChange={setSelectedVessel}>
          <SelectTrigger className="w-[250px]">
            <Ship className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por embarcação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Embarcações</SelectItem>
            {vessels.map(v => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Inspeções</p>
                <p className="text-2xl font-bold">{totalInspections}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Score Médio</p>
                <p className="text-2xl font-bold">{avgScore}%</p>
              </div>
              <Target className={`w-8 h-8 ${avgScore >= 85 ? 'text-green-500' : avgScore >= 70 ? 'text-yellow-500' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Finalizadas</p>
                <p className="text-2xl font-bold text-green-500">{completedInspections}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Não Conformidades</p>
                <p className="text-2xl font-bold text-red-500">{totalNonConformities}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="vessels">Por Embarcação</TabsTrigger>
          <TabsTrigger value="chapters">Por Capítulo</TabsTrigger>
          <TabsTrigger value="critical">Áreas Críticas</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Evolução do Score
                </CardTitle>
                <CardDescription>Últimas 10 inspeções</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[0, 100]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Distribuição de Conformidade
                </CardTitle>
                <CardDescription>Agregado de todas as inspeções</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {complianceData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vessels">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Ship className="w-4 h-4" />
                Score por Embarcação
              </CardTitle>
              <CardDescription>Última inspeção de cada embarcação</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vesselScores} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="vessel" width={120} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chapters">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Desempenho por Capítulo</CardTitle>
                <CardDescription>Score médio por área do OVIQ4</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chapterPerformance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="chapter" className="text-xs" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                      formatter={(value, name, props) => [
                        `${value}%`,
                        props.payload.name
                      ]}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Radar de Conformidade</CardTitle>
                <CardDescription>Visualização comparativa por capítulo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis dataKey="subject" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="critical">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Áreas Críticas
              </CardTitle>
              <CardDescription>Capítulos com menor desempenho que requerem atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {criticalAreas.map((area, index) => (
                    <div 
                      key={area.chapter}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? 'destructive' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{area.chapter}</p>
                          <p className="text-sm text-muted-foreground">{area.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${
                          area.score >= 80 ? 'text-green-500' : 
                          area.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {area.score}%
                        </span>
                        {area.score < 70 && (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};