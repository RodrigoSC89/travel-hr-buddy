/**
 * MapPanel - Painel de Mapa Padrão
 * UX SYSTEM v1.0 - NAUTI ONE
 * 
 * Mapa com:
 * - Estados: loading, error, empty, offline
 * - Controles: recentralizar, atualizar, camadas
 * - Legenda
 * - Fallback visual
 */

import React, { useState } from "react";
import {
  Map,
  RefreshCw,
  Maximize2,
  Layers,
  Target,
  WifiOff,
  AlertCircle,
  Navigation,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export interface MapLayer {
  id: string;
  label: string;
  visible: boolean;
  color?: string;
}

export interface MapPanelProps {
  // State
  isLoading?: boolean;
  isRefreshing?: boolean;
  isOffline?: boolean;
  error?: Error | string | null;
  hasData?: boolean;
  
  // Actions
  onRefresh?: () => void;
  onRecenter?: () => void;
  onFullscreen?: () => void;
  onRetry?: () => void;
  
  // Layers
  layers?: MapLayer[];
  onLayerToggle?: (layerId: string, visible: boolean) => void;
  
  // Status
  lastUpdate?: Date;
  itemCount?: number;
  itemLabel?: string;
  
  // Legend
  legend?: Array<{
    color: string;
    label: string;
  }>;
  
  // Content
  children: React.ReactNode;
  
  // Style
  className?: string;
  height?: string;
}

export const MapPanel: React.FC<MapPanelProps> = ({
  isLoading = false,
  isRefreshing = false,
  isOffline = false,
  error,
  hasData = true,
  onRefresh,
  onRecenter,
  onFullscreen,
  onRetry,
  layers = [],
  onLayerToggle,
  lastUpdate,
  itemCount,
  itemLabel = "itens",
  legend = [],
  children,
  className,
  height = "h-[500px]",
}) => {
  const [showLegend, setShowLegend] = useState(true);

  // Render offline state
  if (isOffline) {
    return (
      <div className={cn("relative rounded-xl border bg-card overflow-hidden", height, className)}>
        <MapFallback
          icon={WifiOff}
          title="Sem Conexão"
          description="Não foi possível carregar o mapa. Verifique sua conexão."
          action={onRetry}
          actionLabel="Tentar Novamente"
        />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={cn("relative rounded-xl border bg-card overflow-hidden", height, className)}>
        <MapFallback
          icon={AlertCircle}
          title="Erro ao Carregar"
          description={typeof error === "string" ? error : error.message}
          action={onRetry || onRefresh}
          actionLabel="Tentar Novamente"
        />
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className={cn("relative rounded-xl border bg-card overflow-hidden", height, className)}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!hasData) {
    return (
      <div className={cn("relative rounded-xl border bg-card overflow-hidden", height, className)}>
        <MapFallback
          icon={Map}
          title="Nenhum Dado"
          description="Não há dados para exibir no mapa."
          action={onRefresh}
          actionLabel="Atualizar"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-xl border bg-card overflow-hidden", height, className)}>
      {/* Map Content */}
      <div className="absolute inset-0">
        {children}
      </div>

      {/* Overlay: Refreshing indicator */}
      {isRefreshing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <Badge variant="secondary" className="gap-2 shadow-lg">
            <Loader2 className="w-3 h-3 animate-spin" />
            Atualizando...
          </Badge>
        </div>
      )}

      {/* Top-right controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Layers dropdown */}
        {layers.length > 0 && onLayerToggle && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="shadow-lg" aria-label="Camadas do mapa" title="Camadas">
                <Layers className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Camadas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {layers.map((layer) => (
                <DropdownMenuCheckboxItem
                  key={layer.id}
                  checked={layer.visible}
                  onCheckedChange={(checked) => onLayerToggle(layer.id, checked)}
                >
                  <div className="flex items-center gap-2">
                    {layer.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: layer.color }}
                      />
                    )}
                    {layer.label}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Recenter */}
        {onRecenter && (
          <Button
            variant="secondary"
            size="icon"
            onClick={onRecenter}
            className="shadow-lg"
            aria-label="Recentralizar mapa"
            title="Recentralizar"
          >
            <Target className="w-4 h-4" />
          </Button>
        )}

        {/* Refresh */}
        {onRefresh && (
          <Button
            variant="secondary"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="shadow-lg"
            aria-label="Atualizar mapa"
            title="Atualizar"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>
        )}

        {/* Fullscreen */}
        {onFullscreen && (
          <Button
            variant="secondary"
            size="icon"
            onClick={onFullscreen}
            className="shadow-lg"
            aria-label="Tela cheia"
            title="Tela Cheia"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Bottom-left: Legend */}
      {legend.length > 0 && showLegend && (
        <div className="absolute bottom-4 left-4 z-10 bg-card/95 backdrop-blur-sm rounded-lg border p-3 shadow-lg max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Legenda</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => setShowLegend(false)}
            >
              ×
            </Button>
          </div>
          <div className="space-y-1.5">
            {legend.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom-right: Status */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        {itemCount !== undefined && (
          <Badge variant="secondary" className="shadow-lg">
            {itemCount} {itemLabel}
          </Badge>
        )}
        {lastUpdate && (
          <Badge variant="outline" className="shadow-lg bg-card/95">
            <Navigation className="w-3 h-3 mr-1" />
            {lastUpdate.toLocaleTimeString()}
          </Badge>
        )}
      </div>
    </div>
  );
};

// Fallback component for error/empty states
interface MapFallbackProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}

const MapFallback: React.FC<MapFallbackProps> = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 text-center p-6">
    <div className="p-4 rounded-full bg-muted mb-4">
      <Icon className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
    {action && actionLabel && (
      <Button variant="outline" onClick={action}>
        <RefreshCw className="w-4 h-4 mr-2" />
        {actionLabel}
      </Button>
    )}
  </div>
);

export default MapPanel;
