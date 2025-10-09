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
    // Para demo, sempre permitir recursos se a organização existe
    if (!currentOrganization) return false;

    // Verificar nas features da organização
    if (currentOrganization.features && typeof currentOrganization.features === "object") {
      return currentOrganization.features[feature] === true;
    }

    // Fallback para recursos padrão da demo
    const defaultFeatures = ["peotram", "fleet_management", "analytics", "ai_analysis"];
    return defaultFeatures.includes(feature);
  };

  const isWithinLimits = (type: "users" | "vessels" | "storage") => {
    if (!currentOrganization) return false;

    switch (type) {
      case "users":
        return currentOrganization.max_users > 0;
      case "vessels":
        return currentOrganization.max_vessels > 0;
      case "storage":
        return currentOrganization.max_storage_gb > 0;
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
    checkPermission,
  };
};
