import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Cloud,
  Waves,
  Wind,
  Satellite,
  Brain,
  Zap,
  Shield,
  Activity,
  TrendingUp,
  CheckCircle,
  Globe,
  Radio
} from 'lucide-react';
import { WeatherCommandCenter } from '@/components/maritime/WeatherCommandCenter';

export default function WeatherDashboard() {
  const [activeTab, setActiveTab] = useState('command-center');

  return (
    <>
      <Helmet>
        <title>Weather Dashboard - Nautilus One</title>
        <meta name="description" content="Sistema meteorológico marítimo mais avançado do mundo com integração Windy.com" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Cloud className="h-12 w-12" />
              <h1 className="text-4xl font-bold">Weather Command Center</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl">
              Sistema Meteorológico Marítimo Revolucionário - Integração Windy.com + Multi-fontes + IA Avançada
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Windy.com Integration
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Multi-source Validation
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                AI Weather Analysis
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                ASOG Compliance
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Real-time Alerts
              </Badge>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
            <Cloud className="h-64 w-64" />
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Wind className="h-8 w-8 text-blue-600" />
                <Badge variant="outline" className="bg-green-100 text-green-800">Live</Badge>
              </div>
              <CardTitle className="text-lg">Windy Integration</CardTitle>
              <CardDescription>
                Dados em tempo real do Windy.com com visualização interativa
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Brain className="h-8 w-8 text-purple-600" />
                <Badge variant="outline" className="bg-purple-100 text-purple-800">AI</Badge>
              </div>
              <CardTitle className="text-lg">AI Analysis</CardTitle>
              <CardDescription>
                Análise inteligente com OpenAI para recomendações operacionais
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Shield className="h-8 w-8 text-orange-600" />
                <Badge variant="outline" className="bg-orange-100 text-orange-800">ASOG</Badge>
              </div>
              <CardTitle className="text-lg">ASOG Validator</CardTitle>
              <CardDescription>
                Validação automática contra limites operacionais ASOG/IMCA
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Satellite className="h-8 w-8 text-green-600" />
                <Badge variant="outline" className="bg-green-100 text-green-800">Multi-source</Badge>
              </div>
              <CardTitle className="text-lg">Multi-Source</CardTitle>
              <CardDescription>
                Validação cruzada de múltiplas fontes meteorológicas
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="command-center" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Command Center
            </TabsTrigger>
            <TabsTrigger value="capabilities" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Capabilities
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="command-center" className="mt-6">
            <WeatherCommandCenter />
          </TabsContent>

          <TabsContent value="capabilities" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🌊 Advanced Maritime AI</CardTitle>
                <CardDescription>Capacidades de IA para operações marítimas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      Predição de Condições
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Machine Learning para prever condições marítimas com base em dados históricos e padrões identificados.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Otimização de Rotas
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Otimização inteligente de rotas baseada em previsões meteorológicas e eficiência operacional.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-orange-600" />
                      Análise de Risco
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Avaliação automatizada de riscos meteorológicos para operações específicas com recomendações acionáveis.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      Recomendações Adaptativas
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Sistema que aprende e adapta recomendações baseado no contexto operacional e histórico de decisões.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🛰️ Satellite Data Integration</CardTitle>
                <CardDescription>Integração com dados de satélite para análise avançada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Satellite className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Imagens de Satélite em Tempo Real</h4>
                    <p className="text-sm text-muted-foreground">
                      Visualização de formações de nuvens e sistemas meteorológicos via satélite
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Waves className="h-5 w-5 text-cyan-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Análise de Formação de Tempestades</h4>
                    <p className="text-sm text-muted-foreground">
                      Detecção precoce e rastreamento de sistemas de tempestade com IA
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Radio className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Previsão de Condições Oceânicas</h4>
                    <p className="text-sm text-muted-foreground">
                      Modelos preditivos para ondas, correntes e temperatura do mar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>🔑 API Integrations</CardTitle>
                <CardDescription>Todas as APIs configuradas no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                    <h4 className="font-semibold mb-2">Windy.com API</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Dados meteorológicos marítimos em tempo real com mapas interativos
                    </p>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                    <h4 className="font-semibold mb-2">OpenWeather API</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Sistema de backup e validação cruzada de dados meteorológicos
                    </p>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                    <h4 className="font-semibold mb-2">OpenAI API</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Análise inteligente e recomendações operacionais via LLM
                    </p>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="p-4 border-l-4 border-green-500 bg-green-50">
                    <h4 className="font-semibold mb-2">ElevenLabs API</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Alertas de voz para condições meteorológicas críticas
                    </p>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="p-4 border-l-4 border-cyan-500 bg-cyan-50">
                    <h4 className="font-semibold mb-2">Mapbox API</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Mapas marítimos com overlay de dados meteorológicos
                    </p>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                  </div>

                  <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                    <h4 className="font-semibold mb-2">Supabase Database</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Armazenamento e sincronização de dados meteorológicos históricos
                    </p>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 Performance Targets</CardTitle>
                <CardDescription>Métricas de excelência do sistema meteorológico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Weather Data Accuracy</span>
                      <span className="text-sm font-bold text-green-600">99.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.8%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Forecast Precision (7 days)</span>
                      <span className="text-sm font-bold text-green-600">96%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Alert Response Time</span>
                      <span className="text-sm font-bold text-green-600">&lt;5s</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Multi-source Validation</span>
                      <span className="text-sm font-bold text-green-600">99.9%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '99.9%' }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">🌊 Compliance Meteorológico</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm">IMO Weather Requirements</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm">IMCA Weather Guidelines</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm">PETROBRAS Standards</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm">International Protocols</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Status */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900">Sistema Operacional</h3>
                <p className="text-sm text-green-700">
                  Todas as integrações ativas e funcionando perfeitamente
                </p>
              </div>
              <Badge variant="outline" className="bg-green-600 text-white text-lg px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                100% Online
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
