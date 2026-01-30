/**
 * Hook para controle de acesso por embarcação
 * Nauti One v6.0 - Multi-Tenant Access Control
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface VesselAccess {
  id: string;
  vessel_id: string;
  vessel_name?: string;
  access_level: "member" | "officer" | "captain" | "manager";
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface UseVesselAccessReturn {
  /** Lista de embarcações que o usuário pode acessar */
  accessibleVessels: VesselAccess[];
  /** IDs das embarcações acessíveis */
  vesselIds: string[];
  /** Verifica se o usuário tem acesso a uma embarcação específica */
  hasAccessToVessel: (vesselId: string) => boolean;
  /** Verifica se o usuário tem acesso global (HR, Admin, etc.) */
  hasGlobalAccess: boolean;
  /** Verifica se o usuário tem nível de acesso específico em uma embarcação */
  hasAccessLevel: (vesselId: string, requiredLevel: VesselAccess["access_level"][]) => boolean;
  /** Estado de carregamento */
  isLoading: boolean;
  /** Erro, se houver */
  error: Error | null;
  /** Recarregar dados de acesso */
  refresh: () => Promise<void>;
}

// Roles que têm acesso global a todas as embarcações
const GLOBAL_ACCESS_ROLES = [
  "admin",
  "hr_manager",
  "hr_analyst",
  "legal",
  "finance",
  "purchasing",
  "auditor",
  "manager",
];

// Hierarquia de níveis de acesso
const ACCESS_LEVEL_HIERARCHY: Record<VesselAccess["access_level"], number> = {
  member: 1,
  officer: 2,
  captain: 3,
  manager: 4,
};

export function useVesselAccess(): UseVesselAccessReturn {
  const { user } = useAuth();
  const [accessibleVessels, setAccessibleVessels] = useState<VesselAccess[]>([]);
  const [hasGlobalAccess, setHasGlobalAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVesselAccess = useCallback(async () => {
    if (!user) {
      setAccessibleVessels([]);
      setHasGlobalAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Verificar role do usuário para acesso global
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const userRole = roleData?.role as string | undefined;
      const isGlobalUser = userRole ? GLOBAL_ACCESS_ROLES.includes(userRole) : false;
      setHasGlobalAccess(isGlobalUser);

      if (isGlobalUser) {
        // Usuário com acesso global - buscar todas as embarcações
        const { data: vessels, error: vesselsError } = await supabase
          .from("vessels")
          .select("id, name")
          .order("name");

        if (vesselsError) throw vesselsError;

        const globalAccess: VesselAccess[] = (vessels || []).map((v) => ({
          id: `global-${v.id}`,
          vessel_id: v.id,
          vessel_name: v.name,
          access_level: "manager" as const,
          granted_at: new Date().toISOString(),
          expires_at: null,
          is_active: true,
        }));

        setAccessibleVessels(globalAccess);
      } else {
        // Usuário normal - buscar acessos específicos
        const { data: accessData, error: accessError } = await supabase
          .from("user_vessel_access")
          .select(`
            id,
            vessel_id,
            access_level,
            granted_at,
            expires_at,
            is_active,
            vessels (name)
          `)
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (accessError) throw accessError;

        // Também buscar via crew_members
        const { data: crewData } = await supabase
          .from("crew_members")
          .select(`
            id,
            vessel_id,
            vessels (name)
          `)
          .or(`auth_user_id.eq.${user.id},user_id.eq.${user.id}`);

        // Combinar acessos
        const accessMap = new Map<string, VesselAccess>();

        // Adicionar acessos diretos
        (accessData || []).forEach((access) => {
          const vesselName = (access.vessels as { name?: string } | null)?.name;
          accessMap.set(access.vessel_id, {
            id: access.id,
            vessel_id: access.vessel_id,
            vessel_name: vesselName,
            access_level: access.access_level as VesselAccess["access_level"],
            granted_at: access.granted_at ?? new Date().toISOString(),
            expires_at: access.expires_at ?? null,
            is_active: access.is_active ?? true,
          });
        });

        // Adicionar acessos via crew_members (como member se não existir)
        (crewData || []).forEach((crew) => {
          if (crew.vessel_id && !accessMap.has(crew.vessel_id)) {
            const vesselName = (crew.vessels as { name?: string } | null)?.name;
            accessMap.set(crew.vessel_id, {
              id: `crew-${crew.id}`,
              vessel_id: crew.vessel_id,
              vessel_name: vesselName,
              access_level: "member",
              granted_at: new Date().toISOString(),
              expires_at: null,
              is_active: true,
            });
          }
        });

        setAccessibleVessels(Array.from(accessMap.values()));
      }
    } catch (err) {
      console.error("Erro ao buscar acesso a embarcações:", err);
      setError(err instanceof Error ? err : new Error("Erro desconhecido"));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVesselAccess();
  }, [fetchVesselAccess]);

  const vesselIds = accessibleVessels.map((v) => v.vessel_id);

  const hasAccessToVessel = useCallback(
    (vesselId: string): boolean => {
      if (hasGlobalAccess) return true;
      return vesselIds.includes(vesselId);
    },
    [hasGlobalAccess, vesselIds]
  );

  const hasAccessLevel = useCallback(
    (vesselId: string, requiredLevels: VesselAccess["access_level"][]): boolean => {
      if (hasGlobalAccess) return true;

      const access = accessibleVessels.find((v) => v.vessel_id === vesselId);
      if (!access) return false;

      const userLevel = ACCESS_LEVEL_HIERARCHY[access.access_level];
      const minRequiredLevel = Math.min(
        ...requiredLevels.map((l) => ACCESS_LEVEL_HIERARCHY[l])
      );

      return userLevel >= minRequiredLevel;
    },
    [hasGlobalAccess, accessibleVessels]
  );

  return {
    accessibleVessels,
    vesselIds,
    hasAccessToVessel,
    hasGlobalAccess,
    hasAccessLevel,
    isLoading,
    error,
    refresh: fetchVesselAccess,
  };
}

/**
 * Hook para filtrar dados por embarcações acessíveis
 */
export function useVesselFilter<T extends { vessel_id?: string | null }>(
  data: T[] | null | undefined
): T[] {
  const { vesselIds, hasGlobalAccess } = useVesselAccess();

  if (!data) return [];
  if (hasGlobalAccess) return data;

  return data.filter((item) => {
    if (!item.vessel_id) return true; // Dados sem vessel_id são visíveis
    return vesselIds.includes(item.vessel_id);
  });
}
