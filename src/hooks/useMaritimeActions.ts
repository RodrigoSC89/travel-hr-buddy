import { useToast } from '@/hooks/use-toast';
import { useCallback, useState } from 'react';

/**
 * Hook for maritime module actions with proper loading states and feedback
 */
export const useMaritimeActions = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const showSuccess = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description: description,
      variant: 'default',
    });
  }, [toast]);

  const showError = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description: description || 'Por favor, tente novamente.',
      variant: 'destructive',
    });
  }, [toast]);

  const showInfo = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description: description,
    });
  }, [toast]);

  const handleExport = useCallback(async (moduleName: string, data?: any) => {
    setIsLoading(true);
    try {
      // Simulate export action
      await new Promise(resolve => setTimeout(resolve, 500));
      showSuccess('Exportação concluída', `Dados de ${moduleName} exportados com sucesso`);
      
      // In a real implementation, this would trigger actual export
      console.log(`Exporting ${moduleName} data:`, data);
    } catch (error) {
      showError('Erro na exportação', 'Não foi possível exportar os dados');
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  const handleRefresh = useCallback(async (moduleName: string, callback?: () => Promise<void>) => {
    setIsLoading(true);
    try {
      if (callback) {
        await callback();
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      showSuccess('Dados atualizados', `${moduleName} atualizado com sucesso`);
    } catch (error) {
      showError('Erro ao atualizar', 'Não foi possível atualizar os dados');
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  const handleCreate = useCallback(async (itemName: string, callback?: () => Promise<void>) => {
    setIsLoading(true);
    try {
      if (callback) {
        await callback();
      }
      showSuccess('Item criado', `${itemName} criado com sucesso`);
    } catch (error) {
      showError('Erro ao criar', `Não foi possível criar ${itemName}`);
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  const handleUpdate = useCallback(async (itemName: string, callback?: () => Promise<void>) => {
    setIsLoading(true);
    try {
      if (callback) {
        await callback();
      }
      showSuccess('Item atualizado', `${itemName} atualizado com sucesso`);
    } catch (error) {
      showError('Erro ao atualizar', `Não foi possível atualizar ${itemName}`);
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  const handleDelete = useCallback(async (itemName: string, callback?: () => Promise<void>) => {
    setIsLoading(true);
    try {
      if (callback) {
        await callback();
      }
      showSuccess('Item excluído', `${itemName} excluído com sucesso`);
    } catch (error) {
      showError('Erro ao excluir', `Não foi possível excluir ${itemName}`);
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  const handleViewDetails = useCallback((itemName: string, id?: string | number) => {
    showInfo('Visualizando detalhes', `Abrindo detalhes de ${itemName}${id ? ` #${id}` : ''}`);
    console.log(`View details for ${itemName}`, id);
  }, [showInfo]);

  const handleGenerateReport = useCallback(async (reportName: string, callback?: () => Promise<void>) => {
    setIsLoading(true);
    try {
      if (callback) {
        await callback();
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      showSuccess('Relatório gerado', `${reportName} gerado com sucesso`);
    } catch (error) {
      showError('Erro ao gerar relatório', 'Não foi possível gerar o relatório');
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  return {
    isLoading,
    setIsLoading,
    showSuccess,
    showError,
    showInfo,
    handleExport,
    handleRefresh,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleViewDetails,
    handleGenerateReport,
  };
};
