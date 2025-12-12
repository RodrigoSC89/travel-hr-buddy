/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * Compliance AI Analysis Panel Component
 * Painel de análise preditiva e insights de IA
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Send,
  Loader2,
  RefreshCw,
  Shield,
  Target,
  Zap
} from "lucide-react";
import type { AIComplianceAnalysis, ComplianceItem, AuditSession, Certificate } from "../types";

interface ComplianceAIAnalysisPanelProps {
  analysis: AIComplianceAnalysis | null;
  loading: boolean;
  onRunAnalysis: (items: ComplianceItem[], audits: AuditSession[], certificates: Certificate[]) => void;
  onAskAI: (question: string) => Promise<string>;
  chatLoading: boolean;
  complianceItems: ComplianceItem[];
  audits: AuditSession[];
  certificates: Certificate[];
}

export const ComplianceAIAnalysisPanel = memo(function({
  analysis,
  loading,
  onRunAnalysis,
  onAskAI,
  chatLoading,
  complianceItems,
  audits,
  certificates,
}: ComplianceAIAnalysisPanelProps) {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<{ role: "user" | "ai"; content: string }[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const handleAskQuestion = async () => {
    if (!question.trim() || chatLoading) return;
    
    const userQuestion = question;
    setConversation(prev => [...prev, { role: "user", content: userQuestion }]);
    setQuestion("");
    
    const response = await onAskAI(userQuestion);
    setConversation(prev => [...prev, { role: "ai", content: response }]);
  });

  const getRiskLevelColor = (level: string) => {
    switch (level) {
    case "low": return "text-green-500 bg-green-500/10";
    case "medium": return "text-yellow-500 bg-yellow-500/10";
    case "high": return "text-orange-500 bg-orange-500/10";
    case "critical": return "text-red-500 bg-red-500/10";
    default: return "text-muted-foreground bg-muted";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "improving": return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "worsening": return <TrendingDown className="h-4 w-4 text-red-500" />;
    default: return <div className="h-4 w-4 rounded-full bg-muted-foreground/30" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Nautilus AI - Análise de Conformidade</CardTitle>
              <CardDescription>IA preditiva e assistente de compliance</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleonRunAnalysis}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview" className="text-xs">Resumo</TabsTrigger>
            <TabsTrigger value="risks" className="text-xs">Riscos</TabsTrigger>
            <TabsTrigger value="readiness" className="text-xs">Auditorias</TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">Assistente</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analysis ? (
              <>
                {/* Risk Level Banner */}
                <div className={`p-4 rounded-lg ${getRiskLevelColor(analysis.overallRiskLevel)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      <span className="font-semibold">Nível de Risco Geral</span>
                    </div>
                    <Badge variant="outline" className={getRiskLevelColor(analysis.overallRiskLevel)}>
                      {analysis.overallRiskLevel === "low" ? "Baixo" :
                        analysis.overallRiskLevel === "medium" ? "Médio" :
                          analysis.overallRiskLevel === "high" ? "Alto" : "Crítico"}
                    </Badge>
                  </div>
                  <p className="text-sm mt-2 opacity-90">{analysis.summary}</p>
                </div>

                {/* Risk Areas */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Áreas de Risco
                  </h4>
                  {analysis.riskAreas.map((area, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{area.area}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(area.trend)}
                          <span className="text-sm">{area.risk}%</span>
                        </div>
                      </div>
                      <Progress value={area.risk} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">{area.recommendation}</p>
                    </div>
                  ))}
                </div>

                {/* Compliance Gaps */}
                {analysis.complianceGaps.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Lacunas de Conformidade
                    </h4>
                    {analysis.complianceGaps.slice(0, 3).map((gap, index) => (
                      <div key={index} className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{gap.regulation}</span>
                          <Badge variant="outline" className={
                            gap.priority === "high" ? "border-red-500/50 text-red-500" :
                              gap.priority === "medium" ? "border-yellow-500/50 text-yellow-500" :
                                "border-green-500/50 text-green-500"
                          }>
                            {gap.priority === "high" ? "Alta" : gap.priority === "medium" ? "Média" : "Baixa"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{gap.gap}</p>
                        <p className="text-xs text-primary mt-1">→ {gap.suggestedAction}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Clique em "Atualizar" para executar a análise de IA
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            {analysis?.predictedIssues.map((issue, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Zap className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{issue.issue}</span>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                        {Math.round(issue.probability * 100)}% probabilidade
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{issue.impact}</p>
                    <div className="p-2 rounded bg-primary/5 text-sm">
                      <span className="font-medium text-primary">Ação preventiva: </span>
                      {issue.preventiveAction}
                    </div>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-12 text-muted-foreground">
                Execute a análise para ver previsões de risco
              </div>
            )}
          </TabsContent>

          <TabsContent value="readiness" className="space-y-4">
            {analysis?.auditReadiness.map((audit, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{audit.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Prontidão:</span>
                    <Badge className={
                      audit.readinessScore >= 90 ? "bg-green-500" :
                        audit.readinessScore >= 75 ? "bg-yellow-500" : "bg-red-500"
                    }>
                      {audit.readinessScore}%
                    </Badge>
                  </div>
                </div>
                <Progress value={audit.readinessScore} className="h-2 mb-3" />
                
                {audit.weakAreas.length > 0 && (
                  <div className="mb-3">
                    <span className="text-xs text-muted-foreground">Áreas a melhorar:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {audit.weakAreas.map((area, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  {audit.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )) || (
              <div className="text-center py-12 text-muted-foreground">
                Execute a análise para ver prontidão para auditorias
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <ScrollArea className="h-[200px] pr-3">
              <div className="space-y-3">
                {conversation.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Faça uma pergunta sobre compliance</p>
                    <div className="flex flex-wrap gap-1 mt-3 justify-center">
                      {["Como preparar para PSC?", "O que é ISM Code?", "Requisitos MLC?"].map((q) => (
                        <Button
                          key={q}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={handleSetQuestion}
                        >
                          {q}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  conversation.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-primary/10 ml-8"
                          : "bg-muted mr-8"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === "ai" ? (
                          <Brain className="h-4 w-4 text-primary" />
                        ) : null}
                        <span className="text-xs font-medium">
                          {msg.role === "ai" ? "Nautilus AI" : "Você"}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mr-8">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Analisando...</span>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Textarea
                placeholder="Pergunte sobre ISM, SOLAS, PSC, MLC..."
                value={question}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleAskQuestion()}
                className="min-h-[40px] resize-none"
              />
              <Button onClick={handleAskQuestion} disabled={chatLoading || !question.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
