/**
 * CRUDDrawer - Drawer Padrão para Operações CRUD
 * UX SYSTEM v1.0 - NAUTI ONE
 * 
 * Drawer lateral para:
 * - Criar novos registros
 * - Editar registros existentes
 * - Visualizar detalhes
 */

import React from "react";
import { LucideIcon, X, Save, Plus, Edit, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export type CRUDMode = "create" | "edit" | "view";

export interface CRUDDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
  // Mode
  mode: CRUDMode;
  
  // Content
  title?: string;
  description?: string;
  icon?: LucideIcon;
  
  // Actions
  onSave?: () => void | Promise<void>;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  
  // State
  isLoading?: boolean;
  isSaving?: boolean;
  isDirty?: boolean;
  
  // Size
  size?: "sm" | "md" | "lg" | "xl" | "full";
  
  // Content
  children: React.ReactNode;
  
  // Footer extra
  footerExtra?: React.ReactNode;
  
  // Classnames
  className?: string;
  contentClassName?: string;
}

const modeConfig: Record<CRUDMode, {
  icon: LucideIcon;
  defaultTitle: string;
  defaultDescription: string;
}> = {
  create: {
    icon: Plus,
    defaultTitle: "Novo Registro",
    defaultDescription: "Preencha os campos abaixo para criar um novo registro.",
  },
  edit: {
    icon: Edit,
    defaultTitle: "Editar Registro",
    defaultDescription: "Modifique os campos abaixo e salve as alterações.",
  },
  view: {
    icon: Eye,
    defaultTitle: "Detalhes",
    defaultDescription: "Visualize os detalhes do registro.",
  },
};

const sizeClasses: Record<string, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "sm:max-w-full",
};

export const CRUDDrawer: React.FC<CRUDDrawerProps> = ({
  open,
  onOpenChange,
  mode,
  title,
  description,
  icon,
  onSave,
  onCancel,
  saveLabel,
  cancelLabel = "Cancelar",
  isLoading = false,
  isSaving = false,
  isDirty = false,
  size = "md",
  children,
  footerExtra,
  className,
  contentClassName,
}) => {
  const config = modeConfig[mode];
  const Icon = icon || config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;
  const displaySaveLabel = saveLabel || (mode === "create" ? "Criar" : "Salvar");

  const handleClose = () => {
    if (isDirty && mode !== "view") {
      // Could show confirmation dialog here
      if (window.confirm("Você tem alterações não salvas. Deseja realmente sair?")) {
        onCancel?.();
        onOpenChange(false);
      }
    } else {
      onCancel?.();
      onOpenChange(false);
    }
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleClose();
      } else {
        onOpenChange(true);
      }
    }}>
      <SheetContent
        className={cn(
          "flex flex-col p-0",
          sizeClasses[size],
          className
        )}
        side="right"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg">{displayTitle}</SheetTitle>
              <SheetDescription className="mt-1">
                {displayDescription}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className={cn("px-6 py-4", contentClassName)}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              children
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {mode !== "view" && (
          <SheetFooter className="px-6 py-4 border-t shrink-0 flex-row gap-2 sm:justify-between">
            <div className="flex items-center gap-2">
              {footerExtra}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                {cancelLabel}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {displaySaveLabel}
              </Button>
            </div>
          </SheetFooter>
        )}

        {/* View mode footer */}
        {mode === "view" && (
          <SheetFooter className="px-6 py-4 border-t shrink-0">
            <Button variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              Fechar
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

/**
 * Hook para gerenciar estado do CRUDDrawer
 */
export function useCRUDDrawer<T = unknown>() {
  const [state, setState] = React.useState<{
    open: boolean;
    mode: CRUDMode;
    data: T | null;
  }>({
    open: false,
    mode: "create",
    data: null,
  });

  const openCreate = React.useCallback(() => {
    setState({ open: true, mode: "create", data: null });
  }, []);

  const openEdit = React.useCallback((data: T) => {
    setState({ open: true, mode: "edit", data });
  }, []);

  const openView = React.useCallback((data: T) => {
    setState({ open: true, mode: "view", data });
  }, []);

  const close = React.useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const setData = React.useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    openCreate,
    openEdit,
    openView,
    close,
    setData,
    onOpenChange: (open: boolean) => setState((prev) => ({ ...prev, open })),
  };
}

export default CRUDDrawer;
