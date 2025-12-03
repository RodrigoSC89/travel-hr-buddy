/**
 * PATCH 655 - Navigation Structure Hook
 * Provides dynamic navigation based on module status and user roles
 */

import { useMemo } from "react";
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

// Inline module registry
const MODULES_REGISTRY = {
  modules: [
    { id: "dashboard", name: "Dashboard", path: "/dashboard", status: "active", category: "core", description: "Main dashboard" },
    { id: "dp-intelligence", name: "DP Intelligence", path: "/dp-intelligence", status: "active", category: "maritime", description: "Dynamic positioning AI" },
    { id: "forecast-global", name: "Forecast Global", path: "/forecast-global", status: "active", category: "analytics", description: "Global forecasting" },
    { id: "control-hub", name: "Control Hub", path: "/control-hub", status: "active", category: "operations", description: "Central control" },
    { id: "fmea-expert", name: "FMEA Expert", path: "/fmea-expert", status: "active", category: "safety", description: "Failure mode analysis" },
    { id: "compliance-hub", name: "Compliance Hub", path: "/compliance-hub", status: "active", category: "compliance", description: "Compliance management" },
    { id: "crew-management", name: "Crew Management", path: "/crew-management", status: "active", category: "hr", description: "Crew operations" },
    { id: "fleet-management", name: "Fleet Management", path: "/fleet-management", status: "active", category: "maritime", description: "Fleet operations" },
    { id: "maintenance", name: "Maintenance", path: "/maintenance", status: "active", category: "maintenance", description: "Maintenance system" },
    { id: "reports", name: "Reports", path: "/reports", status: "active", category: "documents", description: "Reporting system" },
    { id: "ai-assistant", name: "AI Assistant", path: "/ai-assistant", status: "active", category: "ai", description: "AI-powered assistant" },
  ]
};

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

const mapModuleStatus = (registryStatus: string | undefined): ModuleStatus => {
  const normalized = (registryStatus || "").toLowerCase();
  if (["active", "implemented", "production"].includes(normalized)) return "production";
  if (["partial", "beta", "preview", "planned"].includes(normalized)) return "development";
  if (["deprecated", "legacy", "disabled", "archived"].includes(normalized)) return "deprecated";
  return "experimental";
};

const getModuleIcon = (category: string): LucideIcon => {
  return CATEGORY_ICONS[category] || Activity;
};

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
    const rawModules = MODULES_REGISTRY.modules;

    const statusAllowed = (status: ModuleStatus) => {
      if (status === "production") return includeProduction;
      if (status === "development") return includeDevelopment;
      if (status === "experimental") return includeExperimental;
      return includeDeprecated;
    };

    return rawModules
      .map((module): NavigationModule | null => {
        const category = module.category || "core";
        const status = mapModuleStatus(module.status);

        if (!statusAllowed(status)) return null;

        return {
          id: module.id,
          name: module.name,
          path: module.path,
          category,
          status,
          icon: getModuleIcon(category),
          description: module.description || "Módulo sem descrição",
        };
      })
      .filter((m): m is NavigationModule => m !== null);
  }, [includeProduction, includeDevelopment, includeExperimental, includeDeprecated, userRole, canAccessModule]);

  const getModulesByCategory = useMemo(() => {
    const grouped = new Map<string, NavigationModule[]>();
    navigationModules.forEach((module) => {
      if (!grouped.has(module.category)) grouped.set(module.category, []);
      grouped.get(module.category)!.push(module);
    });
    return grouped;
  }, [navigationModules]);

  const getModulesByStatus = (status: ModuleStatus): NavigationModule[] => {
    return navigationModules.filter((m) => m.status === status);
  };

  const getNavigationGroups = useMemo((): NavigationGroup[] => {
    const categoryGroups = new Map<string, NavigationModule[]>();
    navigationModules.forEach((module) => {
      if (!categoryGroups.has(module.category)) categoryGroups.set(module.category, []);
      categoryGroups.get(module.category)!.push(module);
    });

    const groups: NavigationGroup[] = [];
    categoryGroups.forEach((modules, category) => {
      groups.push({
        title: category.charAt(0).toUpperCase() + category.slice(1),
        modules: modules.sort((a, b) => {
          const order = { production: 0, development: 1, experimental: 2, deprecated: 3 };
          return (order[a.status] || 99) - (order[b.status] || 99);
        }),
      });
    });

    return groups.sort((a, b) => a.title.localeCompare(b.title));
  }, [navigationModules]);

  const getStatistics = useMemo(() => ({
    total: navigationModules.length,
    production: getModulesByStatus("production").length,
    development: getModulesByStatus("development").length,
    experimental: getModulesByStatus("experimental").length,
    deprecated: getModulesByStatus("deprecated").length,
    withAI: navigationModules.filter((m) => m.aiEnabled).length,
  }), [navigationModules]);

  return {
    modules: navigationModules,
    getModulesByCategory,
    getModulesByStatus,
    getNavigationGroups,
    statistics: getStatistics,
  };
};

export const useModuleAccess = (moduleId: string) => {
  const { modules } = useNavigationStructure();
  const module = useMemo(() => modules.find((m) => m.id === moduleId), [modules, moduleId]);
  const hasAccess = useMemo(() => module ? module.status !== "deprecated" : false, [module]);

  return {
    module,
    hasAccess,
    status: module?.status,
    isProduction: module?.status === "production",
    isDevelopment: module?.status === "development",
    isExperimental: module?.status === "experimental",
  };
};
