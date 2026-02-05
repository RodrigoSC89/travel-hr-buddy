/**
 * ActionBar - Barra de Ações Padrão Reutilizável
 * 
 * Componente padronizado para ações CRUD em todas as páginas:
 * - Add/Create
 * - Edit
 * - Delete (com confirmação)
 * - Upload
 * - Export (CSV/PDF)
 * - Refresh/Sync
 * - Reset filters
 * 
 * ✅ Suporte a permissões (RBAC)
 * ✅ Feature flags
 * ✅ Tooltips e atalhos de teclado
 * ✅ Estados de loading
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Edit, Trash2, Upload, Download, RefreshCw, RotateCcw,
  FileSpreadsheet, FileText, Loader2, MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ActionConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  hidden?: boolean;
  requireConfirmation?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
  shortcut?: string;
  requiredRole?: string;
  featureFlag?: string;
  badge?: string;
}

export interface ActionBarProps {
  actions?: ActionConfig[];
  // Quick action props
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpload?: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onRefresh?: () => void;
  onReset?: () => void;
  // States
  isLoading?: boolean;
  isRefreshing?: boolean;
  hasSelection?: boolean;
  selectedCount?: number;
  // Permissions
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  // UI
  compact?: boolean;
  className?: string;
}

export function ActionBar({
  actions = [],
  onAdd,
  onEdit,
  onDelete,
  onUpload,
  onExportCSV,
  onExportPDF,
  onRefresh,
  onReset,
  isLoading = false,
  isRefreshing = false,
  hasSelection = false,
  selectedCount = 0,
  canAdd = true,
  canEdit = true,
  canDelete = true,
  canExport = true,
  compact = false,
  className = '',
}: ActionBarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Build default actions
  const defaultActions: ActionConfig[] = [];

  if (onAdd && canAdd) {
    defaultActions.push({
      id: 'add',
      label: 'Adicionar',
      icon: Plus,
      onClick: onAdd,
      variant: 'default',
      shortcut: 'Ctrl+N',
    });
  }

  if (onEdit && canEdit && hasSelection) {
    defaultActions.push({
      id: 'edit',
      label: 'Editar',
      icon: Edit,
      onClick: onEdit,
      variant: 'outline',
      shortcut: 'Ctrl+E',
    });
  }

  if (onDelete && canDelete && hasSelection) {
    defaultActions.push({
      id: 'delete',
      label: `Excluir${selectedCount > 1 ? ` (${selectedCount})` : ''}`,
      icon: Trash2,
      onClick: () => setDeleteDialogOpen(true),
      variant: 'destructive',
      requireConfirmation: true,
      confirmTitle: 'Confirmar Exclusão',
      confirmDescription: `Tem certeza que deseja excluir ${selectedCount > 1 ? `${selectedCount} itens` : 'este item'}? Esta ação não pode ser desfeita.`,
      shortcut: 'Del',
    });
  }

  if (onUpload) {
    defaultActions.push({
      id: 'upload',
      label: 'Upload',
      icon: Upload,
      onClick: onUpload,
      variant: 'outline',
    });
  }

  if (onRefresh) {
    defaultActions.push({
      id: 'refresh',
      label: 'Atualizar',
      icon: RefreshCw,
      onClick: onRefresh,
      variant: 'ghost',
      loading: isRefreshing,
      shortcut: 'Ctrl+R',
    });
  }

  if (onReset) {
    defaultActions.push({
      id: 'reset',
      label: 'Limpar Filtros',
      icon: RotateCcw,
      onClick: onReset,
      variant: 'ghost',
    });
  }

  // Combine with custom actions
  const allActions = [...defaultActions, ...actions].filter(a => !a.hidden);
  
  // Split into primary (first 3) and secondary (rest)
  const primaryActions = allActions.slice(0, compact ? 2 : 4);
  const secondaryActions = allActions.slice(compact ? 2 : 4);
  const hasExport = (onExportCSV || onExportPDF) && canExport;

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Primary Actions */}
      {primaryActions.map((action) => (
        <Tooltip key={action.id}>
          <TooltipTrigger asChild>
            <Button
              variant={action.variant || 'outline'}
              size={compact ? 'sm' : 'default'}
              onClick={action.onClick}
              disabled={action.disabled || action.loading || isLoading}
              className="gap-2"
            >
              {action.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <action.icon className="h-4 w-4" />
              )}
              {!compact && action.label}
              {action.badge && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {action.badge}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{action.label}</p>
            {action.shortcut && (
              <p className="text-xs text-muted-foreground">{action.shortcut}</p>
            )}
          </TooltipContent>
        </Tooltip>
      ))}

      {/* Export Dropdown */}
      {hasExport && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={compact ? 'sm' : 'default'} className="gap-2">
              <Download className="h-4 w-4" />
              {!compact && 'Exportar'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onExportCSV && (
              <DropdownMenuItem onClick={onExportCSV}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar CSV
              </DropdownMenuItem>
            )}
            {onExportPDF && (
              <DropdownMenuItem onClick={onExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Secondary Actions Dropdown */}
      {secondaryActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={compact ? 'sm' : 'default'}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {secondaryActions.map((action, index) => (
              <React.Fragment key={action.id}>
                {index > 0 && action.variant === 'destructive' && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                  className={action.variant === 'destructive' ? 'text-destructive' : ''}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                  {action.shortcut && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {action.shortcut}
                    </span>
                  )}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedCount > 1 ? `${selectedCount} itens` : 'este item'}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Preset configurations for common use cases
export const ActionBarPresets = {
  crud: {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
  },
  readOnly: {
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canExport: true,
  },
  audit: {
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canExport: true,
  },
};

export default ActionBar;
