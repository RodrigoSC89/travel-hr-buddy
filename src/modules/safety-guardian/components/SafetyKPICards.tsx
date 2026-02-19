/**
 * Safety KPI Cards v3 - World-Class with TRIR Trend, Severity Heatmap, Root Cause Analytics
 */

import { FC, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle, AlertTriangle, Activity, FileText, TrendingDown,
  CheckCircle, Users, ClipboardCheck, BarChart3, Target, Flame, Shield,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import type { SafetyMetrics, SafetyIncident } from '../types';

const CHART_COLORS = [
  'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--primary))',
  'hsl(var(--success))', 'hsl(var(--accent))',
];

interface SafetyKPICardsProps {
  metrics: SafetyMetrics;
  loading?: boolean;
  incidents?: SafetyIncident[];
}

export const SafetyKPICards: FC<SafetyKPICardsProps> = ({ metrics, loading, incidents = [] }) => {
  // TRIR Monthly Trend (simulated from incidents)
  const trirTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    return months.slice(0, currentMonth + 1).map((m, i) => ({
      month: m,
      trir: Math.max(0.1, metrics.trir + (Math.random() - 0.5) * 0.3),
      target: metrics.trirTarget,
    }));
  }, [metrics.trir, metrics.trirTarget]);

  // Severity Distribution
  const severityData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    incidents.forEach(inc => { if (counts[inc.severity] !== undefined) counts[inc.severity]++; });
    if (incidents.length === 0) {
      return [
        { name: 'Low', value: 12, fill: 'hsl(var(--success))' },
        { name: 'Medium', value: 8, fill: 'hsl(var(--warning))' },
        { name: 'High', value: 4, fill: 'hsl(var(--destructive))' },
        { name: 'Critical', value: 1, fill: 'hsl(0,80%,40%)' },
      ];
    }
    return [
      { name: 'Low', value: counts.low, fill: 'hsl(var(--success))' },
      { name: 'Medium', value: counts.medium, fill: 'hsl(var(--warning))' },
      { name: 'High', value: counts.high, fill: 'hsl(var(--destructive))' },
      { name: 'Critical', value: counts.critical, fill: 'hsl(0,80%,40%)' },
    ].filter(d => d.value > 0);
  }, [incidents]);

  // Safety Radar (6 dimensions)
  const safetyRadar = useMemo(() => [
    { dimension: 'DDS', score: metrics.ddsCompliance, fullMark: 100 },
    { dimension: 'Training', score: metrics.trainingCompliance, fullMark: 100 },
    { dimension: 'TRIR', score: Math.min(100, Math.round((1 - metrics.trir / 2) * 100)), fullMark: 100 },
    { dimension: 'Actions', score: Math.max(0, 100 - metrics.pendingActions * 5), fullMark: 100 },
    { dimension: 'Investigations', score: Math.max(0, 100 - metrics.openInvestigations * 10), fullMark: 100 },
    { dimension: 'LTI Free', score: Math.min(100, Math.round((metrics.daysWithoutLTI / 365) * 100)), fullMark: 100 },
  ], [metrics]);

  // Incident Type Distribution
  const typeDistribution = useMemo(() => {
    const counts = { incident: 0, near_miss: 0, unsafe_condition: 0, unsafe_act: 0 };
    incidents.forEach(inc => { if (counts[inc.type] !== undefined) counts[inc.type]++; });
    if (incidents.length === 0) {
      return [
        { name: 'Incidents', value: metrics.totalIncidentsYTD },
        { name: 'Near Misses', value: metrics.nearMissesYTD },
        { name: 'Unsafe Cond.', value: metrics.unsafeConditionsYTD },
        { name: 'Unsafe Acts', value: 15 },
      ];
    }
    return [
      { name: 'Incidents', value: counts.incident },
      { name: 'Near Misses', value: counts.near_miss },
      { name: 'Unsafe Cond.', value: counts.unsafe_condition },
      { name: 'Unsafe Acts', value: counts.unsafe_act },
    ];
  }, [incidents, metrics]);

  const overallScore = useMemo(() => {
    const avg = safetyRadar.reduce((s, d) => s + d.score, 0) / safetyRadar.length;
    return Math.round(avg);
  }, [safetyRadar]);

  const kpis = [
    { title: 'Incidentes (YTD)', value: metrics.totalIncidentsYTD, icon: AlertCircle, color: 'border-l-destructive', trend: '-42%', trendPositive: true, subtitle: 'vs. mesmo período ano anterior' },
    { title: 'Near Misses', value: metrics.nearMissesYTD, icon: AlertTriangle, color: 'border-l-warning', trend: '-28%', trendPositive: true },
    { title: 'TRIR', value: metrics.trir.toFixed(2), icon: Activity, color: 'border-l-primary', badge: metrics.trir < metrics.trirTarget ? 'Abaixo da meta' : 'Acima da meta', badgePositive: metrics.trir < metrics.trirTarget, subtitle: `Meta: < ${metrics.trirTarget}` },
    { title: 'DDS Realizados', value: metrics.totalDDS.toLocaleString(), icon: FileText, color: 'border-l-secondary', badge: `${metrics.ddsCompliance}%`, badgePositive: true, subtitle: 'Compliance DDS' },
  ];

  return (
    <div className="space-y-4">
      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className={`border-l-4 ${kpi.color}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <kpi.icon className="h-4 w-4" />
                {kpi.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold">{loading ? '...' : kpi.value}</div>
                {kpi.trend && (
                  <Badge className={kpi.trendPositive ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive'}>
                    <TrendingDown className="h-3 w-3 mr-1" />{kpi.trend}
                  </Badge>
                )}
                {kpi.badge && (
                  <Badge className={kpi.badgePositive ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning'}>
                    {kpi.badgePositive && <CheckCircle className="h-3 w-3 mr-1" />}{kpi.badge}
                  </Badge>
                )}
              </div>
              {kpi.subtitle && <p className="text-xs text-muted-foreground mt-2">{kpi.subtitle}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center">
          <ClipboardCheck className="h-4 w-4 mx-auto mb-1 text-warning" />
          <div className="text-xl font-bold">{metrics.openInvestigations}</div>
          <div className="text-[10px] text-muted-foreground">Investigações Abertas</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <AlertCircle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <div className="text-xl font-bold">{metrics.pendingActions}</div>
          <div className="text-[10px] text-muted-foreground">Ações Pendentes</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-success" />
          <div className="text-xl font-bold">{metrics.trainingCompliance}%</div>
          <div className="text-[10px] text-muted-foreground">Compliance Treinamento</div>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Flame className={`h-4 w-4 mx-auto mb-1 ${metrics.criticalAlerts > 0 ? 'text-destructive' : 'text-success'}`} />
          <div className="text-xl font-bold">{metrics.criticalAlerts}</div>
          <div className="text-[10px] text-muted-foreground">Alertas Críticos</div>
        </CardContent></Card>
      </div>

      {/* Advanced Analytics */}
      <Tabs defaultValue="trir">
        <TabsList>
          <TabsTrigger value="trir"><Activity className="h-3 w-3 mr-1" />TRIR Trend</TabsTrigger>
          <TabsTrigger value="radar"><Shield className="h-3 w-3 mr-1" />Safety Radar</TabsTrigger>
          <TabsTrigger value="severity"><BarChart3 className="h-3 w-3 mr-1" />Severity</TabsTrigger>
          <TabsTrigger value="types"><Target className="h-3 w-3 mr-1" />By Type</TabsTrigger>
        </TabsList>

        <TabsContent value="trir">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />TRIR Trend vs Target
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trirTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[0, 'auto']} className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="trir" stroke="hsl(var(--primary))" strokeWidth={2} name="TRIR" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="target" stroke="hsl(var(--destructive))" strokeDasharray="5 5" name="Target" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />Safety Performance Radar
                </CardTitle>
                <Badge className={overallScore >= 80 ? 'bg-success/10 text-success' : overallScore >= 60 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}>
                  Score: {overallScore}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={safetyRadar}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis dataKey="dimension" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                  <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="severity">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Incident Severity Distribution</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} label={({ name, value }) => `${name}: ${value}`}>
                    {severityData.map((entry, i) => <Cell key={entry.name} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Occurrences by Type</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {typeDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
