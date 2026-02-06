/**
 * ConfirmModal - Modal de Confirmação Padronizado
 * Para ações destrutivas e confirmações importantes
 */

import { FC, ReactNode } from 'react';
import { AlertTriangle, Trash2, Archive, CheckCircle } from 'lucide-react';
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
import { cn } from '@/lib/utils';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  
  title: string;
  description: string;
  
  confirmLabel?: string;
  cancelLabel?: string;
  
  variant?: ConfirmVariant;
  icon?: ReactNode;
  
  isLoading?: boolean;
}

const variantConfig: Record<ConfirmVariant, {
  icon: typeof AlertTriangle;
  iconClass: string;
  bgClass: string;
  buttonClass: string;
}> = {
  danger: {
    icon: Trash2,
    iconClass: 'text-destructive',
    bgClass: 'bg-destructive/10',
    buttonClass: 'bg-destructive hover:bg-destructive/90',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-warning',
    bgClass: 'bg-warning/10',
    buttonClass: 'bg-warning hover:bg-warning/90 text-warning-foreground',
  },
  info: {
    icon: Archive,
    iconClass: 'text-info',
    bgClass: 'bg-info/10',
    buttonClass: 'bg-info hover:bg-info/90',
  },
  success: {
    icon: CheckCircle,
    iconClass: 'text-success',
    bgClass: 'bg-success/10',
    buttonClass: 'bg-success hover:bg-success/90',
  },
};

export const ConfirmModal: FC<ConfirmModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  icon,
  isLoading,
}) => {
  const config = variantConfig[variant];
  const IconComponent = config.icon;
  
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-full', config.bgClass)}>
              {icon || <IconComponent className={cn('w-6 h-6', config.iconClass)} />}
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(config.buttonClass)}
          >
            {isLoading ? 'Processando...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Convenience hook for confirm modals
import { useState, useCallback } from 'react';

export interface UseConfirmModalReturn {
  isOpen: boolean;
  confirm: (options: Omit<ConfirmModalProps, 'open' | 'onOpenChange' | 'onConfirm'>) => Promise<boolean>;
  ConfirmModalComponent: FC;
}

export function useConfirmModal(): UseConfirmModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Omit<ConfirmModalProps, 'open' | 'onOpenChange' | 'onConfirm'>>({
    title: '',
    description: '',
  });
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: Omit<ConfirmModalProps, 'open' | 'onOpenChange' | 'onConfirm'>) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts);
      setResolveRef(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef?.(true);
    setIsOpen(false);
  }, [resolveRef]);

  const handleCancel = useCallback((open: boolean) => {
    if (!open) {
      resolveRef?.(false);
    }
    setIsOpen(open);
  }, [resolveRef]);

  const ConfirmModalComponent: FC = useCallback(() => (
    <ConfirmModal
      open={isOpen}
      onOpenChange={handleCancel}
      onConfirm={handleConfirm}
      {...options}
    />
  ), [isOpen, handleCancel, handleConfirm, options]);

  return { isOpen, confirm, ConfirmModalComponent };
}

export default ConfirmModal;
