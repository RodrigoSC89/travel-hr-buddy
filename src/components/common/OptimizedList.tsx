/**
import { useCallback, useMemo } from "react";;
 * Optimized List Component
 * Virtualized list for large datasets on slow networks
 */

import React, { memo, useCallback, useMemo } from "react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { cn } from "@/lib/utils";

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  pageSize?: number;
}

function OptimizedListInner<T>({
  items,
  renderItem,
  keyExtractor,
  className,
  emptyMessage = "Nenhum item encontrado",
  loading = false,
  pageSize
}: OptimizedListProps<T>) {
  const { quality } = useNetworkStatus();
  
  // Adjust page size based on network
  const effectivePageSize = useMemo(() => {
    if (pageSize) return pageSize;
    if (quality === "slow") return 10;
    if (quality === "medium") return 25;
    return 50;
  }, [quality, pageSize]);

  // Only render visible items for slow connections
  const visibleItems = useMemo(() => {
    if (quality === "slow" && items.length > effectivePageSize) {
      return items.slice(0, effectivePageSize);
    }
    return items;
  }, [items, quality, effectivePageSize]);

  const renderListItem = useCallback((item: T, index: number) => {
    return (
      <div key={keyExtractor(item, index)} className="animate-fade-in">
        {renderItem(item, index)}
      </div>
    );
  }, [renderItem, keyExtractor]);

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className="h-16 bg-muted/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn(
        "flex items-center justify-center py-8 text-muted-foreground",
        className
      )}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {visibleItems.map(renderListItem)}
      
      {quality === "slow" && items.length > effectivePageSize && (
        <div className="text-center text-sm text-muted-foreground py-2">
          Mostrando {effectivePageSize} de {items.length} itens
          <br />
          <span className="text-xs">Conexão lenta detectada</span>
        </div>
      )}
    </div>
  );
}

export const OptimizedList = memo(OptimizedListInner) as typeof OptimizedListInner;
export default OptimizedList;
