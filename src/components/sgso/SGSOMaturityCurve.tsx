/**
 * PATCH 911 - SGSO Maturity Curve Dashboard
 * Visual representation of SGSO compliance maturity with PDCA tracking
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface MaturityData {
  practice: string;
  current: number;
  target: number;
  previous: number;
}

interface TrendData {
  month: string;
  score: number;
  ncCritical: number;
  ncGrave: number;
  ncModerate: number;
}

const maturityData: MaturityData[] = [
  { practice: 'PG1 - Cultura', current: 85, target: 95, previous: 78 },
  { practice: 'PG2 - Envolvimento', current: 72, target: 90, previous: 65 },
  { practice: 'PG3 - Treinamento', current: 88, target: 95, previous: 82 },
  { practice: 'PG4 - Fatores Humanos', current: 65, target: 85, previous: 60 },
  { practice: 'PG5 - Contratadas', current: 70, target: 90, previous: 68 },
  { practice: 'PG6 - Melhoria', current: 78, target: 90, previous: 72 },
  { practice: 'PG7 - Auditorias', current: 90, target: 95, previous: 85 },
  { practice: 'PG8 - Documentação', current: 82, target: 90, previous: 78 },
  { practice: 'PG9 - Incidentes', current: 75, target: 90, previous: 70 },
  { practice: 'PG10 - Projeto', current: 80, target: 90, previous: 75 },
  { practice: 'PG11 - ECSO', current: 68, target: 90, previous: 62 },
  { practice: 'PG12 - Riscos', current: 85, target: 95, previous: 80 },
  { practice: 'PG13 - Integridade', current: 72, target: 95, previous: 65 },
  { practice: 'PG14 - Emergência', current: 88, target: 95, previous: 82 },
  { practice: 'PG15 - Procedimentos', current: 78, target: 90, previous: 72 },
  { practice: 'PG16 - Mudanças', current: 65, target: 90, previous: 58 },
  { practice: 'PG17 - Trabalho Seguro', current: 82, target: 95, previous: 76 },
];

const trendData: TrendData[] = [
  { month: 'Jul', score: 68, ncCritical: 3, ncGrave: 8, ncModerate: 12 },
  { month: 'Ago', score: 72, ncCritical: 2, ncGrave: 7, ncModerate: 10 },
  { month: 'Set', score: 74, ncCritical: 2, ncGrave: 6, ncModerate: 9 },
  { month: 'Out', score: 76, ncCritical: 1, ncGrave: 5, ncModerate: 8 },
  { month: 'Nov', score: 78, ncCritical: 1, ncGrave: 4, ncModerate: 7 },
  { month: 'Dez', score: 80, ncCritical: 0, ncGrave: 3, ncModerate: 6 },
];

const radarData = [
  { subject: 'Liderança', A: 82, fullMark: 100 },
  { subject: 'Treinamento', A: 88, fullMark: 100 },
  { subject: 'Riscos', A: 85, fullMark: 100 },
  { subject: 'Integridade', A: 72, fullMark: 100 },
  { subject: 'Emergência', A: 88, fullMark: 100 },
  { subject: 'Operações', A: 75, fullMark: 100 },
];

export const SGSOMaturityCurve: React.FC = () => {
  const overallScore = Math.round(maturityData.reduce((acc, d) => acc + d.current, 0) / maturityData.length);
  const previousScore = Math.round(maturityData.reduce((acc, d) => acc + d.previous, 0) / maturityData.length);
  const targetScore = Math.round(maturityData.reduce((acc, d) => acc + d.target, 0) / maturityData.length);
  const improvement = overallScore - previousScore;

  const getMaturityLevel = (score: number) => {
    if (score >= 90) return { level: 'Excelência', color: 'text-success', bg: 'bg-success/10' };
    if (score >= 75) return { level: 'Maduro', color: 'text-primary', bg: 'bg-primary/10' };
    if (score >= 60) return { level: 'Em Desenvolvimento', color: 'text-warning', bg: 'bg-warning/10' };
    if (score >= 40) return { level: 'Inicial', color: 'text-warning', bg: 'bg-warning/10' };
    return { level: 'Crítico', color: 'text-destructive', bg: 'bg-destructive/10' };
  };

  const maturity = getMaturityLevel(overallScore);

  const criticalPractices = maturityData
    .filter(p => p.current < 70)
    .sort((a, b) => a.current - b.current);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={maturity.bg}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Atual</p>
                <p className={`text-3xl font-bold ${maturity.color}`}>{overallScore}%</p>
                <Badge className="mt-1">{maturity.level}</Badge>
              </div>
              <Target className={`h-10 w-10 ${maturity.color}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Evolução</p>
                <p className="text-3xl font-bold text-success">+{improvement}%</p>
                <p className="text-xs text-muted-foreground">vs. período anterior</p>
              </div>
              <TrendingUp className="h-10 w-10 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meta ANP</p>
                <p className="text-3xl font-bold text-primary">{targetScore}%</p>
                <p className="text-xs text-muted-foreground">Gap: {targetScore - overallScore}%</p>
              </div>
              <Award className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Práticas Críticas</p>
                <p className="text-3xl font-bold text-destructive">{criticalPractices.length}</p>
                <p className="text-xs text-muted-foreground">Abaixo de 70%</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Maturidade SGSO</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Score SGSO"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Maturidade</CardTitle>
            <CardDescription>Por área temática</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Maturidade"
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* NC Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução das Não Conformidades</CardTitle>
          <CardDescription>Por classificação ANP</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ncCritical" name="Críticas" fill="hsl(var(--destructive))" />
              <Bar dataKey="ncGrave" name="Graves" fill="hsl(var(--warning))" />
              <Bar dataKey="ncModerate" name="Moderadas" fill="hsl(var(--warning))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Practice Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo por Prática de Gestão</CardTitle>
          <CardDescription>Atual vs. Anterior vs. Meta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maturityData.map((practice) => {
              const level = getMaturityLevel(practice.current);
              const gap = practice.target - practice.current;
              return (
                <div key={practice.practice} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-40 truncate">{practice.practice}</span>
                      {practice.current < 70 && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Anterior: {practice.previous}%</span>
                      <span className={level.color + ' font-bold'}>Atual: {practice.current}%</span>
                      <span className="text-primary">Meta: {practice.target}%</span>
                      <Badge variant={gap <= 10 ? 'default' : 'destructive'}>
                        Gap: {gap}%
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={practice.current} className="h-2" />
                    <div 
                      className="absolute top-0 h-2 w-1 bg-primary" 
                      style={{ left: `${practice.target}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Critical Practices Alert */}
      {criticalPractices.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Práticas Críticas - Ação Imediata Requerida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criticalPractices.map((practice) => (
                <div key={practice.practice} className="p-4 bg-card rounded-lg border border-destructive/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{practice.practice}</h4>
                    <Badge variant="destructive">{practice.current}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Gap para meta: {practice.target - practice.current}%
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">Prioridade Alta</Badge>
                    <Badge variant="outline" className="text-xs">Plano de Ação Requerido</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SGSOMaturityCurve;
