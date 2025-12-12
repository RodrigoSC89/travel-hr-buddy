/**
 * Progressive Upload Component
 * Shows detailed progress for uploads on slow connections
 */

import { memo, memo, useCallback, useState } from "react";;;
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  speed?: number; // bytes per second
  eta?: number; // seconds remaining
}

interface ProgressiveUploadProps {
  onUpload: (file: File, onProgress: (progress: number) => void) => Promise<string>;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  className?: string;
}

export const ProgressiveUpload = memo(function({
  onUpload,
  accept = "*",
  multiple = false,
  maxSize = 10,
  className,
}: ProgressiveUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList)
      .filter(file => file.size <= maxSize * 1024 * 1024)
      .map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        progress: 0,
        status: "pending" as const,
      }));

    setFiles(prev => [...prev, ...newFiles]);

    // Upload files sequentially for better progress tracking
    for (const uploadFile of newFiles) {
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: "uploading" as const } : f
        )
      );

      const startTime = Date.now();
      let lastProgress = 0;

      try {
        await onUpload(uploadFile.file, (progress) => {
          const elapsed = (Date.now() - startTime) / 1000;
          const bytesUploaded = (progress / 100) * uploadFile.file.size;
          const speed = bytesUploaded / elapsed;
          const remaining = uploadFile.file.size - bytesUploaded;
          const eta = speed > 0 ? remaining / speed : 0;

          setFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, progress, speed, eta }
                : f
            )
          );
          lastProgress = progress;
        });

        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: "success" as const, progress: 100 } : f
          )
        );
      } catch (error) {
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, status: "error" as const, error: "Upload falhou" }
              : f
          )
        );
      }
    }
  }, [onUpload, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
        )}
      >
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Arraste arquivos aqui ou
        </p>
        <label>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            className="hidden"
          />
          <Button variant="outline" size="sm" asChild>
            <span className="cursor-pointer">Selecionar Arquivos</span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground mt-2">
          Máximo {maxSize}MB por arquivo
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card"
            >
              {/* Status Icon */}
              <div className="shrink-0">
                {file.status === "uploading" && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                )}
                {file.status === "success" && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {file.status === "error" && (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                {file.status === "pending" && (
                  <div className="h-5 w-5 rounded-full border-2 border-muted" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatBytes(file.file.size)}</span>
                  {file.status === "uploading" && file.speed && (
                    <>
                      <span>•</span>
                      <span>{formatBytes(file.speed)}/s</span>
                      {file.eta !== undefined && (
                        <>
                          <span>•</span>
                          <span>~{formatTime(file.eta)} restante</span>
                        </>
                      )}
                    </>
                  )}
                  {file.status === "error" && (
                    <span className="text-destructive">{file.error}</span>
                  )}
                </div>
                {file.status === "uploading" && (
                  <Progress value={file.progress} className="h-1 mt-2" />
                )}
              </div>

              {/* Remove Button */}
              {file.status !== "uploading" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleremoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Hook for programmatic upload with progress
 */
export const useProgressiveUpload = memo(function() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (
    file: File,
    uploadFn: (file: File, onProgress: (p: number) => void) => Promise<string>
  ) => {
    setIsUploading(true);
    setProgress(0);

    try {
      const result = await uploadFn(file, setProgress);
      return result;
    } finally {
      setIsUploading(false);
    }
  };

  return { progress, isUploading, upload };
}
