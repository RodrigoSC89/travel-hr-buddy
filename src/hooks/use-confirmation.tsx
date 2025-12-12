/**
 * Confirmation Dialog Hook
 * Reusable confirmation dialog for destructive actions
 */

import { useCallback, useState } from "react";;;

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  variant: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
}

const defaultState: ConfirmationState = {
  isOpen: false,
  title: "",
  description: "",
  confirmText: "Confirmar",
  cancelText: "Cancelar",
  variant: "default",
  onConfirm: () => {}
};

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>(defaultState);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((options: {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    onConfirm: () => void | Promise<void>;
  }) => {
    setState({
      isOpen: true,
      title: options.title,
      description: options.description,
      confirmText: options.confirmText || "Confirmar",
      cancelText: options.cancelText || "Cancelar",
      variant: options.variant || "default",
      onConfirm: options.onConfirm
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await state.onConfirm();
    } finally {
      setIsLoading(false);
      setState(defaultState);
    }
  }, [state.onConfirm]);

  const handleCancel = useCallback(() => {
    setState(defaultState);
  }, []);

  const confirmDelete = useCallback((
    itemName: string,
    onConfirm: () => void | Promise<void>
  ) => {
    confirm({
      title: "Confirmar exclusão",
      description: `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm
    });
  }, [confirm]);

  const confirmAction = useCallback((
    action: string,
    onConfirm: () => void | Promise<void>
  ) => {
    confirm({
      title: "Confirmar ação",
      description: `Tem certeza que deseja ${action}?`,
      onConfirm
    });
  }, [confirm]);

  return {
    isOpen: state.isOpen,
    title: state.title,
    description: state.description,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    variant: state.variant,
    isLoading,
    confirm,
    confirmDelete,
    confirmAction,
    handleConfirm,
    handleCancel
  };
}

/**
 * Confirmation Dialog Component
 */
import React from "react";
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
import { Loader2 } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  variant: "default" | "destructive";
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  variant,
  isLoading,
  onConfirm,
  onCancel
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
