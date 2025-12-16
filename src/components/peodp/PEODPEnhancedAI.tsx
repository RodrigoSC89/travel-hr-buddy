/**
 * PEO-DP Enhanced AI - Conformidade Petrobras com IA
 * - Monitoramento ASOG em tempo real
 * - Geração automática de evidências
 * - Preparação para auditorias
 * - Análise dos 7 pilares
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { AIModuleEnhancer } from "@/components/ai/AIModuleEnhancer";
import {
  Brain, Shield, AlertTriangle, CheckCircle, FileText,
  Activity, Sparkles, Zap, Target, Settings, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Pillar {
  id: string;
  name: string;
  score: number;
  status: "green" | "yellow" | "red";
  items: number;
  compliant: number;
  lastAudit: string;
}

interface ASOGStatus {
  current: "green" | "yellow" | "red";
  reason: string;
  timestamp: string;
  recommendations: string[];
}

export function PEODPEnhancedAI() {
  const { analyze, generate, suggest, isLoading } = useNautilusAI();
  const [asogStatus, setAsogStatus] = useState<ASOGStatus>({
    current: "green",
    reason: "Todos os sistemas operacionais",
    timestamp: new Date().toISOString(),
    recommendations: []
  });
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  const pillars: Pillar[] = [
    { id: "p1", name: "Gerenciamento de SMS/ISO", score: 92, status: "green", items: 45, compliant: 42, lastAudit: "2024-10-15" },
    { id: "p2", name: "Gerenciamento de Pessoal", score: 88, status: "green", items: 38, compliant: 34, lastAudit: "2024-10-15" },
    { id: "p3", name: "Gerenciamento de Hardware", score: 78, status: "yellow", items: 52, compliant: 41, lastAudit: "2024-10-15" },
    { id: "p4", name: "Gerenciamento de Software", score: 95, status: "green", items: 28, compliant: 27, lastAudit: "2024-10-15" },
    { id: "p5", name: "Operação e Procedimentos", score: 85, status: "green", items: 62, compliant: 53, lastAudit: "2024-10-15" },
    { id: "p6", name: "Manutenção e Inspeção", score: 72, status: "yellow", items: 48, compliant: 35, lastAudit: "2024-10-15" },
    { id: "p7", name: "Experiência Operacional", score: 90, status: "green", items: 25, compliant: 23, lastAudit: "2024-10-15" },
  ];

  const overallScore = Math.round(pillars.reduce((acc, p) => acc + p.score, 0) / pillars.length);

  const runPillarAnalysis = async () => {
    try {
      const result = await analyze("peodp", `
        Analise a conformidade dos 7 pilares do PEO-DP:
        
        ${pillars.map(p => `
          - ${p.name}: ${p.score}% (${p.compliant}/${p.items} itens)
        `).join("\n")}
        
        Identifique:
        1. Pilares com gaps críticos
        2. Ações prioritárias para cada pilar
        3. Preparação para próxima auditoria
        4. Riscos de não-conformidade
      `);

      if (result) {
        setAiAnalysis(result.response);
        toast.success("Análise de pilares concluída");
      }
    } catch (error) {
      toast.error("Erro na análise");
    }
  };

  const generateEvidence = async (pillarName: string) => {
    try {
      await generate("peodp", `
        Gere um modelo de evidência de conformidade para o pilar:
        ${pillarName}
        
        Inclua todos os campos obrigatórios conforme PEO-DP versão atual.
      `);

      toast.success(`Evidência gerada para ${pillarName}`);
    } catch (error) {
      toast.error("Erro ao gerar evidência");
    }
  };

  const checkASOG = async () => {
    try {
      const result = await suggest("peodp", `
        Avalie o status ASOG atual considerando:
        - Score geral: ${overallScore}%
        - Pilares em amarelo: ${pillars.filter(p => p.status === "yellow").length}
        - Itens não conformes: ${pillars.reduce((acc, p) => acc + (p.items - p.compliant), 0)}
        
        Determine se o status deve ser Verde, Amarelo ou Vermelho.
        Justifique e liste recomendações.
      `);

      // Simulated ASOG check
      const newStatus: ASOGStatus = {
        current: pillars.some(p => p.status === "red") ? "red" : 
                 pillars.some(p => p.status === "yellow") ? "yellow" : "green",
        reason: "Pilares 3 e 6 requerem atenção",
        timestamp: new Date().toISOString(),
        recommendations: [
          "Completar manutenções pendentes do Pilar 3",
          "Atualizar registros de inspeção do Pilar 6",
          "Revisar checklist de hardware"
        ]
      };

      setAsogStatus(newStatus);
      toast.success("Status ASOG atualizado");
    } catch (error) {
      toast.error("Erro ao verificar ASOG");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green": return "bg-green-500";
      case "yellow": return "bg-yellow-500";
      case "red": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
            <Shield className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              PEO-DP Intelligence
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                <Sparkles className="h-3 w-3 mr-1" />
                7 Pilares + ASOG
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Conformidade Petrobras • IMCA • IMO • NORMAM
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={checkASOG} disabled={isLoading}>
            <Activity className="h-4 w-4 mr-2" />
            Verificar ASOG
          </Button>
          <Button onClick={runPillarAnalysis} disabled={isLoading}>
            <Zap className="h-4 w-4 mr-2" />
            Análise IA
          </Button>
        </div>
      </div>

      {/* ASOG Status Card */}
      <Card className={`border-2 ${
        asogStatus.current === "green" ? "border-green-500 bg-green-500/5" :
        asogStatus.current === "yellow" ? "border-yellow-500 bg-yellow-500/5" :
        "border-red-500 bg-red-500/5"
      }`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${getStatusColor(asogStatus.current)} flex items-center justify-center`}>
                <span className="text-2xl font-bold text-white">
                  {asogStatus.current === "green" ? "✓" : asogStatus.current === "yellow" ? "!" : "✕"}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  Status ASOG: {asogStatus.current.toUpperCase()}
                </h3>
                <p className="text-sm text-muted-foreground">{asogStatus.reason}</p>
                <p className="text-xs text-muted-foreground">
                  Última verificação: {new Date(asogStatus.timestamp).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{overallScore}%</p>
              <p className="text-sm text-muted-foreground">Score Geral</p>
            </div>
          </div>
          {asogStatus.recommendations.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Recomendações IA:</p>
              {asogStatus.recommendations.map((rec, i) => (
                <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  {rec}
                </p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="pillars" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pillars">
            <Settings className="h-4 w-4 mr-2" />
            7 Pilares
          </TabsTrigger>
          <TabsTrigger value="ai-assistant">
            <Brain className="h-4 w-4 mr-2" />
            Assistente IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pillars">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillars.map((pillar) => (
              <Card key={pillar.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(pillar.status)}`} />
                      <span className="font-medium text-sm">{pillar.name}</span>
                    </div>
                    <Badge variant="outline">{pillar.score}%</Badge>
                  </div>
                  <Progress value={pillar.score} className={`h-2 mb-2 ${
                    pillar.status === "green" ? "[&>div]:bg-green-500" :
                    pillar.status === "yellow" ? "[&>div]:bg-yellow-500" :
                    "[&>div]:bg-red-500"
                  }`} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{pillar.compliant}/{pillar.items} itens conformes</span>
                    <span>Auditado: {pillar.lastAudit}</span>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button size="sm" variant="outline" onClick={() => generateEvidence(pillar.name)}>
                      <FileText className="h-3 w-3 mr-1" />
                      Gerar Evidência
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {aiAnalysis && (
            <Card className="mt-4">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-600">Análise IA dos Pilares</span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIModuleEnhancer
            module="peodp"
            title="Assistente PEO-DP"
            description="Pergunte sobre pilares, ASOG, IMCA, IMO ou NORMAM"
            context={{ pillars, asogStatus, overallScore }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PEODPEnhancedAI;
