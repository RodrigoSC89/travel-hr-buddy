/**
 * Module Access Hook
 * Provides reactive module access checking for components
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  checkModuleAccess,
  getAccessibleModules,
  getOrganizationSubscription,
  getAvailablePlans,
  getAllModules,
  trackModuleUsage,
  type BillingPlan,
  type SystemModule,
  type OrganizationSubscription,
  type ModuleSlug
} from '@/lib/billing/module-access';

/**
 * Hook to check if user has access to a specific module
 */
export function useModuleAccess(moduleSlug: ModuleSlug | string) {
  const { organizationId } = useAuth();
  
  return useQuery({
    queryKey: ['module-access', organizationId, moduleSlug],
    queryFn: async () => {
      if (!organizationId) return false;
      return checkModuleAccess(organizationId, moduleSlug);
    },
    enabled: !!organizationId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get all accessible modules for the current organization
 */
export function useAccessibleModules() {
  const { organizationId } = useAuth();
  
  return useQuery({
    queryKey: ['accessible-modules', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return getAccessibleModules(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get current organization subscription
 */
export function useSubscription() {
  const { organizationId } = useAuth();
  
  return useQuery({
    queryKey: ['subscription', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      return getOrganizationSubscription(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get all available plans
 */
export function usePlans() {
  return useQuery({
    queryKey: ['billing-plans'],
    queryFn: getAvailablePlans,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get all available modules
 */
export function useAllModules() {
  return useQuery({
    queryKey: ['all-modules'],
    queryFn: getAllModules,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook for tracking module usage
 */
export function useModuleTracking() {
  const { organizationId } = useAuth();
  
  return {
    trackUsage: async (
      moduleSlug: string,
      action: string,
      route?: string,
      metadata?: Record<string, unknown>
    ) => {
      if (!organizationId) return;
      await trackModuleUsage(organizationId, moduleSlug, action, route, metadata);
    }
  };
}

/**
 * Hook to check multiple module accesses at once
 */
export function useMultipleModuleAccess(moduleSlugs: string[]) {
  const { organizationId } = useAuth();
  
  return useQuery({
    queryKey: ['module-access-multiple', organizationId, moduleSlugs.join(',')],
    queryFn: async () => {
      if (!organizationId) return {};
      
      const results: Record<string, boolean> = {};
      await Promise.all(
        moduleSlugs.map(async (slug) => {
          results[slug] = await checkModuleAccess(organizationId, slug);
        })
      );
      return results;
    },
    enabled: !!organizationId && moduleSlugs.length > 0,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export type { BillingPlan, SystemModule, OrganizationSubscription, ModuleSlug };
