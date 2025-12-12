import { useRef, useState, useCallback, useMemo } from "react";;
import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Camera,
  Eye,
  Upload,
  AlertTriangle,
  CheckCircle,
  Image,
  Scan,
  FileImage,
  Zap,
  Target,
  XCircle,
  Download,
  RefreshCw
} from "lucide-react";

interface InspectionResult {
  id: string;
  imageName: string;
  timestamp: string;
  status: "analyzing" | "passed" | "warning" | "failed";
  findings: Finding[];
  confidence: number;
  equipment: string;
  location: string;
}

interface Finding {
  id: string;
  type: "corrosion" | "damage" | "wear" | "leak" | "misalignment" | "ok";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location: { x: number; y: number; width: number; height: number };
  confidence: number;
  recommendation?: string;
}

const mockResults: InspectionResult[] = [
  {
    id: "INS-001",
    imageName: "thruster_port_01.jpg",
    timestamp: new Date().toISOString(),
    status: "warning",
    equipment: "Thruster Port #1",
    location: "Casco - Seção Inferior",
    confidence: 94,
    findings: [
      { id: "F1", type: "corrosion", severity: "medium", description: "Corrosão superficial detectada na base do thruster", location: { x: 120, y: 80, width: 60, height: 40 }, confidence: 92, recommendation: "Aplicar tratamento anticorrosivo em até 30 dias" },
      { id: "F2", type: "wear", severity: "low", description: "Desgaste leve nas pás do propulsor", location: { x: 200, y: 150, width: 80, height: 60 }, confidence: 88 }
    ]
  },
  {
    id: "INS-002",
    imageName: "generator_main.jpg",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "passed",
    equipment: "Gerador Principal #1",
    location: "Sala de Máquinas",
    confidence: 98,
    findings: [
      { id: "F3", type: "ok", severity: "low", description: "Equipamento em boas condições", location: { x: 0, y: 0, width: 100, height: 100 }, confidence: 98 }
    ]
  },
  {
    id: "INS-003",
    imageName: "dp_console.jpg",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: "failed",
    equipment: "Console DP Principal",
    location: "Bridge",
    confidence: 96,
    findings: [
      { id: "F4", type: "damage", severity: "critical", description: "Display com pixels mortos - visibilidade comprometida", location: { x: 50, y: 30, width: 120, height: 80 }, confidence: 97, recommendation: "Substituição imediata do display requerida" }
    ]
  }
];

export const ComputerVisionInspector: React.FC = () => {
  const [results, setResults] = useState<InspectionResult[]>(mockResults);
  const [selectedResult, setSelectedResult] = useState<InspectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setIsAnalyzing(true);
    setAnalyzeProgress(0);

    // Simular análise
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 200));
      setAnalyzeProgress(i);
    }

    const newResult: InspectionResult = {
      id: `INS-${Date.now()}`,
      imageName: files[0].name,
      timestamp: new Date().toISOString(),
      status: Math.random() > 0.5 ? "passed" : "warning",
      equipment: "Equipamento Analisado",
      location: "Localização",
      confidence: Math.floor(Math.random() * 15) + 85,
      findings: []
    };

    setResults([newResult, ...results]);
    setIsAnalyzing(false);
    toast.success("Análise concluída com sucesso!");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "text-red-600 bg-red-100";
    case "high": return "text-orange-600 bg-orange-100";
    case "medium": return "text-yellow-600 bg-yellow-100";
    default: return "text-green-600 bg-green-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "passed": return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "failed": return <XCircle className="h-5 w-5 text-red-500" />;
    default: return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const stats = {
    total: results.length,
    passed: results.filter(r => r.status === "passed").length,
    warning: results.filter(r => r.status === "warning").length,
    failed: results.filter(r => r.status === "failed").length,
    avgConfidence: Math.round(results.reduce((acc, r) => acc + r.confidence, 0) / results.length)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Eye className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Computer Vision - Inspeções Visuais</h2>
            <p className="text-muted-foreground">Análise automatizada com IA para detecção de anomalias</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
          />
          <Button variant="outline" onClick={() => toast.info("Conectando câmera..."}>
            <Camera className="w-4 h-4 mr-2" />
            Câmera ao Vivo
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Imagens
          </Button>
        </div>
      </div>

      {/* Analyzing Progress */}
      {isAnalyzing && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Scan className="h-6 w-6 text-primary animate-pulse" />
              <div className="flex-1">
                <p className="font-medium">Analisando imagem...</p>
                <Progress value={analyzeProgress} className="mt-2" />
              </div>
              <span className="text-sm text-muted-foreground">{analyzeProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Inspeções</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileImage className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reprovadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
                <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
              </div>
              <Target className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Results List */}
        <Card className="col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Inspeções Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {results.map(result => (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedResult?.id === result.id ? "border-primary bg-primary/5" : ""}`}
                    onClick={handleSetSelectedResult}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.equipment}</p>
                        <p className="text-xs text-muted-foreground">{result.imageName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {result.findings.length} findings
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {result.confidence}% conf.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail View */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Detalhes da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedResult ? (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative h-[200px] bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{selectedResult.imageName}</p>
                  </div>
                  {/* Simulated bounding boxes */}
                  {selectedResult.findings.filter(f => f.type !== "ok").map((finding, i) => (
                    <div
                      key={finding.id}
                      className={`absolute border-2 border-dashed ${
                        finding.severity === "critical" ? "border-red-500" :
                          finding.severity === "high" ? "border-orange-500" :
                            finding.severity === "medium" ? "border-yellow-500" : "border-green-500"
                      }`}
                      style={{
                        left: `${finding.location.x}px`,
                        top: `${finding.location.y}px`,
                        width: `${finding.location.width}px`,
                        height: `${finding.location.height}px`
                      }}
                    >
                      <span className={`absolute -top-5 left-0 text-xs px-1 rounded ${getSeverityColor(finding.severity)}`}>
                        #{i + 1}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Equipment Info */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Equipamento</p>
                    <p className="font-medium">{selectedResult.equipment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Localização</p>
                    <p className="font-medium">{selectedResult.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Confiança IA</p>
                    <p className="font-medium">{selectedResult.confidence}%</p>
                  </div>
                </div>

                {/* Findings */}
                <div>
                  <p className="font-medium mb-2">Achados ({selectedResult.findings.length})</p>
                  <div className="space-y-2">
                    {selectedResult.findings.map((finding, i) => (
                      <div key={finding.id} className="p-3 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                              #{i + 1} {finding.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground">{finding.confidence}% conf.</span>
                          </div>
                          <Badge variant={finding.severity === "critical" ? "destructive" : "secondary"}>
                            {finding.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mt-2">{finding.description}</p>
                        {finding.recommendation && (
                          <div className="mt-2 p-2 bg-primary/5 rounded text-xs">
                            <Zap className="h-3 w-3 inline mr-1 text-primary" />
                            <strong>Recomendação:</strong> {finding.recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Relatório
                  </Button>
                  <Button size="sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Criar Ordem de Serviço
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Selecione uma inspeção para ver detalhes</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
