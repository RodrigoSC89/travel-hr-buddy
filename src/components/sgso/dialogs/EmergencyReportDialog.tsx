/**
import { useState, useCallback } from "react";;
 * Emergency Report Dialog
 * Generate and view emergency response reports
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  BarChart3
} from "lucide-react";

interface EmergencyReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REPORT_DATA = {
  summary: {
    totalPlans: 5,
    activePlans: 4,
    underReview: 1,
    expired: 0,
    complianceRate: 92,
  },
  drills: {
    completed: 12,
    scheduled: 3,
    avgResponseTime: "4min 32s",
    successRate: 95,
  },
  byType: [
    { type: "Incêndio", count: 4, lastDrill: "2024-09-15", status: "ok" },
    { type: "Homem ao Mar", count: 3, lastDrill: "2024-09-30", status: "ok" },
    { type: "Emergência Médica", count: 3, lastDrill: "2024-09-10", status: "ok" },
    { type: "Derramamento", count: 1, lastDrill: "2024-08-20", status: "warning" },
    { type: "Abandono", count: 1, lastDrill: "2024-07-01", status: "warning" },
  ],
  recentDrills: [
    { date: "2024-09-30", type: "Homem ao Mar", result: "Aprovado", time: "3min 45s" },
    { date: "2024-09-15", type: "Incêndio", result: "Aprovado", time: "5min 20s" },
    { date: "2024-09-10", type: "Médica", result: "Aprovado", time: "4min 10s" },
    { date: "2024-08-20", type: "Derramamento", result: "Com observações", time: "8min 30s" },
  ],
};

export const EmergencyReportDialog: React.FC<EmergencyReportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [reportPeriod, setReportPeriod] = useState("quarter");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Relatório PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success("Enviando para impressão...");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            Relatório de Emergências e Simulados
          </DialogTitle>
          <DialogDescription>
            Análise de conformidade SGSO e desempenho de simulados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Period Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Período:</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="semester">Último semestre</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Conformidade: {REPORT_DATA.summary.complianceRate}%
            </Badge>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{REPORT_DATA.summary.totalPlans}</div>
                <div className="text-xs text-muted-foreground">Planos Totais</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{REPORT_DATA.summary.activePlans}</div>
                <div className="text-xs text-muted-foreground">Planos Ativos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{REPORT_DATA.drills.completed}</div>
                <div className="text-xs text-muted-foreground">Simulados Realizados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{REPORT_DATA.drills.scheduled}</div>
                <div className="text-xs text-muted-foreground">Agendados</div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Métricas de Desempenho
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Sucesso</span>
                    <span className="font-medium">{REPORT_DATA.drills.successRate}%</span>
                  </div>
                  <Progress value={REPORT_DATA.drills.successRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Conformidade SGSO</span>
                    <span className="font-medium">{REPORT_DATA.summary.complianceRate}%</span>
                  </div>
                  <Progress value={REPORT_DATA.summary.complianceRate} className="h-2" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Tempo médio de resposta: <strong>{REPORT_DATA.drills.avgResponseTime}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drills by Type */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Simulados por Tipo
              </h4>
              <div className="space-y-2">
                {REPORT_DATA.byType.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{item.type}</span>
                      {item.status === "warning" && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{item.count} simulados</span>
                      <span>Último: {new Date(item.lastDrill).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Drills */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Últimos Simulados Realizados
              </h4>
              <div className="space-y-2">
                {REPORT_DATA.recentDrills.map((drill, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {new Date(drill.date).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="font-medium">{drill.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={drill.result === "Aprovado" ? "default" : "secondary"}>
                        {drill.result}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{drill.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => handleonOpenChange}>
            Fechar
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleExportPDF} disabled={isGenerating}>
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Gerando..." : "Exportar PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
