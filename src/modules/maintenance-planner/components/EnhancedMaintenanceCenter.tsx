/**
 * Enhanced Maintenance Center - Maintenance Premium Experience
 * PATCH MAINTENANCE-2.0 - Complete predictive maintenance with AI
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Wrench, AlertTriangle, CheckCircle, Clock, Calendar, Brain,
  RefreshCw, Plus, Search, Filter, Ship, Activity, Gauge,
  Thermometer, Droplets, Zap, TrendingUp, TrendingDown, Settings,
  FileText, Users, Package, BarChart3, Timer, AlertCircle,
  ChevronRight, Target, PlayCircle, PauseCircle, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format, addDays, differenceInDays, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Types
interface MaintenanceKPI {
  id: string;
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  icon: React.ReactNode;
  color: string;
}

interface WorkOrder {
  id: string;
  title: string;
  equipment: string;
  vessel: string;
  type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'overdue';
  assignedTo: string;
  scheduledDate: Date;
  estimatedHours: number;
  completedHours?: number;
  runningHours?: number;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  vessel: string;
  status: 'operational' | 'degraded' | 'critical' | 'offline';
  healthScore: number;
  runningHours: number;
  nextMaintenance: Date;
  lastMaintenance: Date;
  riskProbability: number;
}

interface PredictiveForecast {
  id: string;
  equipment: string;
  vessel: string;
  failureProbability: number;
  estimatedDays: number;
  riskFactors: string[];
  recommendation: string;
  confidence: number;
}

interface SparePartStock {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  quantity: number;
  minStock: number;
  location: string;
  status: 'ok' | 'low' | 'critical' | 'out_of_stock';
}

export const EnhancedMaintenanceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [kpis, setKpis] = useState<MaintenanceKPI[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [predictions, setPredictions] = useState<PredictiveForecast[]>([]);
  const [spareParts, setSpareParts] = useState<SparePartStock[]>([]);

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // KPIs
      setKpis([
        {
          id: 'mtbf',
          title: 'MTBF',
          value: 2450,
          unit: 'horas',
          trend: 'up',
          trendValue: 8.5,
          icon: <Timer className="h-5 w-5" />,
          color: 'text-green-500'
        },
        {
          id: 'mttr',
          title: 'MTTR',
          value: 4.2,
          unit: 'horas',
          trend: 'down',
          trendValue: 12.3,
          icon: <Wrench className="h-5 w-5" />,
          color: 'text-blue-500'
        },
        {
          id: 'uptime',
          title: 'Disponibilidade',
          value: 97.8,
          unit: '%',
          trend: 'up',
          trendValue: 1.2,
          icon: <Activity className="h-5 w-5" />,
          color: 'text-primary'
        },
        {
          id: 'pending',
          title: 'OS Pendentes',
          value: 12,
          unit: '',
          trend: 'down',
          trendValue: 25,
          icon: <FileText className="h-5 w-5" />,
          color: 'text-yellow-500'
        }
      ]);

      // Work Orders
      setWorkOrders([
        {
          id: 'WO-2024-001',
          title: 'Troca de filtros do motor principal',
          equipment: 'Motor Principal MAN B&W',
          vessel: 'MV Atlantic Star',
          type: 'preventive',
          priority: 'medium',
          status: 'in_progress',
          assignedTo: 'Equipe de Máquinas',
          scheduledDate: new Date(),
          estimatedHours: 8,
          completedHours: 4,
          runningHours: 12500
        },
        {
          id: 'WO-2024-002',
          title: 'Reparo no sistema hidráulico do guindaste',
          equipment: 'Guindaste Principal #1',
          vessel: 'MV Pacific Explorer',
          type: 'corrective',
          priority: 'high',
          status: 'pending',
          assignedTo: 'João Silva',
          scheduledDate: addDays(new Date(), 1),
          estimatedHours: 12,
          runningHours: 8200
        },
        {
          id: 'WO-2024-003',
          title: 'Manutenção preditiva - Bomba de lastro',
          equipment: 'Bomba de Lastro #2',
          vessel: 'MV Ocean Titan',
          type: 'predictive',
          priority: 'medium',
          status: 'pending',
          assignedTo: 'Carlos Santos',
          scheduledDate: addDays(new Date(), 3),
          estimatedHours: 6,
          runningHours: 15800
        },
        {
          id: 'WO-2024-004',
          title: 'Emergência - Falha no gerador auxiliar',
          equipment: 'Gerador Auxiliar #1',
          vessel: 'MV Caribbean Queen',
          type: 'emergency',
          priority: 'critical',
          status: 'in_progress',
          assignedTo: 'Equipe de Emergência',
          scheduledDate: new Date(),
          estimatedHours: 24,
          completedHours: 8
        },
        {
          id: 'WO-2024-005',
          title: 'Inspeção do sistema de propulsão',
          equipment: 'Sistema de Propulsão',
          vessel: 'MV Atlantic Star',
          type: 'preventive',
          priority: 'low',
          status: 'completed',
          assignedTo: 'Roberto Lima',
          scheduledDate: addDays(new Date(), -2),
          estimatedHours: 4,
          completedHours: 3.5,
          runningHours: 12500
        }
      ]);

      // Equipment
      setEquipments([
        {
          id: '1',
          name: 'Motor Principal MAN B&W',
          category: 'Propulsão',
          vessel: 'MV Atlantic Star',
          status: 'operational',
          healthScore: 92,
          runningHours: 12500,
          nextMaintenance: addDays(new Date(), 15),
          lastMaintenance: addDays(new Date(), -45),
          riskProbability: 8
        },
        {
          id: '2',
          name: 'Guindaste Principal #1',
          category: 'Convés',
          vessel: 'MV Pacific Explorer',
          status: 'degraded',
          healthScore: 68,
          runningHours: 8200,
          nextMaintenance: addDays(new Date(), 1),
          lastMaintenance: addDays(new Date(), -60),
          riskProbability: 42
        },
        {
          id: '3',
          name: 'Gerador Auxiliar #1',
          category: 'Elétrica',
          vessel: 'MV Caribbean Queen',
          status: 'critical',
          healthScore: 35,
          runningHours: 18500,
          nextMaintenance: new Date(),
          lastMaintenance: addDays(new Date(), -90),
          riskProbability: 85
        },
        {
          id: '4',
          name: 'Bomba de Lastro #2',
          category: 'Sistemas',
          vessel: 'MV Ocean Titan',
          status: 'operational',
          healthScore: 78,
          runningHours: 15800,
          nextMaintenance: addDays(new Date(), 7),
          lastMaintenance: addDays(new Date(), -30),
          riskProbability: 22
        }
      ]);

      // Predictions
      setPredictions([
        {
          id: '1',
          equipment: 'Gerador Auxiliar #1',
          vessel: 'MV Caribbean Queen',
          failureProbability: 85,
          estimatedDays: 3,
          riskFactors: ['Vibração anormal', 'Temperatura elevada', 'Horas de operação excedidas'],
          recommendation: 'Manutenção imediata recomendada. Risco de falha catastrófica.',
          confidence: 92
        },
        {
          id: '2',
          equipment: 'Guindaste Principal #1',
          vessel: 'MV Pacific Explorer',
          failureProbability: 42,
          estimatedDays: 12,
          riskFactors: ['Vazamento hidráulico detectado', 'Desgaste de componentes'],
          recommendation: 'Programar manutenção preventiva nos próximos 10 dias.',
          confidence: 78
        },
        {
          id: '3',
          equipment: 'Compressor de Ar #2',
          vessel: 'MV Atlantic Star',
          failureProbability: 28,
          estimatedDays: 25,
          riskFactors: ['Pressão ligeiramente abaixo do normal'],
          recommendation: 'Monitorar nos próximos dias. Incluir na próxima manutenção programada.',
          confidence: 65
        }
      ]);

      // Spare Parts
      setSpareParts([
        { id: '1', name: 'Filtro de óleo motor', partNumber: 'MAN-F-001', category: 'Filtros', quantity: 12, minStock: 10, location: 'Almoxarifado A', status: 'ok' },
        { id: '2', name: 'Junta do cabeçote', partNumber: 'HG-234', category: 'Vedação', quantity: 3, minStock: 5, location: 'Almoxarifado B', status: 'low' },
        { id: '3', name: 'Rolamento 6205', partNumber: 'SKF-6205', category: 'Rolamentos', quantity: 0, minStock: 8, location: 'Almoxarifado A', status: 'out_of_stock' },
        { id: '4', name: 'Bomba hidráulica', partNumber: 'HYD-P-500', category: 'Hidráulica', quantity: 2, minStock: 3, location: 'Almoxarifado C', status: 'critical' },
        { id: '5', name: 'Correia dentada', partNumber: 'TB-456', category: 'Transmissão', quantity: 15, minStock: 6, location: 'Almoxarifado A', status: 'ok' },
      ]);

    } catch (error) {
      console.error('Error loading maintenance data:', error);
      toast.error('Erro ao carregar dados de manutenção');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'completed':
      case 'ok':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'degraded':
      case 'in_progress':
      case 'low':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'critical':
      case 'overdue':
      case 'out_of_stock':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'pending':
      case 'on_hold':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'offline':
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <Calendar className="h-4 w-4" />;
      case 'corrective': return <Wrench className="h-4 w-4" />;
      case 'predictive': return <Brain className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const handleStartWorkOrder = (id: string) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === id ? { ...wo, status: 'in_progress' } : wo
    ));
    toast.success('Ordem de serviço iniciada');
  };

  const handleCompleteWorkOrder = (id: string) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === id ? { ...wo, status: 'completed', completedHours: wo.estimatedHours } : wo
    ));
    toast.success('Ordem de serviço concluída');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20">
            <Wrench className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Centro de Manutenção</h1>
            <p className="text-muted-foreground">Gestão inteligente de manutenção com IA preditiva</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar equipamento..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={loadMaintenanceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova OS
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{kpi.title}</span>
                  <div className={kpi.color}>{kpi.icon}</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{kpi.value}</span>
                  <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm text-green-500">
                    {kpi.trendValue}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs mês anterior</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="workorders" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Ordens de Serviço
            {workOrders.filter(wo => wo.status === 'pending' || wo.status === 'overdue').length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {workOrders.filter(wo => wo.status === 'pending' || wo.status === 'overdue').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Equipamentos
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Preditiva IA
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Estoque
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Work Orders by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Ordens de Serviço por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'in_progress', label: 'Em Andamento', count: workOrders.filter(wo => wo.status === 'in_progress').length, color: 'bg-blue-500' },
                    { status: 'pending', label: 'Pendentes', count: workOrders.filter(wo => wo.status === 'pending').length, color: 'bg-yellow-500' },
                    { status: 'completed', label: 'Concluídas', count: workOrders.filter(wo => wo.status === 'completed').length, color: 'bg-green-500' },
                    { status: 'overdue', label: 'Atrasadas', count: workOrders.filter(wo => wo.status === 'overdue').length, color: 'bg-red-500' },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="flex-1">{item.label}</span>
                      <span className="font-bold text-lg">{item.count}</span>
                      <Progress value={(item.count / workOrders.length) * 100} className="w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Saúde dos Equipamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipments.slice(0, 4).map((eq) => (
                    <div key={eq.id} className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${getStatusColor(eq.status)}`}>
                        <Gauge className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{eq.name}</p>
                        <p className="text-xs text-muted-foreground">{eq.vessel}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${
                          eq.healthScore >= 80 ? 'text-green-500' : 
                          eq.healthScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {eq.healthScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          {predictions.filter(p => p.failureProbability >= 70).length > 0 && (
            <Card className="border-red-500/50 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas Críticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.filter(p => p.failureProbability >= 70).map((pred) => (
                    <div key={pred.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">{pred.equipment}</p>
                          <p className="text-sm text-muted-foreground">{pred.vessel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="destructive">
                          {pred.failureProbability}% risco
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ~{pred.estimatedDays} dias
                        </span>
                        <Button size="sm" variant="destructive">
                          Ação Imediata
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Work Orders Tab */}
        <TabsContent value="workorders" className="space-y-4">
          <div className="grid gap-4">
            {workOrders.map((wo) => (
              <Card key={wo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${getPriorityColor(wo.priority)}`}>
                        {getTypeIcon(wo.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">{wo.id}</span>
                          <h3 className="font-semibold">{wo.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Settings className="h-3 w-3" />
                            {wo.equipment}
                          </span>
                          <span className="flex items-center gap-1">
                            <Ship className="h-3 w-3" />
                            {wo.vessel}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {wo.assignedTo}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(wo.scheduledDate, 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {wo.status === 'in_progress' && wo.completedHours !== undefined && (
                        <div className="w-32">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>{Math.round((wo.completedHours / wo.estimatedHours) * 100)}%</span>
                          </div>
                          <Progress value={(wo.completedHours / wo.estimatedHours) * 100} className="h-2" />
                        </div>
                      )}
                      <Badge className={getStatusColor(wo.status)}>
                        {wo.status === 'in_progress' ? 'Em Andamento' :
                         wo.status === 'pending' ? 'Pendente' :
                         wo.status === 'completed' ? 'Concluída' :
                         wo.status === 'overdue' ? 'Atrasada' : 'Em Espera'}
                      </Badge>
                      <div className="flex gap-2">
                        {wo.status === 'pending' && (
                          <Button size="sm" onClick={() => handleStartWorkOrder(wo.id)}>
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {wo.status === 'in_progress' && (
                          <Button size="sm" variant="outline" onClick={() => handleCompleteWorkOrder(wo.id)}>
                            <CheckSquare className="h-4 w-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipments.map((eq) => (
              <Card key={eq.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(eq.status)}`}>
                        <Gauge className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{eq.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{eq.category}</Badge>
                          <span>{eq.vessel}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(eq.status)}>
                      {eq.status === 'operational' ? 'Operacional' :
                       eq.status === 'degraded' ? 'Degradado' :
                       eq.status === 'critical' ? 'Crítico' : 'Offline'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Health Score</p>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={eq.healthScore} 
                          className={`flex-1 h-2 ${
                            eq.healthScore < 60 ? '[&>div]:bg-red-500' : 
                            eq.healthScore < 80 ? '[&>div]:bg-yellow-500' : ''
                          }`}
                        />
                        <span className={`font-bold ${
                          eq.healthScore >= 80 ? 'text-green-500' : 
                          eq.healthScore >= 60 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {eq.healthScore}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Horas de Operação</p>
                      <p className="font-bold">{eq.runningHours.toLocaleString('pt-BR')} h</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Próxima Manutenção</p>
                      <p className="font-medium">
                        {format(eq.nextMaintenance, 'dd/MM/yyyy')}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({differenceInDays(eq.nextMaintenance, new Date())} dias)
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Risco de Falha</p>
                      <Badge className={eq.riskProbability > 50 ? 'bg-red-500' : eq.riskProbability > 25 ? 'bg-yellow-500' : 'bg-green-500'}>
                        {eq.riskProbability}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictive Tab */}
        <TabsContent value="predictive" className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Análise Preditiva com IA</h3>
              <p className="text-sm text-muted-foreground">Previsões baseadas em machine learning e dados históricos</p>
            </div>
          </div>

          <div className="grid gap-4">
            {predictions.map((pred) => (
              <Card key={pred.id} className={`${pred.failureProbability >= 70 ? 'border-red-500/50' : pred.failureProbability >= 40 ? 'border-yellow-500/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        pred.failureProbability >= 70 ? 'bg-red-500/10' :
                        pred.failureProbability >= 40 ? 'bg-yellow-500/10' : 'bg-green-500/10'
                      }`}>
                        <Brain className={`h-6 w-6 ${
                          pred.failureProbability >= 70 ? 'text-red-500' :
                          pred.failureProbability >= 40 ? 'text-yellow-500' : 'text-green-500'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{pred.equipment}</h4>
                        <p className="text-sm text-muted-foreground">{pred.vessel}</p>
                        
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Fatores de Risco:</p>
                          <div className="flex flex-wrap gap-2">
                            {pred.riskFactors.map((factor, i) => (
                              <Badge key={i} variant="outline">{factor}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <p className="mt-3 text-sm bg-muted/50 p-2 rounded">
                          <strong>Recomendação:</strong> {pred.recommendation}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${
                        pred.failureProbability >= 70 ? 'text-red-500' :
                        pred.failureProbability >= 40 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                        {pred.failureProbability}%
                      </div>
                      <p className="text-sm text-muted-foreground">prob. falha</p>
                      <p className="text-sm mt-2">~{pred.estimatedDays} dias</p>
                      <Badge variant="outline" className="mt-2">
                        {pred.confidence}% confiança
                      </Badge>
                      <Button className="mt-4 w-full" size="sm">
                        Criar OS Preventiva
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Estoque de Peças de Reposição
              </CardTitle>
              <CardDescription>Controle de inventário com alertas de estoque baixo</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Peça</th>
                    <th className="text-left p-3 font-medium">P/N</th>
                    <th className="text-left p-3 font-medium">Categoria</th>
                    <th className="text-left p-3 font-medium">Quantidade</th>
                    <th className="text-left p-3 font-medium">Mínimo</th>
                    <th className="text-left p-3 font-medium">Local</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {spareParts.map((part) => (
                    <tr key={part.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{part.name}</td>
                      <td className="p-3 font-mono text-sm">{part.partNumber}</td>
                      <td className="p-3">{part.category}</td>
                      <td className="p-3">
                        <span className={part.quantity <= part.minStock ? 'text-red-500 font-bold' : ''}>
                          {part.quantity}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{part.minStock}</td>
                      <td className="p-3 text-sm">{part.location}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(part.status)}>
                          {part.status === 'ok' ? 'OK' :
                           part.status === 'low' ? 'Baixo' :
                           part.status === 'critical' ? 'Crítico' : 'Sem Estoque'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Requisitar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedMaintenanceCenter;
