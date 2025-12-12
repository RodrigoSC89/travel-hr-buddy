/**
import { useCallback, useContext, useEffect, useMemo, useState } from "react";;
 * TenantContext - PATCH 853.0 - Definitive React Hook Fix
 * 
 * Uses standard React import pattern.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { logger } from "@/lib/logger";

interface SaasTenant {
  id: string;
  slug: string;
  name: string;
  description?: string;
  status: string;
  plan_type: string;
  max_users: number;
  max_vessels: number;
  max_storage_gb: number;
  max_api_calls_per_month: number;
  billing_email?: string;
  billing_cycle: string;
  stripe_customer_id?: string;
  trial_ends_at?: string;
  subscription_starts_at?: string;
  subscription_ends_at?: string;
  custom_domain?: string;
  subdomain?: string;
  metadata: Record<string, unknown>;
  features: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface TenantBranding {
  id: string;
  tenant_id: string;
  company_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color?: string;
  text_color?: string;
  theme_mode: string;
  default_language: string;
  default_currency: string;
  timezone: string;
  date_format: string;
  header_style: Record<string, unknown>;
  sidebar_style: Record<string, unknown>;
  button_style: Record<string, unknown>;
  enabled_modules: Record<string, unknown>;
  module_settings: Record<string, unknown>;
  custom_fields: Record<string, unknown>;
  business_rules: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  status: string;
  display_name?: string;
  avatar_url?: string;
  job_title?: string;
  department?: string;
  permissions: Record<string, unknown>;
  invited_at?: string;
  joined_at: string;
  last_active_at: string;
  metadata: Record<string, unknown>;
}

interface SaasPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  max_vessels: number;
  max_storage_gb: number;
  max_api_calls_per_month: number;
  features: Record<string, unknown>;
  is_active: boolean;
  is_popular: boolean;
}

interface TenantUsage {
  id: string;
  tenant_id: string;
  period_start: string;
  period_end: string;
  active_users: number;
  total_logins: number;
  storage_used_gb: number;
  api_calls_made: number;
  peotram_audits_created: number;
  vessels_managed: number;
  documents_processed: number;
  reports_generated: number;
  metadata: Record<string, unknown>;
}

interface TenantContextType {
  currentTenant: SaasTenant | null;
  currentBranding: TenantBranding | null;
  currentUser: TenantUser | null;
  tenantPlans: SaasPlan[];
  tenantUsage: TenantUsage | null;
  availableTenants: SaasTenant[];
  isLoading: boolean;
  error: string | null;
  switchTenant: (tenantId: string) => Promise<void>;
  updateBranding: (branding: Partial<TenantBranding>) => Promise<void>;
  updateTenantSettings: (settings: Partial<SaasTenant>) => Promise<void>;
  inviteTenantUser: (email: string, role: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  removeTenantUser: (userId: string) => Promise<void>;
  getTenantUsers: () => Promise<TenantUser[]>;
  checkPermission: (permission: string) => boolean;
  checkFeatureAccess: (feature: string) => boolean;
  checkUsageLimits: (type: string) => boolean;
  upgradePlan: (planId: string) => Promise<void>;
  downgradeplan: (planId: string) => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  getSubdomain: () => string;
}

// Default context value to prevent null errors
const defaultTenantValue: TenantContextType = {
  currentTenant: null,
  currentBranding: null,
  currentUser: null,
  tenantPlans: [],
  tenantUsage: null,
  availableTenants: [],
  isLoading: true,
  error: null,
  switchTenant: async () => {},
  updateBranding: async () => {},
  updateTenantSettings: async () => {},
  inviteTenantUser: async () => {},
  updateUserRole: async () => {},
  removeTenantUser: async () => {},
  getTenantUsers: async () => [],
  checkPermission: () => false,
  checkFeatureAccess: () => false,
  checkUsageLimits: () => true,
  upgradePlan: async () => {},
  downgradeplan: async () => {},
  formatCurrency: (amount: number) => `R$ ${amount.toFixed(2)}`,
  formatDate: (date: string) => new Date(date).toLocaleDateString("pt-BR"),
  getSubdomain: () => "demo",
};

// Create context with default value
const TenantContext = createContext<TenantContextType>(defaultTenantValue);

// Custom hook to use tenant context
export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    return defaultTenantValue;
  }
  return context;
}

// Default demo data
function getDefaultTenant(): SaasTenant {
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    slug: "nautilus-demo",
    name: "Nautilus Demo Corporation",
    description: "Empresa demonstrativa do sistema Nautilus One",
    status: "active",
    plan_type: "enterprise",
    max_users: 100,
    max_vessels: 50,
    max_storage_gb: 100,
    max_api_calls_per_month: 50000,
    billing_cycle: "monthly",
    subdomain: "demo",
    metadata: {},
    features: {
      peotram: true,
      fleet_management: true,
      advanced_analytics: true,
      ai_analysis: true,
      white_label: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function getDefaultBranding(tenantId: string): TenantBranding {
  return {
    id: "demo-branding",
    tenant_id: tenantId,
    company_name: "Nautilus One Demo",
    logo_url: "",
    favicon_url: "",
    primary_color: "#2563eb",
    secondary_color: "#64748b",
    accent_color: "#7c3aed",
    background_color: "#ffffff",
    text_color: "#000000",
    theme_mode: "light",
    default_language: "pt-BR",
    default_currency: "BRL",
    timezone: "America/Sao_Paulo",
    date_format: "DD/MM/YYYY",
    header_style: {},
    sidebar_style: {},
    button_style: {},
    enabled_modules: {
      peotram: true,
      fleet_management: true,
      analytics: true,
      hr: true,
      ai_analysis: true
    },
    module_settings: {
      peotram: { templates_enabled: true, ai_analysis: true, permissions_matrix: true },
      fleet: { real_time_tracking: true },
      analytics: { advanced_reports: true }
    },
    custom_fields: {},
    business_rules: {
      max_reservations_per_user: 10,
      alert_frequency: "daily",
      auto_backup: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function getDefaultUsage(tenantId: string): TenantUsage {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  return {
    id: "demo-usage",
    tenant_id: tenantId,
    period_start: startOfMonth.toISOString(),
    period_end: new Date().toISOString(),
    active_users: 12,
    total_logins: 345,
    storage_used_gb: 2.3,
    api_calls_made: 1250,
    peotram_audits_created: 15,
    vessels_managed: 8,
    documents_processed: 42,
    reports_generated: 23,
    metadata: {}
  };
}

// Apply branding theme to document
function applyBrandingTheme(branding: TenantBranding): void {
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

interface TenantProviderProps {
  children: React.ReactNode;
}

// Tenant Provider component
export function TenantProvider({ children }: TenantProviderProps): JSX.Element {
  const { user } = useAuth();
  
  const [currentTenant, setCurrentTenant] = useState<SaasTenant | null>(null);
  const [currentBranding, setCurrentBranding] = useState<TenantBranding | null>(null);
  const [currentUser, setCurrentUser] = useState<TenantUser | null>(null);
  const [tenantPlans, setTenantPlans] = useState<SaasPlan[]>([]);
  const [tenantUsage, setTenantUsage] = useState<TenantUsage | null>(null);
  const [availableTenants, setAvailableTenants] = useState<SaasTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with demo data immediately
  useEffect(() => {
    const initializeTenant = async (): Promise<void> => {
      try {
        // Always set demo data first for immediate display
        const demoTenant = getDefaultTenant();
        const demoBranding = getDefaultBranding(demoTenant.id);
        const demoUsage = getDefaultUsage(demoTenant.id);
        
        setCurrentTenant(demoTenant);
        setCurrentBranding(demoBranding);
        setTenantUsage(demoUsage);
        applyBrandingTheme(demoBranding);
        
        // If user is authenticated, try to load real data
        if (user?.id) {
          try {
            const { data: userTenants } = await supabase
              .from("tenant_users")
              .select("*, saas_tenants!inner(*)")
              .eq("user_id", user.id)
              .eq("status", "active")
              .limit(5);

            if (userTenants && userTenants.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const tenants = userTenants
                .map((ut: any) => ut.saas_tenants as SaasTenant)
                .filter(Boolean);
              
              if (tenants.length > 0) {
                setAvailableTenants(tenants);
                setCurrentTenant(tenants[0]);
              }
            }
          } catch (err) {
            logger.warn("Could not load tenant data from database", { error: err });
          }
        }
      } catch (err) {
        logger.error("Error initializing tenant:", err);
        setError("Erro ao carregar dados da empresa");
      } finally {
        setIsLoading(false);
      }
    };

    initializeTenant();
  }, [user?.id]);

  // Memoized functions
  const switchTenant = useCallback(async (tenantId: string): Promise<void> => {
    const tenant = availableTenants.find(t => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
    }
  }, [availableTenants]);

  const updateBranding = useCallback(async (branding: Partial<TenantBranding>): Promise<void> => {
    if (!currentTenant) return;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: updateError } = await supabase
        .from("tenant_branding")
        .update(branding as any)
        .eq("tenant_id", currentTenant.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      if (data) {
        setCurrentBranding(data as TenantBranding);
        applyBrandingTheme(data as TenantBranding);
      }
    } catch (err) {
      logger.error("Error updating branding:", err);
    }
  }, [currentTenant]);

  const updateTenantSettings = useCallback(async (settings: Partial<SaasTenant>): Promise<void> => {
    if (!currentTenant) return;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: updateError } = await supabase
        .from("saas_tenants")
        .update(settings as any)
        .eq("id", currentTenant.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      if (data) {
        setCurrentTenant(data as SaasTenant);
      }
    } catch (err) {
      logger.error("Error updating tenant settings:", err);
    }
  }, [currentTenant]);

  const inviteTenantUser = useCallback(async (email: string, role: string): Promise<void> => {
    logger.info("Inviting user:", { email, role });
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: string): Promise<void> => {
    logger.info("Updating user role:", { userId, role });
  }, []);

  const removeTenantUser = useCallback(async (userId: string): Promise<void> => {
    logger.info("Removing user:", { userId });
  }, []);

  const getTenantUsers = useCallback(async (): Promise<TenantUser[]> => {
    return [];
  }, []);

  const checkPermission = useCallback((permission: string): boolean => {
    if (currentUser?.role === "admin" || currentUser?.role === "owner") return true;
    return false;
  }, [currentUser?.role]);

  const checkFeatureAccess = useCallback((feature: string): boolean => {
    return currentTenant?.features?.[feature] === true;
  }, [currentTenant?.features]);

  const checkUsageLimits = useCallback((type: string): boolean => {
    return true;
  }, []);

  const upgradePlan = useCallback(async (planId: string): Promise<void> => {
    logger.info("Upgrading plan:", { planId });
  }, []);

  const downgradeplan = useCallback(async (planId: string): Promise<void> => {
    logger.info("Downgrading plan:", { planId });
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat(currentBranding?.default_language || "pt-BR", {
      style: "currency",
      currency: currentBranding?.default_currency || "BRL"
    }).format(amount);
  }, [currentBranding?.default_language, currentBranding?.default_currency]);

  const formatDate = useCallback((date: string): string => {
    return new Date(date).toLocaleDateString(currentBranding?.default_language || "pt-BR");
  }, [currentBranding?.default_language]);

  const getSubdomain = useCallback((): string => {
    return currentTenant?.subdomain || "demo";
  }, [currentTenant?.subdomain]);

  // Memoize context value
  const contextValue = useMemo<TenantContextType>(() => ({
    currentTenant,
    currentBranding,
    currentUser,
    tenantPlans,
    tenantUsage,
    availableTenants,
    isLoading,
    error,
    switchTenant,
    updateBranding,
    updateTenantSettings,
    inviteTenantUser,
    updateUserRole,
    removeTenantUser,
    getTenantUsers,
    checkPermission,
    checkFeatureAccess,
    checkUsageLimits,
    upgradePlan,
    downgradeplan,
    formatCurrency,
    formatDate,
    getSubdomain,
  }), [
    currentTenant,
    currentBranding,
    currentUser,
    tenantPlans,
    tenantUsage,
    availableTenants,
    isLoading,
    error,
    switchTenant,
    updateBranding,
    updateTenantSettings,
    inviteTenantUser,
    updateUserRole,
    removeTenantUser,
    getTenantUsers,
    checkPermission,
    checkFeatureAccess,
    checkUsageLimits,
    upgradePlan,
    downgradeplan,
    formatCurrency,
    formatDate,
    getSubdomain,
  ]);

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}

export default TenantProvider;
