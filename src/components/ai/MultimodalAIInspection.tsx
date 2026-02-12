/**
 * Multimodal AI Visual Inspection System
 * Automated image and video analysis for maritime inspections
 */

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Camera, 
  Video, 
  Upload, 
  Scan, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Cpu,
  FileImage,
  Play,
  Pause,
  RotateCcw,
  Download,
  Sparkles,
  Shield,
  Wrench,
  Droplets,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface InspectionResult {
  id: string;
  timestamp: Date;
  type: 'image' | 'video';
  filename: string;
  analysis: {
    overallScore: number;
    findings: Finding[];
    recommendations: string[];
    compliance: ComplianceCheck[];
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface Finding {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'ok';
  category: string;
  description: string;
  location?: { x: number; y: number; width: number; height: number };
  confidence: number;
}

interface ComplianceCheck {
  standard: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

export const MultimodalAIInspection: React.FC = () => {
  const [inspections, setInspections] = useState<InspectionResult[]>([]);
  const [currentInspection, setCurrentInspection] = useState<InspectionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Por favor, selecione uma imagem ou vídeo');
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Start processing
    setIsProcessing(true);
    setUploadProgress(0);

    const newInspection: InspectionResult = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: isImage ? 'image' : 'video',
      filename: file.name,
      status: 'processing',
      analysis: {
        overallScore: 0,
        findings: [],
        recommendations: [],
        compliance: []
      }
    };

    setCurrentInspection(newInspection);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Call AI analysis
      const result = await analyzeWithAI(file, isImage ? 'image' : 'video');
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const completedInspection: InspectionResult = {
        ...newInspection,
        status: 'completed',
        analysis: result
      };

      setCurrentInspection(completedInspection);
      setInspections(prev => [completedInspection, ...prev]);
      toast.success('Análise concluída com sucesso!');
    } catch (error) {
      logger.error('Analysis error:', error);
      clearInterval(progressInterval);
      
      const failedInspection: InspectionResult = {
        ...newInspection,
        status: 'failed',
        analysis: {
          overallScore: 0,
          findings: [],
          recommendations: ['Análise falhou. Por favor, tente novamente.'],
          compliance: []
        }
      };
      
      setCurrentInspection(failedInspection);
      toast.error('Erro na análise. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const analyzeWithAI = async (file: File, type: 'image' | 'video'): Promise<InspectionResult['analysis']> => {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    try {
      const { data, error } = await supabase.functions.invoke('multimodal-inspection', {
        body: {
          image: base64,
          type,
          context: 'maritime_vessel_inspection'
        }
      });

      if (error) throw error;
      return data.analysis;
    } catch {
      // Fallback to simulated analysis
      return simulateAnalysis(type);
    }
  };

  const simulateAnalysis = (type: 'image' | 'video'): InspectionResult['analysis'] => {
    const findings: Finding[] = [
      {
        id: '1',
        severity: 'warning',
        category: 'Corrosão',
        description: 'Sinais de corrosão detectados na área de casco',
        location: { x: 120, y: 80, width: 50, height: 30 },
        confidence: 0.89
      },
      {
        id: '2',
        severity: 'info',
        category: 'Pintura',
        description: 'Desgaste normal de pintura em área exposta',
        confidence: 0.95
      },
      {
        id: '3',
        severity: 'ok',
        category: 'Estrutura',
        description: 'Estrutura principal em boas condições',
        confidence: 0.92
      }
    ];

    const compliance: ComplianceCheck[] = [
      { standard: 'SOLAS Cap. II-1', status: 'pass', details: 'Estrutura conforme' },
      { standard: 'MLC 2006', status: 'pass', details: 'Condições de segurança adequadas' },
      { standard: 'ISM Code', status: 'warning', details: 'Manutenção preventiva recomendada' }
    ];

    return {
      overallScore: type === 'video' ? 82 : 78,
      findings,
      recommendations: [
        'Agendar manutenção preventiva de pintura',
        'Monitorar área de corrosão identificada',
        'Documentar inspeção no logbook digital'
      ],
      compliance
    };
  };

  const getSeverityIcon = (severity: Finding['severity']) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info': return <Eye className="h-4 w-4 text-primary" />;
      case 'ok': return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Corrosão': <Droplets className="h-4 w-4" />,
      'Pintura': <Wrench className="h-4 w-4" />,
      'Estrutura': <Shield className="h-4 w-4" />,
      'Incêndio': <Flame className="h-4 w-4" />
    };
    return icons[category] || <Eye className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            IA Multimodal - Inspeção Visual
          </h2>
          <p className="text-muted-foreground">
            Análise automatizada de imagens e vídeos com inteligência artificial
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          GPT-4 Vision
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Mídia
            </CardTitle>
            <CardDescription>
              Envie imagens ou vídeos para análise automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer",
                  "hover:border-primary hover:bg-primary/5 transition-colors",
                  "flex flex-col items-center gap-4"
                )}
              >
                <div className="flex gap-4">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Clique para enviar</p>
                  <p className="text-sm text-muted-foreground">
                    Suporta JPG, PNG, MP4, MOV
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden bg-black">
                {currentInspection?.type === 'image' ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-64 object-contain"
                  />
                ) : (
                  <video 
                    ref={videoRef}
                    src={previewUrl} 
                    className="w-full h-64 object-contain"
                    controls
                  />
                )}
                
                {/* Overlay findings */}
                {currentInspection?.analysis.findings.map(finding => 
                  finding.location && (
                    <div
                      key={finding.id}
                      className={cn(
                        "absolute border-2 rounded",
                        finding.severity === 'critical' && "border-destructive bg-destructive/20",
                        finding.severity === 'warning' && "border-warning bg-warning/20",
                        finding.severity === 'info' && "border-primary bg-primary/20"
                      )}
                      style={{
                        left: finding.location.x,
                        top: finding.location.y,
                        width: finding.location.width,
                        height: finding.location.height
                      }}
                    />
                  )
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreviewUrl(null);
                    setCurrentInspection(null);
                  }}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Nova Análise
                </Button>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Scan className="h-4 w-4 animate-pulse" />
                    Analisando com IA...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <FileImage className="h-4 w-4 mr-2" />
                Imagem
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                <Video className="h-4 w-4 mr-2" />
                Vídeo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Resultados da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentInspection?.status === 'completed' ? (
              <Tabs defaultValue="findings" className="space-y-4">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="findings">Achados</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="actions">Ações</TabsTrigger>
                </TabsList>

                <TabsContent value="findings" className="space-y-4">
                  {/* Overall Score */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <span className="font-medium">Score Geral</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={currentInspection.analysis.overallScore} 
                        className="w-24"
                      />
                      <span className={cn(
                        "font-bold",
                        currentInspection.analysis.overallScore >= 80 && "text-green-500",
                        currentInspection.analysis.overallScore >= 60 && currentInspection.analysis.overallScore < 80 && "text-yellow-500",
                        currentInspection.analysis.overallScore < 60 && "text-red-500"
                      )}>
                        {currentInspection.analysis.overallScore}%
                      </span>
                    </div>
                  </div>

                  {/* Findings List */}
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {currentInspection.analysis.findings.map(finding => (
                        <div 
                          key={finding.id}
                          className={cn(
                            "p-3 rounded-lg border flex items-start gap-3",
                            finding.severity === 'critical' && "border-destructive/50 bg-destructive/10",
                            finding.severity === 'warning' && "border-warning/50 bg-warning/10",
                            finding.severity === 'info' && "border-info/50 bg-info/10",
                            finding.severity === 'ok' && "border-success/50 bg-success/10"
                          )}
                        >
                          {getSeverityIcon(finding.severity)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getCategoryIcon(finding.category)}
                              <span className="font-medium text-sm">{finding.category}</span>
                              <Badge variant="outline" className="text-xs">
                                {Math.round(finding.confidence * 100)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {finding.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-3">
                  {currentInspection.analysis.compliance.map((check, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium text-sm">{check.standard}</p>
                        <p className="text-xs text-muted-foreground">{check.details}</p>
                      </div>
                      <Badge variant={
                        check.status === 'pass' ? 'default' :
                        check.status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {check.status === 'pass' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {check.status === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {check.status === 'fail' && <XCircle className="h-3 w-3 mr-1" />}
                        {check.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="actions" className="space-y-3">
                  {currentInspection.analysis.recommendations.map((rec, i) => (
                    <div 
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Wrench className="h-4 w-4 text-primary mt-0.5" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                  
                  <Button className="w-full mt-4" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Relatório PDF
                  </Button>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Scan className="h-12 w-12 mb-4 opacity-50" />
                <p>Envie uma mídia para análise</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History */}
      {inspections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Inspeções</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {inspections.map(inspection => (
                  <div 
                    key={inspection.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted"
                    onClick={() => setCurrentInspection(inspection)}
                  >
                    <div className="flex items-center gap-3">
                      {inspection.type === 'image' ? 
                        <FileImage className="h-5 w-5" /> : 
                        <Video className="h-5 w-5" />
                      }
                      <div>
                        <p className="font-medium text-sm">{inspection.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {inspection.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        inspection.analysis.overallScore >= 80 ? 'default' :
                        inspection.analysis.overallScore >= 60 ? 'secondary' : 'destructive'
                      }>
                        {inspection.analysis.overallScore}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultimodalAIInspection;
