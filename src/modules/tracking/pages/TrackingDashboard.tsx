/**
 * DGNSS Tracking Dashboard - Simplified
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Satellite, MapPin, AlertTriangle, Activity, Radio, Navigation,
  RefreshCw, Brain, Zap, Signal, Target, Clock, TrendingUp, Shield
} from "lucide-react";
import { toast } from "sonner";

// Simulated device data
const DEMO_DEVICES = [
  { id: "dev-001", device_name: "DGPS Station Alpha", device_type: "dgps", manufacturer: "Trimble", model: "NetR9", serial_number: "TR-2024-001", is_online: true, accuracy: 0.8, fix_type: "RTK_FIXED", satellites: 14 },
  { id: "dev-002", device_name: "RTK Rover Beta", device_type: "rtk", manufacturer: "Leica", model: "GS18", serial_number: "LC-2024-002", is_online: true, accuracy: 0.02, fix_type: "RTK_FIXED", satellites: 18 },
  { id: "dev-003", device_name: "PPP Reference Delta", device_type: "ppp", manufacturer: "NovAtel", model: "PwrPak7", serial_number: "NV-2024-003", is_online: true, accuracy: 0.05, fix_type: "PPP", satellites: 22 },
  { id: "dev-004", device_name: "Marine GNSS Gamma", device_type: "dgps", manufacturer: "Furuno", model: "GP-170", serial_number: "FR-2024-004", is_online: false, accuracy: 1.5, fix_type: "DGPS", satellites: 8 },
];

const DEMO_ALERTS = [
  { id: "alert-001", severity: "warning", title: "Degradação de Sinal - DGPS Alpha", description: "HDOP acima do limite (2.5)", created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: "alert-002", severity: "info", title: "Manutenção Programada", description: "RTK Rover Beta entrará em manutenção", created_at: new Date(Date.now() - 3600000).toISOString() },
];

export default function TrackingDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{title: string; description: string}>>([]);
  
  const devices = DEMO_DEVICES;
  const alerts = DEMO_ALERTS;
  
  const stats = {
    totalDevices: devices.length,
    onlineDevices: devices.filter(d => d.is_online).length,
    avgAccuracy: devices.reduce((sum, d) => sum + d.accuracy, 0) / devices.length,
    totalAlerts: alerts.length,
    avgSatellites: Math.round(devices.reduce((sum, d) => sum + d.satellites, 0) / devices.length)
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Dados atualizados");
    setIsRefreshing(false);
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 1500));
    setRecommendations([
      { title: "Otimizar correções RTK", description: "Aumente a taxa de atualização para 10Hz" },
      { title: "Verificar antena DGPS Alpha", description: "Sinal degradado detectado" }
    ]);
    toast.success("Análise IA concluída");
    setIsAnalyzing(false);
  };

  const getDeviceTypeIcon = (type: string) => {
    switch (type) {
      case 'rtk': return <Target className="h-4 w-4 text-emerald-500" />;
      case 'dgps': return <Satellite className="h-4 w-4 text-blue-500" />;
      default: return <Radio className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 0.05) return "text-emerald-500";
    if (accuracy <= 0.5) return "text-blue-500";
    if (accuracy <= 2) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
            <Satellite className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">DGNSS & Precision Tracking</h1>
            <p className="text-muted-foreground">Rastreamento GNSS de Alta Precisão</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAIAnalysis} disabled={isAnalyzing}>
            <Brain className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            {isAnalyzing ? 'Analisando...' : 'Análise IA'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Radio className="h-5 w-5 text-blue-500" />
              <Badge variant="outline">{stats.onlineDevices} online</Badge>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stats.totalDevices}</p>
              <p className="text-xs text-muted-foreground">Dispositivos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Navigation className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stats.avgAccuracy.toFixed(2)}m</p>
              <p className="text-xs text-muted-foreground">Precisão Média</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Satellite className="h-5 w-5 text-purple-500" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stats.avgSatellites}</p>
              <p className="text-xs text-muted-foreground">Satélites Médio</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stats.totalAlerts}</p>
              <p className="text-xs text-muted-foreground">Alertas Ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-green-500" />
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="mt-2">
              <Badge className="bg-green-500 text-white">Operacional</Badge>
              <p className="text-xs text-muted-foreground mt-1">Sistema Ativo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-secondary/30 bg-gradient-to-r from-secondary/5 to-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-secondary" />
              Recomendações da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <Zap className="h-4 w-4 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{rec.title}</p>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5" />
                  Status dos Dispositivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {devices.slice(0, 4).map((device) => (
                  <div key={device.id} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                    <div className={`h-3 w-3 rounded-full ${device.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    {getDeviceTypeIcon(device.device_type)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{device.device_name}</p>
                      <p className="text-xs text-muted-foreground">{device.manufacturer} {device.model}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-sm ${getAccuracyColor(device.accuracy)}`}>
                        ±{device.accuracy.toFixed(2)}m
                      </p>
                      <p className="text-xs text-muted-foreground">{device.satellites} sats</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Alertas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length > 0 ? alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                    <Badge variant={alert.severity === 'warning' ? 'default' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>Nenhum alerta ativo</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="h-5 w-5" />
                Dispositivos GNSS
              </CardTitle>
              <CardDescription>
                Gerencie e monitore todos os dispositivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className={`h-4 w-4 rounded-full ${device.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                      <div className="p-2 rounded-lg bg-muted">
                        {getDeviceTypeIcon(device.device_type)}
                      </div>
                      <div>
                        <p className="font-semibold">{device.device_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {device.device_type.toUpperCase()} • {device.manufacturer} {device.model}
                        </p>
                        <p className="text-xs text-muted-foreground">S/N: {device.serial_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-mono font-semibold ${getAccuracyColor(device.accuracy)}`}>
                          ±{device.accuracy.toFixed(2)}m
                        </p>
                        <p className="text-xs text-muted-foreground">{device.fix_type}</p>
                        <p className="text-xs text-muted-foreground">{device.satellites} satélites</p>
                      </div>
                      <Badge variant={device.is_online ? "default" : "secondary"}>
                        {device.is_online ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Todos os Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-4 border rounded-lg">
                    <Badge variant={alert.severity === 'warning' ? 'default' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Resolver</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
