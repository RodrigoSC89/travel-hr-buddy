import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMaintenanceHistoryRealData } from "@/hooks/useMaintenanceHistoryRealData";
import { toast } from "sonner";
import { History, CheckCircle, Clock, Calendar, Download, RefreshCw, Ship, AlertTriangle } from "lucide-react";

export default function MaintenanceHistory() {
  const { history, isLoading, refetch, stats } = useMaintenanceHistoryRealData();

  const handleExport = () => {
    if (!history.length) {
      toast.warning("Nenhum registro para exportar");
      return;
    }
    const csv = [
      ['Equipamento', 'Embarcação', 'Tipo', 'Técnico', 'Horas', 'Custo', 'Data'].join(','),
      ...history.map(r => [
        `"${r.title}"`, `"${r.vesselName}"`, r.type, `"${r.technician}"`,
        r.hours, r.cost, r.completedAt.toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_manutencao_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Histórico exportado com sucesso");
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success("Dados atualizados");
  };

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={History}
        title="Histórico de Manutenção"
        description="Registro completo de todas as manutenções realizadas"
        gradient="purple"
        badges={[
          { icon: CheckCircle, label: "Manutenções Completas" },
          { icon: Calendar, label: "Cronologia" },
          { icon: Clock, label: "Análise de Tempo" }
        ]}
      />

      {/* Actions */}
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Histórico</CardTitle>
            <CardDescription>
              Estatísticas calculadas a partir dos registros reais do banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                {isLoading ? <Skeleton className="h-10 w-16 mx-auto" /> : (
                  <div className="text-3xl font-bold text-primary">{stats.totalRecords}</div>
                )}
                <div className="text-sm text-muted-foreground">Manutenções Realizadas</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                {isLoading ? <Skeleton className="h-10 w-16 mx-auto" /> : (
                  <div className="text-3xl font-bold text-success">
                    {stats.totalRecords > 0 ? Math.round((stats.completedCount / stats.totalRecords) * 100) : 0}%
                  </div>
                )}
                <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                {isLoading ? <Skeleton className="h-10 w-16 mx-auto" /> : (
                  <div className="text-3xl font-bold text-primary">
                    {stats.totalRecords > 0 ? (stats.totalHours / stats.totalRecords).toFixed(1) : 0}h
                  </div>
                )}
                <div className="text-sm text-muted-foreground">Tempo Médio</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                {isLoading ? <Skeleton className="h-10 w-16 mx-auto" /> : (
                  <div className="text-3xl font-bold text-warning">
                    R$ {(stats.totalCost / 1000).toFixed(1)}k
                  </div>
                )}
                <div className="text-sm text-muted-foreground">Custo Total</div>
              </div>
            </div>

            {/* By Type */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-xl font-bold">{stats.byType.preventiva}</div>
                <div className="text-xs text-muted-foreground">Preventiva</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-xl font-bold">{stats.byType.corretiva}</div>
                <div className="text-xs text-muted-foreground">Corretiva</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-xl font-bold">{stats.byType.preditiva}</div>
                <div className="text-xs text-muted-foreground">Preditiva</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registro de Atividades</CardTitle>
            <CardDescription>
              Manutenções completadas — dados reais do Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={`history-skeleton-${i}`} className="border-l-4 border-muted pl-4 py-2">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-96 mb-2" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <Ship className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma manutenção concluída registrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="border-l-4 border-success pl-4 py-2">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          <Ship className="inline h-3 w-3 mr-1" />{item.vesselName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{item.type}</Badge>
                          <Badge variant="secondary">{item.status}</Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{item.completedAt.toLocaleDateString('pt-BR')}</div>
                        <div className="text-muted-foreground">{item.hours}h</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Técnico: {item.technician}</span>
                      {item.cost > 0 && <span>Custo: R$ {item.cost.toLocaleString('pt-BR')}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModulePageWrapper>
  );
}
