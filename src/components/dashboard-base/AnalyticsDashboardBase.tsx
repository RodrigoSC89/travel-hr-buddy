/**
 * Analytics Dashboard Base Component
 * Componente base genérico e configurável para Analytics Dashboards
 * FASE B.2 - Consolidação de Dashboards
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Download, Calendar, TrendingUp } from "lucide-react";
import { AnalyticsDashboardConfig } from "@/types/dashboard-config";
import { KPICard } from "./widgets/KPICard";
import { ChartWidget } from "./widgets/ChartWidget";
import { MetricIndicator } from "./widgets/MetricIndicator";
import { TableWidget } from "./widgets/TableWidget";
import { FilterPanel } from "./widgets/FilterPanel";
import { useDashboardData } from "./hooks/useDashboardData";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { useDashboardExport } from "./hooks/useDashboardExport";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AnalyticsDashboardBaseProps {
  config: AnalyticsDashboardConfig;
  className?: string;
  onError?: (error: Error) => void;
}

export const AnalyticsDashboardBase = ({
  config,
  className,
  onError,
}: AnalyticsDashboardBaseProps) => {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState(config.defaultTimeRange || "30d");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Hooks
  const { data, isLoading, error, refresh, refreshing } = useDashboardData({
    dataSource: config.dataSource,
    autoRefresh: config.realtimeEnabled,
    onError,
  });

  const { filterValues, setFilter, resetFilters, hasActiveFilters } = useDashboardFilters({
    filters: config.filters || [],
    onFilterChange: (filters) => {
      refresh();
    },
  });

  const { isExporting, exportData } = useDashboardExport();

  // Handle export
  const handleExport = (format: "pdf" | "excel" | "csv" | "json") => {
    if (!data) {
      toast({
        title: "Erro",
        description: "Nenhum dado disponível para exportar",
        variant: "destructive",
      });
      return;
    }

    exportData({
      data,
      format,
      filename: `${config.id}-${timeRange}-${Date.now()}`,
    });
  };

  // Render widget
  const renderWidget = (widget: any) => {
    if (!widget.visible && widget.visible !== undefined) return null;

    const gridClasses = cn(
      "col-span-full",
      widget.colspan && `md:col-span-${widget.colspan}`,
      widget.rowspan && `row-span-${widget.rowspan}`
    );

    switch (widget.type) {
      case "kpi":
        return (
          <div key={widget.id} className={gridClasses}>
            <KPICard config={widget.config} />
          </div>
        );

      case "chart":
        return (
          <div key={widget.id} className={gridClasses}>
            <ChartWidget config={widget.config} />
          </div>
        );

      case "metric":
        return (
          <div key={widget.id} className={gridClasses}>
            <Card>
              <CardContent className="pt-6">
                <MetricIndicator config={widget.config} />
              </CardContent>
            </Card>
          </div>
        );

      case "table":
        return (
          <div key={widget.id} className={gridClasses}>
            <TableWidget {...widget.config} />
          </div>
        );

      case "custom":
        return (
          <div key={widget.id} className={gridClasses}>
            {widget.config.component}
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (isLoading && !data) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-12 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-span-3">
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">Erro ao carregar analytics</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold font-playfair">{config.title}</h1>
          {config.description && (
            <p className="text-muted-foreground mt-1">{config.description}</p>
          )}
        </div>

        {/* Time Range & Export */}
        <div className="flex gap-2 flex-wrap">
          {/* Time Range Selector */}
          {config.timeRanges && config.timeRanges.length > 0 && (
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.timeRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range === "7d" && "Últimos 7 dias"}
                    {range === "30d" && "Últimos 30 dias"}
                    {range === "90d" && "Últimos 90 dias"}
                    {range === "1y" && "Último ano"}
                    {!["7d", "30d", "90d", "1y"].includes(range) && range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Category Filter */}
          {config.categories && config.categories.length > 0 && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {config.categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Refresh Button */}
          <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Atualizar
          </Button>

          {/* Export Buttons */}
          {config.exportFormats && config.exportFormats.length > 0 && (
            <Select onValueChange={(format) => handleExport(format as any)}>
              <SelectTrigger className="w-[140px]">
                <Download className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Exportar" />
              </SelectTrigger>
              <SelectContent>
                {config.exportFormats.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Filters */}
      {config.filters && config.filters.length > 0 && (
        <FilterPanel
          filters={config.filters}
          values={filterValues}
          onChange={setFilter}
          onReset={hasActiveFilters ? resetFilters : undefined}
          horizontal
        />
      )}

      {/* Real-time Indicator */}
      {config.realtimeEnabled && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Atualização em tempo real
          </Badge>
        </div>
      )}

      {/* Widgets */}
      <div
        className={cn(
          "grid gap-4",
          config.layout.type === "grid" && `grid-cols-${config.layout.columns || 12}`
        )}
        style={{ gap: config.layout.gap ? `${config.layout.gap}px` : undefined }}
      >
        {config.widgets.map(renderWidget)}
      </div>
    </div>
  );
};
