/**
 * useUXFeedback - Hook universal de feedback UX
 * 
 * Garante que TODA ação no sistema tenha feedback adequado:
 * - Loading → Skeleton/Spinner
 * - Sucesso → Toast verde com descrição
 * - Erro → Toast vermelho com retry
 * - Confirmação → ConfirmDialog antes de ação destrutiva
 * - Undo → Toast com botão desfazer (10s)
 * 
 * Padrão obrigatório para o sistema inteiro.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UXAction {
  label: string;
  action: () => Promise<void> | void;
  successMessage?: string;
  errorMessage?: string;
  undoAction?: () => Promise<void> | void;
  requiresConfirmation?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
}

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  variant: 'destructive' | 'warning' | 'info';
}

export function useUXFeedback() {
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'destructive',
  });

  /**
   * Executa uma ação com feedback UX completo
   */
  const executeAction = useCallback(async ({
    label,
    action,
    successMessage,
    errorMessage,
    undoAction,
  }: UXAction) => {
    const actionId = label.toLowerCase().replace(/\s/g, '-');
    
    setIsProcessing(prev => ({ ...prev, [actionId]: true }));
    
    try {
      await action();
      
      if (undoAction) {
        toast.success(successMessage || `${label} concluído`, {
          description: 'Clique em "Desfazer" nos próximos 10 segundos para reverter.',
          duration: 10000,
          action: {
            label: 'Desfazer',
            onClick: async () => {
              try {
                await undoAction();
                toast.info('Ação desfeita com sucesso');
              } catch {
                toast.error('Não foi possível desfazer a ação');
              }
            },
          },
        });
      } else {
        toast.success(successMessage || `${label} concluído com sucesso`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(errorMessage || `Erro ao executar: ${label}`, {
        description: message,
        action: {
          label: 'Tentar novamente',
          onClick: () => executeAction({ label, action, successMessage, errorMessage, undoAction }),
        },
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [actionId]: false }));
    }
  }, []);

  /**
   * Solicita confirmação antes de executar ação destrutiva
   */
  const confirmAction = useCallback(({
    title,
    description,
    onConfirm,
    variant = 'destructive',
  }: {
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'destructive' | 'warning' | 'info';
  }) => {
    setConfirmState({
      open: true,
      title,
      description,
      onConfirm: () => {
        onConfirm();
        setConfirmState(prev => ({ ...prev, open: false }));
      },
      variant,
    });
  }, []);

  /**
   * Feedback para export com download real
   */
  const exportFeedback = useCallback(async (
    exportFn: () => Promise<void> | void,
    format: string = 'CSV'
  ) => {
    const toastId = toast.loading(`Preparando exportação ${format}...`);
    try {
      await exportFn();
      toast.dismiss(toastId);
      toast.success(`Arquivo ${format} exportado com sucesso`, {
        description: 'O download deve iniciar automaticamente.',
      });
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(`Erro ao exportar ${format}`, {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    }
  }, []);

  /**
   * Feedback para upload com progresso
   */
  const uploadFeedback = useCallback(async (
    uploadFn: () => Promise<void> | void,
    fileName: string = 'arquivo'
  ) => {
    const toastId = toast.loading(`Enviando ${fileName}...`);
    try {
      await uploadFn();
      toast.dismiss(toastId);
      toast.success(`${fileName} enviado com sucesso`);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(`Erro ao enviar ${fileName}`, {
        description: error instanceof Error ? error.message : 'Verifique o arquivo e tente novamente.',
      });
    }
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, open: false }));
  }, []);

  return {
    isProcessing,
    confirmState,
    closeConfirm,
    executeAction,
    confirmAction,
    exportFeedback,
    uploadFeedback,
  };
}
