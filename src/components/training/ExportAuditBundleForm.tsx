import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuditExport } from "@/hooks/use-training-modules";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";

// Common IMCA norms
const COMMON_NORMS = [
  "IMCA M 103",
  "IMCA M 117",
  "IMCA M 179",
  "IMCA M 182",
  "IMCA M 190",
  "IMCA M 220",
  "IMCA D 045",
  "IMCA R 008",
  "IMCA SEL 016"
];

/**
 * Component for exporting audit bundles for external audits
 * (IBAMA, Petrobras, ANP, etc.)
 */
export function ExportAuditBundleForm() {
  const { exportBundle, isExporting } = useAuditExport();
  const [vesselName, setVesselName] = useState("");
  const [selectedNorms, setSelectedNorms] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState<"json" | "pdf">("json");

  const handleAddNorm = (norm: string) => {
    if (!selectedNorms.includes(norm)) {
      setSelectedNorms([...selectedNorms, norm]);
    }
  };

  const handleRemoveNorm = (norm: string) => {
    setSelectedNorms(selectedNorms.filter(n => n !== norm));
  };

  const handleExport = async () => {
    if (!vesselName || selectedNorms.length === 0) {
      toast.error("Preencha o nome da embarcação e selecione ao menos uma norma");
      return;
    }

    try {
      const result = await exportBundle({
        vesselName,
        norms: selectedNorms,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        format: exportFormat
      });

      if (result.success && result.bundle) {
        // Download as JSON
        const blob = new Blob([JSON.stringify(result.bundle, null, 2)], {
          type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-bundle-${vesselName}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Bundle exportado com sucesso!");
      }
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Bundle para Auditoria Externa
        </CardTitle>
        <CardDescription>
          Gere relatórios estruturados para IBAMA, Petrobras, ANP e outras entidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vessel">Nome da Embarcação *</Label>
          <Input
            id="vessel"
            placeholder="Ex: Navio XYZ-456"
            value={vesselName}
            onChange={(e) => setVesselName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Normas IMCA *</Label>
          <Select onValueChange={handleAddNorm}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar normas..." />
            </SelectTrigger>
            <SelectContent>
              {COMMON_NORMS.map((norm) => (
                <SelectItem key={norm} value={norm}>
                  {norm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedNorms.map((norm) => (
              <div
                key={norm}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {norm}
                <button
                  onClick={() => handleRemoveNorm(norm)}
                  className="hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Data Inicial (Opcional)</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Data Final (Opcional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Formato de Exportação</Label>
          <Select value={exportFormat} onValueChange={(v: "json" | "pdf") => setExportFormat(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  JSON (Estruturado)
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF (Frontend irá gerar)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted p-4 rounded-md text-sm">
          <p className="font-medium mb-2">O bundle incluirá:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Logs de auditoria filtrados por norma</li>
            <li>Taxa de conformidade e estatísticas</li>
            <li>Não conformidades identificadas</li>
            <li>Módulos de treinamento relacionados</li>
            <li>Metadados do relatório</li>
          </ul>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting || !vesselName || selectedNorms.length === 0}
          className="w-full"
        >
          {isExporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isExporting ? "Exportando..." : "Exportar Bundle de Auditoria"}
        </Button>
      </CardContent>
    </Card>
  );
}
