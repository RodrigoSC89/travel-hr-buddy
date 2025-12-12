/**
 * Executive Dashboard Base Component
 * Componente base genérico e configurado para Executive Dashboards
 * FASE B.2 - Consolidação de Dashboards
 */

import { useState } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Download, Settings } from "lucide-react";
import { ExecutiveDashboardConfig } from "@/types/dashboard-config";
import { KPICard } from "./widgets/KPICard";
import { ChartWidget } from "./widgets/ChartWidget";
import { MetricIndicator } from "./widgets/MetricIndicator";
import { TableWidget } from "./widgets/TableWidget";
import { FilterPanel } from "./widgets/FilterPanel";
import { useDashboardData } from "./hooks/useDashboardData";
import { useDashboardFilters } from "./hooks/useDashboardFilters";
import { useDashboardExport } from "./hooks/useDashboardExport";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ExecutiveDashboardBaseProps {
  config: ExecutiveDashboardConfig;
  className?: string;
  onError?: (error: Error) => void;
}

export const ExecutiveDashboardBase = ({
  config,
  className,
  onError,
}: ExecutiveDashboardBaseProps) => {
  const [selectedTab, setSelectedTab] = useState(config.tabs?.[0]?.id || "default");

  // Hooks
  const { data, isLoading, error, refresh, refreshing } = useDashboardData({
    dataSource: config.dataSource,
    autoRefresh: !!config.refreshInterval,
    onError,
  });

  const { filterValues, setFilter, resetFilters, hasActiveFilters } = useDashboardFilters({
    filters: config.filters || [],
    onFilterChange: (filters) => {
      // Handle filter changes
      refresh();
    },
  });

  const { isExporting, exportData } = useDashboardExport();

  // Render widget based on type
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
      // Allow custom widget components
      return (
        <div key={widget.id} className={gridClasses}>
          {widget.config.component}
        </div>
      );

    default:
      return null;
    }
  };

  // Render loading state
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

  // Render error state
  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">Erro ao carregar dashboard</p>
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

  // Get current tab widgets
  const currentWidgets = config.tabs
    ? config.tabs.find((tab) => tab.id === selectedTab)?.widgets || []
    : config.widgets;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {config.showHeader !== false && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-playfair">{config.title}</h1>
            {config.description && (
              <p className="text-muted-foreground mt-1">{config.description}</p>
            )}
          </div>

          {/* Actions */}
          {config.showActions !== false && config.actions && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                Atualizar
              </Button>
              {config.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      {config.showFilters !== false && config.filters && config.filters.length > 0 && (
        <FilterPanel
          filters={config.filters}
          values={filterValues}
          onChange={setFilter}
          onReset={hasActiveFilters ? resetFilters : undefined}
          horizontal
        />
      )}

      {/* Tabs */}
      {config.tabs && config.tabs.length > 0 ? (
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            {config.tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.icon && <tab.icon className="h-4 w-4 mr-2" />}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {config.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <div
                className={cn(
                  "grid gap-4",
                  config.layout.type === "grid" && `grid-cols-${config.layout.columns || 12}`
                )}
                style={{ gap: config.layout.gap ? `${config.layout.gap}px` : undefined }}
              >
                {tab.widgets.map(renderWidget)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div
          className={cn(
            "grid gap-4",
            config.layout.type === "grid" && `grid-cols-${config.layout.columns || 12}`
          )}
          style={{ gap: config.layout.gap ? `${config.layout.gap}px` : undefined }}
        >
          {currentWidgets.map(renderWidget)}
        </div>
      )}
    </div>
  );
};
