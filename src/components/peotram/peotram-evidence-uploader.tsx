/**
 * PEOTRAM Evidence Uploader Component
 * Upload photos and documents for audit items
 */

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Camera, FileText, Upload, X, Image, File, Trash2, Eye } from "lucide-react";
import { logger } from '@/lib/logger';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: 'photo' | 'document';
  size: number;
  uploadedAt: Date;
}

interface PeotramEvidenceUploaderProps {
  auditId: string;
  itemNumber: string;
  elementNumber: number;
  onUploadComplete?: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
}

export function PeotramEvidenceUploader({
  auditId,
  itemNumber,
  elementNumber,
  onUploadComplete,
  existingFiles = []
}: PeotramEvidenceUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getStoragePath = (fileName: string, type: 'photo' | 'document') => {
    const folder = type === 'photo' ? 'photos' : 'documents';
    return `audits/${auditId}/element-${elementNumber}/${itemNumber}/${folder}/${Date.now()}-${fileName}`;
  };

  const uploadFile = async (file: File, type: 'photo' | 'document') => {
    const path = getStoragePath(file.name, type);
    
    const { data, error } = await supabase.storage
      .from('peotram-evidence')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('peotram-evidence')
      .getPublicUrl(path);

    return {
      id: data.path,
      name: file.name,
      url: publicUrl,
      type,
      size: file.size,
      uploadedAt: new Date()
    };
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'document') => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: UploadedFile[] = [];
      const totalFiles = selectedFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        const uploaded = await uploadFile(file, type);
        uploadedFiles.push(uploaded);
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }

      const newFiles = [...files, ...uploadedFiles];
      setFiles(newFiles);
      onUploadComplete?.(newFiles);
      toast.success(`${uploadedFiles.length} arquivo(s) enviado(s)`);
    } catch (error) {
      logger.error('Upload error:', error);
      toast.error("Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [files, auditId, itemNumber, elementNumber, onUploadComplete]);

  const removeFile = async (fileId: string) => {
    try {
      await supabase.storage.from('peotram-evidence').remove([fileId]);
      const newFiles = files.filter(f => f.id !== fileId);
      setFiles(newFiles);
      onUploadComplete?.(newFiles);
      toast.success("Arquivo removido");
    } catch (error) {
      toast.error("Erro ao remover arquivo");
    }
  };

  const photos = files.filter(f => f.type === 'photo');
  const documents = files.filter(f => f.type === 'document');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Evidências - Item {itemNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Buttons */}
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e, 'photo')}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button variant="outline" size="sm" disabled={isUploading}>
              <Camera className="w-4 h-4 mr-2" />
              Fotos
            </Button>
          </div>
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={(e) => handleFileSelect(e, 'document')}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button variant="outline" size="sm" disabled={isUploading}>
              <FileText className="w-4 h-4 mr-2" />
              Documentos
            </Button>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">Enviando... {Math.round(uploadProgress)}%</p>
          </div>
        )}

        {/* Photos Grid */}
        {photos.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Fotos ({photos.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-white" onClick={() => window.open(photo.url, '_blank')}>
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-white" onClick={() => removeFile(photo.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents List */}
        {documents.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <File className="w-4 h-4" />
              Documentos ({documents.length})
            </p>
            <div className="space-y-1">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm truncate">{doc.name}</span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {(doc.size / 1024).toFixed(0)} KB
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => window.open(doc.url, '_blank')}>
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeFile(doc.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && !isUploading && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma evidência anexada
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default PeotramEvidenceUploader;
