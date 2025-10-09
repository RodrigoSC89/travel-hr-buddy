import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Loader2, Calendar, Settings, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AIReportGeneratorProps {
  onReportGenerated?: (report: any) => void;
}

const AIReportGenerator: React.FC<AIReportGeneratorProps> = ({ onReportGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<string>("");
  const [format, setFormat] = useState<string>("summary");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [lastReport, setLastReport] = useState<any>(null);
  const { toast } = useToast();

  const reportTypes = [
    { value: "hr", label: "Recursos Humanos", icon: "👥" },
    { value: "operational", label: "Operacional", icon: "⚙️" },
    { value: "analytics", label: "Analytics", icon: "📊" },
    { value: "custom", label: "Personalizado", icon: "🎯" },
  ];

  const formats = [
    { value: "summary", label: "Resumo Executivo" },
    { value: "detailed", label: "Detalhado" },
    { value: "executive", label: "Executivo" },
  ];

  const availableModules = [
    { id: "hr", label: "Recursos Humanos" },
    { id: "certificates", label: "Certificados" },
    { id: "analytics", label: "Analytics" },
    { id: "operational", label: "Operacional" },
    { id: "alerts", label: "Alertas de Preço" },
  ];

  const generateReport = async () => {
    if (!reportType) {
      toast({
        title: "Erro",
        description: "Selecione um tipo de relatório",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-report", {
        body: {
          type: reportType,
          dateRange,
          modules: selectedModules,
          format,
          customPrompt: customPrompt || undefined,
        },
      });

      if (error) throw error;

      if (data.success) {
        setLastReport(data.report);
        onReportGenerated?.(data.report);

        toast({
          title: "Relatório Gerado",
          description: "Relatório criado com sucesso usando IA",
        });
      } else {
        throw new Error(data.error || "Erro ao gerar relatório");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao gerar relatório",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!lastReport) return;

    const blob = new Blob([lastReport.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${lastReport.type}-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleModuleChange = (moduleId: string, checked: boolean) => {
    if (checked) {
      setSelectedModules(prev => [...prev, moduleId]);
    } else {
      setSelectedModules(prev => prev.filter(id => id !== moduleId));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerador de Relatórios com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label>Tipo de Relatório</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Formato</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map(fmt => (
                  <SelectItem key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Module Selection */}
          <div className="space-y-2">
            <Label>Módulos para Incluir (Opcional)</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableModules.map(module => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={module.id}
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={checked => handleModuleChange(module.id, !!checked)}
                  />
                  <Label htmlFor={module.id} className="text-sm font-normal">
                    {module.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          {reportType === "custom" && (
            <div className="space-y-2">
              <Label>Instruções Personalizadas</Label>
              <Textarea
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                placeholder="Descreva que tipo de análise ou insights específicos você gostaria no relatório..."
                rows={3}
              />
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateReport}
            disabled={isGenerating || !reportType}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando Relatório...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório com IA
              </>
            )}
          </Button>

          {/* Last Report Preview */}
          {lastReport && (
            <Card className="mt-6 bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Último Relatório Gerado</CardTitle>
                  <Button onClick={downloadReport} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Tipo: {lastReport.type}</span>
                    <span>Formato: {lastReport.format}</span>
                    <span>Gerado: {new Date(lastReport.generatedAt).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="bg-background rounded p-4 max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">
                      {lastReport.content.substring(0, 500)}...
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIReportGenerator;
