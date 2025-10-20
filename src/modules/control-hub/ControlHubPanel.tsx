import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useButtonHandlers } from "@/hooks/useButtonHandlers";

export default function ControlHubPanel() {
  const { exportReport, resetIndicators } = useButtonHandlers();

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Indicadores Técnicos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">DP Reliability Index</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-emerald-400">98.7%</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ASOG Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-primary">99.2%</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">FMEA Open Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-amber-500">4</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button onClick={exportReport}>Exportar Relatório</Button>
        <Button onClick={resetIndicators} variant="outline">
          Resetar Indicadores
        </Button>
      </div>
    </div>
  );
}
