/**
 * PageShell - Container Padronizado para Todas as Páginas
 * Garante consistência visual e funcional em todo o sistema
 * 
 * INCLUI:
 * - Header com título, subtítulo e breadcrumbs
 * - Ações principais (Add, Import, Export, Refresh)
 * - Estados automáticos (loading, error, empty)
 * - Indicador de status do sistema
 */

import { ReactNode, FC } from 'react';
import { 
  Plus, 
  Download, 
  Upload, 
  RefreshCw, 
  WifiOff,
  Wifi,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState, EmptyStateProps } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

export interface PageAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
}

export interface PageShellProps {
  // Header
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  
  // Actions
  onAdd?: () => void;
  addLabel?: string;
  onImport?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  customActions?: PageAction[];
  
  // States
  isLoading?: boolean;
  loadingMessage?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyState?: EmptyStateProps;
  
  // System status
  isOnline?: boolean;
  lastSync?: Date | string;
  activeFilters?: number;
  
  // Content
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const PageShell: FC<PageShellProps> = ({
  title,
  subtitle,
  breadcrumbs,
  onAdd,
  addLabel = 'Adicionar',
  onImport,
  onExport,
  onRefresh,
  isRefreshing,
  customActions = [],
  isLoading,
  loadingMessage,
  error,
  onRetry,
  isEmpty,
  emptyState,
  isOnline = true,
  lastSync,
  activeFilters,
  children,
  className,
  contentClassName,
}) => {
  // Format last sync time
  const formatLastSync = (sync: Date | string | undefined) => {
    if (!sync) return null;
    const date = typeof sync === 'string' ? new Date(sync) : sync;
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* === HEADER === */}
      <header className="flex-shrink-0 border-b border-border bg-card p-4 lg:p-6">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-border">/</span>}
                {crumb.href ? (
                  <a 
                    href={crumb.href} 
                    className="hover:text-primary transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title Section */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex flex-wrap items-center gap-2">
            {/* System Status */}
            <div className="flex items-center gap-2 mr-2 text-sm text-muted-foreground">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-success" />
              ) : (
                <WifiOff className="w-4 h-4 text-destructive" />
              )}
              {lastSync && (
                <span className="hidden sm:flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatLastSync(lastSync)}
                </span>
              )}
              {activeFilters && activeFilters > 0 && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {activeFilters} filtro{activeFilters > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Standard Actions */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            )}

            {onImport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onImport}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Importar</span>
              </Button>
            )}

            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            )}

            {/* Custom Actions */}
            {customActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className="gap-2"
              >
                {action.loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : action.icon ? (
                  action.icon
                ) : null}
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            ))}

            {/* Primary Action (Add) */}
            {onAdd && (
              <Button
                variant="default"
                size="sm"
                onClick={onAdd}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {addLabel}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* === CONTENT === */}
      <main className={cn('flex-1 overflow-auto p-4 lg:p-6', contentClassName)}>
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingState 
              variant="spinner" 
              size="lg" 
              message={loadingMessage || 'Carregando dados...'} 
            />
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <ErrorState
            error={error}
            onRetry={onRetry || onRefresh}
            className="min-h-[400px]"
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && isEmpty && emptyState && (
          <EmptyState {...emptyState} className="min-h-[400px]" />
        )}

        {/* Content */}
        {!isLoading && !error && !isEmpty && children}
      </main>
    </div>
  );
};

export default PageShell;
