import React from "react";
import { useButtonHandlers } from "@/hooks/useButtonHandlers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DPIntelligenceCenter() {
  const { generateReport, syncDPLogs } = useButtonHandlers();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">DP Intelligence Center</h1>
        <p className="text-muted-foreground">Centro de Inteligência de Posicionamento Dinâmico</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Telemetria de Sistemas</CardTitle>
            <CardDescription>Monitoramento ativo de sistemas DP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Acompanhe o desempenho em tempo real dos sistemas de posicionamento dinâmico.
            </p>
            <div className="flex gap-2">
              <Button onClick={generateReport}>Gerar Relatório</Button>
              <Button onClick={syncDPLogs} variant="outline">Sincronizar Dados DP</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análises Avançadas</CardTitle>
            <CardDescription>Execução automática de análises</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sistema de análise preditiva com algoritmos de machine learning para otimização de DP.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
