/**
 * Advanced Filter Component
 * Reusable filter system with multiple filter types
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export type FilterType = 'text' | 'select' | 'date' | 'number' | 'dateRange';

export interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export interface FilterValues {
  [key: string]: string | number | { start?: string; end?: string } | undefined;
}

interface AdvancedFilterProps {
  filters: FilterConfig[];
  values: FilterValues;
  onValuesChange: (values: FilterValues) => void;
  onApply?: () => void;
  onClear?: () => void;
  className?: string;
  compact?: boolean;
}

export function AdvancedFilter({
  filters,
  values,
  onValuesChange,
  onApply,
  onClear,
  className,
  compact = false,
}: AdvancedFilterProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = Object.keys(values).filter(
    (key) => values[key] !== undefined && values[key] !== ''
  ).length;

  const handleFilterChange = useCallback(
    (filterId: string, value: string | number | undefined) => {
      onValuesChange({
        ...values,
        [filterId]: value === '' ? undefined : value,
      });
    },
    [values, onValuesChange]
  );

  const handleDateRangeChange = useCallback(
    (filterId: string, field: 'start' | 'end', value: string) => {
      const currentRange = (values[filterId] as { start?: string; end?: string }) || {};
      onValuesChange({
        ...values,
        [filterId]: {
          ...currentRange,
          [field]: value || undefined,
        },
      });
    },
    [values, onValuesChange]
  );

  const handleClear = useCallback(() => {
    const clearedValues: FilterValues = {};
    filters.forEach((f) => {
      clearedValues[f.id] = undefined;
    });
    onValuesChange(clearedValues);
    onClear?.();
  }, [filters, onValuesChange, onClear]);

  const handleApply = useCallback(() => {
    onApply?.();
    if (compact) {
      setIsOpen(false);
    }
  }, [onApply, compact]);

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.id];

    switch (filter.type) {
      case 'text':
        return (
          <Input
            value={(value as string) || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={filter.placeholder || `${t('common.search')}...`}
            className="h-9"
          />
        );

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(v) => handleFilterChange(filter.id, v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={filter.placeholder || t('common.select')} />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="">
                {t('common.all')}
              </SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="h-9"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.valueAsNumber || undefined)}
            placeholder={filter.placeholder}
            min={filter.min}
            max={filter.max}
            className="h-9"
          />
        );

      case 'dateRange':
        const range = (value as { start?: string; end?: string }) || {};
        return (
          <div className="flex gap-2">
            <Input
              type="date"
              value={range.start || ''}
              onChange={(e) => handleDateRangeChange(filter.id, 'start', e.target.value)}
              className="h-9"
            />
            <span className="flex items-center text-muted-foreground">-</span>
            <Input
              type="date"
              value={range.end || ''}
              onChange={(e) => handleDateRangeChange(filter.id, 'end', e.target.value)}
              className="h-9"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (compact) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            {t('common.filter')}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      {filter.label}
                    </Label>
                    {renderFilter(filter)}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  {t('common.clear', 'Clear')}
                </Button>
                <Button size="sm" onClick={handleApply}>
                  {t('common.filter', 'Apply')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('common.filter')}</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
              {activeFilterCount} {t('common.active', 'active')}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            {t('common.clear', 'Clear all')}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filters.map((filter) => (
          <div key={filter.id} className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {filter.label}
            </Label>
            {renderFilter(filter)}
          </div>
        ))}
      </div>

      {onApply && (
        <div className="flex justify-end">
          <Button onClick={handleApply} size="sm">
            {t('common.filter', 'Apply Filters')}
          </Button>
        </div>
      )}
    </div>
  );
}

export default AdvancedFilter;
