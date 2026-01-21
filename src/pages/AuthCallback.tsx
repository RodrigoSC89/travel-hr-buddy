/**
 * OAuth Callback Page
 * PATCH v27: Handle OAuth provider callbacks
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleOAuthCallback } from '@/lib/auth/oauth-providers';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      try {
        logger.info('Processing OAuth callback');

        const result = await handleOAuthCallback();

        if (result.success) {
          toast.success('Login realizado com sucesso!');
          navigate('/dashboard', { replace: true });
        } else {
          setError(result.error || 'Falha na autenticação');
          logger.error('OAuth callback failed', undefined, { error: result.error });
          
          // Redirect to auth after delay
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        logger.error('OAuth callback exception', err);
        
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    }

    processCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Falha na Autenticação
          </h1>
          <p className="text-muted-foreground max-w-md">
            {error}
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecionando para login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <h1 className="text-xl font-semibold text-foreground">
          Finalizando login...
        </h1>
        <p className="text-muted-foreground">
          Por favor, aguarde enquanto processamos sua autenticação.
        </p>
      </div>
    </div>
  );
}
