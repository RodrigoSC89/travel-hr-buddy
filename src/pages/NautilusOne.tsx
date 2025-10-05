import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Ship, 
  Brain,
  TrendingUp,
  Navigation,
  Leaf,
  Users,
  Network,
  Zap,
  Activity,
  Shield
} from 'lucide-react';
import InsightEngine from '@/components/maritime/insight-engine';
import PatternRecognition from '@/components/maritime/pattern-recognition';
import RealTimeRouteOptimizer from '@/components/maritime/route-optimizer';
import CarbonFootprintTracker from '@/components/maritime/carbon-tracker';
import CompetencyHeatmap from '@/components/crew/competency-heatmap';

const NautilusOne: React.FC = () => {
  const [activeModule, setActiveModule] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <Ship className="h-12 w-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
              NAUTILUS ONE
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Sistema Marítimo Integrado de IA e Gestão Inteligente
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              🌊 Maritime Excellence
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              🤖 AI-Powered
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              🛡️ Compliance Ready
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              🌱 ESG Certified
            </Badge>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveModule('insights')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5" />
                Insight Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-sm text-blue-100">Insights Ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveModule('patterns')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Network className="h-5 w-5" />
                Padrões IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">94%</div>
              <p className="text-sm text-purple-100">Precisão Média</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveModule('routes')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Navigation className="h-5 w-5" />
                Otimização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12%</div>
              <p className="text-sm text-green-100">Economia Combustível</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveModule('carbon')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Leaf className="h-5 w-5" />
                Pegada CO₂
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">731t</div>
              <p className="text-sm text-yellow-100">Emissões Mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveModule('crew')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" />
                Competências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">86%</div>
              <p className="text-sm text-indigo-100">Score Médio</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              Módulos Nautilus One
            </CardTitle>
            <CardDescription>
              Sistema integrado de IA, automação e gestão marítima inteligente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeModule} onValueChange={setActiveModule}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="insights">Insight Engine</TabsTrigger>
                <TabsTrigger value="patterns">Padrões IA</TabsTrigger>
                <TabsTrigger value="routes">Rotas</TabsTrigger>
                <TabsTrigger value="carbon">ESG/Carbon</TabsTrigger>
                <TabsTrigger value="crew">Competências</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        IA e Automação Inteligente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <span className="font-medium">MaritimeGPT Core</span>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <span className="font-medium">Insight Engine</span>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <span className="font-medium">Pattern Recognition</span>
                        <Badge variant="default">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <span className="font-medium">AI Edge Optimization</span>
                        <Badge variant="secondary">Standby</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-green-600" />
                        Navegação e Operação
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <span className="font-medium">Route Optimizer</span>
                        <Badge variant="default" className="bg-green-600">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <span className="font-medium">DP Log Analyzer</span>
                        <Badge variant="secondary">Em Desenvolvimento</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <span className="font-medium">Weather Integration</span>
                        <Badge variant="default" className="bg-green-600">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <span className="font-medium">Digital Twin 3D</span>
                        <Badge variant="secondary">Planejado</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-green-600" />
                        Sustentabilidade e ESG
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <span className="font-medium">Carbon Tracker</span>
                        <Badge variant="default" className="bg-green-600">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <span className="font-medium">EcoRoute Planner</span>
                        <Badge variant="secondary">Em Desenvolvimento</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <span className="font-medium">ESG Reporting</span>
                        <Badge variant="default" className="bg-green-600">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <span className="font-medium">Environmental Monitor</span>
                        <Badge variant="secondary">Planejado</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-600" />
                        Gestão de Recursos Humanos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <span className="font-medium">Competency Heatmap</span>
                        <Badge variant="default" className="bg-purple-600">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <span className="font-medium">AI Mentor</span>
                        <Badge variant="secondary">Em Desenvolvimento</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <span className="font-medium">Training Manager</span>
                        <Badge variant="default" className="bg-purple-600">Ativo</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <span className="font-medium">Performance Analytics</span>
                        <Badge variant="default" className="bg-purple-600">Ativo</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Status */}
                <Card className="border-2 border-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      Status do Sistema Nautilus One
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">98.7%</div>
                        <div className="text-sm text-muted-foreground mt-1">Uptime</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">24/7</div>
                        <div className="text-sm text-muted-foreground mt-1">Monitoramento</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">15+</div>
                        <div className="text-sm text-muted-foreground mt-1">Módulos Ativos</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="text-3xl font-bold text-orange-600">3</div>
                        <div className="text-sm text-muted-foreground mt-1">Embarcações</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights">
                <InsightEngine />
              </TabsContent>

              <TabsContent value="patterns">
                <PatternRecognition />
              </TabsContent>

              <TabsContent value="routes">
                <RealTimeRouteOptimizer />
              </TabsContent>

              <TabsContent value="carbon">
                <CarbonFootprintTracker />
              </TabsContent>

              <TabsContent value="crew">
                <CompetencyHeatmap />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 text-white border-0">
          <CardContent className="py-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Sistema Nautilus One</span>
              </div>
              <p className="text-sm text-blue-100">
                Plataforma Marítima Integrada de IA e Gestão Inteligente
              </p>
              <p className="text-xs text-blue-200 mt-2">
                v1.0.0 Production Ready | Certificado para Operação Marítima
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NautilusOne;
