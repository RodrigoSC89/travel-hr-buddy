/**
 * Knowledge Uploader - Componente de Upload Revolucionário
 * Suporta arrastar/soltar, múltiplos arquivos, progresso visual
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileCheck,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  FolderUp,
  Brain,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { DocumentType, DocumentCategory, KnowledgeDocument } from '../types';

interface KnowledgeUploaderProps {
  onUpload: (files: File[], metadata: Partial<KnowledgeDocument>) => void;
  isUploading?: boolean;
  uploadProgress?: Record<string, number>;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string; icon: React.ReactNode }[] = [
  { value: 'manual', label: 'Manual', icon: <FileText className="h-4 w-4" /> },
  { value: 'procedure', label: 'Procedimento', icon: <FileCheck className="h-4 w-4" /> },
  { value: 'checklist', label: 'Checklist', icon: <FileCheck className="h-4 w-4" /> },
  { value: 'form', label: 'Formulário', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { value: 'certificate', label: 'Certificado', icon: <FileText className="h-4 w-4" /> },
  { value: 'policy', label: 'Política', icon: <FileText className="h-4 w-4" /> },
  { value: 'guideline', label: 'Diretriz', icon: <FileText className="h-4 w-4" /> },
  { value: 'report', label: 'Relatório', icon: <FileSpreadsheet className="h-4 w-4" /> },
  { value: 'training', label: 'Treinamento', icon: <FileImage className="h-4 w-4" /> },
  { value: 'safety_data_sheet', label: 'FISPQ/SDS', icon: <FileText className="h-4 w-4" /> },
  { value: 'technical_drawing', label: 'Desenho Técnico', icon: <FileImage className="h-4 w-4" /> },
  { value: 'regulation', label: 'Regulamento', icon: <FileText className="h-4 w-4" /> },
];

const CATEGORIES: { value: DocumentCategory; label: string; emoji: string }[] = [
  { value: 'navigation', label: 'Navegação', emoji: '🧭' },
  { value: 'safety', label: 'Segurança', emoji: '🛡️' },
  { value: 'cargo', label: 'Carga', emoji: '📦' },
  { value: 'machinery', label: 'Máquinas', emoji: '⚙️' },
  { value: 'crew', label: 'Tripulação', emoji: '👥' },
  { value: 'environmental', label: 'Ambiental', emoji: '🌿' },
  { value: 'commercial', label: 'Comercial', emoji: '💼' },
  { value: 'legal', label: 'Legal', emoji: '⚖️' },
  { value: 'quality', label: 'Qualidade', emoji: '✅' },
  { value: 'training', label: 'Treinamento', emoji: '🎓' },
  { value: 'medical', label: 'Médico', emoji: '🏥' },
  { value: 'security', label: 'Proteção', emoji: '🔒' },
  { value: 'emergency', label: 'Emergência', emoji: '🚨' },
  { value: 'operations', label: 'Operações', emoji: '⚓' },
  { value: 'maintenance', label: 'Manutenção', emoji: '🔧' },
  { value: 'general', label: 'Geral', emoji: '📄' },
];

interface FileWithPreview extends File {
  preview?: string;
}

export function KnowledgeUploader({ 
  onUpload, 
  isUploading = false,
  uploadProgress = {} 
}: KnowledgeUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);
  const [metadata, setMetadata] = useState<Partial<KnowledgeDocument>>({
    documentType: 'manual',
    category: 'general',
    accessLevel: 'internal',
    tags: [],
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: file.type.startsWith('image/') 
          ? URL.createObjectURL(file) 
          : undefined
      })
    );
    setFiles(prev => [...prev, ...newFiles]);
    
    if (newFiles.length > 0) {
      setShowMetadataDialog(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files, metadata);
      setFiles([]);
      setShowMetadataDialog(false);
      setMetadata({
        documentType: 'manual',
        category: 'general',
        accessLevel: 'internal',
        tags: [],
      });
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FileImage className="h-5 w-5 text-accent-foreground" />;
    if (file.type.includes('spreadsheet') || file.type.includes('excel')) 
      return <FileSpreadsheet className="h-5 w-5 text-success" />;
    return <FileText className="h-5 w-5 text-info" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={cn(
              "rounded-lg p-8 text-center cursor-pointer transition-all",
              isDragActive && "bg-primary/5",
              isDragAccept && "bg-success/10 border-success",
              isDragReject && "bg-destructive/10 border-destructive"
            )}
          >
            <input {...getInputProps()} />
            
            <motion.div
              animate={{ scale: isDragActive ? 1.05 : 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={cn(
                "p-6 rounded-full transition-colors",
                isDragActive ? "bg-primary/20" : "bg-muted"
              )}>
                {isDragActive ? (
                  <FolderUp className="h-12 w-12 text-primary animate-bounce" />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive 
                    ? "Solte os arquivos aqui..." 
                    : "Arraste e solte seus documentos"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Manuais, Procedimentos, Checklists, Formulários, Certificados
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, Word, Excel, PowerPoint, Imagens (máx. 50MB)
                </p>
              </div>
              
              <Button variant="outline" className="mt-2">
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivos
              </Button>
            </motion.div>
          </div>

          {/* Files Preview */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">
                    {files.length} arquivo(s) selecionado(s)
                  </p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setFiles([])}
                  >
                    Limpar
                  </Button>
                </div>
                
                <ScrollArea className="max-h-48">
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                          {uploadProgress[file.name] !== undefined && (
                            <Progress 
                              value={uploadProgress[file.name]} 
                              className="h-1 mt-1" 
                            />
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Metadata Dialog */}
      <Dialog open={showMetadataDialog} onOpenChange={setShowMetadataDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Configurar Upload Inteligente
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">IA vai processar automaticamente</p>
                <p className="text-sm text-muted-foreground">
                  Extração de texto, identificação de checklists, formulários e procedimentos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select
                  value={metadata.documentType}
                  onValueChange={(value: DocumentType) => 
                    setMetadata(prev => ({ ...prev, documentType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={metadata.category}
                  onValueChange={(value: DocumentCategory) => 
                    setMetadata(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <span>{cat.emoji}</span>
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={metadata.description || ''}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descrição do documento..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags (opcional)</Label>
              <Input
                placeholder="Ex: SOLAS, MARPOL, ISM (separadas por vírgula)"
                onChange={(e) => setMetadata(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Nível de Acesso</Label>
              <Select
                value={metadata.accessLevel}
                onValueChange={(value: 'public' | 'internal' | 'confidential' | 'restricted') => 
                  setMetadata(prev => ({ ...prev, accessLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">🌐 Público</SelectItem>
                  <SelectItem value="internal">🏢 Interno</SelectItem>
                  <SelectItem value="confidential">🔒 Confidencial</SelectItem>
                  <SelectItem value="restricted">⛔ Restrito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMetadataDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar {files.length} Arquivo(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
