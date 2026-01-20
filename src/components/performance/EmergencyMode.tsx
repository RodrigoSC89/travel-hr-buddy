/**
 * Emergency Mode - PATCH 960
 * PATCH v12: Removed navigator.onLine - always assumes online for iOS PWA compatibility
 * Modo emergencial para operação offline crítica
 */

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  AlertTriangle, Shield, Clock, RefreshCw, 
  CheckCircle, XCircle, Database, Zap, PhoneCall
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  pendingSyncCount: number;
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
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

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
      pendingSyncCount,
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
  const { pendingSyncCount, deactivateEmergencyMode, syncStatus } = useEmergencyMode();
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);

  const criticalFunctions = [
    { name: 'Visualizar Frota', available: true, icon: CheckCircle },
    { name: 'Registrar Ocorrência', available: true, icon: CheckCircle },
    { name: 'Checklist de Segurança', available: true, icon: CheckCircle },
    { name: 'Consultar Tripulação', available: true, icon: CheckCircle },
    { name: 'Alertas Críticos', available: true, icon: CheckCircle },
    { name: 'Sincronização API', available: true, icon: CheckCircle },
    { name: 'IA Avançada', available: true, icon: CheckCircle },
    { name: 'Relatórios Online', available: true, icon: CheckCircle },
  ];

  const forceSync = async () => {
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <span className="font-semibold">MODO EMERGENCIAL ATIVO</span>
          </div>
          <div className="flex items-center gap-2">
            {pendingSyncCount > 0 && (
              <Badge variant="secondary">
                {pendingSyncCount} pendentes
              </Badge>
            )}
            <Button size="sm" variant="secondary" onClick={() => setShowDetails(true)}>
              Detalhes
            </Button>
            <Button size="sm" variant="secondary" onClick={deactivateEmergencyMode}>
              Desativar
            </Button>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Modo Emergencial
            </DialogTitle>
            <DialogDescription>
              O sistema está operando com funcionalidades limitadas para garantir operação contínua
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Critical Functions */}
            <div>
              <h4 className="font-semibold mb-3">Funções Disponíveis</h4>
              <div className="grid grid-cols-2 gap-2">
                {criticalFunctions.map((fn) => (
                  <div 
                    key={fn.name}
                    className="flex items-center gap-2 p-2 rounded-lg border bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                  >
                    <fn.icon className="h-4 w-4 text-green-500" />
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
                        Serão sincronizadas automaticamente
                      </div>
                    </div>
                    <Button onClick={forceSync} disabled={syncStatus === 'syncing'}>
                      <RefreshCw className={cn("h-4 w-4 mr-2", syncStatus === 'syncing' && "animate-spin")} />
                      Sincronizar
                    </Button>
                  </div>
                  
                  {syncStatus === 'syncing' && <Progress value={undefined} className="h-2" />}
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

  if (!emergency.isEmergencyMode && emergency.pendingSyncCount === 0) {
    return null;
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer",
      "bg-primary/10 text-primary"
    )}
    onClick={emergency.activateEmergencyMode}
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      <span>Emergencial</span>
      {emergency.pendingSyncCount > 0 && (
        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
          {emergency.pendingSyncCount}
        </Badge>
      )}
    </div>
  );
}

export default EmergencyModeProvider;
