import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

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
  header_style: any;
  sidebar_style: any;
  button_style: any;
  enabled_modules: any;
  module_settings: any;
  custom_fields: any;
  business_rules: any;
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
  permissions: any;
  invited_at?: string;
  joined_at: string;
  last_active_at: string;
  metadata: any;
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
  features: any;
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
  metadata: any;
}

interface TenantContextType {
  // Estado atual
  currentTenant: SaasTenant | null;
  currentBranding: TenantBranding | null;
  currentUser: TenantUser | null;
  tenantPlans: SaasPlan[];
  tenantUsage: TenantUsage | null;
  availableTenants: SaasTenant[];
  
  // Estado de loading
  isLoading: boolean;
  error: string | null;
  
  // Funções de gestão
  switchTenant: (tenantId: string) => Promise<void>;
  updateBranding: (branding: Partial<TenantBranding>) => Promise<void>;
  updateTenantSettings: (settings: Partial<SaasTenant>) => Promise<void>;
  
  // Funções de usuários
  inviteTenantUser: (email: string, role: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  removeTenantUser: (userId: string) => Promise<void>;
  getTenantUsers: () => Promise<TenantUser[]>;
  
  // Funções de verificação
  checkPermission: (permission: string) => boolean;
  checkFeatureAccess: (feature: string) => boolean;
  checkUsageLimits: (type: string) => boolean;
  
  // Funções de planos
  upgradePlan: (planId: string) => Promise<void>;
  downgradeplan: (planId: string) => Promise<void>;
  
  // Utilidades
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  getSubdomain: () => string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Estados
  const [currentTenant, setCurrentTenant] = useState<SaasTenant | null>(null);
  const [currentBranding, setCurrentBranding] = useState<TenantBranding | null>(null);
  const [currentUser, setCurrentUser] = useState<TenantUser | null>(null);
  const [tenantPlans, setTenantPlans] = useState<SaasPlan[]>([]);
  const [tenantUsage, setTenantUsage] = useState<TenantUsage | null>(null);
  const [availableTenants, setAvailableTenants] = useState<SaasTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      loadTenantData();
      loadPlans();
    } else {
      // Se não há usuário, parar o loading
      setIsLoading(false);
    }
  }, [user]);

  const loadTenantData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Carregar tenants do usuário
      const { data: userTenants, error: tenantsError } = await supabase
        .from("tenant_users")
        .select(`
          *,
          saas_tenants!inner(*)
        `)
        .eq("user_id", user?.id)
        .eq("status", "active");

      if (tenantsError) throw tenantsError;

      const tenants = userTenants?.map(ut => ut.saas_tenants).filter(Boolean) || [];
      setAvailableTenants(tenants as SaasTenant[]);

      // 2. Usar primeiro tenant como padrão ou tenant demo
      const defaultTenant = tenants[0] || {
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

      setCurrentTenant(defaultTenant as SaasTenant);

      // 3. Carregar branding do tenant
      await loadTenantBranding(defaultTenant.id);

      // 4. Carregar dados do usuário no tenant
      await loadCurrentTenantUser(defaultTenant.id);

      // 5. Carregar usage do tenant
      await loadTenantUsage(defaultTenant.id);

    } catch (err) {
      setError("Erro ao carregar dados da empresa");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTenantBranding = async (tenantId: string) => {
    try {
      const { data: branding, error } = await supabase
        .from("tenant_branding")
        .select("*")
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      const defaultBranding: TenantBranding = {
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
          peotram: {
            templates_enabled: true,
            ai_analysis: true,
            permissions_matrix: true
          },
          fleet: {
            real_time_tracking: true
          },
          analytics: {
            advanced_reports: true
          }
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

      const finalBranding = branding || defaultBranding;
      setCurrentBranding(finalBranding);
      applyBrandingTheme(finalBranding);

    } catch (err) {
    }
  };

  const loadCurrentTenantUser = async (tenantId: string) => {
    try {
      const { data: tenantUser, error } = await supabase
        .from("tenant_users")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("user_id", user?.id)
        .eq("status", "active")
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      const defaultUser: TenantUser = {
        id: "demo-user",
        tenant_id: tenantId,
        user_id: user?.id || "",
        role: "admin",
        status: "active",
        display_name: user?.user_metadata?.full_name || user?.email || "Usuário Demo",
        job_title: "Administrador",
        department: "TI",
        permissions: {},
        joined_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        metadata: {}
      };

      setCurrentUser(tenantUser || defaultUser);

    } catch (err) {
    }
  };

  const loadTenantUsage = async (tenantId: string) => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: usage, error } = await supabase
        .from("tenant_usage")
        .select("*")
        .eq("tenant_id", tenantId)
        .gte("period_start", startOfMonth.toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      const defaultUsage: TenantUsage = {
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

      setTenantUsage(usage || defaultUsage);

    } catch (err) {
    }
  };

  const loadPlans = async () => {
    try {
      const { data: plans, error } = await supabase
        .from("saas_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });

      if (error) throw error;
      setTenantPlans(plans || []);

    } catch (err) {
    }
  };

  const applyBrandingTheme = (branding: TenantBranding) => {
    const root = document.documentElement;
    
    // Aplicar cores personalizadas
    root.style.setProperty("--primary", branding.primary_color);
    root.style.setProperty("--secondary", branding.secondary_color);
    root.style.setProperty("--accent", branding.accent_color);
    
    if (branding.background_color) {
      root.style.setProperty("--background", branding.background_color);
    }
    
    if (branding.text_color) {
      root.style.setProperty("--foreground", branding.text_color);
    }
    
    // Atualizar título da página
    if (branding.company_name) {
      document.title = `${branding.company_name} - Plataforma Marítima`;
    }
    
    // Aplicar tema escuro/claro
    if (branding.theme_mode !== "auto") {
      document.documentElement.classList.toggle("dark", branding.theme_mode === "dark");
    }
  };

  // Implementação das funções principais
  const switchTenant = async (tenantId: string) => {
    try {
      setIsLoading(true);
      const tenant = availableTenants.find(t => t.id === tenantId);
      if (!tenant) throw new Error("Tenant não encontrado");

      setCurrentTenant(tenant);
      await loadTenantBranding(tenantId);
      await loadCurrentTenantUser(tenantId);
      await loadTenantUsage(tenantId);

    } catch (err) {
      setError("Erro ao trocar empresa");
    } finally {
      setIsLoading(false);
    }
  };

  const updateBranding = async (brandingUpdate: Partial<TenantBranding>) => {
    if (!currentTenant) return;

    try {
      const { data, error } = await supabase
        .from("tenant_branding")
        .update(brandingUpdate)
        .eq("tenant_id", currentTenant.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentBranding(data);
      applyBrandingTheme(data);

    } catch (err) {
      throw err;
    }
  };

  const updateTenantSettings = async (settings: Partial<SaasTenant>) => {
    if (!currentTenant) return;

    try {
      const updateData: any = {
        ...settings,
        features: settings.features ? settings.features as any : undefined,
        metadata: settings.metadata ? settings.metadata as any : undefined
      };

      const { data, error } = await supabase
        .from("saas_tenants")
        .update(updateData)
        .eq("id", currentTenant.id)
        .select()
        .single();

      if (error) throw error;
      setCurrentTenant(data as any);

    } catch (err) {
      throw err;
    }
  };

  const inviteTenantUser = async (email: string, role: string) => {
    if (!currentTenant) throw new Error("Nenhum tenant selecionado");
    // Invite functionality to be implemented
  };

  const updateUserRole = async (userId: string, role: string) => {
    if (!currentTenant) return;
  };

  const removeTenantUser = async (userId: string) => {
    if (!currentTenant) return;
  };

  const getTenantUsers = async (): Promise<TenantUser[]> => {
    if (!currentTenant) return [];
    // Mock data para demo
    return [
      {
        id: "1",
        tenant_id: currentTenant.id,
        user_id: user?.id || "",
        role: "admin",
        status: "active",
        display_name: "Administrador",
        job_title: "Administrador do Sistema",
        department: "TI",
        permissions: {},
        joined_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        metadata: {}
      }
    ];
  };

  const checkPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    
    // Admin tem todas as permissões
    if (currentUser.role === "owner" || currentUser.role === "admin") return true;
    
    const rolePermissions = {
      manager: ["view_analytics", "manage_data", "manage_team"],
      operator: ["manage_data", "view_data"],
      member: ["view_data"],
      viewer: ["view_data"]
    };

    const userPermissions = rolePermissions[currentUser.role as keyof typeof rolePermissions] || [];
    return userPermissions.includes(permission);
  };

  const checkFeatureAccess = (feature: string): boolean => {
    if (!currentTenant) return false;
    return currentTenant.features[feature] === true;
  };

  const checkUsageLimits = (type: string): boolean => {
    if (!currentTenant || !tenantUsage) return false;
    
    switch (type) {
    case "users":
      return tenantUsage.active_users < currentTenant.max_users;
    case "vessels":
      return tenantUsage.vessels_managed < currentTenant.max_vessels;
    case "storage":
      return tenantUsage.storage_used_gb < currentTenant.max_storage_gb;
    case "api_calls":
      return tenantUsage.api_calls_made < currentTenant.max_api_calls_per_month;
    default:
      return false;
    }
  };

  const upgradePlan = async (planId: string) => {
  };

  const downgradeplan = async (planId: string) => {
  };

  const formatCurrency = (amount: number): string => {
    const currency = currentBranding?.default_currency || "BRL";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: string): string => {
    const format = currentBranding?.date_format || "DD/MM/YYYY";
    const dateObj = new Date(date);
    
    if (format === "DD/MM/YYYY") {
      return dateObj.toLocaleDateString("pt-BR");
    }
    
    return dateObj.toLocaleDateString();
  };

  const getSubdomain = (): string => {
    return currentTenant?.subdomain || "demo";
  };

  const value: TenantContextType = {
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
    getSubdomain
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};