/**
 * Emergency Mode - PATCH 960
 * Modo emergencial para operação offline crítica
 */

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  AlertTriangle, WifiOff, Shield, Clock, RefreshCw, 
  CheckCircle, XCircle, Database, Zap, PhoneCall
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { indexedDBSync } from '@/lib/offline/indexeddb-sync';
import { offlineSyncManager } from '@/lib/offline/sync-manager';

// Emergency Mode Context
interface EmergencyModeContextType {
  isEmergencyMode: boolean;
  isOffline: boolean;
  pendingSyncCount: number;
  lastOnline: Date | null;
  activateEmergencyMode: () => void;
  deactivateEmergencyMode: () => void;
  syncStatus: 'idle' | 'syncing' | 'error';
}

const EmergencyModeContext = createContext<EmergencyModeContextType | null>(null);

export function useEmergencyMode() {
  const context = useContext(EmergencyModeContext);
  if (!context) {
    throw new Error('useEmergencyMode must be used within EmergencyModeProvider');
  }
  return context;
}

interface EmergencyModeProviderProps {
  children: ReactNode;
}

export function EmergencyModeProvider({ children }: EmergencyModeProviderProps) {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastOnline, setLastOnline] = useState<Date | null>(navigator.onLine ? new Date() : null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setLastOnline(new Date());
      
      // Auto-sync when back online
      offlineSyncManager.syncAll().then(() => {
        setSyncStatus('idle');
      }).catch(() => {
        setSyncStatus('error');
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      
      // Auto-activate emergency mode after 30 seconds offline
      setTimeout(() => {
        if (!navigator.onLine) {
          setIsEmergencyMode(true);
        }
      }, 30000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor pending sync count
  useEffect(() => {
    const checkPending = async () => {
      const stats = await indexedDBSync.getQueueStats();
      setPendingSyncCount(stats.pending + stats.failed);
    };

    checkPending();
    const interval = setInterval(checkPending, 10000);
    return () => clearInterval(interval);
  }, []);

  const activateEmergencyMode = () => setIsEmergencyMode(true);
  const deactivateEmergencyMode = () => setIsEmergencyMode(false);

  return (
    <EmergencyModeContext.Provider value={{
      isEmergencyMode,
      isOffline,
      pendingSyncCount,
      lastOnline,
      activateEmergencyMode,
      deactivateEmergencyMode,
      syncStatus,
    }}>
      {children}
      {isEmergencyMode && <EmergencyModeOverlay />}
    </EmergencyModeContext.Provider>
  );
}

// Emergency Mode Overlay
function EmergencyModeOverlay() {
  const { 
    isOffline, 
    pendingSyncCount, 
    lastOnline, 
    deactivateEmergencyMode,
    syncStatus 
  } = useEmergencyMode();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);

  const criticalFunctions = [
    { name: 'Visualizar Frota', available: true, icon: CheckCircle },
    { name: 'Registrar Ocorrência', available: true, icon: CheckCircle },
    { name: 'Checklist de Segurança', available: true, icon: CheckCircle },
    { name: 'Consultar Tripulação', available: true, icon: CheckCircle },
    { name: 'Alertas Críticos', available: true, icon: CheckCircle },
    { name: 'Sincronização API', available: !isOffline, icon: isOffline ? XCircle : CheckCircle },
    { name: 'IA Avançada', available: !isOffline, icon: isOffline ? XCircle : CheckCircle },
    { name: 'Relatórios Online', available: !isOffline, icon: isOffline ? XCircle : CheckCircle },
  ];

  const forceSync = async () => {
    if (isOffline) {
      toast({
        title: 'Sem conexão',
        description: 'Aguarde a conexão ser restabelecida para sincronizar',
        variant: 'destructive',
      });
      return;
    }

    try {
      await offlineSyncManager.syncAll();
      toast({
        title: 'Sincronização concluída',
        description: 'Dados sincronizados com sucesso',
      });
    } catch {
      toast({
        title: 'Erro na sincronização',
        description: 'Tente novamente em alguns instantes',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Fixed Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <span className="font-semibold">MODO EMERGENCIAL ATIVO</span>
            {isOffline && (
              <Badge variant="secondary" className="bg-orange-600">
                <WifiOff className="h-3 w-3 mr-1" />
                OFFLINE
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {pendingSyncCount > 0 && (
              <Badge variant="secondary" className="bg-orange-600">
                {pendingSyncCount} pendentes
              </Badge>
            )}
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => setShowDetails(true)}
            >
              Detalhes
            </Button>
            {!isOffline && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={deactivateEmergencyMode}
              >
                Desativar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Modo Emergencial
            </DialogTitle>
            <DialogDescription>
              O sistema está operando com funcionalidades limitadas para garantir operação contínua
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status */}
            <Alert variant={isOffline ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Status da Conexão</AlertTitle>
              <AlertDescription>
                {isOffline ? (
                  <>Sem conexão com a internet. Última conexão: {lastOnline?.toLocaleString('pt-BR') || 'Desconhecido'}</>
                ) : (
                  <>Conexão restabelecida. Sincronização em andamento...</>
                )}
              </AlertDescription>
            </Alert>

            {/* Critical Functions */}
            <div>
              <h4 className="font-semibold mb-3">Funções Disponíveis</h4>
              <div className="grid grid-cols-2 gap-2">
                {criticalFunctions.map((fn) => (
                  <div 
                    key={fn.name}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border",
                      fn.available 
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" 
                        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                    )}
                  >
                    <fn.icon className={cn(
                      "h-4 w-4",
                      fn.available ? "text-green-500" : "text-red-500"
                    )} />
                    <span className="text-sm">{fn.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sync Status */}
            <div>
              <h4 className="font-semibold mb-3">Sincronização</h4>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium">{pendingSyncCount} operações pendentes</div>
                      <div className="text-sm text-muted-foreground">
                        Serão sincronizadas quando a conexão for restabelecida
                      </div>
                    </div>
                    <Button 
                      onClick={forceSync} 
                      disabled={isOffline || syncStatus === 'syncing'}
                    >
                      <RefreshCw className={cn(
                        "h-4 w-4 mr-2",
                        syncStatus === 'syncing' && "animate-spin"
                      )} />
                      Sincronizar
                    </Button>
                  </div>
                  
                  {syncStatus === 'syncing' && (
                    <Progress value={undefined} className="h-2" />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Emergency Actions */}
            <div>
              <h4 className="font-semibold mb-3">Ações de Emergência</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col">
                  <Database className="h-5 w-5 mb-2" />
                  <span>Exportar Dados Locais</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col">
                  <PhoneCall className="h-5 w-5 mb-2" />
                  <span>Contato Suporte</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spacer for fixed banner */}
      <div className="h-10" />
    </>
  );
}

// Emergency Indicator Component (for header/sidebar)
export function EmergencyIndicator() {
  const emergency = useEmergencyMode();

  if (!emergency.isEmergencyMode && !emergency.isOffline) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer",
      emergency.isOffline 
        ? "bg-destructive/10 text-destructive" 
        : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
    )}
    onClick={emergency.activateEmergencyMode}
    >
      {emergency.isOffline ? (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span>Offline</span>
        </>
      ) : (
        <>
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Emergencial</span>
        </>
      )}
      {emergency.pendingSyncCount > 0 && (
        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
          {emergency.pendingSyncCount}
        </Badge>
      )}
    </div>
  );
}

export default EmergencyModeProvider;
