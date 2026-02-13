/**
 * DataExportManager - Componente premium para exportação de dados
 * Suporta múltiplos formatos e configurações avançadas
 */

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, FileText, Table, FileSpreadsheet, FileCode,
  Image, Mail, Cloud, CheckCircle2, Loader2, Settings,
  Calendar, Filter, Columns, Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface ExportColumn {
  id: string;
  label: string;
  selected: boolean;
}

interface DataExportManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  filename?: string;
  onExport?: (format: string, columns: string[], options: ExportOptions) => Promise<void>;
}

interface ExportOptions {
  includeHeaders: boolean;
  dateRange?: { from: Date; to: Date };
  emailTo?: string;
}

const exportFormats = [
  { id: "xlsx", label: "Excel", icon: FileSpreadsheet, description: "Planilha Microsoft Excel" },
  { id: "csv", label: "CSV", icon: Table, description: "Valores separados por vírgula" },
  { id: "pdf", label: "PDF", icon: FileText, description: "Documento formatado" },
  { id: "json", label: "JSON", icon: FileCode, description: "Dados estruturados" },
];

export function DataExportManager({
  open,
  onOpenChange,
  title = "Exportar Dados",
  data,
  columns: initialColumns,
  filename = "export",
  onExport
}: DataExportManagerProps) {
  const [format, setFormat] = useState("xlsx");
  const [columns, setColumns] = useState(initialColumns);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"format" | "columns" | "exporting" | "complete">("format");

  const selectedColumns = columns.filter(c => c.selected);

  const handleToggleColumn = (id: string) => {
    setColumns(prev => prev.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
  };

  const handleSelectAll = () => {
    const allSelected = columns.every(c => c.selected);
    setColumns(prev => prev.map(c => ({ ...c, selected: !allSelected })));
  };

  const handleExport = async () => {
    setStep("exporting");
    setIsExporting(true);
    setProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 100));
        setProgress(i);
      }

      if (onExport) {
        await onExport(
          format, 
          selectedColumns.map(c => c.id),
          { includeHeaders }
        );
      }

      setStep("complete");
      toast.success(`Dados exportados como ${format.toUpperCase()}`, {
        description: `${data.length} registros • ${selectedColumns.length} colunas`
      });
    } catch (error) {
      toast.error("Erro ao exportar dados");
      setStep("format");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("format");
      setProgress(0);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {data.length} registros disponíveis para exportação
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Format Selection */}
          {step === "format" && (
            <motion.div
              key="format"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <Label className="text-sm font-medium mb-3 block">Formato de Exportação</Label>
                <RadioGroup value={format} onValueChange={setFormat} className="grid grid-cols-2 gap-3">
                  {exportFormats.map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <div key={fmt.id}>
                        <RadioGroupItem value={fmt.id} id={fmt.id} className="peer sr-only" />
                        <Label
                          htmlFor={fmt.id}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                        >
                          <Icon className="h-6 w-6 mb-2" />
                          <span className="font-medium">{fmt.label}</span>
                          <span className="text-xs text-muted-foreground text-center mt-1">
                            {fmt.description}
                          </span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="headers" 
                  checked={includeHeaders} 
                  onCheckedChange={(c) => setIncludeHeaders(!!c)} 
                />
                <Label htmlFor="headers" className="text-sm">
                  Incluir cabeçalhos
                </Label>
              </div>
            </motion.div>
          )}

          {/* Step 2: Column Selection */}
          {step === "columns" && (
            <motion.div
              key="columns"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Colunas</Label>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {columns.every(c => c.selected) ? "Desmarcar Todas" : "Selecionar Todas"}
                </Button>
              </div>

              <ScrollArea className="h-[200px] border rounded-lg p-3">
                <div className="space-y-2">
                  {columns.map((column) => (
                    <div key={column.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={column.id} 
                        checked={column.selected}
                        onCheckedChange={() => handleToggleColumn(column.id)}
                      />
                      <Label htmlFor={column.id} className="text-sm cursor-pointer">
                        {column.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{selectedColumns.length} colunas selecionadas</span>
                <Badge variant="secondary">{format.toUpperCase()}</Badge>
              </div>
            </motion.div>
          )}

          {/* Step 3: Exporting */}
          {step === "exporting" && (
            <motion.div
              key="exporting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 space-y-6"
            >
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="font-medium">Exportando dados...</p>
                <p className="text-sm text-muted-foreground">
                  {progress}% concluído
                </p>
              </div>
              <Progress value={progress} className="h-2" />
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <p className="font-medium text-lg">Exportação Concluída!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {filename}.{format} • {data.length} registros • {selectedColumns.length} colunas
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          {step === "format" && (
            <>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={() => setStep("columns")}>
                Selecionar Colunas
              </Button>
            </>
          )}
          {step === "columns" && (
            <>
              <Button variant="outline" onClick={() => setStep("format")}>Voltar</Button>
              <Button onClick={handleExport} disabled={selectedColumns.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar {format.toUpperCase()}
              </Button>
            </>
          )}
          {step === "complete" && (
            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DataExportManager;
