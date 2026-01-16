/**
 * Mobile Connection Indicator Component
 * Shows connection status prominently for mobile users
 * Optimized for maritime/unstable network conditions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalLow, 
  SignalMedium, 
  SignalHigh,
  RefreshCw,
  X,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

type ConnectionQuality = 'excellent' | 'good' | 'moderate' | 'poor' | 'offline';

interface ConnectionState {
  isOnline: boolean;
  quality: ConnectionQuality;
  effectiveType: string;
  downlink: number;
  rtt: number;
  lastChecked: Date;
}

export const MobileConnectionIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const [state, setState] = useState<ConnectionState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    quality: 'good',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    lastChecked: new Date(),
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  
  // Detect connection quality
  const detectConnection = useCallback((): ConnectionState => {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const isOnline = navigator.onLine;
    
    let quality: ConnectionQuality = 'good';
    let effectiveType = '4g';
    let downlink = 10;
    let rtt = 50;
    
    if (!isOnline) {
      quality = 'offline';
    } else if (connection) {
      effectiveType = connection.effectiveType || '4g';
      downlink = connection.downlink || 10;
      rtt = connection.rtt || 50;
      
      // Determine quality based on connection metrics
      if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5) {
        quality = 'poor';
      } else if (effectiveType === '3g' || downlink < 1.5 || rtt > 400) {
        quality = 'moderate';
      } else if (downlink < 5 || rtt > 150) {
        quality = 'good';
      } else {
        quality = 'excellent';
      }
    }
    
    return {
      isOnline,
      quality,
      effectiveType,
      downlink,
      rtt,
      lastChecked: new Date(),
    };
  }, []);
  
  // Update connection state
  useEffect(() => {
    const updateConnection = () => {
      const newState = detectConnection();
      setState(newState);
      
      // Show banner if connection is poor or offline
      setShowBanner(newState.quality === 'poor' || newState.quality === 'offline');
    };
    
    updateConnection();
    
    // Listen for connection changes
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateConnection);
    }
    
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    
    // Periodic check every 30 seconds
    const interval = setInterval(updateConnection, 30000);
    
    return () => {
      if (connection) {
        connection.removeEventListener('change', updateConnection);
      }
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
      clearInterval(interval);
    };
  }, [detectConnection]);
  
  // Handle retry
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Try to fetch a small resource to test connection
      const response = await fetch('/manifest.json', { 
        cache: 'no-store',
        signal: AbortSignal.timeout(10000)
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch {
      // Still offline, update state
      setState(prev => ({ ...prev, quality: 'offline', isOnline: false }));
    } finally {
      setIsRetrying(false);
    }
  };
  
  // Get icon based on quality
  const getIcon = () => {
    if (!state.isOnline) return <WifiOff className="h-4 w-4" />;
    
    switch (state.quality) {
      case 'excellent':
        return <SignalHigh className="h-4 w-4" />;
      case 'good':
        return <SignalMedium className="h-4 w-4" />;
      case 'moderate':
        return <SignalLow className="h-4 w-4" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Signal className="h-4 w-4" />;
    }
  };
  
  // Get color classes based on quality
  const getColorClasses = () => {
    if (!state.isOnline) return 'text-destructive bg-destructive/10 border-destructive/30';
    
    switch (state.quality) {
      case 'excellent':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'good':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'moderate':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'poor':
        return 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/30';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };
  
  // Get quality label
  const getQualityLabel = () => {
    if (!state.isOnline) return 'Offline';
    
    switch (state.quality) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Boa';
      case 'moderate': return 'Moderada';
      case 'poor': return 'Fraca';
      default: return 'Desconhecido';
    }
  };
  
  // Compact indicator for header
  const CompactIndicator = () => (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all",
        "hover:bg-accent/50 active:scale-95",
        getColorClasses(),
        className
      )}
      aria-label={`Conexão: ${getQualityLabel()}`}
    >
      {getIcon()}
      <span className="text-xs font-medium hidden sm:inline">{getQualityLabel()}</span>
    </button>
  );
  
  // Expanded details panel
  const ExpandedPanel = () => (
    <div 
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 p-4",
        "bg-background/98 backdrop-blur-sm border-t shadow-lg",
        "animate-in slide-in-from-bottom duration-300",
        "safe-area-inset-bottom"
      )}
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Status da Conexão</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg border",
          getColorClasses()
        )}>
          {getIcon()}
          <div className="flex-1">
            <p className="font-medium">{getQualityLabel()}</p>
            <p className="text-xs opacity-75">
              {state.effectiveType.toUpperCase()} • {state.downlink.toFixed(1)} Mbps • {state.rtt}ms
            </p>
          </div>
        </div>
        
        {(state.quality === 'poor' || state.quality === 'offline') && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {state.quality === 'offline' 
                ? 'Sem conexão com a internet. Algumas funções podem não funcionar.'
                : 'Conexão instável detectada. O sistema está otimizando para melhor desempenho.'
              }
            </p>
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="w-full"
              variant={state.quality === 'offline' ? 'default' : 'outline'}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Reconectar
                </>
              )}
            </Button>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground text-center">
          Última verificação: {state.lastChecked.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
  
  // Top banner for poor/offline connection
  const ConnectionBanner = () => {
    if (!showBanner) return null;
    
    return (
      <div 
        className={cn(
          "fixed top-0 inset-x-0 z-[100] px-4 py-2",
          "flex items-center justify-between gap-3",
          "animate-in slide-in-from-top duration-300",
          state.quality === 'offline' 
            ? 'bg-destructive text-destructive-foreground'
            : 'bg-amber-500 text-amber-950'
        )}
        style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-2 flex-1">
          {getIcon()}
          <span className="text-sm font-medium">
            {state.quality === 'offline' 
              ? 'Você está offline'
              : 'Conexão instável'
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRetry}
            disabled={isRetrying}
            className="h-7 px-2 text-current hover:bg-white/20"
          >
            {isRetrying ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowBanner(false)}
            className="h-7 px-2 text-current hover:bg-white/20"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <ConnectionBanner />
      <CompactIndicator />
      {isExpanded && <ExpandedPanel />}
    </>
  );
};

export default MobileConnectionIndicator;
