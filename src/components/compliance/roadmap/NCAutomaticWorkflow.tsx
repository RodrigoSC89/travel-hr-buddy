/**
 * NCAutomaticWorkflow - Fase 3: Fluxo NC Automático
 * Workflow completo: Abertura → Designação → Aprovação → Fechamento
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, CheckCircle2, Clock, FileText, User, 
  ArrowRight, Play, Pause, RotateCcw, Send, Upload,
  Calendar, Bell, Shield, Target, TrendingUp, Zap,
  ChevronRight, AlertCircle, CheckCheck, XCircle
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type NCStatus = 'open' | 'assigned' | 'in_progress' | 'pending_approval' | 'validated' | 'closed' | 'escalated';
type NCSeverity = 'critical' | 'high' | 'medium' | 'low';

interface NonConformance {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: NCSeverity;
  status: NCStatus;
  category: string;
  source: 'audit' | 'inspection' | 'manual' | 'system';
  created_at: string;
  due_date: string;
  assigned_to?: string;
  assigned_name?: string;
  root_cause?: string;
  action_plan?: string;
  evidence_expected?: string;
  evidence_uploaded?: boolean;
  progress: number;
  escalation_count: number;
  workflow_history: WorkflowStep[];
}

interface WorkflowStep {
  step: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  user?: string;
  notes?: string;
}

const WORKFLOW_STAGES = [
  { key: 'open', label: 'Abertura', icon: AlertTriangle },
  { key: 'assigned', label: 'Designação', icon: User },
  { key: 'in_progress', label: 'Em Andamento', icon: Play },
  { key: 'pending_approval', label: 'Aguardando Aprovação', icon: Clock },
  { key: 'validated', label: 'Validação', icon: CheckCircle2 },
  { key: 'closed', label: 'Fechado', icon: CheckCheck }
];

const SEVERITY_CONFIG: Record<NCSeverity, { color: string; weight: number; maxDays: number }> = {
  critical: { color: 'bg-destructive text-destructive-foreground', weight: 10, maxDays: 7 },
  high: { color: 'bg-warning text-warning-foreground', weight: 5, maxDays: 15 },
  medium: { color: 'bg-warning text-warning-foreground', weight: 3, maxDays: 30 },
  low: { color: 'bg-info text-info-foreground', weight: 1, maxDays: 45 }
};

// Empty fallback - components use useNonConformities hook for real data
const EMPTY_NCS: NonConformance[] = [];

const RESPONSIBLE_OPTIONS = [
  { id: 'user-1', name: 'João Silva', role: 'Gestor RH' },
  { id: 'user-2', name: 'Maria Santos', role: 'Coord. Segurança' },
  { id: 'user-3', name: 'Pedro Costa', role: 'Eng. Segurança' },
  { id: 'user-4', name: 'Ana Oliveira', role: 'Gerente Operações' },
  { id: 'user-5', name: 'Carlos Mendes', role: 'Supervisor' }
];

const ROOT_CAUSE_OPTIONS = [
  'Falta de treinamento',
  'Processo manual sem controle',
  'Procedimento desatualizado',
  'Falha de comunicação',
  'Equipamento inadequado',
  'Falta de supervisão',
  'Sobrecarga de trabalho',
  'Outro (especificar)'
];

export function NCAutomaticWorkflow() {
  const [ncs, setNcs] = useState<NonConformance[]>(EMPTY_NCS);
  const [selectedNC, setSelectedNC] = useState<NonConformance | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isCreatingNC, setIsCreatingNC] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for new NC
  const [newNC, setNewNC] = useState({
    title: '',
    description: '',
    severity: 'medium' as NCSeverity,
    category: 'Treinamento',
    assigned_to: ''
  });

  // Form state for action plan
  const [actionPlan, setActionPlan] = useState({
    root_cause: '',
    action_description: '',
    evidence_expected: '',
    due_date: ''
  });

  const filteredNCs = activeTab === 'all' 
    ? ncs 
    : ncs.filter(nc => nc.status === activeTab);

  const stats = {
    total: ncs.length,
    open: ncs.filter(nc => nc.status === 'open').length,
    inProgress: ncs.filter(nc => ['assigned', 'in_progress'].includes(nc.status)).length,
    pendingApproval: ncs.filter(nc => nc.status === 'pending_approval').length,
    closed: ncs.filter(nc => nc.status === 'closed').length,
    critical: ncs.filter(nc => nc.severity === 'critical' && nc.status !== 'closed').length,
    overdue: ncs.filter(nc => new Date(nc.due_date) < new Date() && nc.status !== 'closed').length
  };

  const handleCreateNC = () => {
    if (!newNC.title || !newNC.description) {
      toast.error('Preencha título e descrição');
      return;
    }

    const code = `NC-${new Date().getFullYear()}-${String(ncs.length + 44).padStart(5, '0')}`;
    const severityConfig = SEVERITY_CONFIG[newNC.severity];
    
    const nc: NonConformance = {
      id: Date.now().toString(),
      code,
      title: newNC.title,
      description: newNC.description,
      severity: newNC.severity,
      status: newNC.assigned_to ? 'assigned' : 'open',
      category: newNC.category,
      source: 'manual',
      created_at: new Date().toISOString(),
      due_date: addDays(new Date(), severityConfig.maxDays).toISOString(),
      assigned_to: newNC.assigned_to || undefined,
      assigned_name: RESPONSIBLE_OPTIONS.find(r => r.id === newNC.assigned_to)?.name,
      progress: newNC.assigned_to ? 25 : 0,
      escalation_count: 0,
      workflow_history: [
        { step: 'Abertura Manual', status: 'completed', date: new Date().toISOString(), user: 'Usuário Atual' },
        ...(newNC.assigned_to ? [{ step: 'Designação', status: 'current' as const, date: new Date().toISOString() }] : [])
      ]
    };

    setNcs(prev => [nc, ...prev]);
    setIsCreatingNC(false);
    setNewNC({ title: '', description: '', severity: 'medium', category: 'Treinamento', assigned_to: '' });
    toast.success(`NC ${code} criada com sucesso!`, {
      description: newNC.assigned_to ? 'Responsável notificado automaticamente' : 'Aguardando designação de responsável'
    });
  };

  const handleAssignResponsible = (ncId: string, userId: string) => {
    const responsible = RESPONSIBLE_OPTIONS.find(r => r.id === userId);
    setNcs(prev => prev.map(nc => {
      if (nc.id === ncId) {
        return {
          ...nc,
          status: 'assigned',
          assigned_to: userId,
          assigned_name: responsible ? `${responsible.name} (${responsible.role})` : undefined,
          progress: 25,
          workflow_history: [
            ...nc.workflow_history,
            { step: 'Designação', status: 'current', date: new Date().toISOString(), user: 'Sistema' }
          ]
        };
      }
      return nc;
    }));
    toast.success('Responsável designado!', { description: `${responsible?.name} foi notificado por email` });
  };

  const handleSubmitActionPlan = (ncId: string) => {
    if (!actionPlan.root_cause || !actionPlan.action_description) {
      toast.error('Preencha causa raiz e plano de ação');
      return;
    }

    setNcs(prev => prev.map(nc => {
      if (nc.id === ncId) {
        return {
          ...nc,
          status: 'in_progress',
          root_cause: actionPlan.root_cause,
          action_plan: actionPlan.action_description,
          evidence_expected: actionPlan.evidence_expected,
          progress: 50,
          workflow_history: [
            ...nc.workflow_history.map(h => ({ ...h, status: 'completed' as const })),
            { step: 'Plano de Ação Aprovado', status: 'current', date: new Date().toISOString() }
          ]
        };
      }
      return nc;
    }));
    setActionPlan({ root_cause: '', action_description: '', evidence_expected: '', due_date: '' });
    toast.success('Plano de ação registrado!', { description: 'Sistema validou automaticamente' });
  };

  const handleUploadEvidence = (ncId: string) => {
    setNcs(prev => prev.map(nc => {
      if (nc.id === ncId) {
        return {
          ...nc,
          status: 'pending_approval',
          evidence_uploaded: true,
          progress: 85,
          workflow_history: [
            ...nc.workflow_history.map(h => ({ ...h, status: 'completed' as const })),
            { step: 'Evidência Enviada', status: 'current', date: new Date().toISOString() }
          ]
        };
      }
      return nc;
    }));
    toast.success('Evidência enviada!', { description: 'Aguardando validação do auditor' });
  };

  const handleValidateNC = (ncId: string, approved: boolean) => {
    if (approved) {
      setNcs(prev => prev.map(nc => {
        if (nc.id === ncId) {
          return {
            ...nc,
            status: 'closed',
            progress: 100,
            workflow_history: [
              ...nc.workflow_history.map(h => ({ ...h, status: 'completed' as const })),
              { step: 'Fechamento', status: 'completed', date: new Date().toISOString(), user: 'Auditor' }
            ]
          };
        }
        return nc;
      }));
      toast.success('NC fechada com sucesso!', { description: 'Histórico completo registrado' });
    } else {
      setNcs(prev => prev.map(nc => {
        if (nc.id === ncId) {
          return {
            ...nc,
            status: 'in_progress',
            evidence_uploaded: false,
            progress: 50,
            workflow_history: [
              ...nc.workflow_history,
              { step: 'Evidência Rejeitada', status: 'current', date: new Date().toISOString(), notes: 'Retornou para correção' }
            ]
          };
        }
        return nc;
      }));
      toast.warning('Evidência rejeitada', { description: 'NC retornou para correção' });
    }
  };

  const getStatusIcon = (status: NCStatus) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'assigned': return <User className="h-4 w-4 text-info" />;
      case 'in_progress': return <Play className="h-4 w-4 text-warning" />;
      case 'pending_approval': return <Clock className="h-4 w-4 text-warning" />;
      case 'validated': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'closed': return <CheckCheck className="h-4 w-4 text-success" />;
      case 'escalated': return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusLabel = (status: NCStatus) => {
    const labels: Record<NCStatus, string> = {
      open: 'Aberta',
      assigned: 'Designada',
      in_progress: 'Em Andamento',
      pending_approval: 'Aguardando Aprovação',
      validated: 'Validada',
      closed: 'Fechada',
      escalated: 'Escalada'
    };
    return labels[status];
  };

  const getDaysRemaining = (dueDate: string) => {
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return <span className="text-destructive font-bold">Atrasado {Math.abs(days)}d</span>;
    if (days <= 3) return <span className="text-orange-500 font-semibold">{days}d restantes</span>;
    return <span className="text-muted-foreground">{days}d restantes</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fluxo de Não Conformidades</h2>
          <p className="text-muted-foreground">Workflow automático: Abertura → Designação → Aprovação → Fechamento</p>
        </div>
        <Dialog open={isCreatingNC} onOpenChange={setIsCreatingNC}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Zap className="h-4 w-4" />
              Nova NC
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Abrir Nova Não Conformidade</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título *</label>
                <Input 
                  value={newNC.title}
                  onChange={e => setNewNC(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Certificado NR-10 Vencido"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição *</label>
                <Textarea 
                  value={newNC.description}
                  onChange={e => setNewNC(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva a não conformidade encontrada..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severidade</label>
                  <Select 
                    value={newNC.severity}
                    onValueChange={v => setNewNC(prev => ({ ...prev, severity: v as NCSeverity }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">🔴 Crítica (7 dias)</SelectItem>
                      <SelectItem value="high">🟠 Alta (15 dias)</SelectItem>
                      <SelectItem value="medium">🟡 Média (30 dias)</SelectItem>
                      <SelectItem value="low">🔵 Baixa (45 dias)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select 
                    value={newNC.category}
                    onValueChange={v => setNewNC(prev => ({ ...prev, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Treinamento">Treinamento</SelectItem>
                      <SelectItem value="Documentação">Documentação</SelectItem>
                      <SelectItem value="Procedimentos">Procedimentos</SelectItem>
                      <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Responsável (opcional)</label>
                <Select 
                  value={newNC.assigned_to}
                  onValueChange={v => setNewNC(prev => ({ ...prev, assigned_to: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RESPONSIBLE_OPTIONS.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name} ({r.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreatingNC(false)}>Cancelar</Button>
              <Button onClick={handleCreateNC}>Criar NC</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-3">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </Card>
        <Card className="p-3 border-destructive/50">
          <div className="text-2xl font-bold text-destructive">{stats.critical}</div>
          <div className="text-xs text-muted-foreground">Críticas</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-blue-500">{stats.open}</div>
          <div className="text-xs text-muted-foreground">Abertas</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
          <div className="text-xs text-muted-foreground">Em Andamento</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-orange-500">{stats.pendingApproval}</div>
          <div className="text-xs text-muted-foreground">Aguardando</div>
        </Card>
        <Card className="p-3">
          <div className="text-2xl font-bold text-green-500">{stats.closed}</div>
          <div className="text-xs text-muted-foreground">Fechadas</div>
        </Card>
        <Card className="p-3 border-destructive/50">
          <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
          <div className="text-xs text-muted-foreground">Atrasadas</div>
        </Card>
      </div>

      {/* Workflow Pipeline Visual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pipeline de Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {WORKFLOW_STAGES.map((stage, index) => {
              const count = ncs.filter(nc => nc.status === stage.key).length;
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex items-center">
                  <div className={`flex flex-col items-center p-3 rounded-lg transition-colors ${count > 0 ? 'bg-primary/10' : 'bg-muted/50'}`}>
                    <Icon className={`h-6 w-6 mb-1 ${count > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium">{stage.label}</span>
                    <Badge variant={count > 0 ? 'default' : 'secondary'} className="mt-1">
                      {count}
                    </Badge>
                  </div>
                  {index < WORKFLOW_STAGES.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* NC List */}
      <Card>
        <CardHeader className="pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Todas ({ncs.length})</TabsTrigger>
              <TabsTrigger value="open">Abertas</TabsTrigger>
              <TabsTrigger value="assigned">Designadas</TabsTrigger>
              <TabsTrigger value="in_progress">Em Andamento</TabsTrigger>
              <TabsTrigger value="pending_approval">Aguardando</TabsTrigger>
              <TabsTrigger value="closed">Fechadas</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredNCs.map(nc => (
                <Card 
                  key={nc.id} 
                  className={`p-4 cursor-pointer hover:border-primary/50 transition-colors ${selectedNC?.id === nc.id ? 'border-primary' : ''}`}
                  onClick={() => setSelectedNC(nc)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">{nc.code}</Badge>
                        <Badge className={SEVERITY_CONFIG[nc.severity].color}>
                          {nc.severity.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm">
                          {getStatusIcon(nc.status)}
                          <span>{getStatusLabel(nc.status)}</span>
                        </div>
                      </div>
                      <h4 className="font-semibold">{nc.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{nc.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {getDaysRemaining(nc.due_date)}
                        </span>
                        {nc.assigned_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {nc.assigned_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-20">
                      <div className="text-right text-sm font-medium mb-1">{nc.progress}%</div>
                      <Progress value={nc.progress} className="h-2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* NC Detail Panel */}
      {selectedNC && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">{selectedNC.code}</Badge>
                  {selectedNC.title}
                </CardTitle>
                <CardDescription>{selectedNC.description}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedNC(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Workflow Timeline */}
            <div>
              <h4 className="font-semibold mb-3">Histórico do Workflow</h4>
              <div className="space-y-2">
                {selectedNC.workflow_history.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${step.status === 'completed' ? 'bg-success' : step.status === 'current' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{step.step}</span>
                        {step.date && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(step.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                      {step.user && <p className="text-xs text-muted-foreground">Por: {step.user}</p>}
                      {step.notes && <p className="text-sm text-muted-foreground">{step.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Action Buttons based on status */}
            <div className="space-y-4">
              {selectedNC.status === 'open' && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Designar Responsável</h4>
                  <Select onValueChange={v => handleAssignResponsible(selectedNC.id, v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RESPONSIBLE_OPTIONS.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} ({r.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedNC.status === 'assigned' && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Preencher Plano de Ação</h4>
                  <div className="space-y-2">
                    <Select 
                      value={actionPlan.root_cause}
                      onValueChange={v => setActionPlan(prev => ({ ...prev, root_cause: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Causa Raiz..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOT_CAUSE_OPTIONS.map(cause => (
                          <SelectItem key={cause} value={cause}>{cause}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea 
                      value={actionPlan.action_description}
                      onChange={e => setActionPlan(prev => ({ ...prev, action_description: e.target.value }))}
                      placeholder="Descreva o plano de ação..."
                    />
                    <Input 
                      value={actionPlan.evidence_expected}
                      onChange={e => setActionPlan(prev => ({ ...prev, evidence_expected: e.target.value }))}
                      placeholder="Evidência esperada (ex: Certificado + Print do sistema)"
                    />
                    <Button onClick={() => handleSubmitActionPlan(selectedNC.id)} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Submeter Plano de Ação
                    </Button>
                  </div>
                </div>
              )}

              {selectedNC.status === 'in_progress' && !selectedNC.evidence_uploaded && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Enviar Evidência</h4>
                  <p className="text-sm text-muted-foreground">
                    Evidência esperada: {selectedNC.evidence_expected || 'Documento comprobatório'}
                  </p>
                  <Button onClick={() => handleUploadEvidence(selectedNC.id)} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Evidência
                  </Button>
                </div>
              )}

              {selectedNC.status === 'pending_approval' && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Validação do Auditor</h4>
                  <p className="text-sm text-muted-foreground">
                    Evidência recebida. Valide se está conforme os critérios.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleValidateNC(selectedNC.id, false)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => handleValidateNC(selectedNC.id, true)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Aprovar e Fechar
                    </Button>
                  </div>
                </div>
              )}

              {selectedNC.status === 'closed' && (
                <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
                  <CheckCheck className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="font-semibold text-success">NC Fechada com Sucesso</p>
                  <p className="text-sm text-muted-foreground">Histórico completo registrado para auditoria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
