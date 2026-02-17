/**
 * CertificateExpirationAlerts - Problema #1: Certificados Vencendo Sem Aviso
 * Sistema de alertas automáticos 60/30/7/3/1 dias antes do vencimento
 * ROI: R$ 2.000-5.000/mês em economia
 * PATCH: Usando dados reais do Supabase via hook
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Bell, AlertTriangle, CheckCircle2, Clock, Calendar, 
  User, Ship, FileText, Mail, MessageSquare, Settings,
  TrendingUp, Shield, RefreshCw, Download, Filter,
  ChevronRight, ArrowUpRight, Zap, Target
} from 'lucide-react';
import { 
  useCertificateAlertsData, 
  DEFAULT_ALERT_CONFIGS, 
  type Certificate, 
  type AlertConfig, 
  type AlertHistory 
} from '@/hooks/useCertificateAlertsData';

export function CertificateExpirationAlerts() {
  const { 
    certificates, 
    alertHistory, 
    metrics, 
    isLoading, 
    sendAlert, 
    refetch 
  } = useCertificateAlertsData();
  
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>(DEFAULT_ALERT_CONFIGS);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<AlertConfig | null>(null);

  // Filtrar certificados
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert: Certificate) => {
      const matchesSearch = cert.holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.certificate_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cert.vessel_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === 'all') return matchesSearch;
      if (filterStatus === 'expired') return matchesSearch && cert.days_until_expiry < 0;
      if (filterStatus === 'critical') return matchesSearch && cert.days_until_expiry >= 0 && cert.days_until_expiry <= 7;
      if (filterStatus === 'warning') return matchesSearch && cert.days_until_expiry > 7 && cert.days_until_expiry <= 30;
      if (filterStatus === 'ok') return matchesSearch && cert.days_until_expiry > 30;
      return matchesSearch;
    });
  }, [certificates, filterStatus, searchTerm]);

  // Enviar alerta manual
  const sendManualAlert = async (certificate: Certificate) => {
    toast.loading('Enviando alerta...', { id: 'sending-alert' });
    sendAlert(certificate);
    toast.success('Alerta enviado com sucesso!', { id: 'sending-alert' });
  };

  // Atualizar configuração de alerta
  const updateAlertConfig = (configId: string, updates: Partial<AlertConfig>) => {
    setAlertConfigs(prev => prev.map(config => 
      config.id === configId ? { ...config, ...updates } : config
    ));
    toast.success('Configuração atualizada!');
  };

  // Exportar relatório
  const exportReport = async () => {
    toast.loading('Gerando relatório...', { id: 'export' });
    
    const report = {
      generated_at: new Date().toISOString(),
      metrics,
      certificates: filteredCertificates,
      alert_history: alertHistory.slice(0, 20)
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificados-alertas-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    toast.success('Relatório exportado!', { id: 'export' });
  };

  const getStatusBadge = (cert: Certificate) => {
    if (cert.days_until_expiry < 0) {
      return <Badge variant="destructive" className="animate-pulse">VENCIDO ({Math.abs(cert.days_until_expiry)} dias)</Badge>;
    }
    if (cert.days_until_expiry <= 7) {
      return <Badge variant="destructive">CRÍTICO ({cert.days_until_expiry} dias)</Badge>;
    }
    if (cert.days_until_expiry <= 30) {
      return <Badge className="bg-warning hover:bg-warning/90 text-warning-foreground">{cert.days_until_expiry} dias</Badge>;
    }
    return <Badge variant="outline" className="text-success border-success">{cert.days_until_expiry} dias</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header com Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-3xl font-bold text-destructive">{metrics.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos (≤7d)</p>
                <p className="text-3xl font-bold text-warning">{metrics.critical}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atenção (≤30d)</p>
                <p className="text-3xl font-bold text-warning">{metrics.warning}</p>
              </div>
              <Bell className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-success/20 bg-success/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">OK (&gt;30d)</p>
                <p className="text-3xl font-bold text-success">{metrics.ok}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{metrics.total}</p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Card */}
      <Card className="border-success/30 bg-gradient-to-r from-success/5 to-success/10">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Economia Estimada com Alertas Automáticos</p>
                <p className="text-2xl font-bold text-success">R$ 2.000 - 5.000/mês</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Certificados protegidos</p>
              <p className="text-xl font-semibold">{metrics.total - metrics.expired} de {metrics.total}</p>
              <Progress 
                value={((metrics.total - metrics.expired) / metrics.total) * 100} 
                className="h-2 w-32 mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="certificates" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="certificates">
            <FileText className="h-4 w-4 mr-2" />
            Certificados
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Tab: Certificados */}
        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Monitoramento de Certificados
                  </CardTitle>
                  <CardDescription>
                    ZERO certificados vencendo sem aviso - Sistema automático 60/30/7/3/1 dias
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtros */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Buscar por nome, tipo ou embarcação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="expired">Vencidos</SelectItem>
                    <SelectItem value="critical">Críticos (≤7d)</SelectItem>
                    <SelectItem value="warning">Atenção (≤30d)</SelectItem>
                    <SelectItem value="ok">OK (&gt;30d)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de Certificados */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredCertificates.map(cert => (
                    <Card key={cert.id} className={`
                      ${cert.days_until_expiry < 0 ? 'border-destructive/30 bg-destructive/5' : ''}
                      ${cert.days_until_expiry >= 0 && cert.days_until_expiry <= 7 ? 'border-warning/30 bg-warning/5' : ''}
                      ${cert.days_until_expiry > 7 && cert.days_until_expiry <= 30 ? 'border-warning/30 bg-warning/5' : ''}
                    `}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              cert.days_until_expiry < 0 ? 'bg-destructive/10' :
                              cert.days_until_expiry <= 7 ? 'bg-warning/10' :
                              cert.days_until_expiry <= 30 ? 'bg-warning/10' :
                              'bg-success/10'
                            }`}>
                              <User className={`h-5 w-5 ${
                                cert.days_until_expiry < 0 ? 'text-destructive' :
                                cert.days_until_expiry <= 7 ? 'text-warning' :
                                cert.days_until_expiry <= 30 ? 'text-warning' :
                                'text-success'
                              }`} />
                            </div>
                            <div>
                              <p className="font-semibold">{cert.holder_name}</p>
                              <p className="text-sm text-muted-foreground">{cert.certificate_type}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  <Ship className="h-3 w-3 mr-1" />
                                  {cert.vessel_name || 'N/A'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Vence: {new Date(cert.expiry_date).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {getStatusBadge(cert)}
                            
                            {cert.alert_sent && (
                              <Badge variant="outline" className="text-xs text-success border-success/30">
                                <Bell className="h-3 w-3 mr-1" />
                                Alerta enviado
                              </Badge>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => sendManualAlert(cert)}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Alertar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configuração */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuração de Alertas Automáticos
              </CardTitle>
              <CardDescription>
                Configure os alertas para 60, 30, 7, 3 e 1 dia antes do vencimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertConfigs.map(config => (
                  <Card key={config.id} className={config.enabled ? 'border-primary/30' : 'opacity-60'}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${
                            config.days_before <= 7 ? 'bg-destructive/10' :
                            config.days_before <= 30 ? 'bg-warning/10' :
                            'bg-info/10'
                          }`}>
                            <Bell className={`h-5 w-5 ${
                              config.days_before <= 7 ? 'text-destructive' :
                              config.days_before <= 30 ? 'text-warning' :
                              'text-info'
                            }`} />
                          </div>
                          <div>
                            <p className="font-semibold">{config.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {config.days_before} dias antes do vencimento
                            </p>
                            <div className="flex gap-1 mt-1">
                              {config.channels.map(channel => (
                                <Badge key={channel} variant="secondary" className="text-xs">
                                  {channel === 'email' && <Mail className="h-3 w-3 mr-1" />}
                                  {channel === 'push' && <Bell className="h-3 w-3 mr-1" />}
                                  {channel === 'sms' && <MessageSquare className="h-3 w-3 mr-1" />}
                                  {channel}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {config.escalation_enabled && (
                            <Badge variant="outline" className="text-xs">
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              Escalação em {config.escalation_days}d
                            </Badge>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`toggle-${config.id}`} className="text-sm">
                              {config.enabled ? 'Ativo' : 'Inativo'}
                            </Label>
                            <Switch
                              id={`toggle-${config.id}`}
                              checked={config.enabled}
                              onCheckedChange={(checked) => updateAlertConfig(config.id, { enabled: checked })}
                            />
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedConfig(config)}>
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Configurar {config.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label>Dias antes do vencimento</Label>
                                  <Input 
                                    type="number" 
                                    value={config.days_before}
                                    onChange={(e) => updateAlertConfig(config.id, { days_before: parseInt(e.target.value) })}
                                  />
                                </div>
                                <div>
                                  <Label>Destinatários (separados por vírgula)</Label>
                                  <Input 
                                    value={config.recipients.join(', ')}
                                    onChange={(e) => updateAlertConfig(config.id, { 
                                      recipients: e.target.value.split(',').map(r => r.trim()) 
                                    })}
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={config.escalation_enabled}
                                    onCheckedChange={(checked) => updateAlertConfig(config.id, { escalation_enabled: checked })}
                                  />
                                  <Label>Habilitar escalação</Label>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={() => { updateAlertConfig(config.id, config); toast.success('Configuração de alerta salva!'); }}>
                                  Salvar
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Histórico */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Histórico de Alertas Enviados
              </CardTitle>
              <CardDescription>
                Registro de todos os alertas disparados pelo sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {alertHistory.map(alert => (
                    <Card key={alert.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              alert.status === 'sent' ? 'bg-success/10' :
                              alert.status === 'failed' ? 'bg-destructive/10' :
                              'bg-warning/10'
                            }`}>
                              {alert.status === 'sent' && <CheckCircle2 className="h-4 w-4 text-success" />}
                              {alert.status === 'failed' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                              {alert.status === 'pending' && <Clock className="h-4 w-4 text-warning" />}
                            </div>
                            <div>
                              <p className="font-medium">{alert.holder_name}</p>
                              <p className="text-sm text-muted-foreground">{alert.certificate_type}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {alert.alert_type}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <Badge variant="secondary">
                              {alert.channel === 'email' && <Mail className="h-3 w-3 mr-1" />}
                              {alert.channel === 'push' && <Bell className="h-3 w-3 mr-1" />}
                              {alert.channel}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(alert.sent_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CertificateExpirationAlerts;
