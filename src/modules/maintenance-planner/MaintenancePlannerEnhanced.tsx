/**
 * Enhanced Maintenance Planner with Premium UX
 * PATCH MAINTENANCE-3.0 - Ultimate Maintenance Experience
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Wrench, Calendar, CheckCircle, AlertTriangle, Plus, Download, 
  Bell, Bot, Ship, Activity, LayoutGrid, Clock, FileText, Box,
  TrendingUp, Gauge, Settings, Zap, Brain, RefreshCw, Sparkles,
  Timer, AlertCircle, Target, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ModuleOnboarding, QuickActionsBar, InteractiveKPICard, ActionableAlertList } from "@/components/ui/module-enhancements";

// Import existing components
import { MaintenanceCalendarView } from "./components/MaintenanceCalendarView";
import { MaintenanceTimelineView } from "./components/MaintenanceTimelineView";
import { MaintenanceTasksTable } from "./components/MaintenanceTasksTable";
import { CreateMaintenancePlanDialog } from "./components/CreateMaintenancePlanDialog";
import { MaintenanceAlertsPanel } from "./components/MaintenanceAlertsPanel";
import { FleetHealthPanel } from "./components/FleetHealthPanel";
import { JobsCenter } from "./components/JobsCenter";
import HourometerManager from "./components/HourometerManager";
import WorkOrderManager from "./components/WorkOrderManager";
import AdvancedCopilot from "./components/AdvancedCopilot";
import DigitalTwin from "./components/DigitalTwin";

const MaintenancePlannerEnhanced = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [showNewWorkOrder, setShowNewWorkOrder] = useState(false);

  // Onboarding steps
  const onboardingSteps = [
    {
      title: 'Manutenção Inteligente (MMI)',
      description: 'Sistema premium de gestão de manutenção naval com IA preditiva e Digital Twin.',
      icon: <Wrench className="h-6 w-6 text-orange-500" />,
      tip: 'O sistema aprende com seus dados para prever falhas antes que aconteçam'
    },
    {
      title: 'Monitoramento de Saúde',
      description: 'Veja o status de saúde de todos os equipamentos da frota em tempo real.',
      icon: <Activity className="h-6 w-6 text-green-500" />,
      tip: 'Clique em qualquer equipamento para ver detalhes e histórico'
    },
    {
      title: 'Copilot de IA',
      description: 'Assistente inteligente que sugere manutenções e otimiza cronogramas automaticamente.',
      icon: <Bot className="h-6 w-6 text-purple-500" />,
      tip: 'Pergunte ao Copilot sobre qualquer equipamento ou manutenção'
    },
    {
      title: 'Digital Twin 3D',
      description: 'Visualize a embarcação em 3D e identifique pontos de atenção visualmente.',
      icon: <Box className="h-6 w-6 text-blue-500" />,
      tip: 'Clique nos componentes no modelo 3D para ver status detalhado'
    }
  ];

  // Quick Actions
  const quickActions = [
    {
      id: 'new-work-order',
      label: 'Nova OS',
      icon: <FileText className="h-4 w-4" />,
      onClick: () => setShowNewWorkOrder(true),
      variant: 'default' as const
    },
    {
      id: 'new-plan',
      label: 'Novo Plano',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => setShowCreateDialog(true)
    },
    {
      id: 'overdue',
      label: 'Vencidas',
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: () => setActiveTab('tasks'),
      badge: 3
    },
    {
      id: 'alerts',
      label: 'Alertas',
      icon: <Bell className="h-4 w-4" />,
      onClick: () => setShowAlertsPanel(true),
      badge: 5
    },
    {
      id: 'copilot',
      label: 'Copilot IA',
      icon: <Bot className="h-4 w-4" />,
      onClick: () => setActiveTab('copilot'),
      variant: 'secondary' as const
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: <Download className="h-4 w-4" />,
      onClick: () => {
        const csvContent = "data:text/csv;charset=utf-8,Tipo,Status,Prioridade,Data\n";
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `maintenance-report-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Relatório exportado com sucesso');
      }
    }
  ];

  // Alerts
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      title: 'Motor Principal - Vibração Anormal',
      message: 'Detectada vibração 15% acima do normal no motor principal. IA recomenda inspeção em 48h.',
      severity: 'critical' as const,
      timestamp: new Date(),
      source: 'Sensor IoT',
      actions: [
        { label: 'Criar OS', onClick: () => setShowNewWorkOrder(true) },
        { label: 'Ver Dados', onClick: () => { window.history.pushState({}, '', '/telemetry'); window.dispatchEvent(new PopStateEvent('popstate')); }, variant: 'outline' as const }
      ]
    },
    {
      id: '2',
      title: 'Gerador Auxiliar - Manutenção Vencida',
      message: 'Manutenção preventiva do gerador auxiliar está 3 dias atrasada.',
      severity: 'warning' as const,
      timestamp: addDays(new Date(), -1),
      source: 'Cronograma',
      actions: [
        { label: 'Reagendar', onClick: () => { setShowNewWorkOrder(true); } }
      ]
    }
  ]);

  // Removed artificial loading state that caused flickering

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Onboarding */}
      <ModuleOnboarding
        moduleId="maintenance-planner"
        moduleName="Manutenção Inteligente"
        steps={onboardingSteps}
      />

      {/* Header - NO motion to prevent flickering */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20">
            <Wrench className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Manutenção Inteligente (MMI)</h1>
            <p className="text-muted-foreground">Sistema Premium de Gestão de Manutenção Naval</p>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Bot className="h-3 w-3 mr-1" />
            IA Integrada
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsBar actions={quickActions} />

      {/* Alerts */}
      {alerts.length > 0 && (
        <ActionableAlertList 
          alerts={alerts}
          onDismiss={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
          maxVisible={2}
        />
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InteractiveKPICard
          title="Agendados"
          value={12}
          change={8}
          icon={<Calendar className="h-5 w-5" />}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
          status="info"
          details={[
            { label: 'Esta semana', value: 5 },
            { label: 'Próxima semana', value: 4 },
            { label: 'Este mês', value: 3 }
          ]}
        />
        <InteractiveKPICard
          title="Concluídos"
          value={8}
          change={15}
          icon={<CheckCircle className="h-5 w-5" />}
          iconColor="text-green-500"
          iconBg="bg-green-500/10"
          status="success"
        />
        <InteractiveKPICard
          title="Vencidos"
          value={3}
          change={-25}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconColor="text-red-500"
          iconBg="bg-red-500/10"
          status="danger"
          onDrillDown={() => setActiveTab('tasks')}
          drillDownLabel="Ver vencidos"
        />
        <InteractiveKPICard
          title="Eficiência"
          value={94}
          change={3}
          icon={<Gauge className="h-5 w-5" />}
          iconColor="text-primary"
          iconBg="bg-primary/10"
          format="percent"
          status="success"
          progress={94}
        />
      </div>
      
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="saude" className="flex items-center gap-2">
            <Ship className="h-4 w-4" />
            Saúde da Frota
          </TabsTrigger>
          <TabsTrigger value="copilot" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Copilot IA
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="os" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Ordens de Serviço
          </TabsTrigger>
          <TabsTrigger value="twin" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            Digital Twin
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tarefas
            <Badge variant="destructive" className="ml-1">3</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Próximas Manutenções
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {[
                      { equipment: 'Motor Principal', type: 'Preventiva', vessel: 'MV Atlantic Star', date: addDays(new Date(), 2), priority: 'high' },
                      { equipment: 'Gerador Auxiliar', type: 'Corretiva', vessel: 'MV Pacific Explorer', date: addDays(new Date(), 5), priority: 'medium' },
                      { equipment: 'Sistema Hidráulico', type: 'Preditiva', vessel: 'MV Ocean Titan', date: addDays(new Date(), 7), priority: 'low' },
                      { equipment: 'Bomba de Lastro', type: 'Preventiva', vessel: 'MV Caribbean Queen', date: addDays(new Date(), 10), priority: 'medium' },
                    ].map((item, i) => (
                      <motion.div
                        key={`maint-item-${item.equipment}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            item.priority === 'high' ? 'bg-red-500/10' :
                            item.priority === 'medium' ? 'bg-yellow-500/10' : 'bg-green-500/10'
                          }`}>
                            <Wrench className={`h-4 w-4 ${
                              item.priority === 'high' ? 'text-red-500' :
                              item.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.equipment}</p>
                            <p className="text-xs text-muted-foreground">{item.vessel} • {item.type}</p>
                          </div>
                        </div>
                        <Badge variant={
                          item.priority === 'high' ? 'destructive' :
                          item.priority === 'medium' ? 'secondary' : 'outline'
                        }>
                          {differenceInDays(item.date, new Date())} dias
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* AI Predictions */}
            <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Predições de IA
                </CardTitle>
                <CardDescription>Análise preditiva de falhas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { component: 'Motor Principal', vessel: 'MV Atlantic Star', days: 7, probability: 85, status: 'critical' },
                    { component: 'Sistema Hidráulico', vessel: 'MV Pacific', days: 21, probability: 62, status: 'warning' },
                    { component: 'Gerador Auxiliar', vessel: 'MV Ocean Titan', days: 45, probability: 45, status: 'normal' }
                  ].map((pred, i) => (
                    <motion.div
                      key={`pred-${pred.component}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-lg bg-background/50 border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{pred.component}</p>
                          <p className="text-xs text-muted-foreground">{pred.vessel}</p>
                        </div>
                        <Badge variant={
                          pred.status === 'critical' ? 'destructive' :
                          pred.status === 'warning' ? 'secondary' : 'outline'
                        }>
                          {pred.probability}% risco
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={pred.probability} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground">{pred.days} dias</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('copilot')}>
                  <Bot className="h-4 w-4 mr-2" />
                  Ver Análise Completa
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saude" className="mt-6">
          <FleetHealthPanel />
        </TabsContent>

        <TabsContent value="copilot" className="mt-6">
          <AdvancedCopilot />
        </TabsContent>

        <TabsContent value="jobs" className="mt-6">
          <JobsCenter onCreateJob={() => setShowCreateDialog(true)} />
        </TabsContent>

        <TabsContent value="os" className="mt-6">
          <WorkOrderManager />
        </TabsContent>

        <TabsContent value="twin" className="mt-6">
          <DigitalTwin />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <MaintenanceCalendarView />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <MaintenanceTasksTable onRefresh={() => { /* real refresh handled by component */ }} />
        </TabsContent>
      </Tabs>

      <CreateMaintenancePlanDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          toast.success('Plano criado com sucesso!');
        }}
      />

      <MaintenanceAlertsPanel
        open={showAlertsPanel}
        onOpenChange={setShowAlertsPanel}
      />

      {/* New Work Order Dialog */}
      <Dialog open={showNewWorkOrder} onOpenChange={setShowNewWorkOrder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Equipamento</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o equipamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motor">Motor Principal</SelectItem>
                  <SelectItem value="gerador">Gerador Auxiliar</SelectItem>
                  <SelectItem value="hidraulico">Sistema Hidráulico</SelectItem>
                  <SelectItem value="bomba">Bomba de Lastro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Manutenção</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                  <SelectItem value="preditiva">Preditiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea placeholder="Descreva o serviço a ser realizado" />
            </div>
            <Button className="w-full" onClick={() => {
              toast.success('Ordem de serviço criada!');
              setShowNewWorkOrder(false);
            }}>
              Criar OS
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenancePlannerEnhanced;
