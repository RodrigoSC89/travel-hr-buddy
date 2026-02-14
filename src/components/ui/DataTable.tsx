/**
 * DataTable - Standardized table component (Tier-1 UX)
 * 
 * Features:
 * - Column sorting (client-side)
 * - Search/filter
 * - Pagination
 * - Row selection with checkboxes
 * - Bulk actions integration
 * - Empty/Loading states built-in
 * - Responsive (cards on mobile)
 * 
 * Inspired by: Notion tables, Airtable, Monday.com
 */

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown, Inbox,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── Types ─── */

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessorFn: (row: T) => React.ReactNode;
  sortFn?: (a: T, b: T) => number;
  className?: string;
  headerClassName?: string;
  /** Hide on mobile */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  /** Enable row selection */
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Pagination */
  pageSize?: number;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Empty message */
  emptyMessage?: string;
  /** Class */
  className?: string;
}

/* ─── Component ─── */

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  pageSize: initialPageSize = 10,
  onRowClick,
  emptyMessage = "Nenhum registro encontrado",
  className,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    const col = columns.find((c) => c.id === sortColumn);
    if (!col?.sortFn) return data;
    const sorted = [...data].sort(col.sortFn);
    return sortDir === "desc" ? sorted.reverse() : sorted;
  }, [data, sortColumn, sortDir, columns]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pagedData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

  // Selection
  const selectedSet = new Set(selectedIds);
  const allOnPageSelected = pagedData.length > 0 && pagedData.every((r) => selectedSet.has(r.id));

  const toggleAll = () => {
    if (allOnPageSelected) {
      onSelectionChange?.(selectedIds.filter((id) => !pagedData.some((r) => r.id === id)));
    } else {
      const newIds = new Set(selectedIds);
      pagedData.forEach((r) => newIds.add(r.id));
      onSelectionChange?.(Array.from(newIds));
    }
  };

  const toggleRow = (id: string) => {
    if (selectedSet.has(id)) {
      onSelectionChange?.(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  const handleSort = (colId: string) => {
    if (sortColumn === colId) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(colId);
      setSortDir("asc");
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("border rounded-lg", className)}>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`dt-skel-${i}`} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Empty
  if (data.length === 0) {
    return (
      <div className={cn("border rounded-lg", className)}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allOnPageSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(
                    col.sortFn && "cursor-pointer select-none hover:text-foreground",
                    col.headerClassName,
                    col.hideOnMobile && "hidden md:table-cell"
                  )}
                  onClick={() => col.sortFn && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortFn && (
                      sortColumn === col.id ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                      )
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedData.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  onRowClick && "cursor-pointer",
                  selectedSet.has(row.id) && "bg-primary/5"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedSet.has(row.id)}
                      onCheckedChange={() => toggleRow(row.id)}
                      aria-label={`Selecionar item ${row.id}`}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    className={cn(
                      col.className,
                      col.hideOnMobile && "hidden md:table-cell"
                    )}
                  >
                    {col.accessorFn(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sortedData.length)} de {sortedData.length}
            </span>
            {selectable && selectedIds.length > 0 && (
              <span className="text-primary font-medium">
                ({selectedIds.length} selecionados)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(0)}
              disabled={page === 0}
              aria-label="Primeira página"
              title="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Página anterior"
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              aria-label="Próxima página"
              title="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              aria-label="Última página"
              title="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
