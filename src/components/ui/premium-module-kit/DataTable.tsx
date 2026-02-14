/**
 * Data Table - Tabela de dados com ordenação, filtros e ações
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Filter, MoreVertical, ChevronUp, ChevronDown,
  ArrowUpDown, Download, type LucideIcon
} from "lucide-react";

export interface TableColumn<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface RowAction<T> {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  hidden?: (row: T) => boolean;
}

interface DataTableProps<T extends { id: string }> {
  title?: string;
  icon?: LucideIcon;
  columns: TableColumn<T>[];
  data: T[];
  actions?: RowAction<T>[];
  onExport?: () => void;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T extends { id: string }>({
  title,
  icon: Icon,
  columns,
  data,
  actions = [],
  onExport,
  selectable = false,
  onSelectionChange,
  emptyMessage = "Nenhum registro encontrado",
  loading = false
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Sorting
    if (sortColumn) {
      const column = columns.find((c) => c.id === sortColumn);
      if (column) {
        result.sort((a, b) => {
          const accessor = column.accessor;
          const aVal = typeof accessor === "function" ? accessor(a) : a[accessor];
          const bVal = typeof accessor === "function" ? accessor(b) : b[accessor];
          
          const comparison = String(aVal).localeCompare(String(bVal));
          return sortDirection === "asc" ? comparison : -comparison;
        });
      }
    }

    return result;
  }, [data, search, sortColumn, sortDirection, columns]);

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(filteredData.map((row) => row.id)));
    } else {
      setSelected(new Set());
    }
    onSelectionChange?.(checked ? filteredData : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selected);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelected(newSelected);
    onSelectionChange?.(data.filter((row) => newSelected.has(row.id)));
  };

  const getCellValue = (row: T, column: TableColumn<T>): React.ReactNode => {
    const accessor = column.accessor;
    if (typeof accessor === "function") {
      return accessor(row);
    }
    const value = row[accessor];
    return value as React.ReactNode;
  };

  return (
    <Card>
      {(title || onExport) && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {Icon && <Icon className="h-5 w-5" />}
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={selected.size === filteredData.length && filteredData.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={`px-4 py-3 text-${column.align || "left"} text-sm font-medium text-muted-foreground`}
                    style={{ width: column.width }}
                  >
                    {column.sortable ? (
                      <button
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => handleSort(column.id)}
                      >
                        {column.header}
                        {sortColumn === column.id ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="w-12 px-4 py-3"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length ? 1 : 0)} className="px-4 py-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length ? 1 : 0)} className="px-4 py-8 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                    {selectable && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selected.has(row.id)}
                          onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={`px-4 py-3 text-${column.align || "left"} text-sm`}
                      >
                        {getCellValue(row, column)}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ações da linha" title="Ações">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions
                              .filter((action) => !action.hidden?.(row))
                              .map((action) => (
                                <DropdownMenuItem
                                  key={action.id}
                                  onClick={() => action.onClick(row)}
                                  className={action.variant === "destructive" ? "text-destructive" : ""}
                                >
                                  <action.icon className="h-4 w-4 mr-2" />
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 0 && (
          <div className="px-4 py-3 border-t bg-muted/20">
            <p className="text-sm text-muted-foreground">
              {filteredData.length} registro{filteredData.length !== 1 ? "s" : ""}
              {search && ` (filtrado de ${data.length})`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
