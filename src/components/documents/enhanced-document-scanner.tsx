import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Camera, 
  Upload, 
  FileText, 
  Scan, 
  Eye,
  Download,
  Share2,
  RefreshCw,
  Check,
  X,
  Zap,
  Brain,
  FileCheck,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Maximize2,
  Crop,
  RotateCw,
  Contrast
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface DocumentScanResult {
  id: string;
  fileName: string;
  fileType: string;
  imageUrl: string;
  extractedText: string;
  confidence: number;
  processedAt: Date;
  analysis?: {
    summary: string;
    keyPoints: string[];
    entities: string[];
    sentiment: string;
    category: string;
    confidence: number;
  };
  metadata: {
    pages: number;
    language: string;
    resolution: string;
    fileSize: number;
  };
}

interface ScanSettings {
  quality: "low" | "medium" | "high" | "ultra";
  autoEnhance: boolean;
  multipage: boolean;
  ocrLanguage: "pt" | "en" | "es" | "auto";
  outputFormat: "pdf" | "jpg" | "png";
}

export const EnhancedDocumentScanner: React.FC = () => {
  const [scanResults, setScanResults] = useState<DocumentScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedResult, setSelectedResult] = useState<DocumentScanResult | null>(null);
  const [scanSettings, setScanSettings] = useState<ScanSettings>({
    quality: "high",
    autoEnhance: true,
    multipage: false,
    ocrLanguage: "pt",
    outputFormat: "pdf"
  });
  const [currentStep, setCurrentStep] = useState<"capture" | "preview" | "enhance" | "ocr" | "analysis">("capture");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera não suportada neste dispositivo");
      }

      const constraints = {
        video: {
          facingMode: isMobile ? "environment" : "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      toast({
        title: "Câmera ativada",
        description: "Posicione o documento e capture a imagem"
      });
    } catch (error) {
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera. Use o upload de arquivo.",
        variant: "destructive"
      });
    }
  }, [isMobile, toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageDataUrl);
    setCurrentStep("preview");
    stopCamera();

    toast({
      title: "Imagem capturada",
      description: "Revise a imagem antes de processar"
    });
  }, [stopCamera, toast]);

  const processDocument = async (imageFile: File | string) => {
    setIsProcessing(true);
    setIsScanning(true);
    setScanProgress(0);
    setCurrentStep("ocr");

    try {
      // Simular progresso
      const progressSteps = [
        { step: 20, message: "Preparando imagem..." },
        { step: 40, message: "Aplicando melhorias..." },
        { step: 60, message: "Executando OCR..." },
        { step: 80, message: "Analisando conteúdo..." },
        { step: 100, message: "Finalizando..." }
      ];

      for (const { step, message } of progressSteps) {
        setScanProgress(step);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Simular resultado OCR
      const mockResult: DocumentScanResult = {
        id: Date.now().toString(),
        fileName: typeof imageFile === "string" ? "camera_capture.jpg" : imageFile.name,
        fileType: "image/jpeg",
        imageUrl: typeof imageFile === "string" ? imageFile : URL.createObjectURL(imageFile),
        extractedText: `Documento digitalizado com sucesso.\n\nEste é um exemplo de texto extraído via OCR do documento capturado. O sistema conseguiu identificar:\n\n- Texto principal do documento\n- Números e códigos\n- Datas e valores\n- Assinaturas e carimbos\n\nA qualidade da extração foi excelente com ${95 + Math.floor(Math.random() * 5)}% de confiança.`,
        confidence: 95 + Math.floor(Math.random() * 5),
        processedAt: new Date(),
        analysis: {
          summary: "Documento oficial digitalizado contendo informações importantes",
          keyPoints: ["Documento válido", "Texto legível", "Qualidade alta"],
          entities: ["Data", "Número do documento", "Assinatura"],
          sentiment: "neutral",
          category: "documento_oficial",
          confidence: 0.95
        },
        metadata: {
          pages: 1,
          language: "pt-BR",
          resolution: "1920x1080",
          fileSize: typeof imageFile === "string" ? 256000 : imageFile.size
        }
      };

      setScanResults(prev => [mockResult, ...prev]);
      setSelectedResult(mockResult);
      setCurrentStep("analysis");

      toast({
        title: "Processamento concluído",
        description: `Documento processado com ${mockResult.confidence}% de confiança`
      });

    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar o documento",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        processDocument(file);
      } else {
        toast({
          title: "Formato não suportado",
          description: "Selecione uma imagem (JPG, PNG) ou PDF",
          variant: "destructive"
        });
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setCurrentStep("capture");
    startCamera();
  };

  const shareResult = (result: DocumentScanResult) => {
    if (navigator.share) {
      navigator.share({
        title: `Documento: ${result.fileName}`,
        text: result.extractedText,
        url: result.imageUrl
      });
    } else {
      navigator.clipboard.writeText(result.extractedText);
      toast({
        title: "Texto copiado",
        description: "Texto extraído copiado para a área de transferência"
      });
    }
  };

  const downloadResult = (result: DocumentScanResult) => {
    const element = document.createElement("a");
    element.href = result.imageUrl;
    element.download = result.fileName;
    element.click();
    
    toast({
      title: "Download iniciado",
      description: "Documento sendo baixado"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Scanner de Documentos Inteligente
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Capture, digitalize e analise documentos com IA avançada
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={startCamera} variant="default" className="gap-2">
              <Camera className="h-4 w-4" />
              {isMobile ? "Abrir Câmera" : "Usar Webcam"}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline" 
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Arquivo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Camera/Preview Section */}
      {currentStep === "capture" && (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-2xl mx-auto rounded-lg border"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={captureImage}
                  size="lg"
                  className="rounded-full w-16 h-16"
                >
                  <Camera className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {currentStep === "preview" && capturedImage && (
        <Card>
          <CardHeader>
            <CardTitle>Prévia da Imagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Documento capturado"
                className="w-full max-w-2xl mx-auto rounded-lg border"
              />
            </div>
            
            <div className="flex justify-center gap-4">
              <Button onClick={retakePhoto} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Capturar Novamente
              </Button>
              <Button 
                onClick={() => processDocument(capturedImage)} 
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                Processar Documento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Progress */}
      {isScanning && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 animate-pulse text-blue-500" />
                <span className="font-medium">Processando documento...</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {scanProgress}% concluído
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {scanResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Documentos Processados ({scanResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scanResults.map((result) => (
                <Card key={result.id} className="border-2 hover:border-primary cursor-pointer">
                  <CardContent className="p-4 space-y-3">
                    <div className="aspect-video relative overflow-hidden rounded-lg">
                      <img
                        src={result.imageUrl}
                        alt={result.fileName}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 text-azure-50">
                          {result.confidence}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium truncate">{result.fileName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {result.processedAt.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedResult(result)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => shareResult(result)}
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadResult(result)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Result View */}
      {selectedResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detalhes do Documento</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedResult(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image */}
              <div>
                <img
                  src={selectedResult.imageUrl}
                  alt={selectedResult.fileName}
                  className="w-full rounded-lg border"
                />
                <div className="mt-2 flex justify-center gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Maximize2 className="h-3 w-3" />
                    Ampliar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
              
              {/* Extracted Text */}
              <div className="space-y-4">
                <div>
                  <Label>Texto Extraído</Label>
                  <Textarea
                    value={selectedResult.extractedText}
                    readOnly
                    rows={8}
                    className="mt-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Confiança</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{selectedResult.confidence}%</Badge>
                      {selectedResult.confidence >= 90 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : selectedResult.confidence >= 70 ? (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Idioma</Label>
                    <div className="mt-1">{selectedResult.metadata.language}</div>
                  </div>
                  
                  <div>
                    <Label>Páginas</Label>
                    <div className="mt-1">{selectedResult.metadata.pages}</div>
                  </div>
                  
                  <div>
                    <Label>Resolução</Label>
                    <div className="mt-1">{selectedResult.metadata.resolution}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Analysis */}
            {selectedResult.analysis && (
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Análise IA
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Resumo</Label>
                    <p className="mt-1">{selectedResult.analysis.summary}</p>
                  </div>
                  
                  <div>
                    <Label>Categoria</Label>
                    <Badge variant="outline" className="mt-1">
                      {selectedResult.analysis.category}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label>Pontos Principais</Label>
                    <ul className="mt-1 space-y-1">
                      {selectedResult.analysis.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span>•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <Label>Entidades Identificadas</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedResult.analysis.entities.map((entity, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};