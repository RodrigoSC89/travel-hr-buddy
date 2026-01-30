/**
 * AuthContext - PATCH v27 - Production Login Fix
 * Sistema robusto de autenticação com tratamento de erros para iOS PWA
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/utils/production-logger";

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
  clearSession: () => Promise<void>;
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
  clearSession: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthValue);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    logger.warn("useAuth called outside of AuthProvider, returning default value");
    return defaultAuthValue;
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Allowed redirect domains for security
const ALLOWED_REDIRECT_DOMAINS = [
  'nautione.com.br',
  'www.nautione.com.br',
  'id-preview--ead06aad-a7d4-45d3-bdf7-e23796c6ac50.lovable.app',
  'travel-hr-buddy.lovable.app',
  'localhost'
];

function isAllowedRedirect(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_REDIRECT_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

function getRedirectUrl(): string {
  const origin = window.location.origin;
  if (isAllowedRedirect(origin)) {
    return `${origin}/`;
  }
  // Fallback to production
  return 'https://nautione.com.br/';
}

// Clear corrupted auth tokens from storage
function clearCorruptedTokens(): void {
  try {
    const storageKeys = Object.keys(localStorage).filter(
      k => k.includes('supabase') || k.includes('sb-')
    );
    
    for (const key of storageKeys) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const parsed = JSON.parse(value);
          // Check if token is corrupted (too short or missing fields)
          if (parsed?.access_token && parsed.access_token.length < 50) {
            localStorage.removeItem(key);
          }
          if (parsed?.refresh_token && parsed.refresh_token.length < 20) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // If parsing fails, remove the corrupted key
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore errors in token cleanup
  }
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // CRITICAL v29: Start with isLoading FALSE to NEVER block render
  // Auth check happens in background - UI is always immediately available
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    // Clear any corrupted tokens on mount
    clearCorruptedTokens();

    // Initialize auth - FAST, non-blocking
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (e) {
        // On ANY error, just continue - app should still work
        logger.warn("[AuthContext] Session fetch failed", e instanceof Error ? { msg: e.message } : {});
      }
    };

    // Set up listener for auth changes
    const { data } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
        
        // Update state immediately
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Notifications (deferred)
        if (event === "SIGNED_IN") {
          setTimeout(() => toast.success("Bem-vindo!", { description: "Login realizado com sucesso." }), 0);
        } else if (event === "SIGNED_OUT") {
          setTimeout(() => toast.info("Desconectado", { description: "Você foi desconectado com sucesso." }), 0);
        }
      }
    );
    
    subscription = data.subscription;

    // Start auth check
    initializeAuth();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear all supabase-related storage
      Object.keys(localStorage)
        .filter(k => k.includes('supabase') || k.includes('sb-'))
        .forEach(k => localStorage.removeItem(k));
      
      setUser(null);
      setSession(null);
      
      toast.success("Sessão limpa", { description: "Tente fazer login novamente." });
    } catch {
      toast.error("Erro ao limpar sessão");
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    
    const redirectUrl = getRedirectUrl();
    
    try {
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        const errorMsg = error.message.toLowerCase();
        let userMessage = error.message;
        
        if (errorMsg.includes('already registered') || errorMsg.includes('already exists')) {
          userMessage = "Este email já está cadastrado. Tente fazer login.";
        } else if (errorMsg.includes('weak password') || errorMsg.includes('password')) {
          userMessage = "Senha muito fraca. Use pelo menos 6 caracteres.";
        } else if (errorMsg.includes('invalid email')) {
          userMessage = "Email inválido. Verifique o formato.";
        }
        
        toast.error("Erro no cadastro", { description: userMessage });
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
      toast.error("Erro no cadastro", { description: "Tente novamente em alguns segundos." });
      return { error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    // Clear any corrupted tokens before login attempt
    clearCorruptedTokens();
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        // User-friendly error messages - NEVER show technical errors
        const errorMsg = error.message.toLowerCase();
        let userMessage = "Verifique suas credenciais e tente novamente.";
        
        if (errorMsg.includes('captcha')) {
          // CAPTCHA enabled in Supabase but not implemented in frontend
          userMessage = "CAPTCHA habilitado no Supabase. Desabilite em Authentication → Settings → CAPTCHA protection → Disabled";
        } else if (errorMsg.includes('invalid login credentials') || errorMsg.includes('invalid') || errorMsg.includes('credentials')) {
          userMessage = "Email ou senha incorretos.";
        } else if (errorMsg.includes('email not confirmed')) {
          userMessage = "Confirme seu email antes de entrar. Verifique sua caixa de entrada.";
        } else if (errorMsg.includes('too many requests') || errorMsg.includes('rate limit')) {
          userMessage = "Muitas tentativas. Aguarde alguns minutos.";
        } else if (errorMsg.includes('user not found')) {
          userMessage = "Usuário não encontrado. Verifique o email ou cadastre-se.";
        }
        // For network errors: show generic message (iOS PWA compatibility)
        
        toast.error("Erro no login", { description: userMessage });
        setIsLoading(false);
        return { error };
      }

      setIsLoading(false);
      return { error: null };
    } catch (err) {
      setIsLoading(false);
      // NEVER show technical network errors - iOS PWA compatibility
      toast.error("Erro no login", { description: "Tente novamente em alguns segundos." });
      return { error: err instanceof Error ? err : new Error("Erro desconhecido") };
    }
  }, []);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setIsLoading(true);
    
    const redirectUrl = getRedirectUrl();
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) {
        toast.error("Erro no login", { description: error.message });
        setIsLoading(false);
        return { error };
      }

      // OAuth redirects, so we don't set loading to false here
      return { error: null };
    } catch (err) {
      setIsLoading(false);
      const error = err instanceof Error ? err : new Error("Erro desconhecido");
      toast.error("Erro no login", { description: "Tente novamente." });
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      
      // Clear auth storage
      Object.keys(localStorage)
        .filter(k => k.includes('supabase') || k.includes('sb-'))
        .forEach(k => localStorage.removeItem(k));
        
      setUser(null);
      setSession(null);
    } catch (error) {
      logger.warn("[AuthContext] Error signing out", { error });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const redirectUrl = `${getRedirectUrl()}auth?type=recovery`;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
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
      toast.error("Erro", { description: "Tente novamente." });
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
    clearSession,
  }), [user, session, isLoading, signUp, signIn, signInWithOAuth, signOut, resetPassword, clearSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
