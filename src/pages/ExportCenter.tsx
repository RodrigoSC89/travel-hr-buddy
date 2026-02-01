/**
 * Export Center - Central de Exportação
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, FileImage, Archive, Clock } from "lucide-react";

const exportOptions = [
  { id: 1, name: "Exportar para Excel", icon: FileSpreadsheet, format: "XLSX", description: "Dados em planilha" },
  { id: 2, name: "Exportar para PDF", icon: FileText, format: "PDF", description: "Relatório formatado" },
  { id: 3, name: "Exportar Imagens", icon: FileImage, format: "PNG/JPG", description: "Gráficos e dashboards" },
  { id: 4, name: "Backup Completo", icon: Archive, format: "ZIP", description: "Todos os dados" },
];

const recentExports = [
  { id: 1, name: "Relatório Operacional", format: "PDF", size: "2.4 MB", date: "01/02/2026 14:30" },
  { id: 2, name: "Dados de Frota", format: "XLSX", size: "1.8 MB", date: "01/02/2026 10:15" },
  { id: 3, name: "Dashboard Semanal", format: "PNG", size: "890 KB", date: "31/01/2026 18:00" },
];

export default function ExportCenter() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Download className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Central de Exportação</h2>
          <p className="text-muted-foreground">Exporte dados em diversos formatos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {exportOptions.map((option) => (
          <Card key={option.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <option.icon className="h-8 w-8 text-primary" />
                <Badge variant="outline">{option.format}</Badge>
              </div>
              <CardTitle className="mt-2">{option.name}</CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exportações Recentes</CardTitle>
          <CardDescription>Últimos arquivos exportados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExports.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{exp.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{exp.format}</Badge>
                      <span>•</span>
                      <span>{exp.size}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{exp.date}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Baixar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
