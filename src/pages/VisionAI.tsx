/**
 * Vision AI - Multimodal Document & Image Analysis
 * Upload photos/documents for automatic AI analysis with OCR
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';
import {
  Camera,
  FileText,
  Upload,
  Scan,
  Shield,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  Eye,
  Download,
  Sparkles
} from "lucide-react";

type VisionOperation = 
  | "analyze-image" 
  | "ocr-document" 
  | "equipment-inspection" 
  | "certificate-validation"
  | "damage-assessment";

interface AnalysisResult {
  success: boolean;
  operation: string;
  analysis: string;
  structured?: Record<string, unknown>;
  timestamp: string;
}

const operationConfig: Record<VisionOperation, { icon: React.ReactNode; label: string; description: string }> = {
  "analyze-image": {
    icon: <Eye className="h-5 w-5" />,
    label: "Análise Geral",
    description: "Análise completa de imagens marítimas"
  },
  "ocr-document": {
    icon: <FileText className="h-5 w-5" />,
    label: "OCR Documento",
    description: "Extração de texto de documentos e certificados"
  },
  "equipment-inspection": {
    icon: <Wrench className="h-5 w-5" />,
    label: "Inspeção Equipamento",
    description: "Avaliação técnica de equipamentos"
  },
  "certificate-validation": {
    icon: <Shield className="h-5 w-5" />,
    label: "Validar Certificado",
    description: "Extração e validação de certificados marítimos"
  },
  "damage-assessment": {
    icon: <AlertTriangle className="h-5 w-5" />,
    label: "Avaliação de Danos",
    description: "Perícia de danos e estimativa de reparo"
  }
};

export default function VisionAI() {
  const { toast } = useToast();
  const [selectedOperation, setSelectedOperation] = useState<VisionOperation>("analyze-image");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie uma imagem ou PDF.",
        variant: "destructive"
      });
      return;
    }

    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      // Extract base64 from data URL
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleAnalyze = async () => {
    if (!imageBase64) {
      toast({
        title: "Imagem necessária",
        description: "Por favor, faça upload de uma imagem primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("nauti-vision", {
        body: {
          operation: selectedOperation,
          imageBase64,
          mimeType,
          prompt: additionalPrompt || undefined
        }
      });

      if (error) throw error;

      const analysisResult: AnalysisResult = data;
      setResult(analysisResult);
      setHistory(prev => [analysisResult, ...prev].slice(0, 10));

      toast({
        title: "Análise concluída",
        description: `${operationConfig[selectedOperation].label} realizada com sucesso.`,
      });
    } catch (error) {
      logger.error("Vision AI error:", error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Falha ao analisar imagem",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a full implementation, would show camera preview and capture
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Câmera disponível",
        description: "Use o botão de upload para enviar uma foto.",
      });
    } catch {
      toast({
        title: "Câmera indisponível",
        description: "Não foi possível acessar a câmera. Use o upload de arquivo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Vision AI
          </h1>
          <p className="text-muted-foreground">
            Análise multimodal de imagens e documentos com IA
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Powered by Gemini Vision
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload & Configuração
            </CardTitle>
            <CardDescription>
              Envie uma imagem ou documento para análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Operation Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Análise</label>
              <Select 
                value={selectedOperation} 
                onValueChange={(v) => setSelectedOperation(v as VisionOperation)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(operationConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {operationConfig[selectedOperation].description}
              </p>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Imagem</label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={handleCameraCapture}>
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative border rounded-lg overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-contain bg-muted"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImagePreview(null);
                    setImageBase64(null);
                  }}
                >
                  ✕
                </Button>
              </div>
            )}

            {/* Additional Context */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Contexto Adicional (opcional)</label>
              <Textarea
                placeholder="Ex: Este é um motor diesel de propulsão principal..."
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                rows={3}
              />
            </div>

            {/* Analyze Button */}
            <Button 
              className="w-full" 
              onClick={handleAnalyze}
              disabled={!imageBase64 || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-4 w-4" />
                  Analisar com IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Resultado da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="analysis">
              <TabsList className="w-full">
                <TabsTrigger value="analysis" className="flex-1">Análise</TabsTrigger>
                <TabsTrigger value="structured" className="flex-1">Dados</TabsTrigger>
                <TabsTrigger value="history" className="flex-1">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="mt-4">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Processando imagem com IA...</p>
                  </div>
                ) : result ? (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <Badge>{operationConfig[selectedOperation].label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                          {result.analysis}
                        </pre>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
                    <p>Nenhuma análise realizada</p>
                    <p className="text-sm">Faça upload de uma imagem para começar</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="structured" className="mt-4">
                {result?.structured ? (
                  <ScrollArea className="h-[400px]">
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                      {JSON.stringify(result.structured, null, 2)}
                    </pre>
                    <Button variant="outline" size="sm" className="mt-4">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar JSON
                    </Button>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mb-4 opacity-50" />
                    <p>Dados estruturados não disponíveis</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <ScrollArea className="h-[400px]">
                  {history.length > 0 ? (
                    <div className="space-y-3">
                      {history.map((item, index) => (
                        <div 
                          key={index}
                          className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => setResult(item)}
                        >
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{item.operation}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <p className="text-sm mt-2 line-clamp-2">
                            {item.analysis.substring(0, 100)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <p>Nenhuma análise no histórico</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-5 gap-4">
        {Object.entries(operationConfig).map(([key, config]) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedOperation === key ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => setSelectedOperation(key as VisionOperation)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-primary/10 mb-2">
                {config.icon}
              </div>
              <h3 className="font-medium text-sm">{config.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {config.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
