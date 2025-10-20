import React from "react";
import { useButtonHandlers } from "@/hooks/useButtonHandlers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ControlHubPanel() {
  const { exportReport, resetIndicators } = useButtonHandlers();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Control Hub Panel</h1>
        <p className="text-muted-foreground">Painel de Controle Central</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores Técnicos</CardTitle>
          <CardDescription>Monitoramento de métricas críticas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground">DP Reliability</div>
              <div className="text-2xl font-bold">98.5%</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground">ASOG Compliance</div>
              <div className="text-2xl font-bold">100%</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-sm font-medium text-muted-foreground">FMEA Actions</div>
              <div className="text-2xl font-bold">12</div>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={exportReport}>Exportar Relatório</Button>
            <Button onClick={resetIndicators} variant="outline">Resetar Indicadores</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
