/**
 * LazyLoadErrorBoundary - Handles dynamic import failures
 * Automatically retries failed chunk loads by refreshing the page
 * This fixes "Failed to fetch dynamically imported module" errors
 * caused by stale Service Worker cache after deploys
 */
import React, { Component, ReactNode } from 'react';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  isChunkError: boolean;
  retryCount: number;
}

const MAX_AUTO_RETRIES = 2;
const RETRY_KEY = 'chunk_error_retry_count';

export class LazyLoadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    
    // Check if we've been retrying
    const storedRetries = sessionStorage.getItem(RETRY_KEY);
    const retryCount = storedRetries ? parseInt(storedRetries, 10) : 0;
    
    this.state = {
      hasError: false,
      isChunkError: false,
      retryCount,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Detect chunk loading errors
    const isChunkError = 
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('ChunkLoadError') ||
      error.message.includes('Loading CSS chunk');
    
    return { hasError: true, isChunkError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[LazyLoadErrorBoundary] Error caught:', error.message);
    
    if (this.state.isChunkError && this.state.retryCount < MAX_AUTO_RETRIES) {
      // Store retry count and reload
      const newCount = this.state.retryCount + 1;
      sessionStorage.setItem(RETRY_KEY, newCount.toString());
      
      console.log(`[LazyLoadErrorBoundary] Auto-retry ${newCount}/${MAX_AUTO_RETRIES}`);
      
      // Clear caches and reload
      this.clearCachesAndReload();
    }
  }

  componentDidMount() {
    // Clear retry count on successful mount
    if (!this.state.hasError) {
      sessionStorage.removeItem(RETRY_KEY);
    }
  }

  clearCachesAndReload = async () => {
    try {
      // Unregister ALL service workers first
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          // Skip waiting on any waiting service worker
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await registration.unregister();
        }
        console.log('[LazyLoadErrorBoundary] Service workers unregistered');
      }
      
      // Clear ALL caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('[LazyLoadErrorBoundary] All caches cleared');
      }
      
      // Clear session storage
      sessionStorage.clear();
      
    } catch (e) {
      console.error('[LazyLoadErrorBoundary] Cache clear error:', e);
    }
    
    // Force hard reload - bypass cache completely
    window.location.href = window.location.origin + window.location.pathname + '?_sw=' + Date.now();
  };

  handleManualRetry = () => {
    sessionStorage.removeItem(RETRY_KEY);
    this.clearCachesAndReload();
  };

  render() {
    if (this.state.hasError) {
      // If it's a chunk error and we're within auto-retry limit, show loading
      if (this.state.isChunkError && this.state.retryCount < MAX_AUTO_RETRIES) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-center">
              Atualizando aplicação...
            </p>
          </div>
        );
      }
      
      // Max retries exceeded - show manual retry option
      if (this.state.isChunkError) {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Atualização Necessária</h2>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Uma nova versão do Nautilus One está disponível. 
              Clique abaixo para atualizar.
            </p>
            <Button onClick={this.handleManualRetry} size="lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Aplicação
            </Button>
          </div>
        );
      }
      
      // Non-chunk error - use custom fallback or default
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erro Inesperado</h2>
          <p className="text-muted-foreground text-center mb-6">
            Algo deu errado. Tente recarregar a página.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyLoadErrorBoundary;
