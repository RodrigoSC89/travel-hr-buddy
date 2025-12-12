/**
import { useCallback, useContext, useEffect, useMemo, useState } from "react";;
 * OrganizationContext - PATCH 853.0 - Definitive React Hook Fix
 * 
 * Uses standard React import pattern.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { logger } from "@/lib/logger";
import type { Database } from "@/integrations/supabase/types";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationBranding = Database["public"]["Tables"]["organization_branding"]["Row"];

interface OrganizationContextType {
  currentOrganization: Organization | null;
  currentBranding: OrganizationBranding | null;
  userRole: string | null;
  isLoading: boolean;
  error: string | null;
  switchOrganization: (orgId: string) => Promise<void>;
  updateBranding: (branding: Partial<OrganizationBranding>) => Promise<void>;
  checkPermission: (permission: string) => boolean;
  getCurrentOrganizationUsers: () => Promise<Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    full_name: string;
    joined_at: string;
    last_active_at: string;
  }>>;
  inviteUser: (email: string, role: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
}

// Default context value to prevent null errors
const defaultContextValue: OrganizationContextType = {
  currentOrganization: null,
  currentBranding: null,
  userRole: null,
  isLoading: true,
  error: null,
  switchOrganization: async () => {},
  updateBranding: async () => {},
  checkPermission: () => false,
  getCurrentOrganizationUsers: async () => [],
  inviteUser: async () => {},
  removeUser: async () => {},
  updateUserRole: async () => {}
};

// Create context with default value
const OrganizationContext = createContext<OrganizationContextType>(defaultContextValue);

// Custom hook to use organization context
export function useOrganization(): OrganizationContextType {
  const context = useContext(OrganizationContext);
  if (!context) {
    return defaultContextValue;
  }
  return context;
}

// Default demo data
function getDefaultOrganization(): Organization {
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Nautilus Demo",
    slug: "nautilus-demo",
    status: "active",
    plan_type: "enterprise",
    max_users: 100,
    max_vessels: 50,
    max_storage_gb: 5,
    features: { peotram: true, fleet_management: true, analytics: true, ai_analysis: true },
    trial_ends_at: null,
    subscription_ends_at: null,
    created_at: new Date().toISOString(),
    billing_email: null,
    domain: null,
    metadata: {},
    owner_id: null,
    updated_at: new Date().toISOString(),
    stripe_customer_id: null
  };
}

function getDefaultBranding(): OrganizationBranding {
  return {
    id: "demo-branding",
    organization_id: "550e8400-e29b-41d4-a716-446655440000",
    company_name: "Nautilus Demo",
    logo_url: null,
    primary_color: "#2563eb",
    secondary_color: "#64748b",
    accent_color: "#7c3aed",
    theme_mode: "light",
    default_language: "pt-BR",
    default_currency: "BRL",
    timezone: "America/Sao_Paulo",
    custom_fields: {},
    business_rules: {},
    enabled_modules: { fleet: true, crew: true, certificates: true, analytics: true, travel: true, documents: true },
    module_settings: { peotram: { templates_enabled: true, ai_analysis: true, permissions_matrix: true } },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Apply branding theme to document
function applyBrandingTheme(branding: OrganizationBranding): void {
  const root = document.documentElement;
  
  if (branding.primary_color) {
    root.style.setProperty("--primary", branding.primary_color);
  }
  if (branding.secondary_color) {
    root.style.setProperty("--secondary", branding.secondary_color);
  }
  if (branding.accent_color) {
    root.style.setProperty("--accent", branding.accent_color);
  }
  
  if (branding.company_name) {
    document.title = `${branding.company_name} - Nautilus One`;
  }
  
  if (branding.theme_mode && branding.theme_mode !== "auto") {
    document.documentElement.classList.toggle("dark", branding.theme_mode === "dark");
  }
}

interface OrganizationProviderProps {
  children: React.ReactNode;
}

// Organization Provider component
export function OrganizationProvider({ children }: OrganizationProviderProps): JSX.Element {
  const { user } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentBranding, setCurrentBranding] = useState<OrganizationBranding | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with demo data immediately
  useEffect(() => {
    const initializeOrganization = async (): Promise<void> => {
      try {
        // Always set demo data first for immediate display
        const demoOrg = getDefaultOrganization();
        const demoBranding = getDefaultBranding();
        
        setCurrentOrganization(demoOrg);
        setCurrentBranding(demoBranding);
        setUserRole("admin");
        applyBrandingTheme(demoBranding);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        logger.error("Error loading organization:", errorMessage);
        setError("Erro ao carregar dados da organização");
      } finally {
        setIsLoading(false);
      }
    };

    initializeOrganization();
  }, []);

  const switchOrganization = useCallback(async (orgId: string): Promise<void> => {
    // For now, keep demo organization
    return;
  }, []);

  const updateBranding = useCallback(async (brandingUpdate: Partial<OrganizationBranding>): Promise<void> => {
    if (!currentOrganization) return;

    try {
      const { data, error: updateError } = await supabase
        .from("organization_branding")
        .update(brandingUpdate)
        .eq("organization_id", currentOrganization.id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        setCurrentBranding(data as OrganizationBranding);
        applyBrandingTheme(data as OrganizationBranding);
      }
    } catch (err) {
      logger.error("Error updating branding:", err);
    }
  }, [currentOrganization]);

  const checkPermission = useCallback((permission: string): boolean => {
    // For demo, admin has all permissions
    if (userRole === "admin") return true;
    
    const roleHierarchy: Record<string, string[]> = {
      owner: ["all"],
      admin: ["manage_users", "manage_settings", "view_analytics", "manage_data"],
      manager: ["manage_data", "view_analytics", "manage_team"],
      operator: ["manage_data", "view_data"],
      member: ["view_data"],
      viewer: ["view_data"]
    };

    const userPermissions = roleHierarchy[userRole || "viewer"] || [];
    return userPermissions.includes(permission) || userPermissions.includes("all");
  }, [userRole]);

  const getCurrentOrganizationUsers = useCallback(async () => {
    return [
      {
        id: "1",
        email: "admin@nautilus.com",
        role: "admin",
        status: "active",
        full_name: "Administrador",
        joined_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      },
      {
        id: "2", 
        email: "user@nautilus.com",
        role: "member",
        status: "active",
        full_name: "Usuário Demo",
        joined_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      }
    ];
  }, []);

  const inviteUser = useCallback(async (email: string, role: string): Promise<void> => {
    if (!currentOrganization) throw new Error("Nenhuma organização selecionada");
    logger.info("Inviting user:", { email, role });
  }, [currentOrganization]);

  const removeUser = useCallback(async (userId: string): Promise<void> => {
    logger.info("Removing user:", { userId });
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: string): Promise<void> => {
    logger.info("Updating user role:", { userId, role });
  }, []);

  // Memoize context value
  const contextValue = useMemo<OrganizationContextType>(() => ({
    currentOrganization,
    currentBranding,
    userRole,
    isLoading,
    error,
    switchOrganization,
    updateBranding,
    checkPermission,
    getCurrentOrganizationUsers,
    inviteUser,
    removeUser,
    updateUserRole
  }), [
    currentOrganization,
    currentBranding,
    userRole,
    isLoading,
    error,
    switchOrganization,
    updateBranding,
    checkPermission,
    getCurrentOrganizationUsers,
    inviteUser,
    removeUser,
    updateUserRole
  ]);

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
}

export default OrganizationProvider;
