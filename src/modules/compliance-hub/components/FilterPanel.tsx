/**
 * Compliance Filter Panel Component
 * Painel de filtros avançados para o módulo de conformidade
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon, 
  Search,
  RotateCcw 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface ComplianceFilters {
  search: string;
  status: string[];
  auditType: string[];
  vessel: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  severity: string[];
  regulation: string;
}

interface FilterPanelProps {
  filters: ComplianceFilters;
  onFilterChange: (filters: ComplianceFilters) => void;
  onClearFilters: () => void;
  vessels: { id: string; name: string }[];
  regulations: { id: string; name: string }[];
}

export function FilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  vessels,
  regulations,
}: FilterPanelProps) {
  const statusOptions = [
    { value: "compliant", label: "Conforme" },
    { value: "non-compliant", label: "Não Conforme" },
    { value: "partial", label: "Parcial" },
    { value: "pending", label: "Pendente" },
  ];

  const auditTypeOptions = [
    { value: "internal", label: "Interna" },
    { value: "external", label: "Externa" },
    { value: "flag-state", label: "Bandeira" },
    { value: "class", label: "Classificadora" },
    { value: "psc", label: "PSC" },
  ];

  const severityOptions = [
    { value: "critical", label: "Crítico" },
    { value: "major", label: "Maior" },
    { value: "minor", label: "Menor" },
    { value: "observation", label: "Observação" },
  ];

  const toggleArrayFilter = (
    key: "status" | "auditType" | "severity",
    value: string
  ) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    onFilterChange({ ...filters, [key]: newArray });
  };

  const activeFiltersCount = [
    filters.search ? 1 : 0,
    filters.status.length,
    filters.auditType.length,
    filters.vessel ? 1 : 0,
    filters.dateRange.from || filters.dateRange.to ? 1 : 0,
    filters.severity.length,
    filters.regulation ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <span className="font-medium">Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} ativo(s)
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-sm">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        {/* Vessel */}
        <div className="space-y-2">
          <Label className="text-sm">Embarcação</Label>
          <Select
            value={filters.vessel}
            onValueChange={(value) => onFilterChange({ ...filters, vessel: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {vessels.map((vessel) => (
                <SelectItem key={vessel.id} value={vessel.id}>
                  {vessel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Regulation */}
        <div className="space-y-2">
          <Label className="text-sm">Regulamento</Label>
          <Select
            value={filters.regulation}
            onValueChange={(value) => onFilterChange({ ...filters, regulation: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {regulations.map((reg) => (
                <SelectItem key={reg.id} value={reg.id}>
                  {reg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm">Período</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "dd/MM", { locale: ptBR })} -{" "}
                      {format(filters.dateRange.to, "dd/MM", { locale: ptBR })}
                    </>
                  ) : (
                    format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  )
                ) : (
                  "Selecionar período"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to,
                }}
                onSelect={(range) =>
                  onFilterChange({
                    ...filters,
                    dateRange: { from: range?.from, to: range?.to },
                  })
                }
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Separator />

      {/* Status Filters */}
      <div className="space-y-2">
        <Label className="text-sm">Status de Conformidade</Label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Badge
              key={option.value}
              variant={filters.status.includes(option.value) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleArrayFilter("status", option.value)}
            >
              {option.label}
              {filters.status.includes(option.value) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Audit Type Filters */}
      <div className="space-y-2">
        <Label className="text-sm">Tipo de Auditoria</Label>
        <div className="flex flex-wrap gap-2">
          {auditTypeOptions.map((option) => (
            <Badge
              key={option.value}
              variant={filters.auditType.includes(option.value) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleArrayFilter("auditType", option.value)}
            >
              {option.label}
              {filters.auditType.includes(option.value) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Severity Filters */}
      <div className="space-y-2">
        <Label className="text-sm">Severidade de Findings</Label>
        <div className="flex flex-wrap gap-2">
          {severityOptions.map((option) => (
            <Badge
              key={option.value}
              variant={filters.severity.includes(option.value) ? "default" : "outline"}
              className={cn(
                "cursor-pointer",
                option.value === "critical" && filters.severity.includes(option.value) && "bg-red-500",
                option.value === "major" && filters.severity.includes(option.value) && "bg-orange-500"
              )}
              onClick={() => toggleArrayFilter("severity", option.value)}
            >
              {option.label}
              {filters.severity.includes(option.value) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
