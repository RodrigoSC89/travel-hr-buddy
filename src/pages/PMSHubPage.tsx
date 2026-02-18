/**
 * PMS Hub — Planned Maintenance System (5-Level Hierarchy)
 * Sprint 3-4: System → Subsystem → Component → Job → Work Order
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PremiumModuleShell, type ModuleTab } from "@/components/ui/premium-module-kit/PremiumModuleShell";
import { SmartKPIGrid } from "@/components/ui/premium-module-kit/SmartKPIGrid";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Wrench, Settings2, Layers, ClipboardList, Timer,
  Plus, ChevronRight, AlertTriangle, CheckCircle2,
  Clock, Gauge, Search, Filter, Play, Pause,
  FileCheck, ArrowRight, Calendar, type LucideIcon
} from "lucide-react";
import { PMSCalendarView } from "@/components/maintenance/PMSCalendarView";

// ============================================
// TYPES
// ============================================
interface PMSSystem {
  id: string; vessel_id: string | null; code: string; name: string;
  description: string | null; system_type: string | null; manufacturer: string | null;
  is_critical: boolean; sort_order: number; organization_id: string | null;
  created_at: string; updated_at: string;
}

interface PMSSubsystem {
  id: string; system_id: string; code: string; name: string;
  description: string | null; sort_order: number;
}

interface PMSComponent {
  id: string; subsystem_id: string; code: string; name: string;
  description: string | null; part_number: string | null; manufacturer: string | null;
  running_hours_current: number; condition_rating: number | null;
  is_critical: boolean; impa_code: string | null;
}

interface PMSJob {
  id: string; component_id: string; job_code: string; title: string;
  description: string | null; job_type: string; priority: string;
  interval_hours: number | null; interval_days: number | null;
  next_due_date: string | null; next_due_hours: number | null;
  last_done_date: string | null; is_class_required: boolean;
  estimated_hours: number | null; estimated_cost: number | null;
  status: string;
}

interface PMSWorkOrder {
  id: string; work_order_number: string; job_id: string | null;
  vessel_id: string | null; component_id: string | null;
  title: string; description: string | null; priority: string;
  work_order_type: string; status: string;
  assigned_to: string | null; planned_start: string | null;
  planned_end: string | null; actual_start: string | null;
  actual_end: string | null; estimated_cost: number | null;
  actual_cost: number | null; work_done_report: string | null;
  triggered_by: string | null; created_at: string;
}

const WO_STATUSES = [
  { value: "draft", label: "Rascunho", color: "bg-muted text-muted-foreground" },
  { value: "planned", label: "Planejado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  { value: "approved", label: "Aprovado", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" },
  { value: "in_progress", label: "Em Execução", color: "bg-warning/20 text-warning" },
  { value: "pending_parts", label: "Aguardando Peças", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  { value: "completed", label: "Concluído", color: "bg-success/20 text-success" },
  { value: "verified", label: "Verificado", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" },
  { value: "closed", label: "Fechado", color: "bg-muted text-muted-foreground" },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-warning/20 text-warning",
  critical: "bg-destructive/20 text-destructive",
};

// ============================================
// DATA HOOKS
// ============================================
function usePMSSystems() {
  return useQuery({
    queryKey: ["pms_systems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pms_systems" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data || []) as unknown as PMSSystem[];
    },
  });
}

function usePMSSubsystems(systemId?: string) {
  return useQuery({
    queryKey: ["pms_subsystems", systemId],
    queryFn: async () => {
      let q = supabase.from("pms_subsystems" as any).select("*").order("sort_order");
      if (systemId) q = q.eq("system_id", systemId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as PMSSubsystem[];
    },
  });
}

function usePMSComponents(subsystemId?: string) {
  return useQuery({
    queryKey: ["pms_components", subsystemId],
    queryFn: async () => {
      let q = supabase.from("pms_components" as any).select("*").order("sort_order");
      if (subsystemId) q = q.eq("subsystem_id", subsystemId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as PMSComponent[];
    },
  });
}

function usePMSJobs(componentId?: string) {
  return useQuery({
    queryKey: ["pms_jobs", componentId],
    queryFn: async () => {
      let q = supabase.from("pms_jobs" as any).select("*").order("job_code");
      if (componentId) q = q.eq("component_id", componentId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as PMSJob[];
    },
  });
}

function usePMSWorkOrders(statusFilter?: string) {
  return useQuery({
    queryKey: ["pms_work_orders", statusFilter],
    queryFn: async () => {
      let q = supabase.from("pms_work_orders" as any).select("*").order("created_at", { ascending: false });
      if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as PMSWorkOrder[];
    },
  });
}

// ============================================
// SUB-COMPONENTS
// ============================================

/** Hierarchy Browser Tab */
function HierarchyBrowser() {
  const [selectedSystem, setSelectedSystem] = useState<string>();
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>();
  const [selectedComponent, setSelectedComponent] = useState<string>();
  const [showAddSystem, setShowAddSystem] = useState(false);
  const queryClient = useQueryClient();

  const { data: systems = [], isLoading: loadingSystems } = usePMSSystems();
  const { data: subsystems = [] } = usePMSSubsystems(selectedSystem);
  const { data: components = [] } = usePMSComponents(selectedSubsystem);
  const { data: jobs = [] } = usePMSJobs(selectedComponent);

  const addSystem = useMutation({
    mutationFn: async (system: { code: string; name: string; system_type: string; is_critical: boolean }) => {
      const { error } = await supabase.from("pms_systems" as any).insert(system as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pms_systems"] });
      toast.success("Sistema adicionado");
      setShowAddSystem(false);
    },
    onError: () => toast.error("Erro ao adicionar sistema"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Hierarquia de Equipamentos (5 Níveis)
        </h3>
        <Dialog open={showAddSystem} onOpenChange={setShowAddSystem}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Sistema</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Sistema</DialogTitle></DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              addSystem.mutate({
                code: fd.get("code") as string,
                name: fd.get("name") as string,
                system_type: fd.get("system_type") as string,
                is_critical: fd.get("is_critical") === "on",
              });
            }} className="space-y-3">
              <div><Label>Código</Label><Input name="code" required placeholder="ME-001" /></div>
              <div><Label>Nome</Label><Input name="name" required placeholder="Main Engine" /></div>
              <div>
                <Label>Tipo</Label>
                <Select name="system_type" defaultValue="propulsion">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["propulsion", "auxiliary", "deck", "navigation", "safety", "hull"].map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="is_critical" id="is_critical" />
                <Label htmlFor="is_critical">Equipamento Crítico</Label>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addSystem.isPending}>
                  {addSystem.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Level 1: Systems */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sistemas</CardTitle>
            <CardDescription className="text-xs">Nível 1</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[400px] overflow-y-auto">
            {loadingSystems ? <p className="text-xs text-muted-foreground">Carregando...</p> :
              systems.length === 0 ? <p className="text-xs text-muted-foreground">Nenhum sistema cadastrado</p> :
              systems.map(s => (
                <button key={s.id} onClick={() => { setSelectedSystem(s.id); setSelectedSubsystem(undefined); setSelectedComponent(undefined); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedSystem === s.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
                  <div className="flex items-center justify-between">
                    <span>{s.code} - {s.name}</span>
                    {s.is_critical && <AlertTriangle className="h-3 w-3 text-destructive" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{s.system_type}</span>
                </button>
              ))}
          </CardContent>
        </Card>

        {/* Level 2: Subsystems */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Subsistemas</CardTitle>
            <CardDescription className="text-xs">Nível 2</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[400px] overflow-y-auto">
            {!selectedSystem ? <p className="text-xs text-muted-foreground">Selecione um sistema</p> :
              subsystems.length === 0 ? <p className="text-xs text-muted-foreground">Nenhum subsistema</p> :
              subsystems.map(s => (
                <button key={s.id} onClick={() => { setSelectedSubsystem(s.id); setSelectedComponent(undefined); }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedSubsystem === s.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
                  {s.code} - {s.name}
                </button>
              ))}
          </CardContent>
        </Card>

        {/* Level 3: Components */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Componentes</CardTitle>
            <CardDescription className="text-xs">Nível 3</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[400px] overflow-y-auto">
            {!selectedSubsystem ? <p className="text-xs text-muted-foreground">Selecione um subsistema</p> :
              components.length === 0 ? <p className="text-xs text-muted-foreground">Nenhum componente</p> :
              components.map(c => (
                <button key={c.id} onClick={() => setSelectedComponent(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedComponent === c.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}>
                  <div className="flex items-center justify-between">
                    <span>{c.code} - {c.name}</span>
                    {c.is_critical && <AlertTriangle className="h-3 w-3 text-destructive" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">
                      <Gauge className="h-2.5 w-2.5 mr-1" />{c.running_hours_current}h
                    </Badge>
                    {c.condition_rating && (
                      <Badge variant="outline" className="text-[10px]">CAP: {c.condition_rating}/5</Badge>
                    )}
                  </div>
                </button>
              ))}
          </CardContent>
        </Card>

        {/* Level 4: Jobs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Jobs (PMS)</CardTitle>
            <CardDescription className="text-xs">Nível 4</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[400px] overflow-y-auto">
            {!selectedComponent ? <p className="text-xs text-muted-foreground">Selecione um componente</p> :
              jobs.length === 0 ? <p className="text-xs text-muted-foreground">Nenhum job</p> :
              jobs.map(j => (
                <div key={j.id} className="px-3 py-2 rounded-md border text-sm space-y-1">
                  <div className="font-medium">{j.job_code} - {j.title}</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <Badge className={PRIORITY_COLORS[j.priority] || ""} variant="secondary">{j.priority}</Badge>
                    <Badge variant="outline" className="text-[10px]">{j.job_type}</Badge>
                    {j.is_class_required && <Badge variant="destructive" className="text-[10px]">Class</Badge>}
                  </div>
                  {j.next_due_date && (
                    <p className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />Próximo: {new Date(j.next_due_date).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                  {j.interval_hours && (
                    <p className="text-xs text-muted-foreground">
                      <Timer className="h-3 w-3 inline mr-1" />Intervalo: {j.interval_hours}h
                    </p>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Work Orders Tab */
function WorkOrdersPanel() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();
  const { data: workOrders = [], isLoading } = usePMSWorkOrders(statusFilter);

  const filtered = useMemo(() => {
    if (!search) return workOrders;
    const q = search.toLowerCase();
    return workOrders.filter(wo =>
      wo.title.toLowerCase().includes(q) ||
      wo.work_order_number.toLowerCase().includes(q)
    );
  }, [workOrders, search]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "in_progress") updates.actual_start = new Date().toISOString();
      if (status === "completed") updates.actual_end = new Date().toISOString();
      const { error } = await supabase.from("pms_work_orders" as any).update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pms_work_orders"] });
      toast.success("Status atualizado");
    },
  });

  const createWO = useMutation({
    mutationFn: async (wo: { title: string; priority: string; work_order_type: string; description: string }) => {
      const woNumber = `WO-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("pms_work_orders" as any).insert({
        ...wo,
        work_order_number: woNumber,
        status: "draft",
        triggered_by: "manual",
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pms_work_orders"] });
      toast.success("Work Order criada");
      setShowCreate(false);
    },
    onError: () => toast.error("Erro ao criar Work Order"),
  });

  const getNextStatus = (current: string): string | null => {
    const flow = ["draft", "planned", "approved", "in_progress", "pending_parts", "completed", "verified", "closed"];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const statusInfo = (s: string) => WO_STATUSES.find(st => st.value === s) || WO_STATUSES[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar WO..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><Filter className="h-4 w-4 mr-1" /><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {WO_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Nova Work Order</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Work Order</DialogTitle></DialogHeader>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createWO.mutate({
                title: fd.get("title") as string,
                priority: fd.get("priority") as string,
                work_order_type: fd.get("work_order_type") as string,
                description: fd.get("description") as string,
              });
            }} className="space-y-3">
              <div><Label>Título</Label><Input name="title" required placeholder="Troca de óleo ME" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Prioridade</Label>
                  <Select name="priority" defaultValue="normal">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select name="work_order_type" defaultValue="planned">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planejada</SelectItem>
                      <SelectItem value="unplanned">Não Planejada</SelectItem>
                      <SelectItem value="emergency">Emergência</SelectItem>
                      <SelectItem value="class_survey">Vistoria Classe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Descrição</Label><Textarea name="description" placeholder="Detalhes do serviço..." /></div>
              <DialogFooter>
                <Button type="submit" disabled={createWO.isPending}>
                  {createWO.isPending ? "Criando..." : "Criar WO"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Work Order Lifecycle Visual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Fluxo de Trabalho (8 Estados)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {WO_STATUSES.map((s, i) => (
              <div key={s.value} className="flex items-center">
                <Badge className={`${s.color} text-[10px] whitespace-nowrap`}>{s.label}</Badge>
                {i < WO_STATUSES.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground mx-1 shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work Orders List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando work orders...</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma work order encontrada</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(wo => {
            const si = statusInfo(wo.status);
            const next = getNextStatus(wo.status);
            return (
              <Card key={wo.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{wo.work_order_number}</span>
                        <Badge className={si.color}>{si.label}</Badge>
                        <Badge className={PRIORITY_COLORS[wo.priority] || ""} variant="secondary">{wo.priority}</Badge>
                        <Badge variant="outline" className="text-[10px]">{wo.work_order_type}</Badge>
                      </div>
                      <h4 className="font-medium">{wo.title}</h4>
                      {wo.description && <p className="text-sm text-muted-foreground line-clamp-1">{wo.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {wo.assigned_to && <span>👤 {wo.assigned_to}</span>}
                        {wo.planned_start && <span>📅 {new Date(wo.planned_start).toLocaleDateString("pt-BR")}</span>}
                        {wo.triggered_by && <span>⚡ {wo.triggered_by}</span>}
                      </div>
                    </div>
                    {next && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: wo.id, status: next })}
                        disabled={updateStatus.isPending}>
                        <Play className="h-3 w-3 mr-1" />
                        → {WO_STATUSES.find(s => s.value === next)?.label}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Running Hours Tab */
function RunningHoursTab() {
  const { data: components = [], isLoading } = useQuery({
    queryKey: ["pms_components_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pms_components" as any)
        .select("*")
        .order("code");
      if (error) throw error;
      return (data || []) as unknown as PMSComponent[];
    },
  });

  const { data: triggers = [] } = useQuery({
    queryKey: ["pms_rh_triggers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pms_running_hours_triggers" as any)
        .select("*");
      if (error) throw error;
      return (data || []) as unknown as any[];
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          Running Hours & Triggers Automáticos
        </h3>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : components.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">
          Adicione componentes na aba Hierarquia para monitorar running hours
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {components.map(c => {
            const compTriggers = triggers.filter((t: any) => t.component_id === c.id);
            const hoursSinceMaint = c.running_hours_current - (c as any).running_hours_at_last_maintenance;
            return (
              <Card key={c.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{c.code} - {c.name}</h4>
                    {c.is_critical && <AlertTriangle className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Horas Totais</p>
                      <p className="text-lg font-bold">{c.running_hours_current?.toLocaleString()}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">Desde Última Mnt</p>
                      <p className="text-lg font-bold">{hoursSinceMaint?.toLocaleString()}</p>
                    </div>
                  </div>
                  {c.condition_rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">CAP Rating:</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(r => (
                          <div key={r} className={`w-4 h-2 rounded-sm ${r <= c.condition_rating! ? "bg-primary" : "bg-muted"}`} />
                        ))}
                      </div>
                    </div>
                  )}
                  {compTriggers.length > 0 && (
                    <div className="border-t pt-2">
                      <p className="text-xs font-medium">Triggers ativos:</p>
                      {compTriggers.map((t: any) => (
                        <Badge key={t.id} variant="outline" className="text-[10px] mr-1">
                          ⚡ {t.threshold_hours}h {t.auto_create_work_order ? "→ Auto WO" : ""}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function PMSHubPage() {
  const { data: workOrders = [] } = usePMSWorkOrders();
  const { data: systems = [] } = usePMSSystems();
  const { data: jobs = [] } = usePMSJobs();

  const stats = useMemo(() => {
    const overdue = jobs.filter(j => j.next_due_date && new Date(j.next_due_date) < new Date()).length;
    const activeWO = workOrders.filter(wo => ["in_progress", "approved", "planned"].includes(wo.status)).length;
    const completedWO = workOrders.filter(wo => ["completed", "verified", "closed"].includes(wo.status)).length;
    const criticalJobs = jobs.filter(j => j.priority === "critical").length;
    return { overdue, activeWO, completedWO, criticalJobs, totalSystems: systems.length, totalJobs: jobs.length };
  }, [workOrders, systems, jobs]);

  const kpis = [
    { id: "systems", title: "Sistemas", value: stats.totalSystems, icon: Settings2, color: "primary" as const },
    { id: "jobs", title: "Jobs PMS", value: stats.totalJobs, icon: ClipboardList, color: "info" as const },
    { id: "active-wo", title: "WO Ativas", value: stats.activeWO, icon: Play, color: "warning" as const },
    { id: "completed-wo", title: "WO Concluídas", value: stats.completedWO, icon: CheckCircle2, color: "success" as const },
    { id: "overdue", title: "Jobs Vencidos", value: stats.overdue, icon: AlertTriangle, color: "destructive" as const },
    { id: "critical", title: "Jobs Críticos", value: stats.criticalJobs, icon: AlertTriangle, color: "destructive" as const },
  ];

  const tabs: ModuleTab[] = [
    {
      id: "hierarchy",
      label: "Hierarquia",
      icon: Layers,
      content: <HierarchyBrowser />,
      badge: stats.totalSystems,
    },
    {
      id: "work-orders",
      label: "Work Orders",
      icon: ClipboardList,
      content: <WorkOrdersPanel />,
      badge: stats.activeWO,
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Timer,
      content: <PMSCalendarView />,
    },
    {
      id: "running-hours",
      label: "Running Hours",
      icon: Timer,
      content: <RunningHoursTab />,
    },
  ];

  return (
    <PremiumModuleShell
      title="PMS — Planned Maintenance System"
      subtitle="Hierarquia 5 níveis • Work Orders 8 estados • Running Hours triggers"
      icon={Wrench}
      iconGradient="from-orange-500 to-amber-500"
      tabs={tabs}
      defaultTab="hierarchy"
      showAIBadge
      aiStatus="active"
      alerts={stats.overdue}
    >
      <div className="mt-6">
        <SmartKPIGrid kpis={kpis} columns={6} />
      </div>
    </PremiumModuleShell>
  );
}
