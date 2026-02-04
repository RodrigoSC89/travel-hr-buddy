/**
 * NAUTI ONE - Offline-First Data Hooks
 * Hooks React para operações offline-first com optimistic updates
 */

import { useEffect, useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  db, 
  saveToLocal, 
  deleteFromLocal, 
  queueOperation,
  countPendingOperations,
  OfflineVessel,
  OfflineCrewMember,
  OfflineMaintenanceOrder,
  OfflineCertificate,
  OfflineInvoice,
  OfflineAlert,
} from '../db';
import { syncPendingOperations } from '../sync-engine';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// Sync state type
export interface SyncState {
  status: 'idle' | 'syncing' | 'success' | 'error' | 'offline';
  progress: number;
  lastSyncTime: number | null;
  pendingCount: number;
  error?: string;
  currentOperation?: string;
}

// ===================================================================
// HOOK DE STATUS DE SINCRONIZAÇÃO
// ===================================================================

export function useSyncStatus() {
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    progress: 0,
    lastSyncTime: null,
    pendingCount: 0,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setSyncState(s => ({ ...s, status: 'offline' }));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Update pending count periodically
    const updatePending = async () => {
      const count = await countPendingOperations();
      setSyncState(s => ({ ...s, pendingCount: count }));
    };
    updatePending();
    const interval = setInterval(updatePending, 5000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine) return false;
    setSyncState(s => ({ ...s, status: 'syncing', progress: 0 }));
    try {
      await syncPendingOperations();
      setSyncState(s => ({ ...s, status: 'success', progress: 100, lastSyncTime: Date.now() }));
      return true;
    } catch {
      setSyncState(s => ({ ...s, status: 'error' }));
      return false;
    }
  }, []);

  return {
    ...syncState,
    isOnline,
    triggerSync,
  };
}

// ===================================================================
// VESSELS HOOKS (OFFLINE-FIRST)
// ===================================================================

export function useOfflineVessels() {
  const vessels = useLiveQuery(
    () => db.vessels.filter((v) => !v._deleted).toArray(),
    []
  );

  return {
    vessels: vessels || [],
    isLoading: vessels === undefined,
    isEmpty: vessels?.length === 0,
  };
}

export function useOfflineVessel(id: string) {
  const vessel = useLiveQuery(
    () => db.vessels.get(id),
    [id]
  );

  return {
    vessel: vessel?._deleted ? null : vessel,
    isLoading: vessel === undefined,
  };
}

export function useCreateOfflineVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vessel: Omit<OfflineVessel, 'id' | '_synced' | '_lastModified' | '_version'>) => {
      const id = crypto.randomUUID();
      const record: OfflineVessel = {
        ...vessel,
        id,
        _synced: false,
        _lastModified: Date.now(),
        _version: 1,
      };

      // 1. Salvar localmente (IMEDIATO)
      await saveToLocal(db.vessels, record);

      // 2. Adicionar à fila de sincronização
      await queueOperation('create', 'vessels', id, vessel as Record<string, unknown>);

      // 3. Se online, tentar sincronizar imediatamente
      if (navigator.onLine) {
        try {
          const { error } = await (supabase as any)
            .from('vessels')
            .insert(vessel);

          if (!error) {
            await db.vessels.update(id, { _synced: true });
            await db.pending_operations
              .where({ table: 'vessels', recordId: id, operation: 'create' })
              .delete();
          }
        } catch (error) {
          logger.warn('[useCreateOfflineVessel] Will sync later:', error);
        }
      }

      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      toast.success('Embarcação criada!', {
        description: navigator.onLine
          ? 'Sincronizada com sucesso'
          : 'Será sincronizada quando estiver online',
      });
    },
    onError: (error) => {
      toast.error('Erro ao criar embarcação', {
        description: error.message,
      });
    },
  });
}

export function useUpdateOfflineVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OfflineVessel> }) => {
      // 1. Atualizar localmente (IMEDIATO)
      await db.vessels.update(id, {
        ...data,
        _synced: false,
        _lastModified: Date.now(),
      });

      // 2. Adicionar à fila
      await queueOperation('update', 'vessels', id, data as Record<string, unknown>);

      // 3. Se online, tentar sincronizar
      if (navigator.onLine) {
        try {
          const { error } = await (supabase as any)
            .from('vessels')
            .update(data)
            .eq('id', id);

          if (!error) {
            await db.vessels.update(id, { _synced: true });
            await db.pending_operations
              .where({ table: 'vessels', recordId: id, operation: 'update' })
              .delete();
          }
        } catch (error) {
          logger.warn('[useUpdateOfflineVessel] Will sync later:', error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      toast.success('Embarcação atualizada!');
    },
  });
}

export function useDeleteOfflineVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // 1. Soft delete local
      await deleteFromLocal(db.vessels, id);

      // 2. Adicionar à fila
      await queueOperation('delete', 'vessels', id, {});

      // 3. Se online, tentar sincronizar
      if (navigator.onLine) {
        try {
          const { error } = await (supabase as any)
            .from('vessels')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);

          if (!error) {
            await db.vessels.delete(id);
            await db.pending_operations
              .where({ table: 'vessels', recordId: id, operation: 'delete' })
              .delete();
          }
        } catch (error) {
          logger.warn('[useDeleteOfflineVessel] Will sync later:', error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
      toast.success('Embarcação removida!');
    },
  });
}

// ===================================================================
// CREW MEMBERS HOOKS (OFFLINE-FIRST)
// ===================================================================

export function useOfflineCrew(vesselId?: string) {
  const crew = useLiveQuery(
    async () => {
      let query = db.crew_members.filter((c) => !c._deleted);
      
      if (vesselId) {
        query = db.crew_members.filter((c) => !c._deleted && c.vessel_id === vesselId);
      }
      
      return query.toArray();
    },
    [vesselId]
  );

  return {
    crew: crew || [],
    isLoading: crew === undefined,
  };
}

export function useCreateOfflineCrew() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (crewMember: Omit<OfflineCrewMember, 'id' | '_synced' | '_lastModified' | '_version'>) => {
      const id = crypto.randomUUID();
      const record: OfflineCrewMember = {
        ...crewMember,
        id,
        _synced: false,
        _lastModified: Date.now(),
        _version: 1,
      };

      await saveToLocal(db.crew_members, record);
      await queueOperation('create', 'crew_members', id, crewMember as Record<string, unknown>);

      if (navigator.onLine) {
        try {
          const { error } = await (supabase as any)
            .from('crew_members')
            .insert(crewMember);

          if (!error) {
            await db.crew_members.update(id, { _synced: true });
            await db.pending_operations
              .where({ table: 'crew_members', recordId: id })
              .delete();
          }
        } catch (error) {
          logger.warn('[useCreateOfflineCrew] Will sync later:', error);
        }
      }

      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew'] });
      toast.success('Tripulante cadastrado!');
    },
  });
}

// ===================================================================
// MAINTENANCE ORDERS HOOKS (OFFLINE-FIRST)
// ===================================================================

export function useOfflineMaintenanceOrders(vesselId?: string, status?: string) {
  const orders = useLiveQuery(
    async () => {
      let results = await db.maintenance_orders
        .filter((o) => !o._deleted)
        .toArray();
      
      if (vesselId) {
        results = results.filter((o) => o.vessel_id === vesselId);
      }
      
      if (status) {
        results = results.filter((o) => o.status === status);
      }
      
      return results.sort((a, b) => {
        const dateA = a.due_date ? new Date(a.due_date).getTime() : 0;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : 0;
        return dateA - dateB;
      });
    },
    [vesselId, status]
  );

  return {
    orders: orders || [],
    isLoading: orders === undefined,
  };
}

export function useCreateOfflineMaintenanceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: Omit<OfflineMaintenanceOrder, 'id' | '_synced' | '_lastModified' | '_version'>) => {
      const id = crypto.randomUUID();
      const record: OfflineMaintenanceOrder = {
        ...order,
        id,
        order_number: order.order_number || `WO-${Date.now().toString(36).toUpperCase()}`,
        _synced: false,
        _lastModified: Date.now(),
        _version: 1,
      };

      await saveToLocal(db.maintenance_orders, record);
      await queueOperation('create', 'maintenance_orders', id, order as Record<string, unknown>, 'high');

      if (navigator.onLine) {
        try {
          const { error } = await (supabase as any)
            .from('maintenance_orders')
            .insert(order);

          if (!error) {
            await db.maintenance_orders.update(id, { _synced: true });
            await db.pending_operations
              .where({ table: 'maintenance_orders', recordId: id })
              .delete();
          }
        } catch (error) {
          logger.warn('[useCreateOfflineMaintenanceOrder] Will sync later:', error);
        }
      }

      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Ordem de serviço criada!');
    },
  });
}

export function useUpdateOfflineMaintenanceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OfflineMaintenanceOrder> }) => {
      await db.maintenance_orders.update(id, {
        ...data,
        _synced: false,
        _lastModified: Date.now(),
      });

      await queueOperation('update', 'maintenance_orders', id, data as Record<string, unknown>, 'high');

      if (navigator.onLine) {
        try {
          const { error } = await (supabase as any)
            .from('maintenance_orders')
            .update(data)
            .eq('id', id);

          if (!error) {
            await db.maintenance_orders.update(id, { _synced: true });
            await db.pending_operations
              .where({ table: 'maintenance_orders', recordId: id })
              .delete();
          }
        } catch (error) {
          logger.warn('[useUpdateOfflineMaintenanceOrder] Will sync later:', error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success('Ordem atualizada!');
    },
  });
}

// ===================================================================
// CERTIFICATES HOOKS (OFFLINE-FIRST)
// ===================================================================

export function useOfflineCertificates(crewMemberId?: string) {
  const certificates = useLiveQuery(
    async () => {
      let results = await db.certificates
        .filter((c) => !c._deleted)
        .toArray();
      
      if (crewMemberId) {
        results = results.filter((c) => c.crew_member_id === crewMemberId);
      }
      
      return results.sort((a, b) => {
        const dateA = a.expiry_date ? new Date(a.expiry_date).getTime() : 0;
        const dateB = b.expiry_date ? new Date(b.expiry_date).getTime() : 0;
        return dateA - dateB;
      });
    },
    [crewMemberId]
  );

  return {
    certificates: certificates || [],
    isLoading: certificates === undefined,
  };
}

// ===================================================================
// INVOICES HOOKS (OFFLINE-FIRST)
// ===================================================================

export function useOfflineInvoices(vesselId?: string, status?: string) {
  const invoices = useLiveQuery(
    async () => {
      let results = await db.invoices
        .filter((i) => !i._deleted)
        .toArray();
      
      if (vesselId) {
        results = results.filter((i) => i.vessel_id === vesselId);
      }
      
      if (status) {
        results = results.filter((i) => i.status === status);
      }
      
      return results.sort((a, b) => {
        const dateA = a.issued_at ? new Date(a.issued_at).getTime() : 0;
        const dateB = b.issued_at ? new Date(b.issued_at).getTime() : 0;
        return dateB - dateA; // Mais recentes primeiro
      });
    },
    [vesselId, status]
  );

  return {
    invoices: invoices || [],
    isLoading: invoices === undefined,
  };
}

// ===================================================================
// ALERTS HOOKS (OFFLINE-FIRST)
// ===================================================================

export function useOfflineAlerts(vesselId?: string, severity?: string) {
  const alerts = useLiveQuery(
    async () => {
      let results = await db.alerts
        .filter((a) => !a._deleted && !a.is_resolved)
        .toArray();
      
      if (vesselId) {
        results = results.filter((a) => a.vessel_id === vesselId);
      }
      
      if (severity) {
        results = results.filter((a) => a.severity === severity);
      }
      
      return results.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; // Mais recentes primeiro
      });
    },
    [vesselId, severity]
  );

  return {
    alerts: alerts || [],
    isLoading: alerts === undefined,
    criticalCount: alerts?.filter((a) => a.severity === 'critical').length || 0,
  };
}

// ===================================================================
// DATABASE STATS HOOK
// ===================================================================

export function useOfflineStats() {
  const [stats, setStats] = useState({
    vessels: 0,
    crewMembers: 0,
    certificates: 0,
    maintenanceOrders: 0,
    documents: 0,
    invoices: 0,
    alerts: 0,
    pendingOperations: 0,
    unsynced: 0,
  });

  useEffect(() => {
    const updateStats = async () => {
      const [
        vessels,
        crewMembers,
        certificates,
        maintenanceOrders,
        documents,
        invoices,
        alerts,
        pendingOperations,
      ] = await Promise.all([
        db.vessels.filter((r) => !r._deleted).count(),
        db.crew_members.filter((r) => !r._deleted).count(),
        db.certificates.filter((r) => !r._deleted).count(),
        db.maintenance_orders.filter((r) => !r._deleted).count(),
        db.documents.filter((r) => !r._deleted).count(),
        db.invoices.filter((r) => !r._deleted).count(),
        db.alerts.filter((r) => !r._deleted).count(),
        db.pending_operations.count(),
      ]);

      const unsyncedPromises = [
        db.vessels.filter((r) => !r._synced).count(),
        db.crew_members.filter((r) => !r._synced).count(),
        db.maintenance_orders.filter((r) => !r._synced).count(),
      ];
      
      const unsyncedCounts = await Promise.all(unsyncedPromises);
      const unsynced = unsyncedCounts.reduce((a, b) => a + b, 0);

      setStats({
        vessels,
        crewMembers,
        certificates,
        maintenanceOrders,
        documents,
        invoices,
        alerts,
        pendingOperations,
        unsynced,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return stats;
}
