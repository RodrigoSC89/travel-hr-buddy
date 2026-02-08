/**
 * Resumable Upload Service
 * PATCH 868: Migrated to edge-function-helper
 */

import * as tus from "tus-js-client";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { openDB, IDBPDatabase } from "idb";
import { SUPABASE_URL } from "@/lib/supabase/edge-function-helper";

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff

interface UploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
  speed: number; // bytes per second
  eta: number; // seconds remaining
}

interface UploadState {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadUrl?: string;
  bytesUploaded: number;
  status: "pending" | "uploading" | "paused" | "completed" | "failed";
  error?: string;
  createdAt: number;
  updatedAt: number;
}

interface ResumableUploadDB {
  uploads: {
    key: string;
    value: UploadState;
    indexes: { "by-status": string };
  };
}

class ResumableUploadService {
  private db: IDBPDatabase<ResumableUploadDB> | null = null;
  private activeUploads = new Map<string, tus.Upload>();

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<ResumableUploadDB>("nautilus-uploads", 1, {
      upgrade(db) {
        const store = db.createObjectStore("uploads", { keyPath: "id" });
        store.createIndex("by-status", "status");
      },
    });

    logger.info("[ResumableUpload] Service initialized");
  }

  /**
   * Upload a file with resumable support
   */
  async upload(
    file: File,
    bucket: string,
    path: string,
    onProgress?: (progress: UploadProgress) => void,
    onComplete?: (url: string) => void,
    onError?: (error: Error) => void
  ): Promise<string> {
    await this.initialize();

    const uploadId = `${Date.now()}-${crypto.randomUUID().slice(0, 9)}`;
    const startTime = Date.now();
    let lastBytesUploaded = 0;
    let lastTime = startTime;

    // Save initial state
    const uploadState: UploadState = {
      id: uploadId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      bytesUploaded: 0,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await this.saveUploadState(uploadState);

    // Get Supabase storage URL for tus
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User must be authenticated to upload files");
    }

    const tusEndpoint = `${SUPABASE_URL}/storage/v1/upload/resumable`;

    return new Promise((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: tusEndpoint,
        retryDelays: RETRY_DELAYS,
        chunkSize: CHUNK_SIZE,
        metadata: {
          bucketName: bucket,
          objectName: path,
          contentType: file.type,
          cacheControl: "3600",
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "x-upsert": "true",
        },
        onError: async (error) => {
          logger.error("[ResumableUpload] Upload failed:", error);
          await this.updateUploadState(uploadId, { 
            status: "failed", 
            error: error.message 
          });
          onError?.(error);
          reject(error);
        },
        onProgress: async (bytesUploaded, bytesTotal) => {
          const now = Date.now();
          const timeDiff = (now - lastTime) / 1000;
          const bytesDiff = bytesUploaded - lastBytesUploaded;
          const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;
          const remaining = bytesTotal - bytesUploaded;
          const eta = speed > 0 ? remaining / speed : 0;

          const progress: UploadProgress = {
            bytesUploaded,
            bytesTotal,
            percentage: Math.round((bytesUploaded / bytesTotal) * 100),
            speed,
            eta,
          };

          lastBytesUploaded = bytesUploaded;
          lastTime = now;

          await this.updateUploadState(uploadId, { 
            bytesUploaded,
            status: "uploading" 
          });

          onProgress?.(progress);
        },
        onSuccess: async () => {
          const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
          
          await this.updateUploadState(uploadId, { 
            status: "completed",
            uploadUrl: publicUrl 
          });

          logger.info("[ResumableUpload] Upload completed:", publicUrl);
          onComplete?.(publicUrl);
          resolve(publicUrl);
        },
      });

      this.activeUploads.set(uploadId, upload);

      // Check for previous upload to resume
      const previousUpload = upload.findPreviousUploads();
      previousUpload.then((uploads) => {
        if (uploads.length > 0) {
          logger.info("[ResumableUpload] Resuming previous upload");
          upload.resumeFromPreviousUpload(uploads[0]);
        }
        upload.start();
      });
    });
  }

  /**
   * Pause an active upload
   */
  pause(uploadId: string): void {
    const upload = this.activeUploads.get(uploadId);
    if (upload) {
      upload.abort();
      this.updateUploadState(uploadId, { status: "paused" });
      logger.info("[ResumableUpload] Upload paused:", uploadId);
    }
  }

  /**
   * Resume a paused upload
   */
  async resume(uploadId: string): Promise<void> {
    const state = await this.getUploadState(uploadId);
    if (!state || state.status !== "paused") {
      throw new Error("Upload not found or not paused");
    }

    const upload = this.activeUploads.get(uploadId);
    if (upload) {
      upload.start();
      await this.updateUploadState(uploadId, { status: "uploading" });
      logger.info("[ResumableUpload] Upload resumed:", uploadId);
    }
  }

  /**
   * Cancel and remove an upload
   */
  async cancel(uploadId: string): Promise<void> {
    const upload = this.activeUploads.get(uploadId);
    if (upload) {
      upload.abort();
      this.activeUploads.delete(uploadId);
    }
    await this.deleteUploadState(uploadId);
    logger.info("[ResumableUpload] Upload cancelled:", uploadId);
  }

  /**
   * Get all pending/paused uploads for resume
   */
  async getPendingUploads(): Promise<UploadState[]> {
    await this.initialize();
    if (!this.db) return [];

    const tx = this.db.transaction("uploads", "readonly");
    const index = tx.store.index("by-status");
    
    const pending = await index.getAll("pending");
    const paused = await index.getAll("paused");
    
    return [...pending, ...paused];
  }

  private async saveUploadState(state: UploadState): Promise<void> {
    if (!this.db) return;
    await this.db.put("uploads", state);
  }

  private async updateUploadState(
    id: string, 
    updates: Partial<UploadState>
  ): Promise<void> {
    const current = await this.getUploadState(id);
    if (current) {
      await this.saveUploadState({
        ...current,
        ...updates,
        updatedAt: Date.now(),
      });
    }
  }

  private async getUploadState(id: string): Promise<UploadState | undefined> {
    if (!this.db) return undefined;
    return this.db.get("uploads", id);
  }

  private async deleteUploadState(id: string): Promise<void> {
    if (!this.db) return;
    await this.db.delete("uploads", id);
  }
}

export const resumableUploadService = new ResumableUploadService();
