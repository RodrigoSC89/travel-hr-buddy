/**
 * FileUploadDialog - Upload real de arquivos de evidência
 * PATCH: Substituição de toast placeholder por upload funcional
 */

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface FilePreview {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function FileUploadDialog({ 
  onUploadComplete,
  maxFiles = 10,
  maxSizeMB = 50,
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
}: FileUploadProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo não suportado: ${file.type}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Arquivo muito grande (máx ${maxSizeMB}MB)`;
    }
    return null;
  };

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FilePreview[] = [];
    
    for (let i = 0; i < Math.min(fileList.length, maxFiles - files.length); i++) {
      const file = fileList[i];
      const error = validateFile(file);
      
      newFiles.push({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        status: error ? 'error' : 'pending',
        error: error || undefined
      });
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, maxFiles, acceptedTypes, maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setUploading(true);
    const uploadedFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;

      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' as const } : f
      ));

      try {
        const file = files[i].file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 9)}.${fileExt}`;
        const filePath = `evidences/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          id: fileName,
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          uploadedAt: new Date().toISOString()
        });

        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success' as const } : f
        ));
      } catch (error) {
        logger.error('Upload error:', error);
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error' as const, error: 'Falha no upload' } : f
        ));
      }
    }

    setUploading(false);

    if (uploadedFiles.length > 0) {
      toast.success(`${uploadedFiles.length} arquivo(s) enviado(s) com sucesso!`);
      onUploadComplete?.(uploadedFiles);
    }
  };

  const successCount = files.filter(f => f.status === 'success').length;
  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          PDF, JPG, PNG até {maxSizeMB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          className="hidden"
        />
        <Button 
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={files.length >= maxFiles}
        >
          <Upload className="h-4 w-4 mr-2" />
          Selecionar Arquivos
        </Button>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Arquivos ({files.length}/{maxFiles})
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((f, index) => (
              <div 
                key={f.file.name} 
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="text-sm truncate">{f.file.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    ({(f.file.size / 1024 / 1024).toFixed(1)}MB)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {f.status === 'pending' && (
                    <span className="text-xs text-muted-foreground">Pendente</span>
                  )}
                  {f.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {f.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                  {f.status === 'error' && (
                    <span className="text-xs text-destructive">{f.error}</span>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      {pendingCount > 0 && (
        <Button 
          onClick={uploadFiles} 
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Enviar {pendingCount} arquivo(s)
            </>
          )}
        </Button>
      )}

      {successCount > 0 && pendingCount === 0 && (
        <div className="text-center text-sm text-success">
          ✓ {successCount} arquivo(s) enviado(s) com sucesso
        </div>
      )}
    </div>
  );
}

export default FileUploadDialog;
