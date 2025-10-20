import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useButtonHandlers } from "@/hooks/useButtonHandlers";

export default function DPIntelligenceCenter() {
  const { generateReport, syncDPLogs, defaultFallback } = useButtonHandlers();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Centro de Inteligência DP</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Telemetria de Sistemas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Monitoramento ativo de sensores e falhas.</p>
            <div className="flex gap-3">
              <Button onClick={generateReport}>Gerar Relatório</Button>
              <Button onClick={syncDPLogs}>Sincronizar Dados DP</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análises Avançadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => defaultFallback("Análise Automática")}>
              Executar Análise Automática
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
