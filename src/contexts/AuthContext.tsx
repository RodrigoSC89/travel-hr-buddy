import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logger } from "@/lib/utils/logger";

type OAuthProvider = "google" | "github" | "azure";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        
        // Use setTimeout to defer toast calls (avoid deadlock)
        if (event === "SIGNED_IN") {
          setTimeout(() => {
            toast.success("Bem-vindo!", {
              description: "Login realizado com sucesso.",
            });
          }, 0);
        } else if (event === "SIGNED_OUT") {
          setTimeout(() => {
            toast.info("Desconectado", {
              description: "Você foi desconectado com sucesso.",
            });
          }, 0);
        }
      }
    );

    // THEN check for existing session with timeout
    const loadSession = async () => {
      try {
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 5000)
        );
        
        const sessionPromise = supabase.auth.getSession();

        const { data: { session: existingSession }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]).catch(() => ({ data: { session: null }, error: null })) as { data: { session: Session | null }, error: unknown };

        if (error) {
          setTimeout(() => {
            toast.error("Erro de Sessão", {
              description: "Não foi possível recuperar a sessão. Por favor, faça login novamente.",
            });
          }, 0);
        }
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
      } catch (error) {
        Logger.warn("Error loading session", error, "AuthContext");
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      toast.error("Erro no cadastro", {
        description: error.message,
      });
    } else {
      toast.success("Cadastro realizado!", {
        description: "Verifique seu email para confirmar a conta.",
      });
    }

    setIsLoading(false);
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Erro no login", {
        description: error.message,
      });
    }

    setIsLoading(false);
    return { error };
  };

  const signInWithOAuth = async (provider: OAuthProvider) => {
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      }
    });

    if (error) {
      toast.error("Erro no login", {
        description: error.message,
      });
    }

    setIsLoading(false);
    return { error };
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?type=recovery`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast.error("Erro", {
        description: error.message,
      });
    } else {
      toast.success("Email enviado!", {
        description: "Verifique seu email para redefinir a senha.",
      });
    }

    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};