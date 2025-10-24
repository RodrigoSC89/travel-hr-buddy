/**
 * PATCH 91.0 - Document Upload Component
 * Upload component with drag-and-drop support
 */

import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<any>;
  isUploading: boolean;
}

export function DocumentUpload({ onUpload, isUploading }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0];
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Apenas arquivos PDF e DOCX são permitidos');
        return;
      }

      await onUpload(file);
    },
    [onUpload]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const files = e.target.files;
      if (!files || files.length === 0) return;

      await onUpload(files[0]);
      e.target.value = ''; // Reset input
    },
    [onUpload]
  );

  return (
    <Card
      className={cn(
        'p-8 border-2 border-dashed transition-colors',
        isDragging && 'border-primary bg-primary/5',
        isUploading && 'opacity-50 pointer-events-none'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-full bg-primary/10">
          {isUploading ? (
            <div className="animate-spin">
              <Upload className="h-8 w-8 text-primary" />
            </div>
          ) : (
            <FileText className="h-8 w-8 text-primary" />
          )}
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">
            {isUploading ? 'Carregando documento...' : 'Upload de Documento'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Arraste e solte um arquivo PDF ou DOCX aqui
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">ou</span>
          <label htmlFor="file-upload">
            <Button variant="outline" disabled={isUploading} asChild>
              <span className="cursor-pointer">
                Selecionar Arquivo
              </span>
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileInput}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>

        <p className="text-xs text-muted-foreground">
          Máximo: 10MB • Formatos: PDF, DOCX
        </p>
      </div>
    </Card>
  );
}
