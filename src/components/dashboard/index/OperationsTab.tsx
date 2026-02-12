import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle } from "lucide-react";

export const OperationsTab = React.memo(() => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>Indicadores Operacionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Missões Completadas</span>
            <span className="text-2xl font-bold font-playfair">148</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Taxa de Sucesso</span>
            <span className="text-2xl font-bold font-playfair text-success">98.5%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Tempo Médio de Resposta</span>
            <span className="text-2xl font-bold font-playfair text-info">24min</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>Alertas Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div className="flex-1">
                <p className="text-sm font-medium">Manutenção Programada</p>
                <p className="text-xs text-muted-foreground">Atlântico I - 15/11/2025</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-info/10 border border-info/20">
              <Activity className="h-5 w-5 text-info" />
              <div className="flex-1">
                <p className="text-sm font-medium">Nova Missão Atribuída</p>
                <p className="text-xs text-muted-foreground">Pacífico II - Operação Alpha</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

OperationsTab.displayName = "OperationsTab";
