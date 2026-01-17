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
    let retryCount = 0;
    const maxRetries = 2; // Reduzido para evitar delays longos
    // AUMENTADO para conexões maritimas lentas (satélite 30-120s latência)
    const maxInitTimeout = 15000; // 15 segundos máximo para inicializar

    // Safety timeout - SEMPRE sai do loading após timeout
    const safetyTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        Logger.warn("Auth init timeout - forcing ready state", undefined, "AuthContext");
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, maxInitTimeout);

    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (!mounted) return;
            
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setIsLoading(false);
            setIsInitialized(true);
            
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
        
        subscription = data.subscription;

        // THEN check for existing session with retry logic
        const fetchSession = async (): Promise<void> => {
          try {
            const { data: sessionData, error } = await supabase.auth.getSession();

            if (!mounted) return;

            if (error) {
              // Handle network errors with limited retry
              if ((error.message?.includes('Failed to fetch') || error.name === 'AuthRetryableFetchError') && retryCount < maxRetries) {
                retryCount++;
                Logger.warn(`Session fetch failed, retrying (${retryCount}/${maxRetries})...`, error, "AuthContext");
                await new Promise(resolve => setTimeout(resolve, 500 * retryCount)); // Backoff mais curto
                return fetchSession();
              }
              // Após retries, continua sem sessão (usuário fará login)
              Logger.warn("Error getting session, continuing without auth", error, "AuthContext");
            }
            
            setSession(sessionData?.session ?? null);
            setUser(sessionData?.session?.user ?? null);
            setIsLoading(false);
            setIsInitialized(true);
          } catch (fetchError) {
            if (!mounted) return;
            
            // Network error - retry com backoff curto
            if (retryCount < maxRetries) {
              retryCount++;
              Logger.warn(`Network error, retrying (${retryCount}/${maxRetries})...`, fetchError, "AuthContext");
              await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
              return fetchSession();
            }
            
            // Sempre finaliza o loading mesmo em erro
            Logger.warn("Failed to fetch session after retries, continuing", fetchError, "AuthContext");
            setIsLoading(false);
            setIsInitialized(true);
          }
        };

        await fetchSession();
      } catch (error) {
        if (!mounted) return;
        Logger.warn("Error initializing auth", error, "AuthContext");
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
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
