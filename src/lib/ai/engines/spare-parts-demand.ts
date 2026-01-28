/**
 * Spare Parts Demand AI Engine
 * Previsão de demanda de peças com 6 meses de antecedência
 */

export interface SparePart {
  id: string;
  part_number: string;
  name: string;
  category: string;
  equipment_id: string;
  equipment_name: string;
  unit_cost: number;
  lead_time_days: number;
  min_stock_level: number;
  current_stock: number;
  reorder_point: number;
  supplier_id?: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface ConsumptionRecord {
  part_id: string;
  date: string;
  quantity: number;
  reason: 'maintenance' | 'failure' | 'inspection' | 'other';
  vessel_id?: string;
}

export interface DemandForecast {
  part_id: string;
  part_number: string;
  part_name: string;
  category: string;
  criticality: SparePart['criticality'];
  current_stock: number;
  forecasts: MonthlyForecast[];
  total_forecast_6m: number;
  confidence_interval: { low: number; high: number };
  stock_out_risk: number;
  recommended_order_quantity: number;
  recommended_order_date: string;
  estimated_cost: number;
  insights: DemandInsight[];
}

export interface MonthlyForecast {
  month: string;
  predicted_demand: number;
  confidence: number;
  factors: { factor: string; impact: number }[];
}

export interface DemandInsight {
  type: 'trend' | 'seasonality' | 'anomaly' | 'risk' | 'opportunity';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface InventoryOptimization {
  vessel_id?: string;
  analysis_date: string;
  total_parts_analyzed: number;
  total_inventory_value: number;
  optimization_potential: number;
  recommendations: OptimizationRecommendation[];
  risk_summary: {
    critical_shortages: number;
    high_risk_items: number;
    overstocked_items: number;
  };
  forecast_accuracy: number;
}

export interface OptimizationRecommendation {
  part_id: string;
  part_name: string;
  recommendation_type: 'order_now' | 'reduce_stock' | 'increase_safety_stock' | 'review_supplier';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  current_situation: string;
  recommended_action: string;
  estimated_impact: string;
  estimated_savings?: number;
}

export interface SupplierAnalysis {
  supplier_id: string;
  supplier_name: string;
  parts_supplied: number;
  average_lead_time: number;
  on_time_delivery_rate: number;
  quality_score: number;
  risk_level: 'low' | 'medium' | 'high';
  recommendations: string[];
}

class SparePartsDemandEngine {
  private readonly SEASONALITY_FACTORS: Record<string, number[]> = {
    // Month factors (Jan-Dec): 1.0 = average
    'engine': [0.9, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 1.0, 1.1, 1.0, 0.9, 0.8],
    'electrical': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    'safety': [0.8, 0.9, 1.2, 1.2, 1.0, 0.9, 0.9, 0.9, 1.1, 1.1, 1.0, 0.9],
    'navigation': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    'deck': [0.8, 0.9, 1.1, 1.2, 1.2, 1.1, 1.0, 1.0, 1.0, 0.9, 0.9, 0.8]
  };

  private readonly CRITICALITY_WEIGHTS = {
    critical: 2.0,
    high: 1.5,
    medium: 1.0,
    low: 0.7
  };

  /**
   * Generate demand forecast for a spare part
   */
  forecastDemand(
    part: SparePart,
    consumptionHistory: ConsumptionRecord[],
    horizonMonths: number = 6
  ): DemandForecast {
    const partHistory = consumptionHistory.filter(c => c.part_id === part.id);
    
    // Calculate base demand
    const baseDemand = this.calculateBaseDemand(partHistory);
    
    // Generate monthly forecasts
    const forecasts = this.generateMonthlyForecasts(
      part,
      baseDemand,
      horizonMonths
    );
    
    // Calculate totals and confidence
    const totalForecast = forecasts.reduce((sum, f) => sum + f.predicted_demand, 0);
    const confidenceInterval = this.calculateConfidenceInterval(baseDemand, totalForecast);
    
    // Calculate stock-out risk
    const stockOutRisk = this.calculateStockOutRisk(part, forecasts);
    
    // Determine order recommendations
    const orderRecommendation = this.calculateOrderRecommendation(part, forecasts, stockOutRisk);
    
    // Generate insights
    const insights = this.generateInsights(part, partHistory, forecasts, stockOutRisk);

    return {
      part_id: part.id,
      part_number: part.part_number,
      part_name: part.name,
      category: part.category,
      criticality: part.criticality,
      current_stock: part.current_stock,
      forecasts,
      total_forecast_6m: Math.round(totalForecast),
      confidence_interval: confidenceInterval,
      stock_out_risk: stockOutRisk,
      recommended_order_quantity: orderRecommendation.quantity,
      recommended_order_date: orderRecommendation.date,
      estimated_cost: orderRecommendation.quantity * part.unit_cost,
      insights
    };
  }

  /**
   * Optimize inventory across all parts
   */
  optimizeInventory(
    parts: SparePart[],
    consumptionHistory: ConsumptionRecord[],
    vesselId?: string
  ): InventoryOptimization {
    const forecasts = parts.map(part => this.forecastDemand(part, consumptionHistory));
    
    const recommendations: OptimizationRecommendation[] = [];
    let criticalShortages = 0;
    let highRiskItems = 0;
    let overstockedItems = 0;

    forecasts.forEach(forecast => {
      const part = parts.find(p => p.id === forecast.part_id)!;
      
      // Check for critical shortages
      if (forecast.stock_out_risk > 0.7 && part.criticality === 'critical') {
        criticalShortages++;
        recommendations.push({
          part_id: part.id,
          part_name: part.name,
          recommendation_type: 'order_now',
          priority: 'urgent',
          current_situation: `Estoque: ${part.current_stock}, Demanda 6M: ${forecast.total_forecast_6m}`,
          recommended_action: `Encomendar ${forecast.recommended_order_quantity} unidades imediatamente`,
          estimated_impact: 'Evitar parada de equipamento crítico',
          estimated_savings: undefined
        });
      } else if (forecast.stock_out_risk > 0.5) {
        highRiskItems++;
        recommendations.push({
          part_id: part.id,
          part_name: part.name,
          recommendation_type: 'order_now',
          priority: 'high',
          current_situation: `Risco de falta: ${(forecast.stock_out_risk * 100).toFixed(0)}%`,
          recommended_action: `Encomendar ${forecast.recommended_order_quantity} unidades até ${forecast.recommended_order_date}`,
          estimated_impact: 'Prevenir ruptura de estoque'
        });
      }
      
      // Check for overstocked items
      const monthsOfStock = part.current_stock / (forecast.total_forecast_6m / 6);
      if (monthsOfStock > 18 && part.criticality !== 'critical') {
        overstockedItems++;
        const excessStock = Math.round(part.current_stock - forecast.total_forecast_6m);
        recommendations.push({
          part_id: part.id,
          part_name: part.name,
          recommendation_type: 'reduce_stock',
          priority: 'medium',
          current_situation: `${monthsOfStock.toFixed(0)} meses de estoque`,
          recommended_action: 'Reduzir nível de estoque de segurança',
          estimated_impact: 'Liberar capital de giro',
          estimated_savings: excessStock * part.unit_cost
        });
      }
    });

    const totalInventoryValue = parts.reduce(
      (sum, p) => sum + p.current_stock * p.unit_cost, 0
    );

    const potentialSavings = recommendations
      .filter(r => r.estimated_savings)
      .reduce((sum, r) => sum + (r.estimated_savings || 0), 0);

    return {
      vessel_id: vesselId,
      analysis_date: new Date().toISOString(),
      total_parts_analyzed: parts.length,
      total_inventory_value: totalInventoryValue,
      optimization_potential: potentialSavings,
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),
      risk_summary: {
        critical_shortages: criticalShortages,
        high_risk_items: highRiskItems,
        overstocked_items: overstockedItems
      },
      forecast_accuracy: this.calculateForecastAccuracy(consumptionHistory)
    };
  }

  /**
   * Analyze supplier performance
   */
  analyzeSuppliers(
    parts: SparePart[],
    suppliers: Map<string, { name: string; deliveries: { on_time: boolean; quality_issues: boolean }[] }>
  ): SupplierAnalysis[] {
    const analyses: SupplierAnalysis[] = [];

    suppliers.forEach((data, supplierId) => {
      const supplierParts = parts.filter(p => p.supplier_id === supplierId);
      const deliveries = data.deliveries;
      
      const onTimeRate = deliveries.length > 0
        ? deliveries.filter(d => d.on_time).length / deliveries.length
        : 1;
      
      const qualityScore = deliveries.length > 0
        ? (deliveries.filter(d => !d.quality_issues).length / deliveries.length) * 100
        : 100;

      const avgLeadTime = supplierParts.length > 0
        ? supplierParts.reduce((sum, p) => sum + p.lead_time_days, 0) / supplierParts.length
        : 0;

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (onTimeRate < 0.8 || qualityScore < 90) riskLevel = 'medium';
      if (onTimeRate < 0.6 || qualityScore < 80) riskLevel = 'high';

      const recommendations: string[] = [];
      if (onTimeRate < 0.9) {
        recommendations.push('Revisar acordos de nível de serviço');
      }
      if (qualityScore < 95) {
        recommendations.push('Implementar inspeção de recebimento');
      }
      if (avgLeadTime > 30) {
        recommendations.push('Negociar redução de lead time');
      }
      if (riskLevel === 'high') {
        recommendations.push('Considerar fornecedor alternativo');
      }

      analyses.push({
        supplier_id: supplierId,
        supplier_name: data.name,
        parts_supplied: supplierParts.length,
        average_lead_time: Math.round(avgLeadTime),
        on_time_delivery_rate: Math.round(onTimeRate * 100),
        quality_score: Math.round(qualityScore),
        risk_level: riskLevel,
        recommendations
      });
    });

    return analyses.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      return riskOrder[a.risk_level] - riskOrder[b.risk_level];
    });
  }

  private calculateBaseDemand(history: ConsumptionRecord[]): number {
    if (history.length === 0) return 1; // Default minimum demand

    // Calculate monthly average
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    
    const recentHistory = history.filter(
      h => new Date(h.date) >= twelveMonthsAgo
    );

    if (recentHistory.length === 0) return 1;

    const totalConsumption = recentHistory.reduce((sum, h) => sum + h.quantity, 0);
    const monthsOfData = Math.max(1, this.getMonthsDifference(
      new Date(recentHistory[recentHistory.length - 1].date),
      now
    ));

    return totalConsumption / monthsOfData;
  }

  private generateMonthlyForecasts(
    part: SparePart,
    baseDemand: number,
    horizonMonths: number
  ): MonthlyForecast[] {
    const forecasts: MonthlyForecast[] = [];
    const now = new Date();
    const seasonality = this.SEASONALITY_FACTORS[part.category.toLowerCase()] ||
      this.SEASONALITY_FACTORS['electrical'];
    const criticalityWeight = this.CRITICALITY_WEIGHTS[part.criticality];

    for (let i = 0; i < horizonMonths; i++) {
      const forecastDate = new Date(now.getTime());
      forecastDate.setMonth(forecastDate.getMonth() + i + 1);
      
      const monthIndex = forecastDate.getMonth();
      const seasonalFactor = seasonality[monthIndex];
      
      // Calculate predicted demand with various factors
      let predictedDemand = baseDemand * seasonalFactor;
      
      // Add randomness factor for uncertainty
      const uncertaintyFactor = 0.9 + Math.random() * 0.2; // 0.9-1.1
      predictedDemand *= uncertaintyFactor;
      
      // Apply criticality adjustment (critical items may have higher safety margin)
      predictedDemand *= criticalityWeight * 0.7; // Normalize
      
      const factors = [
        { factor: 'Sazonalidade', impact: (seasonalFactor - 1) * 100 },
        { factor: 'Criticidade', impact: (criticalityWeight - 1) * 50 }
      ];

      forecasts.push({
        month: forecastDate.toISOString().slice(0, 7),
        predicted_demand: Math.max(0, Math.round(predictedDemand * 10) / 10),
        confidence: Math.max(0.6, 0.95 - i * 0.05), // Confidence decreases over time
        factors
      });
    }

    return forecasts;
  }

  private calculateConfidenceInterval(
    baseDemand: number,
    totalForecast: number
  ): { low: number; high: number } {
    const standardDeviation = baseDemand * 0.3; // Assume 30% variation
    const zScore = 1.96; // 95% confidence
    
    return {
      low: Math.max(0, Math.round(totalForecast - zScore * standardDeviation * Math.sqrt(6))),
      high: Math.round(totalForecast + zScore * standardDeviation * Math.sqrt(6))
    };
  }

  private calculateStockOutRisk(
    part: SparePart,
    forecasts: MonthlyForecast[]
  ): number {
    let cumulativeDemand = 0;
    let availableStock = part.current_stock;
    
    for (const forecast of forecasts) {
      cumulativeDemand += forecast.predicted_demand;
      
      if (cumulativeDemand > availableStock) {
        // Stock-out would occur
        const monthsUntilStockOut = forecasts.indexOf(forecast);
        // Risk increases if stock-out is sooner
        return Math.min(1, 0.3 + (6 - monthsUntilStockOut) * 0.15);
      }
    }
    
    // No stock-out predicted in horizon
    const bufferMonths = (availableStock - cumulativeDemand) / (cumulativeDemand / 6);
    return Math.max(0, 0.3 - bufferMonths * 0.05);
  }

  private calculateOrderRecommendation(
    part: SparePart,
    forecasts: MonthlyForecast[],
    stockOutRisk: number
  ): { quantity: number; date: string } {
    const totalForecast = forecasts.reduce((sum, f) => sum + f.predicted_demand, 0);
    const safetyStock = part.min_stock_level * this.CRITICALITY_WEIGHTS[part.criticality];
    
    const netRequirement = totalForecast + safetyStock - part.current_stock;
    const orderQuantity = Math.max(0, Math.ceil(netRequirement));
    
    // Calculate when to order based on lead time
    let orderDate = new Date();
    
    if (stockOutRisk > 0.5) {
      // Order immediately
      orderDate = new Date();
    } else {
      // Calculate optimal order date
      let cumulativeDemand = 0;
      for (const forecast of forecasts) {
        cumulativeDemand += forecast.predicted_demand;
        if (cumulativeDemand + safetyStock > part.current_stock) {
          orderDate = new Date(forecast.month + '-01');
          orderDate.setDate(orderDate.getDate() - part.lead_time_days);
          break;
        }
      }
    }

    return {
      quantity: orderQuantity,
      date: orderDate.toISOString().split('T')[0]
    };
  }

  private generateInsights(
    part: SparePart,
    history: ConsumptionRecord[],
    forecasts: MonthlyForecast[],
    stockOutRisk: number
  ): DemandInsight[] {
    const insights: DemandInsight[] = [];

    // Trend analysis
    if (history.length >= 6) {
      const recentAvg = this.getRecentAverage(history, 3);
      const olderAvg = this.getOlderAverage(history, 3, 6);
      
      if (recentAvg > olderAvg * 1.2) {
        insights.push({
          type: 'trend',
          message: `Consumo aumentando: +${((recentAvg / olderAvg - 1) * 100).toFixed(0)}% nos últimos 3 meses`,
          priority: 'high'
        });
      } else if (recentAvg < olderAvg * 0.8) {
        insights.push({
          type: 'trend',
          message: `Consumo diminuindo: ${((1 - recentAvg / olderAvg) * 100).toFixed(0)}% nos últimos 3 meses`,
          priority: 'medium'
        });
      }
    }

    // Risk insights
    if (stockOutRisk > 0.7) {
      insights.push({
        type: 'risk',
        message: 'Alto risco de ruptura de estoque - ação urgente necessária',
        priority: 'high'
      });
    } else if (stockOutRisk > 0.4) {
      insights.push({
        type: 'risk',
        message: 'Risco moderado de falta - monitorar de perto',
        priority: 'medium'
      });
    }

    // Seasonality insights
    const peakMonth = forecasts.reduce((max, f) => 
      f.predicted_demand > max.predicted_demand ? f : max
    );
    if (peakMonth.predicted_demand > forecasts[0].predicted_demand * 1.3) {
      insights.push({
        type: 'seasonality',
        message: `Pico de demanda esperado em ${peakMonth.month}`,
        priority: 'medium'
      });
    }

    // Opportunity insights
    if (part.current_stock > forecasts.reduce((sum, f) => sum + f.predicted_demand, 0) * 1.5) {
      insights.push({
        type: 'opportunity',
        message: 'Estoque atual cobre mais de 9 meses - considerar redução',
        priority: 'low'
      });
    }

    return insights;
  }

  private getMonthsDifference(start: Date, end: Date): number {
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  }

  private getRecentAverage(history: ConsumptionRecord[], months: number): number {
    const now = new Date();
    const cutoff = new Date(now.getTime() - months * 30 * 24 * 60 * 60 * 1000);
    
    const recent = history.filter(h => new Date(h.date) >= cutoff);
    return recent.length > 0
      ? recent.reduce((sum, h) => sum + h.quantity, 0) / months
      : 0;
  }

  private getOlderAverage(history: ConsumptionRecord[], startMonths: number, endMonths: number): number {
    const now = new Date();
    const startCutoff = new Date(now.getTime() - startMonths * 30 * 24 * 60 * 60 * 1000);
    const endCutoff = new Date(now.getTime() - endMonths * 30 * 24 * 60 * 60 * 1000);
    
    const older = history.filter(h => {
      const date = new Date(h.date);
      return date < startCutoff && date >= endCutoff;
    });
    
    return older.length > 0
      ? older.reduce((sum, h) => sum + h.quantity, 0) / (endMonths - startMonths)
      : 0;
  }

  private calculateForecastAccuracy(history: ConsumptionRecord[]): number {
    // Simplified accuracy calculation
    // In production, this would compare past forecasts with actual consumption
    if (history.length < 12) return 75; // Default for insufficient data
    
    const monthlyVariation = this.calculateMonthlyVariation(history);
    // Lower variation = higher accuracy
    return Math.max(60, Math.min(95, 90 - monthlyVariation * 100));
  }

  private calculateMonthlyVariation(history: ConsumptionRecord[]): number {
    const monthlyTotals: Record<string, number> = {};
    
    history.forEach(h => {
      const month = h.date.slice(0, 7);
      monthlyTotals[month] = (monthlyTotals[month] || 0) + h.quantity;
    });
    
    const values = Object.values(monthlyTotals);
    if (values.length < 2) return 0;
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    
    return Math.sqrt(variance) / avg; // Coefficient of variation
  }
}

export const sparePartsDemandEngine = new SparePartsDemandEngine();
