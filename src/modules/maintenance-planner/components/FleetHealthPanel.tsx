import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, Wrench, Ship, Gauge, RefreshCw 
} from "lucide-react";
import { useFleetHealthData } from "@/hooks/useFleetHealthData";
import type { Equipment, FleetHealthKPIs } from "@/hooks/useFleetHealthData";

interface FleetHealthPanelProps {
  equipamentos?: Equipment[];
  kpis?: FleetHealthKPIs;
}

export const FleetHealthPanel: React.FC<FleetHealthPanelProps> = ({
  equipamentos: propEquipamentos,
  kpis: propKpis,
}) => {
  const { data, isLoading } = useFleetHealthData();

  const equipamentos = propEquipamentos || data?.equipamentos || [];
  const kpis = propKpis || data?.kpis || { mtbf: "N/A", jobsCriticos: 0, taxaConformidade: 100, jobsPendentes: 0 };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operacional": return "bg-success";
      case "atencao": return "bg-warning";
      case "critico": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operacional": return <CheckCircle className="h-4 w-4 text-success" />;
      case "atencao": return <Clock className="h-4 w-4 text-warning" />;
      case "critico": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getHealthColor = (saude: number) => {
    if (saude >= 80) return "bg-success";
    if (saude >= 60) return "bg-warning";
    return "bg-destructive";
  };

  if (isLoading && !propEquipamentos) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const operacionais = equipamentos.filter(e => e.status === "operacional").length;
  const atencao = equipamentos.filter(e => e.status === "atencao").length;
  const criticos = equipamentos.filter(e => e.status === "critico").length;

  return (
    <div className="space-y-4">
      {/* KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MTBF</p>
                <p className="text-2xl font-bold">{kpis.mtbf}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tempo médio entre falhas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jobs Críticos</p>
                <p className="text-2xl font-bold text-destructive">{kpis.jobsCriticos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requerem atenção imediata</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformidade</p>
                <p className="text-2xl font-bold">{kpis.taxaConformidade}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-50" />
            </div>
            <Progress value={kpis.taxaConformidade} className="mt-2 h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jobs Pendentes</p>
                <p className="text-2xl font-bold">{kpis.jobsPendentes}</p>
              </div>
              <Wrench className="h-8 w-8 text-primary opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Status Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Status da Frota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm">{operacionais} Operacionais</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-sm">{atencao} Atenção</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-sm">{criticos} Críticos</span>
            </div>
          </div>

          {equipamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ship className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum equipamento registrado</p>
              <p className="text-sm">Adicione embarcações e registros de manutenção para visualizar a saúde da frota.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {equipamentos.map((equip) => (
                <div
                  key={equip.id}
                  className={`p-3 rounded-lg border ${
                    equip.status === "critico" ? "border-destructive/50 bg-destructive/5" :
                    equip.status === "atencao" ? "border-warning/50 bg-warning/5" :
                    "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(equip.status)}
                      <div>
                        <p className="font-medium text-sm">{equip.nome}</p>
                        <p className="text-xs text-muted-foreground">{equip.codigo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Saúde</p>
                        <div className="flex items-center gap-2">
                          <Progress value={equip.saude} className={`w-16 h-2 ${getHealthColor(equip.saude)}`} />
                          <span className="text-sm font-medium">{equip.saude}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Próx. Manutenção</p>
                        <Badge variant={equip.proximaManutencao === "Vencido" ? "destructive" : "secondary"} className="text-xs">
                          {equip.proximaManutencao}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Horas</p>
                        <div className="flex items-center gap-1">
                          <Gauge className="h-3 w-3" />
                          <span className="text-sm">{equip.horasOperacao.toLocaleString()}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {equip.falhasRecentes > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-warning">
                      <AlertTriangle className="h-3 w-3" />
                      {equip.falhasRecentes} falha(s) nos últimos 90 dias
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
