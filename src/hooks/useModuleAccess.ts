/**
 * useModuleAccess Hook v2
 * Single source of truth for module access control
 * Admins bypass all checks. Other users need explicit grants.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fromUntyped } from '@/integrations/supabase/untyped-client';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/contexts/DemoContext';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

export interface SystemModule {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  is_core: boolean | null;
  is_active: boolean | null;
  price_addon_brl: number;
  price_addon_usd: number;
  sort_order: number | null;
}

export interface ModuleAccessState {
  modules: SystemModule[];
  enabledModules: string[];
  isLoading: boolean;
  isAdmin: boolean;
  hasAccess: (moduleSlug: string) => boolean;
  canUpgrade: (moduleSlug: string) => boolean;
  requestAccess: (moduleSlug: string, reason?: string) => Promise<void>;
  trackUsage: (moduleSlug: string, action: string) => Promise<void>;
}

/**
 * Route-to-module slug mapping
 * Maps route prefixes to system_modules slugs
 */
export const ROUTE_MODULE_MAP: Record<string, string> = {
  // Mega-Hubs
  '/command': 'dashboard',
  '/ops': 'vessels',
  '/maintenance': 'maintenance',
  '/ai': 'ai-analytics',
  '/tracking': 'iot-telemetry',
  '/compliance': 'compliance',
  '/workbench': 'dashboard',
  
  // Operations
  '/maritime-command': 'vessels',
  '/fleet-command': 'vessels',
  '/voyage-command': 'voyages',
  '/mission-command': 'voyages',
  '/operations-command': 'vessels',
  '/commercial-ops': 'voyages',
  '/charter-party': 'voyages',
  '/laytime-demurrage': 'voyages',
  '/voyage-estimate': 'voyages',
  '/voyage-pnl': 'voyages',
  '/voyage-accounting': 'voyages',
  '/voyage-optimizer': 'voyages',
  '/stowage-plan': 'voyages',
  '/bunker-operations': 'voyages',
  '/noon-report-analytics': 'voyages',
  '/chartering-hub': 'voyages',
  '/port-costs': 'voyages',
  '/pool-distribution': 'voyages',
  '/bridge-link': 'vessels',
  '/digital-twin': 'vessels',

  // Maintenance
  '/maintenance-command': 'maintenance',
  '/predictive-maintenance': 'maintenance',
  '/fuel-management': 'maintenance',
  '/running-hours': 'maintenance',
  '/pms-hub': 'maintenance',
  '/spare-parts': 'maintenance',
  '/impa-spare-parts': 'maintenance',
  '/warranty-claims': 'maintenance',
  '/cap-assessment': 'maintenance',

  // Crew / HR
  '/nautilus-people': 'crew',
  '/crew-management': 'crew',
  '/crew-wellness': 'crew',
  '/crew-scheduler': 'crew',
  '/crew-rotation': 'crew',
  '/crew-travel': 'crew',
  '/crew-appraisal': 'crew',
  '/crew-payroll': 'crew',
  '/crew-planning': 'crew',
  '/crew-competency': 'crew',
  '/crew-change': 'crew',
  '/crew-document-vault': 'crew',
  '/hr-dashboard': 'crew',
  '/hr': 'crew',
  '/payroll': 'crew',
  '/folha-pagamento': 'crew',
  '/time-tracking': 'crew',
  '/employee-portal': 'crew',
  '/portal-colaborador': 'crew',
  '/people-analytics': 'crew',
  '/medical-infirmary': 'crew',
  '/users': 'crew',
  '/recruitment': 'crew',

  // Documents
  '/documents': 'documents',
  '/templates': 'documents',
  '/document-workflow': 'documents',
  '/export-center': 'documents',
  '/reports-command': 'documents',
  '/reports': 'documents',

  // Finance
  '/finance-ai': 'finance',
  '/finance-procurement-ai': 'finance',
  '/company-financials': 'finance',
  '/budget-opex': 'finance',
  '/freight-invoicing': 'finance',
  '/procurement': 'procurement',
  '/tc-charter': 'finance',
  '/insurance-pi': 'finance',
  '/pi-claims': 'finance',

  // Compliance & Audits
  '/audit-agents': 'audits',
  '/audit-ai-chat': 'audits',
  '/ai-audit': 'audits',
  '/peo-dp': 'compliance',
  '/lvs-aceitacao-petrobras': 'compliance',
  '/sgso': 'sgso',
  '/pre-ovid': 'compliance',
  '/mlc-inspection': 'compliance',
  '/psc-package': 'compliance',
  '/pre-sire': 'compliance',
  '/tmsa-assessment': 'compliance',
  '/solas-inspection': 'compliance',
  '/compliance-roadmap': 'compliance',
  '/compliance-dashboard': 'compliance',
  '/compliance-executive': 'compliance',
  '/ism-code': 'sgso',
  '/sire2-vetting': 'compliance',
  '/stcw-mlc': 'compliance',
  '/flag-state': 'compliance',
  '/regulatory-radar': 'compliance',
  '/permit-to-work': 'compliance',
  '/ship-vetting': 'compliance',
  '/psc-history': 'compliance',
  '/security-center': 'security',
  '/auditoria-seguranca': 'security',
  '/security-scanner': 'security',

  // Training
  '/nautilus-academy': 'training',
  '/solas-isps-training': 'training',
  '/dp-intelligence': 'training',

  // AI & Intelligence
  '/nauti-command': 'ai-analytics',
  '/ai-hub': 'ai-analytics',
  '/ai-analytics': 'ai-analytics',
  '/ai-modules': 'ai-analytics',
  '/ai-observability': 'ai-analytics',
  '/workflow-command': 'ai-analytics',
  '/optimization-dashboard': 'ai-analytics',
  '/unified-optimization': 'ai-analytics',
  '/agent-orchestration': 'ai-analytics',
  '/ai-enterprise-engines': 'ai-analytics',
  '/computer-vision-inspector': 'ai-analytics',
  '/voice-copilot': 'ai-analytics',

  // Tracking & IoT
  '/telemetria': 'iot-telemetry',
  '/telemetria-command': 'iot-telemetry',
  '/vessel-tracking': 'iot-telemetry',
  '/satcom-dashboard': 'iot-telemetry',
  '/ais-tracker-page': 'iot-telemetry',
  '/weather-maritime': 'iot-telemetry',
  '/iot-wearables': 'iot-telemetry',

  // ESG
  '/esg-emissions': 'esg',
  '/waste-management': 'esg',
  '/sustainability-score': 'esg',
  '/eu-ets': 'esg',
  '/energy-efficiency': 'esg',
  '/weather-routing': 'esg',
  '/bunker-optimization-engine': 'esg',

  // Enterprise
  '/enterprise': 'ai-analytics',
  '/advanced': 'ai-analytics',
  
  // System / Admin — always accessible to admins
  '/admin': 'system',
  '/settings': 'system',
  '/integrations': 'system',
  '/quality-dashboard': 'system',
};

/**
 * Get module slug for a given route path
 */
export function getModuleForRoute(path: string): string | null {
  // Try exact match first
  if (ROUTE_MODULE_MAP[path]) return ROUTE_MODULE_MAP[path];
  
  // Try prefix match (longest first)
  const sortedKeys = Object.keys(ROUTE_MODULE_MAP).sort((a, b) => b.length - a.length);
  for (const prefix of sortedKeys) {
    if (path.startsWith(prefix)) return ROUTE_MODULE_MAP[prefix];
  }
  
  return null;
}

export function useModuleAccess(): ModuleAccessState {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const queryClient = useQueryClient();

  // Check if user is admin
  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      return data?.role || 'employee';
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const isAdmin = userRole === 'admin';

  // Fetch all available modules
  const { data: allModules = [], isLoading: loadingModules } = useQuery({
    queryKey: ['system-modules'],
    queryFn: async () => {
      const { data, error } = await fromUntyped('system_modules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return (data || []) as SystemModule[];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fetch user's granted module IDs
  const { data: grantedModuleIds = [], isLoading: loadingGrants } = useQuery({
    queryKey: ['user-module-grants', user?.id],
    queryFn: async () => {
      if (!user?.id || isAdmin) return [];
      const { data, error } = await fromUntyped('user_module_access')
        .select('module_id')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (error) throw error;
      return (data || []).map((d: any) => d.module_id as string);
    },
    enabled: !!user?.id && !isAdmin,
    staleTime: 5 * 60 * 1000,
  });

  // Derive enabled module slugs
  const enabledModules: string[] = isAdmin
    ? allModules.map(m => m.slug)
    : allModules
        .filter(m => m.is_core || grantedModuleIds.includes(m.id))
        .map(m => m.slug);

  const hasAccess = (moduleSlug: string): boolean => {
    if (isDemoMode || isAdmin) return true;
    
    // Core modules always accessible
    const mod = allModules.find(m => m.slug === moduleSlug);
    if (mod?.is_core) return true;
    
    return enabledModules.includes(moduleSlug);
  };

  const canUpgrade = (moduleSlug: string): boolean => {
    const mod = allModules.find(m => m.slug === moduleSlug);
    return !!mod && !hasAccess(moduleSlug);
  };

  const requestAccess = async (moduleSlug: string, reason?: string): Promise<void> => {
    if (!user?.id) return;
    const mod = allModules.find(m => m.slug === moduleSlug);
    if (!mod) return;

    try {
      const { error } = await fromUntyped('module_access_requests').insert({
        user_id: user.id,
        module_id: mod.id,
        status: 'pending',
        reason: reason || `Solicito acesso ao módulo ${mod.name}`,
      });
      if (error) throw error;
      toast.success('Solicitação enviada! O administrador será notificado.');
      queryClient.invalidateQueries({ queryKey: ['user-module-grants'] });
    } catch (error) {
      logger.error('Failed to request module access:', error);
      toast.error('Erro ao solicitar acesso');
    }
  };

  const trackUsage = async (moduleSlug: string, action: string): Promise<void> => {
    // Lightweight tracking - fire and forget
    if (!user?.id) return;
    const mod = allModules.find(m => m.slug === moduleSlug);
    if (!mod) return;
    try {
      await fromUntyped('module_usage').insert({
        organization_id: null,
        module_id: mod.id,
        user_id: user.id,
        action,
        metadata: { timestamp: new Date().toISOString() },
      });
    } catch {
      // Silent fail for tracking
    }
  };

  return {
    modules: allModules,
    enabledModules,
    isLoading: loadingModules || loadingGrants,
    isAdmin,
    hasAccess,
    canUpgrade,
    requestAccess,
    trackUsage,
  };
}
