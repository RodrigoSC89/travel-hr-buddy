/**
 * User Profile Context - Personalização por Perfil
 * Define módulos visíveis e configurações por tipo de usuário
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/utils/production-logger";

export type UserRole = "admin" | "operator" | "auditor" | "manager" | "dpo" | "guest";

interface ModuleAccess {
  id: string;
  name: string;
  path: string;
  icon: string;
  visible: boolean;
}

interface ProfileConfig {
  role: UserRole;
  displayName: string;
  modules: ModuleAccess[];
  shortcuts: string[];
  dashboardLayout: "full" | "compact" | "minimal";
  aiPersonality: "professional" | "friendly" | "technical";
  theme: "system" | "light" | "dark";
  notifications: {
    push: boolean;
    email: boolean;
    slack: boolean;
  };
}

const defaultModules: ModuleAccess[] = [
  { id: "command", name: "Command Center", path: "/nautilus-command", icon: "Anchor", visible: true },
  { id: "fleet", name: "Fleet Command", path: "/fleet-command", icon: "Ship", visible: true },
  { id: "crew", name: "Crew Management", path: "/crew-management", icon: "Users", visible: true },
  { id: "maintenance", name: "Maintenance", path: "/maintenance-command", icon: "Wrench", visible: true },
  { id: "compliance", name: "Compliance Hub", path: "/compliance-hub", icon: "Shield", visible: true },
  { id: "telemetry", name: "Telemetria", path: "/telemetria", icon: "Activity", visible: true },
  { id: "ai-ops", name: "AI Operations", path: "/ai-operations-center", icon: "Brain", visible: true },
  { id: "security", name: "Security Center", path: "/security-center", icon: "Lock", visible: true },
  { id: "simulator", name: "Simulador", path: "/simulador", icon: "Gamepad", visible: true },
  { id: "noc", name: "NOC 24/7", path: "/noc", icon: "Monitor", visible: true },
  { id: "docs", name: "Documentação", path: "/docs", icon: "Book", visible: true },
  { id: "integrations", name: "Integrações", path: "/integracoes", icon: "Link", visible: true },
];

const roleConfigs: Record<UserRole, Partial<ProfileConfig>> = {
  admin: {
    displayName: "Administrador",
    modules: defaultModules,
    shortcuts: ["/nautilus-command", "/security-center", "/ai-operations-center", "/admin"],
    dashboardLayout: "full",
    aiPersonality: "professional",
  },
  operator: {
    displayName: "Operador",
    modules: defaultModules.map(m => ({
      ...m,
      visible: ["command", "fleet", "crew", "maintenance", "telemetry", "noc"].includes(m.id)
    })),
    shortcuts: ["/nautilus-command", "/telemetria", "/noc"],
    dashboardLayout: "compact",
    aiPersonality: "friendly",
  },
  auditor: {
    displayName: "Auditor",
    modules: defaultModules.map(m => ({
      ...m,
      visible: ["command", "compliance", "security", "docs"].includes(m.id)
    })),
    shortcuts: ["/compliance-hub", "/auditoria-tecnica", "/security-center"],
    dashboardLayout: "compact",
    aiPersonality: "technical",
  },
  manager: {
    displayName: "Gestor",
    modules: defaultModules.map(m => ({
      ...m,
      visible: ["command", "fleet", "crew", "maintenance", "compliance", "ai-ops", "docs"].includes(m.id)
    })),
    shortcuts: ["/nautilus-command", "/fleet-command", "/crew-management"],
    dashboardLayout: "full",
    aiPersonality: "professional",
  },
  dpo: {
    displayName: "DPO (Data Protection)",
    modules: defaultModules.map(m => ({
      ...m,
      visible: ["command", "security", "compliance", "docs"].includes(m.id)
    })),
    shortcuts: ["/security-center", "/compliance-hub"],
    dashboardLayout: "minimal",
    aiPersonality: "technical",
  },
  guest: {
    displayName: "Visitante",
    modules: defaultModules.map(m => ({
      ...m,
      visible: ["command", "docs"].includes(m.id)
    })),
    shortcuts: ["/nautilus-command"],
    dashboardLayout: "minimal",
    aiPersonality: "friendly",
  }
};

interface UserProfileContextType {
  profile: ProfileConfig;
  role: UserRole;
  visibleModules: ModuleAccess[];
  setRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<ProfileConfig>) => void;
  hasAccess: (moduleId: string) => boolean;
  isLoading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [role, setRoleState] = useState<UserRole>("guest");
  const [profile, setProfile] = useState<ProfileConfig>({
    role: "guest",
    displayName: "Visitante",
    modules: defaultModules,
    shortcuts: [],
    dashboardLayout: "minimal",
    aiPersonality: "friendly",
    theme: "system",
    notifications: { push: true, email: true, slack: false }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile from database
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setRoleState("guest");
        setIsLoading(false);
        return;
      }

      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          // Default to operator if no role column
          const userRole: UserRole = "operator";
          setRoleState(userRole);
          
          const roleConfig = roleConfigs[userRole];
          const profileRecord = profileData as Record<string, unknown>;
          setProfile(prev => ({
            ...prev,
            ...roleConfig,
            role: userRole,
            displayName: (typeof profileRecord.display_name === "string" ? profileRecord.display_name : null) || roleConfig.displayName || "Usuário"
          }));
        }
      } catch (error) {
        logger.error("Error loading profile", error);
        setRoleState("operator");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    const roleConfig = roleConfigs[newRole];
    setProfile(prev => ({
      ...prev,
      ...roleConfig,
      role: newRole
    }));
  };

  const updateProfile = (updates: Partial<ProfileConfig>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const hasAccess = (moduleId: string): boolean => {
    const module = profile.modules.find(m => m.id === moduleId);
    return module?.visible ?? false;
  };

  const visibleModules = profile.modules.filter(m => m.visible);

  return (
    <UserProfileContext.Provider value={{
      profile,
      role,
      visibleModules,
      setRole,
      updateProfile,
      hasAccess,
      isLoading
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error("useUserProfile must be used within UserProfileProvider");
  }
  return context;
}
