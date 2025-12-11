import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Loader2, Sparkles, Users, Settings, BarChart3, Target } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import ReactMarkdown from "react-markdown";

interface AIReportGeneratorProps {
  onReportGenerated?: (report: GeneratedReport) => void;
}

interface GeneratedReport {
  id?: string;
  content: string;
  type: string;
  format: string;
  generatedAt: string;
  dataPoints: number;
  rawData?: Record<string, unknown>;
}

const AIReportGenerator: React.FC<AIReportGeneratorProps> = ({ onReportGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<string>("");
  const [format, setFormat] = useState<string>("detailed");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [lastReport, setLastReport] = useState<GeneratedReport | null>(null);
  const [showFullReport, setShowFullReport] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: "hr", label: "Recursos Humanos", icon: Users, description: "Análise de tripulação, certificados e competências" },
    { value: "operational", label: "Operacional", icon: Settings, description: "Manutenções, embarcações e tarefas" },
    { value: "analytics", label: "Analytics", icon: BarChart3, description: "Alertas, insights e eventos do sistema" },
    { value: "custom", label: "Personalizado", icon: Target, description: "Relatório customizado com suas instruções" }
  ];

  const formats = [
    { value: "summary", label: "Resumo Executivo", description: "Pontos principais e métricas chave" },
    { value: "detailed", label: "Detalhado", description: "Análise completa com recomendações" },
    { value: "executive", label: "Executivo", description: "Insights estratégicos de alto nível" }
  ];

  const availableModules = [
    { id: "hr", label: "Recursos Humanos" },
    { id: "certificates", label: "Certificados" },
    { id: "analytics", label: "Analytics" },
    { id: "operational", label: "Operacional" },
    { id: "alerts", label: "Alertas de Preço" }
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
      
      const response = await fetch("https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/generate-ai-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuYnB0bWl4dndyb3B2YW55aGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzczNTEsImV4cCI6MjA3NDE1MzM1MX0.-LivvlGPJwz_Caj5nVk_dhVeheaXPCROmXc4G8UsJcE",
        },
        body: JSON.stringify({
          type: reportType,
          dateRange,
          modules: selectedModules,
          format,
          customPrompt: customPrompt || undefined
        })
      });


      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 429) {
          throw new Error("Limite de requisições excedido. Aguarde alguns minutos e tente novamente.");
        }
        if (response.status === 402) {
          throw new Error("Créditos de IA insuficientes. Adicione créditos ao workspace.");
        }
        throw new Error(`Erro ${response.status}: ${errorText || "Falha ao gerar relatório"}`);
      }

      const data = await response.json();

      if (data.success && data.report) {
        setLastReport(data.report);
        onReportGenerated?.(data.report);
        
        toast({
          title: "Relatório Gerado",
          description: "Relatório criado com sucesso usando IA generativa",
        });
      } else {
        throw new Error(data.error || "Erro ao gerar relatório");
      }
    } catch (error) {
      console.error("[AIReportGenerator] Error:", error);
      console.error("[AIReportGenerator] Error:", error);
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
    
    toast({
      title: "Download Iniciado",
      description: "Relatório salvo como arquivo Markdown",
    });
  };

  const handleModuleChange = (moduleId: string, checked: boolean) => {
    if (checked) {
      setSelectedModules(prev => [...prev, moduleId]);
    } else {
      setSelectedModules(prev => prev.filter(id => id !== moduleId));
    }
  };

  const getTypeIcon = (typeValue: string) => {
    const type = reportTypes.find(t => t.value === typeValue);
    return type?.icon || FileText;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerador de Relatórios com IA
          </CardTitle>
          <CardDescription>
            Gere relatórios inteligentes e personalizados usando IA generativa
          </CardDescription>
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
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {reportType && (
              <p className="text-sm text-muted-foreground">
                {reportTypes.find(t => t.value === reportType)?.description}
              </p>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Formato</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map((fmt) => (
                  <SelectItem key={fmt.value} value={fmt.value}>
                    <div className="flex flex-col">
                      <span>{fmt.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {formats.find(f => f.value === format)?.description}
            </p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Module Selection */}
          <div className="space-y-2">
            <Label>Módulos Adicionais (Opcional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Inclua dados de outros módulos no relatório
            </p>
            <div className="grid grid-cols-2 gap-3">
              {availableModules.map((module) => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={module.id}
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={(checked) => handleModuleChange(module.id, !!checked)}
                  />
                  <Label htmlFor={module.id} className="text-sm font-normal cursor-pointer">
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
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Descreva que tipo de análise ou insights específicos você gostaria no relatório. Ex: 'Foque em certificações vencendo nos próximos 60 dias e sugira ações preventivas'..."
                rows={4}
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
                Gerando Relatório com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Relatório com IA
              </>
            )}
          </Button>

          {/* Last Report Preview */}
          {lastReport && (
            <Card className="mt-6 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {React.createElement(getTypeIcon(lastReport.type), { className: "h-5 w-5 text-primary" })}
                    <CardTitle className="text-lg">Relatório Gerado</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowFullReport(!showFullReport)}
                      variant="outline"
                      size="sm"
                    >
                      {showFullReport ? "Resumir" : "Ver Completo"}
                    </Button>
                    <Button
                      onClick={downloadReport}
                      variant="default"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                      Tipo: {reportTypes.find(t => t.value === lastReport.type)?.label || lastReport.type}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-secondary px-2 py-1 rounded">
                      Formato: {formats.find(f => f.value === lastReport.format)?.label || lastReport.format}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      Gerado: {new Date(lastReport.generatedAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className={`bg-background rounded-lg p-4 ${showFullReport ? 'max-h-[600px]' : 'max-h-60'} overflow-y-auto prose prose-sm dark:prose-invert max-w-none`}>
                    <ReactMarkdown>
                      {showFullReport ? lastReport.content : lastReport.content.substring(0, 1000) + (lastReport.content.length > 1000 ? '...' : '')}
                    </ReactMarkdown>
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
