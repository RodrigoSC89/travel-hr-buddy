/**
 * PATCH 1003 - AI Lab Playground
 * Interactive playground for AI-powered data analysis
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Upload,
  FileText,
  BarChart3,
  Search,
  Lightbulb,
  Sparkles,
  Copy,
  Download,
  Save,
  History,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type AnalysisType = "summarize" | "analyze" | "extract" | "predict" | "insights" | "custom";
type DataType = "json" | "csv" | "text" | "table";
type OutputFormat = "markdown" | "json" | "html";

interface SavedAnalysis {
  id: string;
  title: string;
  type: AnalysisType;
  input: string;
  output: string;
  createdAt: Date;
}

const ANALYSIS_OPTIONS = [
  { value: "summarize", label: "Resumir", icon: FileText, description: "Resumo executivo dos dados" },
  { value: "analyze", label: "Analisar", icon: BarChart3, description: "Análise completa com métricas" },
  { value: "extract", label: "Extrair", icon: Search, description: "Extrair informações estruturadas" },
  { value: "predict", label: "Prever", icon: Lightbulb, description: "Previsões baseadas em tendências" },
  { value: "insights", label: "Insights", icon: Sparkles, description: "Insights acionáveis" },
  { value: "custom", label: "Personalizado", icon: Brain, description: "Prompt customizado" },
];

export function AILabPlayground() {
  const [inputData, setInputData] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [analysisType, setAnalysisType] = useState<AnalysisType>("analyze");
  const [dataType, setDataType] = useState<DataType>("text");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("markdown");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [analysisTitle, setAnalysisTitle] = useState("");

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputData(content);
      
      // Auto-detect data type
      if (file.name.endsWith(".json")) {
        setDataType("json");
      } else if (file.name.endsWith(".csv")) {
        setDataType("csv");
      } else {
        setDataType("text");
      }
      
      toast.success(`Arquivo ${file.name} carregado`);
    };
    reader.readAsText(file);
  }, []);

  const runAnalysis = async () => {
    if (!inputData.trim()) {
      toast.error("Insira dados para análise");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-lab-analyze", {
        body: {
          type: analysisType,
          data: inputData,
          dataType,
          customPrompt: analysisType === "custom" ? customPrompt : undefined,
          options: {
            language: "pt-BR",
            format: outputFormat,
          },
        },
      });

      if (fnError) throw fnError;

      if (data?.error) {
        setError(data.error);
        toast.error(data.error);
      } else {
        setResult(data.result || "");
        toast.success("Análise concluída!");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao processar análise";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalysis = () => {
    if (!result || !analysisTitle.trim()) {
      toast.error("Adicione um título para salvar");
      return;
    }

    const newAnalysis: SavedAnalysis = {
      id: crypto.randomUUID(),
      title: analysisTitle,
      type: analysisType,
      input: inputData,
      output: result,
      createdAt: new Date(),
    };

    setSavedAnalyses((prev) => [newAnalysis, ...prev]);
    setAnalysisTitle("");
    toast.success("Análise salva!");
  };

  const loadAnalysis = (analysis: SavedAnalysis) => {
    setInputData(analysis.input);
    setResult(analysis.output);
    setAnalysisType(analysis.type);
    toast.success("Análise carregada");
  };

  const deleteAnalysis = (id: string) => {
    setSavedAnalyses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Análise removida");
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    toast.success("Copiado para a área de transferência");
  };

  const downloadResult = () => {
    const extension = outputFormat === "json" ? "json" : outputFormat === "html" ? "html" : "md";
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analise-${Date.now()}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download iniciado");
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Lab
              </CardTitle>
              <CardDescription>
                Playground para análises avançadas com IA
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Gemini 2.5 Flash
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analyze" className="gap-1">
                <BarChart3 className="h-4 w-4" />
                Analisar
              </TabsTrigger>
              <TabsTrigger value="results" className="gap-1">
                <FileText className="h-4 w-4" />
                Resultados
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="space-y-4 mt-4">
              {/* Analysis Type Selection */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ANALYSIS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAnalysisType(option.value as AnalysisType)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                      analysisType === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 hover:bg-muted"
                    )}
                  >
                    <option.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground text-center">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Prompt (if custom type) */}
              {analysisType === "custom" && (
                <div className="space-y-2">
                  <Label>Prompt Personalizado</Label>
                  <Textarea
                    placeholder="Descreva o que você deseja que a IA faça com os dados..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              )}

              <Separator />

              {/* Data Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Dados de Entrada</Label>
                  <div className="flex items-center gap-2">
                    <Select value={dataType} onValueChange={(v) => setDataType(v as DataType)}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="table">Tabela</SelectItem>
                      </SelectContent>
                    </Select>
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept=".txt,.json,.csv,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>

                <Textarea
                  placeholder="Cole seus dados aqui ou faça upload de um arquivo..."
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />

                <div className="flex items-center justify-between">
                  <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={runAnalysis} disabled={isLoading || !inputData.trim()}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Executar Análise
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="mt-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {result ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        Análise concluída
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={copyResult}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadResult}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-[400px] rounded-lg border p-4">
                    {outputFormat === "markdown" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{result}</ReactMarkdown>
                      </div>
                    ) : (
                      <pre className="text-sm font-mono whitespace-pre-wrap">{result}</pre>
                    )}
                  </ScrollArea>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Título para salvar..."
                      value={analysisTitle}
                      onChange={(e) => setAnalysisTitle(e.target.value)}
                    />
                    <Button onClick={saveAnalysis} disabled={!analysisTitle.trim()}>
                      <Save className="h-4 w-4 mr-1" />
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                  <Brain className="h-12 w-12 mb-4 opacity-50" />
                  <p>Execute uma análise para ver os resultados</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <ScrollArea className="h-[400px]">
                {savedAnalyses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <History className="h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhuma análise salva</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedAnalyses.map((analysis) => (
                      <div
                        key={analysis.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            {ANALYSIS_OPTIONS.find((o) => o.value === analysis.type)?.icon && (
                              <Brain className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{analysis.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {analysis.createdAt.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {analysis.type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadAnalysis(analysis)}
                          >
                            Carregar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAnalysis(analysis.id)}
                            aria-label="Excluir análise"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default AILabPlayground;
