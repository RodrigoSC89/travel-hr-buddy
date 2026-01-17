// AuthContext - PATCH 855 - Fixed for slow connections (5G, 3G, LTE)
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, getNetworkStatus } from "@/integrations/supabase/client";
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
    const maxRetries = 5; // PATCH 855: Increased retries for slow connections

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

        // PATCH 855: Enhanced session fetch with better retry logic
        const fetchSession = async (): Promise<void> => {
          try {
            const networkStatus = getNetworkStatus();
            Logger.info(`Network status: ${networkStatus.quality} (${networkStatus.effectiveType})`, null, "AuthContext");
            
            const { data: sessionData, error } = await supabase.auth.getSession();

            if (!mounted) return;

            if (error) {
              const isNetworkError = 
                error.message?.includes('Failed to fetch') || 
                error.name === 'AuthRetryableFetchError' ||
                error.message?.includes('network');
              
              if (isNetworkError && retryCount < maxRetries) {
                retryCount++;
                const delay = 1000 * Math.pow(2, retryCount - 1); // Exponential backoff
                Logger.warn(`Session fetch failed, retry ${retryCount}/${maxRetries} in ${delay}ms`, error, "AuthContext");
                await new Promise(resolve => setTimeout(resolve, delay));
                return fetchSession();
              }
              
              Logger.warn("Error getting session after retries", error, "AuthContext");
            }
            
            setSession(sessionData?.session ?? null);
            setUser(sessionData?.session?.user ?? null);
            setIsLoading(false);
            setIsInitialized(true);
          } catch (fetchError: any) {
            if (!mounted) return;
            
            const isNetworkError = 
              fetchError?.name === 'AbortError' ||
              fetchError?.message?.includes('Failed to fetch') ||
              fetchError?.message?.includes('network');
            
            if (isNetworkError && retryCount < maxRetries) {
              retryCount++;
              const delay = 1000 * Math.pow(2, retryCount - 1);
              Logger.warn(`Network error, retry ${retryCount}/${maxRetries} in ${delay}ms`, fetchError, "AuthContext");
              await new Promise(resolve => setTimeout(resolve, delay));
              return fetchSession();
            }
            
            Logger.warn("Failed to fetch session after all retries", fetchError, "AuthContext");
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
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // PATCH 855: Enhanced signIn with better error handling for slow connections
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    const networkStatus = getNetworkStatus();
    if (networkStatus.quality === 'offline') {
      setIsLoading(false);
      const error = new Error("Sem conexão com internet. Verifique sua rede.");
      toast.error("Sem conexão", { description: error.message });
      return { error };
    }
    
    try {
      Logger.info(`Login attempt on ${networkStatus.quality} connection`, null, "AuthContext");
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let message = error.message;
        
        // Translate common errors
        if (error.message?.includes('Invalid login credentials')) {
          message = 'Email ou senha incorretos';
        } else if (error.message?.includes('Failed to fetch') || error.name === 'AuthRetryableFetchError') {
          message = 'Problema de conexão. O sistema vai tentar novamente automaticamente.';
        } else if (error.message?.includes('rate limit')) {
          message = 'Muitas tentativas. Aguarde alguns minutos.';
        }
        
        toast.error("Erro no login", { description: message });
        setIsLoading(false);
        return { error };
      }

      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      
      let message = "Erro ao fazer login";
      
      if (err?.name === 'AbortError') {
        message = 'Conexão expirou. Sua internet está lenta, mas o sistema vai tentar novamente.';
      } else if (err?.message?.includes('Failed to fetch')) {
        message = 'Erro de rede. Verifique sua conexão e tente novamente.';
      } else if (err?.message) {
        message = err.message;
      }
      
      const error = new Error(message);
      toast.error("Erro no login", { description: message });
      return { error };
    }
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
          data: { full_name: fullName }
        }
      });

      if (error) {
        toast.error("Erro no cadastro", { description: error.message });
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

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setIsLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUrl }
      });

      if (error) {
        toast.error("Erro no login", { description: error.message });
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
        toast.error("Erro", { description: error.message });
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
