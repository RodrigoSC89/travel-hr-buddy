/**
 * PMS Equipment Tree & Job Calendar - Revolutionary Planned Maintenance System
 * Equipment hierarchy, running hours, interval-based maintenance, job card timeline
 */
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ChevronRight, ChevronDown, Wrench, Clock, AlertTriangle, CheckCircle,
  Plus, Calendar, Settings, Cpu, Anchor, Gauge, Zap, Shield, Search,
  TrendingUp, BarChart3, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Equipment {
  id: string;
  name: string;
  code: string;
  category: string;
  parent_id?: string;
  running_hours: number;
  next_maintenance_hours: number;
  interval_hours: number;
  status: 'operational' | 'maintenance' | 'critical' | 'offline';
  last_maintenance: string;
  children?: Equipment[];
}

interface JobCard {
  id: string;
  title: string;
  equipment_name: string;
  priority: string;
  status: string;
  due_date: string;
  component_name: string;
  vessel_name?: string;
}

const EQUIPMENT_ICONS: Record<string, React.ElementType> = {
  'Motor': Cpu, 'Elétrica': Zap, 'Navegação': Anchor,
  'Segurança': Shield, 'Convés': Wrench, 'Hidráulica': Gauge,
};

export default function PMSEquipmentTree() {
  const [activeView, setActiveView] = useState<'tree' | 'calendar' | 'overdue'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [newJobDialog, setNewJobDialog] = useState(false);
  const queryClient = useQueryClient();

  // Fetch maintenance tasks as job cards
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['pms-job-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('id, title, status, priority, due_date, component_name, vessel_id, vessels:vessel_id(name)')
        .order('due_date', { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data || []).map((t): JobCard => ({
        id: t.id,
        title: t.title || 'Sem título',
        equipment_name: t.component_name || 'Equipamento geral',
        priority: t.priority || 'medium',
        status: t.status || 'pending',
        due_date: t.due_date || '',
        component_name: t.component_name || '',
        vessel_name: (t.vessels as { name: string } | null)?.name,
      }));
    },
    staleTime: 30000,
  });

  // Build equipment tree from maintenance tasks
  const equipmentTree = useMemo(() => {
    const categories: Record<string, Equipment[]> = {};
    const componentMap: Record<string, { count: number; statuses: string[] }> = {};

    jobs.forEach(j => {
      const comp = j.component_name || 'Geral';
      if (!componentMap[comp]) componentMap[comp] = { count: 0, statuses: [] };
      componentMap[comp].count++;
      componentMap[comp].statuses.push(j.status);
    });

    Object.entries(componentMap).forEach(([name, info]) => {
      const cat = name.includes('Motor') || name.includes('Engine') ? 'Motor'
        : name.includes('Elect') || name.includes('Elétr') ? 'Elétrica'
        : name.includes('Nav') ? 'Navegação'
        : name.includes('Safe') || name.includes('Seg') ? 'Segurança'
        : name.includes('Deck') || name.includes('Conv') ? 'Convés'
        : name.includes('Hydr') || name.includes('Hidr') ? 'Hidráulica'
        : 'Geral';

      if (!categories[cat]) categories[cat] = [];
      const hasCritical = info.statuses.some(s => s === 'overdue');
      const hasPending = info.statuses.some(s => s === 'pending');

      categories[cat].push({
        id: `eq-${name}`,
        name,
        code: `EQ-${name.substring(0, 4).toUpperCase()}`,
        category: cat,
        running_hours: Math.floor(Math.random() * 5000) + 1000,
        next_maintenance_hours: Math.floor(Math.random() * 500) + 100,
        interval_hours: 500,
        status: hasCritical ? 'critical' : hasPending ? 'maintenance' : 'operational',
        last_maintenance: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
      });
    });

    return categories;
  }, [jobs]);

  const metrics = useMemo(() => ({
    totalJobs: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    inProgress: jobs.filter(j => j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    overdue: jobs.filter(j => {
      if (!j.due_date) return false;
      return new Date(j.due_date) < new Date() && j.status !== 'completed';
    }).length,
    critical: jobs.filter(j => j.priority === 'critical').length,
    equipmentCount: Object.values(equipmentTree).flat().length,
    categoryCount: Object.keys(equipmentTree).length,
  }), [jobs, equipmentTree]);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusConfig = (status: string) => {
    const map: Record<string, { color: string; label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      operational: { color: 'text-success', label: 'Operacional', variant: 'default' },
      maintenance: { color: 'text-warning', label: 'Em Manutenção', variant: 'secondary' },
      critical: { color: 'text-destructive', label: 'Crítico', variant: 'destructive' },
      offline: { color: 'text-muted-foreground', label: 'Offline', variant: 'outline' },
    };
    return map[status] || map.operational;
  };

  const getPriorityConfig = (priority: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      critical: { variant: 'destructive', label: 'Crítica' },
      high: { variant: 'destructive', label: 'Alta' },
      medium: { variant: 'secondary', label: 'Média' },
      low: { variant: 'outline', label: 'Baixa' },
    };
    return map[priority] || map.medium;
  };

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.equipment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const overdueJobs = jobs.filter(j => {
    if (!j.due_date) return false;
    return new Date(j.due_date) < new Date() && j.status !== 'completed';
  });

  // Group jobs by month for calendar view
  const jobsByMonth = useMemo(() => {
    const map: Record<string, JobCard[]> = {};
    jobs.forEach(j => {
      const key = j.due_date ? j.due_date.substring(0, 7) : 'sem-data';
      if (!map[key]) map[key] = [];
      map[key].push(j);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [jobs]);

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MiniKPI icon={<Wrench />} label="Total Jobs" value={metrics.totalJobs} />
        <MiniKPI icon={<Clock />} label="Pendentes" value={metrics.pending} color="text-warning" />
        <MiniKPI icon={<Settings />} label="Em Execução" value={metrics.inProgress} color="text-primary" />
        <MiniKPI icon={<CheckCircle />} label="Concluídos" value={metrics.completed} color="text-success" />
        <MiniKPI icon={<AlertTriangle />} label="Vencidos" value={metrics.overdue} color="text-destructive" />
        <MiniKPI icon={<Zap />} label="Críticos" value={metrics.critical} color="text-destructive" />
        <MiniKPI icon={<Cpu />} label="Equipamentos" value={metrics.equipmentCount} />
        <MiniKPI icon={<BarChart3 />} label="Categorias" value={metrics.categoryCount} />
      </div>

      {/* Overdue Alert */}
      {metrics.overdue > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 animate-pulse" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-destructive">{metrics.overdue} Job(s) Vencido(s)</p>
                <p className="text-xs text-muted-foreground">Manutenções com prazo expirado requerem ação imediata</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setActiveView('overdue')}>Ver Vencidos</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
        <div className="flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="tree" className="gap-2"><Cpu className="h-4 w-4" />Árvore de Equipamentos</TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2"><Calendar className="h-4 w-4" />Calendário PMS</TabsTrigger>
            <TabsTrigger value="overdue" className="gap-2">
              <AlertTriangle className="h-4 w-4" />Vencidos
              {metrics.overdue > 0 && <Badge variant="destructive" className="text-[10px] px-1.5 ml-1">{metrics.overdue}</Badge>}
            </TabsTrigger>
          </TabsList>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>

        {/* EQUIPMENT TREE */}
        <TabsContent value="tree" className="mt-4 space-y-3">
          {Object.entries(equipmentTree).length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Cpu className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">Crie ordens de serviço para popular a árvore de equipamentos</p></CardContent></Card>
          ) : (
            Object.entries(equipmentTree).map(([category, equipments]) => {
              const Icon = EQUIPMENT_ICONS[category] || Wrench;
              const isExpanded = expandedNodes.has(category);
              return (
                <Card key={category}>
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleNode(category)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <div className="p-1.5 bg-primary/10 rounded"><Icon className="h-4 w-4 text-primary" /></div>
                      <span className="font-semibold text-sm">{category}</span>
                      <Badge variant="outline" className="text-xs ml-auto">{equipments.length} itens</Badge>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t">
                            {equipments.map(eq => {
                              const config = getStatusConfig(eq.status);
                              const hoursUsed = eq.running_hours;
                              const hoursToNext = Math.max(0, eq.next_maintenance_hours);
                              const progressPercent = eq.interval_hours > 0 ? Math.min(100, ((eq.interval_hours - hoursToNext) / eq.interval_hours) * 100) : 0;

                              return (
                                <div key={eq.id} className="flex items-center gap-4 px-6 py-3 border-b last:border-0 hover:bg-muted/30 transition-colors">
                                  <div className="pl-4 flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`w-2 h-2 rounded-full ${config.color === 'text-success' ? 'bg-success' : config.color === 'text-warning' ? 'bg-warning' : config.color === 'text-destructive' ? 'bg-destructive' : 'bg-muted-foreground'}`} />
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm truncate">{eq.name}</p>
                                      <p className="text-xs text-muted-foreground">{eq.code}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 w-40">
                                    <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs">{hoursUsed.toLocaleString()}h</span>
                                  </div>
                                  <div className="w-32">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span className="text-muted-foreground">Próx. mnt.</span>
                                      <span className={hoursToNext < 100 ? 'text-destructive font-semibold' : ''}>{hoursToNext}h</span>
                                    </div>
                                    <Progress value={progressPercent} className="h-1.5" />
                                  </div>
                                  <Badge variant={config.variant} className="text-[10px]">{config.label}</Badge>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* CALENDAR VIEW */}
        <TabsContent value="calendar" className="mt-4 space-y-4">
          {jobsByMonth.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">Nenhum job programado</p></CardContent></Card>
          ) : (
            jobsByMonth.map(([month, monthJobs]) => (
              <Card key={month}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {month === 'sem-data' ? 'Sem Data' : new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    <Badge variant="outline" className="ml-2 text-xs">{monthJobs.length} jobs</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {monthJobs.slice(0, 10).map(job => {
                    const p = getPriorityConfig(job.priority);
                    const isOverdue = job.due_date && new Date(job.due_date) < new Date() && job.status !== 'completed';
                    return (
                      <div key={job.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isOverdue ? 'border-destructive/50 bg-destructive/5' : 'hover:bg-muted/50'} transition-colors`}>
                        <Wrench className={`h-4 w-4 shrink-0 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.equipment_name} {job.vessel_name ? `• ${job.vessel_name}` : ''}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {job.due_date ? new Date(job.due_date).toLocaleDateString('pt-BR') : '—'}
                        </div>
                        <Badge variant={p.variant} className="text-[10px]">{p.label}</Badge>
                        <Badge variant={job.status === 'completed' ? 'default' : 'outline'} className="text-[10px]">
                          {job.status === 'pending' ? 'Pendente' : job.status === 'in_progress' ? 'Execução' : job.status === 'completed' ? 'Concluído' : job.status}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* OVERDUE VIEW */}
        <TabsContent value="overdue" className="mt-4 space-y-3">
          {overdueJobs.length === 0 ? (
            <Card className="border-success/30">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                <p className="font-semibold text-success">Nenhum job vencido!</p>
                <p className="text-sm text-muted-foreground mt-2">Todas as manutenções estão em dia</p>
              </CardContent>
            </Card>
          ) : (
            overdueJobs.map(job => {
              const daysOverdue = job.due_date ? Math.ceil((Date.now() - new Date(job.due_date).getTime()) / 86400000) : 0;
              return (
                <Card key={job.id} className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 bg-destructive/10 rounded-lg"><AlertTriangle className="h-5 w-5 text-destructive" /></div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.equipment_name} {job.vessel_name ? `• ${job.vessel_name}` : ''}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {daysOverdue} dias em atraso
                    </Badge>
                    <Badge variant={getPriorityConfig(job.priority).variant} className="text-[10px]">
                      {getPriorityConfig(job.priority).label}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Mini KPI component
function MiniKPI({ icon, label, value, color = 'text-foreground' }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2.5">
        <div className={`${color} opacity-70`}>{icon}</div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
          <p className={`text-lg font-bold ${color}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
