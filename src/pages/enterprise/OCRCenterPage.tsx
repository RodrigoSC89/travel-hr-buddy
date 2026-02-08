/**
 * OCR Multi-Engine Center - Enterprise Intelligence Suite
 * Processamento de documentos com 3 motores de OCR
 */

import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Eye,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  RefreshCw,
  Settings,
  Sparkles,
  Layers,
  BarChart3,
  Clock,
  Zap,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OCRResult {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  engines: {
    tesseract: { confidence: number; text?: string; time?: number };
    azure: { confidence: number; text?: string; time?: number };
    google: { confidence: number; text?: string; time?: number };
  };
  consensusText?: string;
  consensusConfidence?: number;
  classification?: string;
  extractedData?: Record<string, string>;
  createdAt: Date;
}

const ENGINE_INFO = {
  tesseract: { name: 'Tesseract', color: 'bg-blue-500', icon: '🔍' },
  azure: { name: 'Azure Vision', color: 'bg-purple-500', icon: '☁️' },
  google: { name: 'Google Vision', color: 'bg-green-500', icon: '🌐' },
};

export default function OCRCenterPage() {
  const [results, setResults] = useState<OCRResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [settings, setSettings] = useState({
    useConsensus: true,
    autoClassify: true,
    extractEntities: true,
    enhanceQuality: true,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const newResult: OCRResult = {
        id: crypto.randomUUID(),
        fileName: file.name,
        fileSize: file.size,
        status: 'pending',
        engines: {
          tesseract: { confidence: 0 },
          azure: { confidence: 0 },
          google: { confidence: 0 },
        },
        createdAt: new Date(),
      };
      setResults(prev => [newResult, ...prev]);
      processDocument(newResult.id);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp'],
      'application/pdf': ['.pdf'],
    },
  });

  const processDocument = async (id: string) => {
    setProcessing(true);
    
    // Simulate multi-engine OCR processing
    setResults(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'processing' as const } : r)
    );

    // Simulate Tesseract
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResults(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              engines: {
                ...r.engines,
                tesseract: { confidence: 89, time: 1200 },
              },
            }
          : r
      )
    );

    // Simulate Azure
    await new Promise(resolve => setTimeout(resolve, 800));
    setResults(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              engines: {
                ...r.engines,
                azure: { confidence: 93, time: 800 },
              },
            }
          : r
      )
    );

    // Simulate Google
    await new Promise(resolve => setTimeout(resolve, 600));
    setResults(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              engines: {
                ...r.engines,
                google: { confidence: 91, time: 600 },
              },
            }
          : r
      )
    );

    // Complete with consensus
    await new Promise(resolve => setTimeout(resolve, 500));
    setResults(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'completed' as const,
              consensusConfidence: 96.2,
              consensusText: 'Texto extraído com consenso de múltiplos motores...',
              classification: 'Certificado',
              extractedData: {
                'Número do Documento': 'CERT-2025-001234',
                'Data de Emissão': '15/01/2025',
                'Data de Validade': '15/01/2030',
                'Tipo': 'Certificado de Competência',
              },
            }
          : r
      )
    );

    setProcessing(false);
    toast.success('Documento processado com sucesso!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const stats = {
    total: results.length,
    completed: results.filter(r => r.status === 'completed').length,
    avgConfidence: results.filter(r => r.consensusConfidence).reduce((acc, r) => acc + (r.consensusConfidence || 0), 0) / Math.max(1, results.filter(r => r.consensusConfidence).length),
  };

  return (
    <>
      <Helmet>
        <title>OCR Multi-Engine Center | Nautilus One</title>
        <meta name="description" content="Processamento de documentos com múltiplos motores OCR" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                OCR Multi-Engine Center
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500">
                  <Layers className="h-3 w-3 mr-1" />
                  3 Engines
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Tesseract + Azure Vision + Google Vision com consenso inteligente
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Documentos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Processados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgConfidence.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Confiança Média</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">~2.5s</p>
                  <p className="text-xs text-muted-foreground">Tempo Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload de Documentos
              </CardTitle>
              <CardDescription>
                Arraste PDFs ou imagens para processamento OCR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                {isDragActive ? (
                  <p className="text-primary font-medium">Solte os arquivos aqui...</p>
                ) : (
                  <>
                    <p className="font-medium mb-1">Arraste arquivos aqui</p>
                    <p className="text-sm text-muted-foreground">ou clique para selecionar</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, PNG, JPG, TIFF até 50MB
                    </p>
                  </>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="consensus" className="text-sm">Consenso Multi-Engine</Label>
                  <Switch
                    id="consensus"
                    checked={settings.useConsensus}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, useConsensus: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="classify" className="text-sm">Auto-classificar</Label>
                  <Switch
                    id="classify"
                    checked={settings.autoClassify}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, autoClassify: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="entities" className="text-sm">Extrair entidades</Label>
                  <Switch
                    id="entities"
                    checked={settings.extractEntities}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, extractEntities: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enhance" className="text-sm">Melhorar qualidade</Label>
                  <Switch
                    id="enhance"
                    checked={settings.enhanceQuality}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, enhanceQuality: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Resultados OCR
              </CardTitle>
              <CardDescription>
                Documentos processados com detalhes de cada motor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {results.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-muted">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {result.fileName}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(result.fileSize)} • {result.createdAt.toLocaleTimeString()}
                              </p>
                            </div>
                            <Badge
                              variant={result.status === 'completed' ? 'default' : 'secondary'}
                              className={cn(
                                result.status === 'completed' && 'bg-green-500',
                                result.status === 'processing' && 'bg-blue-500',
                                result.status === 'failed' && 'bg-red-500'
                              )}
                            >
                              {result.status === 'processing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                              {result.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {result.status}
                            </Badge>
                          </div>

                          {/* Engine Results */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {Object.entries(result.engines).map(([key, engine]) => {
                              const info = ENGINE_INFO[key as keyof typeof ENGINE_INFO];
                              return (
                                <div key={key} className="p-2 rounded-lg bg-muted/50">
                                  <div className="flex items-center gap-1 mb-1">
                                    <span>{info.icon}</span>
                                    <span className="text-xs font-medium">{info.name}</span>
                                  </div>
                                  {engine.confidence > 0 ? (
                                    <>
                                      <Progress value={engine.confidence} className="h-1.5 mb-1" />
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>{engine.confidence.toFixed(1)}%</span>
                                        {engine.time && <span>{engine.time}ms</span>}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Aguardando...
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Consensus Result */}
                          {result.status === 'completed' && result.consensusConfidence && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-green-500" />
                                  Consenso Final
                                </span>
                                <Badge className="bg-green-500">
                                  {result.consensusConfidence.toFixed(1)}% confiança
                                </Badge>
                              </div>
                              
                              {result.classification && (
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs text-muted-foreground">Classificação:</span>
                                  <Badge variant="outline">{result.classification}</Badge>
                                </div>
                              )}

                              {result.extractedData && (
                                <div className="mt-2 pt-2 border-t border-green-500/20">
                                  <p className="text-xs font-medium mb-1">Dados Extraídos:</p>
                                  <div className="grid grid-cols-2 gap-1">
                                    {Object.entries(result.extractedData).map(([key, value]) => (
                                      <div key={key} className="text-xs">
                                        <span className="text-muted-foreground">{key}:</span>{' '}
                                        <span className="font-medium">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {results.length === 0 && (
                    <div className="text-center py-12">
                      <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum documento processado</h3>
                      <p className="text-sm text-muted-foreground">
                        Faça upload de documentos para começar o processamento OCR
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
