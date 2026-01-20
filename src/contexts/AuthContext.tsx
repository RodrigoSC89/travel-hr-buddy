// AuthContext - PATCH 850.3 - Fixed React import to use named imports
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
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

// Default context value to prevent null errors
const defaultAuthValue: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signInWithOAuth: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
};

const AuthContext = createContext<AuthContextType>(defaultAuthValue);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    Logger.warn("useAuth called outside of AuthProvider, returning default value");
    return defaultAuthValue;
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;
    
    // Timeout de segurança AGRESSIVO - SEMPRE sai do loading
    // Para conexões muito lentas, não podemos esperar indefinidamente
    const safetyTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        Logger.warn("Auth init timeout (30s) - forcing ready state", undefined, "AuthContext");
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 30000); // 30 segundos para conexões muito lentas (satélite)

    // Timeout intermediário para sair do loading visualmente mais cedo
    const visualTimeout = setTimeout(() => {
      if (mounted && isLoading && !isInitialized) {
        Logger.info("Auth visual timeout (10s) - marking initialized", undefined, "AuthContext");
        setIsInitialized(true);
        // NÃO setar isLoading = false ainda - esperar getSession
      }
    }, 10000);

    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST (critical for session detection)
        const { data } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (!mounted) return;
            
            // Update state synchronously - NUNCA async aqui
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setIsLoading(false);
            setIsInitialized(true);
            
            // Defer toasts to prevent deadlock - usar setTimeout(0)
            if (event === "SIGNED_IN") {
              setTimeout(() => toast.success("Bem-vindo!", { description: "Login realizado com sucesso." }), 0);
            } else if (event === "SIGNED_OUT") {
              setTimeout(() => toast.info("Desconectado", { description: "Você foi desconectado com sucesso." }), 0);
            }
          }
        );
        
        subscription = data.subscription;

        // THEN check for existing session
        // O customFetch no Supabase client já faz retry automático
        try {
          const { data: sessionData, error } = await supabase.auth.getSession();

          if (!mounted) return;

          if (error) {
            // Log mas não falhe - o usuário pode fazer login manualmente
            Logger.warn("Error getting session", error, "AuthContext");
          }
          
          setSession(sessionData?.session ?? null);
          setUser(sessionData?.session?.user ?? null);
        } catch (fetchError) {
          // Erro de rede/timeout - não bloquear o app
          Logger.warn("Failed to fetch session (network issue)", fetchError, "AuthContext");
        } finally {
          if (mounted) {
            setIsLoading(false);
            setIsInitialized(true);
          }
        }
      } catch (error) {
        if (!mounted) return;
        // Erro crítico - ainda assim liberar o app
        Logger.warn("Error initializing auth", error, "AuthContext");
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      clearTimeout(visualTimeout);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    try {
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
        setIsLoading(false);
        return { error };
      }
      
      toast.success("Cadastro realizado!", {
        description: "Verifique seu email para confirmar a conta.",
      });
      
      setIsLoading(false);
      return { error: null };
    } catch (err) {
      setIsLoading(false);
      const error = err instanceof Error ? err : new Error("Erro desconhecido");
      toast.error("Erro no cadastro", { description: error.message });
      return { error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // PATCH v17 iOS PWA: Nunca mostrar "Failed to fetch" - mensagem genérica
        const errorMsg = error.message?.toLowerCase() || '';
        let userMessage = "Verifique suas credenciais e tente novamente.";
        
        if (errorMsg.includes('invalid') || errorMsg.includes('credentials')) {
          userMessage = "Email ou senha incorretos.";
        } else if (errorMsg.includes('email not confirmed')) {
          userMessage = "Confirme seu email antes de entrar.";
        } else if (errorMsg.includes('too many requests')) {
          userMessage = "Muitas tentativas. Aguarde um momento.";
        }
        
        toast.error("Erro no login", { description: userMessage });
        setIsLoading(false);
        return { error };
      }

      setIsLoading(false);
      return { error: null };
    } catch (err) {
      setIsLoading(false);
      // PATCH v17 iOS PWA: Nunca mostrar erro técnico - mensagem genérica
      toast.error("Erro no login", { description: "Tente novamente em alguns segundos." });
      return { error: err instanceof Error ? err : new Error("Erro desconhecido") };
    }
  }, []);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    try {
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
        setIsLoading(false);
        return { error };
      }

      setIsLoading(false);
      return { error: null };
    } catch (err) {
      setIsLoading(false);
      const error = err instanceof Error ? err : new Error("Erro desconhecido");
      toast.error("Erro no login", { description: error.message });
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      Logger.warn("Error signing out", error, "AuthContext");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?type=recovery`;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast.error("Erro", {
          description: error.message,
        });
        return { error };
      }
      
      toast.success("Email enviado!", {
        description: "Verifique seu email para redefinir a senha.",
      });

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro desconhecido");
      toast.error("Erro", { description: error.message });
      return { error };
    }
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
  }), [user, session, isLoading, signUp, signIn, signInWithOAuth, signOut, resetPassword]);

  // Always render provider - children handle loading state
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
