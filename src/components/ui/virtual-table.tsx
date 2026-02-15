/**
 * VirtualTable - Virtualized table for large datasets
 * Uses @tanstack/react-virtual for efficient rendering in low-bandwidth environments
 */
import { useRef, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

export interface VirtualColumn<T> {
  key: string;
  header: string;
  width?: string;
  cell: (row: T, index: number) => ReactNode;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: VirtualColumn<T>[];
  rowHeight?: number;
  maxHeight?: number;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  emptyState?: ReactNode;
  stickyHeader?: boolean;
}

export function VirtualTable<T>({
  data,
  columns,
  rowHeight = 52,
  maxHeight = 600,
  className,
  onRowClick,
  emptyState,
  stickyHeader = true,
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
  });

  const gridCols = columns.map(c => c.width || '1fr').join(' ');

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
      {/* Header */}
      {stickyHeader && (
        <div
          className="grid gap-0 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider"
          style={{ gridTemplateColumns: gridCols }}
        >
          {columns.map(col => (
            <div key={col.key} className="px-4 py-3 truncate">
              {col.header}
            </div>
          ))}
        </div>
      )}

      {/* Virtualized rows */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map(virtualRow => {
            const row = data[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                className={cn(
                  'grid gap-0 border-b border-border/50 items-center absolute top-0 left-0 w-full',
                  'hover:bg-muted/30 transition-colors',
                  onRowClick && 'cursor-pointer',
                  virtualRow.index % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
                )}
                style={{
                  gridTemplateColumns: gridCols,
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onRowClick?.(row, virtualRow.index)}
              >
                {columns.map(col => (
                  <div key={col.key} className="px-4 py-2 truncate text-sm">
                    {col.cell(row, virtualRow.index)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
