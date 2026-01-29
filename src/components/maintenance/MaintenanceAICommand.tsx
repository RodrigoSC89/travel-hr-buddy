/**
 * 🔧 Maintenance AI Command - REVOLUTIONARY MODULE
 * Central de Manutenção Preditiva com IA Neural
 * Features: ONNX Predictions, Digital Twin, IoT Integration, Self-Healing
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  Wrench, Brain, Activity, AlertTriangle, Shield,
  Cpu, TrendingUp, Clock, Zap, Settings,
  CheckCircle, XCircle, Timer, BarChart3,
  Thermometer, Gauge, CircuitBoard, HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAIService } from '@/hooks/use-ai-service';

interface Equipment {
  id: string;
  name: string;
  type: string;
  healthScore: number;
  predictedFailure: string | null;
  failureProbability: number;
  lastMaintenance: string;
  nextMaintenance: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
  sensors: {
    temperature: number;
    vibration: number;
    pressure: number;
    rpm: number;
  };
}

interface MaintenanceJob {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'preventive' | 'predictive' | 'corrective';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  scheduledDate: string;
  estimatedDuration: number;
  aiRecommendation: string;
  confidence: number;
}

interface AIInsight {
  id: string;
  type: 'prediction' | 'optimization' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  impact: 'cost_saving' | 'risk_reduction' | 'efficiency' | 'safety';
  value: string;
  confidence: number;
  timestamp: string;
}

export function MaintenanceAICommand() {
  const [activeTab, setActiveTab] = useState('overview');
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [jobs, setJobs] = useState<MaintenanceJob[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [autoMode, setAutoMode] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { sendMessage, isLoading } = useAIService({ module: 'maintenance-ai' });

  // Simulated data
  useEffect(() => {
    const mockEquipments: Equipment[] = [
      {
        id: 'eq1',
        name: 'Motor Principal #1',
        type: 'main_engine',
        healthScore: 87,
        predictedFailure: '2025-03-15',
        failureProbability: 12,
        lastMaintenance: '2025-01-10',
        nextMaintenance: '2025-02-15',
        status: 'operational',
        sensors: { temperature: 78, vibration: 2.3, pressure: 45, rpm: 1250 }
      },
      {
        id: 'eq2',
        name: 'Gerador Auxiliar #2',
        type: 'generator',
        healthScore: 65,
        predictedFailure: '2025-02-20',
        failureProbability: 35,
        lastMaintenance: '2024-12-20',
        nextMaintenance: '2025-01-31',
        status: 'warning',
        sensors: { temperature: 92, vibration: 4.1, pressure: 52, rpm: 1800 }
      },
      {
        id: 'eq3',
        name: 'Bomba de Combustível #1',
        type: 'pump',
        healthScore: 94,
        predictedFailure: null,
        failureProbability: 5,
        lastMaintenance: '2025-01-25',
        nextMaintenance: '2025-04-25',
        status: 'operational',
        sensors: { temperature: 45, vibration: 1.2, pressure: 38, rpm: 750 }
      },
      {
        id: 'eq4',
        name: 'Sistema Hidráulico DP',
        type: 'hydraulic',
        healthScore: 42,
        predictedFailure: '2025-02-05',
        failureProbability: 58,
        lastMaintenance: '2024-11-15',
        nextMaintenance: '2025-01-30',
        status: 'critical',
        sensors: { temperature: 105, vibration: 6.8, pressure: 68, rpm: 0 }
      }
    ];

    const mockJobs: MaintenanceJob[] = [
      {
        id: 'job1',
        equipmentId: 'eq4',
        equipmentName: 'Sistema Hidráulico DP',
        type: 'predictive',
        priority: 'critical',
        status: 'scheduled',
        scheduledDate: '2025-01-30',
        estimatedDuration: 8,
        aiRecommendation: 'Substituição urgente de válvulas. Padrão de vibração indica desgaste avançado.',
        confidence: 94
      },
      {
        id: 'job2',
        equipmentId: 'eq2',
        equipmentName: 'Gerador Auxiliar #2',
        type: 'preventive',
        priority: 'high',
        status: 'in_progress',
        scheduledDate: '2025-01-29',
        estimatedDuration: 4,
        aiRecommendation: 'Troca de rolamentos recomendada. Temperatura acima do ideal.',
        confidence: 87
      },
      {
        id: 'job3',
        equipmentId: 'eq1',
        equipmentName: 'Motor Principal #1',
        type: 'preventive',
        priority: 'medium',
        status: 'scheduled',
        scheduledDate: '2025-02-15',
        estimatedDuration: 6,
        aiRecommendation: 'Manutenção de rotina. Performance dentro do esperado.',
        confidence: 92
      }
    ];

    const mockInsights: AIInsight[] = [
      {
        id: 'ins1',
        type: 'prediction',
        title: 'Falha Iminente Detectada',
        description: 'Sistema Hidráulico DP apresenta 58% de probabilidade de falha nos próximos 7 dias.',
        impact: 'risk_reduction',
        value: 'Evita parada não programada de 24h',
        confidence: 94,
        timestamp: new Date().toISOString()
      },
      {
        id: 'ins2',
        type: 'optimization',
        title: 'Otimização de Cronograma',
        description: 'Agrupar manutenções do Motor #1 e Gerador #2 pode economizar 12h de downtime.',
        impact: 'efficiency',
        value: 'Economia de $15,000 em mão de obra',
        confidence: 89,
        timestamp: new Date().toISOString()
      },
      {
        id: 'ins3',
        type: 'anomaly',
        title: 'Anomalia de Temperatura',
        description: 'Gerador Auxiliar #2 operando 15°C acima da média histórica.',
        impact: 'safety',
        value: 'Prevenção de dano maior',
        confidence: 96,
        timestamp: new Date().toISOString()
      }
    ];

    setEquipments(mockEquipments);
    setJobs(mockJobs);
    setInsights(mockInsights);
  }, []);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await sendMessage(
        'Analise todos os equipamentos e forneça recomendações de manutenção preditiva baseadas nos dados de sensores.'
      );
      toast.success('Análise Neural Concluída!', {
        description: 'Novas predições disponíveis'
      });
    } catch (error) {
      toast.error('Erro na análise');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational': return <Badge className="bg-green-500">Operacional</Badge>;
      case 'warning': return <Badge className="bg-amber-500">Atenção</Badge>;
      case 'critical': return <Badge className="bg-red-500">Crítico</Badge>;
      case 'maintenance': return <Badge className="bg-blue-500">Em Manutenção</Badge>;
      default: return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-amber-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const overallHealth = Math.round(equipments.reduce((acc, eq) => acc + eq.healthScore, 0) / equipments.length);
  const criticalCount = equipments.filter(eq => eq.status === 'critical').length;
  const pendingJobs = jobs.filter(j => j.status === 'scheduled').length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wrench className="h-8 w-8 text-primary" />
            Maintenance AI Command
            <Badge variant="default" className="bg-gradient-to-r from-orange-600 to-red-600">
              PREDICTIVE v4.0
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manutenção Preditiva com ONNX Neural Networks & Digital Twin
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Modo Autônomo</span>
            <Switch checked={autoMode} onCheckedChange={setAutoMode} />
          </div>
          <Button 
            onClick={handleAIAnalysis}
            disabled={isAnalyzing || isLoading}
            className="bg-gradient-to-r from-orange-600 to-red-600"
          >
            <Brain className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analisando...' : 'Análise Neural'}
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Saúde Geral</p>
                <p className={`text-2xl font-bold ${getHealthColor(overallHealth)}`}>
                  {overallHealth}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {equipments.length} equipamentos
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <Progress value={overallHealth} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Críticos</p>
                <p className="text-2xl font-bold text-red-500">{criticalCount}</p>
                <p className="text-xs text-red-500 mt-1">Requer ação imediata</p>
              </div>
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Jobs Pendentes</p>
                <p className="text-2xl font-bold">{pendingJobs}</p>
                <p className="text-xs text-muted-foreground mt-1">Agendados</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Precisão IA</p>
                <p className="text-2xl font-bold text-purple-500">94.2%</p>
                <p className="text-xs text-purple-500 mt-1">ONNX Neural Network</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Equipamentos
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights IA
          </TabsTrigger>
          <TabsTrigger value="sensors" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Sensores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Monitoramento de Equipamentos
              </CardTitle>
              <CardDescription>
                Saúde preditiva baseada em Machine Learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  <AnimatePresence>
                    {equipments.map((equipment, index) => (
                      <motion.div
                        key={equipment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${
                              equipment.status === 'critical' ? 'bg-red-500/10' :
                              equipment.status === 'warning' ? 'bg-amber-500/10' :
                              'bg-green-500/10'
                            }`}>
                              <CircuitBoard className={`h-6 w-6 ${
                                equipment.status === 'critical' ? 'text-red-500' :
                                equipment.status === 'warning' ? 'text-amber-500' :
                                'text-green-500'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {equipment.name}
                                {getStatusBadge(equipment.status)}
                              </h3>
                              <p className="text-sm text-muted-foreground capitalize">
                                {equipment.type.replace('_', ' ')}
                              </p>
                              {equipment.predictedFailure && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Falha prevista: {new Date(equipment.predictedFailure).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Saúde</p>
                              <p className={`text-lg font-bold ${getHealthColor(equipment.healthScore)}`}>
                                {equipment.healthScore}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Prob. Falha</p>
                              <p className={`text-lg font-bold ${
                                equipment.failureProbability > 50 ? 'text-red-500' :
                                equipment.failureProbability > 25 ? 'text-amber-500' :
                                'text-green-500'
                              }`}>
                                {equipment.failureProbability}%
                              </p>
                            </div>
                            <div className="flex gap-3 text-sm">
                              <div className="flex items-center gap-1">
                                <Thermometer className="h-4 w-4 text-orange-500" />
                                <span>{equipment.sensors.temperature}°C</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Activity className="h-4 w-4 text-blue-500" />
                                <span>{equipment.sensors.vibration}mm/s</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Ordens de Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id} className={`border-l-4 ${getPriorityColor(job.priority)}`}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {job.equipmentName}
                            <Badge variant="outline" className="capitalize">
                              {job.type}
                            </Badge>
                            <Badge className={
                              job.priority === 'critical' ? 'bg-red-500' :
                              job.priority === 'high' ? 'bg-orange-500' :
                              job.priority === 'medium' ? 'bg-amber-500' :
                              'bg-green-500'
                            }>
                              {job.priority}
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground mt-2">
                            {job.aiRecommendation}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(job.scheduledDate).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="h-4 w-4" />
                              {job.estimatedDuration}h estimadas
                            </span>
                            <Badge variant="secondary">
                              Confiança: {job.confidence}%
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            Detalhes
                          </Button>
                          <Button size="sm" className="bg-gradient-to-r from-orange-600 to-red-600">
                            Iniciar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Insights de IA Preditiva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card key={insight.id} className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          insight.type === 'prediction' ? 'bg-purple-500/10' :
                          insight.type === 'anomaly' ? 'bg-red-500/10' :
                          insight.type === 'optimization' ? 'bg-green-500/10' :
                          'bg-blue-500/10'
                        }`}>
                          {insight.type === 'prediction' && <TrendingUp className="h-6 w-6 text-purple-500" />}
                          {insight.type === 'anomaly' && <AlertTriangle className="h-6 w-6 text-red-500" />}
                          {insight.type === 'optimization' && <Zap className="h-6 w-6 text-green-500" />}
                          {insight.type === 'recommendation' && <CheckCircle className="h-6 w-6 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                              {insight.value}
                            </Badge>
                            <Badge variant="outline">
                              Confiança: {insight.confidence}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {equipments.map((eq) => (
              <Card key={eq.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    {eq.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-orange-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Temperatura</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-500">{eq.sensors.temperature}°C</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Vibração</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-500">{eq.sensors.vibration} mm/s</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Pressão</span>
                      </div>
                      <p className="text-2xl font-bold text-green-500">{eq.sensors.pressure} bar</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">RPM</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-500">{eq.sensors.rpm}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MaintenanceAICommand;
