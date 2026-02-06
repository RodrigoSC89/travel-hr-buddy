/**
 * ActionHeader - Cabeçalho de Ações Padronizado
 * Componente reutilizável para headers de seções com ações
 */

import { ReactNode, FC } from 'react';
import { Plus, Download, Upload, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ActionHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  
  // Quick actions
  onAdd?: () => void;
  addLabel?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onExport?: () => void;
  onImport?: () => void;
  onFilter?: () => void;
  activeFilters?: number;
  
  // Custom content
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  
  className?: string;
}

export const ActionHeader: FC<ActionHeaderProps> = ({
  title,
  subtitle,
  count,
  onAdd,
  addLabel = 'Adicionar',
  onRefresh,
  isRefreshing,
  onExport,
  onImport,
  onFilter,
  activeFilters,
  leftContent,
  rightContent,
  className,
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', className)}>
      {/* Left side - Title & Info */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {count !== undefined && (
              <Badge variant="secondary" className="font-normal">
                {count}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {leftContent}
      </div>
      
      {/* Right side - Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {rightContent}
        
        {onFilter && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFilter}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtrar
            {activeFilters && activeFilters > 0 && (
              <Badge variant="default" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilters}
              </Badge>
            )}
          </Button>
        )}
        
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
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
  );
};

export default ActionHeader;
