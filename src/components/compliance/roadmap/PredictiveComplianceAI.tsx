/**
 * PredictiveComplianceAI - Fase 4: Análise Preditiva de Conformidade
 * IA que prevê futuras NCs baseado em histórico e padrões
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Brain, TrendingUp, AlertTriangle, Target, Zap,
  Calendar, Users, FileWarning, ShieldAlert, BarChart3,
  Lightbulb, ArrowUpRight, ArrowDownRight, Minus,
  RefreshCw, Clock, CheckCircle2, XCircle
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { format, addDays, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Prediction {
  id: string;
  type: 'certificate' | 'audit' | 'training' | 'procedure' | 'equipment';
  title: string;
  description: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  probability: number;
  confidence: number;
  daysUntil: number;
  department?: string;
  recommendation: string;
  expectedImpact: string;
  historicalPattern?: string;
}

interface TrendData {
  month: string;
  compliance: number;
  ncs: number;
  resolved: number;
  predicted: number;
}

interface DepartmentRisk {
  department: string;
  risk: number;
  ncs: number;
  trend: 'up' | 'down' | 'stable';
}

interface CategoryAnalysis {
  category: string;
  value: number;
  recurrence: number;
}

const PREDICTIONS: Prediction[] = [
  {
    id: '1',
    type: 'certificate',
    title: 'Carlos Mendes - NR-10',
    description: 'Certificado NR-10 vence em 45 dias. Histórico: sempre atrasa requalificação',
    riskLevel: 'critical',
    probability: 90,
    confidence: 95,
    daysUntil: 45,
    department: 'Operações',
    recommendation: 'Agendar treinamento AGORA - não esperar prazo',
    expectedImpact: 'Reduz risco de NC de 90% para 10%',
    historicalPattern: 'Atrasou 3 das últimas 4 requalificações'
  },
  {
    id: '2',
    type: 'audit',
    title: 'Departamento Operação - NR-35',
    description: 'Auditoria agendada em 35 dias. Histórico: 60% de falha nesta norma',
    riskLevel: 'high',
    probability: 75,
    confidence: 85,
    daysUntil: 35,
    department: 'Operações',
    recommendation: 'Treinamento de reforço em 2 semanas',
    expectedImpact: 'Taxa de falha cai de 60% para 20%',
    historicalPattern: 'Últimas 5 auditorias: 3 com NC'
  },
  {
    id: '3',
    type: 'procedure',
    title: 'Procedimento NR-12',
    description: 'Revisado há 8 meses. Taxa de falha aumentou 15% desde última revisão',
    riskLevel: 'medium',
    probability: 65,
    confidence: 80,
    daysUntil: 60,
    department: 'Manutenção',
    recommendation: 'Revisar procedimento + comunicar mudanças',
    expectedImpact: 'Conformidade volta ao baseline',
    historicalPattern: 'Aumento gradual de NCs após 6 meses'
  },
  {
    id: '4',
    type: 'training',
    title: 'Equipe Logística - MOPP',
    description: '4 colaboradores com certificação MOPP próxima do vencimento',
    riskLevel: 'high',
    probability: 85,
    confidence: 92,
    daysUntil: 30,
    department: 'Logística',
    recommendation: 'Agendar treinamento coletivo para economia',
    expectedImpact: 'Economia de 30% no custo de treinamento',
    historicalPattern: 'Padrão de vencimento em lote'
  },
  {
    id: '5',
    type: 'equipment',
    title: 'EPIs - Setor Almoxarifado',
    description: 'Padrão de registros incompletos detectado',
    riskLevel: 'medium',
    probability: 55,
    confidence: 75,
    daysUntil: 45,
    department: 'Almoxarifado',
    recommendation: 'Implementar registro digital obrigatório',
    expectedImpact: 'Eliminação de NCs por documentação',
    historicalPattern: 'NC recorrente a cada 2 meses'
  }
];

const TREND_DATA: TrendData[] = [
  { month: 'Jul', compliance: 82, ncs: 8, resolved: 6, predicted: 84 },
  { month: 'Ago', compliance: 84, ncs: 6, resolved: 7, predicted: 85 },
  { month: 'Set', compliance: 85, ncs: 5, resolved: 6, predicted: 86 },
  { month: 'Out', compliance: 83, ncs: 7, resolved: 5, predicted: 85 },
  { month: 'Nov', compliance: 86, ncs: 4, resolved: 6, predicted: 87 },
  { month: 'Dez', compliance: 87, ncs: 5, resolved: 5, predicted: 88 },
  { month: 'Jan', compliance: 87, ncs: 5, resolved: 4, predicted: 88 },
  { month: 'Fev*', compliance: 0, ncs: 0, resolved: 0, predicted: 89 },
  { month: 'Mar*', compliance: 0, ncs: 0, resolved: 0, predicted: 90 },
  { month: 'Abr*', compliance: 0, ncs: 0, resolved: 0, predicted: 91 }
];

const DEPARTMENT_RISKS: DepartmentRisk[] = [
  { department: 'Operações', risk: 72, ncs: 12, trend: 'up' },
  { department: 'Manutenção', risk: 45, ncs: 5, trend: 'stable' },
  { department: 'Logística', risk: 38, ncs: 4, trend: 'down' },
  { department: 'RH', risk: 25, ncs: 2, trend: 'stable' },
  { department: 'Administrativo', risk: 55, ncs: 6, trend: 'up' }
];

const CATEGORY_ANALYSIS: CategoryAnalysis[] = [
  { category: 'Treinamento', value: 35, recurrence: 40 },
  { category: 'Documentação', value: 25, recurrence: 30 },
  { category: 'Procedimentos', value: 20, recurrence: 25 },
  { category: 'Equipamentos', value: 12, recurrence: 15 },
  { category: 'Infraestrutura', value: 8, recurrence: 10 }
];

const RISK_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6'
};

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function PredictiveComplianceAI() {
  const [predictions, setPredictions] = useState<Prediction[]>(PREDICTIONS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallRisk, setOverallRisk] = useState(65);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info('Analisando padrões históricos...', { description: 'Processando 12 meses de dados' });
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Shuffle and update some values to simulate new analysis
    const updatedPredictions = [...predictions].map(p => ({
      ...p,
      probability: Math.min(100, Math.max(0, p.probability + (Math.random() * 10 - 5))),
      confidence: Math.min(100, Math.max(70, p.confidence + (Math.random() * 5 - 2.5)))
    })).sort((a, b) => b.probability - a.probability);
    
    setPredictions(updatedPredictions);
    setOverallRisk(Math.floor(Math.random() * 20 + 55));
    setIsAnalyzing(false);
    toast.success('Análise concluída!', { description: `${updatedPredictions.length} previsões geradas` });
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return <ShieldAlert className="h-4 w-4 text-destructive" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <FileWarning className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const criticalCount = predictions.filter(p => p.riskLevel === 'critical').length;
  const highCount = predictions.filter(p => p.riskLevel === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Análise Preditiva de Conformidade
          </h2>
          <p className="text-muted-foreground">IA prevê futuras NCs baseado em histórico e padrões</p>
        </div>
        <Button onClick={runAnalysis} disabled={isAnalyzing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analisando...' : 'Executar Análise'}
        </Button>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Termômetro de Risco Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={overallRisk > 70 ? '#ef4444' : overallRisk > 50 ? '#f97316' : '#22c55e'}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(overallRisk / 100) * 352} 352`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{overallRisk}%</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Críticos</span>
                    <Badge variant="destructive">{criticalCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Altos</span>
                    <Badge className="bg-orange-500">{highCount}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tendência</span>
                    <span className="flex items-center gap-1 text-sm">
                      {overallRisk > 60 ? (
                        <>
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                          <span className="text-destructive">Subindo</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="h-4 w-4 text-green-500" />
                          <span className="text-green-500">Descendo</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Próximos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {predictions.filter(p => p.daysUntil <= 30).length}
            </div>
            <p className="text-xs text-muted-foreground">Riscos iminentes</p>
            <Progress 
              value={predictions.filter(p => p.daysUntil <= 30).length / predictions.length * 100} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Confiança Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Precisão do modelo</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
              <TrendingUp className="h-3 w-3" />
              +5% vs mês anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Previsões de Risco - Próximos 90 dias
          </CardTitle>
          <CardDescription>
            Ordenado por probabilidade de ocorrência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {predictions.map(prediction => (
                <Card 
                  key={prediction.id}
                  className={`p-4 cursor-pointer hover:border-primary/50 transition-colors ${
                    selectedPrediction?.id === prediction.id ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedPrediction(prediction)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      prediction.riskLevel === 'critical' ? 'bg-destructive/10' :
                      prediction.riskLevel === 'high' ? 'bg-orange-500/10' :
                      prediction.riskLevel === 'medium' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                    }`}>
                      {getRiskIcon(prediction.riskLevel)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          style={{ backgroundColor: RISK_COLORS[prediction.riskLevel] }}
                          className="text-white"
                        >
                          {prediction.probability}% probabilidade
                        </Badge>
                        <Badge variant="outline">{prediction.confidence}% confiança</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {prediction.daysUntil}d
                        </span>
                      </div>
                      <h4 className="font-semibold">{prediction.title}</h4>
                      <p className="text-sm text-muted-foreground">{prediction.description}</p>
                      
                      {selectedPrediction?.id === prediction.id && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-3">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">RECOMENDAÇÃO</span>
                            <p className="text-sm flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                              {prediction.recommendation}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">IMPACTO ESPERADO</span>
                            <p className="text-sm flex items-start gap-2">
                              <Zap className="h-4 w-4 text-green-500 mt-0.5" />
                              {prediction.expectedImpact}
                            </p>
                          </div>
                          {prediction.historicalPattern && (
                            <div>
                              <span className="text-xs font-medium text-muted-foreground">PADRÃO HISTÓRICO</span>
                              <p className="text-sm flex items-start gap-2">
                                <BarChart3 className="h-4 w-4 text-primary mt-0.5" />
                                {prediction.historicalPattern}
                              </p>
                            </div>
                          )}
                          <Button size="sm" className="w-full mt-2">
                            Criar Ação Preventiva
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendência de Conformidade (12 meses)</CardTitle>
            <CardDescription>Histórico real + previsão (*)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[70, 100]} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="compliance" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3}
                    name="Conformidade Real"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#22c55e" 
                    strokeDasharray="5 5"
                    name="Previsão IA"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Risk */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risco por Departamento</CardTitle>
            <CardDescription>Índice de risco baseado em histórico de NCs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPARTMENT_RISKS} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} className="text-xs" />
                  <YAxis type="category" dataKey="department" className="text-xs" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Bar 
                    dataKey="risk" 
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Categoria</CardTitle>
            <CardDescription>% de NCs por tipo de não conformidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_ANALYSIS}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="category"
                    label={({ category, value }) => `${category}: ${value}%`}
                    labelLine={false}
                  >
                    {CATEGORY_ANALYSIS.map((entry, index) => (
                      <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recurrence Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Análise de Reincidência</CardTitle>
            <CardDescription>Taxa de NCs recorrentes por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CATEGORY_ANALYSIS.map(cat => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{cat.category}</span>
                    <span className="text-sm text-muted-foreground">{cat.recurrence}% reincidência</span>
                  </div>
                  <Progress 
                    value={cat.recurrence} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Insights da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">Ação Prioritária</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Agende requalificação NR-10 para Carlos Mendes imediatamente. 
                Histórico indica 90% de chance de NC se não agir em 7 dias.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-semibold">Tendência Positiva</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Departamento de Logística reduziu NCs em 25% nos últimos 3 meses.
                Modelo de sucesso pode ser replicado em Operações.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">Oportunidade</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Agrupar treinamentos MOPP da Logística pode gerar economia de 30%.
                4 colaboradores com vencimento próximo identificados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
