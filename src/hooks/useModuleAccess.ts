/**
 * useModuleAccess Hook
 * Controls access to system modules based on subscription plan
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface SystemModule {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  is_core: boolean | null;
  is_addon?: boolean;
  sort_order: number | null;
}

export interface ModuleAccessState {
  modules: SystemModule[];
  enabledModules: string[];
  isLoading: boolean;
  hasAccess: (moduleSlug: string) => boolean;
  canUpgrade: (moduleSlug: string) => boolean;
  trackUsage: (moduleSlug: string, action: string) => Promise<void>;
}

export function useModuleAccess(): ModuleAccessState {
  const { user, organizationId } = useAuth();

  // Fetch all available modules
  const { data: allModules = [], isLoading: loadingModules } = useQuery({
    queryKey: ['system-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_modules')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return (data || []) as SystemModule[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch organization's enabled modules
  const { data: orgModules = [], isLoading: loadingOrgModules } = useQuery({
    queryKey: ['org-modules', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      // Get all modules for now (simplified - can be enhanced with plan check)
      const { data: allMods } = await supabase
        .from('system_modules')
        .select('slug, is_core');
      
      // Return core modules + any org-specific addons
      const coreModules = (allMods || [])
        .filter((m: any) => m.is_core)
        .map((m: any) => m.slug);
      
      // Get addon modules
      const { data: addons } = await supabase
        .from('organization_modules')
        .select('module_id, system_modules(slug)')
        .eq('organization_id', organizationId)
        .is('disabled_at', null);
      
      const addonModules = addons?.map((a: any) => a.system_modules?.slug) || [];
      
      return [...new Set([...coreModules, ...addonModules])];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });

  const hasAccess = (moduleSlug: string): boolean => {
    // Core modules always accessible
    const module = allModules.find(m => m.slug === moduleSlug);
    if (module?.is_core) return true;
    
    // Check if module is in enabled list
    return orgModules.includes(moduleSlug);
  };

  const canUpgrade = (moduleSlug: string): boolean => {
    // Check if module exists and is purchasable
    const module = allModules.find(m => m.slug === moduleSlug);
    return !!module && !hasAccess(moduleSlug);
  };

  const trackUsage = async (moduleSlug: string, action: string): Promise<void> => {
    if (!user?.id || !organizationId) return;
    
    const module = allModules.find(m => m.slug === moduleSlug);
    if (!module) return;
    
    try {
      await supabase.from('module_usage').insert({
        organization_id: organizationId,
        module_id: module.id,
        user_id: user.id,
        action,
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Failed to track module usage:', error);
    }
  };

  return {
    modules: allModules,
    enabledModules: orgModules,
    isLoading: loadingModules || loadingOrgModules,
    hasAccess,
    canUpgrade,
    trackUsage,
  };
}
