/**
 * Vision AI Analyzer - Componente para análise de imagens
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Camera, Eye, FileImage, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useVisionAI } from '@/hooks/use-vision-ai';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const ANALYSIS_TYPES = [
  { value: 'general', label: 'Análise Geral', icon: Eye },
  { value: 'equipment', label: 'Equipamentos', icon: FileImage },
  { value: 'document', label: 'Documentos', icon: FileImage },
  { value: 'vessel', label: 'Condição da Embarcação', icon: FileImage },
  { value: 'safety', label: 'Segurança', icon: AlertTriangle },
  { value: 'cargo', label: 'Carga', icon: FileImage },
];

export function VisionAIAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<string>('general');
  const [customPrompt, setCustomPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    analyzeImage, 
    isAnalyzing, 
    result, 
    error, 
    reset 
  } = useVisionAI();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      reset();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      reset();
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      analyzeImage(
        selectedFile,
        analysisType as 'equipment' | 'document' | 'vessel' | 'safety' | 'cargo' | 'general',
        customPrompt || undefined
      );
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCustomPrompt('');
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Nauti Vision AI</CardTitle>
              <p className="text-xs text-muted-foreground">
                Gemini Pro Vision • Análise Inteligente
              </p>
            </div>
          </div>
          {selectedFile && (
            <Button variant="ghost" size="icon" onClick={handleClear}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload Area */}
        {!selectedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm font-medium">
              Arraste uma imagem ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Suporta JPG, PNG, WebP (máx. 10MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={previewUrl!}
                alt="Preview"
                className="w-full h-48 object-contain"
              />
              <Badge className="absolute top-2 right-2">
                {selectedFile.name}
              </Badge>
            </div>

            {/* Analysis Options */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Análise</label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANALYSIS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt Personalizado (opcional)</label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Adicione instruções específicas..."
                  rows={2}
                />
              </div>
            </div>

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Analisar Imagem
                </>
              )}
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="p-4 rounded-lg bg-muted space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Análise Completa</span>
              </div>
              <Badge variant="secondary">
                {ANALYSIS_TYPES.find(t => t.value === result.analysisType)?.label || result.analysisType}
              </Badge>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{result.analysis}</ReactMarkdown>
            </div>
            <p className="text-xs text-muted-foreground">
              Processado em {new Date(result.timestamp).toLocaleString('pt-BR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default VisionAIAnalyzer;
