import { toast as sonnerToast } from 'sonner';

/**
 * Sistema centralizado de notificações toast
 * Unifica o uso de toasts na aplicação
 */

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class ToastManager {
  private static instance: ToastManager;

  private constructor() {}

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  /**
   * Mostra um toast de sucesso
   */
  success(message: string, options?: ToastOptions) {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  /**
   * Mostra um toast de erro
   */
  error(message: string, options?: ToastOptions) {
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      action: options?.action,
    });
  }

  /**
   * Mostra um toast de warning
   */
  warning(message: string, options?: ToastOptions) {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  }

  /**
   * Mostra um toast de informação
   */
  info(message: string, options?: ToastOptions) {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 3000,
      action: options?.action,
    });
  }

  /**
   * Mostra um toast de loading
   * Retorna o ID do toast para poder atualizá-lo ou descartá-lo
   */
  loading(message: string, options?: Omit<ToastOptions, 'action'>) {
    return sonnerToast.loading(message, {
      description: options?.description,
    });
  }

  /**
   * Atualiza um toast de loading para sucesso
   */
  updateToSuccess(toastId: string | number, message: string, options?: ToastOptions) {
    sonnerToast.success(message, {
      id: toastId,
      description: options?.description,
      duration: options?.duration || 4000,
    });
  }

  /**
   * Atualiza um toast de loading para erro
   */
  updateToError(toastId: string | number, message: string, options?: ToastOptions) {
    sonnerToast.error(message, {
      id: toastId,
      description: options?.description,
      duration: options?.duration || 5000,
    });
  }

  /**
   * Descarta um toast específico
   */
  dismiss(toastId?: string | number) {
    sonnerToast.dismiss(toastId);
  }

  /**
   * Toast para operações assíncronas com promise
   */
  promise<T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) {
    return sonnerToast.promise(promise, {
      loading: options.loading,
      success: options.success,
      error: options.error,
    });
  }
}

// Export singleton instance
export const toastManager = ToastManager.getInstance();

// Helper functions para uso direto
export const showSuccess = (message: string, options?: ToastOptions) => {
  toastManager.success(message, options);
};

export const showError = (message: string, options?: ToastOptions) => {
  toastManager.error(message, options);
};

export const showWarning = (message: string, options?: ToastOptions) => {
  toastManager.warning(message, options);
};

export const showInfo = (message: string, options?: ToastOptions) => {
  toastManager.info(message, options);
};

export const showLoading = (message: string, options?: Omit<ToastOptions, 'action'>) => {
  return toastManager.loading(message, options);
};
