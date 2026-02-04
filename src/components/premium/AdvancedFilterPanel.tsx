/**
 * AdvancedFilterPanel - Componente premium para filtros avançados
 */

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, X, ChevronDown, ChevronUp, Calendar as CalendarIcon, 
  Search, RotateCcw, Save, Sparkles, Check
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FilterField {
  id: string;
  label: string;
  type: "text" | "select" | "multiselect" | "date" | "daterange" | "number" | "boolean";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  [key: string]: any;
}

interface AdvancedFilterPanelProps {
  fields: FilterField[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onReset?: () => void;
  onSavePreset?: (name: string, values: FilterValue) => void;
  presets?: { name: string; values: FilterValue }[];
  showAISuggestion?: boolean;
  className?: string;
}

export function AdvancedFilterPanel({
  fields,
  values,
  onChange,
  onReset,
  onSavePreset,
  presets = [],
  showAISuggestion = false,
  className
}: AdvancedFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Count active filters
  React.useEffect(() => {
    const count = Object.entries(values).filter(([_, v]) => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "object" && v !== null) return Object.values(v).some(Boolean);
      return v !== undefined && v !== "" && v !== null;
    }).length;
    setActiveFiltersCount(count);
  }, [values]);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    onChange({ ...values, [fieldId]: value });
  }, [values, onChange]);

  const handleClearField = useCallback((fieldId: string) => {
    const newValues = { ...values };
    delete newValues[fieldId];
    onChange(newValues);
  }, [values, onChange]);

  const handleReset = useCallback(() => {
    onChange({});
    onReset?.();
    toast.success("Filtros limpos");
  }, [onChange, onReset]);

  const handleApplyPreset = useCallback((preset: { name: string; values: FilterValue }) => {
    onChange(preset.values);
    toast.success(`Preset "${preset.name}" aplicado`);
  }, [onChange]);

  const renderField = (field: FilterField) => {
    const value = values[field.id];

    switch (field.type) {
      case "text":
        return (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={field.placeholder || `Buscar ${field.label.toLowerCase()}...`}
              value={value || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className="pl-8"
            />
          </div>
        );

      case "select":
        return (
          <Select 
            value={value || ""} 
            onValueChange={(v) => handleFieldChange(field.id, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Selecionar..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            <ScrollArea className="h-[120px] border rounded-lg p-2">
              {field.options?.map((option) => {
                const isSelected = (value || []).includes(option.value);
                return (
                  <div key={option.value} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`${field.id}-${option.value}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const current = value || [];
                        const newValue = checked
                          ? [...current, option.value]
                          : current.filter((v: string) => v !== option.value);
                        handleFieldChange(field.id, newValue);
                      }}
                    />
                    <Label 
                      htmlFor={`${field.id}-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </ScrollArea>
            {value?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {value.map((v: string) => (
                  <Badge key={v} variant="secondary" className="gap-1">
                    {field.options?.find(o => o.value === v)?.label || v}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFieldChange(field.id, value.filter((x: string) => x !== v))}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP", { locale: ptBR }) : "Selecionar data..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleFieldChange(field.id, date?.toISOString())}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder || "0"}
            value={value || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value ? Number(e.target.value) : undefined)}
          />
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id} className="cursor-pointer">
              {field.placeholder || "Sim"}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Compact Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-5 w-5 p-0 justify-center">
              {activeFiltersCount}
            </Badge>
          )}
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Active Filter Badges */}
        <AnimatePresence>
          {Object.entries(values).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            const field = fields.find(f => f.id === key);
            if (!field) return null;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge variant="secondary" className="gap-1">
                  {field.label}:
                  <span className="font-normal">
                    {Array.isArray(value) 
                      ? `${value.length} selecionados` 
                      : typeof value === "object" && value !== null
                        ? "Período"
                        : String(value).substring(0, 20)}
                  </span>
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => handleClearField(key)} 
                  />
                </Badge>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-muted-foreground">
            <RotateCcw className="h-3 w-3" />
            Limpar
          </Button>
        )}

        {/* AI Suggestion */}
        {showAISuggestion && (
          <Button variant="ghost" size="sm" className="gap-1 text-purple-600 ml-auto">
            <Sparkles className="h-3 w-3" />
            Sugestão IA
          </Button>
        )}
      </div>

      {/* Expanded Filter Panel */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border rounded-lg p-4 bg-muted/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-medium">{field.label}</Label>
                  {renderField(field)}
                </div>
              ))}
            </div>

            {/* Presets */}
            {presets.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Label className="text-sm font-medium mb-2 block">Presets Salvos</Label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyPreset(preset)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default AdvancedFilterPanel;
