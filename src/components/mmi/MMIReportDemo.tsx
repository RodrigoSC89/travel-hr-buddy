import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { generateMaintenanceReport, MaintenanceJob } from "./ReportPDF";
import { useToast } from "@/hooks/use-toast";

/**
 * Demo component for MMI Report PDF generation
 * Can be integrated with actual maintenance management system
 */
export const MMIReportDemo: React.FC = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for demonstration - this would come from the actual maintenance system
  const mockMaintenanceJobs: MaintenanceJob[] = [
    {
      id: "1",
      title: "Inspeção do Motor Principal",
      component_id: "ENG-001",
      status: "scheduled",
      due_date: "2025-10-20",
      priority: "high",
      ai_suggestion: "Recomenda-se realizar inspeção preventiva antes do prazo devido ao histórico de uso intensivo."
    },
    {
      id: "2",
      title: "Troca de Filtros de Óleo",
      component_id: "FLT-023",
      status: "in_progress",
      due_date: "2025-10-18",
      priority: "medium",
      ai_suggestion: "Filtros apresentam 75% de saturação. Substituição recomendada nas próximas 48 horas."
    },
    {
      id: "3",
      title: "Revisão Sistema Hidráulico",
      component_id: "HYD-005",
      status: "overdue",
      due_date: "2025-10-12",
      priority: "critical",
      ai_suggestion: "Manutenção atrasada! Detectados vazamentos menores. Intervenção urgente necessária."
    },
    {
      id: "4",
      title: "Calibração de Sensores",
      component_id: "SNS-042",
      status: "completed",
      due_date: "2025-10-10",
      priority: "low",
      ai_suggestion: "Calibração realizada com sucesso. Próxima verificação em 90 dias."
    },
    {
      id: "5",
      title: "Manutenção Preventiva Geradores",
      component_id: "GEN-001",
      status: "scheduled",
      due_date: "2025-10-25",
      priority: "medium",
      ai_suggestion: "Análise de vibração detectou desvios mínimos. Manutenção preventiva conforme planejado."
    }
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    try {
      generateMaintenanceReport(mockMaintenanceJobs);
      
      toast({
        title: "📄 Relatório PDF Gerado",
        description: "O relatório de manutenção foi gerado e está sendo baixado.",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Relatório MMI (Manutenção com IA)
        </CardTitle>
        <CardDescription>
          Gere relatórios PDF inteligentes com insights de IA para gestão de manutenção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total de Jobs</p>
            <p className="text-2xl font-bold">{mockMaintenanceJobs.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Com Sugestões IA</p>
            <p className="text-2xl font-bold">
              {mockMaintenanceJobs.filter(j => j.ai_suggestion).length}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Recursos do Relatório:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✅ Lista completa de jobs de manutenção</li>
            <li>✅ Status e prioridades coloridos</li>
            <li>✅ Prazos e componentes identificados</li>
            <li>✅ Sugestões da IA embarcada</li>
            <li>✅ Formato profissional em PDF</li>
            <li>✅ Exportável com um clique</li>
          </ul>
        </div>

        <Button 
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? "Gerando Relatório..." : "Exportar Relatório PDF"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Pronto para integração com o painel de manutenção
        </p>
      </CardContent>
    </Card>
  );
};
