import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  BarChart3, 
  Star, 
  Globe, 
  Zap, 
  Shield, 
  Crown, 
  Diamond, 
  Activity,
  Users,
  Target,
  Plane,
  Ship,
  Navigation,
  Anchor
} from 'lucide-react';

interface LogisticsData {
  id: string;
  type: 'shipping' | 'air' | 'ground' | 'maritime';
  origin: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed';
  progress: number;
  estimatedDelivery: string;
  cost: number;
  weight: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const EnhancedLogisticsDashboard: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const logisticsData: LogisticsData[] = [
    {
      id: 'LOG-001',
      type: 'maritime',
      origin: 'Porto de Santos',
      destination: 'Porto de Vitória',
      status: 'in_transit',
      progress: 75,
      estimatedDelivery: '2024-01-20',
      cost: 15000,
      weight: 25000,
      priority: 'high'
    },
    {
      id: 'LOG-002',
      type: 'air',
      origin: 'São Paulo',
      destination: 'Rio de Janeiro',
      status: 'delivered',
      progress: 100,
      estimatedDelivery: '2024-01-18',
      cost: 8500,
      weight: 500,
      priority: 'critical'
    },
    {
      id: 'LOG-003',
      type: 'ground',
      origin: 'Belo Horizonte',
      destination: 'Brasília',
      status: 'pending',
      progress: 0,
      estimatedDelivery: '2024-01-25',
      cost: 3200,
      weight: 1200,
      priority: 'medium'
    }
  ];

  const quickStats = [
    { icon: Package, label: 'Cargas Ativas', value: '124', color: 'primary', trend: '+12%' },
    { icon: Truck, label: 'Em Trânsito', value: '89', color: 'info', trend: '+8%' },
    { icon: CheckCircle, label: 'Entregues Hoje', value: '45', color: 'success', trend: '+15%' },
    { icon: AlertTriangle, label: 'Atrasadas', value: '3', color: 'warning', trend: '-5%' }
  ];

  const transportModes = [
    { icon: Ship, name: 'Marítimo', count: 45, percentage: 36, color: 'info' },
    { icon: Plane, name: 'Aéreo', count: 32, percentage: 26, color: 'primary' },
    { icon: Truck, name: 'Terrestre', count: 38, percentage: 31, color: 'success' },
    { icon: Navigation, name: 'Multimodal', count: 9, percentage: 7, color: 'warning' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'in_transit': return 'info';
      case 'delayed': return 'destructive';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'maritime': return Ship;
      case 'air': return Plane;
      case 'ground': return Truck;
      default: return Package;
    }
  };

  const renderLogisticsTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Rota</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Entrega Prevista</TableHead>
            <TableHead>Custo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logisticsData.map((item) => {
            const Icon = getTransportIcon(item.type);
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="capitalize">
                      {item.type === 'maritime' ? 'Marítimo' : item.type === 'air' ? 'Aéreo' : 'Terrestre'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{item.origin} → {item.destination}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`bg-${getStatusColor(item.status)}/10 text-${getStatusColor(item.status)} border-${getStatusColor(item.status)}/30`}
                  >
                    {item.status === 'in_transit' ? 'Em Trânsito' : 
                     item.status === 'delivered' ? 'Entregue' : 
                     item.status === 'pending' ? 'Pendente' : 'Atrasado'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={item.progress} className="w-16" />
                    <span className="text-sm text-muted-foreground">{item.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`bg-${getPriorityColor(item.priority)}/10 text-${getPriorityColor(item.priority)} border-${getPriorityColor(item.priority)}/30`}
                  >
                    {item.priority === 'critical' ? 'Crítica' : 
                     item.priority === 'high' ? 'Alta' : 
                     item.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(item.estimatedDelivery).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.cost)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-info/5 to-primary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-info/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto p-6 space-y-8">
        {/* Enhanced Hero Section */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-info via-info/90 to-info-glow p-8 text-info-foreground 
          transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-success/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-info/20 backdrop-blur-sm animate-pulse-glow">
                <Truck className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg">
                  Logística Inteligente
                </h1>
                <p className="text-xl opacity-95 drop-shadow-md font-semibold">
                  Sistema avançado de gestão logística
                  <Crown className="inline-block w-6 h-6 ml-2 text-warning animate-bounce" />
                </p>
              </div>
            </div>
            
            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
              Plataforma revolucionária de logística com IA preditiva, otimização de rotas em tempo real 
              e gestão completa de cargas marítimas, aéreas e terrestres.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-primary shadow-lg border border-primary/30">
                <Zap className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Automação Total</span>
              </div>
              <div className="flex items-center gap-2 bg-success/90 text-success-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-success shadow-lg border border-success/30">
                <Globe className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Rastreamento Global</span>
              </div>
              <div className="flex items-center gap-2 bg-warning/90 text-warning-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-warning shadow-lg border border-warning/30">
                <Diamond className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Otimização Máxima</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl
              bg-gradient-to-br from-card via-card/95 to-${stat.color}/5 border-${stat.color}/20 hover:border-${stat.color}/40`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-${stat.color}/20 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className={`w-3 h-3 text-${stat.color}`} />
                    <span className={`text-xs text-${stat.color} font-medium`}>{stat.trend}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl h-14 bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-5 w-5" />
                <span className="hidden md:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="shipments" className="flex items-center gap-2 data-[state=active]:bg-info data-[state=active]:text-info-foreground">
                <Package className="h-5 w-5" />
                <span className="hidden md:inline">Carregamentos</span>
              </TabsTrigger>
              <TabsTrigger value="routes" className="flex items-center gap-2 data-[state=active]:bg-success data-[state=active]:text-success-foreground">
                <MapPin className="h-5 w-5" />
                <span className="hidden md:inline">Rotas</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">
                <Activity className="h-5 w-5" />
                <span className="hidden md:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Transport Modes */}
              <Card className="lg:col-span-2 bg-gradient-to-br from-card via-card/95 to-primary/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-gradient">Distribuição por Modal</span>
                    <Star className="w-6 h-6 text-warning animate-pulse" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transportModes.map((mode, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${mode.color}/20`}>
                              <mode.icon className={`w-4 h-4 text-${mode.color}`} />
                            </div>
                            <span className="font-medium">{mode.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold">{mode.count}</span>
                            <span className="text-sm text-muted-foreground ml-2">({mode.percentage}%)</span>
                          </div>
                        </div>
                        <Progress value={mode.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-card via-card/95 to-info/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-info" />
                    Ações Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Package className="w-4 h-4" />
                    Novo Carregamento
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <MapPin className="w-4 h-4" />
                    Rastrear Carga
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <Calendar className="w-4 h-4" />
                    Agendar Coleta
                  </Button>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <BarChart3 className="w-4 h-4" />
                    Relatório de Performance
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shipments" className="space-y-6">
            <Card className="bg-gradient-to-br from-card via-card/95 to-info/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-info/20 to-info/10">
                    <Package className="w-6 h-6 text-info" />
                  </div>
                  <span className="text-gradient">Carregamentos Ativos</span>
                  <Star className="w-6 h-6 text-warning animate-pulse" />
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  Gestão completa de cargas e logística
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    {logisticsData.length} Ativos
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderLogisticsTable()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes" className="space-y-6">
            <Card className="bg-gradient-to-br from-card via-card/95 to-success/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-success/10">
                    <MapPin className="w-6 h-6 text-success" />
                  </div>
                  <span className="text-gradient">Otimização de Rotas</span>
                  <Star className="w-6 h-6 text-warning animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 inline-block mb-6">
                    <MapPin className="h-16 w-16 text-success mx-auto animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gradient">
                    Sistema de Rotas Inteligente
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                    Mapa interativo com otimização de rotas em tempo real será disponibilizado em breve
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      IA Preditiva
                    </Badge>
                    <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                      Tempo Real
                    </Badge>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                      Otimização Automática
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gradient-to-br from-card via-card/95 to-warning/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10">
                    <Activity className="w-6 h-6 text-warning" />
                  </div>
                  <span className="text-gradient">Analytics Avançado</span>
                  <Star className="w-6 h-6 text-warning animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 inline-block mb-6">
                    <Activity className="h-16 w-16 text-warning mx-auto animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gradient">
                    Analytics em Desenvolvimento
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                    Dashboard analítico completo com métricas avançadas e insights de performance
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      KPIs em Tempo Real
                    </Badge>
                    <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                      Previsões IA
                    </Badge>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      Relatórios Automáticos
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedLogisticsDashboard;