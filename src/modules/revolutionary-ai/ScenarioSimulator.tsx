/**
import { useMemo, useState, useCallback } from "react";;
 * REVOLUTIONARY AI - Scenario Simulator
 * Funcionalidade 7: Simulador de Impacto Financeiro e Operacional
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calculator, TrendingUp, TrendingDown, AlertTriangle,
  DollarSign, Clock, Shield, Activity, Play, RefreshCw,
  Lightbulb, BarChart3, Target, Zap
} from "lucide-react";
import { motion } from "framer-motion";

interface ScenarioResult {
  cost: number;
  risk: number;
  compliance: number;
  operationalImpact: number;
  timeImpact: number;
  recommendation: string;
}

interface ScenarioInput {
  delayMaintenanceDays: number;
  crewReduction: number;
  fuelCostChange: number;
  routeAlternative: boolean;
  equipmentAge: number;
}

const INITIAL_SCENARIO: ScenarioInput = {
  delayMaintenanceDays: 0,
  crewReduction: 0,
  fuelCostChange: 0,
  routeAlternative: false,
  equipmentAge: 5
};

export const ScenarioSimulator = memo(function() {
  const [scenario, setScenario] = useState<ScenarioInput>(INITIAL_SCENARIO);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const simulationResult = useMemo<ScenarioResult>(() => {
    // Simulate complex calculations based on inputs
    let baseCost = 100000; // Base monthly operational cost
    let baseRisk = 5; // Base risk score (0-100)
    let baseCompliance = 95; // Base compliance score
    let baseOperational = 90; // Base operational efficiency
    let baseTime = 0; // Additional time in hours

    // Maintenance delay impact
    if (scenario.delayMaintenanceDays > 0) {
      baseCost -= scenario.delayMaintenanceDays * 500; // Short-term savings
      baseRisk += scenario.delayMaintenanceDays * 3; // Risk increases
      baseCompliance -= scenario.delayMaintenanceDays * 1.5;
      baseOperational -= scenario.delayMaintenanceDays * 2;
      
      // Long-term cost increase due to potential failures
      if (scenario.delayMaintenanceDays > 14) {
        baseCost += scenario.delayMaintenanceDays * 2000; // Major failure risk
      }
    }

    // Crew reduction impact
    if (scenario.crewReduction > 0) {
      baseCost -= scenario.crewReduction * 8000; // Salary savings
      baseRisk += scenario.crewReduction * 5;
      baseCompliance -= scenario.crewReduction * 3;
      baseOperational -= scenario.crewReduction * 4;
      baseTime += scenario.crewReduction * 2; // Extra hours needed
    }

    // Fuel cost change
    baseCost += baseCost * (scenario.fuelCostChange / 100) * 0.3; // Fuel is ~30% of costs

    // Route alternative
    if (scenario.routeAlternative) {
      baseCost -= baseCost * 0.12; // 12% fuel savings
      baseTime += 8; // 8 hours additional travel
      baseCompliance -= 2; // Slightly less optimal
    }

    // Equipment age factor
    const ageMultiplier = 1 + (scenario.equipmentAge - 5) * 0.05;
    baseRisk = Math.min(100, baseRisk * ageMultiplier);
    baseOperational = Math.max(0, baseOperational - (scenario.equipmentAge - 5) * 2);

    // Determine recommendation
    let recommendation = "";
    if (baseRisk > 50) {
      recommendation = "⚠️ ALTO RISCO: Cenário não recomendado. Risco de falha operacional significativo.";
    } else if (baseRisk > 30) {
      recommendation = "⚡ ATENÇÃO: Cenário viável com ressalvas. Monitoramento intensivo necessário.";
    } else if (baseCost < 95000 && baseCompliance > 90) {
      recommendation = "✅ RECOMENDADO: Cenário otimizado com bom equilíbrio custo-benefício.";
    } else {
      recommendation = "📊 NEUTRO: Cenário viável. Avalie trade-offs antes de implementar.";
    }

    return {
      cost: Math.round(baseCost),
      risk: Math.min(100, Math.max(0, Math.round(baseRisk))),
      compliance: Math.min(100, Math.max(0, Math.round(baseCompliance))),
      operationalImpact: Math.min(100, Math.max(0, Math.round(baseOperational))),
      timeImpact: Math.round(baseTime),
      recommendation
    };
  }, [scenario]);

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setShowResults(true);
    }, 1500);
  });

  const resetScenario = () => {
    setScenario(INITIAL_SCENARIO);
    setShowResults(false);
  });

  const getScoreColor = (score: number, inverse: boolean = false) => {
    if (inverse) {
      if (score < 20) return "text-green-400";
      if (score < 40) return "text-amber-400";
      return "text-red-400";
    }
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/20">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Simulador de Cenários</h2>
              <p className="text-muted-foreground">
                Teste hipóteses e veja o impacto em custo, risco e compliance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              Parâmetros do Cenário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Delay Maintenance */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Atrasar Manutenção
                </Label>
                <Badge variant="outline">{scenario.delayMaintenanceDays} dias</Badge>
              </div>
              <Slider
                value={[scenario.delayMaintenanceDays]}
                onValueChange={([v]) => setScenario(s => ({ ...s, delayMaintenanceDays: v }))}
                max={30}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Simule o impacto de adiar manutenções preventivas
              </p>
            </div>

            {/* Crew Reduction */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Reduzir Tripulação
                </Label>
                <Badge variant="outline">{scenario.crewReduction} pessoas</Badge>
              </div>
              <Slider
                value={[scenario.crewReduction]}
                onValueChange={([v]) => setScenario(s => ({ ...s, crewReduction: v }))}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Impacto de operar com tripulação reduzida
              </p>
            </div>

            {/* Fuel Cost Change */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Variação do Combustível
                </Label>
                <Badge variant="outline">{scenario.fuelCostChange > 0 ? "+" : ""}{scenario.fuelCostChange}%</Badge>
              </div>
              <Slider
                value={[scenario.fuelCostChange + 50]}
                onValueChange={([v]) => setScenario(s => ({ ...s, fuelCostChange: v - 50 }))}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Simule variações no preço do combustível (-50% a +50%)
              </p>
            </div>

            {/* Equipment Age */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  Idade do Equipamento
                </Label>
                <Badge variant="outline">{scenario.equipmentAge} anos</Badge>
              </div>
              <Slider
                value={[scenario.equipmentAge]}
                onValueChange={([v]) => setScenario(s => ({ ...s, equipmentAge: v }))}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Idade média dos equipamentos principais
              </p>
            </div>

            {/* Route Alternative Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <Label className="font-medium">Usar Rota Alternativa</Label>
                <p className="text-xs text-muted-foreground">
                  Rota mais longa, mas com economia de combustível
                </p>
              </div>
              <Button
                variant={scenario.routeAlternative ? "default" : "outline"}
                size="sm"
                onClick={handleSetScenario}
              >
                {scenario.routeAlternative ? "Ativado" : "Desativado"}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1" 
                onClick={runSimulation}
                disabled={isSimulating}
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Simulando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Simular Cenário
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetScenario}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="space-y-4">
          {showResults ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Cost Card */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-8 w-8 text-blue-400" />
                      <div>
                        <p className="text-sm text-muted-foreground">Custo Estimado</p>
                        <p className="text-3xl font-bold text-blue-400">
                          R$ {simulationResult.cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {simulationResult.cost < 100000 ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Economia
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Acima
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Risco</span>
                    </div>
                    <p className={`text-3xl font-bold ${getScoreColor(simulationResult.risk, true)}`}>
                      {simulationResult.risk}%
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full ${
                          simulationResult.risk < 20 ? "bg-green-500" :
                            simulationResult.risk < 40 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${simulationResult.risk}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Compliance</span>
                    </div>
                    <p className={`text-3xl font-bold ${getScoreColor(simulationResult.compliance)}`}>
                      {simulationResult.compliance}%
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full ${
                          simulationResult.compliance >= 80 ? "bg-green-500" :
                            simulationResult.compliance >= 60 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${simulationResult.compliance}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Eficiência</span>
                    </div>
                    <p className={`text-3xl font-bold ${getScoreColor(simulationResult.operationalImpact)}`}>
                      {simulationResult.operationalImpact}%
                    </p>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className={`h-full ${
                          simulationResult.operationalImpact >= 80 ? "bg-green-500" :
                            simulationResult.operationalImpact >= 60 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${simulationResult.operationalImpact}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Tempo Extra</span>
                    </div>
                    <p className="text-3xl font-bold">
                      +{simulationResult.timeImpact}h
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      horas adicionais
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendation */}
              <Card className={`${
                simulationResult.risk > 50 ? "bg-red-500/10 border-red-500/20" :
                  simulationResult.risk > 30 ? "bg-amber-500/10 border-amber-500/20" :
                    "bg-green-500/10 border-green-500/20"
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Zap className={`h-6 w-6 ${
                      simulationResult.risk > 50 ? "text-red-400" :
                        simulationResult.risk > 30 ? "text-amber-400" :
                          "text-green-400"
                    }`} />
                    <div>
                      <p className="font-semibold mb-1">Recomendação da IA</p>
                      <p className="text-sm">{simulationResult.recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="p-12 text-center">
                <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Configure o Cenário</h3>
                <p className="text-sm text-muted-foreground">
                  Ajuste os parâmetros à esquerda e clique em "Simular Cenário" para ver os resultados.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScenarioSimulator;
