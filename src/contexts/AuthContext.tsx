/**
 * AuthContext - PATCH 851.0 - Definitive React Hook Fix
 * 
 * Uses consistent React import pattern to prevent hook errors.
 */

// CRITICAL: Use namespace import for consistency
import * as React from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

// Default context value
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

// Create context with default value
const AuthContext = React.createContext<AuthContextType>(defaultAuthValue);

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    console.warn("useAuth called outside of AuthProvider");
    return defaultAuthValue;
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth Provider component
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initAuth = async (): Promise<void> => {
      try {
        // Set up auth state listener
        const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
          if (!mounted) return;
          
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
          
          // Defer toast to avoid React render cycle issues
          if (event === "SIGNED_IN") {
            setTimeout(() => toast.success("Bem-vindo!", { description: "Login realizado com sucesso." }), 0);
          } else if (event === "SIGNED_OUT") {
            setTimeout(() => toast.info("Desconectado", { description: "Você foi desconectado com sucesso." }), 0);
          }
        });
        
        authSubscription = data.subscription;

        // Get existing session
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.warn("Session error:", error);
        }
        
        setSession(sessionData.session);
        setUser(sessionData.session?.user ?? null);
        setIsLoading(false);
      } catch (error) {
        if (!mounted) return;
        console.warn("Auth init error:", error);
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, []);

  const signUp = React.useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName }
        }
      });

      if (error) {
        toast.error("Erro no cadastro", { description: error.message });
        setIsLoading(false);
        return { error };
      }
      
      toast.success("Cadastro realizado!", { description: "Verifique seu email para confirmar a conta." });
      setIsLoading(false);
      return { error: null };
    } catch (err) {
      setIsLoading(false);
      const error = err instanceof Error ? err : new Error("Erro desconhecido");
      toast.error("Erro no cadastro", { description: error.message });
      return { error };
    }
  }, []);

  const signIn = React.useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

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

  const signInWithOAuth = React.useCallback(async (provider: OAuthProvider) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/` }
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

  const signOut = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = React.useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`
      });

      if (error) {
        toast.error("Erro", { description: error.message });
        return { error };
      }
      
      toast.success("Email enviado!", { description: "Verifique seu email para redefinir a senha." });
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro desconhecido");
      toast.error("Erro", { description: error.message });
      return { error };
    }
  }, []);

  // Memoize context value
  const contextValue = React.useMemo<AuthContextType>(() => ({
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
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
