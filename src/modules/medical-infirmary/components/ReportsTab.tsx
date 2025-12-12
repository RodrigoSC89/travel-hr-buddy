/**
import { useState, useCallback } from "react";;
 * Reports Tab
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Plus, Calendar, CheckCircle2, Clock, Shield, BarChart3, Brain } from "lucide-react";
import { mockReports } from "../data/mockData";
import { toast } from "sonner";

export default function ReportsTab() {
  const [reports] = useState(mockReports);

  const handleGenerate = (type: string) => {
    toast.success(`Gerando relatório: ${type}`);
  });

  const handleDownload = (id: string) => {
    toast.success("Baixando relatório...");
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => handlehandleGenerate}>
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="font-medium">Relatório MLC 2006</h3>
            <p className="text-sm text-muted-foreground">Conformidade Maritime Labour Convention</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => handlehandleGenerate}>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="font-medium">Relatório Port State</h3>
            <p className="text-sm text-muted-foreground">Inspeção de Estado do Porto</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => handlehandleGenerate}>
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-purple-500" />
            <h3 className="font-medium">Relatório Mensal</h3>
            <p className="text-sm text-muted-foreground">Resumo de atendimentos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Gerados</CardTitle>
          <CardDescription>Histórico de relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-sm text-muted-foreground">Gerado em {new Date(report.generatedAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={report.status === "completed" ? "default" : "secondary"}>
                    {report.status === "completed" ? "Concluído" : "Rascunho"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handlehandleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
