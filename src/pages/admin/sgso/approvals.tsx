/**
 * SGSO Approvals Page
 * Page for QSMS team to review and approve action plans
 */

import React, { useEffect, useState } from "react";
import { SGSOApprovalsTable } from "@/components/sgso/approvals/SGSOApprovalsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { SGSOActionPlan } from "@/lib/sgso/export-utils";
import { downloadFile, generateCSVFromPlans, generatePDFFromPlans } from "@/lib/sgso/export-utils";
import { summarizeSGSOTendenciesWithAI, SGSOTrendsAnalysis } from "@/lib/sgso/ai-trends";
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  FileText, 
  TrendingUp,
  BarChart3,
  Loader2
} from "lucide-react";

const SGSOApprovalsPage = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SGSOActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [analyzingTrends, setAnalyzingTrends] = useState(false);
  const [trendsAnalysis, setTrendsAnalysis] = useState<SGSOTrendsAnalysis | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sgso_action_plans")
        .select(`
          *,
          dp_incidents (
            id,
            title,
            date,
            vessel,
            location,
            root_cause,
            summary
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPlans((data as SGSOActionPlan[]) || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos de ação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      setExporting(true);
      
      if (format === "csv") {
        const csv = generateCSVFromPlans(plans);
        const filename = `sgso_action_plans_${new Date().toISOString().split("T")[0]}.csv`;
        downloadFile(csv, filename, "text/csv");
        toast({
          title: "✅ Exportação Concluída",
          description: "Arquivo CSV gerado com sucesso.",
        });
      } else if (format === "pdf") {
        const pdf = await generatePDFFromPlans(plans);
        const filename = `sgso_action_plans_${new Date().toISOString().split("T")[0]}.pdf`;
        downloadFile(pdf, filename, "application/pdf");
        toast({
          title: "✅ Exportação Concluída",
          description: "Arquivo PDF gerado com sucesso.",
        });
      }
    } catch (error) {
      console.error("Error exporting plans:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar os planos de ação.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleAnalyzeTrends = async () => {
    try {
      setAnalyzingTrends(true);
      
      // Filter approved plans for analysis
      const approvedPlans = plans.filter(p => p.status_approval === "aprovado");
      
      if (approvedPlans.length === 0) {
        toast({
          title: "Aviso",
          description: "Não há planos aprovados suficientes para análise.",
          variant: "default",
        });
        return;
      }

      const analysis = await summarizeSGSOTendenciesWithAI(approvedPlans);
      setTrendsAnalysis(analysis);
      
      toast({
        title: "✅ Análise Concluída",
        description: "Tendências analisadas com sucesso.",
      });
    } catch (error) {
      console.error("Error analyzing trends:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a análise de tendências.",
        variant: "destructive",
      });
    } finally {
      setAnalyzingTrends(false);
    }
  };

  const stats = {
    total: plans.length,
    pending: plans.filter((p) => p.status_approval === "pendente").length,
    approved: plans.filter((p) => p.status_approval === "aprovado").length,
    rejected: plans.filter((p) => p.status_approval === "recusado").length,
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Aprovação de Planos SGSO
          </h1>
          <p className="text-muted-foreground mt-2">
            Revisar e aprovar planos de ação gerados automaticamente
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExport("csv")}
            disabled={exporting || plans.length === 0}
          >
            <FileText className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport("pdf")}
            disabled={exporting || plans.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recusados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pendentes ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todos ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="mr-2 h-4 w-4" />
            Tendências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <SGSOApprovalsTable 
            plans={plans.filter(p => p.status_approval === "pendente")} 
            onUpdate={fetchPlans}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Planos de Ação</CardTitle>
              <CardDescription>
                Histórico completo de planos de ação SGSO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{plan.dp_incidents?.title || plan.incident_id}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(plan.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        plan.status_approval === "aprovado" ? "default" : 
                        plan.status_approval === "recusado" ? "destructive" : 
                        "secondary"
                      }
                    >
                      {plan.status_approval}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análise de Tendências com IA
              </CardTitle>
              <CardDescription>
                Análise inteligente de padrões e tendências nos planos de ação aprovados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleAnalyzeTrends}
                disabled={analyzingTrends || stats.approved === 0}
              >
                {analyzingTrends && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gerar Análise de Tendências
              </Button>

              {trendsAnalysis && (
                <div className="space-y-6 pt-4">
                  {/* Summary */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Resumo Executivo</h3>
                    <p className="text-muted-foreground">{trendsAnalysis.summary}</p>
                  </div>

                  {/* Top Categories */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Top 3 Categorias Mais Frequentes</h3>
                    <div className="space-y-2">
                      {trendsAnalysis.topCategories.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{cat.category}</span>
                          <Badge>{cat.count} ({cat.percentage}%)</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Root Causes */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Principais Causas Raiz</h3>
                    <div className="space-y-2">
                      {trendsAnalysis.mainRootCauses.map((cause, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{cause.cause}</span>
                          <Badge variant="outline">{cause.occurrences}x</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Systemic Measures */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Medidas Sistêmicas Sugeridas</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {trendsAnalysis.systemicMeasures.map((measure, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">{measure}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Emerging Risks */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Riscos Emergentes Detectados</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {trendsAnalysis.emergingRisks.map((risk, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">{risk}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Análise gerada em: {new Date(trendsAnalysis.generatedAt).toLocaleString("pt-BR")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SGSOApprovalsPage;
