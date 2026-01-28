/**
 * Subscription & Billing Service - PROMPT 17
 * Sistema de assinaturas e cobrança
 */

import { logger } from '@/lib/logger';

// Planos de assinatura
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  limits: {
    users: number;
    vessels: number;
    crew_members: number;
    storage_gb: number;
    ai_requests_month: number;
    api_calls_month: number;
  };
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

export interface UsageMetrics {
  organization_id: string;
  period_start: string;
  period_end: string;
  users_count: number;
  vessels_count: number;
  crew_members_count: number;
  storage_used_gb: number;
  ai_requests_count: number;
  api_calls_count: number;
}

export interface Invoice {
  id: string;
  organization_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  invoice_date: string;
  due_date: string;
  paid_at?: string;
  stripe_invoice_id?: string;
  pdf_url?: string;
}

// Planos disponíveis
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'For small teams getting started',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'USD',
    features: [
      'Up to 3 users',
      'Up to 2 vessels',
      'Up to 50 crew members',
      'Basic compliance tracking',
      'Email support',
      '1 GB storage'
    ],
    limits: {
      users: 3,
      vessels: 2,
      crew_members: 50,
      storage_gb: 1,
      ai_requests_month: 100,
      api_calls_month: 1000
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing maritime companies',
    price_monthly: 299,
    price_yearly: 2990, // ~2 months free
    currency: 'USD',
    features: [
      'Up to 25 users',
      'Up to 10 vessels',
      'Up to 500 crew members',
      'Full compliance suite (MLC, STCW, ISM)',
      'AI assistants included',
      'Priority support',
      '50 GB storage',
      'API access',
      'Custom reports'
    ],
    limits: {
      users: 25,
      vessels: 10,
      crew_members: 500,
      storage_gb: 50,
      ai_requests_month: 5000,
      api_calls_month: 50000
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large fleets and shipping companies',
    price_monthly: 999,
    price_yearly: 9990,
    currency: 'USD',
    features: [
      'Unlimited users',
      'Unlimited vessels',
      'Unlimited crew members',
      'Full compliance suite + audits',
      'Advanced AI with custom training',
      'Dedicated support manager',
      '500 GB storage',
      'Full API access',
      'Custom integrations',
      'SSO / SAML',
      'White-label option',
      'SLA guarantee'
    ],
    limits: {
      users: -1, // Unlimited
      vessels: -1,
      crew_members: -1,
      storage_gb: 500,
      ai_requests_month: -1,
      api_calls_month: -1
    }
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Tailored solutions for unique requirements',
    price_monthly: -1, // Contact sales
    price_yearly: -1,
    currency: 'USD',
    features: [
      'Everything in Enterprise',
      'Custom limits',
      'Custom features',
      'On-premise deployment option',
      'Dedicated infrastructure',
      'Custom SLA',
      'Training included',
      'Data migration assistance'
    ],
    limits: {
      users: -1,
      vessels: -1,
      crew_members: -1,
      storage_gb: -1,
      ai_requests_month: -1,
      api_calls_month: -1
    }
  }
];

class SubscriptionService {
  private static instance: SubscriptionService;

  private constructor() {}

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // Obter todos os planos
  getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  // Obter plano por ID
  getPlan(planId: string): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(p => p.id === planId) || null;
  }

  // Calcular preço com desconto anual
  calculateYearlySavings(planId: string): { monthly: number; yearly: number; savings: number; savingsPercent: number } {
    const plan = this.getPlan(planId);
    if (!plan || plan.price_monthly <= 0) {
      return { monthly: 0, yearly: 0, savings: 0, savingsPercent: 0 };
    }

    const monthly = plan.price_monthly;
    const yearly = plan.price_yearly;
    const monthlyIfYearly = yearly / 12;
    const savings = (monthly * 12) - yearly;
    const savingsPercent = Math.round((savings / (monthly * 12)) * 100);

    return { monthly, yearly, savings, savingsPercent };
  }

  // Verificar se uso está dentro dos limites
  checkLimits(planId: string, usage: Partial<UsageMetrics>): { 
    withinLimits: boolean; 
    exceeded: string[];
    approaching: string[];
  } {
    const plan = this.getPlan(planId);
    if (!plan) {
      return { withinLimits: false, exceeded: ['plan_not_found'], approaching: [] };
    }

    const exceeded: string[] = [];
    const approaching: string[] = [];

    const checkLimit = (limitValue: number, currentValue: number | undefined, name: string) => {
      if (limitValue === -1 || currentValue === undefined) return; // Unlimited
      
      const usagePercent = (currentValue / limitValue) * 100;
      
      if (currentValue > limitValue) {
        exceeded.push(name);
      } else if (usagePercent >= 80) {
        approaching.push(name);
      }
    };

    checkLimit(plan.limits.users, usage.users_count, 'users');
    checkLimit(plan.limits.vessels, usage.vessels_count, 'vessels');
    checkLimit(plan.limits.crew_members, usage.crew_members_count, 'crew_members');
    checkLimit(plan.limits.storage_gb, usage.storage_used_gb, 'storage');
    checkLimit(plan.limits.ai_requests_month, usage.ai_requests_count, 'ai_requests');
    checkLimit(plan.limits.api_calls_month, usage.api_calls_count, 'api_calls');

    return {
      withinLimits: exceeded.length === 0,
      exceeded,
      approaching
    };
  }

  // Obter plano recomendado baseado no uso
  recommendPlan(usage: Partial<UsageMetrics>): SubscriptionPlan {
    // Encontrar o menor plano que acomoda o uso
    for (const plan of SUBSCRIPTION_PLANS) {
      if (plan.id === 'custom') continue;
      
      const { withinLimits } = this.checkLimits(plan.id, usage);
      if (withinLimits) {
        return plan;
      }
    }

    // Se nenhum plano padrão acomoda, retornar Enterprise
    return SUBSCRIPTION_PLANS.find(p => p.id === 'enterprise')!;
  }

  // Comparar features entre planos
  compareFeatures(planIds: string[]): Map<string, Map<string, boolean | string>> {
    const comparison = new Map<string, Map<string, boolean | string>>();
    
    // Coletar todas as features
    const allFeatures = new Set<string>();
    planIds.forEach(planId => {
      const plan = this.getPlan(planId);
      if (plan) {
        plan.features.forEach(f => allFeatures.add(f));
      }
    });

    // Criar matriz de comparação
    allFeatures.forEach(feature => {
      const featureMap = new Map<string, boolean | string>();
      
      planIds.forEach(planId => {
        const plan = this.getPlan(planId);
        if (plan) {
          featureMap.set(planId, plan.features.includes(feature));
        }
      });
      
      comparison.set(feature, featureMap);
    });

    return comparison;
  }

  // Formatar preço
  formatPrice(amount: number, currency: string): string {
    if (amount === -1) return 'Contact Sales';
    if (amount === 0) return 'Free';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Calcular próxima cobrança
  calculateNextBillingDate(subscription: Subscription): Date {
    return new Date(subscription.current_period_end);
  }

  // Verificar se está em trial
  isInTrial(subscription: Subscription): boolean {
    if (!subscription.trial_end) return false;
    return new Date(subscription.trial_end) > new Date();
  }

  // Dias restantes do trial
  trialDaysRemaining(subscription: Subscription): number {
    if (!subscription.trial_end) return 0;
    
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Log de eventos de billing
  logBillingEvent(event: string, data: Record<string, unknown>): void {
    logger.info(`Billing event: ${event}`, data);
  }
}

// Export singleton instance
export const subscriptionService = SubscriptionService.getInstance();
