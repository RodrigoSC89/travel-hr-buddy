import { useOrganization } from "@/contexts/OrganizationContext";

export const useOrganizationPermissions = () => {
  const { checkPermission, userRole, currentOrganization } = useOrganization();

  const isAdmin = () => userRole === "owner" || userRole === "admin";
  const isManager = () => isAdmin() || userRole === "manager";
  const canManageUsers = () => checkPermission("manage_users");
  const canManageSettings = () => checkPermission("manage_settings");
  const canViewAnalytics = () => checkPermission("view_analytics");
  const canManageData = () => checkPermission("manage_data");

  const hasFeature = (feature: string) => {
    if (!currentOrganization) return false;

    const featureFlags = (currentOrganization.features || null) as Record<string, unknown> | null;
    if (featureFlags && typeof featureFlags === "object") {
      const value = featureFlags[feature];
      if (typeof value === "boolean") {
        return value;
      }
    }

    const defaultFeatures = ["peotram", "fleet_management", "analytics", "ai_analysis"];
    return defaultFeatures.includes(feature);
  };

  const isWithinLimits = (type: "users" | "vessels" | "storage") => {
    if (!currentOrganization) return false;

    const toNumber = (value: unknown) => (typeof value === "number" ? value : 0);

    switch (type) {
    case "users":
      return toNumber(currentOrganization.max_users) > 0;
    case "vessels":
      return toNumber(currentOrganization.max_vessels) > 0;
    case "storage":
      return toNumber(currentOrganization.max_storage_gb) > 0;
    default:
      return false;
    }
  };

  return {
    userRole,
    currentOrganization,
    isAdmin,
    isManager,
    canManageUsers,
    canManageSettings,
    canViewAnalytics,
    canManageData,
    hasFeature,
    isWithinLimits,
    checkPermission
  };
};