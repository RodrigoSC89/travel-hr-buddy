/**
 * Maintenance Management - Connected to Supabase 'maintenance_tasks' table
 * Full CRUD with real data persistence
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Wrench, Plus, Search, Calendar, CheckCircle, AlertTriangle,
  Clock, Edit, DollarSign, Activity, Shield, Eye, Loader2, Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MaintenanceRecord {
  id: string;
  title: string;
  description: string | null;
  task_type: string | null;
  priority: string | null;
  status: string | null;
  vessel_id: string | null;
  scheduled_date: string | null;
  completed_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  assigned_to: string | null;
  created_at: string;
  vessels?: { name: string } | null;
  [key: string]: unknown;
}

const MaintenanceManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newMaintenance, setNewMaintenance] = useState({
    title: "", description: "", task_type: "", priority: "",
    scheduled_date: "", estimated_hours: "", estimated_cost: "",
    assigned_to: "", vessel_id: ""
  });

  // Fetch from Supabase
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['maintenance-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*, vessels:vessel_id(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as MaintenanceRecord[];
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (record: typeof newMaintenance) => {
      const { error } = await supabase.from('maintenance_tasks').insert({
        title: record.title,
        description: record.description || null,
        task_type: record.task_type || 'preventive',
        priority: record.priority || 'medium',
        status: 'scheduled',
        scheduled_date: record.scheduled_date || null,
        estimated_hours: record.estimated_hours ? parseInt(record.estimated_hours) : null,
        estimated_cost: record.estimated_cost ? parseFloat(record.estimated_cost) : null,
        assigned_to: record.assigned_to || null,
        vessel_id: record.vessel_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
      setShowAddDialog(false);
      setNewMaintenance({ title: "", description: "", task_type: "", priority: "", scheduled_date: "", estimated_hours: "", estimated_cost: "", assigned_to: "", vessel_id: "" });
      toast({ title: "Manutenção agendada", description: "Registro criado com sucesso." });
    },
    onError: () => toast({ title: "Erro", description: "Falha ao criar manutenção.", variant: "destructive" }),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'completed') updates.completed_date = new Date().toISOString();
      const { error } = await supabase.from('maintenance_tasks').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
      toast({ title: "Status atualizado" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('maintenance_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
      toast({ title: "Manutenção removida" });
    },
  });

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      scheduled: "bg-info text-info-foreground", in_progress: "bg-warning text-warning-foreground",
      completed: "bg-success text-success-foreground", overdue: "bg-destructive text-destructive-foreground",
      cancelled: "bg-muted text-muted-foreground"
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      scheduled: "Agendada", in_progress: "Em Andamento", completed: "Concluída",
      overdue: "Atrasada", cancelled: "Cancelada"
    };
    return map[status] || status;
  };

  const getMaintenanceTypeIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      preventive: <Shield className="h-4 w-4 text-success" />,
      corrective: <Wrench className="h-4 w-4 text-warning" />,
      emergency: <AlertTriangle className="h-4 w-4 text-destructive" />,
      inspection: <CheckCircle className="h-4 w-4 text-info" />,
    };
    return map[type] || <Wrench className="h-4 w-4 text-muted-foreground" />;
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.vessels?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || record.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: records.length,
    scheduled: records.filter(r => r.status === "scheduled").length,
    inProgress: records.filter(r => r.status === "in_progress").length,
    overdue: records.filter(r => r.status === "overdue").length,
    totalCost: records.reduce((sum, r) => sum + (Number(r.estimated_hours || 0) * 100), 0)
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></div><Wrench className="h-8 w-8 text-primary" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Agendadas</p><p className="text-2xl font-bold text-info">{stats.scheduled}</p></div><Calendar className="h-8 w-8 text-info" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Em Andamento</p><p className="text-2xl font-bold text-warning">{stats.inProgress}</p></div><Activity className="h-8 w-8 text-warning" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Atrasadas</p><p className="text-2xl font-bold text-destructive">{stats.overdue}</p></div><AlertTriangle className="h-8 w-8 text-destructive" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Custo Total</p><p className="text-2xl font-bold text-success">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(stats.totalCost)}</p></div><DollarSign className="h-8 w-8 text-success" /></div></CardContent></Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Wrench className="h-6 w-6 text-primary" />Gestão de Manutenção</h2>
          <p className="text-muted-foreground">Controle completo de manutenções preventivas e corretivas</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild><Button className="flex items-center gap-2"><Plus className="h-4 w-4" />Agendar Manutenção</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Agendar Nova Manutenção</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>Título *</Label><Input value={newMaintenance.title} onChange={e => setNewMaintenance({ ...newMaintenance, title: e.target.value })} placeholder="Ex: Inspeção do Motor Principal" /></div>
              <div><Label>Tipo</Label><Select value={newMaintenance.task_type} onValueChange={v => setNewMaintenance({ ...newMaintenance, task_type: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="preventive">Preventiva</SelectItem><SelectItem value="corrective">Corretiva</SelectItem><SelectItem value="emergency">Emergência</SelectItem><SelectItem value="inspection">Inspeção</SelectItem></SelectContent></Select></div>
              <div><Label>Prioridade</Label><Select value={newMaintenance.priority} onValueChange={v => setNewMaintenance({ ...newMaintenance, priority: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="critical">Crítica</SelectItem></SelectContent></Select></div>
              <div><Label>Data Agendada</Label><Input type="datetime-local" value={newMaintenance.scheduled_date} onChange={e => setNewMaintenance({ ...newMaintenance, scheduled_date: e.target.value })} /></div>
              <div><Label>Duração Estimada (h)</Label><Input type="number" value={newMaintenance.estimated_hours} onChange={e => setNewMaintenance({ ...newMaintenance, estimated_hours: e.target.value })} /></div>
              <div><Label>Custo Estimado (USD)</Label><Input type="number" step="0.01" value={newMaintenance.estimated_cost} onChange={e => setNewMaintenance({ ...newMaintenance, estimated_cost: e.target.value })} /></div>
              <div><Label>Técnico Responsável</Label><Input value={newMaintenance.assigned_to} onChange={e => setNewMaintenance({ ...newMaintenance, assigned_to: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>Descrição</Label><Textarea value={newMaintenance.description} onChange={e => setNewMaintenance({ ...newMaintenance, description: e.target.value })} rows={3} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
              <Button onClick={() => createMutation.mutate(newMaintenance)} disabled={!newMaintenance.title || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}Agendar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar manutenções..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos Status</SelectItem><SelectItem value="scheduled">Agendada</SelectItem><SelectItem value="in_progress">Em Andamento</SelectItem><SelectItem value="completed">Concluída</SelectItem><SelectItem value="overdue">Atrasada</SelectItem></SelectContent></Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Prioridade" /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="critical">Crítica</SelectItem></SelectContent></Select>
      </div>

      {/* Records List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filteredRecords.length === 0 ? (
        <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12"><Wrench className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Nenhuma manutenção encontrada</p><Button className="mt-4" onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Agendar Primeira</Button></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map(record => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getMaintenanceTypeIcon(record.task_type || 'preventive')}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{record.title}</h3>
                        <Badge className={getStatusColor(record.status || 'scheduled')}>{getStatusText(record.status || 'scheduled')}</Badge>
                        {record.priority && <Badge variant="outline" className="capitalize">{record.priority}</Badge>}
                      </div>
                      {record.vessels?.name && <p className="text-sm text-muted-foreground mt-1">🚢 {record.vessels.name}</p>}
                      {record.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{record.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {record.scheduled_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(record.scheduled_date).toLocaleDateString('pt-BR')}</span>}
                        {record.assigned_to && <span>👤 {record.assigned_to}</span>}
                        {record.estimated_hours && <span>⏱ {String(record.estimated_hours)}h</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {record.status !== 'completed' && (
                      <Select onValueChange={v => updateStatusMutation.mutate({ id: record.id, status: v })}>
                        <SelectTrigger className="h-8 w-8 p-0" aria-label="Alterar status"><Edit className="h-3 w-3" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Agendada</SelectItem>
                          <SelectItem value="in_progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                          <SelectItem value="overdue">Atrasada</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(record.id)} aria-label="Excluir"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceManagement;
