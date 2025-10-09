import React, { useState, useEffect } from "react";
import { Search, Filter, SortAsc, SortDesc, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters?: {
    categories?: string[];
    status?: string[];
    dateRange?: { start: Date; end: Date };
  };
  onFiltersChange?: (filters: any) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, order: "asc" | "desc") => void;
  placeholder?: string;
  enabledFilters?: ("categories" | "status" | "dateRange")[];
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filters = {},
  onFiltersChange,
  sortBy = "name",
  sortOrder = "asc",
  onSortChange,
  placeholder = "Buscar...",
  enabledFilters = ["categories", "status"]
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = Object.values(localFilters).filter(Boolean).length;

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const toggleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    onSortChange?.(sortBy, newOrder);
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-background border rounded-lg">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onSearchChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFilterCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros</h4>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </Button>
              )}
            </div>

            {/* Categories Filter */}
            {enabledFilters.includes("categories") && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categorias</Label>
                <div className="space-y-2">
                  {["RH", "Financeiro", "Vendas", "Marketing", "TI"].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={localFilters.categories?.includes(category) || false}
                        onCheckedChange={(checked) => {
                          const current = localFilters.categories || [];
                          const updated = checked
                            ? [...current, category]
                            : current.filter(c => c !== category);
                          handleFilterChange("categories", updated);
                        }}
                      />
                      <Label htmlFor={category} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Filter */}
            {enabledFilters.includes("status") && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <div className="space-y-2">
                  {["Ativo", "Inativo", "Pendente", "Concluído"].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={status}
                        checked={localFilters.status?.includes(status) || false}
                        onCheckedChange={(checked) => {
                          const current = localFilters.status || [];
                          const updated = checked
                            ? [...current, status]
                            : current.filter(s => s !== status);
                          handleFilterChange("status", updated);
                        }}
                      />
                      <Label htmlFor={status} className="text-sm">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort */}
      <Button variant="outline" onClick={toggleSort}>
        {sortOrder === "asc" ? (
          <SortAsc className="h-4 w-4 mr-2" />
        ) : (
          <SortDesc className="h-4 w-4 mr-2" />
        )}
        Ordenar
      </Button>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1 max-w-xs overflow-x-auto">
          {localFilters.categories?.map((category) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => {
                  const updated = localFilters.categories?.filter(c => c !== category) || [];
                  handleFilterChange("categories", updated);
                }}
              />
            </Badge>
          ))}
          {localFilters.status?.map((status) => (
            <Badge key={status} variant="outline" className="text-xs">
              {status}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => {
                  const updated = localFilters.status?.filter(s => s !== status) || [];
                  handleFilterChange("status", updated);
                }}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};