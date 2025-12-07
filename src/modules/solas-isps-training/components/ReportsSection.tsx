import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, FileText, Calendar, TrendingUp } from "lucide-react";

export default function ReportsSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-bold mb-2">Safety Drill Log</h3>
            <p className="text-sm text-muted-foreground mb-4">Registro oficial de todos os drills realizados</p>
            <Button className="w-full"><Download className="h-4 w-4 mr-2" />Exportar PDF</Button>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="font-bold mb-2">Relatório de Conformidade</h3>
            <p className="text-sm text-muted-foreground mb-4">Análise de conformidade SOLAS/ISM/ISPS</p>
            <Button className="w-full"><Download className="h-4 w-4 mr-2" />Gerar Relatório</Button>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="font-bold mb-2">Dashboard Analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">Métricas e KPIs de treinamento</p>
            <Button className="w-full"><BarChart3 className="h-4 w-4 mr-2" />Ver Dashboard</Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Histórico de Relatórios</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["Safety Drill Log - Janeiro 2024", "Compliance Report Q4 2023", "ISPS Audit Report - Dez 2023"].map((report, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-muted-foreground" /><span>{report}</span></div>
                <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
