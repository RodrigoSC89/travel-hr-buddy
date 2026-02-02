/**
 * ConfirmDialog - Diálogo de Confirmação Padrão
 * UX SYSTEM v1.0 - NAUTI ONE
 * 
 * Para ações destrutivas ou que requerem confirmação:
 * - Deletar registros
 * - Ações irreversíveis
 * - Operações críticas
 */

import React from "react";
import { LucideIcon, AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmDialogVariant = "danger" | "warning" | "info";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
  // Content
  title: string;
  description: string;
  icon?: LucideIcon;
  
  // Actions
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  
  // State
  isLoading?: boolean;
  
  // Variant
  variant?: ConfirmDialogVariant;
  
  // Extra content
  children?: React.ReactNode;
}

const variantConfig: Record<ConfirmDialogVariant, {
  icon: LucideIcon;
  iconClass: string;
  bgClass: string;
  buttonVariant: "destructive" | "default" | "outline";
}> = {
  danger: {
    icon: Trash2,
    iconClass: "text-destructive",
    bgClass: "bg-destructive/10",
    buttonVariant: "destructive",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-warning",
    bgClass: "bg-warning/10",
    buttonVariant: "default",
  },
  info: {
    icon: AlertTriangle,
    iconClass: "text-primary",
    bgClass: "bg-primary/10",
    buttonVariant: "default",
  },
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  icon,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "danger",
  children,
}) => {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error handling is expected to be done by the caller
      console.error("Confirmation action failed:", error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-full shrink-0", config.bgClass)}>
              <Icon className={cn("w-6 h-6", config.iconClass)} />
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          
          <AlertDialogAction asChild>
            <Button
              variant={config.buttonVariant}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Icon className="w-4 h-4 mr-2" />
              )}
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/**
 * Hook para usar o ConfirmDialog de forma imperativa
 */
export function useConfirmDialog() {
  const [state, setState] = React.useState<{
    open: boolean;
    props: Omit<ConfirmDialogProps, "open" | "onOpenChange" | "onConfirm"> & {
      onConfirm?: () => void | Promise<void>;
    };
    resolve: ((confirmed: boolean) => void) | null;
  }>({
    open: false,
    props: {
      title: "",
      description: "",
    },
    resolve: null,
  });

  const confirm = React.useCallback(
    (props: Omit<ConfirmDialogProps, "open" | "onOpenChange" | "onConfirm">): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          open: true,
          props,
          resolve,
        });
      });
    },
    []
  );

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open && state.resolve) {
      state.resolve(false);
    }
    setState((prev) => ({ ...prev, open }));
  }, [state.resolve]);

  const handleConfirm = React.useCallback(() => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, open: false }));
  }, [state.resolve]);

  const DialogComponent = React.useMemo(
    () => (
      <ConfirmDialog
        {...state.props}
        open={state.open}
        onOpenChange={handleOpenChange}
        onConfirm={handleConfirm}
      />
    ),
    [state.open, state.props, handleOpenChange, handleConfirm]
  );

  return {
    confirm,
    ConfirmDialog: DialogComponent,
  };
}

export default ConfirmDialog;
