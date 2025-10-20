import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useButtonHandlers } from "@/hooks/useButtonHandlers";

export default function ControlHubPanel() {
  const { exportReport, resetIndicators } = useButtonHandlers();

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-text-base text-xl font-bold">Indicadores Técnicos</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>DP Reliability Index</CardTitle>
          </CardHeader>
          <CardContent>
            <span className='text-emerald-400 font-bold'>98.7%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ASOG Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <span className='text-primary-light font-bold'>99.2%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>FMEA Open Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <span className='text-alert-warning font-bold'>4</span>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-3">
        <Button onClick={exportReport}>Exportar Relatório</Button>
        <Button onClick={resetIndicators}>Resetar Indicadores</Button>
      </div>
    </div>
  );
}
