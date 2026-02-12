/**
 * DataGrid - Tabela Avançada Tier-1
 * 
 * FEATURES:
 * - Ordenação por colunas (sort)
 * - Filtros avançados
 * - Paginação (client/server-side)
 * - Seleção múltipla + bulk actions
 * - Colunas configuráveis
 * - Empty/Loading states
 * - Export selecionados
 */

import { useState, useMemo, ReactNode, FC } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  MoreHorizontal,
  Trash2,
  Download,
  Archive,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface BulkAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (selectedRows: T[]) => void;
  variant?: 'default' | 'destructive';
}

export interface DataGridProps<T extends { id: string | number }> {
  // Data
  data: T[];
  columns: Column<T>[];
  keyField?: keyof T;
  
  // Features
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  
  selectable?: boolean;
  bulkActions?: BulkAction<T>[];
  
  sortable?: boolean;
  defaultSortKey?: keyof T | string;
  defaultSortDir?: 'asc' | 'desc';
  
  // Pagination
  paginated?: boolean;
  pageSize?: number;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  
  // States
  isLoading?: boolean;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: { label: string; onClick: () => void };
  
  // Actions
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => ReactNode;
  
  // Style
  className?: string;
  compact?: boolean;
  striped?: boolean;
  hoverable?: boolean;
}

export function DataGrid<T extends { id: string | number }>({
  data,
  columns,
  keyField = 'id' as keyof T,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  searchFields,
  selectable = false,
  bulkActions = [],
  sortable = true,
  defaultSortKey,
  defaultSortDir = 'asc',
  paginated = true,
  pageSize = 10,
  totalItems,
  currentPage = 1,
  onPageChange,
  isLoading,
  emptyIcon,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription = 'Ajuste os filtros ou adicione novos registros.',
  emptyAction,
  onRowClick,
  rowActions,
  className,
  compact = false,
  striped = true,
  hoverable = true,
}: DataGridProps<T>) {
  // State
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | string | undefined>(defaultSortKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultSortDir);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [page, setPage] = useState(currentPage);

  // Filter data by search
  const filteredData = useMemo(() => {
    if (!search) return data;
    
    const searchLower = search.toLowerCase();
    const fields = searchFields || (columns.map(c => c.key) as (keyof T)[]);
    
    return data.filter(row => {
      return fields.some(field => {
        const value = row[field as keyof T];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [data, search, searchFields, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];
      
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      const comparison = String(aVal).localeCompare(String(bVal), 'pt-BR', { numeric: true });
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDir]);

  // Paginate data (client-side)
  const paginatedData = useMemo(() => {
    if (!paginated || onPageChange) return sortedData; // Server-side pagination
    
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, paginated, page, pageSize, onPageChange]);

  // Pagination info
  const totalPages = Math.ceil((totalItems ?? sortedData.length) / pageSize);
  const displayData = paginatedData;

  // Selection handlers
  const allSelected = displayData.length > 0 && displayData.every(row => selectedIds.has(row[keyField] as string | number));
  const someSelected = displayData.some(row => selectedIds.has(row[keyField] as string | number));
  
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayData.map(row => row[keyField] as string | number)));
    }
  };
  
  const toggleSelect = (id: string | number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectedRows = data.filter(row => selectedIds.has(row[keyField] as string | number));

  // Sort handler
  const handleSort = (key: keyof T | string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Pagination handlers
  const goToPage = (newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage);
  };

  // Render sort icon
  const renderSortIcon = (key: keyof T | string) => {
    if (sortKey !== key) return <ChevronsUpDown className="w-4 h-4 text-muted-foreground/50" />;
    return sortDir === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-primary" />
      : <ChevronDown className="w-4 h-4 text-primary" />;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <LoadingState variant="spinner" size="lg" message="Carregando dados..." />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* === TOOLBAR === */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        {searchable && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-10 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Bulk Actions */}
        {selectable && selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}
            </span>
            {bulkActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => action.onClick(selectedRows)}
                className="gap-2"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* === TABLE === */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {/* Selection column */}
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={allSelected ? true : (someSelected && !allSelected) ? "indeterminate" : false}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </th>
                )}
                
                {/* Data columns */}
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3 text-left text-sm font-semibold text-foreground',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      sortable && col.sortable !== false && 'cursor-pointer select-none hover:bg-muted/80 transition-colors'
                    )}
                    style={{ width: col.width }}
                    onClick={() => sortable && col.sortable !== false && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.header}</span>
                      {sortable && col.sortable !== false && renderSortIcon(col.key)}
                    </div>
                  </th>
                ))}
                
                {/* Actions column */}
                {rowActions && (
                  <th className="w-16 px-4 py-3 text-right">
                    <span className="sr-only">Ações</span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}>
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                      actionLabel={emptyAction?.label}
                      onAction={emptyAction?.onClick}
                      variant="compact"
                    />
                  </td>
                </tr>
              ) : (
                displayData.map((row, rowIndex) => {
                  const rowId = row[keyField] as string | number;
                  const isSelected = selectedIds.has(rowId);
                  
                  return (
                    <tr
                      key={rowId}
                      className={cn(
                        'transition-colors',
                        striped && rowIndex % 2 === 1 && 'bg-muted/30',
                        hoverable && 'hover:bg-muted/50',
                        isSelected && 'bg-primary/5',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {/* Selection cell */}
                      {selectable && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelect(rowId)}
                            aria-label={`Selecionar linha ${rowIndex + 1}`}
                          />
                        </td>
                      )}
                      
                      {/* Data cells */}
                      {columns.map((col) => (
                        <td
                          key={String(col.key)}
                          className={cn(
                            'px-4 text-sm text-foreground',
                            compact ? 'py-2' : 'py-3',
                            col.align === 'center' && 'text-center',
                            col.align === 'right' && 'text-right'
                          )}
                        >
                          {col.render 
                            ? col.render(row, rowIndex)
                            : String(row[col.key as keyof T] ?? '-')
                          }
                        </td>
                      ))}
                      
                      {/* Actions cell */}
                      {rowActions && (
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {rowActions(row)}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* === PAGINATION === */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, totalItems ?? sortedData.length)} de {totalItems ?? sortedData.length}
          </p>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="w-9"
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Default bulk actions factory
export function createDefaultBulkActions<T>(
  onDelete?: (items: T[]) => void,
  onExport?: (items: T[]) => void,
  onArchive?: (items: T[]) => void,
  onApprove?: (items: T[]) => void
): BulkAction<T>[] {
  const actions: BulkAction<T>[] = [];
  
  if (onApprove) {
    actions.push({
      label: 'Aprovar',
      icon: <CheckCircle2 className="w-4 h-4" />,
      onClick: onApprove,
    });
  }
  
  if (onExport) {
    actions.push({
      label: 'Exportar',
      icon: <Download className="w-4 h-4" />,
      onClick: onExport,
    });
  }
  
  if (onArchive) {
    actions.push({
      label: 'Arquivar',
      icon: <Archive className="w-4 h-4" />,
      onClick: onArchive,
    });
  }
  
  if (onDelete) {
    actions.push({
      label: 'Excluir',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      variant: 'destructive',
    });
  }
  
  return actions;
}

export default DataGrid;
