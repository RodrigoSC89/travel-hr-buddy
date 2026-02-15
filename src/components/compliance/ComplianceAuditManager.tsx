/**
 * Compliance Audit Manager - Supabase Integrated
 * Full audit workflow: templates, execution, findings, NC management, export
 * Persisted via internal_audits + non_conformities tables
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Plus, Search, Trash2, Download, Play, CheckCircle,
  Clock, FileText, AlertTriangle, Eye, RefreshCw, Shield,
  ClipboardList, Flag
} from 'lucide-react';

interface AuditRun {
  id: string;
  audit_number: string;
  audit_type: string;
  standard: string;
  vessel_name: string;
  vessel_id: string | null;
  status: string;
  scheduled_date: string;
  started_at: string | null;
  completed_at: string | null;
  auditor: string;
  score: number;
  findings_count: number;
  nc_count: number;
  notes: string | null;
}

const AUDIT_STANDARDS = [
  { value: 'ism', label: 'ISM Code' },
  { value: 'isps', label: 'ISPS Code' },
  { value: 'marpol', label: 'MARPOL' },
  { value: 'solas', label: 'SOLAS' },
  { value: 'mlc', label: 'MLC 2006' },
  { value: 'iso9001', label: 'ISO 9001' },
  { value: 'iso14001', label: 'ISO 14001' },
  { value: 'psc', label: 'Port State Control' },
  { value: 'imca', label: 'IMCA' },
  { value: 'ocimf', label: 'OCIMF/SIRE' },
];

export function ComplianceAuditManager() {
  const [search, setSearch] = useState('');
  const [filterStandard, setFilterStandard] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditRun | null>(null);
  const queryClient = useQueryClient();

  const [newAudit, setNewAudit] = useState({
    audit_type: 'internal',
    standard: 'ism',
    vessel_name: '',
    auditor: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Fetch audits from internal_audits
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ['compliance-audits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_audits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((a): AuditRun => ({
        id: a.id,
        audit_number: a.audit_number || `AUD-${a.id.slice(0, 6)}`,
        audit_type: a.audit_type || 'internal',
        standard: a.audit_type || 'ism',
        vessel_name: '',
        vessel_id: a.vessel_id,
        status: a.status || 'scheduled',
        scheduled_date: a.scheduled_date || a.created_at || '',
        started_at: null,
        completed_at: a.completed_date,
        auditor: a.auditor_name || '',
        score: Number(a.score) || 0,
        findings_count: Number(a.findings_count) || 0,
        nc_count: 0,
        notes: null,
      }));
    },
    staleTime: 30000,
  });

  // Create audit mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newAudit) => {
      const auditNumber = `AUD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const { error } = await supabase.from('internal_audits').insert({
        audit_number: auditNumber,
        audit_type: data.audit_type,
        auditor_name: data.auditor,
        scheduled_date: data.scheduled_date,
        status: 'scheduled',
        department: `Auditoria ${AUDIT_STANDARDS.find(s => s.value === data.standard)?.label || data.standard}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-audits'] });
      toast.success('Auditoria agendada com sucesso');
      setIsFormOpen(false);
      setNewAudit({ audit_type: 'internal', standard: 'ism', vessel_name: '', auditor: '', scheduled_date: new Date().toISOString().split('T')[0], notes: '' });
    },
    onError: () => toast.error('Erro ao criar auditoria'),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'in_progress') updates.start_date = new Date().toISOString();
      if (status === 'completed') updates.completion_date = new Date().toISOString();
      const { error } = await supabase.from('internal_audits').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-audits'] });
      toast.success('Status atualizado');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('internal_audits').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-audits'] });
      toast.success('Auditoria removida');
    },
  });

  const filteredAudits = audits.filter(a => {
    const matchesSearch = a.vessel_name.toLowerCase().includes(search.toLowerCase()) ||
      a.audit_number.toLowerCase().includes(search.toLowerCase()) ||
      a.auditor.toLowerCase().includes(search.toLowerCase());
    const matchesStandard = filterStandard === 'all' || a.standard === filterStandard;
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStandard && matchesStatus;
  });

  const stats = {
    total: audits.length,
    scheduled: audits.filter(a => a.status === 'scheduled').length,
    inProgress: audits.filter(a => a.status === 'in_progress').length,
    completed: audits.filter(a => a.status === 'completed').length,
    avgScore: audits.filter(a => a.score > 0).length > 0
      ? Math.round(audits.filter(a => a.score > 0).reduce((s, a) => s + a.score, 0) / audits.filter(a => a.score > 0).length)
      : 0,
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      completed: { label: 'Concluída', className: 'bg-success' },
      in_progress: { label: 'Em Andamento', className: 'bg-primary' },
      scheduled: { label: 'Agendada', className: 'bg-muted' },
      pending_review: { label: 'Revisão Pendente', className: 'bg-warning' },
      cancelled: { label: 'Cancelada', className: 'bg-destructive' },
    };
    const c = config[status] || { label: status, className: 'bg-muted' };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const handleExport = (audit: AuditRun) => {
    const data = {
      numero: audit.audit_number,
      embarcacao: audit.vessel_name,
      padrao: AUDIT_STANDARDS.find(s => s.value === audit.standard)?.label,
      auditor: audit.auditor,
      dataAgendada: audit.scheduled_date ? new Date(audit.scheduled_date).toLocaleDateString('pt-BR') : '',
      status: audit.status,
      score: `${audit.score}%`,
      ncs: audit.nc_count,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${audit.audit_number}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Relatório exportado');
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-4 text-center"><ClipboardList className="h-5 w-5 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Auditorias</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{stats.scheduled}</p><p className="text-xs text-muted-foreground">Agendadas</p></CardContent></Card>
        <Card className="border-primary/20"><CardContent className="pt-4 text-center"><Play className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold text-primary">{stats.inProgress}</p><p className="text-xs text-muted-foreground">Em Andamento</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><CheckCircle className="h-5 w-5 mx-auto mb-1 text-success" /><p className="text-2xl font-bold text-success">{stats.completed}</p><p className="text-xs text-muted-foreground">Concluídas</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Shield className="h-5 w-5 mx-auto mb-1 text-muted-foreground" /><p className={`text-2xl font-bold ${getScoreColor(stats.avgScore)}`}>{stats.avgScore}%</p><p className="text-xs text-muted-foreground">Score Médio</p></CardContent></Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar auditorias..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterStandard} onValueChange={setFilterStandard}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Padrão" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {AUDIT_STANDARDS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="scheduled">Agendada</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsFormOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova Auditoria</Button>
      </div>

      {/* Audit List */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : filteredAudits.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">Nenhuma auditoria encontrada</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filteredAudits.map(audit => (
            <Card key={audit.id} className={audit.status === 'in_progress' ? 'border-primary/30' : ''}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{audit.audit_number}</code>
                      {getStatusBadge(audit.status)}
                      <Badge variant="outline" className="text-xs">
                        {AUDIT_STANDARDS.find(s => s.value === audit.standard)?.label || audit.standard}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{audit.vessel_name || 'N/A'}</span>
                      <span>Auditor: {audit.auditor || 'N/A'}</span>
                      <span>{audit.scheduled_date ? new Date(audit.scheduled_date).toLocaleDateString('pt-BR') : ''}</span>
                      {audit.score > 0 && <span className={`font-bold ${getScoreColor(audit.score)}`}>Score: {audit.score}%</span>}
                      {audit.nc_count > 0 && <span className="text-destructive flex items-center gap-1"><Flag className="h-3 w-3" />{audit.nc_count} NCs</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {audit.status === 'scheduled' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: audit.id, status: 'in_progress' })}>
                        <Play className="h-3 w-3 mr-1" />Iniciar
                      </Button>
                    )}
                    {audit.status === 'in_progress' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: audit.id, status: 'completed' })}>
                        <CheckCircle className="h-3 w-3 mr-1" />Concluir
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleExport(audit)}>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => {
                      if (window.confirm('Excluir auditoria?')) deleteMutation.mutate(audit.id);
                    }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />Agendar Auditoria</DialogTitle>
            <DialogDescription>Crie uma nova auditoria de compliance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Tipo</Label>
                <Select value={newAudit.audit_type} onValueChange={v => setNewAudit(p => ({ ...p, audit_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Interna</SelectItem>
                    <SelectItem value="external">Externa</SelectItem>
                    <SelectItem value="psc">PSC</SelectItem>
                    <SelectItem value="class">Classe</SelectItem>
                    <SelectItem value="flag">Flag State</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Padrão</Label>
                <Select value={newAudit.standard} onValueChange={v => setNewAudit(p => ({ ...p, standard: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AUDIT_STANDARDS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Embarcação *</Label><Input value={newAudit.vessel_name} onChange={e => setNewAudit(p => ({ ...p, vessel_name: e.target.value }))} placeholder="MV Santos Explorer" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Auditor *</Label><Input value={newAudit.auditor} onChange={e => setNewAudit(p => ({ ...p, auditor: e.target.value }))} placeholder="Nome do auditor" /></div>
              <div><Label>Data *</Label><Input type="date" value={newAudit.scheduled_date} onChange={e => setNewAudit(p => ({ ...p, scheduled_date: e.target.value }))} /></div>
            </div>
            <div><Label>Observações</Label><Textarea value={newAudit.notes} onChange={e => setNewAudit(p => ({ ...p, notes: e.target.value }))} placeholder="Escopo e observações..." rows={2} /></div>
            <Button className="w-full" onClick={() => createMutation.mutate(newAudit)} disabled={!newAudit.vessel_name || !newAudit.auditor || createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Agendar Auditoria'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
