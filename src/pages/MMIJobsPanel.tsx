import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, TrendingUp, CheckCircle, Clock, FileDown, Brain } from "lucide-react";
import JobCards from "@/components/mmi/JobCards";
import { useToast } from "@/hooks/use-toast";
import { fetchJobs } from "@/services/mmi/jobsApi";
import { generateJobsPDFReport } from "@/services/mmi/pdfReportService";

export default function MMIJobsPanel() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();

  const handleGeneratePDFReport = async () => {
    setIsGeneratingPDF(true);
    try {
      const { jobs } = await fetchJobs();
      await generateJobsPDFReport(jobs, {
        title: 'Relatório MMI - Manutenção Inteligente com IA',
        includeAIRecommendations: true,
      });
      
      toast({
        title: "Relatório Gerado",
        description: "O relatório PDF foi gerado com sucesso e está sendo baixado.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Central de Jobs MMI v1.1.0</h1>
          </div>
          <Button 
            onClick={handleGeneratePDFReport}
            disabled={isGeneratingPDF}
            variant="outline"
          >
            <FileDown className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? 'Gerando...' : 'Exportar Relatório PDF'}
          </Button>
        </div>
        <p className="text-muted-foreground">
          Gestão inteligente de manutenção com IA adaptativa e aprendizado contínuo
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total de Jobs</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <Wrench className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">2</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">1</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Com Sugestão IA</p>
                <p className="text-2xl font-bold text-green-600">3</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Jobs Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs Ativos</CardTitle>
          <CardDescription>
            Gerencie suas ordens de manutenção com auxílio da Inteligência Artificial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobCards />
        </CardContent>
      </Card>

      {/* Features Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Novidades v1.1.0 - IA Adaptativa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-1">🧠</div>
                <div>
                  <strong>Aprendizado Contínuo</strong>
                  <p className="text-muted-foreground">
                    Vetorização automática com histórico de jobs via pgvector
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1">💬</div>
                <div>
                  <strong>Copilot IA Contextual</strong>
                  <p className="text-muted-foreground">
                    Recomendações baseadas em casos similares reais
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-1">📄</div>
                <div>
                  <strong>Relatórios Inteligentes</strong>
                  <p className="text-muted-foreground">
                    PDFs com sugestões IA e análise de histórico
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-blue-200 mt-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Sistema integrado: SGSO, Assistente IA Global, Dashboard BI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
