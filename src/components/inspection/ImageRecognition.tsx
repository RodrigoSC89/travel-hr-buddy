/**
import { useRef, useState, useCallback, useMemo } from "react";;
 * Image Recognition for Inspections - PHASE 8
 * IA para análise de fotos e vídeos de inspeção
 */

import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Camera, 
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Shield,
  Wrench,
  HardHat,
  FileText,
  Download,
  Trash2,
  ZoomIn
} from "lucide-react";

interface AnalysisResult {
  id: string;
  imageName: string;
  imageUrl: string;
  timestamp: Date;
  analysisType: "corrosion" | "damage" | "ppe" | "general";
  status: "passed" | "warning" | "failed";
  confidence: number;
  findings: {
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    location?: string;
    recommendation?: string;
  }[];
}

const mockAnalysisResults: AnalysisResult[] = [
  {
    id: "1",
    imageName: "deck_starboard_001.jpg",
    imageUrl: "/placeholder.svg",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    analysisType: "corrosion",
    status: "warning",
    confidence: 0.92,
    findings: [
      {
        type: "Corrosão Superficial",
        severity: "medium",
        description: "Detectada corrosão superficial em área de 15cm² próximo ao corrimão",
        location: "Convés Principal - Boreste",
        recommendation: "Tratamento com primer anticorrosivo e repintura"
      }
    ]
  },
  {
    id: "2",
    imageName: "engine_room_pump_002.jpg",
    imageUrl: "/placeholder.svg",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    analysisType: "damage",
    status: "passed",
    confidence: 0.88,
    findings: [
      {
        type: "Inspeção Visual OK",
        severity: "low",
        description: "Nenhum dano visível detectado no equipamento",
        location: "Praça de Máquinas"
      }
    ]
  },
  {
    id: "3",
    imageName: "crew_training_ppe_003.jpg",
    imageUrl: "/placeholder.svg",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    analysisType: "ppe",
    status: "failed",
    confidence: 0.95,
    findings: [
      {
        type: "EPI Incompleto",
        severity: "high",
        description: "Tripulante sem capacete de segurança durante operação de carga",
        recommendation: "Retreinamento obrigatório de segurança"
      },
      {
        type: "Luvas Ausentes",
        severity: "medium",
        description: "Operador sem luvas de proteção",
        recommendation: "Reforçar uso de EPIs em briefing diário"
      }
    ]
  }
];

export const ImageRecognition: React.FC = () => {
  const [results, setResults] = useState<AnalysisResult[]>(mockAnalysisResults);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    setUploadProgress(0);

    // Simulate upload and analysis
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    // Generate mock result
    const file = files[0];
    const newResult: AnalysisResult = {
      id: Date.now().toString(),
      imageName: file.name,
      imageUrl: URL.createObjectURL(file),
      timestamp: new Date(),
      analysisType: "general",
      status: Math.random() > 0.6 ? "passed" : Math.random() > 0.3 ? "warning" : "failed",
      confidence: 0.85 + Math.random() * 0.15,
      findings: [
        {
          type: "Análise Completa",
          severity: Math.random() > 0.5 ? "low" : "medium",
          description: "Imagem analisada com sucesso. Verificação visual concluída.",
          recommendation: "Manter monitoramento regular"
        }
      ]
    };

    setResults(prev => [newResult, ...prev]);
    setIsAnalyzing(false);
    setUploadProgress(0);
    toast.success("Análise concluída!");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "passed": return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "failed": return <XCircle className="h-5 w-5 text-red-500" />;
    default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "passed": return <Badge className="bg-green-500">Aprovado</Badge>;
    case "warning": return <Badge className="bg-amber-500">Atenção</Badge>;
    case "failed": return <Badge variant="destructive">Reprovado</Badge>;
    default: return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "low": return "text-green-500";
    case "medium": return "text-amber-500";
    case "high": return "text-orange-500";
    case "critical": return "text-red-500";
    default: return "text-muted-foreground";
    }
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
    case "corrosion": return <Wrench className="h-4 w-4" />;
    case "damage": return <AlertTriangle className="h-4 w-4" />;
    case "ppe": return <HardHat className="h-4 w-4" />;
    default: return <Eye className="h-4 w-4" />;
    }
  };

  const filteredResults = selectedAnalysis === "all" 
    ? results 
    : results.filter(r => r.analysisType === selectedAnalysis);

  const stats = {
    total: results.length,
    passed: results.filter(r => r.status === "passed").length,
    warning: results.filter(r => r.status === "warning").length,
    failed: results.filter(r => r.status === "failed").length
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8">
            {isAnalyzing ? (
              <div className="text-center space-y-4 w-full max-w-md">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="font-medium">Analisando imagem...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {uploadProgress < 50 ? "Enviando arquivo..." : "Processando com IA..."}
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Camera className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Enviar Imagem para Análise</h3>
                <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
                  Faça upload de fotos de inspeção para detectar corrosão, danos, 
                  uso de EPIs e outras verificações visuais
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Selecionar Arquivo
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Usar Câmera
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-4">
                  Formatos aceitos: JPG, PNG, WebP (máx. 10MB)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Analisadas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold">{stats.passed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Com Atenção</p>
                <p className="text-2xl font-bold">{stats.warning}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reprovadas</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Histórico de Análises
              </CardTitle>
              <CardDescription>
                Imagens analisadas por IA com detecção de problemas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedAnalysis} onValueChange={setSelectedAnalysis}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="corrosion" className="gap-1">
                <Wrench className="h-4 w-4" />
                Corrosão
              </TabsTrigger>
              <TabsTrigger value="damage" className="gap-1">
                <AlertTriangle className="h-4 w-4" />
                Danos
              </TabsTrigger>
              <TabsTrigger value="ppe" className="gap-1">
                <HardHat className="h-4 w-4" />
                EPIs
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img 
                          src={result.imageUrl} 
                          alt={result.imageName}
                          className="w-full h-full object-cover"
                        />
                        <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                          <ZoomIn className="h-6 w-6 text-white" />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(result.status)}
                              <span className="font-medium">{result.imageName}</span>
                              {getStatusBadge(result.status)}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                {getAnalysisIcon(result.analysisType)}
                                {result.analysisType === "corrosion" ? "Corrosão" :
                                  result.analysisType === "damage" ? "Danos" :
                                    result.analysisType === "ppe" ? "EPIs" : "Geral"}
                              </span>
                              <span>
                                Confiança: {(result.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>

                        {/* Findings */}
                        <div className="mt-3 space-y-2">
                          {result.findings.map((finding, idx) => (
                            <div 
                              key={idx} 
                              className={`p-2 rounded-lg ${
                                finding.severity === "high" || finding.severity === "critical"
                                  ? "bg-red-500/10"
                                  : finding.severity === "medium"
                                    ? "bg-amber-500/10"
                                    : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant="outline" 
                                  className={getSeverityColor(finding.severity)}
                                >
                                  {finding.type}
                                </Badge>
                                {finding.location && (
                                  <span className="text-xs text-muted-foreground">
                                    {finding.location}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm">{finding.description}</p>
                              {finding.recommendation && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  💡 {finding.recommendation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageRecognition;
