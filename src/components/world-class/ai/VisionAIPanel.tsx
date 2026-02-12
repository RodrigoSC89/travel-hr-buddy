/**
 * M006 - Vision AI Panel
 * Multi-modal equipment inspection with camera/upload
 */
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera, Upload, Eye, AlertTriangle, CheckCircle, Wrench,
  FileText, Shield, Loader2, ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

type AnalysisType = "equipment_inspection" | "document_ocr" | "damage_assessment" | "safety_check";

interface AnalysisResult {
  type: AnalysisType;
  analysis: Record<string, unknown>;
  raw: string;
  timestamp: string;
  imagePreview?: string;
}

const TYPE_CONFIG: Record<AnalysisType, { label: string; icon: React.ReactNode; description: string }> = {
  equipment_inspection: { label: "Inspeção", icon: <Wrench className="h-4 w-4" />, description: "Analisa condição de equipamentos" },
  document_ocr: { label: "Documento OCR", icon: <FileText className="h-4 w-4" />, description: "Extrai dados de documentos" },
  damage_assessment: { label: "Avaria", icon: <AlertTriangle className="h-4 w-4" />, description: "Avalia danos e custos" },
  safety_check: { label: "Segurança", icon: <Shield className="h-4 w-4" />, description: "Verifica riscos de segurança" },
};

export const VisionAIPanel: React.FC = () => {
  const [selectedType, setSelectedType] = useState<AnalysisType>("equipment_inspection");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    await analyzeImage(base64, file.type);
  };

  const analyzeImage = async (imageBase64: string, mimeType: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("vision-ai-analyzer", {
        body: {
          type: selectedType,
          imageBase64,
          mimeType,
        },
      });

      if (error) throw error;

      const result: AnalysisResult = {
        type: data.type,
        analysis: data.analysis,
        raw: data.raw,
        timestamp: data.timestamp,
        imagePreview: preview || undefined,
      };

      setResults(prev => [result, ...prev]);
      toast.success("Análise concluída com sucesso!");
    } catch (err) {
      logger.error("Vision AI error", err as Error);
      toast.error("Erro na análise visual. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: unknown): string => {
    const s = Number(severity) || 0;
    if (s <= 3) return "text-green-400";
    if (s <= 6) return "text-yellow-400";
    if (s <= 8) return "text-orange-400";
    return "text-destructive";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-5 w-5 text-primary" />
          Vision AI
          <Badge variant="outline" className="text-xs">M006</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Type selector */}
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.entries(TYPE_CONFIG) as [AnalysisType, typeof TYPE_CONFIG[AnalysisType]][]).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md border text-xs transition-colors",
                selectedType === type ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent/50"
              )}
            >
              {config.icon}
              {config.label}
            </button>
          ))}
        </div>

        {/* Upload area */}
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors",
            isAnalyzing ? "border-primary/50 bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
          )}
          onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-32 rounded-md object-contain" />
          ) : (
            <>
              <Camera className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Clique para enviar foto</p>
              <p className="text-xs text-muted-foreground/70">{TYPE_CONFIG[selectedType].description}</p>
            </>
          )}
          {isAnalyzing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
              <div className="flex items-center gap-2 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Analisando imagem...</span>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {results.map((result, i) => (
                <div key={`vision-${i}-${result.type}`} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {TYPE_CONFIG[result.type].icon}
                      <span className="ml-1">{TYPE_CONFIG[result.type].label}</span>
                    </Badge>
                    {result.analysis.severity != null && (
                      <span className={cn("text-sm font-bold", getSeverityColor(result.analysis.severity))}>
                        Severidade: {String(result.analysis.severity)}/10
                      </span>
                    )}
                    {result.analysis.condition != null && (
                      <Badge variant={String(result.analysis.condition) === "good" ? "default" : "destructive"} className="text-xs">
                        {String(result.analysis.condition)}
                      </Badge>
                    )}
                  </div>

                  {/* Key findings */}
                  {Array.isArray(result.analysis.findings) && (
                    <div className="space-y-1">
                      {(result.analysis.findings as Array<Record<string, string>>).slice(0, 3).map((f, j) => (
                        <div key={j} className="flex items-start gap-1.5 text-xs">
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-yellow-400" />
                          <span>{f.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommended actions */}
                  {Array.isArray(result.analysis.recommended_actions) && (
                    <div className="space-y-1">
                      {(result.analysis.recommended_actions as string[]).slice(0, 2).map((a, j) => (
                        <div key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 shrink-0 mt-0.5 text-green-400" />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Raw text fallback */}
                  {!result.analysis.findings && !result.analysis.recommended_actions && result.raw && (
                    <p className="text-xs text-muted-foreground line-clamp-4">{result.raw}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default VisionAIPanel;
