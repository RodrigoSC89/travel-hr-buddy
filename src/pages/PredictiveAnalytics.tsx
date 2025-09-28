import React, { Suspense } from 'react';
import { TrendingUp, Brain, AlertTriangle, Target, Zap, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';

// Lazy loading da análise preditiva
const PredictiveAnalyticsAdvanced = React.lazy(() => 
  import('@/components/intelligence/predictive-analytics-advanced').then(module => ({
    default: module.PredictiveAnalyticsAdvanced
  }))
);

const PredictiveAnalytics: React.FC = () => {
  return (
    <div className="p-6 space-y-6 min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/20">
          <Brain className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Análise Preditiva
          </h1>
          <p className="text-muted-foreground">
            IA avançada para previsões e insights estratégicos
          </p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Target className="h-4 w-4" />
              Precisão Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">94.8%</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Excelente</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <BarChart3 className="h-4 w-4" />
              Predições Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">247</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Em Tempo Real</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">3</span>
              <Badge variant="destructive">Ação Necessária</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Zap className="h-4 w-4" />
              Modelos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-600">12</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">Otimizados</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
          <TabsTrigger value="training">Treinamento</TabsTrigger>
          <TabsTrigger value="explainability">Explicabilidade</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">Carregando análise preditiva...</p>
              </div>
            </div>
          }>
            <PredictiveAnalyticsAdvanced />
          </Suspense>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  Modelo de Falhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Predição de falhas em equipamentos marítimos
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Precisão: 96.2%</span>
                  <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                </div>
                <Button className="w-full" variant="outline">Ver Detalhes</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Modelo de Demanda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Previsão de demanda operacional
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Precisão: 92.8%</span>
                  <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                </div>
                <Button className="w-full" variant="outline">Ver Detalhes</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Modelo de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Identificação precoce de riscos operacionais
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Precisão: 89.4%</span>
                  <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                </div>
                <Button className="w-full" variant="outline">Ver Detalhes</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predições em Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-900">Falha Prevista - Motor Principal</p>
                      <p className="text-sm text-red-700">Embarcação: Nautilus Alpha - Probabilidade: 87%</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Crítico</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-orange-900">Pico de Demanda Previsto</p>
                      <p className="text-sm text-orange-700">Data: 2024-01-15 - Aumento: 45%</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">Alta</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-900">Otimização de Rota Sugerida</p>
                      <p className="text-sm text-blue-700">Economia estimada: 15% combustível</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Média</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status do Treinamento de Modelos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-900">Modelo de Manutenção Preditiva v2.1</span>
                    <Badge className="bg-green-100 text-green-700">Concluído</Badge>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full w-full"></div>
                  </div>
                  <p className="text-sm text-green-700 mt-2">Treinamento concluído com 94.8% de precisão</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">Modelo de Análise de Combustível</span>
                    <Badge className="bg-blue-100 text-blue-700">Em Progresso</Badge>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">75% concluído - Precisão atual: 91.2%</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Modelo de Detecção de Anomalias</span>
                    <Badge variant="outline">Aguardando</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-400 h-2 rounded-full w-1/4"></div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">Aguardando dados adicionais para iniciar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explainability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Explicabilidade dos Modelos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Fatores de Influência - Modelo de Falhas</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Temperatura do Motor</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full w-5/6"></div>
                        </div>
                        <span className="text-sm font-medium">83%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vibrações Anômalas</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full w-3/4"></div>
                        </div>
                        <span className="text-sm font-medium">76%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Horas de Operação</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full w-1/2"></div>
                        </div>
                        <span className="text-sm font-medium">54%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-3 text-blue-900">Logs de Decisão</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• 14:32 - Detectado aumento de 15°C na temperatura</p>
                    <p>• 14:35 - Correlação identificada com padrão de falha conhecido</p>
                    <p>• 14:36 - Probabilidade de falha calculada: 87%</p>
                    <p>• 14:37 - Alerta crítico gerado automaticamente</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;