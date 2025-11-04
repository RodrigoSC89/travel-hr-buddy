import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle, Clock, Calendar } from "lucide-react";

export default function MaintenanceHistory() {
  const historyItems = [
    {
      id: 1,
      equipment: "Gerador Diesel A",
      type: "Preventiva",
      date: "2025-10-15",
      technician: "João Silva",
      duration: "2h 30m",
      cost: "R$ 1,250.00",
      status: "completed",
      notes: "Substituição de filtros realizada conforme programado"
    },
    {
      id: 2,
      equipment: "Bomba Hidráulica 2",
      type: "Corretiva",
      date: "2025-10-20",
      technician: "Maria Santos",
      duration: "4h 15m",
      cost: "R$ 3,800.00",
      status: "completed",
      notes: "Reparo de vazamento e substituição de vedação"
    },
    {
      id: 3,
      equipment: "Compressor de Ar",
      type: "Preditiva",
      date: "2025-10-25",
      technician: "Pedro Costa",
      duration: "1h 45m",
      cost: "R$ 850.00",
      status: "completed",
      notes: "Manutenção baseada em análise de vibração"
    }
  ];

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

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Histórico</CardTitle>
            <CardDescription>
              Últimas 90 dias de atividades de manutenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-blue-600">124</div>
                <div className="text-sm text-muted-foreground">Manutenções Realizadas</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-green-600">95%</div>
                <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-purple-600">2.5h</div>
                <div className="text-sm text-muted-foreground">Tempo Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registro de Atividades</CardTitle>
            <CardDescription>
              Manutenções completadas ordenadas por data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {historyItems.map((item) => (
                <div key={item.id} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{item.equipment}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge variant="secondary">{item.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{item.date}</div>
                      <div className="text-muted-foreground">{item.duration}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.notes}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Técnico: {item.technician}</span>
                    <span>Custo: {item.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageWrapper>
  );
}
