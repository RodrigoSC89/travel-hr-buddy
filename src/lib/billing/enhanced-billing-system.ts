/**
 * Enhanced Billing System - PROMPT 17
 * Complete billing with usage tracking and subscription management
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: PlanFeature[];
  limits: PlanLimits;
  trial_days: number;
  popular: boolean;
  enterprise: boolean;
}

export interface PlanFeature {
  feature_id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  vessels: number;
  users: number;
  storage_gb: number;
  api_calls_monthly: number;
  support_level: 'basic' | 'priority' | 'dedicated';
}

export interface UsageMetrics {
  organization_id: string;
  period_start: string;
  period_end: string;
  vessels_used: number;
  active_users: number;
  storage_used_gb: number;
  api_calls_made: number;
  features_used: string[];
  overage_fees: UsageOverage[];
}

export interface UsageOverage {
  resource_type: 'vessels' | 'users' | 'storage' | 'api_calls';
  plan_limit: number;
  actual_usage: number;
  overage_amount: number;
  cost_per_unit: number;
  total_overage_cost: number;
}

export interface BillingInvoice {
  invoice_id: string;
  organization_id: string;
  period_start: string;
  period_end: string;
  subscription_cost: number;
  usage_costs: number;
  overage_costs: number;
  discounts: number;
  taxes: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  payment_method?: PaymentMethod;
  line_items: BillingLineItem[];
}

export interface BillingLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  type: 'subscription' | 'usage' | 'overage' | 'discount' | 'tax';
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_transfer' | 'invoice';
  last_four?: string;
  expires_at?: string;
  preferred: boolean;
}

export interface BillingAlert {
  alert_id: string;
  organization_id: string;
  alert_type: 'usage_warning' | 'overage' | 'payment_failed' | 'trial_ending' | 'plan_upgrade_suggested';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  created_at: string;
  acknowledged: boolean;
  action_required: boolean;
  suggested_actions: string[];
}

// Available subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small fleets getting started with digital maritime management',
    price_monthly: 299,
    price_yearly: 2990, // 2 months free
    trial_days: 14,
    popular: false,
    enterprise: false,
    features: [
      { feature_id: 'crew_management', name: 'Crew Management', description: 'Basic crew tracking and certificates', included: true },
      { feature_id: 'document_storage', name: 'Document Storage', description: 'Secure document management', included: true },
      { feature_id: 'basic_reports', name: 'Basic Reports', description: 'Standard operational reports', included: true },
      { feature_id: 'email_support', name: 'Email Support', description: 'Business hours support', included: true },
      { feature_id: 'ai_assistant', name: 'AI Assistant', description: 'Basic AI assistance', included: false, limit: 50 }
    ],
    limits: {
      vessels: 5,
      users: 25,
      storage_gb: 100,
      api_calls_monthly: 10000,
      support_level: 'basic'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced features for growing maritime operations',
    price_monthly: 799,
    price_yearly: 7990,
    trial_days: 14,
    popular: true,
    enterprise: false,
    features: [
      { feature_id: 'crew_management', name: 'Advanced Crew Management', description: 'Full crew lifecycle management', included: true },
      { feature_id: 'document_storage', name: 'Advanced Document Storage', description: 'AI-powered document insights', included: true },
      { feature_id: 'advanced_reports', name: 'Advanced Reports', description: 'Custom reports and analytics', included: true },
      { feature_id: 'priority_support', name: 'Priority Support', description: '24/7 priority support', included: true },
      { feature_id: 'ai_assistant', name: 'AI Assistant Pro', description: 'Advanced AI capabilities', included: true },
      { feature_id: 'compliance_automation', name: 'Compliance Automation', description: 'Automated compliance tracking', included: true },
      { feature_id: 'predictive_maintenance', name: 'Predictive Maintenance', description: 'AI-powered maintenance predictions', included: true }
    ],
    limits: {
      vessels: 20,
      users: 100,
      storage_gb: 500,
      api_calls_monthly: 100000,
      support_level: 'priority'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for large maritime organizations',
    price_monthly: 1999,
    price_yearly: 19990,
    trial_days: 30,
    popular: false,
    enterprise: true,
    features: [
      { feature_id: 'unlimited_features', name: 'All Features', description: 'Access to all platform features', included: true },
      { feature_id: 'dedicated_support', name: 'Dedicated Support', description: 'Dedicated customer success manager', included: true },
      { feature_id: 'custom_integrations', name: 'Custom Integrations', description: 'Custom API integrations', included: true },
      { feature_id: 'advanced_security', name: 'Advanced Security', description: 'SOC 2, GDPR compliance', included: true },
      { feature_id: 'on_premise_option', name: 'On-Premise Option', description: 'Private cloud deployment', included: true }
    ],
    limits: {
      vessels: -1, // Unlimited
      users: -1, // Unlimited
      storage_gb: -1, // Unlimited
      api_calls_monthly: -1, // Unlimited
      support_level: 'dedicated'
    }
  }
];

class EnhancedBillingSystem {
  /**
   * Calculate usage for billing period
   */
  calculateUsage(
    organizationId: string,
    periodStart: string,
    periodEnd: string,
    plan: SubscriptionPlan
  ): UsageMetrics {
    // In production, this would query actual usage data
    const simulatedUsage = {
      vessels_used: Math.floor(Math.random() * (plan.limits.vessels + 5)),
      active_users: Math.floor(Math.random() * (plan.limits.users + 10)),
      storage_used_gb: Math.floor(Math.random() * (plan.limits.storage_gb + 50)),
      api_calls_made: Math.floor(Math.random() * (plan.limits.api_calls_monthly + 5000)),
      features_used: plan.features.filter(f => f.included).map(f => f.feature_id)
    };

    const overage_fees: UsageOverage[] = [];

    // Check for overages
    if (plan.limits.vessels > 0 && simulatedUsage.vessels_used > plan.limits.vessels) {
      overage_fees.push({
        resource_type: 'vessels',
        plan_limit: plan.limits.vessels,
        actual_usage: simulatedUsage.vessels_used,
        overage_amount: simulatedUsage.vessels_used - plan.limits.vessels,
        cost_per_unit: 50, // $50 per additional vessel
        total_overage_cost: (simulatedUsage.vessels_used - plan.limits.vessels) * 50
      });
    }

    if (plan.limits.users > 0 && simulatedUsage.active_users > plan.limits.users) {
      overage_fees.push({
        resource_type: 'users',
        plan_limit: plan.limits.users,
        actual_usage: simulatedUsage.active_users,
        overage_amount: simulatedUsage.active_users - plan.limits.users,
        cost_per_unit: 25, // $25 per additional user
        total_overage_cost: (simulatedUsage.active_users - plan.limits.users) * 25
      });
    }

    if (plan.limits.storage_gb > 0 && simulatedUsage.storage_used_gb > plan.limits.storage_gb) {
      overage_fees.push({
        resource_type: 'storage',
        plan_limit: plan.limits.storage_gb,
        actual_usage: simulatedUsage.storage_used_gb,
        overage_amount: simulatedUsage.storage_used_gb - plan.limits.storage_gb,
        cost_per_unit: 0.50, // $0.50 per additional GB
        total_overage_cost: (simulatedUsage.storage_used_gb - plan.limits.storage_gb) * 0.50
      });
    }

    return {
      organization_id: organizationId,
      period_start: periodStart,
      period_end: periodEnd,
      ...simulatedUsage,
      overage_fees
    };
  }

  /**
   * Generate invoice for billing period
   */
  generateInvoice(
    organizationId: string,
    plan: SubscriptionPlan,
    usage: UsageMetrics,
    billingCycle: 'monthly' | 'yearly'
  ): BillingInvoice {
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days to pay

    const subscriptionCost = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
    const usageCosts = 0; // Base plan includes usage
    const overageCosts = usage.overage_fees.reduce((sum, o) => sum + o.total_overage_cost, 0);
    const discounts = billingCycle === 'yearly' ? subscriptionCost * 0.1 : 0; // 10% yearly discount
    const subtotal = subscriptionCost + usageCosts + overageCosts - discounts;
    const taxes = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + taxes;

    const lineItems: BillingLineItem[] = [
      {
        description: `${plan.name} Plan - ${billingCycle}`,
        quantity: 1,
        unit_price: subscriptionCost,
        total: subscriptionCost,
        type: 'subscription'
      }
    ];

    // Add overage line items
    usage.overage_fees.forEach(overage => {
      lineItems.push({
        description: `${overage.resource_type} overage (${overage.overage_amount} units)`,
        quantity: overage.overage_amount,
        unit_price: overage.cost_per_unit,
        total: overage.total_overage_cost,
        type: 'overage'
      });
    });

    // Add discount if applicable
    if (discounts > 0) {
      lineItems.push({
        description: 'Annual billing discount (10%)',
        quantity: 1,
        unit_price: -discounts,
        total: -discounts,
        type: 'discount'
      });
    }

    // Add taxes
    lineItems.push({
      description: 'Taxes (8%)',
      quantity: 1,
      unit_price: taxes,
      total: taxes,
      type: 'tax'
    });

    return {
      invoice_id: `INV-${Date.now()}-${organizationId.slice(-6)}`,
      organization_id: organizationId,
      period_start: usage.period_start,
      period_end: usage.period_end,
      subscription_cost: subscriptionCost,
      usage_costs: usageCosts,
      overage_costs: overageCosts,
      discounts,
      taxes,
      total_amount: Math.round(totalAmount * 100) / 100,
      currency: 'USD',
      status: 'draft',
      due_date: dueDate.toISOString(),
      line_items: lineItems
    };
  }

  /**
   * Monitor usage and generate alerts
   */
  monitorUsageAlerts(
    usage: UsageMetrics,
    plan: SubscriptionPlan
  ): BillingAlert[] {
    const alerts: BillingAlert[] = [];
    const now = new Date().toISOString();

    // Check vessel usage
    if (plan.limits.vessels > 0) {
      const vesselsUsagePercent = (usage.vessels_used / plan.limits.vessels) * 100;
      
      if (vesselsUsagePercent >= 100) {
        alerts.push({
          alert_id: `vessels-overage-${Date.now()}`,
          organization_id: usage.organization_id,
          alert_type: 'overage',
          severity: 'critical',
          title: 'Vessel Limit Exceeded',
          message: `You have ${usage.vessels_used} vessels but your plan allows ${plan.limits.vessels}. Additional charges will apply.`,
          created_at: now,
          acknowledged: false,
          action_required: true,
          suggested_actions: ['Upgrade plan', 'Remove inactive vessels', 'Contact sales']
        });
      } else if (vesselsUsagePercent >= 80) {
        alerts.push({
          alert_id: `vessels-warning-${Date.now()}`,
          organization_id: usage.organization_id,
          alert_type: 'usage_warning',
          severity: 'warning',
          title: 'Approaching Vessel Limit',
          message: `You're using ${usage.vessels_used} of ${plan.limits.vessels} allowed vessels (${vesselsUsagePercent.toFixed(0)}%).`,
          created_at: now,
          acknowledged: false,
          action_required: false,
          suggested_actions: ['Consider upgrading plan', 'Review vessel utilization']
        });
      }
    }

    // Check user usage
    if (plan.limits.users > 0) {
      const usersUsagePercent = (usage.active_users / plan.limits.users) * 100;
      
      if (usersUsagePercent >= 100) {
        alerts.push({
          alert_id: `users-overage-${Date.now()}`,
          organization_id: usage.organization_id,
          alert_type: 'overage',
          severity: 'critical',
          title: 'User Limit Exceeded',
          message: `You have ${usage.active_users} active users but your plan allows ${plan.limits.users}.`,
          created_at: now,
          acknowledged: false,
          action_required: true,
          suggested_actions: ['Upgrade plan', 'Deactivate unused accounts']
        });
      }
    }

    // Check storage usage
    if (plan.limits.storage_gb > 0) {
      const storageUsagePercent = (usage.storage_used_gb / plan.limits.storage_gb) * 100;
      
      if (storageUsagePercent >= 90) {
        alerts.push({
          alert_id: `storage-warning-${Date.now()}`,
          organization_id: usage.organization_id,
          alert_type: 'usage_warning',
          severity: 'warning',
          title: 'Storage Nearly Full',
          message: `You're using ${usage.storage_used_gb}GB of ${plan.limits.storage_gb}GB storage (${storageUsagePercent.toFixed(0)}%).`,
          created_at: now,
          acknowledged: false,
          action_required: false,
          suggested_actions: ['Archive old documents', 'Upgrade storage plan', 'Clean up unused files']
        });
      }
    }

    return alerts;
  }

  /**
   * Recommend plan upgrade based on usage
   */
  recommendPlanUpgrade(
    currentPlan: SubscriptionPlan,
    usage: UsageMetrics
  ): {
    should_upgrade: boolean;
    recommended_plan?: SubscriptionPlan;
    reasons: string[];
    projected_savings?: number;
  } {
    const reasons: string[] = [];
    let shouldUpgrade = false;

    // Check if current usage exceeds plan limits
    const overageCount = usage.overage_fees.length;
    const totalOverageCost = usage.overage_fees.reduce((sum, o) => sum + o.total_overage_cost, 0);

    if (overageCount > 0) {
      reasons.push(`Currently paying ${totalOverageCost.toFixed(2)} in overage fees`);
      shouldUpgrade = true;
    }

    // Find recommended plan
    let recommendedPlan: SubscriptionPlan | undefined;
    let projectedSavings: number | undefined;

    if (shouldUpgrade) {
      const availablePlans = SUBSCRIPTION_PLANS.filter(p => 
        (p.limits.vessels === -1 || p.limits.vessels >= usage.vessels_used) &&
        (p.limits.users === -1 || p.limits.users >= usage.active_users) &&
        (p.limits.storage_gb === -1 || p.limits.storage_gb >= usage.storage_used_gb) &&
        (p.limits.api_calls_monthly === -1 || p.limits.api_calls_monthly >= usage.api_calls_made)
      );

      recommendedPlan = availablePlans
        .filter(p => p.price_monthly > currentPlan.price_monthly)
        .sort((a, b) => a.price_monthly - b.price_monthly)[0];

      if (recommendedPlan) {
        const newPlanCost = recommendedPlan.price_monthly;
        const currentCostWithOverages = currentPlan.price_monthly + totalOverageCost;
        projectedSavings = currentCostWithOverages - newPlanCost;

        if (projectedSavings > 0) {
          reasons.push(`Would save $${projectedSavings.toFixed(2)}/month by upgrading`);
        }
        
        reasons.push(`Get ${recommendedPlan.features.length - currentPlan.features.length} additional features`);
      }
    }

    return {
      should_upgrade: shouldUpgrade && !!recommendedPlan,
      recommended_plan: recommendedPlan,
      reasons,
      projected_savings: projectedSavings
    };
  }

  /**
   * Process subscription change
   */
  processSubscriptionChange(
    organizationId: string,
    fromPlanId: string,
    toPlanId: string,
    effectiveDate: string = new Date().toISOString()
  ): {
    success: boolean;
    proration_amount?: number;
    next_billing_date?: string;
    error?: string;
  } {
    const fromPlan = SUBSCRIPTION_PLANS.find(p => p.id === fromPlanId);
    const toPlan = SUBSCRIPTION_PLANS.find(p => p.id === toPlanId);

    if (!fromPlan || !toPlan) {
      return { success: false, error: 'Invalid plan IDs' };
    }

    // Calculate proration (simplified)
    const now = new Date();
    const daysInMonth = 30;
    const daysRemaining = daysInMonth - now.getDate();
    const prorationFactor = daysRemaining / daysInMonth;

    const fromPlanDailyRate = fromPlan.price_monthly / daysInMonth;
    const toPlanDailyRate = toPlan.price_monthly / daysInMonth;
    
    const prorationAmount = (toPlanDailyRate - fromPlanDailyRate) * daysRemaining;

    // Next billing date (simplified)
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    nextBillingDate.setDate(1);

    return {
      success: true,
      proration_amount: Math.round(prorationAmount * 100) / 100,
      next_billing_date: nextBillingDate.toISOString()
    };
  }

  /**
   * Generate billing dashboard data
   */
  getDashboardData(organizationId: string): {
    current_plan: SubscriptionPlan;
    usage_summary: UsageMetrics;
    recent_invoices: BillingInvoice[];
    alerts: BillingAlert[];
    usage_trends: { metric: string; trend: number[]; percentage_of_limit: number }[];
  } {
    const currentPlan = SUBSCRIPTION_PLANS[1]; // Professional as default
    const usage = this.calculateUsage(organizationId, 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      new Date().toISOString(),
      currentPlan
    );

    const alerts = this.monitorUsageAlerts(usage, currentPlan);

    const usageTrends = [
      {
        metric: 'Vessels',
        trend: [15, 16, 18, 17, usage.vessels_used],
        percentage_of_limit: (usage.vessels_used / currentPlan.limits.vessels) * 100
      },
      {
        metric: 'Users',
        trend: [65, 68, 72, 75, usage.active_users],
        percentage_of_limit: (usage.active_users / currentPlan.limits.users) * 100
      },
      {
        metric: 'Storage (GB)',
        trend: [280, 295, 315, 340, usage.storage_used_gb],
        percentage_of_limit: (usage.storage_used_gb / currentPlan.limits.storage_gb) * 100
      }
    ];

    return {
      current_plan: currentPlan,
      usage_summary: usage,
      recent_invoices: [], // Would be populated from database
      alerts,
      usage_trends: usageTrends
    };
  }
}

export const enhancedBillingSystem = new EnhancedBillingSystem();