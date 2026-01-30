/**
 * Compliance Predictor - Enterprise Intelligence Suite
 * Predição de não conformidades com Machine Learning
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  BarChart3,
  Calendar,
  Ship,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Activity,
  Shield,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Prediction {
  id: string;
  vessel: string;
  area: string;
  areaCode: string;
  probability: number;
  severity: 'high' | 'medium' | 'low';
  inspectionType: string;
  predictedDate: string;
  recommendation: string;
  historicalOccurrences: number;
  trend: 'up' | 'down' | 'stable';
}

interface VesselRisk {
  id: string;
  name: string;
  overallRisk: number;
  lastInspection: string;
  nextInspection: string;
  deficiencies: number;
  predictions: number;
}

const PREDICTIONS: Prediction[] = [
  {
    id: '1',
    vessel: 'OSV Petrobras III',
    area: 'Equipamentos de Salvatagem',
    areaCode: 'LSA-07',
    probability: 78,
    severity: 'high',
    inspectionType: 'PSC',
    predictedDate: '15/03/2025',
    recommendation: 'Revisar botes salva-vidas e realizar manutenção preventiva nos guinchos.',
    historicalOccurrences: 3,
    trend: 'up',
  },
  {
    id: '2',
    vessel: 'AHTS Titan',
    area: 'Documentação STCW',
    areaCode: 'STCW-02',
    probability: 65,
    severity: 'medium',
    inspectionType: 'Flag State',
    predictedDate: '20/03/2025',
    recommendation: 'Atualizar certificados de 3 tripulantes que expiram nos próximos 30 dias.',
    historicalOccurrences: 2,
    trend: 'stable',
  },
  {
    id: '3',
    vessel: 'OSV Petrobras III',
    area: 'Gestão de Resíduos (MARPOL)',
    areaCode: 'ENV-03',
    probability: 52,
    severity: 'medium',
    inspectionType: 'PSC',
    predictedDate: '18/03/2025',
    recommendation: 'Verificar Oil Record Book e garantir registros completos.',
    historicalOccurrences: 1,
    trend: 'down',
  },
  {
    id: '4',
    vessel: 'Supply Vessel Alpha',
    area: 'Equipamentos de Combate a Incêndio',
    areaCode: 'FSS-04',
    probability: 45,
    severity: 'low',
    inspectionType: 'Class',
    predictedDate: '25/03/2025',
    recommendation: 'Inspeção de rotina nos extintores - baixa probabilidade de NC.',
    historicalOccurrences: 0,
    trend: 'stable',
  },
];

const VESSEL_RISKS: VesselRisk[] = [
  {
    id: '1',
    name: 'OSV Petrobras III',
    overallRisk: 68,
    lastInspection: '15/01/2025',
    nextInspection: '15/03/2025',
    deficiencies: 2,
    predictions: 3,
  },
  {
    id: '2',
    name: 'AHTS Titan',
    overallRisk: 42,
    lastInspection: '20/12/2024',
    nextInspection: '20/03/2025',
    deficiencies: 0,
    predictions: 1,
  },
  {
    id: '3',
    name: 'Supply Vessel Alpha',
    overallRisk: 25,
    lastInspection: '10/01/2025',
    nextInspection: '10/04/2025',
    deficiencies: 0,
    predictions: 1,
  },
];

export default function CompliancePredictorPage() {
  const [predictions] = useState<Prediction[]>(PREDICTIONS);
  const [vesselRisks] = useState<VesselRisk[]>(VESSEL_RISKS);
  const [selectedVessel, setSelectedVessel] = useState<string>('all');

  const filteredPredictions = selectedVessel === 'all'
    ? predictions
    : predictions.filter(p => p.vessel === selectedVessel);

  const highRiskCount = predictions.filter(p => p.probability >= 70).length;
  const avgProbability = predictions.reduce((acc, p) => acc + p.probability, 0) / predictions.length;

  const getSeverityColor = (severity: Prediction['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
    }
  };

  const getTrendIcon = (trend: Prediction['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      case 'stable': return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Compliance Predictor | Nautilus One</title>
        <meta name="description" content="Predição de não conformidades com Machine Learning" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Compliance Predictor
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Machine Learning
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Predição de não conformidades antes que elas ocorram
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={selectedVessel} onValueChange={setSelectedVessel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas embarcações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas embarcações</SelectItem>
                {vesselRisks.map(v => (
                  <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-red-500">{highRiskCount}</p>
                  <p className="text-xs text-muted-foreground">Alto Risco (&gt;70%)</p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{predictions.length}</p>
                  <p className="text-xs text-muted-foreground">Predições Ativas</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{avgProbability.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Prob. Média NC</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Target className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-500">94%</p>
                  <p className="text-xs text-muted-foreground">Precisão Modelo</p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="predictions">
          <TabsList>
            <TabsTrigger value="predictions">Predições</TabsTrigger>
            <TabsTrigger value="vessels">Risco por Embarcação</TabsTrigger>
            <TabsTrigger value="model">Sobre o Modelo</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Predições de Não Conformidade
                </CardTitle>
                <CardDescription>
                  Ordenado por probabilidade de ocorrência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {filteredPredictions.map((prediction, idx) => (
                      <motion.div
                        key={prediction.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className={cn(
                          "border-2",
                          prediction.probability >= 70 && "border-red-500/30 bg-red-500/5"
                        )}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">{prediction.areaCode}</Badge>
                                  <h4 className="font-medium">{prediction.area}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Ship className="h-4 w-4" />
                                  {prediction.vessel}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={cn(
                                  "text-3xl font-bold",
                                  prediction.probability >= 70 ? 'text-red-500' :
                                  prediction.probability >= 50 ? 'text-yellow-500' : 'text-green-500'
                                )}>
                                  {prediction.probability}%
                                </div>
                                <p className="text-xs text-muted-foreground">probabilidade</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="p-2 bg-muted/50 rounded text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Shield className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <p className="text-xs font-medium">{prediction.inspectionType}</p>
                                <p className="text-xs text-muted-foreground">Tipo</p>
                              </div>
                              <div className="p-2 bg-muted/50 rounded text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <p className="text-xs font-medium">{prediction.predictedDate}</p>
                                <p className="text-xs text-muted-foreground">Data Prevista</p>
                              </div>
                              <div className="p-2 bg-muted/50 rounded text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  {getTrendIcon(prediction.trend)}
                                </div>
                                <p className="text-xs font-medium">{prediction.historicalOccurrences}x</p>
                                <p className="text-xs text-muted-foreground">Histórico</p>
                              </div>
                            </div>

                            <Progress
                              value={prediction.probability}
                              className={cn(
                                "h-2 mb-3",
                                prediction.probability >= 70 && "[&>div]:bg-red-500",
                                prediction.probability >= 50 && prediction.probability < 70 && "[&>div]:bg-yellow-500",
                                prediction.probability < 50 && "[&>div]:bg-green-500"
                              )}
                            />

                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Ação Preventiva Recomendada:
                              </div>
                              <p className="text-sm text-muted-foreground">{prediction.recommendation}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vessels">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Risco por Embarcação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vesselRisks.map((vessel) => (
                    <Card key={vessel.id} className={cn(
                      "border",
                      vessel.overallRisk >= 60 && "border-red-500/30"
                    )}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{vessel.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Última inspeção: {vessel.lastInspection}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={cn(
                              "text-2xl font-bold",
                              vessel.overallRisk >= 60 ? 'text-red-500' :
                              vessel.overallRisk >= 40 ? 'text-yellow-500' : 'text-green-500'
                            )}>
                              {vessel.overallRisk}%
                            </div>
                            <p className="text-xs text-muted-foreground">risco geral</p>
                          </div>
                        </div>
                        <Progress
                          value={vessel.overallRisk}
                          className={cn(
                            "h-2 mb-3",
                            vessel.overallRisk >= 60 && "[&>div]:bg-red-500",
                            vessel.overallRisk >= 40 && vessel.overallRisk < 60 && "[&>div]:bg-yellow-500",
                            vessel.overallRisk < 40 && "[&>div]:bg-green-500"
                          )}
                        />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Próxima inspeção: {vessel.nextInspection}
                          </span>
                          <div className="flex gap-3">
                            <Badge variant="outline">
                              {vessel.deficiencies} deficiências
                            </Badge>
                            <Badge variant="outline" className="bg-primary/10">
                              {vessel.predictions} predições
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="model">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Sobre o Modelo de Machine Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="p-3 rounded-full bg-primary/10 w-fit mb-3">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">Dados de Treinamento</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      O modelo foi treinado com mais de 50.000 registros de inspeções PSC, 
                      Flag State e Class de embarcações offshore.
                    </p>
                    <div className="text-2xl font-bold">50.000+</div>
                    <p className="text-xs text-muted-foreground">registros históricos</p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="p-3 rounded-full bg-green-500/10 w-fit mb-3">
                      <Target className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="font-medium mb-2">Precisão do Modelo</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Taxa de acerto de 94% na predição de não conformidades 
                      com antecedência média de 30 dias.
                    </p>
                    <div className="text-2xl font-bold text-green-500">94%</div>
                    <p className="text-xs text-muted-foreground">precisão comprovada</p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="p-3 rounded-full bg-purple-500/10 w-fit mb-3">
                      <Activity className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="font-medium mb-2">Aprendizado Contínuo</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      O modelo é retreinado semanalmente com novos dados de inspeções 
                      para melhorar continuamente as predições.
                    </p>
                    <div className="text-2xl font-bold">Semanal</div>
                    <p className="text-xs text-muted-foreground">atualização do modelo</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Fatores Analisados pelo Modelo
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <Badge variant="outline">Histórico de deficiências</Badge>
                    <Badge variant="outline">Idade da embarcação</Badge>
                    <Badge variant="outline">Tipo de operação</Badge>
                    <Badge variant="outline">Região geográfica</Badge>
                    <Badge variant="outline">Classificadora</Badge>
                    <Badge variant="outline">Certificações ativas</Badge>
                    <Badge variant="outline">Tempo desde última inspeção</Badge>
                    <Badge variant="outline">Tendências do setor</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
