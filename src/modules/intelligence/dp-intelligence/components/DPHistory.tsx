import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Download, Filter, TrendingUp, Activity, FileText } from "lucide-react";

const historyData = [
  {
    id: 1,
    date: "2024-12-06 14:30",
    event: "Análise IA Completa",
    type: "analysis",
    status: "success",
    details: "Todos os sistemas operando normalmente. Confidence 98%",
  },
  {
    id: 2,
    date: "2024-12-06 12:15",
    event: "Troca de Referência",
    type: "operation",
    status: "success",
    details: "DGPS Primary → HPR System (manutenção programada)",
  },
  {
    id: 3,
    date: "2024-12-06 10:00",
    event: "Alerta de Vento",
    type: "alert",
    status: "warning",
    details: "Velocidade do vento atingiu 25 knots. Capability reduzida.",
  },
  {
    id: 4,
    date: "2024-12-05 18:45",
    event: "Análise Preditiva",
    type: "analysis",
    status: "success",
    details: "Nenhuma falha prevista nas próximas 24h. Manutenção recomendada em 7 dias.",
  },
  {
    id: 5,
    date: "2024-12-05 16:30",
    event: "Otimização de Energia",
    type: "optimization",
    status: "success",
    details: "Economia de 12% no consumo de energia. Configuração otimizada aplicada.",
  },
  {
    id: 6,
    date: "2024-12-05 08:00",
    event: "Início de Operação",
    type: "operation",
    status: "success",
    details: "Operação DP iniciada. Todos os sistemas online.",
  },
  {
    id: 7,
    date: "2024-12-04 22:15",
    event: "Manutenção Preventiva",
    type: "maintenance",
    status: "info",
    details: "Thruster #3 - manutenção preventiva realizada.",
  },
  {
    id: 8,
    date: "2024-12-04 14:00",
    event: "Falha de Sensor",
    type: "alert",
    status: "error",
    details: "Wind Sensor #2 offline. Backup ativado automaticamente.",
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return <Badge className="bg-emerald-100 text-emerald-700">Sucesso</Badge>;
    case "warning":
      return <Badge className="bg-amber-100 text-amber-700">Alerta</Badge>;
    case "error":
      return <Badge className="bg-red-100 text-red-700">Erro</Badge>;
    case "info":
      return <Badge className="bg-blue-100 text-blue-700">Info</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "analysis":
      return <TrendingUp className="h-4 w-4 text-purple-500" />;
    case "operation":
      return <Activity className="h-4 w-4 text-blue-500" />;
    case "alert":
      return <Activity className="h-4 w-4 text-amber-500" />;
    case "optimization":
      return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    case "maintenance":
      return <Activity className="h-4 w-4 text-cyan-500" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function DPHistory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Histórico de Eventos</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Timeline de Operações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
            <div className="space-y-6">
              {historyData.map((item, index) => (
                <div key={item.id} className="relative pl-10">
                  <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{item.event}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.details}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {item.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-950">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Análises IA</p>
                <p className="text-2xl font-bold">247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Activity className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Operações</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-950">
                <Activity className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold">18</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-950">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relatórios</p>
                <p className="text-2xl font-bold">56</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
