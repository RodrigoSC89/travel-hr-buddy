/**
 * PATCH 655 - Navigation Structure Hook
 * Provides dynamic navigation based on module status and user roles
 */

import { useMemo } from "react";
import modulesRegistry from "@/../modules-registry-complete.json";
import { usePermissions } from "@/hooks/use-permissions";
import {
  LayoutDashboard,
  Users,
  Ship,
  FileText,
  Settings,
  Shield,
  Activity,
  Brain,
  MessageSquare,
  Workflow,
  CheckCircle,
  Beaker,
  LucideIcon,
} from "lucide-react";

export type ModuleStatus = "production" | "development" | "experimental" | "deprecated";

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
  production: "✅",
  development: "⚠️",
  experimental: "🧪",
  deprecated: "❌",
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

const CATEGORY_PERMISSION_MAP: Record<string, "admin" | "hr" | "reports" | "analytics" | "settings"> = {
  hr: "hr",
  analytics: "analytics",
  compliance: "reports",
  system: "settings",
  core: "admin",
};

type BaseRegistryModule = (typeof modulesRegistry.modules)[number];
type RegistryModuleExtras = {
  requiresRole?: string[];
  aiEnabled?: boolean;
  integrations?: string[];
  badge?: string;
};
type RegistryModule = BaseRegistryModule & RegistryModuleExtras;

/**
 * Maps module registry status to simplified status
 */
const mapModuleStatus = (registryStatus: string | undefined): ModuleStatus => {
  const normalized = (registryStatus || "").toLowerCase();
  if (["active", "implemented", "production"].includes(normalized)) {
    return "production";
  }
  if (["partial", "beta", "preview", "planned"].includes(normalized)) {
    return "development";
  }
  if (["deprecated", "legacy", "disabled", "archived"].includes(normalized)) {
    return "deprecated";
  }
  return "experimental";
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

  const { userRole, canAccessModule } = usePermissions();

  const navigationModules = useMemo(() => {
    const rawModules: RegistryModule[] = Array.isArray(modulesRegistry.modules)
      ? (modulesRegistry.modules as RegistryModule[])
      : [];

    const statusAllowed = (status: ModuleStatus) => {
      if (status === "production") return includeProduction;
      if (status === "development") return includeDevelopment;
      if (status === "experimental") return includeExperimental;
      return includeDeprecated;
    };

    const normalizeModule = (module: RegistryModule): NavigationModule | null => {
      const category = module.category || "core";
      const status = mapModuleStatus(module.status);

      if (!statusAllowed(status)) {
        return null;
      }

      const requiredRoles = Array.isArray(module.requiresRole)
        ? module.requiresRole
        : undefined;

      if (requiredRoles) {
        if (!userRole || !requiredRoles.includes(userRole)) {
          return null;
        }
      }

      const permissionKey = CATEGORY_PERMISSION_MAP[category];
      if (permissionKey && !canAccessModule(permissionKey)) {
        return null;
      }

      const description = module.description || "Módulo sem descrição disponível";
      const icon = getModuleIcon(category);
      const path = module.path || module.route || "/";
      const aiEnabled = Boolean(module.aiEnabled ?? module.integrations?.includes("OpenAI"));

      return {
        id: module.id,
        name: module.name,
        path,
        category,
        status,
        icon,
        requiresRole: requiredRoles,
        aiEnabled,
        description,
        badge: module.status === "deprecated" ? "Legacy" : undefined,
      };
    };

    return rawModules
      .map(normalizeModule)
      .filter((module): module is NavigationModule => module !== null);
  }, [
    includeProduction,
    includeDevelopment,
    includeExperimental,
    includeDeprecated,
    userRole,
    canAccessModule,
  ]);

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
    return STATUS_ICONS[status] || "";
  };

  /**
   * Get module statistics
   */
  const getStatistics = useMemo(() => {
    return {
      total: navigationModules.length,
      production: getModulesByStatus("production").length,
      development: getModulesByStatus("development").length,
      experimental: getModulesByStatus("experimental").length,
      deprecated: getModulesByStatus("deprecated").length,
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

  const module = useMemo(() => {
    return modules.find((m) => m.id === moduleId);
  }, [modules, moduleId]);

  const hasAccess = useMemo(() => {
    if (!module) return false;
    if (module.status === "deprecated") return false;
    return true;
  }, [module]);

  return {
    module,
    hasAccess,
    status: module?.status,
    isProduction: module?.status === "production",
    isDevelopment: module?.status === "development",
    isExperimental: module?.status === "experimental",
  };
};
