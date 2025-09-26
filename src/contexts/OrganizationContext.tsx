import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

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

interface OrganizationUser {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  status: string;
  permissions: any;
  departments?: string[];
  joined_at: string;
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
    throw new Error('useOrganization must be used within an OrganizationProvider');
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

  // Carregar organização do usuário atual
  useEffect(() => {
    if (user) {
      loadUserOrganization();
    } else {
      setCurrentOrganization(null);
      setCurrentBranding(null);
      setUserRole(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadUserOrganization = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar organização do usuário
      const { data: orgUser, error: orgUserError } = await supabase
        .from('organization_users')
        .select(`
          role,
          status,
          organization:organizations(*)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (orgUserError) {
        console.error('Erro ao buscar organização:', orgUserError);
        setCurrentOrganization(null);
        setUserRole(null);
        return;
      }

      if (!orgUser) {
        // Para demo, criar organização padrão
        const defaultOrg = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Nautilus Demo',
          features: { peotram: true, fleet_management: true, analytics: true }
        };
        setCurrentOrganization(defaultOrg as any);
        setUserRole('admin');
        return;
      }

      setCurrentOrganization(orgUser.organization as any);
      setUserRole(orgUser.role);

      // Carregar branding da organização
      if (orgUser.organization) {
        const { data: branding, error: brandingError } = await supabase
          .from('organization_branding')
          .select('*')
          .eq('organization_id', (orgUser.organization as any).id)
          .maybeSingle();

        if (brandingError) {
          console.error('Erro ao carregar branding:', brandingError);
        } else if (branding) {
          setCurrentBranding(branding as any);
          
          // Aplicar tema personalizado
          applyBrandingTheme(branding as any);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar organização:', err);
      setError('Erro ao carregar dados da organização');
    } finally {
      setIsLoading(false);
    }
  };

  const applyBrandingTheme = (branding: OrganizationBranding) => {
    const root = document.documentElement;
    
    // Aplicar cores personalizadas
    root.style.setProperty('--primary', branding.primary_color);
    root.style.setProperty('--secondary', branding.secondary_color);
    root.style.setProperty('--accent', branding.accent_color);
    
    // Atualizar título da página
    if (branding.company_name) {
      document.title = `${branding.company_name} - Nautilus One`;
    }
    
    // Aplicar tema escuro/claro se especificado
    if (branding.theme_mode !== 'auto') {
      document.documentElement.classList.toggle('dark', branding.theme_mode === 'dark');
    }
  };

  const switchOrganization = async (orgId: string) => {
    try {
      setIsLoading(true);
      
      // Verificar se o usuário tem acesso à organização
      const { data: orgUser, error } = await supabase
        .from('organization_users')
        .select(`
          role,
          status,
          organization:organizations(*)
        `)
        .eq('organization_id', orgId)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error || !orgUser) throw new Error('Acesso negado');

      setCurrentOrganization(orgUser.organization as any);
      setUserRole(orgUser.role);

      // Recarregar branding
      await loadUserOrganization();
    } catch (err) {
      console.error('Erro ao trocar organização:', err);
      setError('Erro ao trocar de organização');
    } finally {
      setIsLoading(false);
    }
  };

  const updateBranding = async (brandingUpdate: Partial<OrganizationBranding>) => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('organization_branding')
        .update(brandingUpdate)
        .eq('organization_id', currentOrganization.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentBranding(data as any);
      applyBrandingTheme(data as any);
    } catch (err) {
      console.error('Erro ao atualizar branding:', err);
      throw err;
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!userRole) return true; // Default allow for demo
    
    // Hierarquia de permissões
    const roleHierarchy = {
      owner: ['all'],
      admin: ['manage_users', 'manage_settings', 'view_analytics', 'manage_data'],
      manager: ['manage_data', 'view_analytics', 'manage_team'],
      operator: ['manage_data', 'view_data'],
      member: ['view_data'],
      viewer: ['view_data']
    };

    const userPermissions = roleHierarchy[userRole as keyof typeof roleHierarchy] || ['view_data'];
    return userPermissions.includes(permission) || userPermissions.includes('all');
  };

  const getCurrentOrganizationUsers = async (): Promise<any[]> => {
    if (!currentOrganization) return [];

    // Mock data for now since profiles table may not exist yet
    const mockUsers = [
      {
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        full_name: 'Administrador',
        joined_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      },
      {
        id: '2', 
        email: 'user@example.com',
        role: 'member',
        status: 'active',
        full_name: 'Usuário Exemplo',
        joined_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      }
    ];
    
    return mockUsers;
  };

  const inviteUser = async (email: string, role: string) => {
    if (!currentOrganization) throw new Error('Nenhuma organização selecionada');
    
    // TODO: Implementar sistema de convite por email
    // Por enquora, apenas criar o registro na organização
    console.log('Funcionalidade de convite será implementada em breve');
  };

  const removeUser = async (userId: string) => {
    if (!currentOrganization) return;

    const { error } = await supabase
      .from('organization_users')
      .update({ status: 'inactive' })
      .eq('organization_id', currentOrganization.id)
      .eq('user_id', userId);

    if (error) throw error;
  };

  const updateUserRole = async (userId: string, role: string) => {
    if (!currentOrganization) return;

    const { error } = await supabase
      .from('organization_users')
      .update({ role })
      .eq('organization_id', currentOrganization.id)
      .eq('user_id', userId);

    if (error) throw error;
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
    updateUserRole
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};