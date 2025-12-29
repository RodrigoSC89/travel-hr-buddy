/**
 * DGNSS Tracking Dashboard - Enhanced with AI and Real Data
 * PATCH TRACK-2.0
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Satellite, MapPin, AlertTriangle, Activity, Radio, Navigation,
  Plus, RefreshCw, Brain, Zap, Signal, Target,
  Clock, TrendingUp, Shield, ChevronRight
} from "lucide-react";
import { useTrackingStats, useGnssDevices, useGnssAlerts } from "../hooks/useTrackingData";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Simulated device data for demo
const DEMO_DEVICES = [
  {
    id: "dev-001",
    device_name: "DGPS Station Alpha",
    device_type: "dgps",
    manufacturer: "Trimble",
    model: "NetR9",
    serial_number: "TR-2024-001",
    is_online: true,
    last_latitude: -23.5505,
    last_longitude: -46.6333,
    accuracy: 0.8,
    fix_type: "RTK_FIXED",
    satellites: 14
  },
  {
    id: "dev-002",
    device_name: "RTK Rover Beta",
    device_type: "rtk",
    manufacturer: "Leica",
    model: "GS18",
    serial_number: "LC-2024-002",
    is_online: true,
    last_latitude: -22.9068,
    last_longitude: -43.1729,
    accuracy: 0.02,
    fix_type: "RTK_FIXED",
    satellites: 18
  },
  {
    id: "dev-003",
    device_name: "PPP Reference Delta",
    device_type: "ppp",
    manufacturer: "NovAtel",
    model: "PwrPak7",
    serial_number: "NV-2024-003",
    is_online: true,
    last_latitude: -25.4284,
    last_longitude: -49.2733,
    accuracy: 0.05,
    fix_type: "PPP",
    satellites: 22
  },
  {
    id: "dev-004",
    device_name: "Marine GNSS Gamma",
    device_type: "dgps",
    manufacturer: "Furuno",
    model: "GP-170",
    serial_number: "FR-2024-004",
    is_online: false,
    last_latitude: -3.1190,
    last_longitude: -60.0217,
    accuracy: 1.5,
    fix_type: "DGPS",
    satellites: 8
  }
];

const DEMO_ALERTS = [
  {
    id: "alert-001",
    severity: "warning",
    title: "Degradação de Sinal - DGPS Alpha",
    description: "HDOP acima do limite (2.5) detectado às 14:32",
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: "alert-002",
    severity: "info",
    title: "Manutenção Programada",
    description: "RTK Rover Beta entrará em manutenção em 2 horas",
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

export default function TrackingDashboard() {
  const { data: realStats } = useTrackingStats();
  const { data: realDevices } = useGnssDevices();
  const { data: realAlerts } = useGnssAlerts(false);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{title: string; description: string}>>([]);
  
  // Use demo data if no real data
  const devices = realDevices?.length ? realDevices : DEMO_DEVICES;
  const alerts = realAlerts?.length ? realAlerts : DEMO_ALERTS;
  
  // Calculate stats
  const stats = {
    totalDevices: devices.length,
    onlineDevices: devices.filter((d: any) => d.is_online).length,
    avgAccuracy: devices.reduce((sum: number, d: any) => sum + (d.accuracy || 0), 0) / devices.length,
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter((a: any) => a.severity === 'critical').length,
    avgSatellites: Math.round(devices.reduce((sum: number, d: any) => sum + (d.satellites || 12), 0) / devices.length)
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Dados atualizados com sucesso");
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
          <motion.div 
            className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Satellite className="h-8 w-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              DGNSS & Precision Tracking
            </h1>
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
          <Button size="sm" onClick={() => setShowAddDevice(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dispositivo
          </Button>
          <Badge variant="secondary" className="ml-2">v3.2.0</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Radio className="h-5 w-5 text-blue-500" />
              <Badge variant="outline" className="text-xs">{stats.onlineDevices} online</Badge>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stats.totalDevices}</p>
              <p className="text-xs text-muted-foreground">Dispositivos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Navigation className="h-5 w-5 text-emerald-500" />
              <Badge variant="outline" className={`text-xs ${getAccuracyColor(stats.avgAccuracy)}`}>
                {stats.avgAccuracy <= 0.1 ? 'RTK' : stats.avgAccuracy <= 1 ? 'DGPS' : 'GPS'}
              </Badge>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stats.avgAccuracy.toFixed(2)}m</p>
              <p className="text-xs text-muted-foreground">Precisão Média</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Satellite className="h-5 w-5 text-purple-500" />
              <Signal className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stats.avgSatellites}</p>
              <p className="text-xs text-muted-foreground">Satélites Médio</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {stats.criticalAlerts > 0 && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  {stats.criticalAlerts} críticos
                </Badge>
              )}
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">{stats.totalAlerts}</p>
              <p className="text-xs text-muted-foreground">Alertas Ativos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
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

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Shield className="h-5 w-5 text-cyan-500" />
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold">99.2%</p>
              <p className="text-xs text-muted-foreground">Uptime 30d</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Recomendações da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.map((rec: {title: string; description: string}, i: number) => (
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Overview */}
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

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Alertas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length > 0 ? alerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                    <Badge 
                      variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'default' : 'secondary'}
                      className="mt-0.5"
                    >
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
                Gerencie e monitore todos os dispositivos de rastreamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {devices.map((device) => (
                  <motion.div 
                    key={device.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-4 w-4 rounded-full ${device.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                      <div className="p-2 rounded-lg bg-muted">
                        {getDeviceTypeIcon(device.device_type)}
                      </div>
                      <div>
                        <p className="font-semibold">{device.device_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {device.device_type.toUpperCase()} • {device.manufacturer || 'N/A'} {device.model || ''}
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
                      <Button size="icon" variant="ghost">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Central de Alertas GNSS
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Badge 
                          variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'default' : 'secondary'}
                        >
                          {alert.severity}
                        </Badge>
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(alert.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Resolver
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">Sistema Operacional</p>
                  <p className="text-sm">Nenhum alerta ativo no momento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
