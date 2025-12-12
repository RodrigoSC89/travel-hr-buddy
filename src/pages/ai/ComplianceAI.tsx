/**
import { useEffect, useState, useCallback } from "react";;
 * AI Compliance - Compliance Marítimo com IA
 * Verificação automatizada de conformidade regulatória
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Loader2, 
  Sparkles,
  Shield,
  FileCheck,
  Clock,
  RefreshCw,
  Book,
  Scale,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface ComplianceItem {
  id: string;
  regulation: string;
  requirement: string;
  status: "compliant" | "warning" | "non-compliant" | "pending";
  dueDate: string;
  details: string;
  category: string;
}

const ComplianceAI: React.FC = () => {
  const [complianceData, setComplianceData] = useState<ComplianceItem[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const categories = [
    { id: "all", name: "Todos", icon: <Scale className="h-4 w-4" /> },
    { id: "imo", name: "IMO", icon: <Shield className="h-4 w-4" /> },
    { id: "marpol", name: "MARPOL", icon: <Book className="h-4 w-4" /> },
    { id: "solas", name: "SOLAS", icon: <Award className="h-4 w-4" /> },
    { id: "stcw", name: "STCW", icon: <FileCheck className="h-4 w-4" /> },
  ];

  const sampleComplianceItems: ComplianceItem[] = [
    {
      id: "1",
      regulation: "MARPOL Anexo VI",
      requirement: "Certificado IAPP válido",
      status: "compliant",
      dueDate: "2025-06-15",
      details: "Certificado emitido em 15/06/2020, válido por 5 anos",
      category: "marpol",
    },
    {
      id: "2",
      regulation: "SOLAS Cap. III",
      requirement: "Manutenção de balsas salva-vidas",
      status: "warning",
      dueDate: "2025-01-20",
      details: "Inspeção anual vence em 30 dias",
      category: "solas",
    },
    {
      id: "3",
      regulation: "STCW",
      requirement: "Certificados de tripulação",
      status: "warning",
      dueDate: "2025-02-10",
      details: "2 tripulantes com certificados expirando em 60 dias",
      category: "stcw",
    },
    {
      id: "4",
      regulation: "ISM Code",
      requirement: "Auditoria interna SMS",
      status: "compliant",
      dueDate: "2025-12-01",
      details: "Última auditoria em 01/12/2024",
      category: "imo",
    },
    {
      id: "5",
      regulation: "MLC 2006",
      requirement: "Certificado de trabalho marítimo",
      status: "compliant",
      dueDate: "2026-03-20",
      details: "Certificado válido até março de 2026",
      category: "imo",
    },
    {
      id: "6",
      regulation: "MARPOL Anexo I",
      requirement: "Registro de óleo (Oil Record Book)",
      status: "pending",
      dueDate: "2025-01-05",
      details: "Aguardando verificação da última entrada",
      category: "marpol",
    },
  ];

  const analyzeCompliance = async () => {
    setIsLoading(true);
    setComplianceData(sampleComplianceItems);

    try {
      const { data, error } = await supabase.functions.invoke("optimization-ai-copilot", {
        body: {
          messages: [
            {
              role: "user",
              content: `Analise a situação de compliance marítimo e forneça:

1. **Resumo Geral de Conformidade**
   - Status atual da embarcação
   - Pontos de atenção imediata
   - Tendências de conformidade

2. **Regulamentações Críticas**
   - IMO/SOLAS: Status e próximos vencimentos
   - MARPOL: Conformidade ambiental
   - STCW: Certificações de tripulação
   - ISM Code: Sistema de gestão de segurança

3. **Ações Recomendadas**
   - Urgentes (próximos 30 dias)
   - Planejadas (30-90 dias)
   - Preventivas (longo prazo)

4. **Riscos de Não-Conformidade**
   - Penalidades potenciais
   - Impacto operacional
   - Medidas mitigatórias

5. **Preparação para Inspeções**
   - PSC (Port State Control)
   - Flag State
   - Vetting

Considere as seguintes situações atuais:
- IAPP válido até 06/2025
- Balsas com inspeção vencendo em 30 dias
- 2 certificados STCW expirando em 60 dias
- Auditoria ISM realizada em 12/2024

Formate a resposta em markdown estruturado.`,
            },
          ],
          type: "compliance_analysis",
          context: "Análise de compliance marítimo para operações offshore",
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setAiAnalysis(data?.response || "Análise não disponível");

      toast({
        title: "Análise concluída!",
        description: "Verificação de compliance atualizada.",
      });
    } catch (error) {
      console.error("Error analyzing compliance:", error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o compliance. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    analyzeCompliance();
  }, []);

  const filteredItems = complianceData.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "compliant":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "non-compliant":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "compliant":
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Conforme</Badge>;
    case "warning":
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">Atenção</Badge>;
    case "non-compliant":
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Não Conforme</Badge>;
    default:
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Pendente</Badge>;
    }
  };

  const stats = {
    total: complianceData.length,
    compliant: complianceData.filter((i) => i.status === "compliant").length,
    warning: complianceData.filter((i) => i.status === "warning").length,
    nonCompliant: complianceData.filter((i) => i.status === "non-compliant").length,
  };

  const complianceScore = stats.total > 0 
    ? Math.round((stats.compliant / stats.total) * 100) 
    : 0;

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Compliance Marítimo</h1>
            <p className="text-muted-foreground">
              Verificação automatizada de conformidade regulatória
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Compliance
          </Badge>
          <Button variant="outline" onClick={analyzeCompliance} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2">
              <Progress value={complianceScore} className="h-2" />
            </div>
            <p className="text-2xl font-bold">{complianceScore}%</p>
            <p className="text-xs text-muted-foreground">Score de Conformidade</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.compliant}</p>
            <p className="text-xs text-muted-foreground">Conformes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.warning}</p>
            <p className="text-xs text-muted-foreground">Atenção</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.nonCompliant}</p>
            <p className="text-xs text-muted-foreground">Não Conformes</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={handleSetSelectedCategory}
            className="whitespace-nowrap"
          >
            {cat.icon}
            <span className="ml-1">{cat.name}</span>
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Verificando conformidade...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compliance Items */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Itens de Conformidade</h2>
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{item.regulation}</p>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.requirement}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.details}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Vencimento: {new Date(item.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Análise de Compliance
              </CardTitle>
              <CardDescription>
                Recomendações geradas por IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {aiAnalysis ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">
                    Nenhuma análise disponível
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ComplianceAI;
