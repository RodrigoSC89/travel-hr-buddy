import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { logError, logWarning } from '@/utils/errorLogger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
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
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionWarningShownRef = useRef(false);

  // Auto refresh session token
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        logError('Erro ao renovar sessão', error, 'AuthContext');
        throw error;
      }
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
    } catch (error) {
      logError('Falha crítica ao renovar sessão', error, 'AuthContext');
    }
  }, []);

  // Check session expiration and show warning
  const checkSessionExpiration = useCallback((currentSession: Session | null) => {
    if (!currentSession) return;

    const expiresAt = currentSession.expires_at;
    if (!expiresAt) return;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;

    // Show warning 5 minutes before expiration
    const WARNING_THRESHOLD = 5 * 60; // 5 minutes
    if (timeUntilExpiry <= WARNING_THRESHOLD && !sessionWarningShownRef.current) {
      sessionWarningShownRef.current = true;
      toast({
        title: "Sessão expirando em breve",
        description: "Sua sessão irá expirar em alguns minutos. Salve seu trabalho.",
        variant: "destructive",
      });
      logWarning('Sessão próxima de expirar', 'AuthContext', { timeUntilExpiry });
    }

    // Auto-refresh 2 minutes before expiration
    const REFRESH_THRESHOLD = 2 * 60; // 2 minutes
    if (timeUntilExpiry <= REFRESH_THRESHOLD) {
      refreshSession();
    }
  }, [toast, refreshSession]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN') {
          sessionWarningShownRef.current = false;
          toast({
            title: "Bem-vindo!",
            description: "Login realizado com sucesso.",
          });
        } else if (event === 'SIGNED_OUT') {
          sessionWarningShownRef.current = false;
          toast({
            title: "Desconectado",
            description: "Você foi desconectado com sucesso.",
          });
        } else if (event === 'TOKEN_REFRESHED') {
          logWarning('Token renovado automaticamente', 'AuthContext');
        } else if (event === 'USER_UPDATED') {
          logWarning('Informações do usuário atualizadas', 'AuthContext');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logError('Erro ao obter sessão inicial', error, 'AuthContext');
      }
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Set up periodic session check (every minute)
    refreshTimerRef.current = setInterval(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        checkSessionExpiration(session);
      });
    }, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [toast, checkSessionExpiration]);

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    
    try {
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
        logError('Erro ao realizar cadastro', error, 'AuthContext');
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
    } catch (error) {
      logError('Erro inesperado no cadastro', error, 'AuthContext');
      setIsLoading(false);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logError('Erro ao realizar login', error, 'AuthContext');
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      }

      setIsLoading(false);
      return { error };
    } catch (error) {
      logError('Erro inesperado no login', error, 'AuthContext');
      setIsLoading(false);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logError('Erro ao fazer logout', error, 'AuthContext');
        toast({
          title: "Erro ao desconectar",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      logError('Erro inesperado no logout', error, 'AuthContext');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth?type=recovery`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        logError('Erro ao redefinir senha', error, 'AuthContext');
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
    } catch (error) {
      logError('Erro inesperado ao redefinir senha', error, 'AuthContext');
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};