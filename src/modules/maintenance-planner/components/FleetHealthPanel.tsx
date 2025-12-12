import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, Wrench, Ship, Gauge 
} from "lucide-react";

interface Equipment {
  id: string;
  codigo: string;
  nome: string;
  status: "operacional" | "atencao" | "critico";
  saude: number;
  proximaManutencao: string;
  horasOperacao: number;
  falhasRecentes: number;
}

interface FleetHealthPanelProps {
  equipamentos?: Equipment[];
  kpis?: {
    mtbf: string;
    jobsCriticos: number;
    taxaConformidade: number;
    jobsPendentes: number;
  };
}

const mockEquipamentos: Equipment[] = [
  { id: "1", codigo: "601.0001.01", nome: "Motor Principal BB", status: "operacional", saude: 95, proximaManutencao: "15 dias", horasOperacao: 12450, falhasRecentes: 0 },
  { id: "2", codigo: "601.0001.02", nome: "Motor Principal STBD", status: "atencao", saude: 78, proximaManutencao: "3 dias", horasOperacao: 12380, falhasRecentes: 1 },
  { id: "3", codigo: "603.0004.02", nome: "Bomba Hidráulica Popa", status: "critico", saude: 45, proximaManutencao: "Vencido", horasOperacao: 8920, falhasRecentes: 3 },
  { id: "4", codigo: "604.0002.01", nome: "Gerador Diesel 1", status: "operacional", saude: 88, proximaManutencao: "22 dias", horasOperacao: 15200, falhasRecentes: 0 },
  { id: "5", codigo: "605.0001.03", nome: "Sistema Sprinkler", status: "operacional", saude: 92, proximaManutencao: "45 dias", horasOperacao: 2100, falhasRecentes: 0 },
];

const mockKPIs = {
  mtbf: "847h",
  jobsCriticos: 3,
  taxaConformidade: 94,
  jobsPendentes: 12,
};

export const FleetHealthPanel: React.FC<FleetHealthPanelProps> = ({
  equipamentos = mockEquipamentos,
  kpis = mockKPIs,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
    case "operacional": return "bg-green-500";
    case "atencao": return "bg-yellow-500";
    case "critico": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "operacional": return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "atencao": return <Clock className="h-4 w-4 text-yellow-500" />;
    case "critico": return <AlertTriangle className="h-4 w-4 text-red-500" />;
    default: return <Activity className="h-4 w-4" />;
    }
  };

  const getHealthColor = (saude: number) => {
    if (saude >= 80) return "bg-green-500";
    if (saude >= 60) return "bg-yellow-500";
    return "bg-red-500";
  });

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
              <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tempo médio entre falhas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jobs Críticos</p>
                <p className="text-2xl font-bold text-red-500">{kpis.jobsCriticos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
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
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
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
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">{operacionais} Operacionais</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm">{atencao} Atenção</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm">{criticos} Críticos</span>
            </div>
          </div>

          {/* Equipment List */}
          <div className="space-y-3">
            {equipamentos.map((equip) => (
              <div
                key={equip.id}
                className={`p-3 rounded-lg border ${
                  equip.status === "critico" ? "border-red-500/50 bg-red-500/5" :
                    equip.status === "atencao" ? "border-yellow-500/50 bg-yellow-500/5" :
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
                        <Progress 
                          value={equip.saude} 
                          className={`w-16 h-2 ${getHealthColor(equip.saude)}`}
                        />
                        <span className="text-sm font-medium">{equip.saude}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Próx. Manutenção</p>
                      <Badge 
                        variant={equip.proximaManutencao === "Vencido" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
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
                  <div className="mt-2 flex items-center gap-2 text-xs text-yellow-600">
                    <AlertTriangle className="h-3 w-3" />
                    {equip.falhasRecentes} falha(s) nos últimos 90 dias
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
