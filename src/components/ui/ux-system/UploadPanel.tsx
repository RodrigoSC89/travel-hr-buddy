/**
 * UploadPanel - Painel de Upload Padrão
 * UX SYSTEM v1.0 - NAUTI ONE
 * 
 * Upload com:
 * - Drag & drop
 * - Progress
 * - Preview
 * - Delete
 * - Lista de arquivos
 */

import React, { useCallback, useState } from "react";
import { logger } from "@/lib/logger";
import { useDropzone, Accept } from "react-dropzone";
import {
  Upload,
  X,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

export interface UploadPanelProps {
  // Files
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  
  // Upload handler
  onUpload: (file: File) => Promise<{ id: string; url: string }>;
  
  // Config
  accept?: Accept;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  
  // Actions
  onDelete?: (fileId: string) => Promise<void>;
  onView?: (file: UploadedFile) => void;
  onDownload?: (file: UploadedFile) => void;
  
  // State
  disabled?: boolean;
  
  // Style
  className?: string;
  compact?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type.includes("spreadsheet") || type.includes("excel")) return FileSpreadsheet;
  if (type.includes("pdf") || type.includes("document")) return FileText;
  return File;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({
  files,
  onFilesChange,
  onUpload,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  multiple = true,
  onDelete,
  onView,
  onDownload,
  disabled = false,
  className,
  compact = false,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleUpload = useCallback(async (acceptedFiles: File[]) => {
    const remainingSlots = maxFiles - files.length;
    const filesToUpload = acceptedFiles.slice(0, remainingSlots);

    for (const file of filesToUpload) {
      // Add file with uploading status
      const tempId = `temp-${Date.now()}-${crypto.randomUUID()}`;
      const newFile: UploadedFile = {
        id: tempId,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading",
      };

      const currentFiles = [...files, newFile];
      onFilesChange(currentFiles);

      try {
        // Simulate progress updates
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress = Math.min(progress + 10, 90);
          onFilesChange(
            currentFiles.map((f: UploadedFile) =>
              f.id === tempId ? { ...f, progress } : f
            )
          );
        }, 200);

        const result = await onUpload(file);

        clearInterval(progressInterval);

        // Update with final result
        onFilesChange(
          currentFiles.map((f: UploadedFile) =>
            f.id === tempId
              ? {
                  ...f,
                  id: result.id,
                  url: result.url,
                  progress: 100,
                  status: "completed" as const,
                }
              : f
          )
        );
      } catch (error) {
        // Update with error
        onFilesChange(
          currentFiles.map((f: UploadedFile) =>
            f.id === tempId
              ? {
                  ...f,
                  status: "error" as const,
                  error: error instanceof Error ? error.message : "Erro ao enviar",
                }
              : f
          )
        );
      }
    }
  }, [files, maxFiles, onFilesChange, onUpload]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop: handleUpload,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept,
    maxSize,
    multiple,
    disabled: disabled || files.length >= maxFiles,
  });

  const handleDelete = async (fileId: string) => {
    if (onDelete) {
      try {
        await onDelete(fileId);
      } catch (error) {
        logger.error("Failed to delete file", error as Error);
      }
    }
    onFilesChange(files.filter((f) => f.id !== fileId));
  };

  const canUpload = !disabled && files.length < maxFiles;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      {canUpload && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer",
            "flex flex-col items-center justify-center text-center",
            isDragActive && "border-primary bg-primary/5",
            isDragReject && "border-destructive bg-destructive/5",
            !isDragActive && !isDragReject && "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed",
            compact && "p-4"
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn("w-10 h-10 mb-3 text-muted-foreground", compact && "w-6 h-6 mb-2")} />
          <p className={cn("text-sm font-medium", compact && "text-xs")}>
            {isDragActive
              ? "Solte os arquivos aqui"
              : "Arraste arquivos ou clique para selecionar"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Máximo {formatFileSize(maxSize)} por arquivo
            {maxFiles > 1 && ` • Até ${maxFiles} arquivos`}
          </p>
        </div>
      )}

      {/* Limit reached message */}
      {files.length >= maxFiles && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Limite de {maxFiles} arquivos atingido
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type);
            
            return (
              <div
                key={file.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border bg-card",
                  file.status === "error" && "border-destructive/50 bg-destructive/5"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  file.status === "completed" && "bg-primary/10",
                  file.status === "uploading" && "bg-muted",
                  file.status === "error" && "bg-destructive/10"
                )}>
                  {file.status === "uploading" ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : file.status === "error" ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <FileIcon className="w-5 h-5 text-primary" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    {file.status === "completed" && (
                      <Badge variant="outline" className="gap-1 text-success">
                        <CheckCircle className="w-3 h-3" />
                        Enviado
                      </Badge>
                    )}
                    {file.status === "error" && (
                      <span className="text-destructive">{file.error}</span>
                    )}
                  </div>
                  
                  {/* Progress */}
                  {file.status === "uploading" && (
                    <Progress value={file.progress} className="h-1 mt-2" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {file.status === "completed" && onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(file)}
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  {file.status === "completed" && onDownload && file.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(file)}
                      title="Baixar"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    disabled={file.status === "uploading"}
                    title="Remover"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UploadPanel;
