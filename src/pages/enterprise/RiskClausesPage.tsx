/**
 * Risk Clause Detector - Página dedicada
 * Detecção de cláusulas de risco em contratos com IA
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
import {
  AlertTriangle, FileText, Shield, Search, Upload,
  Sparkles, CheckCircle2, XCircle, Eye, Download
} from "lucide-react";

// Mock risk clauses data
const riskAnalysisResults = {
  totalClauses: 45,
  highRisk: 3,
  mediumRisk: 8,
  lowRisk: 12,
  safe: 22,
  overallScore: 72,
};

const detectedClauses = [
  {
    id: 1,
    clause: "The Charterer shall not be liable for any consequential damages arising from vessel delays.",
    riskLevel: "high",
    category: "Liability",
    recommendation: "Negotiate mutual limitation of liability clause",
    impact: "Financial exposure up to $500k"
  },
  {
    id: 2,
    clause: "Force majeure events shall be at the sole discretion of the Charterer.",
    riskLevel: "high",
    category: "Force Majeure",
    recommendation: "Define specific force majeure events",
    impact: "Operational risk"
  },
  {
    id: 3,
    clause: "Payment terms: Net 90 days from invoice date.",
    riskLevel: "medium",
    category: "Payment",
    recommendation: "Negotiate Net 30 or Net 45 terms",
    impact: "Cash flow impact"
  },
  {
    id: 4,
    clause: "Owner warrants vessel seaworthiness at all times during charter.",
    riskLevel: "medium",
    category: "Warranty",
    recommendation: "Add 'commercially reasonable efforts' qualifier",
    impact: "Compliance burden"
  },
  {
    id: 5,
    clause: "Arbitration to be conducted in London under English Law.",
    riskLevel: "low",
    category: "Dispute Resolution",
    recommendation: "Standard BIMCO clause - acceptable",
    impact: "Legal costs in disputes"
  },
];

const recentAnalyses = [
  { contract: "Charter Party - MV Atlântico Sul", date: "2025-01-28", score: 78, risks: 2 },
  { contract: "Time Charter - Fleet Contract", date: "2025-01-25", score: 65, risks: 5 },
  { contract: "Bunker Supply Agreement", date: "2025-01-22", score: 85, risks: 1 },
  { contract: "Port Services Contract", date: "2025-01-20", score: 72, risks: 3 },
];

export default function RiskClausesPage() {
  const [selectedTab, setSelectedTab] = useState("detector");
  const [contractText, setContractText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!contractText.trim()) return;
    setIsAnalyzing(true);
    try {
      const { error } = await supabase.functions.invoke('ai-chat', {
        body: { prompt: `Analyze contract risk clauses: ${contractText.substring(0, 500)}`, module: 'risk-clauses' }
      });
      if (error) throw error;
      setSelectedTab("results");
    } catch (err) {
      toast.error("Erro na análise de cláusulas");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-green-500";
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case "high": return "Alto Risco";
      case "medium": return "Médio Risco";
      case "low": return "Baixo Risco";
      default: return "Seguro";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/20 rounded-xl">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Risk Clause Detector
              <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                AI
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Identificação automática de cláusulas de risco em contratos marítimos
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Análise
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cláusulas</p>
                <p className="text-3xl font-bold">{riskAnalysisResults.totalClauses}</p>
              </div>
              <FileText className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alto Risco</p>
                <p className="text-3xl font-bold text-red-500">{riskAnalysisResults.highRisk}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Médio Risco</p>
                <p className="text-3xl font-bold text-yellow-500">{riskAnalysisResults.mediumRisk}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Seguras</p>
                <p className="text-3xl font-bold text-green-500">{riskAnalysisResults.safe}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Geral</p>
                <p className="text-3xl font-bold text-primary">{riskAnalysisResults.overallScore}</p>
              </div>
              <Shield className="h-10 w-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="detector">Detector</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="detector" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Analisar Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload PDF
                </Button>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Upload DOCX
                </Button>
              </div>
              
              <div className="relative">
                <p className="text-sm text-muted-foreground mb-2">Ou cole o texto do contrato:</p>
                <Textarea
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  placeholder="Cole aqui as cláusulas do contrato para análise de risco..."
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !contractText.trim()}
                className="w-full gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Analisando cláusulas...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analisar com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Cláusulas de Risco Identificadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detectedClauses.map((clause) => (
                  <div key={clause.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={getRiskColor(clause.riskLevel)}>
                        {getRiskText(clause.riskLevel)}
                      </Badge>
                      <Badge variant="outline">{clause.category}</Badge>
                    </div>
                    
                    <blockquote className="border-l-4 border-muted pl-4 italic text-sm mb-3">
                      "{clause.clause}"
                    </blockquote>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Recomendação:</p>
                        <p>{clause.recommendation}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Impacto Potencial:</p>
                        <p>{clause.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAnalyses.map((analysis) => (
                  <div key={analysis.contract} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{analysis.contract}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(analysis.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{analysis.score}/100</p>
                        <p className="text-sm text-muted-foreground">{analysis.risks} riscos</p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
