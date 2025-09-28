import React, { Suspense, useState } from 'react';
import { Radio, Thermometer, Zap, Waves, Activity, AlertTriangle, CheckCircle, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Lazy loading do dashboard IoT
const IoTDashboard = React.lazy(() => 
  import('@/components/innovation/iot-dashboard').then(module => ({
    default: module.IoTDashboard
  }))
);

const IoT: React.FC = () => {
  const [selectedVessel, setSelectedVessel] = useState('nautilus-alpha');

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/20">
          <Radio className="h-8 w-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            IoT Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitoramento e controle de dispositivos conectados em tempo real
          </p>
        </div>
      </div>

      {/* Status Global */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Wifi className="h-4 w-4" />
              Dispositivos Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">342</span>
              <Badge className="bg-green-100 text-green-700">99.2%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Activity className="h-4 w-4" />
              Sensores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">1,247</span>
              <Badge className="bg-blue-100 text-blue-700">Tempo Real</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              Alertas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">7</span>
              <Badge variant="destructive">Requer Atenção</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <CheckCircle className="h-4 w-4" />
              Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-600">96.8%</span>
              <Badge className="bg-purple-100 text-purple-700">Excelente</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sensors">Sensores</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="control">Controle</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">Carregando dashboard IoT...</p>
              </div>
            </div>
          }>
            <IoTDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  Sensor de Temperatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Motor Principal</span>
                    <Badge className="bg-green-100 text-green-700">Normal</Badge>
                  </div>
                  <div className="text-3xl font-bold text-red-500">78°C</div>
                  <Progress value={65} className="w-full" />
                  <p className="text-xs text-muted-foreground">Faixa normal: 60-85°C</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Sensor de Energia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Consumo Atual</span>
                    <Badge className="bg-blue-100 text-blue-700">Eficiente</Badge>
                  </div>
                  <div className="text-3xl font-bold text-yellow-500">245 kW</div>
                  <Progress value={82} className="w-full" />
                  <p className="text-xs text-muted-foreground">Eficiência: 96.2%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-blue-500" />
                  Sensor de Pressão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sistema Hidráulico</span>
                    <Badge className="bg-orange-100 text-orange-700">Atenção</Badge>
                  </div>
                  <div className="text-3xl font-bold text-blue-500">3.2 bar</div>
                  <Progress value={90} className="w-full" />
                  <p className="text-xs text-muted-foreground">Limite: 3.5 bar</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Sensor de Vibração
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Motor Auxiliar</span>
                    <Badge className="bg-green-100 text-green-700">Normal</Badge>
                  </div>
                  <div className="text-3xl font-bold text-green-500">2.1 mm/s</div>
                  <Progress value={35} className="w-full" />
                  <p className="text-xs text-muted-foreground">Padrão ideal: 0-4 mm/s</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-purple-500" />
                  Conectividade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sinal 4G/5G</span>
                    <Badge className="bg-green-100 text-green-700">Forte</Badge>
                  </div>
                  <div className="text-3xl font-bold text-purple-500">-65 dBm</div>
                  <Progress value={85} className="w-full" />
                  <p className="text-xs text-muted-foreground">Latência: 12ms</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-cyan-500" />
                  Sensor Ambiental
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sala de Máquinas</span>
                    <Badge className="bg-green-100 text-green-700">Ideal</Badge>
                  </div>
                  <div className="text-3xl font-bold text-cyan-500">28°C</div>
                  <Progress value={45} className="w-full" />
                  <p className="text-xs text-muted-foreground">Umidade: 62%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">Pressão Alta no Sistema Hidráulico</h4>
                    <p className="text-sm text-red-700">Sensor ID: HYD-001 | Embarcação: Nautilus Alpha</p>
                    <p className="text-xs text-red-600 mt-1">Há 5 minutos</p>
                  </div>
                  <Badge variant="destructive">Crítico</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-900">Temperatura Elevada Detectada</h4>
                    <p className="text-sm text-orange-700">Sensor ID: TEMP-003 | Motor Auxiliar</p>
                    <p className="text-xs text-orange-600 mt-1">Há 12 minutos</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">Alta</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900">Perda Intermitente de Conectividade</h4>
                    <p className="text-sm text-yellow-700">Dispositivo: IoT-Gateway-02 | Ponte de Comando</p>
                    <p className="text-xs text-yellow-600 mt-1">Há 8 minutos</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">Média</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Sistema de Backup Ativado</h4>
                    <p className="text-sm text-blue-700">Energia auxiliar funcionando normalmente</p>
                    <p className="text-xs text-blue-600 mt-1">Há 15 minutos</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Info</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Consumo Energético</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Última Hora</span>
                    <span className="text-sm font-medium text-green-600">-3.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Últimas 24h</span>
                    <span className="text-sm font-medium text-blue-600">+1.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Última Semana</span>
                    <span className="text-sm font-medium text-green-600">-5.4%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mês Atual</span>
                    <span className="text-sm font-medium text-green-600">-8.1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance dos Sensores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Disponibilidade</span>
                    <span className="text-sm font-medium text-green-600">99.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Precisão Média</span>
                    <span className="text-sm font-medium text-blue-600">98.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Latência Média</span>
                    <span className="text-sm font-medium text-green-600">8ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Erro</span>
                    <span className="text-sm font-medium text-green-600">0.03%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="control" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Controle de Energia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sistema Principal</span>
                  <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                </div>
                <Button className="w-full" variant="outline">Alternar para Backup</Button>
                <Button className="w-full" variant="outline">Configurar Economia</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Calibração de Sensores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Última Calibração</span>
                  <span className="text-xs text-muted-foreground">2 dias atrás</span>
                </div>
                <Button className="w-full" variant="outline">Calibrar Todos</Button>
                <Button className="w-full" variant="outline">Calibração Seletiva</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-purple-500" />
                  Configurações de Rede
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Modo de Conectividade</span>
                  <Badge className="bg-blue-100 text-blue-700">4G/WiFi</Badge>
                </div>
                <Button className="w-full" variant="outline">Otimizar Banda</Button>
                <Button className="w-full" variant="outline">Configurar Redundância</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IoT;