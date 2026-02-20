/**
 * CrewSchedulerGantt - Visualização Gantt de escalas de tripulação
 * Mostra rotações, contratos e períodos de embarque/desembarque
 */
import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, Ship, RefreshCw, Clock, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface CrewMember {
  id: string;
  full_name: string;
  rank: string | null;
  status: string | null;
  vessel_id: string | null;
  contract_start: string | null;
  contract_end: string | null;
}

interface Vessel {
  id: string;
  name: string;
}

export function CrewSchedulerGantt() {
  const queryClient = useQueryClient();
  const [vesselFilter, setVesselFilter] = useState<string>('all');

  const { data: crew = [], isLoading } = useQuery({
    queryKey: ['crew-scheduler-gantt'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, status, vessel_id, contract_start, contract_end')
        .order('full_name');
      if (error) throw error;
      return (data || []) as CrewMember[];
    },
    staleTime: 30000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ['crew-scheduler-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vessels').select('id, name').order('name');
      if (error) throw error;
      return (data || []) as Vessel[];
    },
    staleTime: 60000,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['crew-scheduler-gantt'] });
    toast.success('Escalas atualizadas');
  };

  const filteredCrew = useMemo(() => {
    if (vesselFilter === 'all') return crew;
    if (vesselFilter === 'unassigned') return crew.filter(c => !c.vessel_id);
    return crew.filter(c => c.vessel_id === vesselFilter);
  }, [crew, vesselFilter]);

  const stats = useMemo(() => ({
    total: crew.length,
    onboard: crew.filter(c => c.status === 'active' || c.status === 'onboard').length,
    ashore: crew.filter(c => c.status === 'on_leave' || c.status === 'standby').length,
    expiringSoon: crew.filter(c => {
      if (!c.contract_end) return false;
      const days = differenceInDays(parseISO(c.contract_end), new Date());
      return days >= 0 && days <= 30;
    }).length,
  }), [crew]);

  const getVesselName = (vesselId: string | null) => {
    if (!vesselId) return 'Não designado';
    return vessels.find(v => v.id === vesselId)?.name || 'Embarcação';
  };

  const getContractDaysLeft = (endDate: string | null) => {
    if (!endDate) return null;
    return differenceInDays(parseISO(endDate), new Date());
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Tripulantes</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Ship className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">Embarcados</span>
            </div>
            <div className="text-2xl font-bold text-success">{stats.onboard}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowRightLeft className="h-4 w-4 text-info" />
              <span className="text-xs text-muted-foreground">Em Terra</span>
            </div>
            <div className="text-2xl font-bold text-info">{stats.ashore}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Contratos Vencendo</span>
            </div>
            <div className="text-2xl font-bold text-warning">{stats.expiringSoon}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Refresh */}
      <div className="flex items-center gap-3">
        <Select value={vesselFilter} onValueChange={setVesselFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filtrar por embarcação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Embarcações</SelectItem>
            <SelectItem value="unassigned">Não Designados</SelectItem>
            {vessels.map(v => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Atualizar
        </Button>
      </div>

      {/* Crew Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Cronograma de Tripulação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCrew.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum tripulante encontrado.</p>
              <p className="text-xs mt-1">Cadastre tripulantes no People Hub.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCrew.map(member => {
                const daysLeft = getContractDaysLeft(member.contract_end);
                const isExpiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
                const isExpired = daysLeft !== null && daysLeft < 0;
                
                return (
                  <div key={member.id} className="flex items-center justify-between py-3 px-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        member.status === 'active' || member.status === 'onboard' ? 'bg-success' :
                        member.status === 'on_leave' ? 'bg-info' : 'bg-muted-foreground'
                      )} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{member.full_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{member.rank || 'Sem cargo'}</span>
                          <span>•</span>
                          <span>{getVesselName(member.vessel_id)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {daysLeft !== null && (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            isExpired ? 'text-destructive border-destructive/30' :
                            isExpiring ? 'text-warning border-warning/30' :
                            'text-muted-foreground'
                          )}
                        >
                          {isExpired ? 'Vencido' : `${daysLeft}d restantes`}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {member.status || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CrewSchedulerGantt;
