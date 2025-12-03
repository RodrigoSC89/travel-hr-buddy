/**
 * Lazy-loaded PDF export hook
 * Reduces initial bundle by ~300KB by loading jsPDF only when needed
 */

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

type AutoTableUserInput = {
  head?: any[][];
  body?: any[][];
  columns?: any[];
  startY?: number;
  margin?: { top?: number; left?: number; right?: number; bottom?: number };
  styles?: Record<string, any>;
  headStyles?: Record<string, any>;
  bodyStyles?: Record<string, any>;
  theme?: "striped" | "grid" | "plain";
};

interface PDFExportOptions {
  filename?: string;
  title?: string;
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter";
  margins?: { top: number; right: number; bottom: number; left: number };
}

interface UsePDFExportReturn {
  isLoading: boolean;
  exportToPDF: (content: string | HTMLElement, options?: PDFExportOptions) => Promise<void>;
  exportTableToPDF: (tableData: AutoTableUserInput, options?: PDFExportOptions) => Promise<void>;
  getJsPDF: () => Promise<typeof import("jspdf").default>;
  getAutoTable: () => Promise<typeof import("jspdf-autotable").default>;
}

// Cached instances
let jsPDFInstance: typeof import("jspdf").default | null = null;
let autoTableInstance: typeof import("jspdf-autotable").default | null = null;

export const usePDFExport = (): UsePDFExportReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getJsPDF = useCallback(async () => {
    if (!jsPDFInstance) {
      const { default: jsPDF } = await import("jspdf");
      jsPDFInstance = jsPDF;
    }
    return jsPDFInstance;
  }, []);

  const getAutoTable = useCallback(async () => {
    if (!autoTableInstance) {
      const { default: autoTable } = await import("jspdf-autotable");
      autoTableInstance = autoTable;
    }
    return autoTableInstance;
  }, []);

  const exportToPDF = useCallback(async (
    content: string | HTMLElement,
    options: PDFExportOptions = {}
  ) => {
    setIsLoading(true);
    try {
      const jsPDF = await getJsPDF();
      const {
        filename = "document.pdf",
        title,
        orientation = "portrait",
        format = "a4",
        margins = { top: 20, right: 20, bottom: 20, left: 20 }
      } = options;

      const doc = new jsPDF({
        orientation,
        unit: "mm",
        format
      });

      // Add title if provided
      if (title) {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(title, margins.left, margins.top);
      }

      // Add content
      const startY = title ? margins.top + 10 : margins.top;
      
      if (typeof content === "string") {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - margins.left - margins.right;
        const lines = doc.splitTextToSize(content, maxWidth);
        
        doc.text(lines, margins.left, startY);
      }

      doc.save(filename);

      toast({
        title: "PDF Exportado",
        description: `Arquivo ${filename} gerado com sucesso.`
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Erro na Exportação",
        description: "Falha ao gerar PDF. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [getJsPDF, toast]);

  const exportTableToPDF = useCallback(async (
    tableData: AutoTableUserInput,
    options: PDFExportOptions = {}
  ) => {
    setIsLoading(true);
    try {
      const jsPDF = await getJsPDF();
      const autoTable = await getAutoTable();
      
      const {
        filename = "table.pdf",
        title,
        orientation = "portrait",
        format = "a4",
        margins = { top: 20, right: 20, bottom: 20, left: 20 }
      } = options;

      const doc = new jsPDF({
        orientation,
        unit: "mm",
        format
      });

      let startY = margins.top;

      // Add title if provided
      if (title) {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(title, margins.left, startY);
        startY += 10;
      }

      // Add table
      autoTable(doc, {
        ...tableData,
        startY,
        margin: margins,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          ...tableData.styles
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
          ...tableData.headStyles
        }
      });

      doc.save(filename);

      toast({
        title: "PDF Exportado",
        description: `Tabela exportada para ${filename}.`
      });
    } catch (error) {
      console.error("PDF table export error:", error);
      toast({
        title: "Erro na Exportação",
        description: "Falha ao gerar PDF da tabela.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [getJsPDF, getAutoTable, toast]);

  return {
    isLoading,
    exportToPDF,
    exportTableToPDF,
    getJsPDF,
    getAutoTable
  };
};

/**
 * Standalone function for non-React contexts
 */
export const lazyExportPDF = async (
  content: string,
  filename: string = "document.pdf"
): Promise<void> => {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  doc.setFontSize(10);
  doc.text(content, 20, 20);
  doc.save(filename);
};

export default usePDFExport;
