/**
 * Key Performance Indicators (KPIs) for Nautilus One
 * Comprehensive analytics tracking for maritime operations
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/utils/production-logger';

export interface KPIDefinition {
  id: string;
  name: string;
  category: 'engagement' | 'business' | 'product' | 'feature' | 'revenue';
  unit: string;
  target?: number;
  direction: 'higher' | 'lower';
}

export interface KPIValue {
  kpiId: string;
  value: number;
  timestamp: string;
  period: 'daily' | 'weekly' | 'monthly';
  metadata?: Record<string, unknown>;
}

export interface KPIDashboard {
  kpis: Array<KPIDefinition & { currentValue: number; trend: number; status: 'good' | 'warning' | 'critical' }>;
  lastUpdated: string;
}

/**
 * KPI Definitions
 */
export const KPI_DEFINITIONS: Record<string, KPIDefinition> = {
  // User Engagement
  DAU: {
    id: 'dau',
    name: 'Daily Active Users',
    category: 'engagement',
    unit: 'users',
    target: 500,
    direction: 'higher'
  },
  MAU: {
    id: 'mau',
    name: 'Monthly Active Users',
    category: 'engagement',
    unit: 'users',
    target: 2000,
    direction: 'higher'
  },
  SESSION_TIME: {
    id: 'session_time',
    name: 'Avg Session Duration',
    category: 'engagement',
    unit: 'minutes',
    target: 15,
    direction: 'higher'
  },
  RETURN_RATE: {
    id: 'return_rate',
    name: '7-Day Return Rate',
    category: 'engagement',
    unit: '%',
    target: 60,
    direction: 'higher'
  },

  // Business Value
  FUEL_SAVINGS: {
    id: 'fuel_savings',
    name: 'Total Fuel Cost Saved',
    category: 'business',
    unit: 'USD',
    target: 50000,
    direction: 'higher'
  },
  MAINTENANCE_COST: {
    id: 'maintenance_cost',
    name: 'Maintenance Cost Reduction',
    category: 'business',
    unit: '%',
    target: 20,
    direction: 'higher'
  },
  COMPLIANCE_RATE: {
    id: 'compliance_rate',
    name: 'Audit Pass Rate',
    category: 'business',
    unit: '%',
    target: 95,
    direction: 'higher'
  },
  INCIDENT_RATE: {
    id: 'incident_rate',
    name: 'Safety Incidents per 1000 Days',
    category: 'business',
    unit: 'incidents',
    target: 2,
    direction: 'lower'
  },

  // Product Health
  ERROR_RATE: {
    id: 'error_rate',
    name: 'Errors per 1000 Requests',
    category: 'product',
    unit: 'errors',
    target: 5,
    direction: 'lower'
  },
  RESPONSE_TIME: {
    id: 'response_time',
    name: 'P95 Response Time',
    category: 'product',
    unit: 'ms',
    target: 500,
    direction: 'lower'
  },
  UPTIME: {
    id: 'uptime',
    name: 'System Uptime',
    category: 'product',
    unit: '%',
    target: 99.9,
    direction: 'higher'
  },

  // Feature Adoption
  AI_USAGE: {
    id: 'ai_usage',
    name: 'AI Feature Adoption',
    category: 'feature',
    unit: '%',
    target: 70,
    direction: 'higher'
  },
  VOICE_USAGE: {
    id: 'voice_usage',
    name: 'Voice Commands Usage',
    category: 'feature',
    unit: '%',
    target: 30,
    direction: 'higher'
  },
  MOBILE_USAGE: {
    id: 'mobile_usage',
    name: 'Mobile vs Desktop',
    category: 'feature',
    unit: '%',
    target: 40,
    direction: 'higher'
  },

  // Revenue
  MRR: {
    id: 'mrr',
    name: 'Monthly Recurring Revenue',
    category: 'revenue',
    unit: 'USD',
    target: 100000,
    direction: 'higher'
  },
  CHURN: {
    id: 'churn',
    name: 'Monthly Churn Rate',
    category: 'revenue',
    unit: '%',
    target: 3,
    direction: 'lower'
  },
  LTV: {
    id: 'ltv',
    name: 'Customer Lifetime Value',
    category: 'revenue',
    unit: 'USD',
    target: 25000,
    direction: 'higher'
  },
  CAC: {
    id: 'cac',
    name: 'Customer Acquisition Cost',
    category: 'revenue',
    unit: 'USD',
    target: 1000,
    direction: 'lower'
  }
};

/**
 * KPI Tracker Class
 */
export class KPITracker {
  private static instance: KPITracker;
  private cache: Map<string, { value: number; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): KPITracker {
    if (!this.instance) {
      this.instance = new KPITracker();
    }
    return this.instance;
  }

  /**
   * Track KPI value
   */
  async trackKPI(kpiId: string, value: number, metadata?: Record<string, unknown>): Promise<void> {
    const kpi = KPI_DEFINITIONS[kpiId.toUpperCase()];
    if (!kpi) {
      logger.warn(`Unknown KPI: ${kpiId}`);
      return;
    }

    // Store in database
    const { error } = await supabase
      .from('analytics_metrics' as any)
      .insert({
        metric_name: kpi.id,
        metric_value: value,
        metric_unit: kpi.unit,
        dimensions: metadata,
        period_start: new Date().toISOString(),
        period_end: new Date().toISOString()
      });

    if (error) {
      // Fallback to localStorage
      const metrics = JSON.parse(localStorage.getItem('kpi_metrics') || '[]');
      metrics.push({
        kpiId: kpi.id,
        value,
        timestamp: new Date().toISOString(),
        metadata
      });
      localStorage.setItem('kpi_metrics', JSON.stringify(metrics.slice(-1000)));
    }

    // Update cache
    this.cache.set(kpi.id, { value, timestamp: Date.now() });
  }

  /**
   * Get current KPI value
   */
  async getKPIValue(kpiId: string): Promise<number | null> {
    const kpi = KPI_DEFINITIONS[kpiId.toUpperCase()];
    if (!kpi) return null;

    // Check cache
    const cached = this.cache.get(kpi.id);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }

    // Get from database
    const { data, error } = await supabase
      .from('analytics_metrics')
      .select('metric_value')
      .eq('metric_name', kpi.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      const value = (data as any).metric_value;
      this.cache.set(kpi.id, { value, timestamp: Date.now() });
      return value;
    }

    // Fallback to localStorage
    const metrics = JSON.parse(localStorage.getItem('kpi_metrics') || '[]');
    const latest = metrics.filter((m: any) => m.kpiId === kpi.id).pop();
    return latest?.value ?? null;
  }

  /**
   * Get KPI trend (percentage change)
   */
  async getKPITrend(kpiId: string, periodDays: number = 7): Promise<number> {
    const kpi = KPI_DEFINITIONS[kpiId.toUpperCase()];
    if (!kpi) return 0;

    const now = new Date();
    const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('analytics_metrics')
      .select('metric_value, created_at')
      .eq('metric_name', kpi.id)
      .gte('created_at', periodStart.toISOString())
      .order('created_at', { ascending: true });

    if (error || !data || data.length < 2) {
      return 0;
    }

    const firstValue = (data[0] as any).metric_value;
    const lastValue = (data[data.length - 1] as any).metric_value;

    if (firstValue === 0) return lastValue > 0 ? 100 : 0;
    return ((lastValue - firstValue) / firstValue) * 100;
  }

  /**
   * Get KPI status based on target
   */
  getKPIStatus(kpi: KPIDefinition, value: number): 'good' | 'warning' | 'critical' {
    if (!kpi.target) return 'good';

    const percentage = (value / kpi.target) * 100;

    if (kpi.direction === 'higher') {
      if (percentage >= 90) return 'good';
      if (percentage >= 70) return 'warning';
      return 'critical';
    } else {
      if (percentage <= 110) return 'good';
      if (percentage <= 130) return 'warning';
      return 'critical';
    }
  }

  /**
   * Get full KPI dashboard
   */
  async getDashboard(): Promise<KPIDashboard> {
    const kpis = await Promise.all(
      Object.values(KPI_DEFINITIONS).map(async (kpi) => {
        const currentValue = await this.getKPIValue(kpi.id) ?? 0;
        const trend = await this.getKPITrend(kpi.id);
        const status = this.getKPIStatus(kpi, currentValue);

        return {
          ...kpi,
          currentValue,
          trend,
          status
        };
      })
    );

    return {
      kpis,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Track user engagement event
   */
  async trackEngagement(event: 'session_start' | 'session_end' | 'feature_use', metadata: Record<string, unknown>): Promise<void> {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    
    // Skip if not authenticated (prevents 401 errors)
    if (!userId) return;

    await supabase.from('analytics_events' as any).insert({
      event_name: event,
      event_category: 'engagement',
      user_id: userId,
      properties: metadata,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Calculate and update DAU/MAU
   */
  async updateActiveUsers(): Promise<void> {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get unique users today
    const { data: dailyUsers } = await supabase
      .from('analytics_events' as any)
      .select('user_id')
      .gte('timestamp', dayStart.toISOString())
      .not('user_id', 'is', null);

    const dau = new Set(dailyUsers?.map((u: any) => u.user_id) ?? []).size;
    await this.trackKPI('DAU', dau);

    // Get unique users this month
    const { data: monthlyUsers } = await supabase
      .from('analytics_events' as any)
      .select('user_id')
      .gte('timestamp', monthStart.toISOString())
      .not('user_id', 'is', null);

    const mau = new Set(monthlyUsers?.map((u: any) => u.user_id) ?? []).size;
    await this.trackKPI('MAU', mau);
  }

  /**
   * Generate KPI report
   */
  async generateReport(period: 'daily' | 'weekly' | 'monthly'): Promise<{
    period: string;
    summary: Record<string, { value: number; trend: number; status: string }>;
    highlights: string[];
    concerns: string[];
    recommendations: string[];
  }> {
    const dashboard = await this.getDashboard();
    const summary: Record<string, { value: number; trend: number; status: string }> = {};
    const highlights: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];

    for (const kpi of dashboard.kpis) {
      summary[kpi.id] = {
        value: kpi.currentValue,
        trend: kpi.trend,
        status: kpi.status
      };

      if (kpi.status === 'good' && kpi.trend > 10) {
        highlights.push(`${kpi.name} is performing well (+${kpi.trend.toFixed(1)}%)`);
      }

      if (kpi.status === 'critical') {
        concerns.push(`${kpi.name} is below target (${kpi.currentValue} ${kpi.unit})`);
        recommendations.push(`Investigate and improve ${kpi.name}`);
      }
    }

    return {
      period,
      summary,
      highlights,
      concerns,
      recommendations
    };
  }
}

// Export singleton instance
export const kpiTracker = KPITracker.getInstance();

// Helper functions
export const trackKPI = (kpiId: string, value: number) => kpiTracker.trackKPI(kpiId, value);
export const getKPIDashboard = () => kpiTracker.getDashboard();
export const generateKPIReport = (period: 'daily' | 'weekly' | 'monthly') => kpiTracker.generateReport(period);
