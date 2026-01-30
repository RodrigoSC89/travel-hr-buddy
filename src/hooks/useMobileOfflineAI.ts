/**
 * Hook for Mobile & Offline AI Module
 * Offline-first architecture, camera integration, voice commands, sync
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OfflineData {
  id: string;
  table: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
  syncAttempts: number;
  lastError?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingChanges: number;
  lastSync: string | null;
  syncInProgress: boolean;
  storageUsed: number;
  storageLimit: number;
}

export interface VoiceCommand {
  text: string;
  intent: string;
  entities: Array<{ type: string; value: string }>;
  action: string;
  parameters: Record<string, unknown>;
  confidence: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: Array<{ text: string; boundingBox: number[]; confidence: number }>;
  documentType?: string;
  extractedFields?: Record<string, string>;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: string;
}

export function useMobileOfflineAI() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({ title: 'Conexão Restaurada', description: 'Sincronizando dados...' });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast({ title: 'Modo Offline', description: 'Alterações serão sincronizadas quando online', variant: 'destructive' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const getSyncStatus = useCallback(async (): Promise<SyncStatus | null> => {
    try {
      // Check local storage for pending changes
      const pendingData = localStorage.getItem('pendingSync');
      const pending = pendingData ? JSON.parse(pendingData) : [];
      
      setPendingSync(pending.length);

      return {
        isOnline: navigator.onLine,
        pendingChanges: pending.length,
        lastSync: localStorage.getItem('lastSync'),
        syncInProgress: false,
        storageUsed: JSON.stringify(localStorage).length,
        storageLimit: 5 * 1024 * 1024 // 5MB
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao verificar status';
      setError(message);
      return null;
    }
  }, []);

  const saveOffline = useCallback(async (
    table: string,
    action: 'create' | 'update' | 'delete',
    data: Record<string, unknown>
  ): Promise<OfflineData | null> => {
    try {
      const offlineData: OfflineData = {
        id: crypto.randomUUID(),
        table,
        action,
        data,
        createdAt: new Date().toISOString(),
        synced: false,
        syncAttempts: 0
      };

      // Save to local storage
      const pendingData = localStorage.getItem('pendingSync');
      const pending = pendingData ? JSON.parse(pendingData) : [];
      pending.push(offlineData);
      localStorage.setItem('pendingSync', JSON.stringify(pending));
      
      setPendingSync(pending.length);

      toast({
        title: 'Salvo Localmente',
        description: 'Será sincronizado quando online',
      });

      return offlineData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar offline';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    }
  }, [toast]);

  const syncData = useCallback(async (): Promise<{ synced: number; failed: number } | null> => {
    if (!navigator.onLine) {
      toast({ title: 'Sem Conexão', description: 'Aguarde conexão para sincronizar', variant: 'destructive' });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pendingData = localStorage.getItem('pendingSync');
      const pending: OfflineData[] = pendingData ? JSON.parse(pendingData) : [];
      
      let synced = 0;
      let failed = 0;
      const remaining: OfflineData[] = [];

      for (const item of pending) {
        try {
          const { error: fnError } = await supabase.functions.invoke('mobile-offline-ai', {
            body: { 
              action: 'sync_data',
              item
            }
          });

          if (fnError) throw fnError;
          synced++;
        } catch {
          item.syncAttempts++;
          item.lastError = 'Sync failed';
          remaining.push(item);
          failed++;
        }
      }

      localStorage.setItem('pendingSync', JSON.stringify(remaining));
      localStorage.setItem('lastSync', new Date().toISOString());
      setPendingSync(remaining.length);

      toast({
        title: 'Sincronização Concluída',
        description: `${synced} itens sincronizados${failed > 0 ? `, ${failed} falharam` : ''}`,
      });

      return { synced, failed };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao sincronizar';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const processVoiceCommand = useCallback(async (
    audioBlob: Blob
  ): Promise<VoiceCommand | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });

      const { data, error: fnError } = await supabase.functions.invoke('mobile-offline-ai', {
        body: { 
          action: 'process_voice_command',
          audio: base64
        }
      });

      if (fnError) throw new Error(fnError.message);
      return data.voiceCommand;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar voz';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processOCR = useCallback(async (
    imageBlob: Blob,
    documentType?: string
  ): Promise<OCRResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageBlob);
      });

      const { data, error: fnError } = await supabase.functions.invoke('mobile-offline-ai', {
        body: { 
          action: 'process_ocr',
          image: base64,
          documentType
        }
      });

      if (fnError) throw new Error(fnError.message);
      
      toast({
        title: 'OCR Concluído',
        description: `Confiança: ${(data.ocrResult?.confidence * 100 || 0).toFixed(0)}%`,
      });

      return data.ocrResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar imagem';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getLocation = useCallback(async (): Promise<GeolocationData | null> => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        speed: position.coords.speed || undefined,
        heading: position.coords.heading || undefined,
        timestamp: new Date(position.timestamp).toISOString()
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao obter localização';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    }
  }, [toast]);

  const clearOfflineData = useCallback(async (): Promise<boolean> => {
    try {
      localStorage.removeItem('pendingSync');
      setPendingSync(0);
      
      toast({
        title: 'Dados Limpos',
        description: 'Cache offline removido',
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao limpar dados';
      setError(message);
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  }, [toast]);

  return {
    isLoading,
    error,
    isOnline,
    pendingSync,
    getSyncStatus,
    saveOffline,
    syncData,
    processVoiceCommand,
    processOCR,
    getLocation,
    clearOfflineData
  };
}
