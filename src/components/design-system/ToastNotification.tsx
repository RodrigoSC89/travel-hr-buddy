/**
 * ToastNotification - Sistema de Notificações Padronizado
 * Integração com sonner para toasts consistentes
 */

import { toast as sonnerToast } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-success" />,
  error: <XCircle className="w-5 h-5 text-destructive" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
  info: <Info className="w-5 h-5 text-info" />,
  loading: <Loader2 className="w-5 h-5 text-primary animate-spin" />,
};

/**
 * Sistema unificado de toasts para feedback ao usuário
 */
export const toast = {
  success: (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return sonnerToast.success(opts.title, {
      description: opts.description,
      duration: opts.duration || 4000,
      action: opts.action,
      icon: icons.success,
    });
  },

  error: (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return sonnerToast.error(opts.title, {
      description: opts.description,
      duration: opts.duration || 6000,
      action: opts.action,
      icon: icons.error,
    });
  },

  warning: (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return sonnerToast.warning(opts.title, {
      description: opts.description,
      duration: opts.duration || 5000,
      action: opts.action,
      icon: icons.warning,
    });
  },

  info: (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return sonnerToast.info(opts.title, {
      description: opts.description,
      duration: opts.duration || 4000,
      action: opts.action,
      icon: icons.info,
    });
  },

  loading: (options: ToastOptions | string) => {
    const opts = typeof options === 'string' ? { title: options } : options;
    return sonnerToast.loading(opts.title, {
      description: opts.description,
      duration: opts.duration || Infinity,
      icon: icons.loading,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },

  custom: (message: string, icon?: React.ReactNode) => {
    return sonnerToast(message, { icon });
  },
};

/**
 * Mensagens padrão para ações comuns
 */
export const toastMessages = {
  // CRUD
  created: (item: string) => toast.success({ 
    title: `${item} criado com sucesso`,
    description: 'O registro foi salvo no sistema.'
  }),
  
  updated: (item: string) => toast.success({ 
    title: `${item} atualizado`,
    description: 'As alterações foram salvas.'
  }),
  
  deleted: (item: string) => toast.success({ 
    title: `${item} removido`,
    description: 'O registro foi excluído permanentemente.'
  }),
  
  archived: (item: string) => toast.success({ 
    title: `${item} arquivado`,
    description: 'O item foi movido para o arquivo.'
  }),

  // Errors
  createError: (item: string) => toast.error({ 
    title: `Erro ao criar ${item}`,
    description: 'Tente novamente ou contate o suporte.'
  }),
  
  updateError: (item: string) => toast.error({ 
    title: `Erro ao atualizar ${item}`,
    description: 'Suas alterações não foram salvas.'
  }),
  
  deleteError: (item: string) => toast.error({ 
    title: `Erro ao excluir ${item}`,
    description: 'O registro não pôde ser removido.'
  }),
  
  loadError: () => toast.error({ 
    title: 'Erro ao carregar dados',
    description: 'Verifique sua conexão e tente novamente.'
  }),

  // Actions
  copied: () => toast.success({ 
    title: 'Copiado!',
    description: 'Conteúdo copiado para a área de transferência.'
  }),
  
  exported: (format: string) => toast.success({ 
    title: 'Exportação concluída',
    description: `Arquivo ${format.toUpperCase()} gerado com sucesso.`
  }),
  
  imported: (count: number) => toast.success({ 
    title: 'Importação concluída',
    description: `${count} registro(s) importado(s).`
  }),

  // Validation
  validationError: () => toast.warning({ 
    title: 'Campos obrigatórios',
    description: 'Preencha todos os campos marcados.'
  }),
  
  // Network
  offline: () => toast.warning({ 
    title: 'Sem conexão',
    description: 'Você está offline. Alterações serão sincronizadas.'
  }),
  
  online: () => toast.success({ 
    title: 'Conectado',
    description: 'Sua conexão foi restabelecida.'
  }),
};

export default toast;
