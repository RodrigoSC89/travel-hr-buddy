import { memo } from 'react';
/**
 * Feedback Toast Component
 * PATCH 624 - Toasts melhorados para feedback do usuário
 */

import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

interface ToastOptions {
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast de sucesso
 */
export const successToast = memo(function(message: string, options?: ToastOptions) {
  toast.success(message, {
    duration: options?.duration || 4000,
    description: options?.description,
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    action: options?.action
      ? {
        label: options.action.label,
        onClick: options.action.onClick,
      }
      : undefined,
  });
}

/**
 * Toast de erro
 */
export const errorToast = memo(function(message: string, options?: ToastOptions) {
  toast.error(message, {
    duration: options?.duration || 6000,
    description: options?.description,
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    action: options?.action
      ? {
        label: options.action.label,
        onClick: options.action.onClick,
      }
      : undefined,
  });
}

/**
 * Toast de aviso
 */
export const warningToast = memo(function(message: string, options?: ToastOptions) {
  toast.warning(message, {
    duration: options?.duration || 5000,
    description: options?.description,
    icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    action: options?.action
      ? {
        label: options.action.label,
        onClick: options.action.onClick,
      }
      : undefined,
  });
}

/**
 * Toast informativo
 */
export const infoToast = memo(function(message: string, options?: ToastOptions) {
  toast.info(message, {
    duration: options?.duration || 4000,
    description: options?.description,
    icon: <Info className="h-5 w-5 text-blue-500" />,
    action: options?.action
      ? {
        label: options.action.label,
        onClick: options.action.onClick,
      }
      : undefined,
  });
}

/**
 * Toast de loading com promise
 */
export function loadingToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  }
) {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
}

/**
 * Toast de loading manual
 */
export const showLoadingToast = memo(function(message: string) {
  return toast.loading(message, {
    icon: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
  });
}

/**
 * Dismissar toast
 */
export const dismissToast = memo(function(toastId?: string | number) {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
}

/**
 * Toast com ação de undo
 */
export function undoToast(
  message: string,
  onUndo: () => void,
  timeout: number = 5000
) {
  toast(message, {
    duration: timeout,
    action: {
      label: "Desfazer",
      onClick: onUndo,
    },
  });
}

/**
 * Toast de confirmação de ação
 */
export function actionToast(
  message: string,
  action: {
    label: string;
    onClick: () => void;
  },
  options?: Omit<ToastOptions, "action">
) {
  toast(message, {
    duration: options?.duration || 5000,
    description: options?.description,
    action: {
      label: action.label,
      onClick: action.onClick,
    },
  });
}
