/**
import { useState, useCallback } from "react";;
 * LazyPDFGenerator - FASE 2.5 Lazy Loading
 * Wrapper lazy para jsPDF (1.04MB)
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { loadJsPDF, loadHtml2PDF, loadJsPDFAutoTable } from "@/lib/lazy-loaders";

interface LazyPDFGeneratorProps {
  fileName?: string;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  onGenerate?: () => Promise<any>;
  children?: React.ReactNode;
  className?: string;
  useHtml2PDF?: boolean;
  useAutoTable?: boolean;
}

export const LazyPDFGenerator = memo(function({
  fileName = "documento.pdf",
  buttonText = "Exportar PDF",
  buttonVariant = "outline",
  onGenerate,
  children,
  className = "",
  useHtml2PDF = false,
  useAutoTable = false,
}: LazyPDFGeneratorProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (useHtml2PDF) {
        const html2pdf = await loadHtml2PDF();
        if (onGenerate) {
          const element = await onGenerate();
          await html2pdf().from(element).save(fileName);
        }
      } else {
        const jsPDF = await loadJsPDF();
        if (useAutoTable) {
          await loadJsPDFAutoTable();
        }
        if (onGenerate) {
          await onGenerate();
        }
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <Button
      variant={buttonVariant}
      onClick={handleGenerate}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
}

export default LazyPDFGenerator;
