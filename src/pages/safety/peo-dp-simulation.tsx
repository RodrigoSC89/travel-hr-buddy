import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Button } from "@/components/ui/button";
import { Play, AlertCircle, CheckCircle } from "lucide-react";

export default function PEODPSimulation() {
  const scenarios = [
    { id: 1, name: "Falha de DP", severity: "critical", duration: "15 min" },
    { id: 2, name: "Incêndio - Praça de Máquinas", severity: "high", duration: "20 min" },
    { id: 3, name: "Alagamento", severity: "high", duration: "25 min" },
    { id: 4, name: "Blackout Geral", severity: "critical", duration: "10 min" }
  ];

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Play}
        title="Simulação PEO-DP"
        description="Simulador de emergências e cenários de resposta"
        gradient="orange"
        badges={[
          { icon: Play, label: "Simulador Ativo" },
          { icon: CheckCircle, label: "Treinamento" }
        ]}
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cenários Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{scenario.name}</h3>
                    <AlertCircle className={`h-5 w-5 ${scenario.severity === "critical" ? "text-red-600" : "text-orange-600"}`} />
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Duração estimada: {scenario.duration}
                  </div>
                  <Button size="sm" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Simulação
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageWrapper>
  );
}
