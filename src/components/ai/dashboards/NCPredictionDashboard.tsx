/**
 * NC Prediction Dashboard
 * Non-Conformity prediction for PSC/OVID inspections
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileSearch, AlertTriangle, CheckCircle, TrendingUp, Calendar, Ship, MapPin, Target } from "lucide-react";

interface NCPrediction {
  id: string;
  area: string;
  code: string;
  probability: number;
  severity: "detention" | "major" | "minor";
  lastNC: string;
  recommendation: string;
}

export const NCPredictionDashboard: React.FC = () => {
  const predictions: NCPrediction[] = [
    { id: "1", area: "Fire Safety", code: "07.1", probability: 78, severity: "detention", lastNC: "PSC Rotterdam 2024", recommendation: "Verificar extintores vencidos no convés" },
    { id: "2", area: "Safety of Navigation", code: "04.2", probability: 65, severity: "major", lastNC: "OVID Singapore 2024", recommendation: "Atualizar cartas náuticas eletrônicas" },
    { id: "3", area: "Life-Saving Appliances", code: "05.1", probability: 52, severity: "major", lastNC: "PSC Santos 2023", recommendation: "Inspeção preventiva de botes salva-vidas" },
    { id: "4", area: "Working Conditions", code: "09.3", probability: 35, severity: "minor", lastNC: "Nunca", recommendation: "Manter registros de horas de descanso" },
  ];

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "detention": return { color: "bg-red-500 text-white", label: "Detenção" };
      case "major": return { color: "bg-orange-500 text-white", label: "Major" };
      case "minor": return { color: "bg-yellow-500 text-black", label: "Minor" };
      default: return { color: "bg-muted", label: severity };
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return "text-red-400";
    if (prob >= 50) return "text-orange-400";
    if (prob >= 30) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileSearch className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próxima Inspeção</p>
                <p className="font-medium">PSC Rotterdam</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risco Detenção</p>
                <p className="text-2xl font-bold text-yellow-400">MÉDIO</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NCs Previstas</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precisão do Modelo</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions */}
        <Card className="lg:col-span-2 bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Previsões de Não-Conformidade
            </CardTitle>
            <Button variant="outline" size="sm">Gerar Plano</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.map((pred) => {
                const severityConfig = getSeverityConfig(pred.severity);
                return (
                  <div
                    key={pred.id}
                    className={`p-4 rounded-lg border ${
                      pred.severity === "detention" 
                        ? "bg-red-500/10 border-red-500/30" 
                        : "bg-muted/30 border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={severityConfig.color}>
                            {severityConfig.label}
                          </Badge>
                          <span className="font-medium">{pred.area}</span>
                          <span className="text-sm text-muted-foreground">({pred.code})</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Última NC: {pred.lastNC}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-3xl font-bold ${getProbabilityColor(pred.probability)}`}>
                          {pred.probability}%
                        </span>
                        <p className="text-xs text-muted-foreground">probabilidade</p>
                      </div>
                    </div>

                    <Progress value={pred.probability} className="h-2 mb-3" />

                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-sm">
                        <span className="text-primary font-medium">Recomendação IA:</span>{" "}
                        {pred.recommendation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Inspection Info */}
        <Card className="bg-card/50 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Próxima Inspeção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3 mb-3">
                  <Ship className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">MV Nautilus Star</p>
                    <p className="text-sm text-muted-foreground">IMO 9876543</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Rotterdam</p>
                    <p className="text-sm text-muted-foreground">Paris MoU</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">15 Fev 2026</p>
                    <p className="text-sm text-muted-foreground">Em 18 dias</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Áreas de Alto Risco</span>
                  <span className="font-bold text-red-400">2</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Ações Recomendadas</span>
                  <span className="font-bold text-orange-400">6</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Itens Verificados</span>
                  <span className="font-bold text-green-400">45/52</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Histórico Positivo</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      3 inspeções sem detenção nos últimos 2 anos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
