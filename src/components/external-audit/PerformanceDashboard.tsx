/**
 * Performance Dashboard - Full Implementation
 * Analytics and metrics for audit performance
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Ship,
  FileText,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const complianceHistory = [
  { month: 'Jul', ism: 92, isps: 88, mlc: 95 },
  { month: 'Ago', ism: 94, isps: 90, mlc: 96 },
  { month: 'Set', ism: 91, isps: 92, mlc: 94 },
  { month: 'Out', ism: 96, isps: 94, mlc: 97 },
  { month: 'Nov', ism: 95, isps: 93, mlc: 98 },
  { month: 'Dez', ism: 98, isps: 96, mlc: 99 },
];

const findingsDistribution = [
  { name: 'Conforme', value: 156, color: '#22c55e' },
  { name: 'Observações', value: 23, color: '#eab308' },
  { name: 'Não Conforme', value: 8, color: '#ef4444' },
];

const categoryPerformance = [
  { category: 'Documentação', score: 98 },
  { category: 'Tripulação', score: 95 },
  { category: 'Manutenção', score: 88 },
  { category: 'Emergência', score: 92 },
  { category: 'Segurança', score: 96 },
  { category: 'Ambiental', score: 90 },
];

const radarData = [
  { subject: 'ISM', A: 98, fullMark: 100 },
  { subject: 'ISPS', A: 96, fullMark: 100 },
  { subject: 'MLC', A: 99, fullMark: 100 },
  { subject: 'SOLAS', A: 94, fullMark: 100 },
  { subject: 'MARPOL', A: 92, fullMark: 100 },
  { subject: 'STCW', A: 97, fullMark: 100 },
];

const recentAudits = [
  { id: 'ISM-2026-001', type: 'ISM Code', vessel: 'MV Atlantic Star', date: '2026-01-10', score: 98, status: 'passed' },
  { id: 'ISPS-2025-012', type: 'ISPS Code', vessel: 'MV Pacific Dream', date: '2025-12-15', score: 96, status: 'passed' },
  { id: 'MLC-2025-008', type: 'MLC 2006', vessel: 'MV Atlantic Star', date: '2025-11-20', score: 99, status: 'passed' },
  { id: 'SOLAS-2025-005', type: 'SOLAS', vessel: 'MV Ocean Voyager', date: '2025-10-05', score: 94, status: 'passed' },
];

const upcomingAudits = [
  { type: 'ISM Annual', vessel: 'MV Pacific Dream', date: '2026-02-15', daysLeft: 31 },
  { type: 'ISPS Renewal', vessel: 'MV Atlantic Star', date: '2026-03-10', daysLeft: 54 },
  { type: 'MLC Inspection', vessel: 'MV Ocean Voyager', date: '2026-04-01', daysLeft: 76 },
];

export function PerformanceDashboard() {
  const [timeRange, setTimeRange] = useState('6m');

  const overallScore = 96;
  const previousScore = 94;
  const scoreDiff = overallScore - previousScore;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard de Performance</h1>
          <p className="text-muted-foreground">
            Métricas e análises de auditorias externas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Geral</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{overallScore}%</p>
                  <span className={`flex items-center text-sm ${scoreDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {scoreDiff >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {Math.abs(scoreDiff)}%
                  </span>
                </div>
              </div>
              <Award className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Auditorias Realizadas</p>
                <p className="text-3xl font-bold">24</p>
                <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
              </div>
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não Conformidades</p>
                <p className="text-3xl font-bold text-red-600">8</p>
                <p className="text-xs text-muted-foreground">5 fechadas, 3 abertas</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próxima Auditoria</p>
                <p className="text-3xl font-bold">31</p>
                <p className="text-xs text-muted-foreground">dias (ISM Annual)</p>
              </div>
              <Calendar className="h-10 w-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="audits">Auditorias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Conformidade por Regulamento</CardTitle>
                <CardDescription>Scores atuais de cada padrão</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Score"
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Findings Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Achados</CardTitle>
                <CardDescription>Últimas 24 auditorias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={findingsDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {findingsDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Categoria</CardTitle>
              <CardDescription>Média de conformidade em cada área</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryPerformance.map((cat) => (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cat.category}</span>
                      <span className="text-sm text-muted-foreground">{cat.score}%</span>
                    </div>
                    <Progress 
                      value={cat.score} 
                      className={`h-2 ${cat.score >= 95 ? '[&>div]:bg-green-500' : cat.score >= 85 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Conformidade</CardTitle>
              <CardDescription>Últimos 6 meses por regulamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complianceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ism" name="ISM" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="isps" name="ISPS" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="mlc" name="MLC" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Audits */}
            <Card>
              <CardHeader>
                <CardTitle>Auditorias Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {recentAudits.map((audit) => (
                      <div key={audit.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{audit.type}</span>
                            <Badge variant="outline" className="text-xs">{audit.id}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Ship className="h-3 w-3" />
                            <span>{audit.vessel}</span>
                            <span>•</span>
                            <span>{audit.date}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{audit.score}%</p>
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aprovado
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Upcoming Audits */}
            <Card>
              <CardHeader>
                <CardTitle>Próximas Auditorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAudits.map((audit, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="space-y-1">
                        <span className="font-medium">{audit.type}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Ship className="h-3 w-3" />
                          <span>{audit.vessel}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{audit.date}</p>
                        <Badge variant={audit.daysLeft <= 30 ? "destructive" : audit.daysLeft <= 60 ? "secondary" : "outline"}>
                          <Clock className="h-3 w-3 mr-1" />
                          {audit.daysLeft} dias
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}