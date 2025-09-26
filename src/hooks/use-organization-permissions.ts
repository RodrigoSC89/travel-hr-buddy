import { useOrganization } from '@/contexts/OrganizationContext';

export const useOrganizationPermissions = () => {
  const { checkPermission, userRole, currentOrganization } = useOrganization();

  const isAdmin = () => userRole === 'owner' || userRole === 'admin';
  const isManager = () => isAdmin() || userRole === 'manager';
  const canManageUsers = () => checkPermission('manage_users');
  const canManageSettings = () => checkPermission('manage_settings');
  const canViewAnalytics = () => checkPermission('view_analytics');
  const canManageData = () => checkPermission('manage_data');

  const hasFeature = (feature: string) => {
    if (!currentOrganization?.features) return false;
    return currentOrganization.features.includes(feature);
  };

  const isWithinLimits = (type: 'users' | 'vessels' | 'storage') => {
    if (!currentOrganization) return false;
    
    switch (type) {
      case 'users':
        return currentOrganization.max_users > 0;
      case 'vessels':
        return currentOrganization.max_vessels > 0;
      case 'storage':
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
    checkPermission
  };
};