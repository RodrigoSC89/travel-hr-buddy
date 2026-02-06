/**
 * EnhancedActionBar - Barra de Ações World-Class
 * 
 * Features:
 * - Feedback visual em todas as ações
 * - Loading states
 * - Tooltips informativos
 * - Bulk actions support
 * - RBAC integration
 * 
 * Benchmark: Monday.com, Linear, Notion
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Download,
  Upload,
  RefreshCw,
  Filter,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  Trash2,
  Edit,
  Copy,
  Archive,
  Share2,
  FileText,
  Settings,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ActionConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => Promise<void> | void;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary';
  tooltip?: string;
  disabled?: boolean;
  loading?: boolean;
  badge?: number;
  requiresSelection?: boolean;
  roles?: string[];
}

export interface EnhancedActionBarProps {
  title?: string;
  subtitle?: string;
  selectedCount?: number;
  onClearSelection?: () => void;
  // Support both 'actions' and 'primaryActions' for flexibility
  actions?: ActionConfig[];
  primaryActions?: ActionConfig[];
  secondaryActions?: ActionConfig[];
  bulkActions?: ActionConfig[];
  showFilters?: boolean;
  onFilterClick?: () => void;
  filterCount?: number;
  className?: string;
  isRefreshing?: boolean;
  onRefresh?: () => Promise<void>;
  lastUpdated?: Date;
  // Search support
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  searchValue?: string;
}

export function EnhancedActionBar({
  title,
  subtitle,
  selectedCount = 0,
  onClearSelection,
  actions = [],
  primaryActions = [],
  secondaryActions = [],
  bulkActions = [],
  showFilters = false,
  onFilterClick,
  filterCount = 0,
  className,
  isRefreshing = false,
  onRefresh,
  lastUpdated,
  showSearch = false,
  searchPlaceholder = 'Buscar...',
  onSearch,
  searchValue = '',
}: EnhancedActionBarProps) {
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [successActions, setSuccessActions] = useState<Set<string>>(new Set());
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  // Merge actions and primaryActions for backwards compatibility
  const allPrimaryActions = [...actions, ...primaryActions];

  const handleAction = async (action: ActionConfig) => {
    if (action.loading || loadingActions.has(action.id)) return;

    try {
      setLoadingActions(prev => new Set(prev).add(action.id));
      await action.onClick();
      
      // Show success state briefly
      setSuccessActions(prev => new Set(prev).add(action.id));
      setTimeout(() => {
        setSuccessActions(prev => {
          const next = new Set(prev);
          next.delete(action.id);
          return next;
        });
      }, 2000);
    } catch (error) {
      console.error(`Action ${action.id} failed:`, error);
      toast.error(`Erro ao executar: ${action.label}`);
    } finally {
      setLoadingActions(prev => {
        const next = new Set(prev);
        next.delete(action.id);
        return next;
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);
    onSearch?.(value);
  };

  const renderActionButton = (action: ActionConfig, size: 'default' | 'sm' = 'default') => {
    const isLoading = loadingActions.has(action.id) || action.loading;
    const isSuccess = successActions.has(action.id);
    const isDisabled = action.disabled || isLoading || (action.requiresSelection && selectedCount === 0);

    return (
      <TooltipProvider key={action.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={action.variant || 'outline'}
              size={size}
              onClick={() => handleAction(action)}
              disabled={isDisabled}
              className={cn(
                'gap-2 transition-all duration-200',
                isSuccess && 'bg-green-500/10 text-green-600 border-green-500/20',
                action.variant === 'default' && 'bg-primary hover:bg-primary/90'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                action.icon
              )}
              <span className={cn(size === 'sm' && 'hidden sm:inline')}>
                {action.label}
              </span>
              {action.badge !== undefined && action.badge > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                  {action.badge}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          {action.tooltip && (
            <TooltipContent>
              <p>{action.tooltip}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Bulk selection mode
  if (selectedCount > 0 && bulkActions.length > 0) {
    return (
      <div className={cn(
        'flex items-center justify-between gap-4 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in slide-in-from-top-2',
        className
      )}>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-base px-3 py-1">
            {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Limpar seleção
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {bulkActions.map(action => renderActionButton(action, 'sm'))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between gap-4 flex-wrap p-4 bg-card border rounded-lg', className)}>
      {/* Left side - Title or Info */}
      {(title || subtitle) && (
        <div className="flex-1 min-w-0">
          {title && <h2 className="text-lg font-semibold truncate">{title}</h2>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      {/* Center - Search or Last Updated */}
      <div className="flex items-center gap-4 flex-1 justify-center">
        {showSearch && (
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={localSearchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
        
        {lastUpdated && !showSearch && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <span>Atualizado:</span>
            <span className="font-medium">
              {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filters */}
        {showFilters && onFilterClick && (
          <Button variant="outline" size="sm" onClick={onFilterClick} className="gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {filterCount}
              </Badge>
            )}
          </Button>
        )}

        {/* Refresh */}
        {onRefresh && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await onRefresh();
                      toast.success('Dados atualizados');
                    } catch {
                      toast.error('Erro ao atualizar');
                    }
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Atualizar dados (F5)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Primary Actions */}
        {allPrimaryActions.map(action => renderActionButton(action, 'sm'))}

        {/* Secondary Actions Dropdown */}
        {secondaryActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {secondaryActions.map((action, idx) => (
                <React.Fragment key={action.id}>
                  {idx > 0 && action.variant === 'destructive' && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => handleAction(action)}
                    disabled={action.disabled || loadingActions.has(action.id)}
                    className={cn(
                      'gap-2 cursor-pointer',
                      action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                    )}
                  >
                    {loadingActions.has(action.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      action.icon
                    )}
                    {action.label}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// Pre-configured action templates
export const commonActions = {
  create: (onClick: () => void, label = 'Novo'): ActionConfig => ({
    id: 'create',
    label,
    icon: <Plus className="h-4 w-4" />,
    onClick,
    variant: 'default',
    tooltip: 'Criar novo registro',
  }),
  
  export: (onClick: () => Promise<void>, formats = 'CSV/Excel'): ActionConfig => ({
    id: 'export',
    label: 'Exportar',
    icon: <Download className="h-4 w-4" />,
    onClick,
    tooltip: `Exportar dados (${formats})`,
  }),
  
  import: (onClick: () => void): ActionConfig => ({
    id: 'import',
    label: 'Importar',
    icon: <Upload className="h-4 w-4" />,
    onClick,
    tooltip: 'Importar dados de arquivo',
  }),
  
  delete: (onClick: () => Promise<void>, count?: number): ActionConfig => ({
    id: 'bulk-delete',
    label: count ? `Excluir (${count})` : 'Excluir',
    icon: <Trash2 className="h-4 w-4" />,
    onClick,
    variant: 'destructive',
    requiresSelection: true,
    tooltip: 'Excluir selecionados',
  }),
  
  edit: (onClick: () => void): ActionConfig => ({
    id: 'edit',
    label: 'Editar',
    icon: <Edit className="h-4 w-4" />,
    onClick,
    requiresSelection: true,
    tooltip: 'Editar selecionado',
  }),
  
  duplicate: (onClick: () => Promise<void>): ActionConfig => ({
    id: 'duplicate',
    label: 'Duplicar',
    icon: <Copy className="h-4 w-4" />,
    onClick,
    requiresSelection: true,
    tooltip: 'Duplicar selecionado',
  }),
  
  archive: (onClick: () => Promise<void>): ActionConfig => ({
    id: 'archive',
    label: 'Arquivar',
    icon: <Archive className="h-4 w-4" />,
    onClick,
    requiresSelection: true,
    tooltip: 'Arquivar selecionados',
  }),
  
  share: (onClick: () => void): ActionConfig => ({
    id: 'share',
    label: 'Compartilhar',
    icon: <Share2 className="h-4 w-4" />,
    onClick,
    tooltip: 'Compartilhar',
  }),
  
  report: (onClick: () => void): ActionConfig => ({
    id: 'report',
    label: 'Relatório',
    icon: <FileText className="h-4 w-4" />,
    onClick,
    tooltip: 'Gerar relatório',
  }),
  
  settings: (onClick: () => void): ActionConfig => ({
    id: 'settings',
    label: 'Configurações',
    icon: <Settings className="h-4 w-4" />,
    onClick,
    tooltip: 'Configurações do módulo',
  }),
};

export default EnhancedActionBar;
