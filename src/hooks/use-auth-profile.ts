import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  position: string | null;
  phone: string | null;
  role: "user" | "admin";
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: boolean;
    language: "pt" | "en" | "es";
  };
}

export const useAuthProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (!data) {
          // Create default profile
          const defaultProfile = {
            id: user.id,
            email: user.email || "",
            full_name: user.email?.split("@")[0] || "Usuário",
            avatar_url: null,
            department: null,
            position: null,
            phone: null,
            role: "user" as const,
            preferences: {
              theme: "system" as const,
              notifications: true,
              language: "pt" as const,
            }
          };

          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert(defaultProfile)
            .select()
            .single();

          if (createError) {
            setProfile(defaultProfile);
          } else {
            // Map the new profile to our UserProfile interface
            const mappedNewProfile: UserProfile = {
              id: newProfile.id,
              email: newProfile.email,
              full_name: newProfile.full_name,
              avatar_url: newProfile.avatar_url,
              department: newProfile.department,
              position: newProfile.position,
              phone: newProfile.phone,
              role: (newProfile.role === "admin" ? "admin" : "user") as "user" | "admin",
              preferences: {
                theme: "system",
                notifications: true,
                language: "pt",
              }
            };
            setProfile(mappedNewProfile);
          }
        } else {
          // Map the database profile to our UserProfile interface
          const mappedProfile: UserProfile = {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            department: data.department,
            position: data.position,
            phone: data.phone,
            role: (data.role === "admin" ? "admin" : "user") as "user" | "admin",
            preferences: {
              theme: "system",
              notifications: true,
              language: "pt",
            }
          };
          setProfile(mappedProfile);
        }
      } catch (error) {
        // Fallback profile
        setProfile({
          id: user.id,
          email: user.email || "",
          full_name: user.email?.split("@")[0] || "Usuário",
          avatar_url: null,
          department: null,
          position: null,
          phone: null,
          role: "user",
          preferences: {
            theme: "system",
            notifications: true,
            language: "pt",
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return false;

    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o perfil",
          variant: "destructive",
        });
        return false;
      }

      // Map the updated profile
      const mappedProfile: UserProfile = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        department: data.department,
        position: data.position,
        phone: data.phone,
        role: profile.role,
        preferences: profile.preferences
      };
      setProfile(mappedProfile);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar perfil",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!profile) return false;

    setIsUpdating(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        toast({
          title: "Erro",
          description: "Não foi possível fazer upload da imagem",
          variant: "destructive",
        });
        return false;
      }

      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const success = await updateProfile({ avatar_url: publicUrl.publicUrl });
      if (success) {
        toast({
          title: "Sucesso",
          description: "Avatar atualizado com sucesso",
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao fazer upload do avatar",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    profile,
    isLoading,
    isUpdating,
    updateProfile,
    uploadAvatar,
  };
};