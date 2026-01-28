/**
 * Cash Flow Predictor AI Engine
 * Previsão de fluxo de caixa com cenários
 */

export interface CashFlowRecord {
  date: string;
  type: 'inflow' | 'outflow';
  category: string;
  amount: number;
  description: string;
  vessel_id?: string;
  recurring: boolean;
  payment_status: 'pending' | 'completed' | 'overdue';
}

export interface CashFlowForecast {
  organization_id: string;
  forecast_date: string;
  horizon_days: number;
  current_balance: number;
  forecasted_inflows: ForecastedTransaction[];
  forecasted_outflows: ForecastedTransaction[];
  daily_projections: DailyProjection[];
  weekly_summary: WeeklySummary[];
  monthly_summary: MonthlySummary[];
  risk_indicators: CashFlowRisk[];
  scenarios: CashFlowScenario[];
  recommendations: CashFlowRecommendation[];
}

export interface ForecastedTransaction {
  category: string;
  expected_date: string;
  expected_amount: number;
  confidence: number;
  basis: 'historical' | 'scheduled' | 'predicted';
  variance_range: { low: number; high: number };
}

export interface DailyProjection {
  date: string;
  opening_balance: number;
  inflows: number;
  outflows: number;
  net_change: number;
  closing_balance: number;
  confidence: number;
}

export interface WeeklySummary {
  week_start: string;
  week_end: string;
  total_inflows: number;
  total_outflows: number;
  net_position: number;
  average_daily_balance: number;
  minimum_balance: number;
  cash_burn_rate: number;
}

export interface MonthlySummary {
  month: string;
  projected_inflows: number;
  projected_outflows: number;
  projected_net: number;
  variance_from_budget: number;
  key_transactions: { description: string; amount: number }[];
}

export interface CashFlowRisk {
  risk_type: 'shortfall' | 'timing' | 'concentration' | 'volatility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_period: string;
  potential_impact: number;
  mitigation_actions: string[];
}

export interface CashFlowScenario {
  scenario_name: string;
  scenario_type: 'optimistic' | 'base' | 'pessimistic' | 'stress';
  probability: number;
  assumptions: ScenarioAssumption[];
  projected_balance_30d: number;
  projected_balance_60d: number;
  projected_balance_90d: number;
  key_drivers: string[];
}

export interface ScenarioAssumption {
  variable: string;
  base_value: number;
  scenario_value: number;
  change_percentage: number;
}

export interface CashFlowRecommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'collections' | 'payments' | 'financing' | 'operations';
  action: string;
  expected_impact: number;
  implementation_timeline: string;
  effort_level: 'low' | 'medium' | 'high';
}

class CashFlowPredictorEngine {
  private readonly CATEGORY_PATTERNS = {
    inflow: {
      charter_revenue: { seasonality: [1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.0, 0.9, 0.9, 1.0, 1.0, 1.0], payment_delay_days: 30 },
      freight_income: { seasonality: [0.9, 0.9, 1.0, 1.1, 1.1, 1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 0.9], payment_delay_days: 45 },
      insurance_claims: { seasonality: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], payment_delay_days: 60 },
      other_income: { seasonality: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], payment_delay_days: 15 }
    },
    outflow: {
      crew_wages: { seasonality: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], payment_day: 5 },
      bunker_fuel: { seasonality: [1.1, 1.0, 0.9, 0.9, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 1.0, 1.1], payment_day: 0 },
      maintenance: { seasonality: [0.8, 0.8, 1.2, 1.2, 1.0, 0.9, 0.8, 0.8, 1.1, 1.1, 1.0, 0.9], payment_day: 30 },
      insurance: { seasonality: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], payment_day: 1 },
      port_charges: { seasonality: [1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.0, 0.9, 0.9, 1.0, 1.0, 1.0], payment_day: 0 },
      supplies: { seasonality: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], payment_day: 15 }
    }
  };

  /**
   * Generate cash flow forecast
   */
  generateForecast(
    organizationId: string,
    historicalRecords: CashFlowRecord[],
    currentBalance: number,
    horizonDays: number = 90
  ): CashFlowForecast {
    // Calculate historical averages by category
    const categoryAverages = this.calculateCategoryAverages(historicalRecords);
    
    // Generate forecasted transactions
    const forecastedInflows = this.forecastInflows(categoryAverages, horizonDays);
    const forecastedOutflows = this.forecastOutflows(categoryAverages, horizonDays);
    
    // Generate daily projections
    const dailyProjections = this.generateDailyProjections(
      currentBalance,
      forecastedInflows,
      forecastedOutflows,
      horizonDays
    );
    
    // Generate summaries
    const weeklySummary = this.generateWeeklySummary(dailyProjections);
    const monthlySummary = this.generateMonthlySummary(dailyProjections, forecastedInflows, forecastedOutflows);
    
    // Identify risks
    const riskIndicators = this.identifyRisks(dailyProjections, currentBalance);
    
    // Generate scenarios
    const scenarios = this.generateScenarios(
      categoryAverages,
      currentBalance,
      horizonDays
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      riskIndicators,
      dailyProjections,
      currentBalance
    );

    return {
      organization_id: organizationId,
      forecast_date: new Date().toISOString(),
      horizon_days: horizonDays,
      current_balance: currentBalance,
      forecasted_inflows: forecastedInflows,
      forecasted_outflows: forecastedOutflows,
      daily_projections: dailyProjections,
      weekly_summary: weeklySummary,
      monthly_summary: monthlySummary,
      risk_indicators: riskIndicators,
      scenarios,
      recommendations
    };
  }

  /**
   * Run what-if scenario analysis
   */
  runScenarioAnalysis(
    forecast: CashFlowForecast,
    adjustments: { category: string; adjustment_percentage: number }[]
  ): CashFlowScenario {
    const assumptions: ScenarioAssumption[] = [];
    let adjustedInflows = [...forecast.forecasted_inflows];
    let adjustedOutflows = [...forecast.forecasted_outflows];

    adjustments.forEach(adj => {
      const inflowMatch = adjustedInflows.find(i => i.category === adj.category);
      const outflowMatch = adjustedOutflows.find(o => o.category === adj.category);

      if (inflowMatch) {
        const originalAmount = inflowMatch.expected_amount;
        inflowMatch.expected_amount *= (1 + adj.adjustment_percentage / 100);
        assumptions.push({
          variable: `${adj.category} (receita)`,
          base_value: originalAmount,
          scenario_value: inflowMatch.expected_amount,
          change_percentage: adj.adjustment_percentage
        });
      }

      if (outflowMatch) {
        const originalAmount = outflowMatch.expected_amount;
        outflowMatch.expected_amount *= (1 + adj.adjustment_percentage / 100);
        assumptions.push({
          variable: `${adj.category} (despesa)`,
          base_value: originalAmount,
          scenario_value: outflowMatch.expected_amount,
          change_percentage: adj.adjustment_percentage
        });
      }
    });

    // Recalculate projections
    const projections = this.generateDailyProjections(
      forecast.current_balance,
      adjustedInflows,
      adjustedOutflows,
      forecast.horizon_days
    );

    return {
      scenario_name: 'Cenário Personalizado',
      scenario_type: 'base',
      probability: 0.5,
      assumptions,
      projected_balance_30d: projections.find(p => this.getDaysDiff(p.date) === 30)?.closing_balance || 0,
      projected_balance_60d: projections.find(p => this.getDaysDiff(p.date) === 60)?.closing_balance || 0,
      projected_balance_90d: projections.find(p => this.getDaysDiff(p.date) === 90)?.closing_balance || 0,
      key_drivers: assumptions.map(a => `${a.variable}: ${a.change_percentage > 0 ? '+' : ''}${a.change_percentage}%`)
    };
  }

  /**
   * Calculate days until cash shortfall
   */
  calculateRunway(forecast: CashFlowForecast, minimumBalance: number = 0): {
    days_until_shortfall: number | null;
    shortfall_date: string | null;
    shortfall_amount: number | null;
  } {
    const shortfallDay = forecast.daily_projections.find(
      p => p.closing_balance < minimumBalance
    );

    if (!shortfallDay) {
      return {
        days_until_shortfall: null,
        shortfall_date: null,
        shortfall_amount: null
      };
    }

    return {
      days_until_shortfall: this.getDaysDiff(shortfallDay.date),
      shortfall_date: shortfallDay.date,
      shortfall_amount: minimumBalance - shortfallDay.closing_balance
    };
  }

  private calculateCategoryAverages(records: CashFlowRecord[]): Map<string, {
    type: 'inflow' | 'outflow';
    average_monthly: number;
    std_deviation: number;
    payment_pattern: number[];
  }> {
    const categoryData: Map<string, { type: 'inflow' | 'outflow'; amounts: number[]; dates: number[] }> = new Map();

    records.forEach(record => {
      if (!categoryData.has(record.category)) {
        categoryData.set(record.category, {
          type: record.type,
          amounts: [],
          dates: []
        });
      }
      const data = categoryData.get(record.category)!;
      data.amounts.push(record.amount);
      data.dates.push(new Date(record.date).getDate());
    });

    const averages = new Map<string, {
      type: 'inflow' | 'outflow';
      average_monthly: number;
      std_deviation: number;
      payment_pattern: number[];
    }>();

    categoryData.forEach((data, category) => {
      const avg = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
      const variance = data.amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / data.amounts.length;
      
      // Calculate payment pattern (which days of month)
      const dayFrequency = new Array(31).fill(0);
      data.dates.forEach(d => dayFrequency[d - 1]++);
      
      averages.set(category, {
        type: data.type,
        average_monthly: avg,
        std_deviation: Math.sqrt(variance),
        payment_pattern: dayFrequency
      });
    });

    return averages;
  }

  private forecastInflows(
    categoryAverages: Map<string, any>,
    horizonDays: number
  ): ForecastedTransaction[] {
    const forecasts: ForecastedTransaction[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();

    categoryAverages.forEach((data, category) => {
      if (data.type !== 'inflow') return;

      const pattern = this.CATEGORY_PATTERNS.inflow[category as keyof typeof this.CATEGORY_PATTERNS.inflow];
      const seasonality = pattern?.seasonality[currentMonth] || 1;
      const expectedAmount = data.average_monthly * seasonality;

      // Generate one forecast per month in horizon
      const months = Math.ceil(horizonDays / 30);
      for (let m = 0; m < months; m++) {
        const forecastDate = new Date(now);
        forecastDate.setMonth(forecastDate.getMonth() + m);
        forecastDate.setDate(15); // Mid-month approximation

        forecasts.push({
          category,
          expected_date: forecastDate.toISOString().split('T')[0],
          expected_amount: expectedAmount,
          confidence: Math.max(0.6, 0.9 - m * 0.1),
          basis: 'historical',
          variance_range: {
            low: expectedAmount * 0.8,
            high: expectedAmount * 1.2
          }
        });
      }
    });

    return forecasts.sort((a, b) => 
      new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime()
    );
  }

  private forecastOutflows(
    categoryAverages: Map<string, any>,
    horizonDays: number
  ): ForecastedTransaction[] {
    const forecasts: ForecastedTransaction[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();

    categoryAverages.forEach((data, category) => {
      if (data.type !== 'outflow') return;

      const pattern = this.CATEGORY_PATTERNS.outflow[category as keyof typeof this.CATEGORY_PATTERNS.outflow];
      const seasonality = pattern?.seasonality[currentMonth] || 1;
      const expectedAmount = data.average_monthly * seasonality;

      const months = Math.ceil(horizonDays / 30);
      for (let m = 0; m < months; m++) {
        const forecastDate = new Date(now);
        forecastDate.setMonth(forecastDate.getMonth() + m);
        forecastDate.setDate(pattern?.payment_day || 15);

        forecasts.push({
          category,
          expected_date: forecastDate.toISOString().split('T')[0],
          expected_amount: expectedAmount,
          confidence: Math.max(0.7, 0.95 - m * 0.08),
          basis: 'historical',
          variance_range: {
            low: expectedAmount * 0.9,
            high: expectedAmount * 1.15
          }
        });
      }
    });

    return forecasts.sort((a, b) => 
      new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime()
    );
  }

  private generateDailyProjections(
    currentBalance: number,
    inflows: ForecastedTransaction[],
    outflows: ForecastedTransaction[],
    horizonDays: number
  ): DailyProjection[] {
    const projections: DailyProjection[] = [];
    let balance = currentBalance;
    const now = new Date();

    for (let d = 0; d < horizonDays; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];

      const dayInflows = inflows
        .filter(i => i.expected_date === dateStr)
        .reduce((sum, i) => sum + i.expected_amount, 0);

      const dayOutflows = outflows
        .filter(o => o.expected_date === dateStr)
        .reduce((sum, o) => sum + o.expected_amount, 0);

      const netChange = dayInflows - dayOutflows;
      const openingBalance = balance;
      balance += netChange;

      projections.push({
        date: dateStr,
        opening_balance: openingBalance,
        inflows: dayInflows,
        outflows: dayOutflows,
        net_change: netChange,
        closing_balance: balance,
        confidence: Math.max(0.6, 0.95 - d * 0.003)
      });
    }

    return projections;
  }

  private generateWeeklySummary(projections: DailyProjection[]): WeeklySummary[] {
    const summaries: WeeklySummary[] = [];
    
    for (let i = 0; i < projections.length; i += 7) {
      const weekProjections = projections.slice(i, i + 7);
      if (weekProjections.length === 0) break;

      const totalInflows = weekProjections.reduce((sum, p) => sum + p.inflows, 0);
      const totalOutflows = weekProjections.reduce((sum, p) => sum + p.outflows, 0);
      const avgBalance = weekProjections.reduce((sum, p) => sum + p.closing_balance, 0) / weekProjections.length;
      const minBalance = Math.min(...weekProjections.map(p => p.closing_balance));

      summaries.push({
        week_start: weekProjections[0].date,
        week_end: weekProjections[weekProjections.length - 1].date,
        total_inflows: totalInflows,
        total_outflows: totalOutflows,
        net_position: totalInflows - totalOutflows,
        average_daily_balance: avgBalance,
        minimum_balance: minBalance,
        cash_burn_rate: totalOutflows / 7
      });
    }

    return summaries;
  }

  private generateMonthlySummary(
    projections: DailyProjection[],
    inflows: ForecastedTransaction[],
    outflows: ForecastedTransaction[]
  ): MonthlySummary[] {
    const monthlyData: Map<string, DailyProjection[]> = new Map();

    projections.forEach(p => {
      const month = p.date.slice(0, 7);
      if (!monthlyData.has(month)) {
        monthlyData.set(month, []);
      }
      monthlyData.get(month)!.push(p);
    });

    const summaries: MonthlySummary[] = [];

    monthlyData.forEach((days, month) => {
      const totalInflows = days.reduce((sum, d) => sum + d.inflows, 0);
      const totalOutflows = days.reduce((sum, d) => sum + d.outflows, 0);

      const keyInflows = inflows
        .filter(i => i.expected_date.startsWith(month))
        .map(i => ({ description: `Receita: ${i.category}`, amount: i.expected_amount }));
      
      const keyOutflows = outflows
        .filter(o => o.expected_date.startsWith(month))
        .map(o => ({ description: `Despesa: ${o.category}`, amount: -o.expected_amount }));

      summaries.push({
        month,
        projected_inflows: totalInflows,
        projected_outflows: totalOutflows,
        projected_net: totalInflows - totalOutflows,
        variance_from_budget: 0, // Would need budget data
        key_transactions: [...keyInflows, ...keyOutflows].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 5)
      });
    });

    return summaries;
  }

  private identifyRisks(
    projections: DailyProjection[],
    currentBalance: number
  ): CashFlowRisk[] {
    const risks: CashFlowRisk[] = [];

    // Check for shortfall
    const shortfallDays = projections.filter(p => p.closing_balance < 0);
    if (shortfallDays.length > 0) {
      risks.push({
        risk_type: 'shortfall',
        severity: 'critical',
        description: `Previsão de saldo negativo em ${shortfallDays.length} dia(s)`,
        affected_period: `${shortfallDays[0].date} a ${shortfallDays[shortfallDays.length - 1].date}`,
        potential_impact: Math.min(...shortfallDays.map(d => d.closing_balance)),
        mitigation_actions: [
          'Acelerar recebimentos pendentes',
          'Negociar prazos de pagamento',
          'Considerar linha de crédito'
        ]
      });
    }

    // Check for timing risk (large outflows before large inflows)
    const timingRisk = projections.some((p, i) => {
      if (i === 0) return false;
      const prevBalance = projections[i - 1].closing_balance;
      return p.outflows > currentBalance * 0.3 && p.inflows < p.outflows * 0.5;
    });

    if (timingRisk) {
      risks.push({
        risk_type: 'timing',
        severity: 'high',
        description: 'Descompasso entre grandes pagamentos e recebimentos',
        affected_period: 'Próximos 30 dias',
        potential_impact: currentBalance * 0.3,
        mitigation_actions: [
          'Renegociar datas de pagamento',
          'Antecipar recebíveis'
        ]
      });
    }

    // Check for volatility
    const balances = projections.map(p => p.closing_balance);
    const avgBalance = balances.reduce((a, b) => a + b, 0) / balances.length;
    const variance = balances.reduce((sum, b) => sum + Math.pow(b - avgBalance, 2), 0) / balances.length;
    const volatility = Math.sqrt(variance) / avgBalance;

    if (volatility > 0.3) {
      risks.push({
        risk_type: 'volatility',
        severity: 'medium',
        description: 'Alta volatilidade no fluxo de caixa',
        affected_period: 'Período completo',
        potential_impact: avgBalance * volatility,
        mitigation_actions: [
          'Diversificar fontes de receita',
          'Estabelecer reserva de emergência'
        ]
      });
    }

    return risks.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  private generateScenarios(
    categoryAverages: Map<string, any>,
    currentBalance: number,
    horizonDays: number
  ): CashFlowScenario[] {
    const scenarios: CashFlowScenario[] = [];

    // Base scenario
    const baseInflows = this.forecastInflows(categoryAverages, horizonDays);
    const baseOutflows = this.forecastOutflows(categoryAverages, horizonDays);
    const baseProjections = this.generateDailyProjections(currentBalance, baseInflows, baseOutflows, horizonDays);

    scenarios.push({
      scenario_name: 'Cenário Base',
      scenario_type: 'base',
      probability: 0.6,
      assumptions: [{ variable: 'Todas variáveis', base_value: 1, scenario_value: 1, change_percentage: 0 }],
      projected_balance_30d: baseProjections.find(p => this.getDaysDiff(p.date) === 30)?.closing_balance || currentBalance,
      projected_balance_60d: baseProjections.find(p => this.getDaysDiff(p.date) === 60)?.closing_balance || currentBalance,
      projected_balance_90d: baseProjections.find(p => this.getDaysDiff(p.date) === 90)?.closing_balance || currentBalance,
      key_drivers: ['Padrão histórico de receitas e despesas']
    });

    // Optimistic scenario (+15% inflows, -10% outflows)
    const optInflows = baseInflows.map(i => ({ ...i, expected_amount: i.expected_amount * 1.15 }));
    const optOutflows = baseOutflows.map(o => ({ ...o, expected_amount: o.expected_amount * 0.9 }));
    const optProjections = this.generateDailyProjections(currentBalance, optInflows, optOutflows, horizonDays);

    scenarios.push({
      scenario_name: 'Cenário Otimista',
      scenario_type: 'optimistic',
      probability: 0.2,
      assumptions: [
        { variable: 'Receitas', base_value: 1, scenario_value: 1.15, change_percentage: 15 },
        { variable: 'Despesas', base_value: 1, scenario_value: 0.9, change_percentage: -10 }
      ],
      projected_balance_30d: optProjections.find(p => this.getDaysDiff(p.date) === 30)?.closing_balance || currentBalance,
      projected_balance_60d: optProjections.find(p => this.getDaysDiff(p.date) === 60)?.closing_balance || currentBalance,
      projected_balance_90d: optProjections.find(p => this.getDaysDiff(p.date) === 90)?.closing_balance || currentBalance,
      key_drivers: ['Aumento de charter', 'Redução de custos operacionais']
    });

    // Pessimistic scenario (-20% inflows, +10% outflows)
    const pesInflows = baseInflows.map(i => ({ ...i, expected_amount: i.expected_amount * 0.8 }));
    const pesOutflows = baseOutflows.map(o => ({ ...o, expected_amount: o.expected_amount * 1.1 }));
    const pesProjections = this.generateDailyProjections(currentBalance, pesInflows, pesOutflows, horizonDays);

    scenarios.push({
      scenario_name: 'Cenário Pessimista',
      scenario_type: 'pessimistic',
      probability: 0.15,
      assumptions: [
        { variable: 'Receitas', base_value: 1, scenario_value: 0.8, change_percentage: -20 },
        { variable: 'Despesas', base_value: 1, scenario_value: 1.1, change_percentage: 10 }
      ],
      projected_balance_30d: pesProjections.find(p => this.getDaysDiff(p.date) === 30)?.closing_balance || currentBalance,
      projected_balance_60d: pesProjections.find(p => this.getDaysDiff(p.date) === 60)?.closing_balance || currentBalance,
      projected_balance_90d: pesProjections.find(p => this.getDaysDiff(p.date) === 90)?.closing_balance || currentBalance,
      key_drivers: ['Queda de demanda', 'Aumento de combustível']
    });

    // Stress scenario (-40% inflows, +20% outflows)
    const strInflows = baseInflows.map(i => ({ ...i, expected_amount: i.expected_amount * 0.6 }));
    const strOutflows = baseOutflows.map(o => ({ ...o, expected_amount: o.expected_amount * 1.2 }));
    const strProjections = this.generateDailyProjections(currentBalance, strInflows, strOutflows, horizonDays);

    scenarios.push({
      scenario_name: 'Cenário de Stress',
      scenario_type: 'stress',
      probability: 0.05,
      assumptions: [
        { variable: 'Receitas', base_value: 1, scenario_value: 0.6, change_percentage: -40 },
        { variable: 'Despesas', base_value: 1, scenario_value: 1.2, change_percentage: 20 }
      ],
      projected_balance_30d: strProjections.find(p => this.getDaysDiff(p.date) === 30)?.closing_balance || currentBalance,
      projected_balance_60d: strProjections.find(p => this.getDaysDiff(p.date) === 60)?.closing_balance || currentBalance,
      projected_balance_90d: strProjections.find(p => this.getDaysDiff(p.date) === 90)?.closing_balance || currentBalance,
      key_drivers: ['Crise de mercado', 'Custos extraordinários']
    });

    return scenarios;
  }

  private generateRecommendations(
    risks: CashFlowRisk[],
    projections: DailyProjection[],
    currentBalance: number
  ): CashFlowRecommendation[] {
    const recommendations: CashFlowRecommendation[] = [];

    // Based on risks
    risks.forEach(risk => {
      if (risk.risk_type === 'shortfall') {
        recommendations.push({
          priority: 'urgent',
          category: 'collections',
          action: 'Intensificar cobrança de recebíveis vencidos',
          expected_impact: Math.abs(risk.potential_impact) * 0.5,
          implementation_timeline: '7 dias',
          effort_level: 'medium'
        });
        recommendations.push({
          priority: 'urgent',
          category: 'financing',
          action: 'Avaliar linha de crédito rotativo',
          expected_impact: Math.abs(risk.potential_impact),
          implementation_timeline: '14 dias',
          effort_level: 'high'
        });
      }

      if (risk.risk_type === 'timing') {
        recommendations.push({
          priority: 'high',
          category: 'payments',
          action: 'Renegociar prazos de pagamento com fornecedores',
          expected_impact: currentBalance * 0.1,
          implementation_timeline: '30 dias',
          effort_level: 'medium'
        });
      }
    });

    // General optimizations
    const avgOutflow = projections.reduce((sum, p) => sum + p.outflows, 0) / projections.length;
    if (avgOutflow > currentBalance * 0.05) {
      recommendations.push({
        priority: 'medium',
        category: 'operations',
        action: 'Revisar contratos de fornecedores para redução de custos',
        expected_impact: avgOutflow * 30 * 0.05,
        implementation_timeline: '60 dias',
        effort_level: 'high'
      });
    }

    // Check if balance is too high (opportunity cost)
    const avgBalance = projections.reduce((sum, p) => sum + p.closing_balance, 0) / projections.length;
    if (avgBalance > currentBalance * 3) {
      recommendations.push({
        priority: 'low',
        category: 'financing',
        action: 'Considerar aplicações de curto prazo para excesso de caixa',
        expected_impact: avgBalance * 0.05 / 12, // Monthly return
        implementation_timeline: '30 dias',
        effort_level: 'low'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private getDaysDiff(dateStr: string): number {
    const now = new Date();
    const date = new Date(dateStr);
    return Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}

export const cashFlowPredictorEngine = new CashFlowPredictorEngine();
