/**
 * Automatic Reports Scheduler - Real Supabase Integration
 * Schedule and manage automatic compliance reports generation
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fromUntyped } from '@/integrations/supabase/untyped-client';
import { 
  Calendar, Clock, FileText, Mail, Download, Play, Pause,
  Plus, Settings, Trash2, CheckCircle2, AlertTriangle,
  BarChart3, Ship, Users, Shield, RefreshCw, Send, Loader2
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addQuarters } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReportFrequency, ReportFormat } from '@/types/reporting-engine';

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

export function AutomaticReportsScheduler() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('schedules');
  const [isCreating, setIsCreating] = useState(false);

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

  // Fetch schedules from Supabase
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['report-schedules-real'],
    queryFn: async () => {
      const { data, error } = await fromUntyped('report_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return (data as Record<string, unknown>[]).map((d): ScheduledReport => ({
        id: String(d.id),
        template_id: String(d.template_id || ''),
        template_name: String(d.template_name || d.name || ''),
        name: String(d.name || ''),
        description: (d.description as string | null) ?? null,
        report_type: (d.report_type as ScheduledReport["report_type"]) || 'compliance',
        frequency: (d.frequency as ReportFrequency) || 'monthly',
        day_of_week: (d.day_of_week as number | null) ?? null,
        day_of_month: (d.day_of_month as number | null) ?? null,
        time_of_day: (d.time_of_day as string | null) ?? null,
        recipients: Array.isArray(d.recipients) ? d.recipients as string[] : [],
        format: (d.format as ReportFormat) || 'pdf',
        parameters: (d.parameters as Record<string, unknown>) || {},
        is_active: Boolean(d.is_active ?? true),
        last_run_at: (d.last_run_at as string | null) ?? null,
        next_run_at: (d.next_run_at as string | null) ?? null,
        created_by: (d.created_by as string | null) ?? null,
        created_at: String(d.created_at || ''),
        updated_at: String(d.updated_at || ''),
        last_status: d.last_status as ScheduledReport["last_status"],
      }));
    },
  });

  // Fetch generated reports
  const { data: generatedReports = [] } = useQuery({
    queryKey: ['generated-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generated_documents')
        .select('id, title, document_type, created_at, status')
        .eq('document_type', 'report')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error || !data) return [];
      return data.map(d => ({
        id: d.id,
        title: d.title,
        type: d.document_type,
        generated_at: d.created_at,
        format: 'pdf',
        size: '—',
      }));
    },
  });

  // Create schedule mutation
  const createMutation = useMutation({
    mutationFn: async (schedule: typeof newSchedule) => {
      const getNextRunDate = (frequency: ReportFrequency): string => {
        const now = new Date();
        switch (frequency) {
          case 'daily': return addDays(now, 1).toISOString();
          case 'weekly': return addWeeks(now, 1).toISOString();
          case 'monthly': return addMonths(now, 1).toISOString();
          case 'quarterly': return addQuarters(now, 1).toISOString();
        }
      };

      const { error } = await fromUntyped('report_schedules').insert({
        name: schedule.name,
        description: schedule.description || null,
        report_type: schedule.report_type,
        frequency: schedule.frequency,
        day_of_week: schedule.frequency === 'weekly' ? schedule.day_of_week : null,
        day_of_month: schedule.frequency === 'monthly' ? schedule.day_of_month : null,
        time_of_day: schedule.time_of_day,
        recipients: schedule.recipients.split(',').map(e => e.trim()),
        format: schedule.format,
        is_active: true,
        next_run_at: getNextRunDate(schedule.frequency),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules-real'] });
      setIsCreating(false);
      setNewSchedule({ name: '', description: '', report_type: 'compliance', frequency: 'monthly', day_of_week: 1, day_of_month: 1, time_of_day: '09:00', recipients: '', format: 'pdf' });
      toast.success('Agendamento criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar agendamento'),
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await fromUntyped('report_schedules').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules-real'] });
      toast.success('Status atualizado');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromUntyped('report_schedules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-schedules-real'] });
      toast.success('Agendamento removido');
    },
  });

  const handleCreateSchedule = () => {
    if (!newSchedule.name || !newSchedule.recipients) {
      toast.error('Preencha nome e destinatários');
      return;
    }
    createMutation.mutate(newSchedule);
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
                  <Select value={newSchedule.report_type} onValueChange={v => setNewSchedule(p => ({ ...p, report_type: v as typeof p.report_type }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2"><type.icon className="h-4 w-4" />{type.name}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select value={newSchedule.frequency} onValueChange={v => setNewSchedule(p => ({ ...p, frequency: v as ReportFrequency }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input type="time" value={newSchedule.time_of_day} onChange={e => setNewSchedule(p => ({ ...p, time_of_day: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select value={newSchedule.format} onValueChange={v => setNewSchedule(p => ({ ...p, format: v as ReportFormat }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
              <Button onClick={handleCreateSchedule} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Agendamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10"><Play className="h-5 w-5 text-success" /></div>
              <div><p className="text-2xl font-bold">{stats.active}</p><p className="text-sm text-muted-foreground">Ativos</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10"><Pause className="h-5 w-5 text-warning" /></div>
              <div><p className="text-2xl font-bold">{stats.paused}</p><p className="text-sm text-muted-foreground">Pausados</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
              <div><p className="text-2xl font-bold">{stats.failed}</p><p className="text-sm text-muted-foreground">Falharam</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="text-sm text-muted-foreground mt-2">Carregando agendamentos...</p></CardContent></Card>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="font-medium mb-2">Nenhum agendamento encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">Crie seu primeiro agendamento de relatório automático</p>
                <Button onClick={() => setIsCreating(true)} className="gap-2"><Plus className="h-4 w-4" />Novo Agendamento</Button>
              </CardContent>
            </Card>
          ) : (
            schedules.map((schedule) => {
              const ReportIcon = getReportIcon(schedule.report_type);
              return (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${schedule.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                          <ReportIcon className={`h-6 w-6 ${schedule.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{schedule.name}</h3>
                            <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                              {schedule.is_active ? 'Ativo' : 'Pausado'}
                            </Badge>
                            {getStatusBadge(schedule.last_status)}
                          </div>
                          {schedule.description && <p className="text-sm text-muted-foreground mb-2">{schedule.description}</p>}
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{FREQUENCY_OPTIONS.find(f => f.value === schedule.frequency)?.label || schedule.frequency}</span>
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{schedule.recipients?.length || 0} destinatário(s)</span>
                            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{schedule.format?.toUpperCase()}</span>
                            {schedule.next_run_at && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Próximo: {format(new Date(schedule.next_run_at), "dd/MM/yyyy", { locale: ptBR })}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => toggleMutation.mutate({ id: schedule.id, is_active: !schedule.is_active })}>
                          {schedule.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(schedule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Relatórios Gerados</CardTitle>
              <CardDescription>Histórico de relatórios gerados automaticamente</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum relatório gerado ainda</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {generatedReports.map(report => (
                      <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{report.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(report.generated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardContent className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {REPORT_TYPES.map(type => (
                  <Card key={type.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => { setNewSchedule(p => ({ ...p, report_type: type.id as typeof p.report_type, name: type.name })); setIsCreating(true); }}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10"><type.icon className="h-5 w-5 text-primary" /></div>
                        <h3 className="font-medium">{type.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}