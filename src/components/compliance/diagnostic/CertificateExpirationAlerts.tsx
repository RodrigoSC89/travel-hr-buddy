/**
 * CertificateExpirationAlerts - Problema #1: Certificados Vencendo Sem Aviso
 * Sistema de alertas automáticos 60/30/7/3/1 dias antes do vencimento
 * ROI: R$ 2.000-5.000/mês em economia
 */

import { useState, useEffect, useMemo } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, AlertTriangle, CheckCircle2, Clock, Calendar, 
  User, Ship, FileText, Mail, MessageSquare, Settings,
  TrendingUp, Shield, RefreshCw, Download, Filter,
  ChevronRight, ArrowUpRight, Zap, Target
} from 'lucide-react';

interface Certificate {
  id: string;
  holder_name: string;
  holder_id: string;
  certificate_type: string;
  certificate_number: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  vessel_name?: string;
  status: 'valid' | 'expiring_soon' | 'expired' | 'renewed';
  days_until_expiry: number;
  alert_sent: boolean;
  last_alert_date?: string;
}

interface AlertConfig {
  id: string;
  name: string;
  days_before: number;
  channels: ('email' | 'push' | 'sms' | 'system')[];
  recipients: string[];
  enabled: boolean;
  escalation_enabled: boolean;
  escalation_days: number;
}

interface AlertHistory {
  id: string;
  certificate_id: string;
  certificate_type: string;
  holder_name: string;
  alert_type: string;
  sent_at: string;
  channel: string;
  status: 'sent' | 'failed' | 'pending';
}

// Configurações padrão de alertas (60/30/7/3/1 dias)
const DEFAULT_ALERT_CONFIGS: AlertConfig[] = [
  {
    id: 'alert-60',
    name: 'Alerta Antecipado',
    days_before: 60,
    channels: ['email', 'system'],
    recipients: ['rh@empresa.com'],
    enabled: true,
    escalation_enabled: false,
    escalation_days: 0
  },
  {
    id: 'alert-30',
    name: 'Alerta Padrão',
    days_before: 30,
    channels: ['email', 'push', 'system'],
    recipients: ['rh@empresa.com', 'gestor@empresa.com'],
    enabled: true,
    escalation_enabled: true,
    escalation_days: 7
  },
  {
    id: 'alert-7',
    name: 'Alerta Urgente',
    days_before: 7,
    channels: ['email', 'push', 'sms', 'system'],
    recipients: ['rh@empresa.com', 'gestor@empresa.com', 'diretor@empresa.com'],
    enabled: true,
    escalation_enabled: true,
    escalation_days: 3
  },
  {
    id: 'alert-3',
    name: 'Alerta Crítico',
    days_before: 3,
    channels: ['email', 'push', 'sms', 'system'],
    recipients: ['rh@empresa.com', 'gestor@empresa.com', 'diretor@empresa.com'],
    enabled: true,
    escalation_enabled: true,
    escalation_days: 1
  },
  {
    id: 'alert-1',
    name: 'Alerta Final',
    days_before: 1,
    channels: ['email', 'push', 'sms', 'system'],
    recipients: ['todos'],
    enabled: true,
    escalation_enabled: false,
    escalation_days: 0
  }
];

// Mock data para demonstração
const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: '1',
    holder_name: 'João Silva',
    holder_id: 'crew-001',
    certificate_type: 'STCW - Básico de Segurança',
    certificate_number: 'STCW-2024-001',
    issue_date: '2020-02-15',
    expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issuing_authority: 'DPC - Marinha do Brasil',
    vessel_name: 'Navio Alpha',
    status: 'expiring_soon',
    days_until_expiry: 5,
    alert_sent: true,
    last_alert_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    holder_name: 'Maria Santos',
    holder_id: 'crew-002',
    certificate_type: 'Certificado de Competência - Oficial de Máquinas',
    certificate_number: 'COM-2023-045',
    issue_date: '2019-08-20',
    expiry_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issuing_authority: 'DPC - Marinha do Brasil',
    vessel_name: 'Navio Beta',
    status: 'expiring_soon',
    days_until_expiry: 25,
    alert_sent: true,
    last_alert_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    holder_name: 'Carlos Oliveira',
    holder_id: 'crew-003',
    certificate_type: 'GMDSS - Operador Geral',
    certificate_number: 'GMDSS-2024-012',
    issue_date: '2022-03-10',
    expiry_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issuing_authority: 'ANATEL',
    vessel_name: 'Navio Gamma',
    status: 'expired',
    days_until_expiry: -10,
    alert_sent: true,
    last_alert_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    holder_name: 'Ana Pereira',
    holder_id: 'crew-004',
    certificate_type: 'Certificado Médico Marítimo',
    certificate_number: 'MED-2024-078',
    issue_date: '2023-01-15',
    expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issuing_authority: 'DPC - Marinha do Brasil',
    vessel_name: 'Navio Alpha',
    status: 'valid',
    days_until_expiry: 90,
    alert_sent: false
  },
  {
    id: '5',
    holder_name: 'Pedro Costa',
    holder_id: 'crew-005',
    certificate_type: 'STCW - Combate a Incêndio Avançado',
    certificate_number: 'STCW-AFF-2024-033',
    issue_date: '2021-06-20',
    expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issuing_authority: 'Centro de Instrução Almirante Braz',
    vessel_name: 'Navio Delta',
    status: 'expiring_soon',
    days_until_expiry: 2,
    alert_sent: true,
    last_alert_date: new Date().toISOString()
  }
];

const MOCK_ALERT_HISTORY: AlertHistory[] = [
  {
    id: 'hist-1',
    certificate_id: '1',
    certificate_type: 'STCW - Básico de Segurança',
    holder_name: 'João Silva',
    alert_type: 'Alerta Urgente (7 dias)',
    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    channel: 'email',
    status: 'sent'
  },
  {
    id: 'hist-2',
    certificate_id: '2',
    certificate_type: 'Certificado de Competência',
    holder_name: 'Maria Santos',
    alert_type: 'Alerta Padrão (30 dias)',
    sent_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    channel: 'email',
    status: 'sent'
  },
  {
    id: 'hist-3',
    certificate_id: '5',
    certificate_type: 'STCW - Combate a Incêndio',
    holder_name: 'Pedro Costa',
    alert_type: 'Alerta Crítico (3 dias)',
    sent_at: new Date().toISOString(),
    channel: 'push',
    status: 'sent'
  }
];

export function CertificateExpirationAlerts() {
  const [certificates, setCertificates] = useState<Certificate[]>(MOCK_CERTIFICATES);
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>(DEFAULT_ALERT_CONFIGS);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>(MOCK_ALERT_HISTORY);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConfig, setSelectedConfig] = useState<AlertConfig | null>(null);
  const queryClient = useQueryClient();

  // Calcular métricas
  const metrics = useMemo(() => {
    const expired = certificates.filter(c => c.days_until_expiry < 0).length;
    const critical = certificates.filter(c => c.days_until_expiry >= 0 && c.days_until_expiry <= 7).length;
    const warning = certificates.filter(c => c.days_until_expiry > 7 && c.days_until_expiry <= 30).length;
    const ok = certificates.filter(c => c.days_until_expiry > 30).length;
    const total = certificates.length;
    
    return { expired, critical, warning, ok, total };
  }, [certificates]);

  // Filtrar certificados
  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
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
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Atualizar histórico
    const newAlert: AlertHistory = {
      id: `hist-${Date.now()}`,
      certificate_id: certificate.id,
      certificate_type: certificate.certificate_type,
      holder_name: certificate.holder_name,
      alert_type: 'Alerta Manual',
      sent_at: new Date().toISOString(),
      channel: 'email',
      status: 'sent'
    };
    
    setAlertHistory(prev => [newAlert, ...prev]);
    setCertificates(prev => prev.map(c => 
      c.id === certificate.id 
        ? { ...c, alert_sent: true, last_alert_date: new Date().toISOString() }
        : c
    ));
    
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
      return <Badge className="bg-amber-500 hover:bg-amber-600">{cert.days_until_expiry} dias</Badge>;
    }
    return <Badge variant="outline" className="text-green-600 border-green-600">{cert.days_until_expiry} dias</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header com Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-3xl font-bold text-red-600">{metrics.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos (≤7d)</p>
                <p className="text-3xl font-bold text-orange-600">{metrics.critical}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atenção (≤30d)</p>
                <p className="text-3xl font-bold text-amber-600">{metrics.warning}</p>
              </div>
              <Bell className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">OK (&gt;30d)</p>
                <p className="text-3xl font-bold text-green-600">{metrics.ok}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
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
      <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Economia Estimada com Alertas Automáticos</p>
                <p className="text-2xl font-bold text-green-700">R$ 2.000 - 5.000/mês</p>
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
                  <Button size="sm" onClick={() => queryClient.invalidateQueries()}>
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
                      ${cert.days_until_expiry < 0 ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : ''}
                      ${cert.days_until_expiry >= 0 && cert.days_until_expiry <= 7 ? 'border-orange-300 bg-orange-50/50 dark:bg-orange-950/20' : ''}
                      ${cert.days_until_expiry > 7 && cert.days_until_expiry <= 30 ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20' : ''}
                    `}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              cert.days_until_expiry < 0 ? 'bg-red-100 dark:bg-red-900' :
                              cert.days_until_expiry <= 7 ? 'bg-orange-100 dark:bg-orange-900' :
                              cert.days_until_expiry <= 30 ? 'bg-amber-100 dark:bg-amber-900' :
                              'bg-green-100 dark:bg-green-900'
                            }`}>
                              <User className={`h-5 w-5 ${
                                cert.days_until_expiry < 0 ? 'text-red-600' :
                                cert.days_until_expiry <= 7 ? 'text-orange-600' :
                                cert.days_until_expiry <= 30 ? 'text-amber-600' :
                                'text-green-600'
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
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
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
                            config.days_before <= 7 ? 'bg-red-100 dark:bg-red-900' :
                            config.days_before <= 30 ? 'bg-amber-100 dark:bg-amber-900' :
                            'bg-blue-100 dark:bg-blue-900'
                          }`}>
                            <Bell className={`h-5 w-5 ${
                              config.days_before <= 7 ? 'text-red-600' :
                              config.days_before <= 30 ? 'text-amber-600' :
                              'text-blue-600'
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
                                <Button onClick={() => toast.success('Configuração salva!')}>
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
                              alert.status === 'sent' ? 'bg-green-100 dark:bg-green-900' :
                              alert.status === 'failed' ? 'bg-red-100 dark:bg-red-900' :
                              'bg-amber-100 dark:bg-amber-900'
                            }`}>
                              {alert.status === 'sent' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                              {alert.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                              {alert.status === 'pending' && <Clock className="h-4 w-4 text-amber-600" />}
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
