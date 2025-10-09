import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RefreshCw,
  Database,
  Wifi,
  WifiOff,
  Upload,
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useOfflineStorage } from "@/hooks/use-offline-storage";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SyncItem {
  id: string;
  action: string;
  data: any;
  timestamp: number;
  synced: boolean;
  error?: string;
}

export const OfflineSyncManager: React.FC = () => {
  const [syncItems, setSyncItems] = useState<SyncItem[]>([]);
  const [isSync, setIsSync] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const {
    isOnline,
    cacheSize,
    syncPendingChanges,
    clearCache,
    getPendingChanges,
    saveToCache,
    addPendingChange,
  } = useOfflineStorage();

  const onlineStatus = useOnlineStatus();
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar itens pendentes
  const loadPendingItems = async () => {
    try {
      const pending = await getPendingChanges();
      setSyncItems(pending);
    } catch (error) {
      console.error("Error loading pending items:", error);
    }
  };

  // Sincronização manual
  const performManualSync = async () => {
    if (!isOnline || !user) {
      toast({
        title: "Sync Impossível",
        description: "Você precisa estar online para sincronizar",
        variant: "destructive",
      });
      return;
    }

    setIsSync(true);
    setSyncProgress(0);

    try {
      const pendingItems = await getPendingChanges();

      if (pendingItems.length === 0) {
        toast({
          title: "Nada para Sincronizar",
          description: "Todos os dados estão atualizados",
        });
        setIsSync(false);
        return;
      }

      // Simular progresso de sincronização
      for (let i = 0; i < pendingItems.length; i++) {
        const item = pendingItems[i];
        setSyncProgress(((i + 1) / pendingItems.length) * 100);

        try {
          // Simular sincronização com delay
          await new Promise(resolve => setTimeout(resolve, 500));

          // Aqui você faria a sincronização real com APIs
          await simulateSyncAction(item);
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
        }
      }

      // Executar sync real
      await syncPendingChanges();
      setLastSyncTime(new Date());

      toast({
        title: "Sincronização Completa",
        description: `${pendingItems.length} item(s) sincronizado(s) com sucesso`,
      });

      // Recarregar itens
      await loadPendingItems();
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Erro na Sincronização",
        description: "Alguns itens podem não ter sido sincronizados",
        variant: "destructive",
      });
    } finally {
      setIsSync(false);
      setSyncProgress(0);
    }
  };

  // Simular ação de sincronização
  const simulateSyncAction = async (item: SyncItem) => {
    switch (item.action) {
    case "create_note":
    case "update_profile":
    case "save_preference":
      // Simular salvamento no banco
      console.log("Syncing action:", item.action, item.data);
      break;
    default:
      console.log("Unknown sync action:", item.action);
    }
  };

  // Adicionar ação offline para demonstração
  const addSampleOfflineAction = async () => {
    const sampleActions = [
      {
        action: "create_note",
        data: {
          title: "Nota Offline",
          content: "Esta nota foi criada offline",
          created_at: new Date().toISOString(),
        },
      },
      {
        action: "update_profile",
        data: {
          field: "last_activity",
          value: new Date().toISOString(),
        },
      },
      {
        action: "save_preference",
        data: {
          theme: "dark",
          notifications: true,
        },
      },
    ];

    const randomAction = sampleActions[Math.floor(Math.random() * sampleActions.length)];
    await addPendingChange(randomAction.action, randomAction.data);

    toast({
      title: "Ação Offline Criada",
      description: `Ação "${randomAction.action}" será sincronizada quando online`,
    });

    await loadPendingItems();
  };

  // Limpar dados em cache
  const handleClearCache = async () => {
    try {
      await clearCache();
      await loadPendingItems();

      toast({
        title: "Cache Limpo",
        description: "Todos os dados em cache foram removidos",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível limpar o cache",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadPendingItems();

    // Recarregar quando voltar online
    if (isOnline) {
      const timer = setTimeout(() => {
        loadPendingItems();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const getActionIcon = (action: string) => {
    switch (action) {
    case "create_note":
      return <Upload className="h-4 w-4 text-blue-500" />;
    case "update_profile":
      return <RefreshCw className="h-4 w-4 text-green-500" />;
    case "save_preference":
      return <Database className="h-4 w-4 text-purple-500" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
    case "create_note":
      return "Criar nova nota";
    case "update_profile":
      return "Atualizar perfil";
    case "save_preference":
      return "Salvar preferência";
    default:
      return action;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciador de Sincronização Offline</h1>
        <p className="text-muted-foreground">
          Gerencie e monitore a sincronização de dados offline
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <div>
              <p className="text-2xl font-bold">{isOnline ? "Online" : "Offline"}</p>
              <p className="text-sm text-muted-foreground">Status da Conexão</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{cacheSize}</p>
              <p className="text-sm text-muted-foreground">Itens em Cache</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{syncItems.length}</p>
              <p className="text-sm text-muted-foreground">Pendentes Sync</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">
                {lastSyncTime ? lastSyncTime.toLocaleTimeString("pt-BR") : "--:--"}
              </p>
              <p className="text-sm text-muted-foreground">Último Sync</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sync Progress */}
      {isSync && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Sincronizando dados...</span>
              <span className="text-sm text-muted-foreground">{Math.round(syncProgress)}%</span>
            </div>
            <Progress value={syncProgress} className="w-full" />
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={performManualSync}
          disabled={!isOnline || isSync || syncItems.length === 0}
          className="flex items-center gap-2"
        >
          {isSync ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-azure-100"></div>
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Sincronizar Agora ({syncItems.length})
        </Button>

        <Button
          onClick={addSampleOfflineAction}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Simular Ação Offline
        </Button>

        <Button onClick={handleClearCache} variant="outline" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Limpar Cache
        </Button>
      </div>

      {/* Pending Sync Items */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Itens Pendentes de Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {syncItems.length > 0 ? (
            <div className="space-y-4">
              {syncItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getActionIcon(item.action)}
                    <div>
                      <p className="font-medium">{getActionDescription(item.action)}</p>
                      <p className="text-sm text-muted-foreground">
                        Criado: {new Date(item.timestamp).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.synced ? (
                      <Badge variant="default" className="bg-green-500 text-azure-50">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sincronizado
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tudo Sincronizado!</h3>
              <p className="text-muted-foreground">
                Não há itens pendentes de sincronização no momento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
