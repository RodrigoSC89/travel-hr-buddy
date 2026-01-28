/**
 * Contract Analysis Dashboard
 * NLP-powered contract risk and opportunity analysis
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, AlertTriangle, TrendingUp, DollarSign, Scale, Clock, CheckCircle, XCircle } from "lucide-react";

interface RiskClause {
  id: string;
  clause: string;
  section: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  issue: string;
  suggestion: string;
}

interface Opportunity {
  id: string;
  area: string;
  currentValue: string;
  proposedValue: string;
  savings: number;
  confidence: number;
}

export const ContractAnalysisDashboard: React.FC = () => {
  const riskClauses: RiskClause[] = [
    { id: "1", clause: "Cláusula 8.3", section: "Responsabilidade", riskLevel: "critical", issue: "Responsabilidade ilimitada por danos", suggestion: "Limitar a 2x o valor do contrato" },
    { id: "2", clause: "Cláusula 12.1", section: "Penalidades", riskLevel: "high", issue: "Multa de 5% por dia de atraso", suggestion: "Negociar cap de 10% do valor total" },
    { id: "3", clause: "Cláusula 15.2", section: "Terminação", riskLevel: "medium", issue: "Rescisão sem aviso prévio", suggestion: "Incluir período de cura de 30 dias" },
  ];

  const opportunities: Opportunity[] = [
    { id: "1", area: "Prazo de Pagamento", currentValue: "Net 30", proposedValue: "Net 45", savings: 15000, confidence: 85 },
    { id: "2", area: "Bunker Clause", currentValue: "Preço fixo", proposedValue: "Índice MOPS", savings: 28000, confidence: 72 },
    { id: "3", area: "Volume Discount", currentValue: "Nenhum", proposedValue: "5% acima 10K MT", savings: 42000, confidence: 65 },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-green-500 text-white";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contratos Analisados</p>
                <p className="text-2xl font-bold">47</p>
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
                <p className="text-sm text-muted-foreground">Riscos Identificados</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Oportunidades</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Economia Potencial</p>
                <p className="text-2xl font-bold">$85K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Clauses */}
        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Cláusulas de Risco
            </CardTitle>
            <Badge variant="destructive">{riskClauses.length} encontradas</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskClauses.map((clause) => (
                <div
                  key={clause.id}
                  className={`p-4 rounded-lg border ${
                    clause.riskLevel === "critical" 
                      ? "bg-red-500/10 border-red-500/30" 
                      : "bg-muted/30 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(clause.riskLevel)}>
                        {clause.riskLevel.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{clause.clause}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{clause.section}</span>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm">{clause.issue}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">{clause.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Oportunidades de Negociação
            </CardTitle>
            <Badge variant="default">${opportunities.reduce((sum, o) => sum + o.savings, 0).toLocaleString()}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <div key={opp.id} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{opp.area}</span>
                    <span className="text-lg font-bold text-green-400">
                      +${opp.savings.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="p-2 rounded bg-red-500/10">
                      <p className="text-xs text-muted-foreground mb-1">Atual</p>
                      <p className="font-medium text-sm">{opp.currentValue}</p>
                    </div>
                    <div className="p-2 rounded bg-green-500/10">
                      <p className="text-xs text-muted-foreground mb-1">Proposto</p>
                      <p className="font-medium text-sm">{opp.proposedValue}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Confiança IA</span>
                      <span>{opp.confidence}%</span>
                    </div>
                    <Progress value={opp.confidence} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Summary */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Resumo da Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">Tempo de Análise</p>
              <p className="text-2xl font-bold">3.2s</p>
              <p className="text-xs text-muted-foreground mt-1">47 páginas processadas</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">Entidades Extraídas</p>
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs text-muted-foreground mt-1">Datas, valores, partes</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">Score de Risco</p>
              <p className="text-2xl font-bold text-orange-400">67/100</p>
              <p className="text-xs text-muted-foreground mt-1">Risco moderado-alto</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
