/**
 * Advanced Data Table - Enterprise-grade table component
 * Features: sorting, filtering, pagination, selection, export
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  Copy,
  RefreshCcw,
  Settings,
  Columns,
  FileText,
  FileSpreadsheet,
  FileJson
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  cell?: (row: T, value: unknown) => React.ReactNode;
  hidden?: boolean;
}

export interface AdvancedDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  onExport?: (format: "csv" | "xlsx" | "json" | "pdf") => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  showSelection?: boolean;
  showActions?: boolean;
  showExport?: boolean;
  showColumnToggle?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  stickyHeader?: boolean;
  maxHeight?: string;
  rowKey?: keyof T;
  searchPlaceholder?: string;
}

export function AdvancedDataTable<T extends Record<string, unknown>>({
  data,
  columns: initialColumns,
  onRowClick,
  onRowSelect,
  onEdit,
  onDelete,
  onView,
  onExport,
  onRefresh,
  isLoading = false,
  emptyMessage = "Nenhum registro encontrado",
  showSearch = true,
  showPagination = true,
  showSelection = false,
  showActions = true,
  showExport = true,
  showColumnToggle = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  stickyHeader = true,
  maxHeight = "600px",
  rowKey = "id" as keyof T,
  searchPlaceholder = "Buscar...",
}: AdvancedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<unknown>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(initialColumns.filter(c => !c.hidden).map(c => c.id))
  );

  const columns = useMemo(
    () => initialColumns.filter(c => visibleColumns.has(c.id)),
    [initialColumns, visibleColumns]
  );

  // Get cell value
  const getCellValue = useCallback((row: T, column: ColumnDef<T>): unknown => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor];
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((row) =>
      columns.some((column) => {
        const value = getCellValue(row, column);
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns, getCellValue]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    const column = columns.find((c) => c.id === sortColumn);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getCellValue(a, column);
      const bValue = getCellValue(b, column);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = String(aValue).localeCompare(String(bValue), "pt-BR", {
        numeric: true,
      });

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns, getCellValue]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((row) => row[rowKey])));
    }
    onRowSelect?.(
      selectedRows.size === paginatedData.length
        ? []
        : paginatedData
    );
  };

  const handleSelectRow = (row: T) => {
    const key = row[rowKey];
    const newSelected = new Set(selectedRows);
    
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    
    setSelectedRows(newSelected);
    onRowSelect?.(data.filter((r) => newSelected.has(r[rowKey])));
  };

  // Toggle column visibility
  const toggleColumn = (columnId: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnId)) {
      newVisible.delete(columnId);
    } else {
      newVisible.add(columnId);
    }
    setVisibleColumns(newVisible);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {showSearch && (
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCcw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          )}

          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns className="h-4 w-4 mr-2" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Colunas Visíveis</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {initialColumns.map((column) => (
                  <DropdownMenuItem
                    key={column.id}
                    onClick={() => toggleColumn(column.id)}
                  >
                    <Checkbox
                      checked={visibleColumns.has(column.id)}
                      className="mr-2"
                    />
                    {column.header}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showExport && onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Formato</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onExport("csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("xlsx")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel (XLSX)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("json")}>
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("pdf")}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Selection info */}
      {showSelection && selectedRows.size > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
          <Badge variant="secondary">{selectedRows.size} selecionado(s)</Badge>
          <Button variant="ghost" size="sm" onClick={() => setSelectedRows(new Set())}>
            Limpar seleção
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <ScrollArea style={{ maxHeight }} className="w-full">
          <Table>
            <TableHeader className={cn(stickyHeader && "sticky top-0 bg-background z-10")}>
              <TableRow>
                {showSelection && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        paginatedData.length > 0 &&
                        selectedRows.size === paginatedData.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    style={{ width: column.width }}
                    className={cn(
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      column.sortable && "cursor-pointer select-none hover:bg-muted/50"
                    )}
                    onClick={() => column.sortable && handleSort(column.id)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && (
                        <span className="text-muted-foreground">
                          {sortColumn === column.id ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {showActions && (
                  <TableHead className="w-12 text-center">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (showSelection ? 1 : 0) + (showActions ? 1 : 0)}
                    className="h-40"
                  >
                    <div className="flex items-center justify-center">
                      <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (showSelection ? 1 : 0) + (showActions ? 1 : 0)}
                    className="h-40 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={String(row[rowKey]) || rowIndex}
                    className={cn(
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                      selectedRows.has(row[rowKey]) && "bg-muted/30"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {showSelection && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedRows.has(row[rowKey])}
                          onCheckedChange={() => handleSelectRow(row)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = getCellValue(row, column);
                      return (
                        <TableCell
                          key={column.id}
                          className={cn(
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right"
                          )}
                        >
                          {column.cell ? column.cell(row, value) : String(value ?? "")}
                        </TableCell>
                      );
                    })}
                    {showActions && (
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Mais opções" title="Mais opções">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onView && (
                              <DropdownMenuItem onClick={() => onView(row)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(row)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(row))}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar
                            </DropdownMenuItem>
                            {onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => onDelete(row)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Mostrando</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>de {sortedData.length} registros</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label="Primeira página"
              title="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-4">
              Página {currentPage} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              aria-label="Próxima página"
              title="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
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

export default AdvancedDataTable;
