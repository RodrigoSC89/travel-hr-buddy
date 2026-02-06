import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useMaintenanceManagementData } from "@/hooks/useMaintenanceManagementData";
import { toast } from "sonner";
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Ship
} from "lucide-react";

export default function MaintenancePlanner() {
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'overdue'>('all');
  const { records, isLoading, stats, refetch, error } = useMaintenanceManagementData();

  const filteredRecords = filter === 'all'
    ? records
    : records.filter(r => r.status === filter);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'in_progress': return 'text-primary';
      case 'overdue': return 'text-destructive';
      case 'scheduled': return 'text-info';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'CONCLUÍDO';
      case 'in_progress': return 'EM ANDAMENTO';
      case 'overdue': return 'ATRASADO';
      case 'scheduled': return 'AGENDADO';
      case 'cancelled': return 'CANCELADO';
      default: return status.toUpperCase();
    }
  };

  const handleExport = () => {
    if (!records.length) {
      toast.warning("Nenhum registro para exportar");
      return;
    }
    const csv = [
      ['Equipamento', 'Embarcação', 'Tipo', 'Prioridade', 'Status', 'Data Agendada', 'Custo Estimado'].join(','),
      ...records.map(r => [
        `"${r.title}"`, `"${r.vessel_name}"`, r.maintenance_type, r.priority,
        r.status, r.scheduled_date, r.cost_estimate
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manutencoes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dados exportados com sucesso");
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success("Dados atualizados");
  };

  const getMaintenanceTypeLabel = (type: string) => {
    switch (type) {
      case 'preventive': return 'Preventiva';
      case 'corrective': return 'Corretiva';
      case 'emergency': return 'Emergencial';
      case 'inspection': return 'Inspeção';
      default: return type;
    }
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Wrench}
        title="Manutenções Ativas"
        description="Planejamento e gestão de manutenções preventivas, corretivas e preditivas"
        gradient="blue"
        badges={[
          { icon: Calendar, label: "Agendamento Inteligente" },
          { icon: TrendingUp, label: "Análise Preditiva" },
          { icon: CheckCircle, label: "KPIs em Tempo Real" }
        ]}
      />

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Manutenções</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Registros no banco</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-2xl font-bold">{stats.scheduled}</div>
                <p className="text-xs text-muted-foreground">Próximas programadas</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-2xl font-bold">{stats.overdue}</div>
                <p className="text-xs text-muted-foreground">Requer atenção</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}% do total` : 'Nenhum registro'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button onClick={() => setFilter('all')} variant={filter === 'all' ? 'default' : 'outline'}>
            Todas ({stats.total})
          </Button>
          <Button onClick={() => setFilter('scheduled')} variant={filter === 'scheduled' ? 'default' : 'outline'}>
            Agendadas ({stats.scheduled})
          </Button>
          <Button onClick={() => setFilter('completed')} variant={filter === 'completed' ? 'default' : 'outline'}>
            Concluídas ({stats.completed})
          </Button>
          <Button onClick={() => setFilter('overdue')} variant={filter === 'overdue' ? 'default' : 'outline'}>
            Atrasadas ({stats.overdue})
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Maintenance Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço</CardTitle>
          <CardDescription>
            Gerenciamento de manutenções programadas e emergenciais — dados reais do Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-96 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-destructive">Erro ao carregar manutenções</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Ship className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {filter === 'all' ? 'Nenhuma manutenção registrada' : `Nenhuma manutenção com status "${filter}"`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <Badge variant={getPriorityColor(job.priority)}>
                          {job.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{getMaintenanceTypeLabel(job.maintenance_type)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{job.description}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        <Ship className="inline h-3 w-3 mr-1" />{job.vessel_name}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(job.scheduled_date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className={`flex items-center gap-1 ${getStatusColor(job.status)}`}>
                          <CheckCircle className="h-3 w-3" />
                          {getStatusLabel(job.status)}
                        </span>
                        {job.cost_estimate > 0 && (
                          <span className="text-muted-foreground">
                            R$ {job.cost_estimate.toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Ver Detalhes</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ModulePageWrapper>
  );
}
