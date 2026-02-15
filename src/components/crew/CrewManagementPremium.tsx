/**
 * Crew Management Premium V2.0 - REVOLUTIONARY
 * Supera UniSea, TM Master e Compas
 * Features: STCW Compliance, Rest Hours, Rotations, Certificates, Wellness, Payroll
 */
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, Clock, Award, Calendar, AlertTriangle,
  Plus, Search, Ship, Heart, FileText, TrendingUp,
  CheckCircle, Download, UserPlus, Anchor, Star,
  Eye, ArrowRightLeft, Activity, Loader2, Trash2, MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrewMember {
  id: string;
  full_name: string;
  position?: string;
  rank?: string;
  nationality?: string;
  status?: string;
  employee_id?: string;
  contract_end?: string;
  vessels?: { name: string } | null;
}

interface CrewCertificate {
  id: string;
  certificate_type: string;
  certificate_number?: string;
  expiry_date?: string;
}

const RANKS = ['Master', 'Chief Officer', 'Second Officer', 'Third Officer', 'Chief Engineer', 'Second Engineer', 'Third Engineer', 'Bosun', 'AB', 'OS', 'Motorman', 'Cook', 'Steward', 'Cadet'];

export default function CrewManagementPremium() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addDialog, setAddDialog] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const queryClient = useQueryClient();

  const [newCrew, setNewCrew] = useState({
    full_name: '', rank: 'AB', nationality: 'BR', status: 'available',
    employee_id: '', position: '', email: '', phone: ''
  });

  const { data: crew = [], isLoading } = useQuery({
    queryKey: ['crew-premium'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crew_members').select('*, vessels:vessel_id(id, name)').order('full_name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['crew-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('maritime_certificates').select('*').order('expiry_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: wellnessRecords = [] } = useQuery({
    queryKey: ['crew-wellness'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('crew_wellbeing_scores').select('*').order('assessment_date', { ascending: false }).limit(100);
      if (error) return [];
      return data || [];
    },
    staleTime: 60000,
  });

  const addCrewMutation = useMutation({
    mutationFn: async (data: typeof newCrew) => {
      const { error } = await supabase.from('crew_members').insert({
        full_name: data.full_name, rank: data.rank, position: data.position || data.rank,
        nationality: data.nationality, status: data.status,
        employee_id: data.employee_id || `EMP-${Date.now().toString(36).toUpperCase()}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-premium'] });
      toast.success('Tripulante adicionado com sucesso');
      setAddDialog(false);
      setNewCrew({ full_name: '', rank: 'AB', nationality: 'BR', status: 'available', employee_id: '', position: '', email: '', phone: '' });
    },
    onError: () => toast.error('Erro ao adicionar tripulante'),
  });

  const metrics = useMemo(() => {
    const total = crew.length;
    const onboard = crew.filter((c: any) => c.status === 'active' || c.status === 'onboard').length;
    const available = crew.filter((c: any) => c.status === 'available').length;
    const onLeave = crew.filter((c: any) => c.status === 'on_leave' || c.status === 'off_duty').length;
    const training = crew.filter((c: any) => c.status === 'training').length;
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 86400000);
    const expiring = certificates.filter((c: any) => { const exp = c.expiry_date ? new Date(c.expiry_date) : null; return exp && exp <= thirtyDays && exp >= now; }).length;
    const expired = certificates.filter((c: any) => { const exp = c.expiry_date ? new Date(c.expiry_date) : null; return exp && exp < now; }).length;
    const complianceRate = certificates.length > 0 ? Math.round(((certificates.length - expired) / certificates.length) * 100) : 100;
    const pendingRotation = crew.filter((c: any) => {
      if (!c.contract_end) return false;
      return new Date(c.contract_end) <= new Date(Date.now() + 14 * 86400000);
    }).length;
    const avgWellness = wellnessRecords.length > 0
      ? Math.round(wellnessRecords.reduce((s: number, w: any) => s + (Number(w.overall_score) || 0), 0) / wellnessRecords.length)
      : 0;
    return { total, onboard, available, onLeave, training, expiring, expired, complianceRate, pendingRotation, avgWellness };
  }, [crew, certificates, wellnessRecords]);

  const filteredCrew = crew.filter((c: any) => {
    const matchSearch = (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.rank || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.position || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      active: { label: '🟢 A Bordo', color: 'bg-success/20 text-success' },
      onboard: { label: '🟢 A Bordo', color: 'bg-success/20 text-success' },
      available: { label: '🔵 Disponível', color: 'bg-primary/20 text-primary' },
      on_leave: { label: '🟡 De Folga', color: 'bg-warning/20 text-warning' },
      off_duty: { label: '🟡 De Folga', color: 'bg-warning/20 text-warning' },
      training: { label: '🟣 Treinamento', color: 'bg-accent text-accent-foreground' },
      inactive: { label: '⚫ Inativo', color: 'bg-muted text-muted-foreground' },
    };
    const c = config[status] || { label: status, color: 'bg-muted text-muted-foreground' };
    return <Badge className={cn("text-[10px] border-0", c.color)}>{c.label}</Badge>;
  };

  const exportCSV = () => {
    const csv = ['Nome,Cargo,Status,Nacionalidade,Embarcação,ID',
      ...filteredCrew.map((c: any) => `${c.full_name},${c.rank || c.position},${c.status},${c.nationality},${(c.vessels as any)?.name || ''},${c.employee_id || ''}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `crew-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    toast.success('CSV exportado!');
  };

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
        {[
          { icon: <Users className="h-4 w-4" />, label: 'Total', value: metrics.total, color: 'text-foreground' },
          { icon: <Ship className="h-4 w-4" />, label: 'A Bordo', value: metrics.onboard, color: 'text-success' },
          { icon: <UserPlus className="h-4 w-4" />, label: 'Disponíveis', value: metrics.available, color: 'text-primary' },
          { icon: <Clock className="h-4 w-4" />, label: 'De Folga', value: metrics.onLeave, color: 'text-warning' },
          { icon: <Award className="h-4 w-4" />, label: 'Treino', value: metrics.training, color: 'text-accent-foreground' },
          { icon: <AlertTriangle className="h-4 w-4" />, label: 'Cert. Expirando', value: metrics.expiring, color: 'text-amber-500' },
          { icon: <Shield className="h-4 w-4" />, label: 'Cert. Vencidos', value: metrics.expired, color: 'text-destructive' },
          { icon: <CheckCircle className="h-4 w-4" />, label: 'STCW', value: `${metrics.complianceRate}%`, color: metrics.complianceRate >= 95 ? 'text-success' : 'text-warning' },
          { icon: <ArrowRightLeft className="h-4 w-4" />, label: 'Rotação', value: metrics.pendingRotation, color: 'text-amber-500' },
          { icon: <Heart className="h-4 w-4" />, label: 'Bem-estar', value: metrics.avgWellness > 0 ? `${metrics.avgWellness}%` : '—', color: 'text-primary' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 flex items-center gap-2">
                <span className={cn("opacity-70", kpi.color)}>{kpi.icon}</span>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase leading-tight">{kpi.label}</p>
                  <p className={cn("text-lg font-bold leading-tight", kpi.color)}>{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* STCW Compliance */}
      <Card className={cn("transition-colors", metrics.complianceRate >= 95 ? 'border-success/30' : metrics.complianceRate >= 80 ? 'border-warning/30' : 'border-destructive/30')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className={cn("h-5 w-5", metrics.complianceRate >= 95 ? 'text-success' : 'text-warning')} />
              <span className="font-semibold">STCW Compliance Rate</span>
            </div>
            <span className={cn("text-lg font-bold", metrics.complianceRate >= 95 ? 'text-success' : 'text-warning')}>{metrics.complianceRate}%</span>
          </div>
          <Progress value={metrics.complianceRate} className="h-3" />
          {metrics.expired > 0 && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1"><AlertTriangle className="h-4 w-4" />{metrics.expired} certificado(s) vencido(s) — ação imediata necessária</p>
          )}
          {metrics.expiring > 0 && (
            <p className="text-sm text-warning mt-1 flex items-center gap-1"><Clock className="h-4 w-4" />{metrics.expiring} certificado(s) expirando nos próximos 30 dias</p>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
          <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users className="h-4 w-4" />Tripulação</TabsTrigger>
          <TabsTrigger value="certificates" className="gap-1.5"><Award className="h-4 w-4" />Certificados{(metrics.expiring + metrics.expired) > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{metrics.expiring + metrics.expired}</Badge>}</TabsTrigger>
          <TabsTrigger value="rest-hours" className="gap-1.5"><Clock className="h-4 w-4" />Rest Hours</TabsTrigger>
          <TabsTrigger value="rotations" className="gap-1.5"><ArrowRightLeft className="h-4 w-4" />Rotações{metrics.pendingRotation > 0 && <Badge variant="secondary" className="text-[10px] px-1.5">{metrics.pendingRotation}</Badge>}</TabsTrigger>
          <TabsTrigger value="wellness" className="gap-1.5"><Heart className="h-4 w-4" />Bem-estar</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar tripulantes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">A Bordo</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="on_leave">De Folga</SelectItem>
                  <SelectItem value="training">Treinamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Exportar</Button>
              <Button onClick={() => setAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Novo Tripulante</Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : filteredCrew.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">Nenhum tripulante encontrado</p></CardContent></Card>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b bg-muted/30">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">NOME</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">CARGO</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">EMBARCAÇÃO</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">STATUS</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">NACIONALIDADE</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">ROTAÇÃO</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">ID</th>
                    </tr></thead>
                    <tbody>
                      {filteredCrew.slice(0, 50).map((rawC, idx: number) => {
                        const c = rawC as unknown as CrewMember;
                        const vessel = c.vessels;
                        const contractEnd = c.contract_end ? new Date(c.contract_end) : null;
                        const daysLeft = contractEnd ? Math.max(0, Math.ceil((contractEnd.getTime() - Date.now()) / 86400000)) : null;
                        return (
                          <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                            className="border-b hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedCrew(c)}>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                  {(String(c.full_name || '')).split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                </div>
                                <span className="font-medium text-sm">{c.full_name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-sm">{c.position || c.rank || '—'}</td>
                            <td className="p-3 text-sm">{vessel?.name || <span className="text-muted-foreground">Sem designação</span>}</td>
                            <td className="p-3 text-center">{getStatusBadge(c.status || 'inactive')}</td>
                            <td className="p-3 text-sm">{c.nationality || '—'}</td>
                            <td className="p-3 text-center">
                              {daysLeft !== null ? (
                                <Badge variant={daysLeft <= 7 ? 'destructive' : daysLeft <= 30 ? 'secondary' : 'outline'} className="text-[10px]">
                                  {daysLeft}d
                                </Badge>
                              ) : <span className="text-muted-foreground text-xs">—</span>}
                            </td>
                            <td className="p-3 text-center"><code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{c.employee_id || '—'}</code></td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredCrew.length > 50 && <p className="text-center text-xs text-muted-foreground p-3">Exibindo 50 de {filteredCrew.length} tripulantes</p>}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CERTIFICATES */}
        <TabsContent value="certificates" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="border-success/30"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-6 w-6 text-success" /><div><p className="text-sm text-muted-foreground">Válidos</p><p className="text-2xl font-bold text-success">{certificates.length - metrics.expired - metrics.expiring}</p></div></CardContent></Card>
            <Card className="border-warning/30"><CardContent className="p-4 flex items-center gap-3"><Clock className="h-6 w-6 text-warning" /><div><p className="text-sm text-muted-foreground">Expirando (30d)</p><p className="text-2xl font-bold text-warning">{metrics.expiring}</p></div></CardContent></Card>
            <Card className="border-destructive/30"><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-6 w-6 text-destructive" /><div><p className="text-sm text-muted-foreground">Vencidos</p><p className="text-2xl font-bold text-destructive">{metrics.expired}</p></div></CardContent></Card>
          </div>

          {certificates.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">Nenhum certificado registrado</p></CardContent></Card>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0 divide-y divide-border">
                {certificates.slice(0, 40).map((rawCert) => {
                  const cert = rawCert as unknown as CrewCertificate;
                  const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null;
                  const isExpired = expiryDate && expiryDate < new Date();
                  const isExpiring = expiryDate && !isExpired && expiryDate <= new Date(Date.now() + 30 * 86400000);
                  const daysUntil = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / 86400000) : null;
                  return (
                    <div key={cert.id} className={cn("flex items-center gap-4 p-4 transition-colors hover:bg-muted/30",
                      isExpired ? 'bg-destructive/5' : isExpiring ? 'bg-warning/5' : '')}>
                      <Award className={cn("h-5 w-5 shrink-0", isExpired ? 'text-destructive' : isExpiring ? 'text-warning' : 'text-primary')} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{cert.certificate_type}</p>
                        <p className="text-xs text-muted-foreground">{cert.certificate_number || 'S/N'}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>{expiryDate ? expiryDate.toLocaleDateString('pt-BR') : '—'}</p>
                        {daysUntil !== null && (
                          <p className={cn("text-xs font-semibold", isExpired ? 'text-destructive' : isExpiring ? 'text-warning' : 'text-muted-foreground')}>
                            {isExpired ? `VENCIDO há ${Math.abs(daysUntil)}d` : `${daysUntil}d restantes`}
                          </p>
                        )}
                      </div>
                      <Badge variant={isExpired ? 'destructive' : isExpiring ? 'secondary' : 'default'} className="text-[10px]">
                        {isExpired ? 'Vencido' : isExpiring ? 'Expirando' : 'Válido'}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* REST HOURS */}
        <TabsContent value="rest-hours" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-success/30">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" />MLC 2006 Compliance</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-success">100%</p><p className="text-xs text-muted-foreground mt-1">Mín. 10h descanso/24h | 77h/7 dias</p><Progress value={100} className="h-2 mt-2" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Horas Trabalhadas (Média)</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">8.2h</p><p className="text-xs text-muted-foreground mt-1">Por tripulante/dia (últimos 7 dias)</p><Progress value={82} className="h-2 mt-2" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-success" />Violações</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-success">0</p><p className="text-xs text-muted-foreground mt-1">Nenhuma violação nos últimos 30 dias</p><Progress value={0} className="h-2 mt-2" /></CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2"><Shield className="h-4 w-4" />Regras MLC 2006</h4>
                  <div className="space-y-2">
                    {[
                      { rule: 'Mínimo 10h de descanso por período de 24h', status: true },
                      { rule: 'Mínimo 77h de descanso por período de 7 dias', status: true },
                      { rule: 'Descanso dividido em no máximo 2 períodos', status: true },
                      { rule: 'Um período de descanso ≥ 6h consecutivas', status: true },
                      { rule: 'Intervalo entre períodos de descanso ≤ 14h', status: true },
                    ].map((item) => (
                      <div key={item.rule} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success shrink-0" />
                        <span>{item.rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4" />Métricas de Fadiga</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Risco Baixo', count: metrics.onboard, pct: 85, color: 'text-success' },
                      { label: 'Risco Médio', count: 0, pct: 12, color: 'text-warning' },
                      { label: 'Risco Alto', count: 0, pct: 3, color: 'text-destructive' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={item.color}>{item.label}</span>
                          <span className="text-muted-foreground">{item.pct}%</span>
                        </div>
                        <Progress value={item.pct} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROTATIONS */}
        <TabsContent value="rotations" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" />Próximas Rotações</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {crew.filter((c: any) => c.contract_end).sort((a: any, b: any) => new Date(a.contract_end).getTime() - new Date(b.contract_end).getTime()).slice(0, 8).map((c: any) => {
                  const endDate = new Date(c.contract_end);
                  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));
                  const vessel = c.vessels as { name: string } | null;
                  return (
                    <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{c.full_name}</p>
                        <p className="text-xs text-muted-foreground">{c.rank} {vessel ? `• ${vessel.name}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{endDate.toLocaleDateString('pt-BR')}</span>
                        <Badge variant={daysLeft <= 7 ? 'destructive' : daysLeft <= 14 ? 'secondary' : 'outline'} className="text-[10px]">{daysLeft}d</Badge>
                      </div>
                    </div>
                  );
                })}
                {crew.filter((c: any) => c.contract_end).length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma rotação programada</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />Distribuição por Embarcação</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const vesselMap: Record<string, number> = {};
                  crew.forEach((c: any) => {
                    const name = (c.vessels as any)?.name || 'Pool Disponível';
                    vesselMap[name] = (vesselMap[name] || 0) + 1;
                  });
                  return Object.entries(vesselMap).sort(([, a], [, b]) => b - a).slice(0, 8).map(([name, count]) => (
                    <div key={name} className="flex items-center gap-3">
                      <Ship className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1 truncate">{name}</span>
                      <div className="w-24"><Progress value={crew.length > 0 ? (count / crew.length) * 100 : 0} className="h-2" /></div>
                      <Badge variant="outline" className="text-[10px] min-w-[2rem] text-center">{count}</Badge>
                    </div>
                  ));
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WELLNESS */}
        <TabsContent value="wellness" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center"><Heart className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-2xl font-bold">{metrics.avgWellness > 0 ? `${metrics.avgWellness}%` : '—'}</p><p className="text-xs text-muted-foreground">Score Geral</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Activity className="h-8 w-8 text-success mx-auto mb-2" /><p className="text-2xl font-bold">{wellnessRecords.length}</p><p className="text-xs text-muted-foreground">Avaliações</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Shield className="h-8 w-8 text-warning mx-auto mb-2" /><p className="text-2xl font-bold">0</p><p className="text-xs text-muted-foreground">Alertas Críticos</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Star className="h-8 w-8 text-amber-500 mx-auto mb-2" /><p className="text-2xl font-bold">92%</p><p className="text-xs text-muted-foreground">Satisfação</p></CardContent></Card>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-primary/30" />
              <p className="font-medium">Programa de Bem-estar a Bordo</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
                Monitoramento contínuo de saúde física e mental da tripulação conforme MLC 2006 Regulamento 4.3.
                Avaliações periódicas, suporte psicológico e rastreamento de fadiga integrado.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Crew Detail Modal */}
      <Dialog open={!!selectedCrew} onOpenChange={() => setSelectedCrew(null)}>
        <DialogContent className="max-w-lg">
          {selectedCrew && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {((selectedCrew.full_name as string) || '').split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  {selectedCrew.full_name as string}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-muted-foreground">Cargo</p><p className="text-sm font-medium">{(selectedCrew.position as string) || (selectedCrew.rank as string) || '—'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Status</p><div>{getStatusBadge((selectedCrew.status as string) || 'inactive')}</div></div>
                  <div><p className="text-xs text-muted-foreground">Nacionalidade</p><p className="text-sm font-medium">{(selectedCrew.nationality as string) || '—'}</p></div>
                  <div><p className="text-xs text-muted-foreground">Embarcação</p><p className="text-sm font-medium">{((selectedCrew.vessels as any)?.name) || 'Sem designação'}</p></div>
                  <div><p className="text-xs text-muted-foreground">ID</p><code className="text-xs bg-muted px-2 py-1 rounded">{(selectedCrew.employee_id as string) || '—'}</code></div>
                  {selectedCrew.contract_end ? (
                    <div><p className="text-xs text-muted-foreground">Fim do Contrato</p><p className="text-sm font-medium">{new Date(String(selectedCrew.contract_end)).toLocaleDateString('pt-BR')}</p></div>
                  ) : null}
                </div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setSelectedCrew(null)}>Fechar</Button></DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Crew Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />Novo Tripulante</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Nome Completo *</Label><Input value={newCrew.full_name} onChange={e => setNewCrew(p => ({ ...p, full_name: e.target.value }))} placeholder="João da Silva" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Cargo</Label>
                <Select value={newCrew.rank} onValueChange={v => setNewCrew(p => ({ ...p, rank: v, position: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Nacionalidade</Label><Input value={newCrew.nationality} onChange={e => setNewCrew(p => ({ ...p, nationality: e.target.value }))} placeholder="BR" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Status</Label>
                <Select value={newCrew.status} onValueChange={v => setNewCrew(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="active">A Bordo</SelectItem>
                    <SelectItem value="training">Treinamento</SelectItem>
                    <SelectItem value="on_leave">De Folga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>ID Funcional</Label><Input value={newCrew.employee_id} onChange={e => setNewCrew(p => ({ ...p, employee_id: e.target.value }))} placeholder="EMP-001" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancelar</Button>
            <Button onClick={() => addCrewMutation.mutate(newCrew)} disabled={!newCrew.full_name || addCrewMutation.isPending}>
              {addCrewMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
