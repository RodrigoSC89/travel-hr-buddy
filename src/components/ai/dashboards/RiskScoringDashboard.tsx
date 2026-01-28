/**
 * Risk Scoring Dashboard
 * Dynamic voyage and operational risk visualization
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, Ship, Cloud, Users, Anchor, TrendingDown, CheckCircle, XCircle } from "lucide-react";

interface RiskFactor {
  id: string;
  name: string;
  category: string;
  score: number;
  weight: number;
  trend: "up" | "down" | "stable";
  mitigation: string;
}

export const RiskScoringDashboard: React.FC = () => {
  const [overallRisk, setOverallRisk] = useState(42);

  const riskFactors: RiskFactor[] = [
    { id: "1", name: "Condições Meteorológicas", category: "Ambiente", score: 65, weight: 25, trend: "up", mitigation: "Ajustar rota para evitar tempestade" },
    { id: "2", name: "Fadiga da Tripulação", category: "Humano", score: 38, weight: 20, trend: "down", mitigation: "Manter escalas de descanso" },
    { id: "3", name: "Idade do Navio", category: "Equipamento", score: 52, weight: 15, trend: "stable", mitigation: "Inspeções preventivas programadas" },
    { id: "4", name: "Complexidade da Rota", category: "Operacional", score: 45, weight: 20, trend: "stable", mitigation: "Planejamento detalhado de passagem" },
    { id: "5", name: "Compliance Status", category: "Regulatório", score: 22, weight: 20, trend: "down", mitigation: "Todos certificados em dia" },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-400";
    if (score >= 50) return "text-orange-400";
    if (score >= 30) return "text-yellow-400";
    return "text-green-400";
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 70) return "bg-red-500/20";
    if (score >= 50) return "bg-orange-500/20";
    if (score >= 30) return "bg-yellow-500/20";
    return "bg-green-500/20";
  };

  const getDecision = (score: number) => {
    if (score >= 70) return { label: "NO-GO", color: "bg-red-500", icon: XCircle };
    if (score >= 50) return { label: "CAUTELA", color: "bg-orange-500", icon: AlertTriangle };
    return { label: "GO", color: "bg-green-500", icon: CheckCircle };
  };

  const decision = getDecision(overallRisk);
  const DecisionIcon = decision.icon;

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Score de Risco da Viagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="relative h-48 flex items-center justify-center">
                  <div className={`w-40 h-40 rounded-full ${getRiskBgColor(overallRisk)} flex items-center justify-center`}>
                    <div className="text-center">
                      <span className={`text-5xl font-bold ${getRiskColor(overallRisk)}`}>{overallRisk}</span>
                      <p className="text-sm text-muted-foreground mt-1">/ 100</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className={`p-6 rounded-xl ${decision.color} text-white text-center`}>
                  <DecisionIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{decision.label}</p>
                  <p className="text-sm opacity-90 mt-1">Decisão do Sistema</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-2xl font-bold text-green-400">3</p>
                    <p className="text-xs text-muted-foreground">Baixo Risco</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-2xl font-bold text-orange-400">2</p>
                    <p className="text-xs text-muted-foreground">Médio Risco</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Ship className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Navio</p>
                  <p className="font-medium">MV Nautilus Star</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Anchor className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rota</p>
                  <p className="font-medium">Santos → Rotterdam</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Cloud className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Beaufort</p>
                  <p className="font-medium">Força 5-6</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tripulação</p>
                  <p className="font-medium">22 membros</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Risk Factors */}
      <Card className="bg-card/50 border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Fatores de Risco Detalhados
          </CardTitle>
          <Button variant="outline" size="sm">
            Recalcular
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskFactors.map((factor) => (
              <div key={factor.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{factor.category}</Badge>
                    <span className="font-medium">{factor.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {factor.trend === "up" && <TrendingDown className="w-4 h-4 text-red-400 rotate-180" />}
                      {factor.trend === "down" && <TrendingDown className="w-4 h-4 text-green-400" />}
                      {factor.trend === "stable" && <span className="w-4 h-4 text-yellow-400">—</span>}
                    </div>
                    <span className={`text-xl font-bold ${getRiskColor(factor.score)}`}>{factor.score}</span>
                    <span className="text-xs text-muted-foreground">peso: {factor.weight}%</span>
                  </div>
                </div>

                <Progress value={factor.score} className={`h-2 ${getRiskBgColor(factor.score)}`} />

                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-primary">Mitigação:</span> {factor.mitigation}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
