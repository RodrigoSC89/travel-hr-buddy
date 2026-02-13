import { useToast } from "@/hooks/use-toast";

// Hook para ações de formulários
export const useFormActions = () => {
  const { toast } = useToast();

  const handleSaveForm = (formName: string, _data?: unknown) => {
    toast({
      title: "Salvo com sucesso",
      description: `${formName} foi salvo com sucesso!`,
    });
  };

  const handleCancelForm = (formName: string) => {
    if (confirm(`Tem certeza que deseja cancelar? As alterações em ${formName} serão perdidas.`)) {
      toast({
        title: "Cancelado",
        description: `${formName} foi cancelado`,
      });
      return true;
    }
    return false;
  };

  const handleResetForm = (formName: string) => {
    if (confirm(`Tem certeza que deseja restaurar ${formName} para os valores padrão?`)) {
      toast({
        title: "Formulário restaurado",
        description: `${formName} foi restaurado aos valores padrão`,
      });
      return true;
    }
    return false;
  };

  const handleDeleteItem = (itemName: string, _itemId?: string) => {
    if (confirm(`Tem certeza que deseja excluir ${itemName}? Esta ação não pode ser desfeita.`)) {
      toast({
        title: "Excluído com sucesso",
        description: `${itemName} foi excluído`,
      });
      return true;
    }
    return false;
  };

  return {
    handleSaveForm,
    handleCancelForm,
    handleResetForm,
    handleDeleteItem
  };
};
