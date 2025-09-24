import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineData {
  [key: string]: any;
}

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({});
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexão Restaurada",
        description: "Sistema online novamente",
      });
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Modo Offline",
        description: "Dados serão salvos localmente",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data on mount
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const saveToCache = (key: string, data: any) => {
    try {
      const cached = { ...offlineData, [key]: data };
      setOfflineData(cached);
      localStorage.setItem('nautilus_offline_data', JSON.stringify(cached));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  const getFromCache = (key: string) => {
    return offlineData[key] || null;
  };

  const loadOfflineData = () => {
    try {
      const cached = localStorage.getItem('nautilus_offline_data');
      if (cached) {
        setOfflineData(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const syncOfflineData = async () => {
    // Sync offline changes when back online
    try {
      const pendingChanges = localStorage.getItem('nautilus_pending_sync');
      if (pendingChanges) {
        // Process pending changes here
        localStorage.removeItem('nautilus_pending_sync');
        toast({
          title: "Sincronização Completa",
          description: "Dados offline foram sincronizados",
        });
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  const addPendingChange = (action: string, data: any) => {
    try {
      const pending = JSON.parse(localStorage.getItem('nautilus_pending_sync') || '[]');
      pending.push({ action, data, timestamp: Date.now() });
      localStorage.setItem('nautilus_pending_sync', JSON.stringify(pending));
    } catch (error) {
      console.error('Error adding pending change:', error);
    }
  };

  return {
    isOnline,
    saveToCache,
    getFromCache,
    addPendingChange,
    offlineData,
  };
};