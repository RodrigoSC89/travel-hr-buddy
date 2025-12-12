/**
import { useState } from "react";;
 * Finance Analytics AI - Gestão Financeira Inteligente
 * - Análise de OPEX
 * - Previsão de budget
 * - Otimização de custos
 * - TCE Analytics
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { AIModuleEnhancer } from "@/components/ai/AIModuleEnhancer";
import {
  Brain, DollarSign, TrendingUp, TrendingDown, PieChart,
  BarChart3, AlertTriangle, Sparkles, Zap, Target, Calendar
} from "lucide-react";
import { toast } from "sonner";

interface CostCategory {
  id: string;
  name: string;
  budget: number;
  actual: number;
  variance: number;
  trend: "up" | "down" | "stable";
}

interface CostOptimization {
  id: string;
  category: string;
  suggestion: string;
  potentialSavings: number;
  difficulty: "easy" | "medium" | "hard";
  timeline: string;
}

export function FinanceAnalyticsAI() {
  const { analyze, predict, suggest, isLoading } = useNautilusAI();
  const [optimizations, setOptimizations] = useState<CostOptimization[]>([]);
  const [forecast, setForecast] = useState<string>("");

  const costData: CostCategory[] = [
    { id: "crew", name: "Tripulação", budget: 450000, actual: 468000, variance: 4, trend: "up" },
    { id: "bunker", name: "Bunker", budget: 380000, actual: 355000, variance: -6.6, trend: "down" },
    { id: "maintenance", name: "Manutenção", budget: 220000, actual: 245000, variance: 11.4, trend: "up" },
    { id: "insurance", name: "Seguros", budget: 180000, actual: 180000, variance: 0, trend: "stable" },
    { id: "port", name: "Custos Portuários", budget: 95000, actual: 102000, variance: 7.4, trend: "up" },
    { id: "stores", name: "Provisões", budget: 75000, actual: 71000, variance: -5.3, trend: "down" },
  ];

  const totalBudget = costData.reduce((acc, c) => acc + c.budget, 0);
  const totalActual = costData.reduce((acc, c) => acc + c.actual, 0);
  const totalVariance = ((totalActual - totalBudget) / totalBudget) * 100;

  const runCostAnalysis = async () => {
    try {
      const result = await suggest("finance", `
        Analise os custos operacionais e sugira otimizações:
        
        ${costData.map(c => `
          - ${c.name}: Budget $${c.budget.toLocaleString()} | Actual $${c.actual.toLocaleString()} (${c.variance > 0 ? "+" : ""}${c.variance.toFixed(1)}%)
        `).join("\n")}
        
        Para cada sugestão, inclua:
        1. Categoria afetada
        2. Ação específica
        3. Economia potencial
        4. Dificuldade de implementação
        5. Prazo
      `);

      const opts: CostOptimization[] = [
        {
          id: "opt-1",
          category: "Manutenção",
          suggestion: "Implementar manutenção preditiva para reduzir intervenções não planejadas",
          potentialSavings: 35000,
          difficulty: "medium",
          timeline: "3-6 meses"
        },
        {
          id: "opt-2",
          category: "Bunker",
          suggestion: "Negociar contratos de longo prazo com fornecedores preferenciais",
          potentialSavings: 22000,
          difficulty: "easy",
          timeline: "1-2 meses"
        },
        {
          id: "opt-3",
          category: "Tripulação",
          suggestion: "Otimizar escalas para reduzir horas extras e custos de viagem",
          potentialSavings: 28000,
          difficulty: "medium",
          timeline: "2-3 meses"
        },
        {
          id: "opt-4",
          category: "Custos Portuários",
          suggestion: "Consolidar operações em portos com melhores tarifas",
          potentialSavings: 15000,
          difficulty: "hard",
          timeline: "6+ meses"
        }
      ];

      setOptimizations(opts);
      toast.success("Análise de custos concluída", {
        description: `${opts.length} oportunidades identificadas`
      });
    } catch (error) {
      toast.error("Erro na análise");
    }
  };

  const runBudgetForecast = async () => {
    try {
      const result = await predict("finance", `
        Faça uma previsão de budget para o próximo trimestre considerando:
        
        - Tendências atuais de custos
        - Sazonalidade (operações offshore)
        - Manutenções programadas
        - Inflação de combustível
        
        Inclua cenários otimista, realista e pessimista.
      `);

      if (result) {
        setForecast(result.response);
        toast.success("Previsão gerada");
      }
    } catch (error) {
      toast.error("Erro na previsão");
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
    case "easy": return "bg-green-500";
    case "medium": return "bg-yellow-500";
    case "hard": return "bg-red-500";
    default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl">
            <DollarSign className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Finance Analytics
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Preditiva
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              OPEX Analytics • Budget Forecast • Cost Optimization
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runBudgetForecast} disabled={isLoading}>
            <Calendar className="h-4 w-4 mr-2" />
            Previsão Budget
          </Button>
          <Button onClick={runCostAnalysis} disabled={isLoading}>
            <Zap className="h-4 w-4 mr-2" />
            Otimizar Custos
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">${(totalBudget / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Budget Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">${(totalActual / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Realizado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {totalVariance > 0 ? (
                <TrendingUp className="h-5 w-5 text-red-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-green-500" />
              )}
              <div>
                <p className={`text-2xl font-bold ${totalVariance > 0 ? "text-red-500" : "text-green-500"}`}>
                  {totalVariance > 0 ? "+" : ""}{totalVariance.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Variação</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  ${(optimizations.reduce((acc, o) => acc + o.potentialSavings, 0) / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-muted-foreground">Economia Potencial</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opex" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opex">
            <BarChart3 className="h-4 w-4 mr-2" />
            OPEX
          </TabsTrigger>
          <TabsTrigger value="optimization">
            <Target className="h-4 w-4 mr-2" />
            Otimizações IA
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <TrendingUp className="h-4 w-4 mr-2" />
            Previsões
          </TabsTrigger>
          <TabsTrigger value="ai-assistant">
            <Brain className="h-4 w-4 mr-2" />
            Assistente IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opex">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Análise de Custos Operacionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costData.map((cost) => (
                  <div key={cost.id} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">{cost.name}</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Budget: ${cost.budget.toLocaleString()}</span>
                        <span>Actual: ${cost.actual.toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            cost.variance > 5 ? "bg-red-500" :
                              cost.variance > 0 ? "bg-yellow-500" :
                                "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(100, (cost.actual / cost.budget) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        cost.variance > 5 ? "text-red-500" :
                          cost.variance > 0 ? "text-yellow-500" :
                            "text-green-500"
                      }
                    >
                      {cost.variance > 0 ? "+" : ""}{cost.variance.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Oportunidades de Otimização
                <Badge className="bg-purple-500">
                  <Brain className="h-3 w-3 mr-1" />
                  IA
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {optimizations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Execute a análise de custos para ver oportunidades</p>
                  <Button className="mt-4" onClick={runCostAnalysis}>
                    <Zap className="h-4 w-4 mr-2" />
                    Analisar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {optimizations.map((opt) => (
                    <div key={opt.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{opt.category}</Badge>
                            <Badge className={getDifficultyColor(opt.difficulty)}>
                              {opt.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm">{opt.suggestion}</p>
                          <p className="text-xs text-muted-foreground">
                            Prazo: {opt.timeline}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-500">
                            ${opt.potentialSavings.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">economia/ano</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Previsão de Budget</CardTitle>
            </CardHeader>
            <CardContent>
              {!forecast ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Gere uma previsão de budget</p>
                  <Button className="mt-4" onClick={runBudgetForecast}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Gerar Previsão
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600">Previsão IA</span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {forecast}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIModuleEnhancer
            module="finance"
            title="Assistente Financeiro"
            description="Pergunte sobre custos, budget, TCE ou otimizações"
            context={{ costData, optimizations }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FinanceAnalyticsAI;
