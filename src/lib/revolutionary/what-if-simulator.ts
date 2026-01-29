/**
 * 🧠 What-If Simulator - AI-Powered Scenario Planning
 * PATCH REVOLUTION v2.0
 * 
 * Simulação de cenários com IA
 * "E se o combustível subir 20%?"
 */

import { supabase } from "@/integrations/supabase/client";
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

export type ParameterCategory = 
  | 'fuel'
  | 'crew'
  | 'maintenance'
  | 'market'
  | 'weather'
  | 'regulatory'
  | 'operational';

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

// Default parameter templates
const DEFAULT_PARAMETERS: ScenarioParameter[] = [
  // Fuel
  {
    id: 'fuel_price',
    name: 'Preço do Combustível',
    type: 'percentage',
    category: 'fuel',
    currentValue: 0,
    simulatedValue: 0,
    unit: '%',
    min: -50,
    max: 100,
  },
  {
    id: 'fuel_consumption',
    name: 'Consumo de Combustível',
    type: 'percentage',
    category: 'fuel',
    currentValue: 0,
    simulatedValue: 0,
    unit: '%',
    min: -30,
    max: 50,
  },
  
  // Crew
  {
    id: 'crew_size',
    name: 'Tamanho da Tripulação',
    type: 'percentage',
    category: 'crew',
    currentValue: 0,
    simulatedValue: 0,
    unit: '%',
    min: -20,
    max: 30,
  },
  {
    id: 'crew_salary',
    name: 'Custos Salariais',
    type: 'percentage',
    category: 'crew',
    currentValue: 0,
    simulatedValue: 0,
    unit: '%',
    min: -10,
    max: 30,
  },
  {
    id: 'crew_turnover',
    name: 'Rotatividade de Tripulação',
    type: 'percentage',
    category: 'crew',
    currentValue: 0,
    simulatedValue: 0,
    unit: '%',
    min: -50,
    max: 100,
  },
  
  // Maintenance
  {
    id: 'maintenance_frequency',
    name: 'Frequência de Manutenção',
    type: 'percentage',
    category: 'maintenance',
    currentValue: 0,
    simulatedValue: 0,
    unit: '%',
    min: -30,
    max: 50,
  },
  {
    id: 'equipment_age',
    name: 'Idade Média dos Equipamentos',
    type: 'absolute',
    category: 'maintenance',
    currentValue: 5,
    simulatedValue: 5,
    unit: 'anos',
    min: 1,
    max: 20,
  },
  
  // Market
  {
    id: 'charter_rates',
    name: 'Taxas de Afretamento',
    type: 'percentage',
    category: 'market',
    currentValue: 0,
    simulatedValue: 0,
    unit: '%',
    min: -40,
    max: 60,
  },
  {
    id: 'cargo_demand',
    name: 'Demanda de Carga',
    type: 'percentage',
    category: 'market',
    currentValue: 0,
    simulatedValue: 0,
    unit: '%',
    min: -50,
    max: 100,
  },
  
  // Weather
  {
    id: 'severe_weather_days',
    name: 'Dias de Clima Severo',
    type: 'absolute',
    category: 'weather',
    currentValue: 15,
    simulatedValue: 15,
    unit: 'dias/ano',
    min: 0,
    max: 100,
  },
  
  // Regulatory
  {
    id: 'emission_regulations',
    name: 'Rigor das Regulações de Emissões',
    type: 'select',
    category: 'regulatory',
    currentValue: 'moderate',
    simulatedValue: 'moderate',
    options: ['relaxed', 'moderate', 'strict', 'very_strict'],
  },
  {
    id: 'carbon_tax',
    name: 'Taxa de Carbono',
    type: 'absolute',
    category: 'regulatory',
    currentValue: 0,
    simulatedValue: 0,
    unit: 'USD/ton',
    min: 0,
    max: 200,
  },
  
  // Operational
  {
    id: 'port_delays',
    name: 'Atrasos em Portos',
    type: 'percentage',
    category: 'operational',
    currentValue: 0,
    simulatedValue: 0,
    unit: '%',
    min: -50,
    max: 100,
  },
  {
    id: 'vessel_utilization',
    name: 'Utilização da Embarcação',
    type: 'percentage',
    category: 'operational',
    currentValue: 85,
    simulatedValue: 85,
    unit: '%',
    min: 50,
    max: 100,
  },
];

class WhatIfSimulator {
  
  // Get default parameters
  getDefaultParameters(): ScenarioParameter[] {
    return JSON.parse(JSON.stringify(DEFAULT_PARAMETERS));
  }

  // Run simulation with given parameters
  async runSimulation(
    scenarioName: string,
    parameters: ScenarioParameter[],
    timeHorizon: '1m' | '3m' | '6m' | '1y' | '3y' = '1y'
  ): Promise<ScenarioResult> {
    const startTime = performance.now();
    
    try {
      // Calculate impacts based on parameter changes
      const impacts = this.calculateImpacts(parameters, timeHorizon);
      
      // Generate AI-powered recommendations
      const recommendations = await this.generateRecommendations(parameters, impacts);
      
      // Calculate overall risk score
      const riskScore = this.calculateRiskScore(impacts);
      
      // Calculate financial projections
      const { savings, costs } = this.calculateFinancials(impacts, timeHorizon);
      
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

      // Log simulation for analytics
      await this.logSimulation(result);

      logger.info('Simulation completed', {
        scenarioName,
        duration: performance.now() - startTime,
        impactCount: impacts.length,
      });

      return result;
    } catch (error) {
      logger.error('Simulation failed', error as Error);
      throw error;
    }
  }

  // Calculate impacts from parameter changes
  private calculateImpacts(
    parameters: ScenarioParameter[],
    timeHorizon: string
  ): ScenarioImpact[] {
    const impacts: ScenarioImpact[] = [];
    const timeMultiplier = this.getTimeMultiplier(timeHorizon);

    // Find changed parameters
    const changedParams = parameters.filter(p => p.simulatedValue !== p.currentValue);

    for (const param of changedParams) {
      const change = typeof param.simulatedValue === 'number' && typeof param.currentValue === 'number'
        ? param.simulatedValue - param.currentValue
        : 0;

      switch (param.id) {
        case 'fuel_price':
          impacts.push({
            area: 'Custos Operacionais',
            metric: 'OPEX Combustível',
            currentValue: 1000000,
            projectedValue: 1000000 * (1 + (change / 100) * 0.35),
            changePercent: change * 0.35,
            severity: change > 15 ? 'critical' : change > 5 ? 'negative' : 'neutral',
            explanation: `Aumento de ${change}% no preço do combustível impacta ~35% dos custos operacionais`,
          });
          impacts.push({
            area: 'Margem de Lucro',
            metric: 'EBITDA',
            currentValue: 500000,
            projectedValue: 500000 * (1 - (change / 100) * 0.2),
            changePercent: -change * 0.2,
            severity: change > 10 ? 'negative' : 'neutral',
            explanation: 'Impacto direto na margem operacional',
          });
          break;

        case 'crew_size':
          impacts.push({
            area: 'Custos de Pessoal',
            metric: 'Folha de Pagamento',
            currentValue: 2000000,
            projectedValue: 2000000 * (1 + change / 100),
            changePercent: change,
            severity: change > 10 ? 'negative' : change < -10 ? 'positive' : 'neutral',
            explanation: 'Ajuste proporcional nos custos de tripulação',
          });
          impacts.push({
            area: 'Operacional',
            metric: 'Eficiência Operacional',
            currentValue: 92,
            projectedValue: Math.min(100, 92 + change * 0.3),
            changePercent: change * 0.3,
            severity: change > 0 ? 'positive' : 'negative',
            explanation: 'Mais tripulantes aumentam redundância e eficiência',
          });
          break;

        case 'charter_rates':
          impacts.push({
            area: 'Receita',
            metric: 'Receita de Afretamento',
            currentValue: 5000000,
            projectedValue: 5000000 * (1 + change / 100) * timeMultiplier,
            changePercent: change,
            severity: change > 10 ? 'positive' : change < -10 ? 'critical' : 'neutral',
            explanation: 'Impacto direto na receita principal',
          });
          break;

        case 'maintenance_frequency':
          impacts.push({
            area: 'Manutenção',
            metric: 'Custos de Manutenção',
            currentValue: 300000,
            projectedValue: 300000 * (1 + change / 100),
            changePercent: change,
            severity: change > 20 ? 'negative' : 'neutral',
            explanation: 'Manutenção mais frequente aumenta custos mas reduz falhas',
          });
          impacts.push({
            area: 'Disponibilidade',
            metric: 'Uptime da Embarcação',
            currentValue: 95,
            projectedValue: Math.min(99, 95 + change * 0.1),
            changePercent: change * 0.1,
            severity: 'positive',
            explanation: 'Manutenção preventiva melhora disponibilidade',
          });
          break;

        case 'carbon_tax':
          const carbonCost = (param.simulatedValue as number) * 1000; // Estimated annual tons
          impacts.push({
            area: 'Custos Regulatórios',
            metric: 'Taxa de Carbono',
            currentValue: (param.currentValue as number) * 1000,
            projectedValue: carbonCost,
            changePercent: param.currentValue ? ((carbonCost / ((param.currentValue as number) * 1000)) - 1) * 100 : 100,
            severity: (param.simulatedValue as number) > 50 ? 'critical' : (param.simulatedValue as number) > 25 ? 'negative' : 'neutral',
            explanation: `Nova taxa de carbono de $${param.simulatedValue}/ton`,
          });
          break;

        case 'vessel_utilization':
          const utilizationChange = (param.simulatedValue as number) - (param.currentValue as number);
          impacts.push({
            area: 'Receita',
            metric: 'Receita por Utilização',
            currentValue: 5000000 * ((param.currentValue as number) / 100),
            projectedValue: 5000000 * ((param.simulatedValue as number) / 100),
            changePercent: utilizationChange,
            severity: utilizationChange > 5 ? 'positive' : utilizationChange < -5 ? 'negative' : 'neutral',
            explanation: 'Maior utilização gera mais receita',
          });
          break;
      }
    }

    // Add compound effects
    if (impacts.length > 2) {
      const avgChange = impacts.reduce((sum, i) => sum + Math.abs(i.changePercent), 0) / impacts.length;
      impacts.push({
        area: 'Efeito Composto',
        metric: 'Volatilidade Total',
        currentValue: 5,
        projectedValue: 5 + avgChange * 0.3,
        changePercent: avgChange * 0.3,
        severity: avgChange > 20 ? 'critical' : avgChange > 10 ? 'negative' : 'neutral',
        explanation: 'Múltiplas mudanças simultâneas aumentam incerteza',
      });
    }

    return impacts;
  }

  // Generate AI recommendations
  private async generateRecommendations(
    parameters: ScenarioParameter[],
    impacts: ScenarioImpact[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Fuel-related recommendations
    const fuelPriceChange = parameters.find(p => p.id === 'fuel_price');
    if (fuelPriceChange && (fuelPriceChange.simulatedValue as number) > 10) {
      recommendations.push('Considere renegociar contratos de fornecimento de combustível com hedge de preço');
      recommendations.push('Avalie otimização de rotas para reduzir consumo em 5-10%');
      recommendations.push('Implemente slow steaming em rotas não críticas');
    }

    // Crew recommendations
    const crewChange = parameters.find(p => p.id === 'crew_salary');
    if (crewChange && (crewChange.simulatedValue as number) > 15) {
      recommendations.push('Revise a estrutura de benefícios não-monetários para reter talentos');
      recommendations.push('Considere programas de capacitação interna para reduzir dependência de contratações');
    }

    // Market recommendations
    const charterChange = parameters.find(p => p.id === 'charter_rates');
    if (charterChange && (charterChange.simulatedValue as number) < -20) {
      recommendations.push('Diversifique tipos de cargas e rotas para reduzir exposição ao mercado spot');
      recommendations.push('Negocie contratos de longo prazo com desconto para garantir receita');
    }

    // Regulatory recommendations
    const carbonTax = parameters.find(p => p.id === 'carbon_tax');
    if (carbonTax && (carbonTax.simulatedValue as number) > 50) {
      recommendations.push('Acelere investimentos em tecnologias de baixo carbono (scrubbers, LNG)');
      recommendations.push('Implemente sistema de monitoramento de emissões em tempo real');
      recommendations.push('Explore créditos de carbono e certificações de sustentabilidade');
    }

    // Critical impact recommendations
    const criticalImpacts = impacts.filter(i => i.severity === 'critical');
    if (criticalImpacts.length > 0) {
      recommendations.push('⚠️ AÇÃO URGENTE: Cenário apresenta riscos críticos - desenvolva plano de contingência');
    }

    // General recommendations
    if (impacts.some(i => i.area === 'Efeito Composto' && i.changePercent > 15)) {
      recommendations.push('Considere implementar mudanças de forma gradual para reduzir volatilidade');
    }

    return recommendations.length > 0 ? recommendations : [
      'Cenário apresenta impacto moderado - mantenha monitoramento contínuo',
    ];
  }

  // Calculate overall risk score (0-100)
  private calculateRiskScore(impacts: ScenarioImpact[]): number {
    if (impacts.length === 0) return 0;

    const weights = {
      positive: -10,
      neutral: 0,
      negative: 25,
      critical: 50,
    };

    const rawScore = impacts.reduce((sum, impact) => {
      const severityScore = weights[impact.severity];
      const magnitudeScore = Math.abs(impact.changePercent) * 0.5;
      return sum + severityScore + magnitudeScore;
    }, 0);

    return Math.min(100, Math.max(0, rawScore / impacts.length * 2));
  }

  // Calculate confidence level based on parameter complexity
  private calculateConfidence(parameters: ScenarioParameter[]): number {
    const changedParams = parameters.filter(p => p.simulatedValue !== p.currentValue);
    
    // Base confidence
    let confidence = 85;
    
    // Reduce confidence for many simultaneous changes
    confidence -= changedParams.length * 3;
    
    // Reduce for extreme changes
    changedParams.forEach(p => {
      if (typeof p.simulatedValue === 'number' && typeof p.currentValue === 'number') {
        const change = Math.abs(p.simulatedValue - p.currentValue);
        if (change > 30) confidence -= 5;
        if (change > 50) confidence -= 10;
      }
    });

    return Math.min(95, Math.max(40, confidence));
  }

  // Calculate financial projections
  private calculateFinancials(
    impacts: ScenarioImpact[],
    timeHorizon: string
  ): { savings: number; costs: number } {
    let savings = 0;
    let costs = 0;

    impacts.forEach(impact => {
      const diff = impact.projectedValue - impact.currentValue;
      
      if (impact.area === 'Receita' || impact.severity === 'positive') {
        if (diff > 0) savings += diff;
      } else {
        if (diff > 0) costs += diff;
        else savings += Math.abs(diff);
      }
    });

    const multiplier = this.getTimeMultiplier(timeHorizon);
    
    return {
      savings: Math.round(savings * multiplier),
      costs: Math.round(costs * multiplier),
    };
  }

  // Get time multiplier for projections
  private getTimeMultiplier(timeHorizon: string): number {
    switch (timeHorizon) {
      case '1m': return 1 / 12;
      case '3m': return 3 / 12;
      case '6m': return 0.5;
      case '1y': return 1;
      case '3y': return 3;
      default: return 1;
    }
  }

  // Get time horizon label
  private getTimeHorizonLabel(timeHorizon: string): string {
    switch (timeHorizon) {
      case '1m': return '1 mês';
      case '3m': return '3 meses';
      case '6m': return '6 meses';
      case '1y': return '1 ano';
      case '3y': return '3 anos';
      default: return timeHorizon;
    }
  }

  // Log simulation for analytics
  private async logSimulation(result: ScenarioResult): Promise<void> {
    try {
      await supabase.from('scenario_simulations').insert({
        scenario_name: result.scenarioName,
        parameters: result.parameters,
        impacts: result.impacts,
        risk_score: result.riskScore,
        confidence_level: result.confidenceLevel,
        projected_savings: result.projectedSavings,
        projected_costs: result.projectedCosts,
        time_horizon: result.timeHorizon,
        created_at: result.generatedAt.toISOString(),
      });
    } catch (error) {
      // Non-critical error, just log
      logger.warn('Failed to log simulation', { error });
    }
  }

  // Save scenario as template
  async saveScenario(
    name: string,
    description: string,
    parameters: ScenarioParameter[],
    createdBy: string,
    isTemplate: boolean = false
  ): Promise<string> {
    const { data, error } = await supabase
      .from('saved_scenarios')
      .insert({
        name,
        description,
        parameters,
        created_by: createdBy,
        is_template: isTemplate,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  // Load saved scenarios
  async getSavedScenarios(userId: string): Promise<SavedScenario[]> {
    const { data } = await supabase
      .from('saved_scenarios')
      .select('*')
      .or(`created_by.eq.${userId},is_template.eq.true`)
      .order('created_at', { ascending: false });

    return (data || []).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      parameters: s.parameters,
      createdBy: s.created_by,
      createdAt: new Date(s.created_at),
      isTemplate: s.is_template,
    }));
  }

  // Compare multiple scenarios
  compareScenarios(scenarios: ScenarioResult[]): {
    bestCase: ScenarioResult;
    worstCase: ScenarioResult;
    comparison: Array<{
      scenarioName: string;
      riskScore: number;
      netFinancialImpact: number;
    }>;
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
}

export const whatIfSimulator = new WhatIfSimulator();
