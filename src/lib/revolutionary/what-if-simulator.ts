/**
 * 🧠 What-If Simulator - AI-Powered Scenario Planning
 * PATCH REVOLUTION v2.3
 * 
 * Simulação de cenários com IA - "E se o combustível subir 20%?"
 * NOTE: Uses in-memory storage pending DB types regeneration
 */

import { logger } from "@/lib/logger";

export interface ScenarioParameter {
  id: string;
  name: string;
  type: 'percentage' | 'absolute' | 'boolean' | 'select';
  category: ParameterCategory;
  currentValue: number | boolean | string;
  simulatedValue: number | boolean | string;
  unit?: string;
  min?: number;
  max?: number;
  options?: string[];
}

export type ParameterCategory = 'fuel' | 'crew' | 'maintenance' | 'market' | 'weather' | 'regulatory' | 'operational';

export interface ScenarioResult {
  id: string;
  scenarioName: string;
  parameters: ScenarioParameter[];
  impacts: ScenarioImpact[];
  recommendations: string[];
  riskScore: number;
  confidenceLevel: number;
  projectedSavings?: number;
  projectedCosts?: number;
  timeHorizon: string;
  generatedAt: Date;
}

export interface ScenarioImpact {
  area: string;
  metric: string;
  currentValue: number;
  projectedValue: number;
  changePercent: number;
  severity: 'positive' | 'neutral' | 'negative' | 'critical';
  explanation: string;
}

export interface SavedScenario {
  id: string;
  name: string;
  description: string;
  parameters: ScenarioParameter[];
  createdBy: string;
  createdAt: Date;
  isTemplate: boolean;
}

const simulationsStore: ScenarioResult[] = [];
const savedScenariosStore: SavedScenario[] = [
  { id: 'tpl-1', name: 'Crise de Combustível', description: 'Aumento de 30% no preço', parameters: [], createdBy: 'system', createdAt: new Date(), isTemplate: true },
  { id: 'tpl-2', name: 'Taxa de Carbono', description: 'Nova taxa de $100/ton', parameters: [], createdBy: 'system', createdAt: new Date(), isTemplate: true },
];

const DEFAULT_PARAMETERS: ScenarioParameter[] = [
  { id: 'fuel_price', name: 'Preço do Combustível', type: 'percentage', category: 'fuel', currentValue: 0, simulatedValue: 0, unit: '%', min: -50, max: 100 },
  { id: 'crew_size', name: 'Tamanho da Tripulação', type: 'percentage', category: 'crew', currentValue: 0, simulatedValue: 0, unit: '%', min: -20, max: 30 },
  { id: 'charter_rates', name: 'Taxas de Afretamento', type: 'percentage', category: 'market', currentValue: 0, simulatedValue: 0, unit: '%', min: -40, max: 60 },
  { id: 'carbon_tax', name: 'Taxa de Carbono', type: 'absolute', category: 'regulatory', currentValue: 0, simulatedValue: 0, unit: 'USD/ton', min: 0, max: 200 },
  { id: 'vessel_utilization', name: 'Utilização da Embarcação', type: 'percentage', category: 'operational', currentValue: 85, simulatedValue: 85, unit: '%', min: 50, max: 100 },
];

class WhatIfSimulator {
  getDefaultParameters(): ScenarioParameter[] {
    return JSON.parse(JSON.stringify(DEFAULT_PARAMETERS));
  }

  async runSimulation(scenarioName: string, parameters: ScenarioParameter[], timeHorizon: '1m' | '3m' | '6m' | '1y' | '3y' = '1y'): Promise<ScenarioResult> {
    const impacts = this.calculateImpacts(parameters, timeHorizon);
    const recommendations = this.generateRecommendations(parameters, impacts);
    const riskScore = this.calculateRiskScore(impacts);
    const { savings, costs } = this.calculateFinancials(impacts, timeHorizon);
    
    const result: ScenarioResult = {
      id: crypto.randomUUID(), scenarioName, parameters, impacts, recommendations, riskScore,
      confidenceLevel: this.calculateConfidence(parameters),
      projectedSavings: savings, projectedCosts: costs,
      timeHorizon: this.getTimeHorizonLabel(timeHorizon), generatedAt: new Date(),
    };

    simulationsStore.push(result);
    if (simulationsStore.length > 100) simulationsStore.shift();
    
    logger.info('Simulation completed', { scenarioName, impactCount: impacts.length });
    return result;
  }

  private calculateImpacts(parameters: ScenarioParameter[], timeHorizon: string): ScenarioImpact[] {
    const impacts: ScenarioImpact[] = [];
    const timeMultiplier = this.getTimeMultiplier(timeHorizon);
    const changedParams = parameters.filter(p => p.simulatedValue !== p.currentValue);

    for (const param of changedParams) {
      const change = typeof param.simulatedValue === 'number' && typeof param.currentValue === 'number' 
        ? param.simulatedValue - param.currentValue : 0;

      if (param.id === 'fuel_price') {
        impacts.push({ area: 'Custos Operacionais', metric: 'OPEX Combustível', currentValue: 1000000,
          projectedValue: 1000000 * (1 + (change / 100) * 0.35), changePercent: change * 0.35,
          severity: change > 15 ? 'critical' : change > 5 ? 'negative' : 'neutral',
          explanation: `Aumento de ${change}% no preço do combustível` });
      }
      if (param.id === 'charter_rates') {
        impacts.push({ area: 'Receita', metric: 'Receita de Afretamento', currentValue: 5000000,
          projectedValue: 5000000 * (1 + change / 100) * timeMultiplier, changePercent: change,
          severity: change > 10 ? 'positive' : change < -10 ? 'critical' : 'neutral',
          explanation: 'Impacto direto na receita principal' });
      }
      if (param.id === 'carbon_tax') {
        const carbonCost = (param.simulatedValue as number) * 1000;
        impacts.push({ area: 'Custos Regulatórios', metric: 'Taxa de Carbono', 
          currentValue: (param.currentValue as number) * 1000, projectedValue: carbonCost,
          changePercent: param.currentValue ? ((carbonCost / ((param.currentValue as number) * 1000)) - 1) * 100 : 100,
          severity: (param.simulatedValue as number) > 50 ? 'critical' : 'neutral',
          explanation: `Nova taxa de carbono de $${param.simulatedValue}/ton` });
      }
    }
    return impacts;
  }

  private generateRecommendations(parameters: ScenarioParameter[], impacts: ScenarioImpact[]): string[] {
    const recommendations: string[] = [];
    const fuelChange = parameters.find(p => p.id === 'fuel_price');
    if (fuelChange && (fuelChange.simulatedValue as number) > 10) {
      recommendations.push('Renegociar contratos de combustível com hedge de preço');
      recommendations.push('Otimizar rotas para reduzir consumo');
    }
    const criticalImpacts = impacts.filter(i => i.severity === 'critical');
    if (criticalImpacts.length > 0) {
      recommendations.push('⚠️ AÇÃO URGENTE: Cenário apresenta riscos críticos');
    }
    return recommendations.length > 0 ? recommendations : ['Cenário apresenta impacto moderado'];
  }

  private calculateRiskScore(impacts: ScenarioImpact[]): number {
    if (impacts.length === 0) return 0;
    const weights = { positive: -10, neutral: 0, negative: 25, critical: 50 };
    const rawScore = impacts.reduce((sum, i) => sum + weights[i.severity] + Math.abs(i.changePercent) * 0.5, 0);
    return Math.min(100, Math.max(0, rawScore / impacts.length * 2));
  }

  private calculateConfidence(parameters: ScenarioParameter[]): number {
    const changedParams = parameters.filter(p => p.simulatedValue !== p.currentValue);
    let confidence = 85 - changedParams.length * 3;
    return Math.min(95, Math.max(40, confidence));
  }

  private calculateFinancials(impacts: ScenarioImpact[], timeHorizon: string): { savings: number; costs: number } {
    let savings = 0, costs = 0;
    impacts.forEach(i => {
      const diff = i.projectedValue - i.currentValue;
      if (i.severity === 'positive' || i.area === 'Receita') { if (diff > 0) savings += diff; }
      else { if (diff > 0) costs += diff; else savings += Math.abs(diff); }
    });
    const multiplier = this.getTimeMultiplier(timeHorizon);
    return { savings: Math.round(savings * multiplier), costs: Math.round(costs * multiplier) };
  }

  private getTimeMultiplier(h: string): number {
    return { '1m': 1/12, '3m': 0.25, '6m': 0.5, '1y': 1, '3y': 3 }[h] || 1;
  }

  private getTimeHorizonLabel(h: string): string {
    return { '1m': '1 mês', '3m': '3 meses', '6m': '6 meses', '1y': '1 ano', '3y': '3 anos' }[h] || h;
  }

  async saveScenario(name: string, description: string, parameters: ScenarioParameter[], isTemplate = false): Promise<string> {
    const scenario: SavedScenario = { id: crypto.randomUUID(), name, description, parameters, createdBy: 'user', createdAt: new Date(), isTemplate };
    savedScenariosStore.push(scenario);
    return scenario.id;
  }

  async getSavedScenarios(): Promise<SavedScenario[]> {
    return [...savedScenariosStore].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getSimulationHistory(limit = 20): ScenarioResult[] {
    return simulationsStore.slice(-limit).reverse();
  }

  compareScenarios(scenarios: ScenarioResult[]) {
    const comparison = scenarios.map(s => ({ scenarioName: s.scenarioName, riskScore: s.riskScore, netFinancialImpact: (s.projectedSavings || 0) - (s.projectedCosts || 0) }));
    const sorted = [...scenarios].sort((a, b) => ((b.projectedSavings || 0) - (b.projectedCosts || 0)) - ((a.projectedSavings || 0) - (a.projectedCosts || 0)));
    return { bestCase: sorted[0], worstCase: sorted[sorted.length - 1], comparison: comparison.sort((a, b) => b.netFinancialImpact - a.netFinancialImpact) };
  }

  async deleteScenario(scenarioId: string): Promise<boolean> {
    const idx = savedScenariosStore.findIndex(s => s.id === scenarioId);
    if (idx >= 0) { savedScenariosStore.splice(idx, 1); return true; }
    return false;
  }
}

export const whatIfSimulator = new WhatIfSimulator();
