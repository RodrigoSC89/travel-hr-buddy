import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Scan,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  FileCheck,
  Brain,
  Zap,
  Languages,
  FileUp
} from "lucide-react";
import { toast } from "sonner";
import { getOCRService, OCRResult, OCRProgress } from "@/services/ocr-service";

interface ProcessedDocument {
  id: string;
  fileName: string;
  fileType: string;
  imageUrl: string;
  ocrResult: OCRResult;
  processedAt: Date;
  extractedFields?: Map<string, string>;
}

export const PeotramOCRProcessor: React.FC = () => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<ProcessedDocument | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [language, setLanguage] = useState<"por+eng" | "eng" | "por">("por+eng");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrService = getOCRService();

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setCurrentProgress(0);

    try {
      await ocrService.initialize(language);
      
      const filesArray = Array.from(files);
      const processedDocs: ProcessedDocument[] = [];

      if (batchMode && filesArray.length > 1) {
        // Batch processing
        const results = await ocrService.processBatch(
          filesArray,
          (currentIndex, total, itemProgress) => {
            const overallProgress = ((currentIndex + itemProgress.progress) / total) * 100;
            setCurrentProgress(overallProgress);
          }
        );

        for (let i = 0; i < filesArray.length; i++) {
          const file = filesArray[i];
          const imageUrl = URL.createObjectURL(file);
          
          processedDocs.push({
            id: `doc-${Date.now()}-${i}`,
            fileName: file.name,
            fileType: file.type,
            imageUrl,
            ocrResult: results[i],
            processedAt: new Date(),
          });
        }
      } else {
        // Single file processing
        for (const file of filesArray) {
          const imageUrl = URL.createObjectURL(file);
          
          const result = await ocrService.processImage(file, (progress: OCRProgress) => {
            setCurrentProgress(progress.progress * 100);
          });

          const extractedFields = await ocrService.extractFormFields(file);

          processedDocs.push({
            id: `doc-${Date.now()}`,
            fileName: file.name,
            fileType: file.type,
            imageUrl,
            ocrResult: result,
            processedAt: new Date(),
            extractedFields,
          });
        }
      }

      setDocuments(prev => [...processedDocs, ...prev]);
      toast.success(`${processedDocs.length} documento(s) processado(s) com sucesso!`, {
        description: `Confiança média: ${Math.round(processedDocs.reduce((sum, d) => sum + d.ocrResult.confidence, 0) / processedDocs.length)}%`,
      });
      
      if (processedDocs.length > 0) {
        setSelectedDoc(processedDocs[0]);
      }
    } catch (error) {
      toast.error("Erro ao processar documentos", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsProcessing(false);
      setCurrentProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [language, batchMode, ocrService]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const exportResults = () => {
    if (!selectedDoc) return;

    const exportData = {
      fileName: selectedDoc.fileName,
      processedAt: selectedDoc.processedAt,
      confidence: selectedDoc.ocrResult.confidence,
      text: selectedDoc.ocrResult.text,
      extractedFields: selectedDoc.extractedFields ? 
        Object.fromEntries(selectedDoc.extractedFields) : {},
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: "application/json" 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ocr-result-${selectedDoc.fileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatConfidence = (confidence: number) => {
    const percent = Math.round(confidence);
    if (percent >= 90) return { color: "text-green-600", label: "Excelente" };
    if (percent >= 75) return { color: "text-blue-600", label: "Bom" };
    if (percent >= 60) return { color: "text-yellow-600", label: "Regular" };
    return { color: "text-red-600", label: "Baixo" };
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Scan className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">OCR Inteligente PEOTRAM</CardTitle>
                <CardDescription>
                  Processamento avançado de documentos com reconhecimento de texto
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              IA Ativada
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Configurações de Processamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Idioma de Reconhecimento</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                disabled={isProcessing}
              >
                <option value="por+eng">Português + Inglês</option>
                <option value="por">Português</option>
                <option value="eng">Inglês</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Modo de Processamento</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="batchMode"
                  checked={batchMode}
                  onChange={(e) => setBatchMode(e.target.checked)}
                  disabled={isProcessing}
                  className="w-4 h-4"
                />
                <label htmlFor="batchMode" className="text-sm">
                  Processamento em Lote
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Documentos Processados</Label>
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-green-600" />
                <span className="text-lg font-semibold">{documents.length}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple={batchMode}
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={handleUploadClick}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {batchMode ? "Upload Múltiplo" : "Upload Documento"}
                </>
              )}
            </Button>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progresso do OCR</span>
                <span className="font-medium">{Math.round(currentProgress)}%</span>
              </div>
              <Progress value={currentProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Display */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos Processados</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">Lista de Documentos</TabsTrigger>
                <TabsTrigger value="detail">Detalhes</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-2">
                {documents.map((doc) => {
                  const confidenceInfo = formatConfidence(doc.ocrResult.confidence);
                  return (
                    <div
                      key={doc.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDoc?.id === doc.id ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.processedAt.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-sm font-medium ${confidenceInfo.color}`}>
                              {confidenceInfo.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(doc.ocrResult.confidence)}% confiança
                            </p>
                          </div>
                          {doc.ocrResult.confidence >= 90 ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="detail">
                {selectedDoc ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Image Preview */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Imagem Original
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <img
                            src={selectedDoc.imageUrl}
                            alt={selectedDoc.fileName}
                            className="w-full rounded-lg border"
                          />
                        </CardContent>
                      </Card>

                      {/* OCR Results */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Texto Extraído
                            </CardTitle>
                            <Button variant="outline" size="sm" onClick={exportResults}>
                              <Download className="h-4 w-4 mr-2" />
                              Exportar
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">Confiança:</span>
                            <Badge variant={selectedDoc.ocrResult.confidence >= 90 ? "default" : "secondary"}>
                              {Math.round(selectedDoc.ocrResult.confidence)}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">Tempo de Processamento:</span>
                            <span className="text-sm font-medium">
                              {(selectedDoc.ocrResult.processingTime / 1000).toFixed(2)}s
                            </span>
                          </div>
                          <div className="p-3 bg-muted rounded max-h-96 overflow-y-auto">
                            <pre className="text-xs whitespace-pre-wrap font-mono">
                              {selectedDoc.ocrResult.text}
                            </pre>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Extracted Fields */}
                    {selectedDoc.extractedFields && selectedDoc.extractedFields.size > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Campos Extraídos Automaticamente
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Array.from(selectedDoc.extractedFields.entries()).map(([key, value]) => (
                              <div key={key} className="p-3 border rounded-lg">
                                <Label className="text-xs text-muted-foreground">{key}</Label>
                                <p className="mt-1 font-medium">{value}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Selecione um documento para ver os detalhes</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
