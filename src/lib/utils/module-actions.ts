/**
 * Module Action Utilities
 * Standardized actions for all modules
 */

import { toast } from 'sonner';

type ActionResult = { success: boolean; message?: string; data?: unknown };

/**
 * Standard module actions with feedback
 */
export const moduleActions = {
  /**
   * Save/Update action
   */
  async save<T>(
    saveFn: () => Promise<T>,
    options: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
    } = {}
  ): Promise<ActionResult> {
    const {
      loadingMessage = 'Salvando...',
      successMessage = 'Salvo com sucesso!',
      errorMessage = 'Erro ao salvar'
    } = options;

    const toastId = toast.loading(loadingMessage);

    try {
      const data = await saveFn();
      toast.success(successMessage, { id: toastId });
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage;
      toast.error(message, { id: toastId });
      return { success: false, message };
    }
  },

  /**
   * Delete action with confirmation
   */
  async delete(
    deleteFn: () => Promise<void>,
    options: {
      confirmMessage?: string;
      successMessage?: string;
      errorMessage?: string;
    } = {}
  ): Promise<ActionResult> {
    const {
      successMessage = 'Removido com sucesso!',
      errorMessage = 'Erro ao remover'
    } = options;

    try {
      await deleteFn();
      toast.success(successMessage);
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage;
      toast.error(message);
      return { success: false, message };
    }
  },

  /**
   * Export action (PDF, Excel, etc)
   */
  async export(
    exportFn: () => Promise<Blob | string>,
    filename: string,
    options: {
      type?: 'pdf' | 'excel' | 'csv' | 'json';
      successMessage?: string;
    } = {}
  ): Promise<ActionResult> {
    const { type = 'pdf', successMessage = 'Exportado com sucesso!' } = options;
    const toastId = toast.loading('Gerando arquivo...');

    try {
      const data = await exportFn();
      
      // Create download link
      const blob = typeof data === 'string' 
        ? new Blob([data], { type: getMimeType(type) })
        : data;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(successMessage, { id: toastId });
      return { success: true };
    } catch (error) {
      toast.error('Erro ao exportar arquivo', { id: toastId });
      return { success: false };
    }
  },

  /**
   * Refresh/Reload action
   */
  async refresh<T>(
    refreshFn: () => Promise<T>,
    options: { silent?: boolean } = {}
  ): Promise<ActionResult> {
    const { silent = false } = options;

    try {
      const data = await refreshFn();
      if (!silent) {
        toast.success('Dados atualizados');
      }
      return { success: true, data };
    } catch (error) {
      if (!silent) {
        toast.error('Erro ao atualizar dados');
      }
      return { success: false };
    }
  },

  /**
   * Generic async action with loading state
   */
  async execute<T>(
    actionFn: () => Promise<T>,
    options: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      showLoading?: boolean;
    } = {}
  ): Promise<ActionResult> {
    const {
      loadingMessage = 'Processando...',
      successMessage = 'Operação concluída!',
      errorMessage = 'Erro na operação',
      showLoading = true
    } = options;

    const toastId = showLoading ? toast.loading(loadingMessage) : undefined;

    try {
      const data = await actionFn();
      if (toastId) {
        toast.success(successMessage, { id: toastId });
      } else {
        toast.success(successMessage);
      }
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage;
      if (toastId) {
        toast.error(message, { id: toastId });
      } else {
        toast.error(message);
      }
      return { success: false, message };
    }
  },

  /**
   * Copy to clipboard
   */
  async copy(text: string, message = 'Copiado!'): Promise<ActionResult> {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
      return { success: true };
    } catch {
      toast.error('Erro ao copiar');
      return { success: false };
    }
  },

  /**
   * Share content
   */
  async share(data: ShareData): Promise<ActionResult> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return { success: true };
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Erro ao compartilhar');
        }
        return { success: false };
      }
    } else {
      // Fallback: copy link
      if (data.url) {
        return moduleActions.copy(data.url, 'Link copiado!');
      }
      return { success: false };
    }
  },

  /**
   * Print content
   */
  print(): void {
    window.print();
  }
};

function getMimeType(type: string): string {
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    json: 'application/json'
  };
  return types[type] || 'application/octet-stream';
}

/**
 * Navigation helper with loading state
 */
export function createNavigationHandler(
  navigate: (path: string) => void,
  setLoading?: (loading: boolean) => void
) {
  return (path: string) => {
    setLoading?.(true);
    // Small delay for visual feedback
    setTimeout(() => {
      navigate(path);
      setLoading?.(false);
    }, 100);
  };
}

/**
 * Form submission helper
 */
export async function handleFormSubmit<T>(
  e: React.FormEvent,
  submitFn: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
    resetForm?: () => void;
  } = {}
): Promise<void> {
  e.preventDefault();
  
  const result = await moduleActions.save(submitFn, {
    successMessage: options.successMessage,
    errorMessage: options.errorMessage
  });

  if (result.success) {
    options.onSuccess?.(result.data as T);
    options.resetForm?.();
  } else {
    options.onError?.(new Error(result.message));
  }
}
