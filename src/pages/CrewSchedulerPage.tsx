/**
 * CrewSchedulerPage - Crew Scheduling & Rotation Management
 * P0-005 FIX: Route was 404, now functional with real data
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/lib/animations/motion-variants';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateCrewMember } from '@/hooks/useModuleHooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { RefreshCw, Download, Plus, Calendar, Users, Ship, Clock, AlertTriangle } from 'lucide-react';
import { addCrewFormSchema } from '@/lib/validation/schemas';

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  vesselId: string | null;
  vesselName: string | null;
  status: 'onboard' | 'onleave' | 'available' | 'training';
  rotationStart: string;
  rotationEnd: string;
  daysRemaining: number;
}

export default function CrewSchedulerPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCrewMember, setNewCrewMember] = useState({
    name: '',
    rank: 'AB',
    status: 'available',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: crewMembers, isLoading, error, refetch } = useQuery({
    queryKey: ['crew-scheduler'],
    queryFn: async (): Promise<CrewMember[]> => {
      // Fetch real crew_members with vessel data
      const { data: crew, error: crewError } = await supabase
        .from('crew_members')
        .select('id, full_name, position, rank, status, contract_start, contract_end, vessel_id, vessels:vessel_id(id, name)')
        .order('full_name');

      if (crewError) throw crewError;

      return (crew || []).map((member) => {
        const vessel = member.vessels as { id: string; name: string } | null;
        const contractStart = member.contract_start ? new Date(member.contract_start) : null;
        const contractEnd = member.contract_end ? new Date(member.contract_end) : null;
        const daysRemaining = contractEnd
          ? Math.max(0, Math.ceil((contractEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : 0;

        const statusMap: Record<string, CrewMember['status']> = {
          active: 'onboard',
          on_leave: 'onleave',
          available: 'available',
          training: 'training',
          onboard: 'onboard',
          off_duty: 'onleave',
        };

        return {
          id: member.id,
          name: member.full_name || 'Sem Nome',
          rank: member.position || member.rank || 'Tripulante',
          vesselId: member.vessel_id || null,
          vesselName: vessel?.name || null,
          status: statusMap[member.status?.toLowerCase() || ''] || 'available',
          rotationStart: contractStart?.toISOString() || '',
          rotationEnd: contractEnd?.toISOString() || '',
          daysRemaining,
        };
      });
    },
  });

  const createCrewHook = useCreateCrewMember();
  const addCrewMutation = {
    mutate: (crew: typeof newCrewMember) => {
      const validation = addCrewFormSchema.safeParse({
        full_name: crew.name, rank: crew.rank, nationality: 'BR', status: crew.status,
      });
      if (!validation.success) {
        const errors: Record<string, string> = {};
        validation.error.issues.forEach(issue => { errors[issue.path[0] as string] = issue.message; });
        setFormErrors(errors);
        return;
      }
      setFormErrors({});
      createCrewHook.mutateAsync({
        full_name: crew.name,
        position: crew.rank,
        rank: crew.rank,
        nationality: 'BR',
        status: crew.status === 'available' ? 'available' : crew.status === 'training' ? 'training' : 'active',
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['crew-scheduler'] });
        setIsDialogOpen(false);
        setFormErrors({});
        setNewCrewMember({ name: '', rank: 'AB', status: 'available' });
      }).catch((err) => {
        if (err.message !== 'Validação falhou') toast.error('Erro ao adicionar tripulante');
      });
    },
    isPending: createCrewHook.isPending,
  };

  const filteredCrew = crewMembers?.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.vesselName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const stats = {
    total: filteredCrew.length,
    onboard: filteredCrew.filter(c => c.status === 'onboard').length,
    available: filteredCrew.filter(c => c.status === 'available').length,
    onleave: filteredCrew.filter(c => c.status === 'onleave').length,
    training: filteredCrew.filter(c => c.status === 'training').length,
    expiringSoon: filteredCrew.filter(c => c.daysRemaining > 0 && c.daysRemaining <= 14).length,
  };

  const handleExport = () => {
    if (!filteredCrew.length) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const csv = [
      ['Name', 'Rank', 'Vessel', 'Status', 'Rotation Start', 'Rotation End', 'Days Remaining'].join(','),
      ...filteredCrew.map(c => [
        c.name,
        c.rank,
        c.vesselName || 'Unassigned',
        c.status,
        c.rotationStart ? c.rotationStart.split('T')[0] : '',
        c.rotationEnd ? c.rotationEnd.split('T')[0] : '',
        c.daysRemaining,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crew-schedule-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Escala exportada');
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Dados atualizados');
  };

  const getStatusBadge = (status: CrewMember['status']) => {
    const variants: Record<CrewMember['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
      onboard: 'default',
      available: 'secondary',
      onleave: 'outline',
      training: 'destructive',
    };
    const labels: Record<CrewMember['status'], string> = {
      onboard: 'A Bordo',
      available: 'Disponível',
      onleave: 'De Folga',
      training: 'Treinamento',
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Erro ao carregar dados da tripulação</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Crew Scheduler</h1>
            <p className="text-muted-foreground">Gestão de Escalas e Rotações de Tripulação</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Tripulante</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    value={newCrewMember.name}
                    onChange={(e) => { setNewCrewMember(prev => ({ ...prev, name: e.target.value })); setFormErrors(p => ({ ...p, full_name: '' })); }}
                    className={formErrors.full_name ? 'border-destructive' : ''}
                    placeholder="Nome completo"
                  />
                  {formErrors.full_name && <p className="text-xs text-destructive mt-1">{formErrors.full_name}</p>}
                </div>
                <div>
                  <Label>Cargo</Label>
                  <Select
                    value={newCrewMember.rank}
                    onValueChange={(value) => setNewCrewMember(prev => ({ ...prev, rank: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="Chief Officer">Chief Officer</SelectItem>
                      <SelectItem value="Second Officer">Second Officer</SelectItem>
                      <SelectItem value="Chief Engineer">Chief Engineer</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="OS">OS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={newCrewMember.status}
                    onValueChange={(value) => setNewCrewMember(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponível</SelectItem>
                      <SelectItem value="training">Treinamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => addCrewMutation.mutate(newCrewMember)}
                  disabled={!newCrewMember.name || addCrewMutation.isPending}
                >
                  {addCrewMutation.isPending ? 'Adicionando...' : 'Adicionar Tripulante'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={`crew-sched-skeleton-${i}`}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" /> Total
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Ship className="h-4 w-4" /> A Bordo
                </p>
                <p className="text-2xl font-bold text-success">{stats.onboard}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" /> Disponível
                </p>
                <p className="text-2xl font-bold text-info">{stats.available}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" /> De Folga
                </p>
                <p className="text-2xl font-bold text-warning">{stats.onleave}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Treinamento
                </p>
                <p className="text-2xl font-bold text-accent">{stats.training}</p>
              </CardContent>
            </Card>
            <Card className={stats.expiringSoon > 0 ? 'border-warning' : ''}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Expirando
                </p>
                <p className="text-2xl font-bold text-warning">{stats.expiringSoon}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nome, cargo ou navio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tripulação ({filteredCrew.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={`crew-sched-skeleton-${i}`} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredCrew.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum tripulante encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Nome</th>
                    <th className="text-left p-2">Cargo</th>
                    <th className="text-left p-2">Navio</th>
                    <th className="text-center p-2">Status</th>
                    <th className="text-center p-2">Início Rotação</th>
                    <th className="text-center p-2">Fim Rotação</th>
                    <th className="text-center p-2">Dias Restantes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCrew.map((crew) => (
                    <tr key={crew.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{crew.name}</td>
                      <td className="p-2">{crew.rank}</td>
                      <td className="p-2">{crew.vesselName || <span className="text-muted-foreground">—</span>}</td>
                      <td className="p-2 text-center">{getStatusBadge(crew.status)}</td>
                      <td className="p-2 text-center">
                        {crew.rotationStart ? crew.rotationStart.split('T')[0] : '—'}
                      </td>
                      <td className="p-2 text-center">
                        {crew.rotationEnd ? crew.rotationEnd.split('T')[0] : '—'}
                      </td>
                      <td className="p-2 text-center">
                        {crew.daysRemaining > 0 ? (
                          <Badge variant={crew.daysRemaining <= 14 ? 'destructive' : 'outline'}>
                            {crew.daysRemaining} dias
                          </Badge>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
