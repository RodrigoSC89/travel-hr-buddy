/**
 * useDashboardFilters Hook
 * Hook customizado para gerenciar filtros de dashboard
 * FASE B.2 - Consolidação de Dashboards
 */

import { useState, useCallback, useMemo } from "react";
import { FilterConfig } from "@/types/dashboard-config";

interface UseDashboardFiltersOptions {
  filters: FilterConfig[];
  onFilterChange?: (filters: Record<string, any>) => void;
}

export const useDashboardFilters = (options: UseDashboardFiltersOptions) => {
  const { filters, onFilterChange } = options;

  // Initialize filter values with defaults
  const initialValues = useMemo(() => {
    return filters.reduce((acc, filter) => {
      acc[filter.id] = filter.defaultValue;
      return acc;
    }, {} as Record<string, any>);
  }, [filters]);

  const [filterValues, setFilterValues] = useState<Record<string, any>>(initialValues);

  const setFilter = useCallback(
    (filterId: string, value: any) => {
      const newValues = { ...filterValues, [filterId]: value };
      setFilterValues(newValues);
      onFilterChange?.(newValues);
    },
    [filterValues, onFilterChange]
  );

  const resetFilters = useCallback(() => {
    setFilterValues(initialValues);
    onFilterChange?.(initialValues);
  }, [initialValues, onFilterChange]);

  const getFilterValue = useCallback(
    (filterId: string) => {
      return filterValues[filterId];
    },
    [filterValues]
  );

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filterValues).some(
      ([key, value]) => value !== initialValues[key] && value !== undefined && value !== ""
    );
  }, [filterValues, initialValues]);

  return {
    filterValues,
    setFilter,
    resetFilters,
    getFilterValue,
    hasActiveFilters,
  };
};
