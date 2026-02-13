import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import { useOfflineStorage } from "./use-offline-storage";
import { useQueryClient } from "@tanstack/react-query";

// Hook para funcionalidades globais do sistema
export const useSystemActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isOnline, saveToCache, addPendingChange } = useOfflineStorage();

  const handleGlobalSearch = () => {
    setIsSearchOpen(true);
  };

  useKeyboardShortcuts(handleGlobalSearch);

  const handleNavigateToSettings = () => {
    navigate("/settings");
    toast({
      title: "Navegando",
      description: "Redirecionando para configurações",
    });
  };

  const handleNavigateToReports = () => {
    navigate("/reports-command");
    toast({
      title: "Navegando",
      description: "Redirecionando para relatórios",
    });
  };

  const handleNavigateToProfile = () => {
    toast({
      title: "Perfil",
      description: "Abrindo perfil do usuário",
    });
    // Implementar abertura de modal de perfil ou navegação
  };

  const queryClient = useQueryClient();

  const handleExportData = (format: string) => {
    toast({
      title: "Exportando",
      description: `Preparando export em formato ${format.toUpperCase()}`,
    });
    // Export is handled by specific module export handlers
  };

  const handleBackup = () => {
    toast({
      title: "Backup",
      description: "Backup dos dados é gerenciado automaticamente pelo Supabase",
    });
  };

  const handleRefreshData = async () => {
    toast({
      title: "Atualizando",
      description: "Carregando dados mais recentes",
    });
    
    try {
      await queryClient.invalidateQueries();
      toast({
        title: "Atualizado",
        description: "Dados carregados com sucesso",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados",
        variant: "destructive",
      });
    }
  };

  const handlePrintReport = () => {
    toast({
      title: "Imprimindo",
      description: "Preparando relatório para impressão",
    });
    window.print();
  };

  // PATCH v21: handleOfflineAction sempre adiciona à fila - não verificar isOnline
  const handleOfflineAction = (action: string, data: Record<string, unknown>) => {
    addPendingChange(action, data);
  };

  return {
    handleGlobalSearch,
    handleNavigateToSettings,
    handleNavigateToReports,
    handleNavigateToProfile,
    handleExportData,
    handleBackup,
    handleRefreshData,
    handlePrintReport,
    handleOfflineAction,
    isSearchOpen,
    setIsSearchOpen,
    isOnline,
  };
};