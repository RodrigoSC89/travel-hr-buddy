/**
 * Risk Clause Detector - REAL DATA from Supabase: ai_contract_analysis
 */
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, FileText, Shield, Search, Upload, Sparkles, CheckCircle2, XCircle, Eye, Download, Loader2 } from "lucide-react";

export default function RiskClausesPage() {
  const [selectedTab, setSelectedTab] = useState("detector");
  const [contractText, setContractText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const { data: analyses, isLoading } = useQuery({
    queryKey: ["contract-analyses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_contract_analysis")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const totalAnalyses = analyses?.length || 0;
  const highRisk = analyses?.filter((a) => (a.overall_risk_score || 0) >= 70).length || 0;
  const medRisk = analyses?.filter((a) => (a.overall_risk_score || 0) >= 40 && (a.overall_risk_score || 0) < 70).length || 0;
  const safeCount = analyses?.filter((a) => (a.overall_risk_score || 0) < 40).length || 0;
  const avgScore = analyses?.length ? Math.round(analyses.reduce((acc, a) => acc + (a.overall_risk_score || 0), 0) / analyses.length) : 0;

  const handleAnalyze = async () => {
    if (!contractText.trim()) return;
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("contract-legal-ai", {
        body: { action: "analyze_risk_clauses", contract_text: contractText.substring(0, 2000) },
      });
      if (error) throw error;
      setAnalysisResult(data);
      setSelectedTab("results");
      toast.success("Análise concluída!");
    } catch {
      toast.error("Erro na análise de cláusulas");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-destructive/20 rounded-xl"><AlertTriangle className="h-8 w-8 text-destructive" /></div>
          <div><h1 className="text-2xl font-bold flex items-center gap-2">Risk Clause Detector<Badge variant="secondary" className="bg-destructive/20 text-destructive">AI</Badge></h1><p className="text-muted-foreground">Identificação automática de cláusulas de risco em contratos marítimos</p></div>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exportar Análise</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Contratos Analisados</p><p className="text-3xl font-bold">{totalAnalyses}</p></div><FileText className="h-10 w-10 text-muted-foreground/30" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Alto Risco</p><p className="text-3xl font-bold text-destructive">{highRisk}</p></div><XCircle className="h-10 w-10 text-destructive/30" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Médio Risco</p><p className="text-3xl font-bold text-warning">{medRisk}</p></div><AlertTriangle className="h-10 w-10 text-warning/30" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Seguros</p><p className="text-3xl font-bold text-success">{safeCount}</p></div><CheckCircle2 className="h-10 w-10 text-success/30" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Score Médio</p><p className="text-3xl font-bold text-primary">{avgScore}</p></div><Shield className="h-10 w-10 text-primary/30" /></div></CardContent></Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList><TabsTrigger value="detector">Detector</TabsTrigger><TabsTrigger value="results">Resultados</TabsTrigger><TabsTrigger value="history">Histórico</TabsTrigger></TabsList>

        <TabsContent value="detector" className="space-y-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Analisar Contrato</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4"><Button variant="outline" className="gap-2"><Upload className="h-4 w-4" />Upload PDF</Button><Button variant="outline" className="gap-2"><FileText className="h-4 w-4" />Upload DOCX</Button></div>
              <div><p className="text-sm text-muted-foreground mb-2">Ou cole o texto do contrato:</p><Textarea value={contractText} onChange={(e) => setContractText(e.target.value)} placeholder="Cole aqui as cláusulas do contrato para análise de risco..." rows={10} className="font-mono text-sm" /></div>
              <Button onClick={handleAnalyze} disabled={isAnalyzing || !contractText.trim()} className="w-full gap-2">
                {isAnalyzing ? <><Loader2 className="h-4 w-4 animate-spin" />Analisando cláusulas...</> : <><Sparkles className="h-4 w-4" />Analisar com IA</>}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Resultado da Análise</CardTitle></CardHeader>
            <CardContent>
              {analysisResult ? (
                <div className="p-4 border rounded-lg whitespace-pre-wrap text-sm">{typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult, null, 2)}</div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Analise um contrato na aba Detector para ver resultados aqui.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card><CardHeader><CardTitle>Análises Recentes</CardTitle></CardHeader>
            <CardContent><div className="space-y-4">
              {(analyses || []).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div><p className="font-medium">{a.contract_type}</p><p className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleDateString("pt-BR")}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{a.overall_risk_score || 0}/100</p>
                      <p className="text-sm text-muted-foreground">{(Array.isArray(a.risk_clauses) ? a.risk_clauses : []).length} riscos</p>
                    </div>
                    <Button size="sm" variant="outline" className="gap-1"><Eye className="h-4 w-4" />Ver</Button>
                  </div>
                </div>
              ))}
              {(!analyses || analyses.length === 0) && <p className="text-muted-foreground text-center py-8">Nenhuma análise realizada ainda</p>}
            </div></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
