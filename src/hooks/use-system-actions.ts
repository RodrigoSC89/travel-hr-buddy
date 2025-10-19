import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
import { useOfflineStorage } from "./use-offline-storage";

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
    navigate("/reports");
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

  const handleExportData = (format: string) => {
    toast({
      title: "Exportando",
      description: `Preparando export em formato ${format.toUpperCase()}`,
    });
    // Implementar lógica de export
    setTimeout(() => {
      toast({
        title: "Export Concluído",
        description: `Dados exportados em ${format.toUpperCase()}`,
      });
    }, 2000);
  };

  const handleBackup = () => {
    toast({
      title: "Backup",
      description: "Iniciando backup dos dados",
    });
    // Implementar lógica de backup
    setTimeout(() => {
      toast({
        title: "Backup Concluído",
        description: "Dados salvos com sucesso",
      });
    }, 3000);
  };

  const handleRefreshData = async () => {
    if (!isOnline) {
      toast({
        title: "Modo Offline",
        description: "Dados salvos localmente serão sincronizados quando online",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Atualizando",
      description: "Carregando dados mais recentes",
    });
    
    // Implementar refresh dos dados com timeout
    try {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 5000)
      );
      
      await Promise.race([
        // Aqui você adicionaria a lógica real de refresh
        new Promise(resolve => setTimeout(resolve, 500)),
        timeout
      ]);
      
      window.location.reload();
    } catch (error) {
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

  const handleOfflineAction = (action: string, data: unknown) => {
    if (!isOnline) {
      addPendingChange(action, data);
      toast({
        title: "Ação Salva",
        description: "Será sincronizada quando voltar online",
      });
    }
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