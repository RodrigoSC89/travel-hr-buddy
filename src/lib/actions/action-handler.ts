/**
 * Global Action Handler - PATCH 750
 * Centralized handler for common actions across the system
 */

import { toast } from "@/hooks/use-toast";

export type ActionType = 
  | "navigate"
  | "copy"
  | "download"
  | "share"
  | "print"
  | "export"
  | "refresh"
  | "delete"
  | "edit"
  | "view"
  | "toggle"
  | "submit"
  | "cancel"
  | "confirm"
  | "custom";

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export interface ActionConfig {
  type: ActionType;
  label: string;
  icon?: string;
  confirmMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  handler: () => Promise<ActionResult> | ActionResult;
}

/**
 * Execute action with loading state and feedback
 */
export async function executeAction(
  config: ActionConfig,
  setLoading?: (loading: boolean) => void
): Promise<ActionResult> {
  const {
    label,
    confirmMessage,
    successMessage,
    errorMessage,
    handler
  } = config;

  try {
    // Show confirmation if needed
    if (confirmMessage) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        return { success: false, message: "Ação cancelada" };
      }
    }

    setLoading?.(true);

    const result = await handler();

    if (result.success) {
      if (successMessage || result.message) {
        toast({
          title: "Sucesso",
          description: successMessage || result.message || `${label} realizado com sucesso`,
        });
      }
    } else {
      toast({
        title: "Erro",
        description: errorMessage || result.message || `Erro ao ${label.toLowerCase()}`,
        variant: "destructive",
      });
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    
    toast({
      title: "Erro",
      description: errorMessage || message,
      variant: "destructive",
    });

    return { success: false, message };
  } finally {
    setLoading?.(false);
  }
}

/**
 * Common action handlers
 */
export const commonActions = {
  /**
   * Copy text to clipboard
   */
  copyToClipboard: async (text: string): Promise<ActionResult> => {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, message: "Copiado para a área de transferência" };
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return { success: true, message: "Copiado para a área de transferência" };
    }
  },

  /**
   * Share content using Web Share API
   */
  share: async (data: ShareData): Promise<ActionResult> => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return { success: true, message: "Conteúdo compartilhado" };
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return { success: false, message: "Compartilhamento cancelado" };
        }
        throw error;
      }
    }
    
    // Fallback: copy to clipboard
    const text = data.url || data.text || data.title || "";
    return commonActions.copyToClipboard(text);
  },

  /**
   * Download file
   */
  downloadFile: async (url: string, filename: string): Promise<ActionResult> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      return { success: true, message: "Download iniciado" };
    } catch {
      return { success: false, message: "Erro ao baixar arquivo" };
    }
  },

  /**
   * Print page or element
   */
  print: (elementId?: string): ActionResult => {
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Imprimir</title>
                <style>
                  body { font-family: system-ui, sans-serif; padding: 20px; }
                  @media print { body { padding: 0; } }
                </style>
              </head>
              <body>${element.innerHTML}</body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    } else {
      window.print();
    }
    return { success: true };
  },

  /**
   * Refresh page or data
   */
  refresh: (): ActionResult => {
    window.location.reload();
    return { success: true };
  },

  /**
   * Navigate to URL
   */
  navigate: (url: string, newTab: boolean = false): ActionResult => {
    if (newTab) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = url;
    }
    return { success: true };
  },

  /**
   * Export data as JSON
   */
  exportJSON: (data: any, filename: string): ActionResult => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, message: "Exportação concluída" };
  },

  /**
   * Export data as CSV
   */
  exportCSV: (data: Record<string, any>[], filename: string): ActionResult => {
    if (!data.length) {
      return { success: false, message: "Nenhum dado para exportar" };
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map(row => 
        headers.map(h => {
          const value = row[h];
          if (typeof value === "string" && (value.includes(",") || value.includes("\""))) {
            return `"${value.replace(/"/g, "\"\"")}"`;
          }
          return value;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, message: "Exportação CSV concluída" };
  }
});

export default executeAction;
