/**
 * Tracking Alerts - Integrated with Supabase
 * CRUD completo para regras de alerta
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  AlertTriangle, CheckCircle, Clock, Bell, Brain, Shield,
  XCircle, RefreshCw, Zap, Settings, Plus, Edit2, Trash2, Save
} from "lucide-react";
import { toast } from "sonner";
import { useTrackingAlerts, useAlertHistory, useResolveAlert } from "@/hooks/useTrackingAlerts";

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
  notify_email: boolean;
  notify_sms: boolean;
}

function AlertRulesConfig() {
  const [rules, setRules] = useState<AlertRule[]>([
    { id: '1', name: 'Perda de sinal GNSS', condition: 'signal_loss', threshold: 30, severity: 'critical', enabled: true, notify_email: true, notify_sms: true },
    { id: '2', name: 'Desvio de rota', condition: 'route_deviation', threshold: 500, severity: 'warning', enabled: true, notify_email: true, notify_sms: false },
    { id: '3', name: 'Velocidade anormal', condition: 'speed_anomaly', threshold: 25, severity: 'warning', enabled: false, notify_email: true, notify_sms: false },
    { id: '4', name: 'Zona restrita', condition: 'restricted_zone', threshold: 0, severity: 'critical', enabled: true, notify_email: true, notify_sms: true },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    condition: 'signal_loss',
    threshold: 0,
    severity: 'warning' as 'critical' | 'warning' | 'info',
    notify_email: true,
    notify_sms: false,
  });

  const handleOpenDialog = (rule?: AlertRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        condition: rule.condition,
        threshold: rule.threshold,
        severity: rule.severity,
        notify_email: rule.notify_email,
        notify_sms: rule.notify_sms,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        condition: 'signal_loss',
        threshold: 0,
        severity: 'warning',
        notify_email: true,
        notify_sms: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Nome da regra é obrigatório');
      return;
    }

    if (editingRule) {
      setRules(prev => prev.map(r => 
        r.id === editingRule.id 
          ? { ...r, ...formData, enabled: r.enabled }
          : r
      ));
      toast.success('Regra atualizada com sucesso');
    } else {
      const newRule: AlertRule = {
        id: Date.now().toString(),
        ...formData,
        enabled: true,
      };
      setRules(prev => [...prev, newRule]);
      toast.success('Regra criada com sucesso');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta regra?')) {
      setRules(prev => prev.filter(r => r.id !== id));
      toast.success('Regra excluída');
    }
  };

  const handleToggle = (id: string) => {
    setRules(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
    const rule = rules.find(r => r.id === id);
    toast.success(rule?.enabled ? 'Regra desativada' : 'Regra ativada');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Regras de Alerta
            </CardTitle>
            <CardDescription>Configure thresholds e notificações automáticas</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRule ? 'Editar Regra' : 'Nova Regra de Alerta'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Regra</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Alerta de velocidade"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Condição</Label>
                    <Select value={formData.condition} onValueChange={v => setFormData({ ...formData, condition: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="signal_loss">Perda de Sinal</SelectItem>
                        <SelectItem value="route_deviation">Desvio de Rota</SelectItem>
                        <SelectItem value="speed_anomaly">Velocidade Anormal</SelectItem>
                        <SelectItem value="restricted_zone">Zona Restrita</SelectItem>
                        <SelectItem value="battery_low">Bateria Baixa</SelectItem>
                        <SelectItem value="geofence_exit">Saída de Geofence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Threshold</Label>
                    <Input
                      type="number"
                      value={formData.threshold}
                      onChange={e => setFormData({ ...formData, threshold: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Severidade</Label>
                  <Select value={formData.severity} onValueChange={v => setFormData({ ...formData, severity: v as "critical" | "warning" | "info" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Crítico</SelectItem>
                      <SelectItem value="warning">Aviso</SelectItem>
                      <SelectItem value="info">Informativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Notificar por Email</Label>
                  <Switch
                    checked={formData.notify_email}
                    onCheckedChange={v => setFormData({ ...formData, notify_email: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Notificar por SMS</Label>
                  <Switch
                    checked={formData.notify_sms}
                    onCheckedChange={v => setFormData({ ...formData, notify_sms: v })}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Nenhuma regra configurada</p>
            <p className="text-sm">Crie sua primeira regra de alerta</p>
            <Button className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Regra
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => (
              <div key={rule.id} className={`p-4 border rounded-lg ${rule.enabled ? '' : 'opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={rule.enabled} onCheckedChange={() => handleToggle(rule.id)} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rule.name}</span>
                        <Badge className={getSeverityColor(rule.severity)}>{rule.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Condição: {rule.condition} | Threshold: {rule.threshold}
                        {rule.notify_email && ' | 📧 Email'}
                        {rule.notify_sms && ' | 📱 SMS'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenDialog(rule)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TrackingAlerts() {
  const [activeTab, setActiveTab] = useState("active");
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{title: string; description: string}>>([]);
  
  const { data: alerts = [], isLoading, refetch, isRefetching } = useTrackingAlerts();
  const { data: alertHistory = [] } = useAlertHistory();
  const resolveAlertMutation = useResolveAlert();

  const handleResolve = async (id: string) => {
    try {
      await resolveAlertMutation.mutateAsync(id);
      toast.success("Alerta resolvido com sucesso");
    } catch {
      toast.error("Erro ao resolver alerta");
    }
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success("Alertas atualizados");
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-analytics", {
        body: { module: "tracking", scope: "alerts", alerts: alerts.slice(0, 10) },
      });
      if (error) throw error;
      const recs = Array.isArray(data?.recommendations)
        ? data.recommendations.map((r: Record<string, unknown>) => ({
            title: String(r?.title ?? "Recomendação"),
            description: String(r?.description ?? "Análise gerada pela IA."),
          }))
        : [];
      setRecommendations(recs);
      toast.success("Análise IA concluída");
    } catch {
      setRecommendations([]);
      toast.error("Integração IA não configurada");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { color: 'bg-red-500', bgLight: 'bg-red-500/10 border-red-500/30', icon: XCircle, label: 'Crítico' };
      case 'warning':
        return { color: 'bg-orange-500', bgLight: 'bg-orange-500/10 border-orange-500/30', icon: AlertTriangle, label: 'Aviso' };
      default:
        return { color: 'bg-blue-500', bgLight: 'bg-blue-500/10 border-blue-500/30', icon: Bell, label: 'Info' };
    }
  };

  const filteredAlerts = filterSeverity 
    ? alerts.filter(a => a.severity === filterSeverity)
    : alerts;

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Central de Alertas GNSS</h1>
            <p className="text-muted-foreground">Monitoramento e Gestão de Alertas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAIAnalysis} disabled={isAnalyzing}>
            <Brain className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            Análise IA
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Badge variant="outline">{stats.total} ativos</Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setFilterSeverity(null)}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <Badge variant="outline">Total</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Alertas Ativos</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer ${filterSeverity === 'critical' ? 'border-red-500' : 'hover:border-red-500/50'}`}
          onClick={() => setFilterSeverity(filterSeverity === 'critical' ? null : 'critical')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <XCircle className="h-5 w-5 text-red-500" />
              {stats.critical > 0 && <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
            </div>
            <p className="text-2xl font-bold mt-2 text-red-500">{stats.critical}</p>
            <p className="text-xs text-muted-foreground">Críticos</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer ${filterSeverity === 'warning' ? 'border-orange-500' : 'hover:border-orange-500/50'}`}
          onClick={() => setFilterSeverity(filterSeverity === 'warning' ? null : 'warning')}
        >
          <CardContent className="pt-4">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <p className="text-2xl font-bold mt-2 text-orange-500">{stats.warning}</p>
            <p className="text-xs text-muted-foreground">Avisos</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer ${filterSeverity === 'info' ? 'border-blue-500' : 'hover:border-blue-500/50'}`}
          onClick={() => setFilterSeverity(filterSeverity === 'info' ? null : 'info')}
        >
          <CardContent className="pt-4">
            <Bell className="h-5 w-5 text-blue-500" />
            <p className="text-2xl font-bold mt-2 text-blue-500">{stats.info}</p>
            <p className="text-xs text-muted-foreground">Informativos</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-secondary/30 bg-gradient-to-r from-secondary/5 to-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-secondary" />
              Análise IA dos Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.map((rec) => (
                <div key={rec.title} className="p-3 rounded-lg bg-background/50 border">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Ativos ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Regras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Alertas Pendentes
                </span>
                {filterSeverity && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilterSeverity(null)}>
                    Filtro: {filterSeverity} ✕
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAlerts.length > 0 ? (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => {
                    const config = getSeverityConfig(alert.severity);
                    const Icon = config.icon;
                    
                    return (
                      <div key={alert.id} className={`p-4 border rounded-lg ${config.bgLight}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${config.color}`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={config.color}>{config.label}</Badge>
                                <Badge variant="outline" className="text-xs">{alert.alert_type}</Badge>
                              </div>
                              <p className="font-semibold">{alert.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                              
                              {alert.ai_analysis && (
                                <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                  <div className="flex items-start gap-2">
                                    <Brain className="h-4 w-4 text-purple-500 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Análise IA</p>
                                      <p className="text-sm text-muted-foreground">{alert.ai_analysis}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(alert.created_at).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => handleResolve(alert.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolver
                            </Button>
                            <Button size="sm" variant="outline">
                              Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">Sistema Operacional</p>
                  <p className="text-sm">Nenhum alerta ativo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Alertas
              </CardTitle>
              <CardDescription>Alertas resolvidos nos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertHistory.map((alert: { id: string; severity: string; title: string; resolved_at: string; resolution: string }) => {
                  const config = getSeverityConfig(alert.severity);
                  return (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">Resolução: {alert.resolution}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={config.color}>{config.label}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.resolved_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <AlertRulesConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
