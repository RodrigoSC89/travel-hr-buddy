/**
 * 🧠 What-If Simulator - AI-Powered Scenario Planning
 * PATCH REVOLUTION v3.0 - Full DB Integration
 * 
 * Simulação de cenários com IA - "E se o combustível subir 20%?"
 * Uses: scenario_simulations, saved_scenarios tables
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import {
  scenarioSimulationsTable,
  savedScenariosTable,
  type ScenarioSimulationDB,
  type SavedScenarioDB,
} from "@/lib/supabase/dynamic-tables";

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

const DEFAULT_PARAMETERS: ScenarioParameter[] = [
  { id: 'fuel_price', name: 'Preço do Combustível', type: 'percentage', category: 'fuel', currentValue: 0, simulatedValue: 0, unit: '%', min: -50, max: 100 },
  { id: 'fuel_consumption', name: 'Consumo de Combustível', type: 'percentage', category: 'fuel', currentValue: 0, simulatedValue: 0, unit: '%', min: -30, max: 50 },
  { id: 'crew_size', name: 'Tamanho da Tripulação', type: 'percentage', category: 'crew', currentValue: 0, simulatedValue: 0, unit: '%', min: -20, max: 30 },
  { id: 'crew_salary', name: 'Custos Salariais', type: 'percentage', category: 'crew', currentValue: 0, simulatedValue: 0, unit: '%', min: -10, max: 30 },
  { id: 'charter_rates', name: 'Taxas de Afretamento', type: 'percentage', category: 'market', currentValue: 0, simulatedValue: 0, unit: '%', min: -40, max: 60 },
  { id: 'cargo_demand', name: 'Demanda de Carga', type: 'percentage', category: 'market', currentValue: 0, simulatedValue: 0, unit: '%', min: -50, max: 100 },
  { id: 'carbon_tax', name: 'Taxa de Carbono', type: 'absolute', category: 'regulatory', currentValue: 0, simulatedValue: 0, unit: 'USD/ton', min: 0, max: 200 },
  { id: 'vessel_utilization', name: 'Utilização da Embarcação', type: 'percentage', category: 'operational', currentValue: 85, simulatedValue: 85, unit: '%', min: 50, max: 100 },
  { id: 'maintenance_frequency', name: 'Frequência de Manutenção', type: 'percentage', category: 'maintenance', currentValue: 0, simulatedValue: 0, unit: '%', min: -30, max: 50 },
];

class WhatIfSimulator {
  
  private async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  private async getOrganizationId(): Promise<string | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;
      const { data } = await supabase
        .from('organization_users')
        .select('organization_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();
      return data?.organization_id || null;
    } catch {
      return null;
    }
  }

  getDefaultParameters(): ScenarioParameter[] {
    return JSON.parse(JSON.stringify(DEFAULT_PARAMETERS));
  }

  async runSimulation(scenarioName: string, parameters: ScenarioParameter[], timeHorizon: '1m' | '3m' | '6m' | '1y' | '3y' = '1y'): Promise<ScenarioResult> {
    const startTime = performance.now();
    
    const impacts = this.calculateImpacts(parameters, timeHorizon);
    const recommendations = this.generateRecommendations(parameters, impacts);
    const riskScore = this.calculateRiskScore(impacts);
    const { savings, costs } = this.calculateFinancials(impacts, timeHorizon);
    const executionTime = Math.round(performance.now() - startTime);
    
    const result: ScenarioResult = {
      id: crypto.randomUUID(),
      scenarioName,
      parameters,
      impacts,
      recommendations,
      riskScore,
      confidenceLevel: this.calculateConfidence(parameters),
      projectedSavings: savings,
      projectedCosts: costs,
      timeHorizon: this.getTimeHorizonLabel(timeHorizon),
      generatedAt: new Date(),
    };

    // Store simulation in database
    await this.logSimulation(result, executionTime);
    
    logger.info('Simulation completed', { scenarioName, impactCount: impacts.length, executionTime });
    return result;
  }

  private calculateImpacts(parameters: ScenarioParameter[], timeHorizon: string): ScenarioImpact[] {
    const impacts: ScenarioImpact[] = [];
    const timeMultiplier = this.getTimeMultiplier(timeHorizon);
    const changedParams = parameters.filter(p => p.simulatedValue !== p.currentValue);

    for (const param of changedParams) {
      const change = typeof param.simulatedValue === 'number' && typeof param.currentValue === 'number' 
        ? param.simulatedValue - param.currentValue : 0;

      switch (param.id) {
        case 'fuel_price':
          impacts.push({
            area: 'Custos Operacionais', metric: 'OPEX Combustível', currentValue: 1000000,
            projectedValue: 1000000 * (1 + (change / 100) * 0.35), changePercent: change * 0.35,
            severity: change > 15 ? 'critical' : change > 5 ? 'negative' : 'neutral',
            explanation: `Aumento de ${change}% no preço do combustível impacta ~35% do OPEX`
          });
          impacts.push({
            area: 'Margem de Lucro', metric: 'EBITDA', currentValue: 500000,
            projectedValue: 500000 * (1 - (change / 100) * 0.2), changePercent: -change * 0.2,
            severity: change > 10 ? 'negative' : 'neutral',
            explanation: 'Impacto direto na margem operacional'
          });
          break;

        case 'charter_rates':
          impacts.push({
            area: 'Receita', metric: 'Receita de Afretamento', currentValue: 5000000,
            projectedValue: 5000000 * (1 + change / 100) * timeMultiplier, changePercent: change,
            severity: change > 10 ? 'positive' : change < -10 ? 'critical' : 'neutral',
            explanation: 'Impacto direto na receita principal'
          });
          break;

        case 'crew_salary':
          impacts.push({
            area: 'Custos de Pessoal', metric: 'Folha de Pagamento', currentValue: 2000000,
            projectedValue: 2000000 * (1 + change / 100), changePercent: change,
            severity: change > 15 ? 'negative' : 'neutral',
            explanation: 'Ajuste nos custos de tripulação'
          });
          break;

        case 'carbon_tax':
          const carbonCost = (param.simulatedValue as number) * 1000;
          impacts.push({
            area: 'Custos Regulatórios', metric: 'Taxa de Carbono', 
            currentValue: (param.currentValue as number) * 1000,
            projectedValue: carbonCost,
            changePercent: param.currentValue ? ((carbonCost / ((param.currentValue as number) * 1000)) - 1) * 100 : 100,
            severity: (param.simulatedValue as number) > 50 ? 'critical' : (param.simulatedValue as number) > 25 ? 'negative' : 'neutral',
            explanation: `Nova taxa de carbono de $${param.simulatedValue}/ton`
          });
          break;

        case 'vessel_utilization':
          const utilizationChange = (param.simulatedValue as number) - (param.currentValue as number);
          impacts.push({
            area: 'Receita', metric: 'Receita por Utilização',
            currentValue: 5000000 * ((param.currentValue as number) / 100),
            projectedValue: 5000000 * ((param.simulatedValue as number) / 100),
            changePercent: utilizationChange,
            severity: utilizationChange > 5 ? 'positive' : utilizationChange < -5 ? 'negative' : 'neutral',
            explanation: 'Maior utilização gera mais receita'
          });
          break;

        case 'maintenance_frequency':
          impacts.push({
            area: 'Manutenção', metric: 'Custos de Manutenção', currentValue: 300000,
            projectedValue: 300000 * (1 + change / 100), changePercent: change,
            severity: change > 20 ? 'negative' : 'neutral',
            explanation: 'Manutenção mais frequente aumenta custos mas reduz falhas'
          });
          break;
      }
    }

    // Compound effect
    if (impacts.length > 2) {
      const avgChange = impacts.reduce((sum, i) => sum + Math.abs(i.changePercent), 0) / impacts.length;
      impacts.push({
        area: 'Efeito Composto', metric: 'Volatilidade Total',
        currentValue: 5, projectedValue: 5 + avgChange * 0.3, changePercent: avgChange * 0.3,
        severity: avgChange > 20 ? 'critical' : avgChange > 10 ? 'negative' : 'neutral',
        explanation: 'Múltiplas mudanças simultâneas aumentam incerteza'
      });
    }

    return impacts;
  }

  private generateRecommendations(parameters: ScenarioParameter[], impacts: ScenarioImpact[]): string[] {
    const recommendations: string[] = [];

    const fuelChange = parameters.find(p => p.id === 'fuel_price');
    if (fuelChange && (fuelChange.simulatedValue as number) > 10) {
      recommendations.push('Renegociar contratos de combustível com hedge de preço');
      recommendations.push('Otimizar rotas para reduzir consumo em 5-10%');
      recommendations.push('Implementar slow steaming em rotas não críticas');
    }

    const carbonTax = parameters.find(p => p.id === 'carbon_tax');
    if (carbonTax && (carbonTax.simulatedValue as number) > 50) {
      recommendations.push('Acelerar investimentos em tecnologias de baixo carbono');
      recommendations.push('Implementar monitoramento de emissões em tempo real');
    }

    const charterChange = parameters.find(p => p.id === 'charter_rates');
    if (charterChange && (charterChange.simulatedValue as number) < -20) {
      recommendations.push('Diversificar tipos de cargas e rotas');
      recommendations.push('Negociar contratos de longo prazo com desconto');
    }

    const criticalImpacts = impacts.filter(i => i.severity === 'critical');
    if (criticalImpacts.length > 0) {
      recommendations.unshift('⚠️ AÇÃO URGENTE: Cenário apresenta riscos críticos - desenvolver plano de contingência');
    }

    return recommendations.length > 0 ? recommendations : ['Cenário apresenta impacto moderado - manter monitoramento'];
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
    changedParams.forEach(p => {
      if (typeof p.simulatedValue === 'number' && typeof p.currentValue === 'number') {
        const change = Math.abs(p.simulatedValue - p.currentValue);
        if (change > 30) confidence -= 5;
        if (change > 50) confidence -= 10;
      }
    });
    return Math.min(95, Math.max(40, confidence));
  }

  private calculateFinancials(impacts: ScenarioImpact[], timeHorizon: string): { savings: number; costs: number } {
    let savings = 0, costs = 0;
    impacts.forEach(i => {
      const diff = i.projectedValue - i.currentValue;
      if (i.severity === 'positive' || i.area === 'Receita') {
        if (diff > 0) savings += diff;
      } else {
        if (diff > 0) costs += diff;
        else savings += Math.abs(diff);
      }
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

  private async logSimulation(result: ScenarioResult, executionTime: number): Promise<void> {
    try {
      const organizationId = await this.getOrganizationId();
      const userId = await this.getCurrentUserId();
      
      const { error } = await scenarioSimulationsTable.insert({
        organization_id: organizationId,
        user_id: userId,
        scenario_name: result.scenarioName,
        parameters: result.parameters as never,
        impacts: result.impacts as never,
        recommendations: result.recommendations as never,
        risk_score: result.riskScore,
        confidence_level: result.confidenceLevel,
        projected_savings: result.projectedSavings,
        projected_costs: result.projectedCosts,
        time_horizon: result.timeHorizon,
        execution_time_ms: executionTime,
      });
      
      if (error) logger.warn('Failed to log simulation', { error: error.message });
    } catch (error) {
      logger.warn('Failed to log simulation', { error });
    }
  }

  async saveScenario(name: string, description: string, parameters: ScenarioParameter[], isTemplate = false): Promise<string> {
    const organizationId = await this.getOrganizationId();
    const userId = await this.getCurrentUserId();
    
    const { data, error } = await savedScenariosTable.insertSingle({
      organization_id: organizationId,
      name,
      description,
      parameters: parameters as never,
      created_by: userId,
      is_template: isTemplate,
    });

    if (error) throw error;
    return data?.id || crypto.randomUUID();
  }

  async getSavedScenarios(): Promise<SavedScenario[]> {
    try {
      const { data, error } = await savedScenariosTable.select('*');
      if (error) throw error;
      
      return ((data || []) as SavedScenarioDB[]).map(s => ({
        id: s.id,
        name: s.name,
        description: s.description || '',
        parameters: (s.parameters as unknown as ScenarioParameter[]) || [],
        createdBy: s.created_by || '',
        createdAt: new Date(s.created_at),
        isTemplate: s.is_template || false,
      })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      logger.error('Failed to fetch saved scenarios', error as Error);
      return [];
    }
  }

  async getSimulationHistory(limit = 20): Promise<ScenarioResult[]> {
    try {
      const { data, error } = await scenarioSimulationsTable.select('*');
      if (error) throw error;
      
      return ((data || []) as ScenarioSimulationDB[])
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)
        .map(s => ({
          id: s.id,
          scenarioName: s.scenario_name,
          parameters: (s.parameters as unknown as ScenarioParameter[]) || [],
          impacts: (s.impacts as unknown as ScenarioImpact[]) || [],
          recommendations: (s.recommendations as unknown as string[]) || [],
          riskScore: s.risk_score || 0,
          confidenceLevel: s.confidence_level || 0,
          projectedSavings: s.projected_savings || 0,
          projectedCosts: s.projected_costs || 0,
          timeHorizon: s.time_horizon || '',
          generatedAt: new Date(s.created_at),
        }));
    } catch (error) {
      logger.error('Failed to fetch simulation history', error as Error);
      return [];
    }
  }

  compareScenarios(scenarios: ScenarioResult[]): {
    bestCase: ScenarioResult;
    worstCase: ScenarioResult;
    comparison: Array<{ scenarioName: string; riskScore: number; netFinancialImpact: number }>;
  } {
    const comparison = scenarios.map(s => ({
      scenarioName: s.scenarioName,
      riskScore: s.riskScore,
      netFinancialImpact: (s.projectedSavings || 0) - (s.projectedCosts || 0),
    }));

    const sorted = [...scenarios].sort((a, b) => {
      const netA = (a.projectedSavings || 0) - (a.projectedCosts || 0);
      const netB = (b.projectedSavings || 0) - (b.projectedCosts || 0);
      return netB - netA;
    });

    return {
      bestCase: sorted[0],
      worstCase: sorted[sorted.length - 1],
      comparison: comparison.sort((a, b) => b.netFinancialImpact - a.netFinancialImpact),
    };
  }

  async deleteScenario(scenarioId: string): Promise<boolean> {
    try {
      const { error } = await savedScenariosTable.delete(scenarioId);
      return !error;
    } catch {
      return false;
    }
  }
}

export const whatIfSimulator = new WhatIfSimulator();
