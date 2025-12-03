/**
 * Lazy-loaded XLSX export hook
 * Reduces initial bundle by ~400KB by loading xlsx only when needed
 */

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface XLSXExportOptions {
  filename?: string;
  sheetName?: string;
}

interface UseXLSXExportReturn {
  isLoading: boolean;
  exportToXLSX: (data: any[], options?: XLSXExportOptions) => Promise<void>;
  exportMultipleSheets: (
    sheets: Array<{ name: string; data: any[] }>,
    filename?: string
  ) => Promise<void>;
  getXLSX: () => Promise<typeof import("xlsx")>;
}

// Cached instance
let xlsxInstance: typeof import("xlsx") | null = null;

export const useXLSXExport = (): UseXLSXExportReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getXLSX = useCallback(async () => {
    if (!xlsxInstance) {
      xlsxInstance = await import("xlsx");
    }
    return xlsxInstance;
  }, []);

  const exportToXLSX = useCallback(async (
    data: any[],
    options: XLSXExportOptions = {}
  ) => {
    setIsLoading(true);
    try {
      const XLSX = await getXLSX();
      const {
        filename = "data.xlsx",
        sheetName = "Sheet1"
      } = options;

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Auto-size columns
      const maxWidth = 50;
      const colWidths: { wch: number }[] = [];
      
      if (data.length > 0) {
        Object.keys(data[0]).forEach((key) => {
          const maxLength = Math.max(
            key.length,
            ...data.map(row => String(row[key] || "").length)
          );
          colWidths.push({ wch: Math.min(maxLength + 2, maxWidth) });
        });
        worksheet["!cols"] = colWidths;
      }

      XLSX.writeFile(workbook, filename);

      toast({
        title: "Excel Exportado",
        description: `Arquivo ${filename} gerado com sucesso.`
      });
    } catch (error) {
      console.error("XLSX export error:", error);
      toast({
        title: "Erro na Exportação",
        description: "Falha ao gerar arquivo Excel.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [getXLSX, toast]);

  const exportMultipleSheets = useCallback(async (
    sheets: Array<{ name: string; data: any[] }>,
    filename: string = "data.xlsx"
  ) => {
    setIsLoading(true);
    try {
      const XLSX = await getXLSX();
      const workbook = XLSX.utils.book_new();

      sheets.forEach(({ name, data }) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, name.substring(0, 31)); // Excel limit
      });

      XLSX.writeFile(workbook, filename);

      toast({
        title: "Excel Exportado",
        description: `Arquivo ${filename} com ${sheets.length} planilhas gerado.`
      });
    } catch (error) {
      console.error("XLSX multi-sheet export error:", error);
      toast({
        title: "Erro na Exportação",
        description: "Falha ao gerar arquivo Excel.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [getXLSX, toast]);

  return {
    isLoading,
    exportToXLSX,
    exportMultipleSheets,
    getXLSX
  };
};

/**
 * Standalone function for non-React contexts
 */
export const lazyExportXLSX = async (
  data: any[],
  filename: string = "data.xlsx"
): Promise<void> => {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, filename);
};

export default useXLSXExport;
