/**
 * useResumableUpload Hook
 * React hook for resumable file uploads with progress tracking
 * PATCH: Phase 2 - Technical Resilience
 */

import { useState, useCallback, useEffect } from "react";
import { resumableUploadService } from "@/lib/uploads/resumable-upload-service";
import { toast } from "sonner";

interface UploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
  speed: number;
  eta: number;
}

interface UploadState {
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  uploadedUrl: string | null;
}

interface UseResumableUploadOptions {
  bucket: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: UploadProgress) => void;
}

export function useResumableUpload(options: UseResumableUploadOptions) {
  const { bucket, onSuccess, onError, onProgress } = options;

  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: null,
    error: null,
    uploadedUrl: null,
  });

  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  }, []);

  const upload = useCallback(
    async (file: File, path?: string): Promise<string | null> => {
      const filePath = path || `${Date.now()}-${file.name}`;

      setState({
        isUploading: true,
        progress: null,
        error: null,
        uploadedUrl: null,
      });

      try {
        const url = await resumableUploadService.upload(
          file,
          bucket,
          filePath,
          (progress) => {
            setState((prev) => ({ ...prev, progress }));
            onProgress?.(progress);
          },
          (url) => {
            setState((prev) => ({
              ...prev,
              isUploading: false,
              uploadedUrl: url,
            }));
            toast.success("Upload concluído!", {
              description: `${file.name} (${formatBytes(file.size)})`,
            });
            onSuccess?.(url);
          },
          (error) => {
            setState((prev) => ({
              ...prev,
              isUploading: false,
              error: error.message,
            }));
            toast.error("Falha no upload", {
              description: error.message,
            });
            onError?.(error);
          }
        );

        return url;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));
        toast.error("Falha no upload", { description: errorMessage });
        onError?.(error instanceof Error ? error : new Error(errorMessage));
        return null;
      }
    },
    [bucket, onSuccess, onError, onProgress, formatBytes]
  );

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: null,
      error: null,
      uploadedUrl: null,
    });
  }, []);

  return {
    upload,
    reset,
    isUploading: state.isUploading,
    progress: state.progress,
    error: state.error,
    uploadedUrl: state.uploadedUrl,
    formatBytes,
    formatTime,
  };
}
