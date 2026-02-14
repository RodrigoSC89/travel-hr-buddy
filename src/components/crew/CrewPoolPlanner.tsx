/**
 * Crew Pool Planner - Revolutionary Visual Rotation Management
 * Embark/disembark timeline, pool availability, vessel assignment, fatigue monitoring
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
import { toast } from 'sonner';
import {
  Users, Ship, Calendar, ArrowRightLeft, Clock, AlertTriangle,
  CheckCircle, Search, Plus, Download, Anchor, UserPlus,
  Heart, Shield, TrendingUp, Eye, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CrewPool {
  id: string;
  name: string;
  rank: string;
  status: string;
  vessel_name?: string;
  vessel_id?: string;
  nationality: string;
  contract_end?: string;
  days_onboard: number;
  max_days: number;
  fatigue_risk: 'low' | 'medium' | 'high';
  certifications_valid: boolean;
}

export default function CrewPoolPlanner() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<CrewPool | null>(null);
  const [selectedVessel, setSelectedVessel] = useState('');
  const queryClient = useQueryClient();

  // Fetch crew members with vessel info
  const { data: crew = [], isLoading } = useQuery({
    queryKey: ['crew-pool-planner'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*, vessels:vessel_id(id, name)')
        .order('full_name');
      if (error) throw error;

      return (data || []).map((c): CrewPool => {
        const contractEnd = c.contract_end ? new Date(c.contract_end as string) : null;
        const embarkedDate = c.contract_start ? new Date(c.contract_start as string) : null;
        const daysOnboard = embarkedDate ? Math.max(0, Math.ceil((Date.now() - embarkedDate.getTime()) / 86400000)) : 0;
        const maxDays = 90; // Standard rotation
        const fatigueRisk = daysOnboard > maxDays * 0.9 ? 'high' as const
          : daysOnboard > maxDays * 0.7 ? 'medium' as const
          : 'low' as const;

        const vessel = c.vessels as { id: string; name: string } | null;
        return {
          id: c.id,
          name: c.full_name || 'N/A',
          rank: (c.position as string) || (c.rank as string) || 'N/A',
          status: (c.status as string) || 'inactive',
          vessel_name: vessel?.name,
          vessel_id: vessel?.id,
          nationality: (c.nationality as string) || '—',
          contract_end: contractEnd?.toISOString(),
          days_onboard: daysOnboard,
          max_days: maxDays,
          fatigue_risk: fatigueRisk,
          certifications_valid: true,
        };
      });
    },
    staleTime: 30000,
  });

  // Fetch vessels for assignment
  const { data: vessels = [] } = useQuery({
    queryKey: ['crew-pool-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vessels').select('id, name, status').order('name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Assign crew to vessel
  const assignMutation = useMutation({
    mutationFn: async ({ crewId, vesselId }: { crewId: string; vesselId: string }) => {
      const { error } = await supabase.from('crew_members')
        .update({ vessel_id: vesselId, status: 'active', contract_start: new Date().toISOString() })
        .eq('id', crewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-pool-planner'] });
      toast.success('Tripulante designado com sucesso');
      setAssignDialog(false);
    },
    onError: () => toast.error('Erro ao designar tripulante'),
  });

  const metrics = useMemo(() => {
    const total = crew.length;
    const onboard = crew.filter(c => c.status === 'active' || c.status === 'onboard').length;
    const available = crew.filter(c => c.status === 'available').length;
    const onLeave = crew.filter(c => c.status === 'on_leave' || c.status === 'off_duty').length;
    const highFatigue = crew.filter(c => c.fatigue_risk === 'high').length;
    const pendingRotation = crew.filter(c => {
      if (!c.contract_end) return false;
      return new Date(c.contract_end) <= new Date(Date.now() + 14 * 86400000);
    }).length;
    const unassigned = crew.filter(c => !c.vessel_id && c.status === 'available').length;

    return { total, onboard, available, onLeave, highFatigue, pendingRotation, unassigned };
  }, [crew]);

  const filteredCrew = crew.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Group by vessel
  const vesselGroups = useMemo(() => {
    const groups: Record<string, CrewPool[]> = { 'Pool Disponível': [] };
    crew.forEach(c => {
      if (!c.vessel_name || c.status === 'available') {
        groups['Pool Disponível'].push(c);
      } else {
        if (!groups[c.vessel_name]) groups[c.vessel_name] = [];
        groups[c.vessel_name].push(c);
      }
    });
    return groups;
  }, [crew]);

  const getFatigueColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-destructive bg-destructive/10';
      case 'medium': return 'text-warning bg-warning/10';
      default: return 'text-success bg-success/10';
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      active: { label: 'A Bordo', variant: 'default' },
      onboard: { label: 'A Bordo', variant: 'default' },
      available: { label: 'Disponível', variant: 'secondary' },
      on_leave: { label: 'Folga', variant: 'outline' },
      off_duty: { label: 'Folga', variant: 'outline' },
      training: { label: 'Treino', variant: 'outline' },
    };
    const c = map[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={c.variant} className="text-[10px]">{c.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard icon={<Users />} label="Total" value={metrics.total} />
        <KPICard icon={<Ship />} label="A Bordo" value={metrics.onboard} color="text-success" />
        <KPICard icon={<UserPlus />} label="Disponíveis" value={metrics.available} color="text-primary" />
        <KPICard icon={<Calendar />} label="De Folga" value={metrics.onLeave} color="text-warning" />
        <KPICard icon={<AlertTriangle />} label="Alta Fadiga" value={metrics.highFatigue} color="text-destructive" />
        <KPICard icon={<ArrowRightLeft />} label="Rotação Próxima" value={metrics.pendingRotation} color="text-amber-500" />
        <KPICard icon={<Anchor />} label="Sem Designação" value={metrics.unassigned} color="text-muted-foreground" />
      </div>

      {/* Fatigue Alert */}
      {metrics.highFatigue > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Heart className="h-5 w-5 text-destructive animate-pulse" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-destructive">{metrics.highFatigue} tripulante(s) com risco de fadiga elevado</p>
              <p className="text-xs text-muted-foreground">Conformidade MLC 2006 — considere rotação imediata</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar tripulante..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
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

      {/* Vessel Groups */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : (
        Object.entries(vesselGroups).map(([vesselName, members]) => {
          if (members.length === 0) return null;
          const isPool = vesselName === 'Pool Disponível';
          return (
            <motion.div key={vesselName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={isPool ? 'border-primary/30' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {isPool ? <Users className="h-4 w-4 text-primary" /> : <Ship className="h-4 w-4" />}
                    {vesselName}
                    <Badge variant="outline" className="text-xs ml-2">{members.length} tripulantes</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {members.slice(0, 20).map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.rank} • {member.nationality}</p>
                      </div>

                      {/* Days onboard progress */}
                      {!isPool && member.days_onboard > 0 && (
                        <div className="w-24 hidden md:block">
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span>{member.days_onboard}d</span>
                            <span className="text-muted-foreground">{member.max_days}d</span>
                          </div>
                          <Progress value={(member.days_onboard / member.max_days) * 100} className="h-1.5" />
                        </div>
                      )}

                      {/* Fatigue indicator */}
                      <div className={`px-2 py-1 rounded text-[10px] font-medium ${getFatigueColor(member.fatigue_risk)}`}>
                        {member.fatigue_risk === 'high' ? '⚠ Fadiga' : member.fatigue_risk === 'medium' ? '⚡ Atenção' : '✓ OK'}
                      </div>

                      {getStatusBadge(member.status)}

                      {/* Action: assign available crew */}
                      {isPool && (
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                          setSelectedCrew(member);
                          setAssignDialog(true);
                        }}>
                          <Ship className="h-3 w-3 mr-1" />Designar
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}

      {/* Assignment Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Ship className="h-5 w-5" />Designar Tripulante</DialogTitle>
          </DialogHeader>
          {selectedCrew && (
            <div className="space-y-4">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <p className="font-semibold">{selectedCrew.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCrew.rank} • {selectedCrew.nationality}</p>
                </CardContent>
              </Card>
              <div>
                <Label>Embarcação de Destino</Label>
                <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                  <SelectTrigger><SelectValue placeholder="Selecione a embarcação" /></SelectTrigger>
                  <SelectContent>
                    {vessels.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name} ({v.status})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" disabled={!selectedVessel || assignMutation.isPending}
                onClick={() => assignMutation.mutate({ crewId: selectedCrew.id, vesselId: selectedVessel })}>
                {assignMutation.isPending ? 'Designando...' : 'Confirmar Embarque'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KPICard({ icon, label, value, color = 'text-foreground' }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
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
