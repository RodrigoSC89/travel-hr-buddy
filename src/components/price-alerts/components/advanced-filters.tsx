import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Search,
  Filter,
  X,
  CalendarIcon,
  DollarSign,
  Tag,
  TrendingDown,
  Store,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface FilterOptions {
  search: string;
  category: string[];
  store: string[];
  priceRange: [number, number];
  discountRange: [number, number];
  status: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
  stores: string[];
  maxPrice: number;
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  stores,
  maxPrice,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);

  const statusOptions = [
    { value: "active", label: "Ativo", color: "bg-green-500" },
    { value: "inactive", label: "Inativo", color: "bg-gray-500" },
    { value: "triggered", label: "Acionado", color: "bg-blue-500" },
  ];

  const sortOptions = [
    { value: "created_at", label: "Data de Criação" },
    { value: "product_name", label: "Nome do Produto" },
    { value: "current_price", label: "Preço Atual" },
    { value: "target_price", label: "Preço Meta" },
    { value: "discount_percentage", label: "Desconto" },
    { value: "last_checked_at", label: "Última Verificação" },
  ];

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...tempFilters, [key]: value };
    setTempFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setIsExpanded(false);
  };

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      search: "",
      category: [],
      store: [],
      priceRange: [0, maxPrice],
      discountRange: [0, 100],
      status: [],
      dateRange: {},
      sortBy: "created_at",
      sortOrder: "desc",
    };
    setTempFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category.length > 0) count++;
    if (filters.store.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++;
    if (filters.discountRange[0] > 0 || filters.discountRange[1] < 100) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Barra de Busca e Controles Principais */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            value={tempFilters.search}
            onChange={e => updateFilter("search", e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyFilters()}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          <Select
            value={`${tempFilters.sortBy}-${tempFilters.sortOrder}`}
            onValueChange={value => {
              const [sortBy, sortOrder] = value.split("-");
              updateFilter("sortBy", sortBy);
              updateFilter("sortOrder", sortOrder);
              onFiltersChange({ ...tempFilters, sortBy, sortOrder: sortOrder as "asc" | "desc" });
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <React.Fragment key={option.value}>
                  <SelectItem value={`${option.value}-desc`}>{option.label} (Z-A)</SelectItem>
                  <SelectItem value={`${option.value}-asc`}>{option.label} (A-Z)</SelectItem>
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros Avançados */}
      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filtros Avançados</span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Categorias */}
            {categories.length > 0 && (
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4" />
                  Categorias
                </Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={tempFilters.category.includes(category)}
                        onCheckedChange={checked => {
                          if (checked) {
                            updateFilter("category", [...tempFilters.category, category]);
                          } else {
                            updateFilter(
                              "category",
                              tempFilters.category.filter(c => c !== category)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lojas */}
            {stores.length > 0 && (
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Store className="h-4 w-4" />
                  Lojas
                </Label>
                <div className="flex flex-wrap gap-2">
                  {stores.map(store => (
                    <div key={store} className="flex items-center space-x-2">
                      <Checkbox
                        id={`store-${store}`}
                        checked={tempFilters.store.includes(store)}
                        onCheckedChange={checked => {
                          if (checked) {
                            updateFilter("store", [...tempFilters.store, store]);
                          } else {
                            updateFilter(
                              "store",
                              tempFilters.store.filter(s => s !== store)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`store-${store}`} className="text-sm">
                        {store}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Faixa de Preço */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4" />
                Faixa de Preço: R$ {tempFilters.priceRange[0]} - R$ {tempFilters.priceRange[1]}
              </Label>
              <Slider
                value={tempFilters.priceRange}
                onValueChange={value => updateFilter("priceRange", value)}
                max={maxPrice}
                min={0}
                step={10}
                className="w-full"
              />
            </div>

            {/* Faixa de Desconto */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-4 w-4" />
                Desconto: {tempFilters.discountRange[0]}% - {tempFilters.discountRange[1]}%
              </Label>
              <Slider
                value={tempFilters.discountRange}
                onValueChange={value => updateFilter("discountRange", value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>

            {/* Status */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4" />
                Status
              </Label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(status => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={tempFilters.status.includes(status.value)}
                      onCheckedChange={checked => {
                        if (checked) {
                          updateFilter("status", [...tempFilters.status, status.value]);
                        } else {
                          updateFilter(
                            "status",
                            tempFilters.status.filter(s => s !== status.value)
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={`status-${status.value}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className={cn("w-2 h-2 rounded-full", status.color)} />
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Período */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <CalendarIcon className="h-4 w-4" />
                Período de Criação
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempFilters.dateRange.from
                        ? format(tempFilters.dateRange.from, "PPP", { locale: ptBR })
                        : "Data inicial"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempFilters.dateRange.from}
                      onSelect={date =>
                        updateFilter("dateRange", { ...tempFilters.dateRange, from: date })
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tempFilters.dateRange.to
                        ? format(tempFilters.dateRange.to, "PPP", { locale: ptBR })
                        : "Data final"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tempFilters.dateRange.to}
                      onSelect={date =>
                        updateFilter("dateRange", { ...tempFilters.dateRange, to: date })
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2 pt-4">
              <Button onClick={applyFilters} className="flex-1">
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={() => setIsExpanded(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags de Filtros Ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />"{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => {
                  updateFilter("search", "");
                  onFiltersChange({ ...filters, search: "" });
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.category.map(category => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {category}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => {
                  const newCategories = filters.category.filter(c => c !== category);
                  updateFilter("category", newCategories);
                  onFiltersChange({ ...filters, category: newCategories });
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {filters.store.map(store => (
            <Badge key={store} variant="secondary" className="flex items-center gap-1">
              <Store className="h-3 w-3" />
              {store}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => {
                  const newStores = filters.store.filter(s => s !== store);
                  updateFilter("store", newStores);
                  onFiltersChange({ ...filters, store: newStores });
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
