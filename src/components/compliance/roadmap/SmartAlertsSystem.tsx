import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Bell, BellRing, BellOff, Mail, MessageSquare, Smartphone, Calendar,
  Clock, AlertTriangle, AlertCircle, CheckCircle, XCircle, Settings,
  Filter, Search, Trash2, Eye, EyeOff, Volume2, VolumeX, RefreshCw,
  ChevronRight, ArrowUp, ArrowDown, Zap, Target, Users, Shield
} from "lucide-react";

// Types
interface AlertRule {
  id: string;
  nome: string;
  tipo: 'certificado_vencendo' | 'nc_sem_acao' | 'auditoria_atrasada' | 'evidencia_pendente' | 'nc_critica' | 'prazo_vencido' | 'score_baixo';
  condicao: string;
  diasAntecedencia: number;
  frequencia: 'imediato' | 'diario' | 'semanal' | 'mensal';
  canais: ('email' | 'sms' | 'push' | 'sistema')[];
  destinatarios: string[];
  ativo: boolean;
  escalacao: boolean;
  diasEscalacao?: number;
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  modulos: string[];
}

interface AlertLog {
  id: string;
  ruleId: string;
  ruleName: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  destinatario: string;
  canal: string;
  dataCriacao: string;
  dataEnvio?: string;
  status: 'pendente' | 'enviado' | 'lido' | 'acao_tomada' | 'expirado' | 'erro';
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  itemRelacionado?: string;
  modulo: string;
}

interface AlertStats {
  total: number;
  pendentes: number;
  enviados: number;
  lidos: number;
  acaoTomada: number;
  erros: number;
  porTipo: Record<string, number>;
  porPrioridade: Record<string, number>;
}

// Default alert rules
const defaultRules: AlertRule[] = [
  {
    id: 'rule-1',
    nome: 'Certificados Vencendo',
    tipo: 'certificado_vencendo',
    condicao: 'Certificado vence em X dias',
    diasAntecedencia: 30,
    frequencia: 'diario',
    canais: ['email', 'sistema'],
    destinatarios: ['gestor_seguranca', 'rh'],
    ativo: true,
    escalacao: true,
    diasEscalacao: 7,
    prioridade: 'alta',
    modulos: ['PEOTRAM', 'PEO-DP', 'MLC']
  },
  {
    id: 'rule-2',
    nome: 'NC Crítica Aberta',
    tipo: 'nc_critica',
    condicao: 'NC classificação A aberta',
    diasAntecedencia: 0,
    frequencia: 'imediato',
    canais: ['email', 'sms', 'push', 'sistema'],
    destinatarios: ['gerente', 'diretor'],
    ativo: true,
    escalacao: true,
    diasEscalacao: 2,
    prioridade: 'critica',
    modulos: ['PEOTRAM', 'PEO-DP', 'MLC', 'SGSO']
  },
  {
    id: 'rule-3',
    nome: 'NC Sem Ação',
    tipo: 'nc_sem_acao',
    condicao: 'NC aberta há X dias sem plano de ação',
    diasAntecedencia: 5,
    frequencia: 'diario',
    canais: ['email', 'sistema'],
    destinatarios: ['responsavel_nc'],
    ativo: true,
    escalacao: true,
    diasEscalacao: 3,
    prioridade: 'alta',
    modulos: ['PEOTRAM', 'PEO-DP']
  },
  {
    id: 'rule-4',
    nome: 'Auditoria Atrasada',
    tipo: 'auditoria_atrasada',
    condicao: 'Auditoria prevista não realizada',
    diasAntecedencia: 0,
    frequencia: 'diario',
    canais: ['email', 'sistema'],
    destinatarios: ['auditor', 'coordenador'],
    ativo: true,
    escalacao: true,
    diasEscalacao: 5,
    prioridade: 'media',
    modulos: ['PEOTRAM', 'PEO-DP', 'MLC']
  },
  {
    id: 'rule-5',
    nome: 'Evidência Pendente',
    tipo: 'evidencia_pendente',
    condicao: 'Evidência não enviada após prazo',
    diasAntecedencia: 3,
    frequencia: 'semanal',
    canais: ['email', 'sistema'],
    destinatarios: ['responsavel'],
    ativo: true,
    escalacao: false,
    prioridade: 'media',
    modulos: ['PEOTRAM', 'PEO-DP']
  },
  {
    id: 'rule-6',
    nome: 'Score Abaixo da Meta',
    tipo: 'score_baixo',
    condicao: 'Score do departamento < 80%',
    diasAntecedencia: 0,
    frequencia: 'semanal',
    canais: ['email', 'sistema'],
    destinatarios: ['gestor_departamento', 'diretor'],
    ativo: true,
    escalacao: false,
    prioridade: 'alta',
    modulos: ['PEOTRAM', 'PEO-DP', 'MLC', 'SGSO']
  }
];

// Generate mock alert logs
const generateAlertLogs = (): AlertLog[] => {
  const tipos = ['certificado_vencendo', 'nc_critica', 'nc_sem_acao', 'auditoria_atrasada', 'evidencia_pendente', 'score_baixo'];
  const status = ['pendente', 'enviado', 'lido', 'acao_tomada', 'erro'] as const;
  const canais = ['email', 'sms', 'push', 'sistema'];
  const modulos = ['PEOTRAM', 'PEO-DP', 'MLC', 'SGSO'];
  const prioridades = ['critica', 'alta', 'media', 'baixa'] as const;

  return Array.from({ length: 25 }, (_, i) => {
    const tipo = tipos[i % tipos.length];
    const prioridade = prioridades[(i * 7 + 3) % prioridades.length];
    const currentStatus = status[(i * 11 + 2) % status.length];
    const hoursAgo = ((i * 37 + 5) % 168);

    return {
      id: `log-${i + 1}`,
      ruleId: `rule-${(i % 6) + 1}`,
      ruleName: defaultRules[(i % 6)].nome,
      tipo,
      titulo: `Alerta: ${tipo.replace(/_/g, ' ')} #${i + 1}`,
      mensagem: `Mensagem detalhada do alerta ${i + 1} - ${tipo.replace(/_/g, ' ')}`,
      destinatario: `usuario${(i % 5) + 1}@empresa.com`,
      canal: canais[i % canais.length],
      dataCriacao: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      dataEnvio: currentStatus !== 'pendente' ? new Date(Date.now() - (hoursAgo - 1) * 60 * 60 * 1000).toISOString() : undefined,
      status: currentStatus,
      prioridade,
      itemRelacionado: `ITEM-${String(i + 1).padStart(3, '0')}`,
      modulo: modulos[i % modulos.length]
    };
  });
};

// Helper functions
const getPrioridadeColor = (prioridade: string) => {
  switch (prioridade) {
    case 'critica': return 'bg-destructive text-destructive-foreground';
    case 'alta': return 'bg-warning text-warning-foreground';
    case 'media': return 'bg-accent text-accent-foreground';
    case 'baixa': return 'bg-success text-success-foreground';
    default: return 'bg-muted';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pendente': return 'bg-warning/20 text-warning border-warning/30';
    case 'enviado': return 'bg-info/20 text-info border-info/30';
    case 'lido': return 'bg-accent/20 text-accent-foreground border-accent/30';
    case 'acao_tomada': return 'bg-success/20 text-success border-success/30';
    case 'expirado': return 'bg-muted/20 text-muted-foreground border-muted/30';
    case 'erro': return 'bg-destructive/20 text-destructive border-destructive/30';
    default: return 'bg-muted/20 text-muted-foreground';
  }
};

const getTipoIcon = (tipo: string) => {
  switch (tipo) {
    case 'certificado_vencendo': return <Clock className="h-4 w-4" />;
    case 'nc_critica': return <AlertCircle className="h-4 w-4" />;
    case 'nc_sem_acao': return <AlertTriangle className="h-4 w-4" />;
    case 'auditoria_atrasada': return <Calendar className="h-4 w-4" />;
    case 'evidencia_pendente': return <Eye className="h-4 w-4" />;
    case 'score_baixo': return <Target className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
};

const getCanalIcon = (canal: string) => {
  switch (canal) {
    case 'email': return <Mail className="h-4 w-4" />;
    case 'sms': return <Smartphone className="h-4 w-4" />;
    case 'push': return <BellRing className="h-4 w-4" />;
    case 'sistema': return <MessageSquare className="h-4 w-4" />;
    default: return <Bell className="h-4 w-4" />;
  }
};

export function SmartAlertsSystem() {
  const [rules, setRules] = useState<AlertRule[]>(defaultRules);
  const [logs, setLogs] = useState<AlertLog[]>(() => generateAlertLogs());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPrioridade, setFilterPrioridade] = useState<string>('all');
  const [filterModulo, setFilterModulo] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Calculate stats
  const stats = useMemo<AlertStats>(() => {
    const filtered = logs.filter(log => 
      (filterStatus === 'all' || log.status === filterStatus) &&
      (filterPrioridade === 'all' || log.prioridade === filterPrioridade) &&
      (filterModulo === 'all' || log.modulo === filterModulo)
    );

    const porTipo: Record<string, number> = {};
    const porPrioridade: Record<string, number> = {};

    filtered.forEach(log => {
      porTipo[log.tipo] = (porTipo[log.tipo] || 0) + 1;
      porPrioridade[log.prioridade] = (porPrioridade[log.prioridade] || 0) + 1;
    });

    return {
      total: filtered.length,
      pendentes: filtered.filter(l => l.status === 'pendente').length,
      enviados: filtered.filter(l => l.status === 'enviado').length,
      lidos: filtered.filter(l => l.status === 'lido').length,
      acaoTomada: filtered.filter(l => l.status === 'acao_tomada').length,
      erros: filtered.filter(l => l.status === 'erro').length,
      porTipo,
      porPrioridade
    };
  }, [logs, filterStatus, filterPrioridade, filterModulo]);

  // Handlers
  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, ativo: !r.ativo } : r
    ));
    const rule = rules.find(r => r.id === ruleId);
    toast.success(`Regra "${rule?.nome}" ${rule?.ativo ? 'desativada' : 'ativada'}`);
  };

  const handleEditRule = (rule: AlertRule) => {
    setSelectedRule(rule);
    setIsRuleDialogOpen(true);
  };

  const handleSaveRule = () => {
    if (selectedRule) {
      setRules(prev => prev.map(r => r.id === selectedRule.id ? selectedRule : r));
      toast.success(`Regra "${selectedRule.nome}" atualizada`);
      setIsRuleDialogOpen(false);
      setSelectedRule(null);
    }
  };

  const handleMarkAsRead = (logId: string) => {
    setLogs(prev => prev.map(l => 
      l.id === logId ? { ...l, status: 'lido' as const } : l
    ));
  };

  const handleMarkAsActionTaken = (logId: string) => {
    setLogs(prev => prev.map(l => 
      l.id === logId ? { ...l, status: 'acao_tomada' as const } : l
    ));
    toast.success('Alerta marcado como ação tomada');
  };

  const handleDeleteLog = (logId: string) => {
    setLogs(prev => prev.filter(l => l.id !== logId));
    toast.success('Alerta removido do histórico');
  };

  const handleTestAlert = (rule: AlertRule) => {
    toast.success(`Alerta de teste enviado para regra "${rule.nome}"`, {
      description: `Canais: ${rule.canais.join(', ')}`
    });
  };

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => 
        (filterStatus === 'all' || log.status === filterStatus) &&
        (filterPrioridade === 'all' || log.prioridade === filterPrioridade) &&
        (filterModulo === 'all' || log.modulo === filterModulo) &&
        (searchTerm === '' || 
          log.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.mensagem.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
  }, [logs, filterStatus, filterPrioridade, filterModulo, searchTerm]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Agora há pouco';
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BellRing className="h-6 w-6 text-primary" />
            Sistema de Alertas Inteligentes
          </h2>
          <p className="text-muted-foreground text-sm">
            Fase 1.3 do Roadmap • Notificações automáticas para eventos críticos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg">
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-primary" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-6 w-6 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-warning/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-warning">{stats.pendentes}</p>
              </div>
              <Clock className="h-6 w-6 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-info/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Enviados</p>
                <p className="text-2xl font-bold text-info">{stats.enviados}</p>
              </div>
              <Mail className="h-6 w-6 text-info/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-accent/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Lidos</p>
                <p className="text-2xl font-bold text-accent-foreground">{stats.lidos}</p>
              </div>
              <Eye className="h-6 w-6 text-accent-foreground/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-success/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ação Tomada</p>
                <p className="text-2xl font-bold text-success">{stats.acaoTomada}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-success/50" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-destructive/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Erros</p>
                <p className="text-2xl font-bold text-destructive">{stats.erros}</p>
              </div>
              <XCircle className="h-6 w-6 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertas Ativos
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Regras ({rules.filter(r => r.ativo).length}/{rules.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Alertas Ativos Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-sm">Alertas Recentes</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-[200px]"
                    />
                  </div>
                  <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterModulo} onValueChange={setFilterModulo}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="PEOTRAM">PEOTRAM</SelectItem>
                      <SelectItem value="PEO-DP">PEO-DP</SelectItem>
                      <SelectItem value="MLC">MLC</SelectItem>
                      <SelectItem value="SGSO">SGSO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredLogs.slice(0, 15).map(log => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      log.status === 'pendente' ? 'bg-warning/5 border-warning/30' :
                      log.status === 'acao_tomada' ? 'bg-success/5 border-success/30' :
                      'bg-card hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getPrioridadeColor(log.prioridade)}`}>
                        {getTipoIcon(log.tipo)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{log.titulo}</span>
                          <Badge variant="outline" className={getStatusColor(log.status)}>
                            {log.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{log.mensagem}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {getCanalIcon(log.canal)}
                            {log.canal}
                          </span>
                          <span>📁 {log.modulo}</span>
                          <span>📧 {log.destinatario}</span>
                          <span>🕐 {formatDate(log.dataCriacao)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.status === 'pendente' && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(log.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Marcar lido
                        </Button>
                      )}
                      {(log.status === 'enviado' || log.status === 'lido') && (
                        <Button size="sm" variant="default" onClick={() => handleMarkAsActionTaken(log.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Ação tomada
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteLog(log.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regras Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Regras de Alerta Configuradas
              </CardTitle>
              <CardDescription>
                Configure quando e como os alertas são disparados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map(rule => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-lg border ${rule.ativo ? 'bg-card' : 'bg-muted/30 opacity-60'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={rule.ativo}
                          onCheckedChange={() => handleToggleRule(rule.id)}
                        />
                        <div className={`p-2 rounded-full ${getPrioridadeColor(rule.prioridade)}`}>
                          {getTipoIcon(rule.tipo)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{rule.nome}</span>
                            <Badge className={getPrioridadeColor(rule.prioridade)}>
                              {rule.prioridade}
                            </Badge>
                            {rule.escalacao && (
                              <Badge variant="outline" className="text-xs">
                                <ArrowUp className="h-3 w-3 mr-1" />
                                Escalação {rule.diasEscalacao}d
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{rule.condicao}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>⏰ {rule.frequencia}</span>
                            <span>📅 {rule.diasAntecedencia} dias antecedência</span>
                            <span className="flex items-center gap-1">
                              Canais: {rule.canais.map(c => getCanalIcon(c))}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleTestAlert(rule)}>
                          <Zap className="h-4 w-4 mr-1" />
                          Testar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditRule(rule)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {rule.modulos.map(modulo => (
                        <Badge key={modulo} variant="secondary" className="text-xs">
                          {modulo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="text-sm">Histórico Completo de Alertas</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="enviado">Enviado</SelectItem>
                      <SelectItem value="lido">Lido</SelectItem>
                      <SelectItem value="acao_tomada">Ação Tomada</SelectItem>
                      <SelectItem value="erro">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    Exportar CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Título</th>
                      <th className="text-left p-2">Módulo</th>
                      <th className="text-left p-2">Canal</th>
                      <th className="text-left p-2">Destinatário</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Prioridade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 text-xs">{formatDate(log.dataCriacao)}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            {getTipoIcon(log.tipo)}
                            <span className="text-xs">{log.tipo.replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td className="p-2 text-xs max-w-[200px] truncate">{log.titulo}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">{log.modulo}</Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1">
                            {getCanalIcon(log.canal)}
                          </div>
                        </td>
                        <td className="p-2 text-xs">{log.destinatario}</td>
                        <td className="p-2">
                          <Badge variant="outline" className={`${getStatusColor(log.status)} text-xs`}>
                            {log.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge className={`${getPrioridadeColor(log.prioridade)} text-xs`}>
                            {log.prioridade}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Rule Dialog */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Regra de Alerta</DialogTitle>
          </DialogHeader>
          {selectedRule && (
            <div className="space-y-4">
              <div>
                <Label>Nome da Regra</Label>
                <Input
                  value={selectedRule.nome}
                  onChange={(e) => setSelectedRule({ ...selectedRule, nome: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Condição</Label>
                <Textarea
                  value={selectedRule.condicao}
                  onChange={(e) => setSelectedRule({ ...selectedRule, condicao: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dias de Antecedência</Label>
                  <Input
                    type="number"
                    value={selectedRule.diasAntecedencia}
                    onChange={(e) => setSelectedRule({ ...selectedRule, diasAntecedencia: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Frequência</Label>
                  <Select
                    value={selectedRule.frequencia}
                    onValueChange={(value) => setSelectedRule({ ...selectedRule, frequencia: value as AlertRule['frequencia'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imediato">Imediato</SelectItem>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={selectedRule.prioridade}
                  onValueChange={(value) => setSelectedRule({ ...selectedRule, prioridade: value as AlertRule['prioridade'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critica">Crítica</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={selectedRule.escalacao}
                    onCheckedChange={(checked) => setSelectedRule({ ...selectedRule, escalacao: checked })}
                  />
                  <Label>Escalação automática</Label>
                </div>
                {selectedRule.escalacao && (
                  <div className="flex items-center gap-2">
                    <Label>Após</Label>
                    <Input
                      type="number"
                      className="w-20"
                      value={selectedRule.diasEscalacao || 3}
                      onChange={(e) => setSelectedRule({ ...selectedRule, diasEscalacao: parseInt(e.target.value) })}
                    />
                    <span className="text-sm text-muted-foreground">dias</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRule}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SmartAlertsSystem;
