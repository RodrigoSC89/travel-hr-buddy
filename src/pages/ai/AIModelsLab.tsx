/**
 * AI Models Lab - Laboratório de Modelos de IA
 * Treinamento, teste e gestão de modelos de machine learning
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TestTube,
  Brain,
  Cpu,
  TrendingUp,
  Activity,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Settings,
  BarChart3,
  Target,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sparkles
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

interface MLModel {
  id: string;
  name: string;
  type: string;
  status: "training" | "ready" | "evaluating" | "failed";
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingProgress: number;
  lastUpdated: string;
  dataSize: string;
  epochs: number;
  version: string;
}

const AIModelsLab: React.FC = () => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  const models: MLModel[] = [
    {
      id: "1",
      name: "Previsão de Manutenção",
      type: "Regressão",
      status: "ready",
      accuracy: 94.2,
      precision: 92.8,
      recall: 91.5,
      f1Score: 92.1,
      trainingProgress: 100,
      lastUpdated: "2024-01-15",
      dataSize: "2.4GB",
      epochs: 150,
      version: "3.2.1"
    },
    {
      id: "2",
      name: "Detecção de Anomalias",
      type: "Classificação",
      status: "training",
      accuracy: 87.5,
      precision: 89.2,
      recall: 85.3,
      f1Score: 87.2,
      trainingProgress: 67,
      lastUpdated: "2024-01-14",
      dataSize: "1.8GB",
      epochs: 100,
      version: "2.1.0"
    },
    {
      id: "3",
      name: "Otimização de Rota",
      type: "Reinforcement Learning",
      status: "ready",
      accuracy: 91.8,
      precision: 90.5,
      recall: 93.2,
      f1Score: 91.8,
      trainingProgress: 100,
      lastUpdated: "2024-01-13",
      dataSize: "3.1GB",
      epochs: 200,
      version: "4.0.0"
    },
    {
      id: "4",
      name: "Classificação de Documentos",
      type: "NLP",
      status: "evaluating",
      accuracy: 96.3,
      precision: 95.8,
      recall: 97.1,
      f1Score: 96.4,
      trainingProgress: 100,
      lastUpdated: "2024-01-12",
      dataSize: "4.5GB",
      epochs: 75,
      version: "2.5.3"
    },
    {
      id: "5",
      name: "Previsão de Consumo",
      type: "Time Series",
      status: "training",
      accuracy: 78.4,
      precision: 76.9,
      recall: 80.1,
      f1Score: 78.5,
      trainingProgress: 34,
      lastUpdated: "2024-01-11",
      dataSize: "1.2GB",
      epochs: 180,
      version: "1.0.0"
    },
    {
      id: "6",
      name: "Análise de Sentimento",
      type: "NLP",
      status: "failed",
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      trainingProgress: 45,
      lastUpdated: "2024-01-10",
      dataSize: "890MB",
      epochs: 50,
      version: "0.9.1"
    }
  ];

  const trainingHistory = [
    { epoch: 1, loss: 0.85, accuracy: 45 },
    { epoch: 20, loss: 0.62, accuracy: 68 },
    { epoch: 40, loss: 0.45, accuracy: 78 },
    { epoch: 60, loss: 0.32, accuracy: 85 },
    { epoch: 80, loss: 0.24, accuracy: 89 },
    { epoch: 100, loss: 0.18, accuracy: 92 },
    { epoch: 120, loss: 0.15, accuracy: 93.5 },
    { epoch: 140, loss: 0.12, accuracy: 94.2 },
  ];

  const modelMetrics = [
    { metric: "Precisão", value: 92.8 },
    { metric: "Recall", value: 91.5 },
    { metric: "F1-Score", value: 92.1 },
    { metric: "AUC-ROC", value: 95.3 },
    { metric: "Especificidade", value: 89.7 },
    { metric: "Sensibilidade", value: 93.4 },
  ];

  const getStatusBadge = (status: MLModel["status"]) => {
    switch (status) {
    case "ready":
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Pronto</Badge>;
    case "training":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Activity className="h-3 w-3 mr-1 animate-pulse" />Treinando</Badge>;
    case "evaluating":
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Target className="h-3 w-3 mr-1" />Avaliando</Badge>;
    case "failed":
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
    }
  };

  const handleStartTraining = useCallback((modelId: string) => {
    setIsTraining(true);
    toast({
      title: "Treinamento Iniciado",
      description: "O modelo começou a ser treinado. Isso pode levar alguns minutos.",
    });
    setTimeout(() => setIsTraining(false), 3000);
  }, [toast]);

  const handleExportModel = useCallback((modelId: string) => {
    toast({
      title: "Exportando Modelo",
      description: "Preparando arquivo ONNX para download...",
    });
  }, [toast]);

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={TestTube}
        title="Laboratório de Modelos IA"
        description="Treinamento, teste e gestão de modelos de machine learning"
        gradient="orange"
        badges={[
          { icon: Brain, label: `${models.length} Modelos` },
          { icon: Activity, label: `${models.filter(m => m.status === "training").length} Treinando` },
          { icon: CheckCircle, label: `${models.filter(m => m.status === "ready").length} Prontos` }
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Modelos</p>
                <p className="text-2xl font-bold">{models.length}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média de Precisão</p>
                <p className="text-2xl font-bold">{(models.filter(m => m.accuracy > 0).reduce((a, b) => a + b.accuracy, 0) / models.filter(m => m.accuracy > 0).length).toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GPU Utilização</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <Cpu className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dados Processados</p>
                <p className="text-2xl font-bold">13.9TB</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="training">Treinamento</TabsTrigger>
          <TabsTrigger value="evaluation">Avaliação</TabsTrigger>
          <TabsTrigger value="deployment">Deploy</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      {model.name}
                    </CardTitle>
                    {getStatusBadge(model.status)}
                  </div>
                  <CardDescription>
                    <Badge variant="outline" className="mr-2">{model.type}</Badge>
                    <span className="text-xs text-muted-foreground">v{model.version}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {model.status === "training" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso do Treinamento</span>
                        <span>{model.trainingProgress}%</span>
                      </div>
                      <Progress value={model.trainingProgress} className="h-2" />
                    </div>
                  )}

                  {model.status === "ready" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Precisão</p>
                        <p className="text-lg font-bold text-green-500">{model.accuracy}%</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">F1-Score</p>
                        <p className="text-lg font-bold text-blue-500">{model.f1Score}%</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {model.lastUpdated}
                    </span>
                    <span>{model.dataSize} de dados</span>
                  </div>

                  <div className="flex gap-2">
                    {model.status === "ready" && (
                      <>
                        <Button size="sm" className="flex-1" onClick={() => handleExportModel(model.id)}>
                          <Download className="h-4 w-4 mr-1" />
                          Exportar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleStartTraining(model.id)}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Re-treinar
                        </Button>
                      </>
                    )}
                    {model.status === "training" && (
                      <Button size="sm" variant="outline" className="w-full">
                        <Pause className="h-4 w-4 mr-1" />
                        Pausar
                      </Button>
                    )}
                    {model.status === "failed" && (
                      <Button size="sm" variant="outline" className="w-full" onClick={() => handleStartTraining(model.id)}>
                        <Play className="h-4 w-4 mr-1" />
                        Reiniciar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Curva de Aprendizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trainingHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="epoch" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))" 
                      }} 
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} name="Precisão" />
                    <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} name="Loss" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações de Treinamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Learning Rate</Label>
                  <Input type="number" defaultValue="0.001" step="0.0001" />
                </div>
                <div className="space-y-2">
                  <Label>Batch Size</Label>
                  <Select defaultValue="32">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">16</SelectItem>
                      <SelectItem value="32">32</SelectItem>
                      <SelectItem value="64">64</SelectItem>
                      <SelectItem value="128">128</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Epochs</Label>
                  <Input type="number" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <Label>Optimizer</Label>
                  <Select defaultValue="adam">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adam">Adam</SelectItem>
                      <SelectItem value="sgd">SGD</SelectItem>
                      <SelectItem value="rmsprop">RMSprop</SelectItem>
                      <SelectItem value="adamw">AdamW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" disabled={isTraining}>
                  {isTraining ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Treinando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Treinamento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={modelMetrics}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
                    <Radar name="Performance" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Comparativo de Modelos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={models.filter(m => m.accuracy > 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))" 
                      }} 
                    />
                    <Bar dataKey="accuracy" fill="hsl(var(--primary))" name="Precisão" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Modelos em Produção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {models.filter(m => m.status === "ready").map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-sm text-muted-foreground">v{model.version} • {model.accuracy}% precisão</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Config
                        </Button>
                        <Button size="sm">
                          <Sparkles className="h-4 w-4 mr-1" />
                          Testar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default AIModelsLab;
