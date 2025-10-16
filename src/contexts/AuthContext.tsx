import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
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
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        try {
          if (event === "SIGNED_IN") {
            toast({
              title: "Bem-vindo!",
              description: "Login realizado com sucesso.",
            });
          } else if (event === "SIGNED_OUT") {
            toast({
              title: "Desconectado",
              description: "Você foi desconectado com sucesso.",
            });
          } else if (event === "TOKEN_REFRESHED") {
            // Token refreshed successfully
          } else if (event === "USER_UPDATED") {
            // User data updated
          }
        } catch (err) {
          // Ignorar erros de toast
          logger.warn("Toast error:", err);
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

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]).catch(() => ({ data: { session: null }, error: null })) as any;

        if (error) {
          try {
            toast({
              title: "Erro de Sessão",
              description: "Não foi possível recuperar a sessão. Por favor, faça login novamente.",
              variant: "destructive",
            });
          } catch (err) {
            logger.warn("Toast error:", err);
          }
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        logger.warn("Error loading session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();

    return () => subscription.unsubscribe();
  }, [toast]);

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
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cadastro realizado!",
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
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
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
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado!",
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
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};