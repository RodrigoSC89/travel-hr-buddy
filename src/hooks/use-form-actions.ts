import React from "react";
import { useToast } from "@/hooks/use-toast";

// Hook para ações de formulários
export const useFormActions = () => {
  const { toast } = useToast();

  const handleSaveForm = (formName: string, data?: Record<string, unknown>) => {
    toast({
      title: "Salvando",
      description: `Salvando ${formName}...`,
    });
    
    // Simular save
    setTimeout(() => {
      toast({
        title: "Salvo com sucesso",
        description: `${formName} foi salvo com sucesso!`,
      });
    }, 1000);
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

  const handleDeleteItem = (itemName: string, itemId?: string) => {
    if (confirm(`Tem certeza que deseja excluir ${itemName}? Esta ação não pode ser desfeita.`)) {
      toast({
        title: "Excluindo",
        description: `Excluindo ${itemName}...`,
      });
      
      setTimeout(() => {
        toast({
          title: "Excluído com sucesso",
          description: `${itemName} foi excluído`,
        });
      }, 1000);
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