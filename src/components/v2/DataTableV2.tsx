/**
 * DataTableV2 - Tabela de Dados V2
 * Tabela com filtros, paginação, busca e ações
 */

import React, { useState, useMemo } from "react";
import { LucideIcon, Search, Filter, ChevronLeft, ChevronRight, Download, RefreshCw, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface Action<T> {
  label: string;
  icon?: LucideIcon;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
}

interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface DataTableV2Props<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  title?: string;
  icon?: LucideIcon;
  filters?: FilterOption[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  onRefresh?: () => void;
  onExport?: () => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTableV2<T extends { id: string | number }>({
  data,
  columns,
  actions,
  title,
  icon: Icon,
  filters = [],
  searchable = true,
  searchPlaceholder = "Buscar...",
  pageSize = 10,
  onRefresh,
  onExport,
  loading = false,
  emptyMessage = "Nenhum registro encontrado",
  className,
}: DataTableV2Props<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter(item => String((item as any)[key]) === value);
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = String((a as any)[sortConfig.key]);
        const bVal = String((b as any)[sortConfig.key]);
        return sortConfig.direction === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      });
    }

    return result;
  }, [data, search, filterValues, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === "asc" 
          ? { key, direction: "desc" } 
          : null;
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || Icon) && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-primary" />}
              {title}
              <Badge variant="secondary" className="ml-2">
                {filteredData.length} registros
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              )}
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {searchable && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
          )}
          
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterValues[filter.key] || "all"}
              onValueChange={(value) => {
                setFilterValues(prev => ({ ...prev, [filter.key]: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((col) => (
                  <TableHead 
                    key={String(col.key)} 
                    className={cn(
                      col.sortable && "cursor-pointer hover:bg-muted",
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && sortConfig?.key === col.key && (
                        <span className="text-xs">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions && actions.length > 0 && (
                  <TableHead className="w-[80px] text-right">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (actions ? 1 : 0)} 
                    className="text-center py-8 text-muted-foreground"
                  >
                    {loading ? "Carregando..." : emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    {columns.map((col) => (
                      <TableCell key={String(col.key)} className={col.className}>
                        {col.render 
                          ? col.render(item) 
                          : String((item as any)[col.key] ?? "-")
                        }
                      </TableCell>
                    ))}
                    {actions && actions.length > 0 && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, idx) => (
                              <DropdownMenuItem
                                key={idx}
                                onClick={() => action.onClick(item)}
                                className={action.variant === "destructive" ? "text-destructive" : ""}
                              >
                                {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DataTableV2;
