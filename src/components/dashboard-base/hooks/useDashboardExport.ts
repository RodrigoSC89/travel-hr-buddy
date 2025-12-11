/**
 * useDashboardExport Hook
 * Hook customizado para exportar dados de dashboard
 * FASE B.2 - Consolidação de Dashboards
 */

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

type ExportFormat = "pdf" | "excel" | "csv" | "json";

interface ExportOptions {
  filename?: string;
  data: any;
  format: ExportFormat;
}

export const useDashboardExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = useCallback((data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast({
        title: "Erro ao exportar",
        description: "Nenhum dado disponível para exportar",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => JSON.stringify(row[header] || "")).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  }, [toast]);

  const exportToJSON = useCallback((data: any, filename: string) => {
    if (!data) {
      toast({
        title: "Erro ao exportar",
        description: "Nenhum dado disponível para exportar",
        variant: "destructive",
      });
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  }, [toast]);

  const exportData = useCallback(
    async (options: ExportOptions) => {
      setIsExporting(true);

      try {
        const filename = options.filename || `dashboard-export-${Date.now()}`;

        switch (options.format) {
          case "csv":
            exportToCSV(options.data, filename);
            break;

          case "json":
            exportToJSON(options.data, filename);
            break;

          case "excel":
            toast({
              title: "Em desenvolvimento",
              description: "Exportação para Excel em breve",
            });
            break;

          case "pdf":
            toast({
              title: "Em desenvolvimento",
              description: "Exportação para PDF em breve",
            });
            break;

          default:
            throw new Error(`Formato de exportação não suportado: ${options.format}`);
        }

        toast({
          title: "Exportação concluída",
          description: `Dados exportados como ${options.format.toUpperCase()}`,
        });
      } catch (error) {
        toast({
          title: "Erro ao exportar",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
      } finally {
        setIsExporting(false);
      }
    },
    [exportToCSV, exportToJSON, toast]
  );

  return {
    isExporting,
    exportData,
  };
};
