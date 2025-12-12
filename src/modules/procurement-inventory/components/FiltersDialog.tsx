import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Filter,
  Calendar,
  Building2,
  Package,
  DollarSign,
  Tag,
  X,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

interface FiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FiltersDialog({ open, onOpenChange }: FiltersDialogProps) {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    categories: [] as string[],
    suppliers: [] as string[],
    status: [] as string[],
    minValue: "",
    maxValue: "",
    priority: [] as string[],
  });

  const categories = ["Manutenção", "Consumíveis", "Segurança", "DP System", "Outros"];
  const suppliers = ["HidroMar", "NavTech", "PetroLub", "SafetyFirst", "SealMaster"];
  const statusOptions = ["Pendente", "Aprovado", "Em Trânsito", "Entregue", "Atrasado"];
  const priorities = ["Urgente", "Alta", "Média", "Baixa"];

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const handleApply = () => {
    toast.success("Filtros aplicados!");
    onOpenChange(false);
  };

  const handleClear = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      categories: [],
      suppliers: [],
      status: [],
      minValue: "",
      maxValue: "",
      priority: [],
    };
    toast.info("Filtros limpos");
  };

  const activeFiltersCount = [
    filters.dateFrom || filters.dateTo ? 1 : 0,
    filters.categories.length > 0 ? 1 : 0,
    filters.suppliers.length > 0 ? 1 : 0,
    filters.status.length > 0 ? 1 : 0,
    filters.minValue || filters.maxValue ? 1 : 0,
    filters.priority.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avançados
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount} ativos</Badge>
              )}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">De</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={handleChange}))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Até</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={handleChange}))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categorias
            </Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant={filters.categories.includes(cat) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={handleSetFilters}))}
                >
                  {cat}
                  {filters.categories.includes(cat) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Suppliers */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Fornecedores
            </Label>
            <div className="flex flex-wrap gap-2">
              {suppliers.map((sup) => (
                <Badge
                  key={sup}
                  variant={filters.suppliers.includes(sup) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={handleSetFilters}))}
                >
                  {sup}
                  {filters.suppliers.includes(sup) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Status
            </Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <Badge
                  key={status}
                  variant={filters.status.includes(status) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={handleSetFilters}))}
                >
                  {status}
                  {filters.status.includes(status) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Value Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Faixa de Valor (R$)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Mínimo</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minValue}
                  onChange={handleChange}))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Máximo</Label>
                <Input
                  type="number"
                  placeholder="100000"
                  value={filters.maxValue}
                  onChange={handleChange}))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Priority */}
          <div className="space-y-3">
            <Label>Prioridade</Label>
            <div className="flex flex-wrap gap-2">
              {priorities.map((priority) => (
                <Badge
                  key={priority}
                  variant={filters.priority.includes(priority) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={handleSetFilters}))}
                >
                  {priority}
                  {filters.priority.includes(priority) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleonOpenChange}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
