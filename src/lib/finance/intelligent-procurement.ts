/**
 * 🛒 INTELLIGENT PROCUREMENT ENGINE
 * AI-powered procurement with automatic supplier selection and negotiation
 */

import { supabase } from '@/integrations/supabase/client';
import type { PurchaseOrder, Vendor, SupplierRecommendation, NegotiationStrategy } from './types';

interface ProcurementRequest {
  item_description: string;
  quantity: number;
  unit: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  vessel_id?: string;
  max_budget?: number;
  preferred_vendor_id?: string;
}

interface ProcurementResult {
  purchase_order: Partial<PurchaseOrder>;
  recommendation: SupplierRecommendation;
  negotiation_strategy: NegotiationStrategy;
  estimated_savings: number;
  auto_approved: boolean;
}

interface DemandForecast {
  item_category: string;
  forecast: ForecastPeriod[];
  confidence: number;
  triggers: ReorderTrigger[];
  recommendations: string[];
}

interface ForecastPeriod {
  period: string;
  predicted_demand: number;
  lower_bound: number;
  upper_bound: number;
}

interface ReorderTrigger {
  item: string;
  current_stock: number;
  reorder_point: number;
  suggested_quantity: number;
  urgency: string;
}

export class IntelligentProcurementEngine {
  private static instance: IntelligentProcurementEngine;

  static getInstance(): IntelligentProcurementEngine {
    if (!this.instance) {
      this.instance = new IntelligentProcurementEngine();
    }
    return this.instance;
  }

  /**
   * Automate procurement process
   */
  async automateProcurement(request: ProcurementRequest): Promise<ProcurementResult> {
    // 1. Analyze the actual need
    const analysis = await this.analyzeNeed(request);

    // 2. Find best suppliers
    const suppliers = await this.findBestSuppliers(analysis);

    // 3. Get supplier recommendation
    const recommendation = this.rankSuppliers(suppliers, analysis);

    // 4. Create negotiation strategy
    const strategy = this.createNegotiationStrategy(recommendation, request);

    // 5. Create purchase order
    const purchaseOrder = await this.createPurchaseOrder(request, recommendation);

    // 6. Determine if auto-approval is possible
    const autoApproved = this.shouldAutoApprove(request, recommendation);

    // 7. Calculate estimated savings
    const savings = this.calculateEstimatedSavings(recommendation, suppliers);

    return {
      purchase_order: purchaseOrder,
      recommendation,
      negotiation_strategy: strategy,
      estimated_savings: savings,
      auto_approved: autoApproved
    };
  }

  /**
   * Analyze procurement need
   */
  private async analyzeNeed(request: ProcurementRequest): Promise<{
    adjusted_quantity: number;
    category: string;
    specifications: string[];
    budget_range: { min: number; max: number };
  }> {
    // Check historical usage
    const historicalUsage = await this.getHistoricalUsage(request.category);
    
    // Adjust quantity based on usage patterns
    const avgMonthlyUsage = historicalUsage.length > 0
      ? historicalUsage.reduce((a, b) => a + b, 0) / historicalUsage.length
      : request.quantity;

    // Calculate optimal order quantity (EOQ-inspired)
    const adjustedQuantity = this.calculateOptimalQuantity(
      request.quantity,
      avgMonthlyUsage,
      request.urgency
    );

    return {
      adjusted_quantity: adjustedQuantity,
      category: request.category,
      specifications: this.extractSpecifications(request.item_description),
      budget_range: {
        min: (request.max_budget || 1000) * 0.7,
        max: request.max_budget || 10000
      }
    };
  }

  /**
   * Find best suppliers for the request
   */
  private async findBestSuppliers(analysis: {
    category: string;
    budget_range: { min: number; max: number };
  }): Promise<Vendor[]> {
    // Return mock vendors - in production would query vendors table
    return this.getMockVendors();
  }

  /**
   * Rank suppliers and create recommendation
   */
  private rankSuppliers(
    suppliers: Vendor[],
    analysis: { budget_range: { min: number; max: number } }
  ): SupplierRecommendation {
    // Score each supplier
    const scoredSuppliers = suppliers.map(supplier => ({
      supplier,
      score: this.calculateSupplierScore(supplier)
    })).sort((a, b) => b.score - a.score);

    const best = scoredSuppliers[0];
    const alternatives = scoredSuppliers.slice(1, 4);

    return {
      recommended_supplier_id: best.supplier.id,
      supplier_name: best.supplier.name,
      score: best.score,
      reasons: this.generateReasons(best.supplier, best.score),
      alternatives: alternatives.map(alt => ({
        supplier_id: alt.supplier.id,
        supplier_name: alt.supplier.name,
        score: alt.score,
        trade_offs: this.identifyTradeOffs(best.supplier, alt.supplier)
      }))
    };
  }

  /**
   * Calculate supplier score
   */
  private calculateSupplierScore(supplier: Vendor): number {
    const weights = {
      performance: 0.3,
      quality: 0.25,
      delivery: 0.25,
      reliability: 0.2
    };

    const performanceScore = (supplier.performance_score || 70) / 100;
    const qualityScore = (supplier.quality_score || 70) / 100;
    const deliveryScore = (supplier.on_time_delivery || 80) / 100;
    const reliabilityScore = (supplier.ai_reliability_score || 75) / 100;

    return (
      performanceScore * weights.performance +
      qualityScore * weights.quality +
      deliveryScore * weights.delivery +
      reliabilityScore * weights.reliability
    ) * 100;
  }

  /**
   * Generate reasons for recommendation
   */
  private generateReasons(supplier: Vendor, score: number): string[] {
    const reasons: string[] = [];

    if (supplier.performance_score && supplier.performance_score > 85) {
      reasons.push(`Excellent performance score of ${supplier.performance_score}%`);
    }

    if (supplier.on_time_delivery && supplier.on_time_delivery > 90) {
      reasons.push(`Outstanding on-time delivery rate of ${supplier.on_time_delivery}%`);
    }

    if (supplier.quality_score && supplier.quality_score > 85) {
      reasons.push(`High quality score of ${supplier.quality_score}%`);
    }

    if (supplier.total_orders && supplier.total_orders > 50) {
      reasons.push(`Proven track record with ${supplier.total_orders} completed orders`);
    }

    if (reasons.length === 0) {
      reasons.push('Best overall score based on available metrics');
    }

    return reasons;
  }

  /**
   * Identify trade-offs between suppliers
   */
  private identifyTradeOffs(best: Vendor, alternative: Vendor): string[] {
    const tradeOffs: string[] = [];

    if ((alternative.on_time_delivery || 0) > (best.on_time_delivery || 0)) {
      tradeOffs.push('Better delivery times');
    }

    if ((alternative.quality_score || 0) > (best.quality_score || 0)) {
      tradeOffs.push('Higher quality ratings');
    }

    if (alternative.payment_terms && alternative.payment_terms.includes('60')) {
      tradeOffs.push('More favorable payment terms');
    }

    if (tradeOffs.length === 0) {
      tradeOffs.push('No significant advantages over recommended supplier');
    }

    return tradeOffs;
  }

  /**
   * Create negotiation strategy
   */
  private createNegotiationStrategy(
    recommendation: SupplierRecommendation,
    request: ProcurementRequest
  ): NegotiationStrategy {
    const estimatedPrice = request.max_budget || 5000;

    return {
      target_price: estimatedPrice * 0.85,
      initial_offer: estimatedPrice * 0.75,
      max_price: estimatedPrice,
      arguments: [
        'Long-term partnership potential',
        'Consistent order volume',
        'Prompt payment history',
        'Bulk order opportunity'
      ],
      concessions: [
        'Extended payment terms acceptable',
        'Flexible delivery window',
        'Willing to consolidate orders'
      ],
      deal_breakers: [
        'Price above market rate by more than 15%',
        'Delivery time exceeds 30 days',
        'No quality guarantee'
      ]
    };
  }

  /**
   * Create purchase order
   */
  private async createPurchaseOrder(
    request: ProcurementRequest,
    recommendation: SupplierRecommendation
  ): Promise<Partial<PurchaseOrder>> {
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const estimatedTotal = request.max_budget || request.quantity * 100;

    return {
      po_number: poNumber,
      vendor_id: recommendation.recommended_supplier_id,
      vessel_id: request.vessel_id,
      items: [{
        id: crypto.randomUUID(),
        description: request.item_description,
        quantity: request.quantity,
        unit: request.unit,
        unit_price: estimatedTotal / request.quantity,
        total: estimatedTotal
      }],
      total: estimatedTotal,
      currency: 'USD',
      status: 'draft',
      ai_supplier_recommendation: recommendation
    };
  }

  /**
   * Determine if auto-approval is possible
   */
  private shouldAutoApprove(
    request: ProcurementRequest,
    recommendation: SupplierRecommendation
  ): boolean {
    // Auto-approve if:
    // 1. Amount is below threshold
    // 2. Supplier score is high
    // 3. Not critical urgency (needs human review)
    const amountThreshold = 2000;
    const scoreThreshold = 75;

    return (
      (request.max_budget || 0) < amountThreshold &&
      recommendation.score >= scoreThreshold &&
      request.urgency !== 'critical'
    );
  }

  /**
   * Calculate estimated savings
   */
  private calculateEstimatedSavings(
    recommendation: SupplierRecommendation,
    allSuppliers: Vendor[]
  ): number {
    // Compare recommended supplier to average
    const avgScore = allSuppliers.reduce((acc, s) => acc + this.calculateSupplierScore(s), 0) / allSuppliers.length;
    const scoreDiff = recommendation.score - avgScore;

    // Higher score typically means 5-15% better pricing/value
    return Math.max(0, scoreDiff * 10);
  }

  /**
   * Predict demand for items
   */
  async predictDemand(itemCategory: string): Promise<DemandForecast> {
    const historicalUsage = await this.getHistoricalUsage(itemCategory);
    
    // Calculate trend
    const trend = this.calculateTrend(historicalUsage);
    
    // Generate forecast
    const forecast = this.generateForecast(historicalUsage, trend);
    
    // Identify reorder triggers
    const triggers = this.identifyReorderTriggers(itemCategory, forecast);

    return {
      item_category: itemCategory,
      forecast,
      confidence: historicalUsage.length > 6 ? 0.85 : 0.6,
      triggers,
      recommendations: this.generateDemandRecommendations(forecast, triggers)
    };
  }

  /**
   * Get historical usage data
   */
  private async getHistoricalUsage(category: string): Promise<number[]> {
    const { data } = await supabase
      .from('expenses')
      .select('amount')
      .eq('category', category)
      .gte('expense_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    if (!data || data.length === 0) {
      // Return mock data
      return Array(12).fill(0).map(() => Math.random() * 5000 + 2000);
    }

    return data.map(d => d.amount);
  }

  /**
   * Calculate trend from historical data
   */
  private calculateTrend(data: number[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = data.reduce((acc, y, i) => acc + i * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  /**
   * Generate forecast
   */
  private generateForecast(historical: number[], trend: number): ForecastPeriod[] {
    const avgUsage = historical.length > 0
      ? historical.reduce((a, b) => a + b, 0) / historical.length
      : 1000;
    const stdDev = this.calculateStdDev(historical);

    const forecast: ForecastPeriod[] = [];
    const now = new Date();

    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const predicted = avgUsage + trend * (historical.length + i);

      forecast.push({
        period: futureDate.toISOString().substring(0, 7),
        predicted_demand: Math.max(0, predicted),
        lower_bound: Math.max(0, predicted - 1.96 * stdDev),
        upper_bound: predicted + 1.96 * stdDev
      });
    }

    return forecast;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(data: number[]): number {
    if (data.length < 2) return 0;
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / data.length);
  }

  /**
   * Identify reorder triggers
   */
  private identifyReorderTriggers(category: string, forecast: ForecastPeriod[]): ReorderTrigger[] {
    // In production, this would check actual inventory levels
    const mockStock = Math.random() * 100;
    const avgDemand = forecast.reduce((a, b) => a + b.predicted_demand, 0) / forecast.length;
    const reorderPoint = avgDemand * 0.3;

    if (mockStock < reorderPoint) {
      return [{
        item: category,
        current_stock: mockStock,
        reorder_point: reorderPoint,
        suggested_quantity: avgDemand * 2,
        urgency: mockStock < reorderPoint * 0.5 ? 'high' : 'medium'
      }];
    }

    return [];
  }

  /**
   * Generate demand recommendations
   */
  private generateDemandRecommendations(
    forecast: ForecastPeriod[],
    triggers: ReorderTrigger[]
  ): string[] {
    const recommendations: string[] = [];

    if (triggers.length > 0) {
      recommendations.push(`Reorder alert: ${triggers.length} item(s) below reorder point`);
    }

    const avgDemand = forecast.reduce((a, b) => a + b.predicted_demand, 0) / forecast.length;
    const lastPeriodDemand = forecast[forecast.length - 1]?.predicted_demand || 0;

    if (lastPeriodDemand > avgDemand * 1.2) {
      recommendations.push('Demand trending upward - consider increasing safety stock');
    }

    recommendations.push('Consider bulk purchasing for frequently ordered items');

    return recommendations;
  }

  /**
   * Calculate optimal order quantity
   */
  private calculateOptimalQuantity(
    requested: number,
    avgMonthly: number,
    urgency: string
  ): number {
    // Simple EOQ-inspired calculation
    const holdingCost = 0.2; // 20% of item value
    const orderingCost = 50; // Fixed cost per order
    
    const eoq = Math.sqrt((2 * avgMonthly * 12 * orderingCost) / holdingCost);
    
    // Adjust based on urgency
    const urgencyMultiplier = urgency === 'critical' ? 1.5 : urgency === 'high' ? 1.2 : 1;
    
    return Math.max(requested, Math.round(eoq * urgencyMultiplier));
  }

  /**
   * Extract specifications from description
   */
  private extractSpecifications(description: string): string[] {
    // Simple extraction - in production would use NLP
    const specs: string[] = [];
    
    if (description.match(/\d+\s*(mm|cm|m|inch|in)/i)) {
      specs.push('Dimension specified');
    }
    if (description.match(/steel|aluminum|copper|plastic/i)) {
      specs.push('Material specified');
    }
    if (description.match(/marine|maritime|vessel/i)) {
      specs.push('Marine-grade required');
    }

    return specs;
  }

  /**
   * Get mock vendors for demonstration
   */
  private getMockVendors(): Vendor[] {
    return [
      {
        id: crypto.randomUUID(),
        name: 'Marine Supplies International',
        contact_person: 'John Smith',
        email: 'john@marinesupplies.com',
        performance_score: 92,
        quality_score: 88,
        on_time_delivery: 95,
        ai_reliability_score: 90,
        total_orders: 150,
        total_value: 450000,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Global Maritime Parts',
        contact_person: 'Jane Doe',
        email: 'jane@globalparts.com',
        performance_score: 85,
        quality_score: 90,
        on_time_delivery: 88,
        ai_reliability_score: 85,
        total_orders: 80,
        total_value: 280000,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        name: 'Pacific Ship Supplies',
        contact_person: 'Mike Wilson',
        email: 'mike@pacificship.com',
        performance_score: 78,
        quality_score: 82,
        on_time_delivery: 85,
        ai_reliability_score: 80,
        total_orders: 45,
        total_value: 120000,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}

export const intelligentProcurement = IntelligentProcurementEngine.getInstance();
