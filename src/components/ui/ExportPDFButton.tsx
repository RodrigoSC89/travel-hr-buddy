/**
 * Premium PDF Export Button
 * One-click branded report generation
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadPremiumReport } from "@/lib/pdf/premium-report-template";

interface ExportPDFButtonProps {
  title: string;
  subtitle?: string;
  vesselName?: string;
  data: Record<string, unknown>[];
  columns: { header: string; key: string }[];
  filename?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}

export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  title,
  subtitle,
  vesselName,
  data,
  columns,
  filename,
  variant = "outline",
  size = "sm",
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (data.length === 0) {
      toast.warning("Nenhum dado para exportar");
      return;
    }

    setLoading(true);
    try {
      await downloadPremiumReport({
        title,
        subtitle,
        vesselName,
        data,
        columns,
      }, filename);
      toast.success("Relatório PDF exportado com sucesso!");
    } catch (err) {
      toast.error("Erro ao gerar relatório PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {size !== "icon" && "Exportar PDF"}
    </Button>
  );
};
