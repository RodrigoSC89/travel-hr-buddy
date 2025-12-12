/**
 * QHSE Autônomo com IA - Compliance ISM/ISPS/TMSA
 * - Monitoramento contínuo de compliance
 * - Geração automática de evidências
 * - Preparação para vettings
 * - Gaps de conformidade
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { AIModuleEnhancer } from "@/components/ai/AIModuleEnhancer";
import {
  Brain, Shield, AlertTriangle, CheckCircle, FileText,
  TrendingUp, Clock, Zap, Sparkles, Search, ClipboardCheck,
  AlertCircle, Target
} from "lucide-react";
import { toast } from "sonner";

interface ComplianceItem {
  id: string;
  standard: string;
  requirement: string;
  status: "compliant" | "partial" | "non-compliant" | "pending";
  lastAudit: string;
  nextAudit: string;
  score: number;
  gaps: string[];
}

interface VettingPrep {
  id: string;
  type: string;
  scheduledDate: string;
  readinessScore: number;
  criticalItems: number;
  recommendations: string[];
}

export function QHSEAutonomousAI() {
  const { analyze, generate, suggest, isLoading } = useNautilusAI();
  const [complianceData, setComplianceData] = useState<ComplianceItem[]>([
    {
      id: "ism-001",
      standard: "ISM Code",
      requirement: "Sistema de Gestão de Segurança",
      status: "compliant",
      lastAudit: "2024-08-15",
      nextAudit: "2025-08-15",
      score: 95,
      gaps: []
    },
    {
      id: "isps-001",
      standard: "ISPS Code",
      requirement: "Plano de Proteção do Navio",
      status: "partial",
      lastAudit: "2024-09-20",
      nextAudit: "2025-03-20",
      score: 78,
      gaps: ["Treinamento de segurança pendente", "Atualização do SSP"]
    },
    {
      id: "tmsa-001",
      standard: "TMSA 3",
      requirement: "Gestão de Navegação",
      status: "compliant",
      lastAudit: "2024-07-10",
      nextAudit: "2025-07-10",
      score: 88,
      gaps: ["Evidências de BRM a melhorar"]
    },
    {
      id: "marpol-001",
      standard: "MARPOL",
      requirement: "Prevenção de Poluição",
      status: "compliant",
      lastAudit: "2024-10-05",
      nextAudit: "2025-10-05",
      score: 92,
      gaps: []
    }
  ]);
  const [vettingPreps, setVettingPreps] = useState<VettingPrep[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  const runComplianceAnalysis = async () => {
    try {
      const result = await analyze("qhse", `
        Analise o status de compliance das normas:
        
        ${complianceData.map(c => `
          - ${c.standard}: ${c.requirement}
            - Status: ${c.status}
            - Score: ${c.score}%
            - Gaps: ${c.gaps.join(", ") || "Nenhum"}
            - Próxima auditoria: ${c.nextAudit}
        `).join("\n")}
        
        Identifique riscos, priorize ações corretivas e sugira melhorias.
      `);

      if (result) {
        setAiAnalysis(result.response);
        toast.success("Análise de compliance concluída");
      }
    } catch (error) {
      toast.error("Erro na análise");
    }
  };

  const generateEvidence = async (standard: string) => {
    try {
      const result = await generate("qhse", `
        Gere um modelo de evidência de conformidade para: ${standard}
        
        Inclua:
        - Estrutura do documento
        - Campos obrigatórios
        - Exemplos de registros
        - Checklist de verificação
      `);

      toast.success(`Modelo de evidência gerado para ${standard}`);
    } catch (error) {
      toast.error("Erro ao gerar evidência");
    }
  };

  const prepareVetting = async () => {
    try {
      const result = await suggest("qhse", `
        Prepare uma análise para vetting OCIMF/TMSA considerando:
        
        - Status atual de compliance
        - Gaps identificados
        - Histórico de observações
        - Boas práticas recomendadas
        
        Liste itens críticos e ações prioritárias.
      `);

      const prep: VettingPrep = {
        id: `vetting-${Date.now()}`,
        type: "OCIMF SIRE",
        scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        readinessScore: 82,
        criticalItems: 3,
        recommendations: [
          "Atualizar registros de treinamento",
          "Revisar procedimentos de emergência",
          "Completar checklist de inspeção de segurança"
        ]
      };

      setVettingPreps(prev => [...prev, prep]);
      toast.success("Preparação de vetting criada");
    } catch (error) {
      toast.error("Erro na preparação");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "compliant": return "bg-green-500";
    case "partial": return "bg-yellow-500";
    case "non-compliant": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
    case "compliant": return "Conforme";
    case "partial": return "Parcial";
    case "non-compliant": return "Não Conforme";
    default: return "Pendente";
    }
  };

  const overallScore = Math.round(complianceData.reduce((acc, c) => acc + c.score, 0) / complianceData.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
            <Shield className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              QHSE Autônomo
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                <Sparkles className="h-3 w-3 mr-1" />
                Compliance IA
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              ISM • ISPS • TMSA • MARPOL • Vettings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={prepareVetting} disabled={isLoading}>
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Preparar Vetting
          </Button>
          <Button onClick={runComplianceAnalysis} disabled={isLoading}>
            <Zap className="h-4 w-4 mr-2" />
            Análise IA
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{overallScore}%</p>
                <p className="text-xs text-muted-foreground">Score Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {complianceData.filter(c => c.status === "compliant").length}/{complianceData.length}
                </p>
                <p className="text-xs text-muted-foreground">Conformes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {complianceData.reduce((acc, c) => acc + c.gaps.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Gaps Identificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{vettingPreps.length}</p>
                <p className="text-xs text-muted-foreground">Vettings Programados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compliance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="compliance">
            <Shield className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="vetting">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Vettings
          </TabsTrigger>
          <TabsTrigger value="ai-assistant">
            <Brain className="h-4 w-4 mr-2" />
            Assistente IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status de Conformidade</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {complianceData.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusLabel(item.status)}
                            </Badge>
                            <span className="font-medium">{item.standard}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.requirement}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span>Última auditoria: {item.lastAudit}</span>
                            <span>Próxima: {item.nextAudit}</span>
                          </div>
                          {item.gaps.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-orange-500">Gaps:</p>
                              {item.gaps.map((gap, i) => (
                                <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3 text-orange-500" />
                                  {gap}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{item.score}%</p>
                          <Button size="sm" variant="outline" onClick={() => generateEvidence(item.standard)}>
                            <FileText className="h-3 w-3 mr-1" />
                            Gerar Evidência
                          </Button>
                        </div>
                      </div>
                      <Progress value={item.score} className="h-2 mt-3" />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {aiAnalysis && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600">Análise IA</span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {aiAnalysis}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vetting">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Preparação de Vettings</CardTitle>
            </CardHeader>
            <CardContent>
              {vettingPreps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum vetting programado</p>
                  <Button className="mt-4" onClick={prepareVetting}>
                    <Target className="h-4 w-4 mr-2" />
                    Preparar Vetting
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {vettingPreps.map((prep) => (
                    <div key={prep.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{prep.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Agendado: {prep.scheduledDate}
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-medium">Recomendações IA:</p>
                            {prep.recommendations.map((rec, i) => (
                              <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {rec}
                              </p>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{prep.readinessScore}%</p>
                          <p className="text-xs text-muted-foreground">Prontidão</p>
                          <Badge variant="destructive" className="mt-1">
                            {prep.criticalItems} itens críticos
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIModuleEnhancer
            module="qhse"
            title="Assistente QHSE"
            description="Pergunte sobre compliance, auditorias, vettings ou normas"
            context={{ complianceData, vettingPreps }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default QHSEAutonomousAI;
