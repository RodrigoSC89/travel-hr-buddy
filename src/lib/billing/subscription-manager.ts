/**
 * Subscription Manager - PROMPT 17
 * Billing and subscription management
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  limits: {
    vessels: number;
    crew: number;
    storage: number; // GB
    apiCalls: number;
    users: number;
  };
  isPopular?: boolean;
}

export interface Subscription {
  id: string;
  planId: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface UsageMetrics {
  vessels: number;
  crew: number;
  storage: number;
  apiCalls: number;
  users: number;
}

// Available plans
export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Para pequenas operações marítimas",
    priceMonthly: 299,
    priceYearly: 2990,
    currency: "USD",
    features: [
      "Até 5 embarcações",
      "Até 50 tripulantes",
      "10 GB de armazenamento",
      "Relatórios básicos",
      "Suporte por email",
    ],
    limits: {
      vessels: 5,
      crew: 50,
      storage: 10,
      apiCalls: 10000,
      users: 5,
    },
  },
  {
    id: "professional",
    name: "Professional",
    description: "Para empresas em crescimento",
    priceMonthly: 799,
    priceYearly: 7990,
    currency: "USD",
    features: [
      "Até 20 embarcações",
      "Até 200 tripulantes",
      "50 GB de armazenamento",
      "Relatórios avançados",
      "IA & Analytics",
      "Suporte prioritário",
      "API Access",
    ],
    limits: {
      vessels: 20,
      crew: 200,
      storage: 50,
      apiCalls: 50000,
      users: 20,
    },
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para grandes frotas",
    priceMonthly: 1999,
    priceYearly: 19990,
    currency: "USD",
    features: [
      "Embarcações ilimitadas",
      "Tripulantes ilimitados",
      "500 GB de armazenamento",
      "Todos os recursos",
      "SLA garantido",
      "Suporte 24/7",
      "API ilimitada",
      "Custom integrations",
      "Dedicated account manager",
    ],
    limits: {
      vessels: -1, // unlimited
      crew: -1,
      storage: 500,
      apiCalls: -1,
      users: -1,
    },
  },
];

class SubscriptionManager {
  private currentSubscription: Subscription | null = null;
  private usageMetrics: UsageMetrics = {
    vessels: 0,
    crew: 0,
    storage: 0,
    apiCalls: 0,
    users: 0,
  };

  /**
   * Load current subscription
   * Note: Uses local storage for demo - in production would use Stripe webhooks
   */
  async loadSubscription(): Promise<Subscription | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check local storage for subscription (demo mode)
      const storedSub = localStorage.getItem(`subscription_${user.id}`);
      if (storedSub) {
        const parsed = JSON.parse(storedSub);
        this.currentSubscription = {
          id: parsed.id,
          planId: parsed.planId || "starter",
          status: parsed.status || "active",
          currentPeriodStart: new Date(parsed.currentPeriodStart || Date.now()),
          currentPeriodEnd: new Date(parsed.currentPeriodEnd || Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: parsed.cancelAtPeriodEnd || false,
        };
      } else {
        // Default to starter plan for demo
        this.currentSubscription = {
          id: crypto.randomUUID(),
          planId: "starter",
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        };
      }

      return this.currentSubscription;
    } catch (error) {
      logger.error("Failed to load subscription", { error });
      return null;
    }
  }

  /**
   * Get current plan
   */
  getCurrentPlan(): Plan | null {
    if (!this.currentSubscription) return null;
    return PLANS.find(p => p.id === this.currentSubscription?.planId) || null;
  }

  /**
   * Check feature access
   */
  hasFeature(feature: string): boolean {
    const plan = this.getCurrentPlan();
    if (!plan) return false;
    return plan.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  }

  /**
   * Check limit
   */
  isWithinLimit(resource: keyof UsageMetrics): boolean {
    const plan = this.getCurrentPlan();
    if (!plan) return false;

    const limit = plan.limits[resource];
    if (limit === -1) return true; // unlimited

    return this.usageMetrics[resource] < limit;
  }

  /**
   * Get usage percentage
   */
  getUsagePercentage(resource: keyof UsageMetrics): number {
    const plan = this.getCurrentPlan();
    if (!plan) return 0;

    const limit = plan.limits[resource];
    if (limit === -1) return 0; // unlimited

    return Math.round((this.usageMetrics[resource] / limit) * 100);
  }

  /**
   * Load usage metrics
   */
  async loadUsageMetrics(): Promise<UsageMetrics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return this.usageMetrics;

      // Get vessel count
      const { count: vesselCount } = await supabase
        .from("vessels")
        .select("*", { count: "exact", head: true });

      // Get crew count
      const { count: crewCount } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true });

      // Get user count
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      this.usageMetrics = {
        vessels: vesselCount || 0,
        crew: crewCount || 0,
        storage: 0, // Would need storage bucket stats
        apiCalls: 0, // Would need API logs
        users: userCount || 0,
      };

      return this.usageMetrics;
    } catch (error) {
      logger.error("Failed to load usage metrics", { error });
      return this.usageMetrics;
    }
  }

  /**
   * Get upgrade suggestions
   */
  getUpgradeSuggestions(): string[] {
    const suggestions: string[] = [];
    const plan = this.getCurrentPlan();
    
    if (!plan) return ["Faça upgrade para um plano pago para desbloquear recursos"];

    if (this.getUsagePercentage("vessels") > 80) {
      suggestions.push("Você está próximo do limite de embarcações. Considere fazer upgrade.");
    }

    if (this.getUsagePercentage("crew") > 80) {
      suggestions.push("Você está próximo do limite de tripulantes. Considere fazer upgrade.");
    }

    if (this.getUsagePercentage("storage") > 80) {
      suggestions.push("Seu armazenamento está quase cheio. Considere fazer upgrade.");
    }

    return suggestions;
  }

  /**
   * Get all plans
   */
  getPlans(): Plan[] {
    return PLANS;
  }

  /**
   * Get subscription status
   */
  getSubscription(): Subscription | null {
    return this.currentSubscription;
  }

  /**
   * Get usage metrics
   */
  getUsageMetrics(): UsageMetrics {
    return { ...this.usageMetrics };
  }

  /**
   * Check if subscription is active
   */
  isActive(): boolean {
    return this.currentSubscription?.status === "active" || 
           this.currentSubscription?.status === "trialing";
  }

  /**
   * Check if trial
   */
  isTrial(): boolean {
    return this.currentSubscription?.status === "trialing";
  }

  /**
   * Days until renewal
   */
  getDaysUntilRenewal(): number {
    if (!this.currentSubscription) return 0;
    const diff = this.currentSubscription.currentPeriodEnd.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}

export const subscriptionManager = new SubscriptionManager();
