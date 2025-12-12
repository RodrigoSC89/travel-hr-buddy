/**
 * Optimistic Updates Utilities - PATCH 831
 * Handle optimistic UI updates with rollback support
 */

import { useState, useCallback, useRef } from "react";

interface OptimisticUpdate<T> {
  id: string;
  previousValue: T;
  optimisticValue: T;
  timestamp: number;
  status: "pending" | "confirmed" | "rolled-back";
}

interface OptimisticOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollback: () => void) => void;
  onRollback?: (previousValue: T) => void;
  timeout?: number;
}

/**
 * Hook for managing optimistic updates
 */
export function useOptimisticUpdate<T>(
  initialValue: T,
  options: OptimisticOptions<T> = {}
) {
  const [value, setValue] = useState<T>(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const pendingUpdatesRef = useRef<Map<string, OptimisticUpdate<T>>>(new Map());
  const { timeout = 10000 } = options;

  const update = useCallback(
    async (
      optimisticValue: T,
      asyncOperation: () => Promise<T>
    ): Promise<T | null> => {
      const updateId = `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const previousValue = value;

      // Store the update for potential rollback
      pendingUpdatesRef.current.set(updateId, {
        id: updateId,
        previousValue,
        optimisticValue,
        timestamp: Date.now(),
        status: "pending",
      });

      // Apply optimistic update immediately
      setValue(optimisticValue);
      setIsUpdating(true);
      setError(null);

      // Set up timeout for automatic rollback
      const timeoutId = setTimeout(() => {
        const update = pendingUpdatesRef.current.get(updateId);
        if (update && update.status === "pending") {
          rollback(updateId);
          setError(new Error("Operation timed out"));
        }
      }, timeout);

      try {
        const result = await asyncOperation();

        clearTimeout(timeoutId);
        
        // Mark as confirmed
        const update = pendingUpdatesRef.current.get(updateId);
        if (update) {
          update.status = "confirmed";
        }

        // Update with server response
        setValue(result);
        options.onSuccess?.(result);

        return result;
      } catch (err) {
        clearTimeout(timeoutId);
        
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);

        // Rollback on error
        rollback(updateId);
        options.onError?.(error, () => rollback(updateId));

        return null;
      } finally {
        setIsUpdating(false);
        // Clean up old updates
        cleanupOldUpdates();
      }
    },
    [value, timeout, options]
  );

  const rollback = useCallback(
    (updateId: string) => {
      const update = pendingUpdatesRef.current.get(updateId);
      if (update && update.status === "pending") {
        update.status = "rolled-back";
        setValue(update.previousValue);
        options.onRollback?.(update.previousValue);
      }
    },
    [options]
  );

  const cleanupOldUpdates = useCallback(() => {
    const now = Date.now();
    const maxAge = timeout * 2;

    pendingUpdatesRef.current.forEach((update, id) => {
      if (now - update.timestamp > maxAge) {
        pendingUpdatesRef.current.delete(id);
      }
    });
  }, [timeout]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsUpdating(false);
    pendingUpdatesRef.current.clear();
  }, [initialValue]);

  return {
    value,
    update,
    isUpdating,
    error,
    reset,
    hasPendingUpdates: () => {
      return Array.from(pendingUpdatesRef.current.values()).some(
        (u) => u.status === "pending"
      );
    },
  };
}

/**
 * Hook for optimistic list operations
 */
export function useOptimisticList<T extends { id: string | number }>(
  initialItems: T[],
  options: {
    onAdd?: (item: T) => Promise<T>;
    onUpdate?: (item: T) => Promise<T>;
    onDelete?: (id: string | number) => Promise<void>;
    onError?: (error: Error, operation: string) => void;
  } = {}
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [pendingIds, setPendingIds] = useState<Set<string | number>>(new Set());
  const previousStatesRef = useRef<Map<string | number, T | null>>(new Map());

  const addItem = useCallback(
    async (newItem: T): Promise<T | null> => {
      // Optimistically add the item
      setItems((prev) => [...prev, newItem]);
      setPendingIds((prev) => new Set(prev).add(newItem.id));
      previousStatesRef.current.set(newItem.id, null);

      try {
        const result = options.onAdd ? await options.onAdd(newItem) : newItem;
        
        // Update with server response
        setItems((prev) =>
          prev.map((item) => (item.id === newItem.id ? result : item))
        );
        
        return result;
      } catch (error) {
        // Rollback
        setItems((prev) => prev.filter((item) => item.id !== newItem.id));
        options.onError?.(error instanceof Error ? error : new Error("Add failed"), "add");
        return null;
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(newItem.id);
          return next;
        });
        previousStatesRef.current.delete(newItem.id);
      }
    },
    [options]
  );

  const updateItem = useCallback(
    async (updatedItem: T): Promise<T | null> => {
      const previousItem = items.find((item) => item.id === updatedItem.id);
      if (!previousItem) return null;

      // Optimistically update
      setItems((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      setPendingIds((prev) => new Set(prev).add(updatedItem.id));
      previousStatesRef.current.set(updatedItem.id, previousItem);

      try {
        const result = options.onUpdate ? await options.onUpdate(updatedItem) : updatedItem;
        
        // Update with server response
        setItems((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? result : item))
        );
        
        return result;
      } catch (error) {
        // Rollback
        setItems((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? previousItem : item))
        );
        options.onError?.(error instanceof Error ? error : new Error("Update failed"), "update");
        return null;
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(updatedItem.id);
          return next;
        });
        previousStatesRef.current.delete(updatedItem.id);
      }
    },
    [items, options]
  );

  const deleteItem = useCallback(
    async (id: string | number): Promise<boolean> => {
      const previousItem = items.find((item) => item.id === id);
      if (!previousItem) return false;

      // Optimistically remove
      setItems((prev) => prev.filter((item) => item.id !== id));
      setPendingIds((prev) => new Set(prev).add(id));
      previousStatesRef.current.set(id, previousItem);

      try {
        if (options.onDelete) {
          await options.onDelete(id);
        }
        return true;
      } catch (error) {
        // Rollback
        setItems((prev) => [...prev, previousItem]);
        options.onError?.(error instanceof Error ? error : new Error("Delete failed"), "delete");
        return false;
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        previousStatesRef.current.delete(id);
      }
    },
    [items, options]
  );

  const isPending = useCallback(
    (id: string | number) => pendingIds.has(id),
    [pendingIds]
  );

  const reset = useCallback(() => {
    setItems(initialItems);
    setPendingIds(new Set());
    previousStatesRef.current.clear();
  }, [initialItems]);

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    isPending,
    hasPendingOperations: pendingIds.size > 0,
    reset,
    setItems,
  };
}

/**
 * Create an optimistic mutation wrapper
 */
export function createOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    getOptimisticResponse?: (variables: TVariables) => TData;
    updateCache?: (optimisticData: TData, variables: TVariables) => void;
    rollbackCache?: (variables: TVariables) => void;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  } = {}
) {
  return async (variables: TVariables): Promise<TData> => {
    // Apply optimistic update if provided
    if (options.getOptimisticResponse && options.updateCache) {
      const optimisticData = options.getOptimisticResponse(variables);
      options.updateCache(optimisticData, variables);
    }

    try {
      const result = await mutationFn(variables);
      options.onSuccess?.(result, variables);
      return result;
    } catch (error) {
      // Rollback on error
      options.rollbackCache?.(variables);
      options.onError?.(error instanceof Error ? error : new Error("Mutation failed"), variables);
      throw error;
    }
  };
}

/**
 * Debounced optimistic update hook
 */
export function useDebouncedOptimisticUpdate<T>(
  initialValue: T,
  saveFn: (value: T) => Promise<T>,
  delay: number = 500
) {
  const [value, setValue] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingValueRef = useRef<T | null>(null);

  const updateValue = useCallback(
    (newValue: T) => {
      // Update local state immediately
      setValue(newValue);
      pendingValueRef.current = newValue;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for save
      timeoutRef.current = setTimeout(async () => {
        if (pendingValueRef.current !== null) {
          setIsSaving(true);
          try {
            const result = await saveFn(pendingValueRef.current);
            setValue(result);
            setLastSaved(new Date());
            pendingValueRef.current = null;
          } catch (error) {
            console.error("Failed to save:", error);
          } finally {
            setIsSaving(false);
          }
        }
      }, delay);
    },
    [saveFn, delay]
  );

  // Force save immediately
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (pendingValueRef.current !== null) {
      setIsSaving(true);
      try {
        const result = await saveFn(pendingValueRef.current);
        setValue(result);
        setLastSaved(new Date());
        pendingValueRef.current = null;
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [saveFn]);

  return {
    value,
    updateValue,
    saveNow,
    isSaving,
    lastSaved,
    hasPendingChanges: pendingValueRef.current !== null,
  };
}
