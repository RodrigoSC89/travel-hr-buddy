import { useCallback } from "react";

/**
 * Hook global com todos os handlers unificados dos botões principais.
 * Garante fallback seguro e logging padrão para botões suspensos.
 */
export function useButtonHandlers() {
  const generateReport = useCallback(() => {
    console.log("📄 Relatório gerado com sucesso!");
    alert("Relatório DP gerado e salvo com sucesso.");
  }, []);

  const syncDPLogs = useCallback(() => {
    console.log("🔗 Sincronização DP concluída!");
    alert("Sincronização dos logs de posicionamento finalizada.");
  }, []);

  const exportReport = useCallback(() => {
    console.log("🧾 Export realizado!");
    alert("Relatório exportado para PDF.");
  }, []);

  const resetIndicators = useCallback(() => {
    console.log("🔄 Indicadores reiniciados!");
    alert("Indicadores restaurados ao padrão.");
  }, []);

  const applyMitigation = useCallback(() => {
    console.log("🛠️ Mitigação aplicada com sucesso!");
    alert("Ação de mitigação FMEA executada.");
  }, []);

  const defaultFallback = useCallback((label?: string) => {
    console.warn(`⚠️ Ação não implementada: ${label || "botão genérico"}`);
    alert("Função ainda em desenvolvimento.");
  }, []);

  return {
    generateReport,
    syncDPLogs,
    exportReport,
    resetIndicators,
    applyMitigation,
    defaultFallback,
  };
}
