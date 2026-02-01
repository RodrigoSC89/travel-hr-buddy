/**
 * Reports Command Page - Central de Relatórios
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Download, Calendar, Clock, Play } from "lucide-react";

const reports = [
  { id: 1, name: "Relatório Operacional Semanal", type: "operations", lastRun: "01/02/2026", status: "ready" },
  { id: 2, name: "Análise de Compliance", type: "compliance", lastRun: "31/01/2026", status: "ready" },
  { id: 3, name: "Dashboard de Frota", type: "fleet", lastRun: "01/02/2026", status: "generating" },
  { id: 4, name: "Relatório de Tripulação", type: "crew", lastRun: "30/01/2026", status: "ready" },
  { id: 5, name: "Análise Financeira", type: "finance", lastRun: "01/02/2026", status: "ready" },
];

export default function ReportsCommandPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Central de Relatórios</h2>
            <p className="text-muted-foreground">Gere e visualize relatórios do sistema</p>
          </div>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Relatórios Prontos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{reports.filter(r => r.status === "ready").length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Em Geração</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-blue-500">
              {reports.filter(r => r.status === "generating").length}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Downloads Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">24</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Agendados</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">8</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{report.type}</Badge>
                      <Calendar className="h-3 w-3 ml-2" />
                      <span>{report.lastRun}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.status === "generating" ? (
                    <Badge className="bg-blue-100 text-blue-800">Gerando...</Badge>
                  ) : (
                    <>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Play className="h-3 w-3 mr-1" />
                        Regenerar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
