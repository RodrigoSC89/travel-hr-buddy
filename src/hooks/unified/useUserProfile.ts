/**
 * PATCH 178.0 - Unified User Profile Hook
 * Fusão de: useProfile.ts, use-profile.ts
 * 
 * Provides user profile management with CRUD operations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// =============================================================================
// TYPES
// =============================================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
  phone: string | null;
  status: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UseUserProfileOptions {
  /** Enable toast notifications */
  showToasts?: boolean;
  /** Auto-create profile if not exists */
  autoCreate?: boolean;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * Unified user profile hook
 * Combines all profile-related functionality into a single hook
 */
export function useUserProfile(options: UseUserProfileOptions = {}): UseUserProfileReturn {
  const { showToasts = true, autoCreate = true } = options;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        // Profile might not exist yet
        if (fetchError.code === "PGRST116" && autoCreate) {
          // Create basic profile
          const basicProfile: UserProfile = {
            id: user.id,
            email: user.email || "",
            full_name: user.email?.split("@")[0] || "Usuário",
            avatar_url: null,
            department: null,
            position: null,
            phone: null,
            status: "active",
            role: "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProfile(basicProfile);
        } else if (fetchError.code !== "PGRST116") {
          setError(new Error(fetchError.message));
        }
      } else {
        // Map data to profile, adding role default
        setProfile({ 
          ...data, 
          role: (data as any).role || "user" 
        } as UserProfile);
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      console.error("Error in fetchProfile:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [user, autoCreate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        if (showToasts) {
          toast({
            title: "Erro ao atualizar perfil",
            description: updateError.message,
            variant: "destructive",
          });
        }
        return { error: new Error(updateError.message) };
      }

      // Refresh profile data
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({ 
          ...data, 
          role: (data as any).role || "user" 
        } as UserProfile);
      }

      if (showToasts) {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        });
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      if (showToasts) {
        toast({
          title: "Erro ao atualizar perfil",
          description: error.message,
          variant: "destructive",
        });
      }
      return { error };
    }
  }, [user, showToasts, toast]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
  };
}

// =============================================================================
// LEGACY EXPORTS (for backward compatibility)
// =============================================================================

/** @deprecated Use useUserProfile instead */
export const useProfile = useUserProfile;

export default useUserProfile;
