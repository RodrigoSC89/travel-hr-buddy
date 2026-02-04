/**
 * Quick Filters - Filtros rápidos contextuais
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { 
  Filter, X, Calendar as CalendarIcon, Search,
  type LucideIcon 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  id: string;
  type: "select" | "date" | "dateRange" | "search";
  label: string;
  placeholder?: string;
  options?: FilterOption[];
  icon?: LucideIcon;
}

export interface FilterValues {
  [key: string]: string | Date | { from: Date; to: Date } | undefined;
}

interface QuickFiltersProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onClear?: () => void;
  className?: string;
}

export function QuickFilters({
  filters,
  values,
  onChange,
  onClear,
  className
}: QuickFiltersProps) {
  const activeFiltersCount = Object.values(values).filter(Boolean).length;

  const handleChange = (filterId: string, value: FilterValues[string]) => {
    onChange({ ...values, [filterId]: value });
  };

  const handleClear = () => {
    const clearedValues: FilterValues = {};
    filters.forEach(f => { clearedValues[f.id] = undefined; });
    onChange(clearedValues);
    onClear?.();
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Filtros</span>
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5">
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      {filters.map((filter) => {
        const Icon = filter.icon;

        switch (filter.type) {
          case "select":
            return (
              <Select
                key={filter.id}
                value={values[filter.id] as string || ""}
                onValueChange={(value) => handleChange(filter.id, value || undefined)}
              >
                <SelectTrigger className="w-[150px] h-9">
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  <SelectValue placeholder={filter.placeholder || filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center justify-between w-full">
                        {option.label}
                        {option.count !== undefined && (
                          <Badge variant="outline" className="ml-2 h-5 px-1">
                            {option.count}
                          </Badge>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );

          case "date":
            return (
              <Popover key={filter.id}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {values[filter.id] ? (
                      format(values[filter.id] as Date, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span className="text-muted-foreground">{filter.placeholder || filter.label}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={values[filter.id] as Date}
                    onSelect={(date) => handleChange(filter.id, date)}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            );

          case "search":
            return (
              <div key={filter.id} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={filter.placeholder || filter.label}
                  value={values[filter.id] as string || ""}
                  onChange={(e) => handleChange(filter.id, e.target.value || undefined)}
                  className="pl-9 h-9 w-[180px]"
                />
              </div>
            );

          default:
            return null;
        }
      })}

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-9 gap-1 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
}
