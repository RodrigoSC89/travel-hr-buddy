/**
 * Module Access Control System
 * Nauti One v4.0 - Modular SaaS Architecture
 */

import { supabase } from "@/integrations/supabase/client";

export interface BillingPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly_brl: number;
  price_monthly_usd: number;
  price_monthly_eur: number;
  stripe_price_id_brl: string | null;
  stripe_price_id_usd: string | null;
  stripe_price_id_eur: string | null;
  max_users: number | null;
  max_vessels: number | null;
  is_active: boolean;
  is_enterprise: boolean;
  trial_days: number;
  features: string[];
  sort_order: number;
}

export interface SystemModule {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  category: 'core' | 'operations' | 'compliance' | 'ai' | 'analytics';
  is_core: boolean;
  price_addon_brl: number;
  price_addon_usd: number;
  features: string[];
  routes: string[];
  is_active: boolean;
  sort_order: number;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  canceled_at: string | null;
  cancel_at_period_end: boolean;
  currency: string;
  plan?: BillingPlan;
}

// Cache for module access checks
const moduleAccessCache = new Map<string, { hasAccess: boolean; expiresAt: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Check if organization has access to a specific module
 */
export async function checkModuleAccess(
  organizationId: string,
  moduleSlug: string
): Promise<boolean> {
  const cacheKey = `${organizationId}:${moduleSlug}`;
  const cached = moduleAccessCache.get(cacheKey);
  
  if (cached && cached.expiresAt > Date.now()) {
    return cached.hasAccess;
  }
  
  try {
    const { data, error } = await supabase
      .rpc('has_module_access', {
        p_organization_id: organizationId,
        p_module_slug: moduleSlug
      });
    
    if (error) {
      console.error('Error checking module access:', error);
      return false;
    }
    
    moduleAccessCache.set(cacheKey, {
      hasAccess: data ?? false,
      expiresAt: Date.now() + CACHE_TTL
    });
    
    return data ?? false;
  } catch (error) {
    console.error('Error checking module access:', error);
    return false;
  }
}

/**
 * Get all modules the organization has access to
 */
export async function getAccessibleModules(organizationId: string): Promise<SystemModule[]> {
  try {
    // Get subscription with plan
    const { data: subscription } = await supabase
      .from('organization_subscriptions')
      .select(`
        *,
        billing_plans (*)
      `)
      .eq('organization_id', organizationId)
      .in('status', ['active', 'trialing'])
      .maybeSingle();
    
    if (!subscription) {
      // Return only core modules if no subscription
      const { data: coreModules } = await supabase
        .from('system_modules')
        .select('*')
        .eq('is_core', true)
        .eq('is_active', true);
      
      return (coreModules as unknown as SystemModule[]) || [];
    }
    
    // Get modules from plan
    const { data: planModules } = await supabase
      .from('plan_modules')
      .select(`
        system_modules (*)
      `)
      .eq('plan_id', subscription.plan_id);
    
    // Get addon modules
    const { data: addonModules } = await supabase
      .from('organization_addons')
      .select(`
        system_modules (*)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active');
    
    const modules = new Map<string, SystemModule>();
    
    // Add plan modules
    planModules?.forEach(pm => {
      const mod = (pm as any).system_modules as SystemModule;
      if (mod) modules.set(mod.id, mod);
    });
    
    // Add addon modules
    addonModules?.forEach(am => {
      const mod = (am as any).system_modules as SystemModule;
      if (mod) modules.set(mod.id, mod);
    });
    
    return Array.from(modules.values());
  } catch (error) {
    console.error('Error getting accessible modules:', error);
    return [];
  }
}

/**
 * Get organization's current subscription
 */
export async function getOrganizationSubscription(
  organizationId: string
): Promise<OrganizationSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('organization_subscriptions')
      .select(`
        *,
        billing_plans (*)
      `)
      .eq('organization_id', organizationId)
      .maybeSingle();
    
    if (error || !data) return null;
    
    return {
      ...data,
      plan: (data as any).billing_plans as BillingPlan
    } as OrganizationSubscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Get all available plans
 */
export async function getAvailablePlans(): Promise<BillingPlan[]> {
  try {
    const { data, error } = await supabase
      .from('billing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) throw error;
    return (data as unknown as BillingPlan[]) || [];
  } catch (error) {
    console.error('Error getting plans:', error);
    return [];
  }
}

/**
 * Get all available modules
 */
export async function getAllModules(): Promise<SystemModule[]> {
  try {
    const { data, error } = await supabase
      .from('system_modules')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) throw error;
    return (data as unknown as SystemModule[]) || [];
  } catch (error) {
    console.error('Error getting modules:', error);
    return [];
  }
}

/**
 * Get modules included in a plan
 */
export async function getPlanModules(planId: string): Promise<SystemModule[]> {
  try {
    const { data, error } = await supabase
      .from('plan_modules')
      .select(`
        system_modules (*)
      `)
      .eq('plan_id', planId);
    
    if (error) throw error;
    
    return data?.map(pm => (pm as any).system_modules as SystemModule).filter(Boolean) || [];
  } catch (error) {
    console.error('Error getting plan modules:', error);
    return [];
  }
}

/**
 * Track module usage
 */
export async function trackModuleUsage(
  organizationId: string,
  moduleSlug: string,
  action: string,
  route?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: module } = await supabase
      .from('system_modules')
      .select('id')
      .eq('slug', moduleSlug)
      .maybeSingle();
    
    if (!module) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    
    await (supabase as any).from('module_usage').insert({
      organization_id: organizationId,
      module_id: module.id,
      user_id: user?.id,
      action,
      route,
      metadata: metadata || {}
    });
  } catch (error) {
    // Silent fail for usage tracking
    console.error('Error tracking module usage:', error);
  }
}

/**
 * Clear module access cache
 */
export function clearModuleAccessCache(organizationId?: string): void {
  if (organizationId) {
    for (const key of moduleAccessCache.keys()) {
      if (key.startsWith(`${organizationId}:`)) {
        moduleAccessCache.delete(key);
      }
    }
  } else {
    moduleAccessCache.clear();
  }
}

/**
 * Module definitions for the system
 */
export const MODULE_DEFINITIONS = {
  // Core (always included)
  'vessel-digital-twin': { icon: 'Ship', category: 'core' },
  
  // Operations
  'crew-management': { icon: 'Users', category: 'operations' },
  'fleet-management': { icon: 'Anchor', category: 'operations' },
  'documents': { icon: 'FileText', category: 'operations' },
  'payroll': { icon: 'DollarSign', category: 'operations' },
  'voyage-planning': { icon: 'Map', category: 'operations' },
  'charter-management': { icon: 'Briefcase', category: 'operations' },
  
  // Compliance
  'certificates': { icon: 'Award', category: 'compliance' },
  'peotram': { icon: 'ClipboardCheck', category: 'compliance' },
  'peo-dp': { icon: 'Shield', category: 'compliance' },
  'mlc-inspection': { icon: 'Search', category: 'compliance' },
  'safety': { icon: 'AlertTriangle', category: 'compliance' },
  
  // AI
  'ai-hub': { icon: 'Brain', category: 'ai' },
  'voice-assistant': { icon: 'Mic', category: 'ai' },
  'predictive-maintenance': { icon: 'Wrench', category: 'ai' },
  
  // Analytics
  'analytics-dashboard': { icon: 'BarChart3', category: 'analytics' },
  'executive-reports': { icon: 'PieChart', category: 'analytics' },
} as const;

export type ModuleSlug = keyof typeof MODULE_DEFINITIONS;
