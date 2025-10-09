import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan_type: string;
  max_users: number;
  max_vessels: number;
  max_storage_gb: number;
  features: any;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  created_at: string;
}

interface OrganizationBranding {
  id: string;
  organization_id: string;
  company_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  theme_mode: string;
  default_language: string;
  default_currency: string;
  timezone: string;
  custom_fields: any;
  business_rules: Record<string, any>;
  enabled_modules: any;
  module_settings: any;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  currentBranding: OrganizationBranding | null;
  userRole: string | null;
  isLoading: boolean;
  error: string | null;

  // Funções
  switchOrganization: (orgId: string) => Promise<void>;
  updateBranding: (branding: Partial<OrganizationBranding>) => Promise<void>;
  checkPermission: (permission: string) => boolean;
  getCurrentOrganizationUsers: () => Promise<any[]>;
  inviteUser: (email: string, role: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentBranding, setCurrentBranding] = useState<OrganizationBranding | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar organização demo
  useEffect(() => {
    loadDemoOrganization();
  }, []);

  const loadDemoOrganization = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Usar organização demo
      const demoOrg: Organization = {
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
      };

      setCurrentOrganization(demoOrg);
      setUserRole("admin");

      // Carregar branding da organização
      try {
        const { data: branding, error: brandingError } = await supabase
          .from("organization_branding")
          .select("*")
          .eq("organization_id", "550e8400-e29b-41d4-a716-446655440000")
          .maybeSingle();

        if (!brandingError && branding) {
          setCurrentBranding(branding as any);
          applyBrandingTheme(branding as any);
        } else {
          // Usar branding demo
          const demoBranding: OrganizationBranding = {
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
            enabled_modules: ["fleet", "crew", "certificates", "analytics", "travel", "documents"],
            module_settings: {
              peotram: { templates_enabled: true, ai_analysis: true, permissions_matrix: true },
            },
          };

          setCurrentBranding(demoBranding);
          applyBrandingTheme(demoBranding);
        }
      } catch (err) {
        console.error("Erro ao carregar branding:", err);
        // Usar branding demo em caso de erro
        const demoBranding: OrganizationBranding = {
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
          enabled_modules: ["fleet", "crew", "certificates", "analytics", "travel", "documents"],
          module_settings: {
            peotram: { templates_enabled: true, ai_analysis: true, permissions_matrix: true },
          },
        };

        setCurrentBranding(demoBranding);
        applyBrandingTheme(demoBranding);
      }
    } catch (err) {
      console.error("Erro ao carregar organização:", err);
      setError("Erro ao carregar dados da organização");
    } finally {
      setIsLoading(false);
    }
  };

  const applyBrandingTheme = (branding: OrganizationBranding) => {
    const root = document.documentElement;

    // Aplicar cores personalizadas
    root.style.setProperty("--primary", branding.primary_color);
    root.style.setProperty("--secondary", branding.secondary_color);
    root.style.setProperty("--accent", branding.accent_color);

    // Atualizar título da página
    if (branding.company_name) {
      document.title = `${branding.company_name} - Nautilus One`;
    }

    // Aplicar tema escuro/claro se especificado
    if (branding.theme_mode !== "auto") {
      document.documentElement.classList.toggle("dark", branding.theme_mode === "dark");
    }
  };

  const switchOrganization = async (orgId: string) => {
    // Por enquanto, manter a organização demo
    return;
  };

  const updateBranding = async (brandingUpdate: Partial<OrganizationBranding>) => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from("organization_branding")
        .update(brandingUpdate)
        .eq("organization_id", currentOrganization.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentBranding(data as any);
      applyBrandingTheme(data as any);
    } catch (err) {
      console.error("Erro ao atualizar branding:", err);
      throw err;
    }
  };

  const checkPermission = (permission: string): boolean => {
    // Para demo, admin tem todas as permissões
    if (userRole === "admin") return true;

    // Hierarquia de permissões simplificada
    const roleHierarchy = {
      owner: ["all"],
      admin: ["manage_users", "manage_settings", "view_analytics", "manage_data"],
      manager: ["manage_data", "view_analytics", "manage_team"],
      operator: ["manage_data", "view_data"],
      member: ["view_data"],
      viewer: ["view_data"],
    };

    const userPermissions = roleHierarchy[userRole as keyof typeof roleHierarchy] || [];
    return userPermissions.includes(permission) || userPermissions.includes("all");
  };

  const getCurrentOrganizationUsers = async (): Promise<any[]> => {
    // Mock data para demo
    const mockUsers = [
      {
        id: "1",
        email: "admin@nautilus.com",
        role: "admin",
        status: "active",
        full_name: "Administrador",
        joined_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      },
      {
        id: "2",
        email: "user@nautilus.com",
        role: "member",
        status: "active",
        full_name: "Usuário Demo",
        joined_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      },
    ];

    return mockUsers;
  };

  const inviteUser = async (email: string, role: string) => {
    if (!currentOrganization) throw new Error("Nenhuma organização selecionada");
    // Invite functionality to be implemented
  };

  const removeUser = async (userId: string) => {
    console.log("Funcionalidade de remoção será implementada em breve");
  };

  const updateUserRole = async (userId: string, role: string) => {
    console.log("Funcionalidade de atualização de role será implementada em breve");
  };

  const value: OrganizationContextType = {
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
    updateUserRole,
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};
