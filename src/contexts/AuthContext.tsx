import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { rateLimiter, RATE_LIMITS } from '@/lib/security/rate-limiter';
import { sessionManager } from '@/lib/security/session-manager';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
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
    // Initialize session manager
    sessionManager.initialize({
      refreshThresholdMs: 5 * 60 * 1000, // Refresh 5 minutes before expiry
      timeoutMs: 30 * 60 * 1000, // 30 minutes timeout
    });

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN' && currentSession) {
          // Persist session for recovery
          sessionManager.persistSession(currentSession);
          
          toast({
            title: "Bem-vindo!",
            description: "Login realizado com sucesso.",
          });
        } else if (event === 'SIGNED_OUT') {
          // Clear persisted session
          sessionManager.clearPersistedSession();
          
          toast({
            title: "Desconectado",
            description: "Você foi desconectado com sucesso.",
          });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Session token refreshed successfully');
        }
      }
    );

    // THEN check for existing session
    const initializeSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      } else {
        // Try to restore from localStorage
        await sessionManager.restoreSession();
      }
      
      setIsLoading(false);
    };

    initializeSession();

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
      sessionManager.cleanup();
    };
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
    // Check rate limit
    const rateLimitKey = `login:${email}`;
    if (!rateLimiter.checkLimit(rateLimitKey, RATE_LIMITS.LOGIN)) {
      const resetTime = rateLimiter.getResetTime(rateLimitKey);
      const minutes = Math.ceil(resetTime / 60000);
      
      toast({
        title: "Muitas tentativas",
        description: `Aguarde ${minutes} minuto(s) antes de tentar novamente.`,
        variant: "destructive",
      });
      
      return { error: new Error('Rate limit exceeded') as AuthError };
    }

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
    
    // Clear persisted session
    sessionManager.clearPersistedSession();
    
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