/**
 * RouteModuleGuard - Wraps route content with module access check
 * Uses current path to determine which module is required
 */
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useModuleAccess, getModuleForRoute } from '@/hooks/useModuleAccess';
import { ModuleGate } from './ModuleGate';

interface RouteModuleGuardProps {
  children: ReactNode;
}

export function RouteModuleGuard({ children }: RouteModuleGuardProps) {
  const location = useLocation();
  const { isAdmin, isLoading } = useModuleAccess();
  
  // Admins and loading state bypass
  if (isAdmin || isLoading) return <>{children}</>;
  
  // Determine which module this route requires
  const moduleSlug = getModuleForRoute(location.pathname);
  
  // If no module mapping found, allow access (unmapped routes are public)
  if (!moduleSlug) return <>{children}</>;
  
  return (
    <ModuleGate module={moduleSlug} showUpgrade={true}>
      {children}
    </ModuleGate>
  );
}
