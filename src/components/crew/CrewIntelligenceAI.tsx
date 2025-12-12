/**
import { useState, useMemo } from "react";;
 * Crew Intelligence AI - Diferencial vs Adonis/Seafair/OneOcean
 * - Matching inteligente tripulante-embarcação
 * - Análise de fadiga (MLC 2006)
 * - Otimização de escalas
 * - Previsão de turnover
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { AIModuleEnhancer } from "@/components/ai/AIModuleEnhancer";
import {
  Brain,
  Users,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  Heart,
  Award,
  Calendar,
  Ship,
  Sparkles,
  Zap,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface CrewMember {
  id: string;
  name: string;
  position: string;
  certifications: string[];
  fatigueLevel: number; // 0-100, higher = more fatigued
  daysOnboard: number;
  maxDays: number;
  performance: number;
  turnoverRisk: "low" | "medium" | "high";
}

interface MatchResult {
  crewId: string;
  crewName: string;
  position: string;
  matchScore: number;
  reasons: string[];
  availability: string;
}

interface FatigueAlert {
  crewId: string;
  crewName: string;
  level: "warning" | "critical";
  hoursWorked: number;
  restRequired: number;
  recommendation: string;
}

export const CrewIntelligenceAI = memo(function() {
  const { analyze, suggest, predict, isLoading } = useNautilusAI();
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [fatigueAlerts, setFatigueAlerts] = useState<FatigueAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulated crew data
  const crewData: CrewMember[] = [
    { id: "cr-001", name: "Carlos Silva", position: "DPO Class II", certifications: ["STCW", "DP Advanced", "HUET"], fatigueLevel: 45, daysOnboard: 18, maxDays: 28, performance: 92, turnoverRisk: "low" },
    { id: "cr-002", name: "João Santos", position: "Chief Officer", certifications: ["STCW", "GMDSS", "ISM"], fatigueLevel: 72, daysOnboard: 25, maxDays: 28, performance: 88, turnoverRisk: "medium" },
    { id: "cr-003", name: "Maria Costa", position: "2nd Officer", certifications: ["STCW", "ECDIS", "BRM"], fatigueLevel: 35, daysOnboard: 10, maxDays: 28, performance: 95, turnoverRisk: "low" },
    { id: "cr-004", name: "Pedro Oliveira", position: "Chief Engineer", certifications: ["STCW", "ERM", "HV"], fatigueLevel: 68, daysOnboard: 22, maxDays: 28, performance: 85, turnoverRisk: "high" },
    { id: "cr-005", name: "Ana Rodrigues", position: "3rd Engineer", certifications: ["STCW", "ETO"], fatigueLevel: 28, daysOnboard: 5, maxDays: 28, performance: 90, turnoverRisk: "low" },
  ];

  const openPositions = [
    { id: "pos-001", vessel: "PSV Atlantic Explorer", position: "DPO Class II", startDate: "2025-01-15", requirements: ["DP Advanced", "STCW", "Min 3 years experience"] },
    { id: "pos-002", vessel: "AHTS Ocean Star", position: "Chief Officer", startDate: "2025-01-20", requirements: ["STCW", "GMDSS", "Anchor handling experience"] },
  ];

  const runFatigueAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyze("crew", `
        Analise os níveis de fadiga da tripulação conforme MLC 2006:
        
        ${crewData.map(c => `
          - ${c.name} (${c.position})
            - Nível de fadiga: ${c.fatigueLevel}%
            - Dias a bordo: ${c.daysOnboard}/${c.maxDays}
        `).join("\n")}
        
        Identifique riscos e sugira ações.
      `, { crewData });

      // Generate alerts for high fatigue
      const alerts: FatigueAlert[] = crewData
        .filter(c => c.fatigueLevel > 60)
        .map(c => ({
          crewId: c.id,
          crewName: c.name,
          level: c.fatigueLevel > 75 ? "critical" : "warning",
          hoursWorked: Math.round(c.fatigueLevel * 1.2),
          restRequired: Math.round((c.fatigueLevel - 50) * 0.5),
          recommendation: c.fatigueLevel > 75 
            ? "Reduzir carga de trabalho imediatamente. Considerar desembarque antecipado."
            : "Monitorar e garantir descanso adequado entre turnos."
        }));

      setFatigueAlerts(alerts);
      toast.success("Análise de fadiga concluída", {
        description: `${alerts.length} alertas identificados`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runSmartMatching = async () => {
    setIsAnalyzing(true);
    try {
      const result = await suggest("crew", `
        Faça matching inteligente entre tripulantes disponíveis e vagas:
        
        Vagas:
        ${openPositions.map(p => `- ${p.vessel}: ${p.position} (Início: ${p.startDate})`).join("\n")}
        
        Tripulantes:
        ${crewData.map(c => `- ${c.name}: ${c.position}, Certificações: ${c.certifications.join(", ")}`).join("\n")}
        
        Considere: certificações, experiência, disponibilidade, desempenho.
      `);

      // Simulated matching results
      const matches: MatchResult[] = [
        {
          crewId: "cr-001",
          crewName: "Carlos Silva",
          position: "DPO Class II",
          matchScore: 95,
          reasons: ["Certificação DP Advanced", "Performance 92%", "Experiência compatível"],
          availability: "Disponível em 10 dias"
        },
        {
          crewId: "cr-003",
          crewName: "Maria Costa",
          position: "Chief Officer",
          matchScore: 78,
          reasons: ["Certificações compatíveis", "Alta performance", "Requer experiência adicional"],
          availability: "Disponível em 18 dias"
        }
      ];

      setMatchResults(matches);
      toast.success("Matching concluído", {
        description: `${matches.length} correspondências encontradas`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFatigueColor = (level: number) => {
    if (level < 40) return "text-green-500";
    if (level < 60) return "text-yellow-500";
    if (level < 80) return "text-orange-500";
    return "text-red-500";
  };

  const getTurnoverColor = (risk: string) => {
    switch (risk) {
    case "low": return "bg-green-500/10 text-green-500";
    case "medium": return "bg-yellow-500/10 text-yellow-500";
    case "high": return "bg-red-500/10 text-red-500";
    default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Crew Intelligence
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Avançada
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Matching inteligente • Análise de fadiga • Otimização de escalas
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runFatigueAnalysis} disabled={isAnalyzing}>
            <Heart className="h-4 w-4 mr-2" />
            Análise de Fadiga
          </Button>
          <Button onClick={runSmartMatching} disabled={isAnalyzing}>
            {isAnalyzing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
            Smart Matching
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{crewData.length}</p>
                <p className="text-xs text-muted-foreground">Tripulantes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{fatigueAlerts.length}</p>
                <p className="text-xs text-muted-foreground">Alertas de Fadiga</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{openPositions.length}</p>
                <p className="text-xs text-muted-foreground">Vagas Abertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(crewData.reduce((acc, c) => acc + c.performance, 0) / crewData.length)}%
                </p>
                <p className="text-xs text-muted-foreground">Performance Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Users className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="fatigue">
            <Heart className="h-4 w-4 mr-2" />
            Fadiga (MLC 2006)
          </TabsTrigger>
          <TabsTrigger value="matching">
            <Target className="h-4 w-4 mr-2" />
            Smart Matching
          </TabsTrigger>
          <TabsTrigger value="ai-assistant">
            <Brain className="h-4 w-4 mr-2" />
            Assistente IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tripulação Ativa</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {crewData.map((crew) => (
                    <div key={crew.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarFallback>{crew.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{crew.name}</p>
                            <p className="text-sm text-muted-foreground">{crew.position}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={getTurnoverColor(crew.turnoverRisk)}>
                              Turnover: {crew.turnoverRisk}
                            </Badge>
                            <Badge variant="outline">
                              <Award className="h-3 w-3 mr-1" />
                              {crew.performance}%
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Fadiga</p>
                            <div className="flex items-center gap-2">
                              <Progress value={crew.fatigueLevel} className="h-2 flex-1" />
                              <span className={getFatigueColor(crew.fatigueLevel)}>{crew.fatigueLevel}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Dias a bordo</p>
                            <p>{crew.daysOnboard}/{crew.maxDays}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Certificações</p>
                            <div className="flex gap-1 flex-wrap">
                              {crew.certifications.slice(0, 2).map(cert => (
                                <Badge key={cert} variant="secondary" className="text-xs">{cert}</Badge>
                              ))}
                              {crew.certifications.length > 2 && (
                                <Badge variant="secondary" className="text-xs">+{crew.certifications.length - 2}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fatigue">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Análise de Fadiga - MLC 2006
                <Badge variant="outline">Compliance automático</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fatigueAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Execute a análise de fadiga para identificar riscos</p>
                  <Button className="mt-4" onClick={runFatigueAnalysis}>
                    <Zap className="h-4 w-4 mr-2" />
                    Analisar Fadiga
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[350px]">
                  <div className="space-y-4">
                    {fatigueAlerts.map((alert) => (
                      <div
                        key={alert.crewId}
                        className={`p-4 rounded-lg border ${
                          alert.level === "critical" ? "border-red-500 bg-red-500/5" : "border-yellow-500 bg-yellow-500/5"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className={`h-4 w-4 ${alert.level === "critical" ? "text-red-500" : "text-yellow-500"}`} />
                              <span className="font-medium">{alert.crewName}</span>
                              <Badge variant={alert.level === "critical" ? "destructive" : "secondary"}>
                                {alert.level === "critical" ? "Crítico" : "Atenção"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {alert.hoursWorked}h trabalhadas • {alert.restRequired}h de descanso necessário
                            </p>
                          </div>
                        </div>
                        <p className="text-sm mt-2 p-2 bg-muted rounded">
                          <strong>Recomendação IA:</strong> {alert.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Vagas Abertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {openPositions.map((pos) => (
                    <div key={pos.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{pos.position}</p>
                          <p className="text-sm text-muted-foreground">{pos.vessel}</p>
                        </div>
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {pos.startDate}
                        </Badge>
                      </div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {pos.requirements.map((req, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{req}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  Resultados do Matching
                  <Badge className="bg-purple-500">
                    <Brain className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matchResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Execute o Smart Matching para encontrar correspondências</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchResults.map((match) => (
                      <div key={match.crewId} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{match.crewName}</p>
                            <p className="text-sm text-muted-foreground">{match.position}</p>
                          </div>
                          <Badge className="bg-green-500">
                            <UserCheck className="h-3 w-3 mr-1" />
                            {match.matchScore}% match
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          {match.reasons.map((reason, i) => (
                            <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                              <span className="w-1 h-1 bg-green-500 rounded-full" />
                              {reason}
                            </p>
                          ))}
                        </div>
                        <p className="text-xs text-blue-500 mt-2">{match.availability}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIModuleEnhancer
            module="crew"
            title="Assistente de Tripulação"
            description="Pergunte sobre escalas, certificações, fadiga ou matching"
            context={{ crewData, openPositions, fatigueAlerts }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CrewIntelligenceAI;
