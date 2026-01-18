/**
 * Churn Prediction & Customer Health Analytics
 * Proactive customer retention through usage analysis
 */

import { supabase } from '@/integrations/supabase/client';

export interface CustomerHealthMetrics {
  id: string;
  organization_id: string;
  health_score: number;
  churn_risk: number;
  last_calculated_at: string;
  logins_last_30d: number;
  api_calls_last_30d: number;
  features_used_count: number;
  active_users_count: number;
  support_tickets_last_30d: number;
  nps_score: number | null;
  mrr: number;
  arr: number;
  usage_trend: 'growing' | 'stable' | 'declining';
  engagement_trend: 'growing' | 'stable' | 'declining';
  risk_factors: RiskFactor[];
  recommended_actions: RecommendedAction[];
}

export interface RiskFactor {
  factor: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  weight: number;
}

export interface RecommendedAction {
  action: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  expected_impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface UsageEvent {
  id: string;
  organization_id: string;
  user_id: string;
  event_name: string;
  event_category: string;
  properties: Record<string, unknown>;
  session_id: string;
  page_url: string;
  timestamp: string;
}

// Churn risk factors and their weights
const RISK_FACTORS = {
  declining_usage: { weight: 0.25, threshold: 0.7 },
  increased_errors: { weight: 0.15, threshold: 0.05 },
  support_escalation: { weight: 0.15, threshold: 3 },
  feature_abandonment: { weight: 0.15, threshold: 0.3 },
  admin_inactivity: { weight: 0.20, threshold: 14 },
  low_nps: { weight: 0.10, threshold: 6 }
};

class CustomerHealthService {
  /**
   * Track a usage event
   */
  async trackEvent(
    organizationId: string,
    userId: string,
    eventName: string,
    category: string,
    properties?: Record<string, unknown>
  ): Promise<boolean> {
    try {
      const { error } = await (supabase.from('usage_events') as any).insert({
        organization_id: organizationId,
        user_id: userId,
        event_name: eventName,
        event_category: category,
        properties: properties || {},
        session_id: this.getSessionId(),
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        timestamp: new Date().toISOString()
      });

      return !error;
    } catch (error) {
      console.error('Failed to track event:', error);
      return false;
    }
  }

  /**
   * Calculate health score for an organization
   */
  async calculateHealthScore(organizationId: string): Promise<CustomerHealthMetrics | null> {
    try {
      // Get usage metrics for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Count logins
      const { count: logins } = await supabase
        .from('usage_events')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('event_name', 'login')
        .gte('timestamp', thirtyDaysAgo.toISOString());

      // Count API calls
      const { count: apiCalls } = await supabase
        .from('usage_events')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('event_category', 'api_call')
        .gte('timestamp', thirtyDaysAgo.toISOString());

      // Count unique features used
      const { data: features } = await supabase
        .from('usage_events')
        .select('event_name')
        .eq('organization_id', organizationId)
        .eq('event_category', 'feature_use')
        .gte('timestamp', thirtyDaysAgo.toISOString());

      const uniqueFeatures = new Set(features?.map(f => f.event_name) || []).size;

      // Count active users
      const { data: users } = await supabase
        .from('usage_events')
        .select('user_id')
        .eq('organization_id', organizationId)
        .gte('timestamp', thirtyDaysAgo.toISOString());

      const activeUsers = new Set(users?.map(u => u.user_id) || []).size;

      // Count errors
      const { count: errors } = await supabase
        .from('usage_events')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('event_category', 'error')
        .gte('timestamp', thirtyDaysAgo.toISOString());

      // Calculate trends (compare with previous 30 days)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { count: previousLogins } = await supabase
        .from('usage_events')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('event_name', 'login')
        .gte('timestamp', sixtyDaysAgo.toISOString())
        .lt('timestamp', thirtyDaysAgo.toISOString());

      const usageTrend = this.calculateTrend(logins || 0, previousLogins || 0);

      // Calculate risk factors
      const riskFactors = this.identifyRiskFactors({
        logins: logins || 0,
        previousLogins: previousLogins || 0,
        apiCalls: apiCalls || 0,
        features: uniqueFeatures,
        errors: errors || 0,
        activeUsers
      });

      // Calculate churn risk
      const churnRisk = this.calculateChurnRisk(riskFactors);

      // Calculate health score (inverse of churn risk)
      const healthScore = Math.round((1 - churnRisk) * 100);

      // Generate recommended actions
      const recommendedActions = this.generateRecommendations(riskFactors, churnRisk);

      const metrics: Omit<CustomerHealthMetrics, 'id'> = {
        organization_id: organizationId,
        health_score: healthScore,
        churn_risk: churnRisk,
        last_calculated_at: new Date().toISOString(),
        logins_last_30d: logins || 0,
        api_calls_last_30d: apiCalls || 0,
        features_used_count: uniqueFeatures,
        active_users_count: activeUsers,
        support_tickets_last_30d: 0, // Would need support ticket integration
        nps_score: null,
        mrr: 0,
        arr: 0,
        usage_trend: usageTrend,
        engagement_trend: usageTrend,
        risk_factors: riskFactors,
        recommended_actions: recommendedActions
      };

      // Upsert metrics
      const { data, error } = await supabase
        .from('customer_health_metrics')
        .upsert({
          ...metrics,
          risk_factors: JSON.stringify(riskFactors),
          recommended_actions: JSON.stringify(recommendedActions)
        }, { onConflict: 'organization_id' })
        .select()
        .single();

      if (error) {
        console.error('Failed to save health metrics:', error);
        return null;
      }

      return {
        ...data,
        risk_factors: riskFactors,
        recommended_actions: recommendedActions
      } as CustomerHealthMetrics;
    } catch (error) {
      console.error('Error calculating health score:', error);
      return null;
    }
  }

  /**
   * Get health metrics for an organization
   */
  async getHealthMetrics(organizationId: string): Promise<CustomerHealthMetrics | null> {
    const { data, error } = await supabase
      .from('customer_health_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Failed to get health metrics:', error);
      return null;
    }

    return {
      ...data,
      risk_factors: typeof data.risk_factors === 'string' 
        ? JSON.parse(data.risk_factors) 
        : data.risk_factors,
      recommended_actions: typeof data.recommended_actions === 'string'
        ? JSON.parse(data.recommended_actions)
        : data.recommended_actions
    } as CustomerHealthMetrics;
  }

  /**
   * Get all customers at risk (churn_risk > threshold)
   */
  async getAtRiskCustomers(threshold: number = 0.6): Promise<CustomerHealthMetrics[]> {
    const { data, error } = await supabase
      .from('customer_health_metrics')
      .select('*')
      .gte('churn_risk', threshold)
      .order('churn_risk', { ascending: false });

    if (error) {
      console.error('Failed to get at-risk customers:', error);
      return [];
    }

    return (data || []).map(d => ({
      ...d,
      risk_factors: typeof d.risk_factors === 'string' 
        ? JSON.parse(d.risk_factors) 
        : d.risk_factors,
      recommended_actions: typeof d.recommended_actions === 'string'
        ? JSON.parse(d.recommended_actions)
        : d.recommended_actions
    })) as CustomerHealthMetrics[];
  }

  private calculateTrend(current: number, previous: number): 'growing' | 'stable' | 'declining' {
    if (previous === 0) return current > 0 ? 'growing' : 'stable';
    const change = (current - previous) / previous;
    if (change > 0.1) return 'growing';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  private identifyRiskFactors(metrics: {
    logins: number;
    previousLogins: number;
    apiCalls: number;
    features: number;
    errors: number;
    activeUsers: number;
  }): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Declining usage
    if (metrics.previousLogins > 0) {
      const usageRatio = metrics.logins / metrics.previousLogins;
      if (usageRatio < RISK_FACTORS.declining_usage.threshold) {
        factors.push({
          factor: 'declining_usage',
          severity: usageRatio < 0.5 ? 'high' : 'medium',
          description: `Usage dropped ${Math.round((1 - usageRatio) * 100)}% vs previous period`,
          weight: RISK_FACTORS.declining_usage.weight
        });
      }
    }

    // High error rate
    const errorRate = metrics.apiCalls > 0 ? metrics.errors / metrics.apiCalls : 0;
    if (errorRate > RISK_FACTORS.increased_errors.threshold) {
      factors.push({
        factor: 'high_error_rate',
        severity: errorRate > 0.1 ? 'high' : 'medium',
        description: `Error rate at ${Math.round(errorRate * 100)}%`,
        weight: RISK_FACTORS.increased_errors.weight
      });
    }

    // Low feature adoption
    if (metrics.features < 5) {
      factors.push({
        factor: 'low_feature_adoption',
        severity: metrics.features < 2 ? 'high' : 'medium',
        description: `Only ${metrics.features} features used in last 30 days`,
        weight: RISK_FACTORS.feature_abandonment.weight
      });
    }

    // Low user engagement
    if (metrics.activeUsers < 2) {
      factors.push({
        factor: 'low_user_engagement',
        severity: metrics.activeUsers === 0 ? 'high' : 'medium',
        description: `Only ${metrics.activeUsers} active users`,
        weight: RISK_FACTORS.admin_inactivity.weight
      });
    }

    return factors;
  }

  private calculateChurnRisk(factors: RiskFactor[]): number {
    if (factors.length === 0) return 0;

    let totalWeight = 0;
    let weightedRisk = 0;

    factors.forEach(factor => {
      const severityMultiplier = factor.severity === 'high' ? 1 : factor.severity === 'medium' ? 0.6 : 0.3;
      weightedRisk += factor.weight * severityMultiplier;
      totalWeight += factor.weight;
    });

    // Normalize to 0-1
    return Math.min(weightedRisk, 1);
  }

  private generateRecommendations(factors: RiskFactor[], churnRisk: number): RecommendedAction[] {
    const actions: RecommendedAction[] = [];

    factors.forEach(factor => {
      switch (factor.factor) {
        case 'declining_usage':
          actions.push({
            action: 'Schedule customer success check-in call',
            priority: factor.severity === 'high' ? 'urgent' : 'high',
            expected_impact: 'Understand pain points and re-engage customer',
            effort: 'low'
          });
          break;
        case 'high_error_rate':
          actions.push({
            action: 'Technical support outreach to resolve issues',
            priority: 'urgent',
            expected_impact: 'Reduce frustration and improve experience',
            effort: 'medium'
          });
          break;
        case 'low_feature_adoption':
          actions.push({
            action: 'Send personalized feature discovery email',
            priority: 'high',
            expected_impact: 'Increase product value perception',
            effort: 'low'
          });
          actions.push({
            action: 'Offer guided onboarding session',
            priority: 'medium',
            expected_impact: 'Accelerate time to value',
            effort: 'medium'
          });
          break;
        case 'low_user_engagement':
          actions.push({
            action: 'Identify and invite potential power users',
            priority: 'high',
            expected_impact: 'Expand organizational adoption',
            effort: 'low'
          });
          break;
      }
    });

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return actions.slice(0, 5); // Return top 5 actions
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('nauti_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('nauti_session_id', sessionId);
    }
    return sessionId;
  }
}

export const customerHealthService = new CustomerHealthService();
