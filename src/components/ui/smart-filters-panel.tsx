/**
 * Smart Filters Panel - Advanced filtering component
 * Features: multiple filter types, presets, save/load, real-time updates
 */

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  Trash2,
  Calendar as CalendarIcon,
  Search,
  Sliders,
  Tag,
  CheckSquare,
  Hash,
  Clock,
  Bookmark,
  BookmarkCheck,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type FilterType = 
  | "text" 
  | "select" 
  | "multiselect" 
  | "date" 
  | "daterange" 
  | "number" 
  | "numberrange" 
  | "boolean" 
  | "tags";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: unknown;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export interface FilterValue {
  [key: string]: unknown;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterValue;
  isDefault?: boolean;
}

export interface SmartFiltersPanelProps {
  filters: FilterConfig[];
  values: FilterValue;
  onChange: (values: FilterValue) => void;
  onReset?: () => void;
  onSavePreset?: (name: string, values: FilterValue) => void;
  presets?: FilterPreset[];
  onApplyPreset?: (preset: FilterPreset) => void;
  onDeletePreset?: (presetId: string) => void;
  showPresets?: boolean;
  showActiveFilters?: boolean;
  variant?: "inline" | "sidebar" | "sheet";
  className?: string;
}

// Individual filter components
const TextFilter: React.FC<{
  config: FilterConfig;
  value: string;
  onChange: (value: string) => void;
}> = ({ config, value, onChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{config.label}</Label>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={config.placeholder || `Buscar ${config.label.toLowerCase()}...`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  </div>
);

const SelectFilter: React.FC<{
  config: FilterConfig;
  value: string;
  onChange: (value: string) => void;
}> = ({ config, value, onChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{config.label}</Label>
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={config.placeholder || "Selecione..."} />
      </SelectTrigger>
      <SelectContent>
        {config.options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {option.icon}
              <span>{option.label}</span>
              {option.count !== undefined && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {option.count}
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const MultiSelectFilter: React.FC<{
  config: FilterConfig;
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ config, value = [], onChange }) => {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{config.label}</Label>
      <ScrollArea className="h-32 border rounded-lg p-2">
        <div className="space-y-2">
          {config.options?.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                checked={value.includes(option.value)}
                onCheckedChange={() => toggleOption(option.value)}
              />
              <span className="text-sm flex-1">{option.label}</span>
              {option.count !== undefined && (
                <Badge variant="outline" className="text-xs">
                  {option.count}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const DateFilter: React.FC<{
  config: FilterConfig;
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
}> = ({ config, value, onChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{config.label}</Label>
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
          {value ? format(value, "PPP", { locale: ptBR }) : "Selecione uma data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  </div>
);

const DateRangeFilter: React.FC<{
  config: FilterConfig;
  value: { from?: Date; to?: Date };
  onChange: (value: { from?: Date; to?: Date }) => void;
}> = ({ config, value = {}, onChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{config.label}</Label>
    <div className="grid grid-cols-2 gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal text-xs">
            <CalendarIcon className="mr-1 h-3 w-3" />
            {value.from ? format(value.from, "dd/MM/yy") : "De"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value.from}
            onSelect={(date) => onChange({ ...value, from: date })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal text-xs">
            <CalendarIcon className="mr-1 h-3 w-3" />
            {value.to ? format(value.to, "dd/MM/yy") : "Até"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value.to}
            onSelect={(date) => onChange({ ...value, to: date })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  </div>
);

const NumberRangeFilter: React.FC<{
  config: FilterConfig;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}> = ({ config, value, onChange }) => {
  const min = config.min ?? 0;
  const max = config.max ?? 100;
  const currentValue = value || [min, max];

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{config.label}</Label>
      <Slider
        value={currentValue}
        onValueChange={(v) => onChange(v as [number, number])}
        min={min}
        max={max}
        step={config.step || 1}
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{currentValue[0]}</span>
        <span>{currentValue[1]}</span>
      </div>
    </div>
  );
};

const BooleanFilter: React.FC<{
  config: FilterConfig;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
}> = ({ config, value, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <Label className="text-sm font-medium">{config.label}</Label>
    <Checkbox
      checked={value === true}
      onCheckedChange={(checked) => onChange(checked ? true : undefined)}
    />
  </div>
);

const TagsFilter: React.FC<{
  config: FilterConfig;
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ config, value = [], onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((v) => v !== tag));
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{config.label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Adicionar tag..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
        />
        <Button size="icon" variant="outline" onClick={addTag} aria-label="Adicionar tag" title="Adicionar">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

// Main component
export function SmartFiltersPanel({
  filters,
  values,
  onChange,
  onReset,
  onSavePreset,
  presets = [],
  onApplyPreset,
  onDeletePreset,
  showPresets = true,
  showActiveFilters = true,
  variant = "inline",
  className,
}: SmartFiltersPanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(filters.filter((f) => f.defaultOpen !== false).map((f) => f.id))
  );
  const [presetName, setPresetName] = useState("");
  const [showSavePreset, setShowSavePreset] = useState(false);

  const updateFilter = useCallback(
    (filterId: string, value: unknown) => {
      onChange({ ...values, [filterId]: value });
    },
    [values, onChange]
  );

  const clearFilter = useCallback(
    (filterId: string) => {
      const newValues = { ...values };
      delete newValues[filterId];
      onChange(newValues);
    },
    [values, onChange]
  );

  const activeFiltersCount = useMemo(
    () => Object.keys(values).filter((key) => values[key] !== undefined && values[key] !== "").length,
    [values]
  );

  const toggleSection = (sectionId: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(sectionId)) {
      newOpen.delete(sectionId);
    } else {
      newOpen.add(sectionId);
    }
    setOpenSections(newOpen);
  };

  const renderFilter = (config: FilterConfig) => {
    const value = values[config.id];

    switch (config.type) {
      case "text":
        return <TextFilter config={config} value={value as string} onChange={(v) => updateFilter(config.id, v)} />;
      case "select":
        return <SelectFilter config={config} value={value as string} onChange={(v) => updateFilter(config.id, v)} />;
      case "multiselect":
        return <MultiSelectFilter config={config} value={value as string[]} onChange={(v) => updateFilter(config.id, v)} />;
      case "date":
        return <DateFilter config={config} value={value as Date | undefined} onChange={(v) => updateFilter(config.id, v)} />;
      case "daterange":
        return <DateRangeFilter config={config} value={value as { from?: Date; to?: Date }} onChange={(v) => updateFilter(config.id, v)} />;
      case "numberrange":
        return <NumberRangeFilter config={config} value={value as [number, number]} onChange={(v) => updateFilter(config.id, v)} />;
      case "boolean":
        return <BooleanFilter config={config} value={value as boolean | undefined} onChange={(v) => updateFilter(config.id, v)} />;
      case "tags":
        return <TagsFilter config={config} value={value as string[]} onChange={(v) => updateFilter(config.id, v)} />;
      default:
        return null;
    }
  };

  const filtersContent = (
    <div className="space-y-4">
      {/* Presets */}
      {showPresets && presets.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Filtros Salvos
          </Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Badge
                key={preset.id}
                variant="outline"
                className="cursor-pointer hover:bg-muted gap-1"
                onClick={() => onApplyPreset?.(preset)}
              >
                <BookmarkCheck className="h-3 w-3" />
                {preset.name}
                {onDeletePreset && (
                  <X
                    className="h-3 w-3 ml-1 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePreset(preset.id);
                    }}
                  />
                )}
              </Badge>
            ))}
          </div>
          <Separator />
        </div>
      )}

      {/* Active filters */}
      {showActiveFilters && activeFiltersCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Filtros Ativos ({activeFiltersCount})
            </Label>
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(values).map(([key, val]) => {
              if (val === undefined || val === "") return null;
              const config = filters.find((f) => f.id === key);
              if (!config) return null;

              let displayValue = String(val);
              if (Array.isArray(val)) {
                displayValue = val.length > 2 ? `${val.length} selecionados` : val.join(", ");
              }

              return (
                <Badge key={key} variant="secondary" className="gap-1 text-xs">
                  {config.label}: {displayValue}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearFilter(key)}
                  />
                </Badge>
              );
            })}
          </div>
          <Separator />
        </div>
      )}

      {/* Filter sections */}
      {filters.map((config) => {
        if (config.collapsible) {
          return (
            <Collapsible
              key={config.id}
              open={openSections.has(config.id)}
              onOpenChange={() => toggleSection(config.id)}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                  <span className="text-sm font-medium">{config.label}</span>
                  {openSections.has(config.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                {renderFilter(config)}
              </CollapsibleContent>
            </Collapsible>
          );
        }

        return <div key={config.id}>{renderFilter(config)}</div>;
      })}

      {/* Save preset */}
      {onSavePreset && (
        <>
          <Separator />
          {showSavePreset ? (
            <div className="space-y-2">
              <Input
                placeholder="Nome do filtro..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (presetName.trim()) {
                      onSavePreset(presetName.trim(), values);
                      setPresetName("");
                      setShowSavePreset(false);
                    }
                  }}
                >
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSavePreset(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSavePreset(true)}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Filtro
            </Button>
          )}
        </>
      )}
    </div>
  );

  if (variant === "sheet") {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className={className}>
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              Filtros Avançados
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-120px)] pr-4 mt-4">
            {filtersContent}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  if (variant === "sidebar") {
    return (
      <Card className={cn("w-72", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sliders className="h-5 w-5" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-250px)]">
            {filtersContent}
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  // Inline variant
  return (
    <div className={cn("p-4 border rounded-lg bg-muted/30", className)}>
      {filtersContent}
    </div>
  );
}

export default SmartFiltersPanel;
