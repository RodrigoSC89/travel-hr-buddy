/**
 * 🚢 Maritime AI Command - REVOLUTIONARY MODULE
 * Central de Comando Marítimo com IA Avançada
 * Features: Neural Route Optimizer, Weather AI, Fuel Efficiency, Fleet Intelligence
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Ship, Compass, Fuel, Cloud, Target, Brain, 
  TrendingUp, AlertTriangle, MapPin, Navigation,
  Thermometer, Waves, Anchor, Clock, Zap,
  BarChart3, Activity, Shield, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAIService } from '@/hooks/use-ai-service';

interface VesselStatus {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  speed: number;
  heading: number;
  fuelEfficiency: number;
  eta: string;
  status: 'sailing' | 'anchored' | 'port' | 'emergency';
  aiScore: number;
}

interface RouteOptimization {
  id: string;
  vesselId: string;
  originalEta: string;
  optimizedEta: string;
  fuelSaving: number;
  co2Reduction: number;
  weatherRisk: 'low' | 'medium' | 'high';
  recommendation: string;
  confidence: number;
}

interface WeatherAlert {
  id: string;
  type: 'storm' | 'wind' | 'fog' | 'wave' | 'temperature';
  severity: 'warning' | 'caution' | 'critical';
  location: string;
  message: string;
  validUntil: string;
}

export function MaritimeAICommand() {
  const [activeTab, setActiveTab] = useState('fleet');
  const [vessels, setVessels] = useState<VesselStatus[]>([]);
  const [routeOptimizations, setRouteOptimizations] = useState<RouteOptimization[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fleetHealth, setFleetHealth] = useState(94);
  const { sendMessage, isLoading } = useAIService({ module: 'maritime-command' });

  // Simulated real-time data
  useEffect(() => {
    const mockVessels: VesselStatus[] = [
      {
        id: 'v1',
        name: 'MV Atlantic Pioneer',
        position: { lat: -23.9618, lng: -46.3322 },
        speed: 12.5,
        heading: 45,
        fuelEfficiency: 92,
        eta: '2025-01-30T14:00:00Z',
        status: 'sailing',
        aiScore: 96
      },
      {
        id: 'v2',
        name: 'MV Pacific Star',
        position: { lat: -22.8954, lng: -43.1770 },
        speed: 0,
        heading: 180,
        fuelEfficiency: 88,
        eta: '2025-01-31T08:00:00Z',
        status: 'anchored',
        aiScore: 89
      },
      {
        id: 'v3',
        name: 'MV Ocean Spirit',
        position: { lat: -25.2521, lng: -48.5235 },
        speed: 14.2,
        heading: 270,
        fuelEfficiency: 95,
        eta: '2025-02-01T06:00:00Z',
        status: 'sailing',
        aiScore: 98
      }
    ];

    const mockOptimizations: RouteOptimization[] = [
      {
        id: 'opt1',
        vesselId: 'v1',
        originalEta: '2025-01-30T14:00:00Z',
        optimizedEta: '2025-01-30T12:30:00Z',
        fuelSaving: 8.5,
        co2Reduction: 12.3,
        weatherRisk: 'low',
        recommendation: 'Rota alternativa via canal norte recomendada. Economia de 8.5% combustível.',
        confidence: 94
      },
      {
        id: 'opt2',
        vesselId: 'v3',
        originalEta: '2025-02-01T06:00:00Z',
        optimizedEta: '2025-02-01T04:00:00Z',
        fuelSaving: 12.1,
        co2Reduction: 18.7,
        weatherRisk: 'medium',
        recommendation: 'Ajuste de velocidade para 13.5 nós. Consideração de frente fria.',
        confidence: 87
      }
    ];

    const mockAlerts: WeatherAlert[] = [
      {
        id: 'alert1',
        type: 'wind',
        severity: 'caution',
        location: 'Costa Sul - Santos',
        message: 'Ventos de 35-45 nós esperados nas próximas 12h',
        validUntil: '2025-01-30T02:00:00Z'
      },
      {
        id: 'alert2',
        type: 'wave',
        severity: 'warning',
        location: 'Bacia de Campos',
        message: 'Ondas de 3-4m previstas. Operações de carga requerem atenção.',
        validUntil: '2025-01-29T18:00:00Z'
      }
    ];

    setVessels(mockVessels);
    setRouteOptimizations(mockOptimizations);
    setWeatherAlerts(mockAlerts);
  }, []);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await sendMessage(
        'Analise a frota atual e forneça recomendações de otimização considerando condições climáticas, eficiência de combustível e segurança.'
      );
      toast.success('Análise IA concluída!', {
        description: 'Novas recomendações disponíveis'
      });
    } catch (error) {
      toast.error('Erro na análise IA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sailing': return 'bg-green-500';
      case 'anchored': return 'bg-blue-500';
      case 'port': return 'bg-gray-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'warning': return 'text-amber-500 bg-amber-500/10';
      case 'caution': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

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
            <Ship className="h-8 w-8 text-primary" />
            Maritime AI Command
            <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-cyan-600">
              NEURAL v4.0
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Central de Comando Marítimo com Inteligência Artificial Avançada
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleAIAnalysis}
            disabled={isAnalyzing || isLoading}
          >
            <Brain className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analisando...' : 'Análise IA'}
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600">
            <Zap className="h-4 w-4 mr-2" />
            Otimizar Frota
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Saúde da Frota</p>
                <p className="text-2xl font-bold">{fleetHealth}%</p>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> +2.3% vs mês anterior
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <Progress value={fleetHealth} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Embarcações Ativas</p>
                <p className="text-2xl font-bold">{vessels.filter(v => v.status === 'sailing').length}/{vessels.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Em navegação agora</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Ship className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Economia Combustível</p>
                <p className="text-2xl font-bold">10.3%</p>
                <p className="text-xs text-amber-500 flex items-center mt-1">
                  <Fuel className="h-3 w-3 mr-1" /> Média otimizada IA
                </p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Fuel className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Score IA Médio</p>
                <p className="text-2xl font-bold">94.3</p>
                <p className="text-xs text-purple-500 flex items-center mt-1">
                  <Brain className="h-3 w-3 mr-1" /> Neural Network Score
                </p>
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
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Frota
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            Rotas IA
          </TabsTrigger>
          <TabsTrigger value="weather" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Meteorologia
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Status da Frota em Tempo Real
              </CardTitle>
              <CardDescription>
                Monitoramento neural de todas as embarcações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  <AnimatePresence>
                    {vessels.map((vessel, index) => (
                      <motion.div
                        key={vessel.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${getStatusColor(vessel.status)}/10`}>
                              <Ship className={`h-6 w-6 ${getStatusColor(vessel.status).replace('bg-', 'text-')}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {vessel.name}
                                <Badge variant="outline" className={getStatusColor(vessel.status).replace('bg-', 'border-')}>
                                  {vessel.status}
                                </Badge>
                              </h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {vessel.position.lat.toFixed(4)}, {vessel.position.lng.toFixed(4)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Navigation className="h-3 w-3" />
                                  {vessel.speed} nós
                                </span>
                                <span className="flex items-center gap-1">
                                  <Compass className="h-3 w-3" />
                                  {vessel.heading}°
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Eficiência</p>
                              <p className="text-lg font-semibold text-green-500">{vessel.fuelEfficiency}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">AI Score</p>
                              <p className="text-lg font-semibold text-primary">{vessel.aiScore}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">ETA</p>
                              <p className="text-sm font-medium">
                                {new Date(vessel.eta).toLocaleString('pt-BR', { 
                                  day: '2-digit', 
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
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

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Otimização Neural de Rotas
              </CardTitle>
              <CardDescription>
                Recomendações IA para economia de combustível e tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routeOptimizations.map((opt) => {
                  const vessel = vessels.find(v => v.id === opt.vesselId);
                  return (
                    <Card key={opt.id} className="border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold flex items-center gap-2">
                              {vessel?.name || 'Embarcação'}
                              <Badge variant="outline" className={
                                opt.weatherRisk === 'low' ? 'border-green-500 text-green-500' :
                                opt.weatherRisk === 'medium' ? 'border-amber-500 text-amber-500' :
                                'border-red-500 text-red-500'
                              }>
                                Risco: {opt.weatherRisk}
                              </Badge>
                            </h4>
                            <p className="text-sm text-muted-foreground mt-2">
                              {opt.recommendation}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="secondary">
                                Confiança: {opt.confidence}%
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-6">
                            <div className="text-center p-4 rounded-lg bg-green-500/10">
                              <Fuel className="h-5 w-5 text-green-500 mx-auto mb-1" />
                              <p className="text-lg font-bold text-green-500">-{opt.fuelSaving}%</p>
                              <p className="text-xs text-muted-foreground">Combustível</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-blue-500/10">
                              <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                              <p className="text-lg font-bold text-blue-500">-1.5h</p>
                              <p className="text-xs text-muted-foreground">Tempo</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-emerald-500/10">
                              <Target className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                              <p className="text-lg font-bold text-emerald-500">-{opt.co2Reduction}%</p>
                              <p className="text-xs text-muted-foreground">CO₂</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                            <Zap className="h-4 w-4 mr-1" /> Aplicar Rota
                          </Button>
                          <Button size="sm" variant="outline">
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Alertas Meteorológicos Inteligentes
              </CardTitle>
              <CardDescription>
                Previsões baseadas em IA com impacto operacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weatherAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold capitalize">{alert.type} - {alert.location}</h4>
                          <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Válido até: {new Date(alert.validUntil).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance da Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Gráfico de Performance</p>
                    <p className="text-sm">Dados em tempo real</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Consumo de Combustível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Fuel className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Análise de Consumo</p>
                    <p className="text-sm">Otimização contínua</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MaritimeAICommand;
