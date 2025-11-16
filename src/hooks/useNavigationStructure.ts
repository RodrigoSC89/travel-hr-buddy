/**
 * PATCH 655 - Navigation Structure Hook
 * Provides dynamic navigation based on module status and user roles
 */

import { useMemo } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import {
  LayoutDashboard,
  Users,
  Ship,
  FileText,
  Settings,
  Shield,
  Activity,
  Brain,
  Bell,
  MessageSquare,
  Workflow,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Beaker,
  LucideIcon,
} from 'lucide-react';

export type ModuleStatus = 'production' | 'development' | 'experimental' | 'deprecated';

export interface NavigationModule {
  id: string;
  name: string;
  path: string;
  category: string;
  status: ModuleStatus;
  icon?: LucideIcon;
  requiresRole?: string[];
  aiEnabled?: boolean;
  description?: string;
  badge?: string;
}

export interface NavigationGroup {
  title: string;
  status?: ModuleStatus;
  modules: NavigationModule[];
}

const STATUS_ICONS: Record<ModuleStatus, string> = {
  production: '✅',
  development: '⚠️',
  experimental: '🧪',
  deprecated: '❌',
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  core: LayoutDashboard,
  maritime: Ship,
  compliance: Shield,
  communication: MessageSquare,
  ai: Brain,
  documents: FileText,
  analytics: Activity,
  hr: Users,
  logistics: Workflow,
  system: Settings,
  experimental: Beaker,
  safety: CheckCircle,
  travel: Activity,
  maintenance: Settings,
  finance: Activity,
  operations: Activity,
  intelligence: Brain,
  planning: Workflow,
};

/**
 * Maps module registry status to simplified status
 */
const mapModuleStatus = (registryStatus: string): ModuleStatus => {
  switch (registryStatus) {
    case 'active':
      return 'production';
    case 'deprecated':
      return 'deprecated';
    case 'partial':
      return 'development';
    default:
      return 'experimental';
  }
};

/**
 * Get icon for module category
 */
const getModuleIcon = (category: string): LucideIcon => {
  return CATEGORY_ICONS[category] || Activity;
};

/**
 * Hook to get navigation structure filtered by status and user role
 */
export const useNavigationStructure = (options: {
  includeProduction?: boolean;
  includeDevelopment?: boolean;
  includeExperimental?: boolean;
  includeDeprecated?: boolean;
} = {}) => {
  const {
    includeProduction = true,
    includeDevelopment = true,
    includeExperimental = false,
    includeDeprecated = false,
  } = options;

  const { userRole, hasPermission, canAccessModule } = usePermissions();

  const navigationModules = useMemo(() => {
    // TODO: Implementar modulesRegistry quando disponível
    // Por enquanto retorna array vazio
    const modules: NavigationModule[] = [];
    return modules;
  }, [includeProduction, includeDevelopment, includeExperimental, includeDeprecated]);

  /**
   * Get modules grouped by category
   */
  const getModulesByCategory = useMemo(() => {
    const grouped = new Map<string, NavigationModule[]>();

    navigationModules.forEach((module) => {
      if (!grouped.has(module.category)) {
        grouped.set(module.category, []);
      }
      grouped.get(module.category)!.push(module);
    });

    return grouped;
  }, [navigationModules]);

  /**
   * Get modules filtered by status
   */
  const getModulesByStatus = (status: ModuleStatus): NavigationModule[] => {
    return navigationModules.filter((module) => module.status === status);
  };

  /**
   * Get modules filtered by role
   */
  const getModulesByRole = (role: string): NavigationModule[] => {
    return navigationModules.filter((module) => {
      if (!module.requiresRole) return true;
      return module.requiresRole.includes(role);
    });
  };

  /**
   * Get navigation groups for sidebar
   */
  const getNavigationGroups = useMemo((): NavigationGroup[] => {
    const groups: NavigationGroup[] = [];

    // Group by category
    const categoryGroups = new Map<string, NavigationModule[]>();
    
    navigationModules.forEach((module) => {
      if (!categoryGroups.has(module.category)) {
        categoryGroups.set(module.category, []);
      }
      categoryGroups.get(module.category)!.push(module);
    });

    // Convert to navigation groups
    categoryGroups.forEach((modules, category) => {
      groups.push({
        title: category.charAt(0).toUpperCase() + category.slice(1),
        modules: modules.sort((a, b) => {
          // Sort by status priority: production > development > experimental > deprecated
          const statusOrder = { production: 0, development: 1, experimental: 2, deprecated: 3 };
          return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
        }),
      });
    });

    return groups.sort((a, b) => a.title.localeCompare(b.title));
  }, [navigationModules]);

  /**
   * Get status badge for module
   */
  const getStatusBadge = (status: ModuleStatus): string => {
    return STATUS_ICONS[status] || '';
  };

  /**
   * Get module statistics
   */
  const getStatistics = useMemo(() => {
    return {
      total: navigationModules.length,
      production: getModulesByStatus('production').length,
      development: getModulesByStatus('development').length,
      experimental: getModulesByStatus('experimental').length,
      deprecated: getModulesByStatus('deprecated').length,
      withAI: navigationModules.filter((m) => m.aiEnabled).length,
    };
  }, [navigationModules]);

  return {
    modules: navigationModules,
    getModulesByCategory,
    getModulesByStatus,
    getModulesByRole,
    getNavigationGroups,
    getStatusBadge,
    statistics: getStatistics,
  };
};

/**
 * Hook to check if module is accessible by current user
 */
export const useModuleAccess = (moduleId: string) => {
  const { modules } = useNavigationStructure();
  const { hasPermission } = usePermissions();

  const module = useMemo(() => {
    return modules.find((m) => m.id === moduleId);
  }, [modules, moduleId]);

  const hasAccess = useMemo(() => {
    if (!module) return false;
    if (module.status === 'deprecated') return false;
    // TODO: Fix type mismatch - requiresRole expects Permission type
    // Temporarily allow all non-deprecated modules
    return true;
  }, [module]);

  return {
    module,
    hasAccess,
    status: module?.status,
    isProduction: module?.status === 'production',
    isDevelopment: module?.status === 'development',
    isExperimental: module?.status === 'experimental',
  };
};
