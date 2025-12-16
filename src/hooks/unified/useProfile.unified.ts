/**
 * UNIFIED PROFILE HOOK
 * Fusão de: useProfile.ts + use-profile.ts
 * 
 * Combina:
 * - Fetch de perfil (ambos)
 * - Update de perfil (use-profile.ts)
 * - Fallback para usuário sem perfil (useProfile.ts)
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ============================================
// TYPES
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
  phone: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UseProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

// ============================================
// MAIN HOOK
// ============================================

export function useProfile(): UseProfileReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
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
        // PGRST116 = row not found - create fallback profile
        if (fetchError.code === "PGRST116") {
          const fallbackProfile: Profile = {
            id: user.id,
            email: user.email || "",
            full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário",
            avatar_url: user.user_metadata?.avatar_url || null,
            department: null,
            position: null,
            phone: null,
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
        } else {
          console.error("Error fetching profile:", fetchError);
          setError(new Error(fetchError.message));
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      let result;
      
      if (!existingProfile) {
        // Create new profile
        result = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email || "",
            ...updates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
      } else {
        // Update existing profile
        result = await supabase
          .from("profiles")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          .select()
          .single();
      }

      if (result.error) {
        toast({
          title: "Erro ao atualizar perfil",
          description: result.error.message,
          variant: "destructive",
        });
        return { error: new Error(result.error.message) };
      }

      setProfile(result.data as Profile);

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  }, [user, toast]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
  };
}

// ============================================
// SIMPLE PROFILE HOOK (backward compatibility)
// ============================================

export function useSimpleProfile() {
  const { profile, isLoading } = useProfile();
  return { profile, isLoading };
}

export default useProfile;
