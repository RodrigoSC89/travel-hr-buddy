/**
 * Automatic Reports Scheduler
 * Schedule and manage automatic compliance reports generation
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Calendar, Clock, FileText, Mail, Download, Play, Pause,
  Plus, Settings, Trash2, CheckCircle2, AlertTriangle,
  BarChart3, Ship, Users, Shield, RefreshCw, Send
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addQuarters } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReportSchedule, ReportFrequency, ReportFormat } from '@/types/reporting-engine';

interface ScheduledReport {
  id: string;
  template_id: string;
  template_name: string;
  name: string;
  description: string | null;
  report_type: 'compliance' | 'audit' | 'nc' | 'training' | 'executive';
  frequency: ReportFrequency;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string | null;
  recipients: string[];
  format: ReportFormat;
  parameters: Record<string, unknown>;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_status?: 'success' | 'failed' | 'pending';
}

const REPORT_TYPES = [
  { id: 'compliance', name: 'Conformidade Mensal', icon: Shield, description: 'Score geral, NCs, tendências' },
  { id: 'audit', name: 'Auditoria Realizada', icon: FileText, description: 'Detalhes da auditoria com findings' },
  { id: 'nc', name: 'Não Conformidades', icon: AlertTriangle, description: 'NCs abertas, fechadas, vencidas' },
  { id: 'training', name: 'Treinamentos', icon: Users, description: 'Certificados, vencimentos, gaps' },
  { id: 'executive', name: 'Executivo', icon: BarChart3, description: 'KPIs e métricas de alto nível' }
];

const FREQUENCY_OPTIONS: { value: ReportFrequency; label: string; description: string }[] = [
  { value: 'daily', label: 'Diário', description: 'Todos os dias às 9h' },
  { value: 'weekly', label: 'Semanal', description: 'Toda segunda-feira' },
  { value: 'monthly', label: 'Mensal', description: 'Primeiro dia útil do mês' },
  { value: 'quarterly', label: 'Trimestral', description: 'Início de cada trimestre' }
];

const FORMAT_OPTIONS: { value: ReportFormat; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'json', label: 'JSON' }
];

const MOCK_SCHEDULES: ScheduledReport[] = [
  {
    id: '1',
    template_id: 't1',
    template_name: 'Relatório de Conformidade PEOTRAM',
    name: 'Relatório Mensal PEOTRAM',
    description: 'Relatório automático de conformidade PEOTRAM gerado no primeiro dia útil do mês',
    report_type: 'compliance',
    frequency: 'monthly',
    day_of_week: null,
    day_of_month: 1,
    time_of_day: '09:00',
    recipients: ['gerente@empresa.com', 'diretor@empresa.com'],
    format: 'pdf',
    parameters: { module: 'peotram' },
    is_active: true,
    last_run_at: addDays(new Date(), -15).toISOString(),
    next_run_at: addDays(new Date(), 15).toISOString(),
    created_by: 'admin',
    created_at: addMonths(new Date(), -3).toISOString(),
    updated_at: new Date().toISOString(),
    last_status: 'success'
  },
  {
    id: '2',
    template_id: 't2',
    template_name: 'Dashboard Executivo',
    name: 'Relatório Semanal Executivo',
    description: 'KPIs e métricas de alto nível para diretoria',
    report_type: 'executive',
    frequency: 'weekly',
    day_of_week: 1,
    day_of_month: null,
    time_of_day: '08:00',
    recipients: ['ceo@empresa.com', 'coo@empresa.com'],
    format: 'pdf',
    parameters: {},
    is_active: true,
    last_run_at: addDays(new Date(), -3).toISOString(),
    next_run_at: addDays(new Date(), 4).toISOString(),
    created_by: 'admin',
    created_at: addMonths(new Date(), -2).toISOString(),
    updated_at: new Date().toISOString(),
    last_status: 'success'
  },
  {
    id: '3',
    template_id: 't3',
    template_name: 'Alerta de NCs Críticas',
    name: 'Alerta Diário de NCs',
    description: 'Lista de NCs críticas e vencidas enviada diariamente',
    report_type: 'nc',
    frequency: 'daily',
    day_of_week: null,
    day_of_month: null,
    time_of_day: '07:00',
    recipients: ['seguranca@empresa.com', 'qualidade@empresa.com'],
    format: 'pdf',
    parameters: { severity: 'critical' },
    is_active: true,
    last_run_at: addDays(new Date(), -1).toISOString(),
    next_run_at: addDays(new Date(), 0).toISOString(),
    created_by: 'admin',
    created_at: addMonths(new Date(), -1).toISOString(),
    updated_at: new Date().toISOString(),
    last_status: 'success'
  },
  {
    id: '4',
    template_id: 't4',
    template_name: 'Relatório de Treinamentos',
    name: 'Vencimentos de Certificados',
    description: 'Certificados vencendo nos próximos 30 dias',
    report_type: 'training',
    frequency: 'weekly',
    day_of_week: 5,
    day_of_month: null,
    time_of_day: '17:00',
    recipients: ['rh@empresa.com', 'treinamento@empresa.com'],
    format: 'xlsx',
    parameters: { days_ahead: 30 },
    is_active: false,
    last_run_at: addDays(new Date(), -10).toISOString(),
    next_run_at: null,
    created_by: 'admin',
    created_at: addMonths(new Date(), -1).toISOString(),
    updated_at: new Date().toISOString(),
    last_status: 'failed'
  }
];

const MOCK_GENERATED_REPORTS = [
  { id: 'r1', title: 'Conformidade PEOTRAM - Janeiro 2025', type: 'compliance', generated_at: addDays(new Date(), -15).toISOString(), format: 'pdf', size: '1.2 MB' },
  { id: 'r2', title: 'Dashboard Executivo - Sem 03/2025', type: 'executive', generated_at: addDays(new Date(), -3).toISOString(), format: 'pdf', size: '856 KB' },
  { id: 'r3', title: 'NCs Críticas - 16/01/2025', type: 'nc', generated_at: addDays(new Date(), -1).toISOString(), format: 'pdf', size: '234 KB' },
  { id: 'r4', title: 'Conformidade PEOTRAM - Dezembro 2024', type: 'compliance', generated_at: addDays(new Date(), -45).toISOString(), format: 'pdf', size: '1.4 MB' },
  { id: 'r5', title: 'Dashboard Executivo - Sem 02/2025', type: 'executive', generated_at: addDays(new Date(), -10).toISOString(), format: 'pdf', size: '892 KB' }
];

export function AutomaticReportsScheduler() {
  const [schedules, setSchedules] = useState<ScheduledReport[]>(MOCK_SCHEDULES);
  const [activeTab, setActiveTab] = useState('schedules');
  const [isCreating, setIsCreating] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null);

  // New schedule form
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    description: '',
    report_type: 'compliance' as const,
    frequency: 'monthly' as ReportFrequency,
    day_of_week: 1,
    day_of_month: 1,
    time_of_day: '09:00',
    recipients: '',
    format: 'pdf' as ReportFormat
  });

  const getNextRunDate = (frequency: ReportFrequency): Date => {
    const now = new Date();
    switch (frequency) {
      case 'daily': return addDays(now, 1);
      case 'weekly': return addWeeks(now, 1);
      case 'monthly': return addMonths(now, 1);
      case 'quarterly': return addQuarters(now, 1);
    }
  };

  const handleCreateSchedule = () => {
    if (!newSchedule.name || !newSchedule.recipients) {
      toast.error('Preencha nome e destinatários');
      return;
    }

    const schedule: ScheduledReport = {
      id: Date.now().toString(),
      template_id: `t-${Date.now()}`,
      template_name: REPORT_TYPES.find(t => t.id === newSchedule.report_type)?.name || '',
      name: newSchedule.name,
      description: newSchedule.description,
      report_type: newSchedule.report_type,
      frequency: newSchedule.frequency,
      day_of_week: newSchedule.frequency === 'weekly' ? newSchedule.day_of_week : null,
      day_of_month: newSchedule.frequency === 'monthly' ? newSchedule.day_of_month : null,
      time_of_day: newSchedule.time_of_day,
      recipients: newSchedule.recipients.split(',').map(e => e.trim()),
      format: newSchedule.format,
      parameters: {},
      is_active: true,
      last_run_at: null,
      next_run_at: getNextRunDate(newSchedule.frequency).toISOString(),
      created_by: 'current_user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setSchedules(prev => [schedule, ...prev]);
    setIsCreating(false);
    setNewSchedule({
      name: '',
      description: '',
      report_type: 'compliance',
      frequency: 'monthly',
      day_of_week: 1,
      day_of_month: 1,
      time_of_day: '09:00',
      recipients: '',
      format: 'pdf'
    });
    toast.success('Agendamento criado!', {
      description: `Próxima execução: ${format(getNextRunDate(newSchedule.frequency), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
    });
  };

  const toggleScheduleActive = (id: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = !s.is_active;
        toast.success(newStatus ? 'Agendamento ativado' : 'Agendamento pausado');
        return { ...s, is_active: newStatus };
      }
      return s;
    }));
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    toast.success('Agendamento removido');
  };

  const runNow = (schedule: ScheduledReport) => {
    toast.success('Gerando relatório...', {
      description: `${schedule.name} será enviado para ${schedule.recipients.length} destinatário(s)`
    });
  };

  const getReportIcon = (type: string) => {
    const config = REPORT_TYPES.find(t => t.id === type);
    return config?.icon || FileText;
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      success: { variant: 'default', label: 'Sucesso' },
      failed: { variant: 'destructive', label: 'Falhou' },
      pending: { variant: 'secondary', label: 'Pendente' }
    };
    const c = config[status];
    return c ? <Badge variant={c.variant}>{c.label}</Badge> : null;
  };

  const stats = {
    total: schedules.length,
    active: schedules.filter(s => s.is_active).length,
    paused: schedules.filter(s => !s.is_active).length,
    failed: schedules.filter(s => s.last_status === 'failed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Relatórios Automáticos
          </h2>
          <p className="text-muted-foreground">
            Agende e gerencie relatórios automáticos de compliance
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Agendamento de Relatório</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Agendamento *</Label>
                <Input 
                  value={newSchedule.name}
                  onChange={e => setNewSchedule(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Relatório Mensal de Conformidade"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea 
                  value={newSchedule.description}
                  onChange={e => setNewSchedule(p => ({ ...p, description: e.target.value }))}
                  placeholder="Descreva o objetivo deste relatório..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Relatório</Label>
                  <Select 
                    value={newSchedule.report_type}
                    onValueChange={v => setNewSchedule(p => ({ ...p, report_type: v as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select 
                    value={newSchedule.frequency}
                    onValueChange={v => setNewSchedule(p => ({ ...p, frequency: v as ReportFrequency }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input 
                    type="time"
                    value={newSchedule.time_of_day}
                    onChange={e => setNewSchedule(p => ({ ...p, time_of_day: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select 
                    value={newSchedule.format}
                    onValueChange={v => setNewSchedule(p => ({ ...p, format: v as ReportFormat }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Destinatários *</Label>
                <Input 
                  value={newSchedule.recipients}
                  onChange={e => setNewSchedule(p => ({ ...p, recipients: e.target.value }))}
                  placeholder="email1@empresa.com, email2@empresa.com"
                />
                <p className="text-xs text-muted-foreground">Separe múltiplos emails por vírgula</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
              <Button onClick={handleCreateSchedule}>Criar Agendamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Play className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Pause className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.paused}</p>
                <p className="text-sm text-muted-foreground">Pausados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.failed}</p>
                <p className="text-sm text-muted-foreground">Com Erro</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedules" className="gap-2">
            <Calendar className="h-4 w-4" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <FileText className="h-4 w-4" />
            Relatórios Gerados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="mt-4 space-y-4">
          {schedules.map(schedule => {
            const ReportIcon = getReportIcon(schedule.report_type);
            return (
              <Card key={schedule.id} className={!schedule.is_active ? 'opacity-60' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${schedule.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                        <ReportIcon className={`h-6 w-6 ${schedule.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{schedule.name}</h3>
                          {getStatusBadge(schedule.last_status)}
                          {!schedule.is_active && <Badge variant="secondary">Pausado</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{schedule.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {FREQUENCY_OPTIONS.find(f => f.value === schedule.frequency)?.label} às {schedule.time_of_day}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {schedule.recipients.length} destinatário(s)
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {schedule.format.toUpperCase()}
                          </span>
                        </div>
                        {schedule.next_run_at && schedule.is_active && (
                          <p className="text-xs text-muted-foreground">
                            Próxima execução: {format(new Date(schedule.next_run_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={schedule.is_active}
                        onCheckedChange={() => toggleScheduleActive(schedule.id)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => runNow(schedule)}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteSchedule(schedule.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Relatórios Gerados</CardTitle>
              <CardDescription>Últimos relatórios gerados automaticamente</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {MOCK_GENERATED_REPORTS.map(report => {
                    const ReportIcon = getReportIcon(report.type);
                    return (
                      <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <ReportIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{report.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(report.generated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} • {report.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
