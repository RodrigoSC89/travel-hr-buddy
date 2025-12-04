/**
 * Optimistic Update Hook
 * Provides instant UI feedback while waiting for server response
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface OptimisticState<T> {
  data: T;
  isOptimistic: boolean;
  error: Error | null;
}

interface UseOptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData: T) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  options: UseOptimisticUpdateOptions<T> = {}
) {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
    error: null
  });
  
  const previousData = useRef<T>(initialData);
  const { onSuccess, onError, successMessage, errorMessage } = options;

  const update = useCallback(async (
    optimisticData: T,
    serverUpdate: () => Promise<T>
  ) => {
    // Save current data for potential rollback
    previousData.current = state.data;
    
    // Apply optimistic update immediately
    setState({
      data: optimisticData,
      isOptimistic: true,
      error: null
    });

    try {
      // Perform actual server update
      const serverData = await serverUpdate();
      
      // Confirm with server data
      setState({
        data: serverData,
        isOptimistic: false,
        error: null
      });

      if (successMessage) {
        toast.success(successMessage);
      }
      
      onSuccess?.(serverData);
      return serverData;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Update failed');
      
      // Rollback to previous data
      setState({
        data: previousData.current,
        isOptimistic: false,
        error: err
      });

      toast.error(errorMessage || 'Falha ao atualizar. Alterações revertidas.');
      onError?.(err, previousData.current);
      throw err;
    }
  }, [state.data, onSuccess, onError, successMessage, errorMessage]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isOptimistic: false,
      error: null
    });
  }, [initialData]);

  return {
    data: state.data,
    isOptimistic: state.isOptimistic,
    error: state.error,
    update,
    reset
  };
}

/**
 * Simple optimistic toggle for boolean values
 */
export function useOptimisticToggle(
  initialValue: boolean,
  onToggle: (newValue: boolean) => Promise<boolean>
) {
  const [value, setValue] = useState(initialValue);
  const [isPending, setIsPending] = useState(false);
  const previousValue = useRef(initialValue);

  const toggle = useCallback(async () => {
    previousValue.current = value;
    const newValue = !value;
    
    // Optimistic update
    setValue(newValue);
    setIsPending(true);

    try {
      const confirmed = await onToggle(newValue);
      setValue(confirmed);
    } catch {
      // Rollback
      setValue(previousValue.current);
      toast.error('Falha ao atualizar');
    } finally {
      setIsPending(false);
    }
  }, [value, onToggle]);

  return { value, toggle, isPending };
}

/**
 * Optimistic list operations
 */
export function useOptimisticList<T extends { id: string }>(
  initialItems: T[]
) {
  const [items, setItems] = useState(initialItems);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const previousItems = useRef(initialItems);

  const addItem = useCallback(async (
    item: T,
    serverAdd: () => Promise<T>
  ) => {
    previousItems.current = items;
    
    // Add optimistically with pending state
    setItems(prev => [...prev, item]);
    setPendingIds(prev => new Set(prev).add(item.id));

    try {
      const serverItem = await serverAdd();
      setItems(prev => prev.map(i => i.id === item.id ? serverItem : i));
    } catch {
      setItems(previousItems.current);
      toast.error('Falha ao adicionar item');
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }, [items]);

  const removeItem = useCallback(async (
    id: string,
    serverRemove: () => Promise<void>
  ) => {
    previousItems.current = items;
    
    // Remove optimistically
    setItems(prev => prev.filter(i => i.id !== id));
    setPendingIds(prev => new Set(prev).add(id));

    try {
      await serverRemove();
    } catch {
      setItems(previousItems.current);
      toast.error('Falha ao remover item');
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [items]);

  const updateItem = useCallback(async (
    id: string,
    updates: Partial<T>,
    serverUpdate: () => Promise<T>
  ) => {
    previousItems.current = items;
    
    // Update optimistically
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    setPendingIds(prev => new Set(prev).add(id));

    try {
      const serverItem = await serverUpdate();
      setItems(prev => prev.map(i => i.id === id ? serverItem : i));
    } catch {
      setItems(previousItems.current);
      toast.error('Falha ao atualizar item');
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [items]);

  const isPending = useCallback((id: string) => pendingIds.has(id), [pendingIds]);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    isPending,
    setItems
  };
}
