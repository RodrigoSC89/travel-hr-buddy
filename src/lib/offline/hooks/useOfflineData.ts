/* eslint-disable @typescript-eslint/no-explicit-any -- IDB store proxy + partial updates require flexible typing */
/**
 * Offline-first data hooks with idb + Supabase sync
 * Migrated from Dexie to idb to resolve TS1540 build errors
 * Tables used: vessels, crew_members, maintenance_orders - ALL exist in schema
 */

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { db, type OfflineVessel, type OfflineCrewMember, type OfflineMaintenanceOrder, saveToLocal, deleteFromLocal, queueOperation } from "../db";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

// ===================================================================
// Generic live query hook (replaces useLiveQuery from dexie-react-hooks)
// ===================================================================

function useIDBLiveQuery<T>(queryFn: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [result, setResult] = useState<T | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const data = await queryFn();
        if (!cancelled) setResult(data);
      } catch {
        // DB not ready yet
      }
    };
    run();
    // Poll every 2s for changes (replaces dexie reactive queries)
    const interval = setInterval(run, 2000);
    return () => { cancelled = true; clearInterval(interval); };
  }, deps);

  return result;
}

// ===================================================================
// VESSEL HOOKS (OFFLINE-FIRST)
// ===================================================================

export function useOfflineVessels() {
  const vessels = useIDBLiveQuery(
    () => db.vessels.filter((v: OfflineVessel) => !v._deleted).toArray(),
    []
  );

  return {
    vessels: vessels || [],
    isLoading: vessels === undefined,
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

      await saveToLocal(db.vessels as any, record);
      await queueOperation('create', 'vessels', id, vessel as Record<string, unknown>);

      if (navigator.onLine) {
        try {
          const { error } = await supabase.from('vessels').insert(vessel as never);
          if (!error) {
            await db.vessels.update(id, { _synced: true } as any);
            await db.pending_operations.where({ table: 'vessels', recordId: id, operation: 'create' }).delete?.();
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
        description: navigator.onLine ? 'Sincronizada com sucesso' : 'Será sincronizada quando estiver online',
      });
    },
    onError: (error) => {
      toast.error('Erro ao criar embarcação', { description: error.message });
    },
  });
}

export function useUpdateOfflineVessel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OfflineVessel> }) => {
      await db.vessels.update(id, { ...data, _synced: false, _lastModified: Date.now() } as any);
      await queueOperation('update', 'vessels', id, data as Record<string, unknown>);

      if (navigator.onLine) {
        try {
          const { error } = await supabase.from('vessels').update(data as never).eq('id', id);
          if (!error) {
            await db.vessels.update(id, { _synced: true } as any);
            await db.pending_operations.where({ table: 'vessels', recordId: id, operation: 'update' }).delete?.();
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
      await deleteFromLocal(db.vessels as any, id);
      await queueOperation('delete', 'vessels', id, {});

      if (navigator.onLine) {
        try {
          const { error } = await supabase.from('vessels').delete().eq('id', id);
          if (!error) {
            await db.vessels.delete(id);
            await db.pending_operations.where({ table: 'vessels', recordId: id, operation: 'delete' }).delete?.();
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
  const crew = useIDBLiveQuery(
    async () => {
      const all = await db.crew_members.filter((c: OfflineCrewMember) => !c._deleted).toArray();
      return vesselId ? all.filter((c: OfflineCrewMember) => c.vessel_id === vesselId) : all;
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

      await saveToLocal(db.crew_members as any, record);
      await queueOperation('create', 'crew_members', id, crewMember as Record<string, unknown>);

      if (navigator.onLine) {
        try {
          const { error } = await supabase.from('crew_members').insert(crewMember as never);
          if (!error) {
            await db.crew_members.update(id, { _synced: true } as any);
            await db.pending_operations.where({ table: 'crew_members', recordId: id }).delete?.();
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
  const orders = useIDBLiveQuery(
    async () => {
      let results = await db.maintenance_orders.filter((o: OfflineMaintenanceOrder) => !o._deleted).toArray();
      if (vesselId) results = results.filter((o: OfflineMaintenanceOrder) => o.vessel_id === vesselId);
      if (status) results = results.filter((o: OfflineMaintenanceOrder) => o.status === status);
      return results.sort((a: OfflineMaintenanceOrder, b: OfflineMaintenanceOrder) => {
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

      await saveToLocal(db.maintenance_orders as any, record);
      await queueOperation('create', 'maintenance_orders', id, order as Record<string, unknown>, 'high');

      if (navigator.onLine) {
        try {
          const { error } = await supabase.from('maintenance_orders').insert(order as never);
          if (!error) {
            await db.maintenance_orders.update(id, { _synced: true } as any);
            await db.pending_operations.where({ table: 'maintenance_orders', recordId: id }).delete?.();
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
      await db.maintenance_orders.update(id, { ...data, _synced: false, _lastModified: Date.now() } as any);
      await queueOperation('update', 'maintenance_orders', id, data as Record<string, unknown>, 'high');

      if (navigator.onLine) {
        try {
          const { error } = await supabase.from('maintenance_orders').update(data as never).eq('id', id);
          if (!error) {
            await db.maintenance_orders.update(id, { _synced: true } as any);
            await db.pending_operations.where({ table: 'maintenance_orders', recordId: id, operation: 'update' }).delete?.();
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
// SYNC STATUS & STATS HOOKS
// ===================================================================

export type SyncStatusType = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export function useSyncStatus() {
  const pendingOps = useIDBLiveQuery(() => db.pending_operations.count(), []);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const count = pendingOps || 0;
  const status = (!isOnline ? 'offline' : (count > 0 ? 'idle' : 'synced')) as SyncStatusType;

  return {
    pendingCount: count,
    isSyncing: false,
    isOnline,
    lastSyncAt: null as string | null,
    status,
    progress: 100 as number,
    lastSyncTime: null as Date | null,
    error: null as string | null,
    currentOperation: null as string | null,
    triggerSync: async () => { /* sync handled by sync-engine */ },
  };
}

export function useOfflineStats() {
  const stats = useIDBLiveQuery(async () => {
    const vessels = await db.vessels.count();
    const crew = await db.crew_members.count();
    const orders = await db.maintenance_orders.count();
    const pending = await db.pending_operations.count();
    const unsynced = await db.vessels.filter((v: OfflineVessel) => !v._synced).count()
      + await db.crew_members.filter((c: OfflineCrewMember) => !c._synced).count()
      + await db.maintenance_orders.filter((o: OfflineMaintenanceOrder) => !o._synced).count();

    return { vessels, crewMembers: crew, orders, pendingOperations: pending, unsynced };
  }, []);

  return {
    ...(stats || { vessels: 0, crewMembers: 0, orders: 0, pendingOperations: 0, unsynced: 0 }),
    isLoading: stats === undefined,
  };
}
