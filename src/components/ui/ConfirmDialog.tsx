/**
 * ConfirmDialog - Componente obrigatório para ações destrutivas
 * 
 * REGRA UX: Toda ação irreversível DEVE passar por este componente.
 * 
 * Integra com useUXFeedback para garantir:
 * - Título claro do que vai acontecer
 * - Descrição do impacto
 * - Botão de confirmação com variante visual (destructive/warning)
 * - Botão de cancelamento sempre visível
 * - Ícone contextual
 */

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
  isProcessing?: boolean;
}

const variantConfig = {
  destructive: {
    icon: Trash2,
    iconClass: 'text-destructive bg-destructive/10',
    buttonClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    defaultConfirmLabel: 'Excluir',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-warning bg-warning/10',
    buttonClass: 'bg-warning text-warning-foreground hover:bg-warning/90',
    defaultConfirmLabel: 'Confirmar',
  },
  info: {
    icon: Info,
    iconClass: 'text-info bg-info/10',
    buttonClass: 'bg-info text-info-foreground hover:bg-info/90',
    defaultConfirmLabel: 'Continuar',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  variant = 'destructive',
  onConfirm,
  onCancel,
  isProcessing = false,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn('rounded-full p-3 flex-shrink-0', config.iconClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <AlertDialogTitle className="text-base">{title}</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isProcessing}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={cn(config.buttonClass)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              confirmLabel || config.defaultConfirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;
