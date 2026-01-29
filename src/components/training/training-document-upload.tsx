/**
 * Training Document Upload Component
 * For uploading training materials, forms, certificates
 */

import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload, FileText, GraduationCap, Award, ClipboardList,
  Plus, X, RefreshCw, Eye, Download, Trash2, CheckCircle,
  BookOpen, Video, FileCheck, Brain
} from "lucide-react";
import { useTrainingDocuments, useUploadDocument, DOCUMENT_TYPES, REGULATORY_REFERENCES } from "@/hooks/use-enterprise-documents";
import { toast } from "sonner";

interface TrainingDocumentUploadProps {
  courseId?: string;
  onUploadComplete?: () => void;
}

const TRAINING_DOC_TYPES = [
  { value: 'training_material', label: 'Material de Treinamento', icon: BookOpen },
  { value: 'assessment', label: 'Avaliação/Prova', icon: FileCheck },
  { value: 'certificate', label: 'Certificado', icon: Award },
  { value: 'attendance', label: 'Lista de Presença', icon: ClipboardList },
  { value: 'evaluation', label: 'Formulário de Avaliação', icon: FileText },
  { value: 'presentation', label: 'Apresentação', icon: FileText },
  { value: 'video', label: 'Vídeo Aula', icon: Video },
  { value: 'manual', label: 'Manual/Guia', icon: BookOpen },
];

export function TrainingDocumentUpload({ courseId, onUploadComplete }: TrainingDocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    document_type: "training_material",
    module_number: "",
    is_mandatory: true,
    regulatory_reference: [] as string[],
    duration_minutes: ""
  });

  const { data: trainingDocs = [], refetch } = useTrainingDocuments(courseId);
  const uploadMutation = useUploadDocument();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Limite: 100MB");
        return;
      }
      setUploadFile(file);
      setFormData(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, "")
      }));
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error("Selecione um arquivo");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Informe o título");
      return;
    }

    setUploadProgress(30);

    try {
      await uploadMutation.mutateAsync({
        file: uploadFile,
        title: formData.title,
        description: formData.description,
        document_type: formData.document_type,
        regulatory_reference: formData.regulatory_reference.length > 0 ? formData.regulatory_reference : undefined,
        tags: ['treinamento', formData.document_type]
      });

      setUploadProgress(100);
      
      // Reset
      setUploadFile(null);
      setFormData({
        title: "",
        description: "",
        document_type: "training_material",
        module_number: "",
        is_mandatory: true,
        regulatory_reference: [],
        duration_minutes: ""
      });
      setIsDialogOpen(false);
      setUploadProgress(0);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      refetch();
      onUploadComplete?.();
    } catch (error) {
      setUploadProgress(0);
      console.error("Upload failed:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <GraduationCap className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <CardTitle>Documentos de Treinamento</CardTitle>
              <CardDescription>
                Upload de materiais, avaliações, certificados e formulários
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-400 border-green-500/30">
              <Brain className="h-3 w-3" />
              IA Integrada
            </Badge>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload de Material de Treinamento
                  </DialogTitle>
                  <DialogDescription>
                    Adicione materiais didáticos, avaliações, formulários e certificados
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* File Input */}
                  <div className="space-y-2">
                    <Label>Arquivo</Label>
                    <div 
                      className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.mp3,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                      />
                      {uploadFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">{uploadFile.name}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(uploadFile.size)}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Clique para selecionar ou arraste um arquivo
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOC, XLS, PPT, Vídeos, Imagens (máx. 100MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label>Título *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título do material"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do material"
                      rows={2}
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <Label>Tipo de Material *</Label>
                    <Select
                      value={formData.document_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAINING_DOC_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Module and Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Número do Módulo</Label>
                      <Input
                        type="number"
                        value={formData.module_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, module_number: e.target.value }))}
                        placeholder="Ex: 1, 2, 3..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duração (minutos)</Label>
                      <Input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value }))}
                        placeholder="Ex: 30, 60, 90..."
                      />
                    </div>
                  </div>

                  {/* Mandatory */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mandatory"
                      checked={formData.is_mandatory}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_mandatory: !!checked }))}
                    />
                    <label htmlFor="mandatory" className="text-sm font-medium">
                      Material obrigatório para conclusão
                    </label>
                  </div>

                  {/* Regulatory References */}
                  <div className="space-y-2">
                    <Label>Referências Regulatórias</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['STCW', 'MLC 2006', 'ISM Code', 'SOLAS', 'NR-30', 'NR-35'].map(ref => (
                        <div key={ref} className="flex items-center space-x-2">
                          <Checkbox
                            id={`reg-${ref}`}
                            checked={formData.regulatory_reference.includes(ref)}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                regulatory_reference: checked
                                  ? [...prev.regulatory_reference, ref]
                                  : prev.regulatory_reference.filter(r => r !== ref)
                              }));
                            }}
                          />
                          <label htmlFor={`reg-${ref}`} className="text-sm">{ref}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-sm text-muted-foreground text-center">
                        {uploadProgress < 100 ? 'Enviando...' : 'Concluído!'}
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!uploadFile || uploadMutation.isPending}
                    className="gap-2"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Enviar Material
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {trainingDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum material de treinamento</p>
            <p className="text-sm">Faça upload do primeiro material</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {trainingDocs.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      {doc.document_type === 'assessment' ? <FileCheck className="h-4 w-4 text-purple-400" /> :
                       doc.document_type === 'certificate' ? <Award className="h-4 w-4 text-purple-400" /> :
                       doc.document_type === 'video' ? <Video className="h-4 w-4 text-purple-400" /> :
                       <BookOpen className="h-4 w-4 text-purple-400" />}
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{TRAINING_DOC_TYPES.find(t => t.value === doc.document_type)?.label}</span>
                        {doc.is_mandatory && (
                          <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default TrainingDocumentUpload;
