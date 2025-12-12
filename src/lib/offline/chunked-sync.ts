/**
 * Chunked Sync - PATCH 950
 * Divides large data transfers into small chunks for 2Mbps networks
 */

import { logger } from "@/lib/logger";
import { compressPayload, decompressPayload, CompressedPayload } from "./payload-compression";
import { bandwidthOptimizer } from "@/lib/performance/low-bandwidth-optimizer";

interface SyncChunk {
  id: string;
  parentId: string;
  index: number;
  total: number;
  data: string;
  checksum: string;
  timestamp: number;
}

interface ChunkedSyncConfig {
  // Base chunk size in bytes (adjusts based on bandwidth)
  baseChunkSize: number;
  // Maximum concurrent chunk uploads
  maxConcurrent: number;
  // Retry delay for failed chunks
  retryDelayMs: number;
  // Maximum retries per chunk
  maxRetries: number;
}

const DEFAULT_CONFIG: ChunkedSyncConfig = {
  baseChunkSize: 16384, // 16KB base
  maxConcurrent: 2,
  retryDelayMs: 1000,
  maxRetries: 3,
};

// Adaptive chunk sizes based on connection
const CHUNK_SIZES: Record<string, number> = {
  "4g": 65536,     // 64KB
  "3g": 32768,     // 32KB
  "2g": 8192,      // 8KB
  "slow-2g": 4096, // 4KB
  "offline": 2048, // 2KB (for storage only)
};

class ChunkedSyncManager {
  private config: ChunkedSyncConfig;
  private pendingChunks: Map<string, SyncChunk[]> = new Map();
  private uploadProgress: Map<string, { completed: number; total: number }> = new Map();
  private listeners: Set<(progress: { id: string; completed: number; total: number }) => void> = new Set();

  constructor(config: Partial<ChunkedSyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get optimal chunk size based on current connection
   */
  private getChunkSize(): number {
    const connectionType = bandwidthOptimizer.getConnectionType();
    return CHUNK_SIZES[connectionType] || this.config.baseChunkSize;
  }

  /**
   * Split data into chunks for transmission
   */
  createChunks<T>(id: string, data: T): SyncChunk[] {
    const compressed = compressPayload(data);
    const jsonString = JSON.stringify(compressed);
    const chunkSize = this.getChunkSize();
    
    const chunks: SyncChunk[] = [];
    const totalChunks = Math.ceil(jsonString.length / chunkSize);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, jsonString.length);
      const chunkData = jsonString.slice(start, end);
      
      chunks.push({
        id: `${id}-chunk-${i}`,
        parentId: id,
        index: i,
        total: totalChunks,
        data: chunkData,
        checksum: this.generateChecksum(chunkData),
        timestamp: Date.now(),
      });
    }
    
    logger.debug("[ChunkedSync] Created chunks", {
      id,
      totalChunks,
      chunkSize,
      originalSize: jsonString.length,
    });
    
    return chunks;
  }

  /**
   * Reassemble chunks back into original data
   */
  reassembleChunks<T>(chunks: SyncChunk[]): T | null {
    // Sort by index
    const sorted = [...chunks].sort((a, b) => a.index - b.index);
    
    // Verify completeness
    if (sorted.length !== sorted[0]?.total) {
      logger.error("[ChunkedSync] Incomplete chunks", {
        received: sorted.length,
        expected: sorted[0]?.total,
      });
      return null;
    }
    
    // Verify checksums
    for (const chunk of sorted) {
      if (this.generateChecksum(chunk.data) !== chunk.checksum) {
        logger.error("[ChunkedSync] Checksum mismatch", { chunkId: chunk.id });
        return null;
      }
    }
    
    // Reassemble
    const jsonString = sorted.map(c => c.data).join("");
    
    try {
      const compressed = JSON.parse(jsonString) as CompressedPayload;
      return decompressPayload<T>(compressed);
    } catch (error) {
      logger.error("[ChunkedSync] Failed to parse reassembled data", { error });
      return null;
    }
  }

  /**
   * Upload data in chunks with progress tracking
   */
  async uploadChunked<T>(
    id: string,
    data: T,
    uploadFn: (chunk: SyncChunk) => Promise<boolean>
  ): Promise<boolean> {
    const chunks = this.createChunks(id, data);
    
    this.uploadProgress.set(id, { completed: 0, total: chunks.length });
    this.pendingChunks.set(id, chunks);
    
    const queue = [...chunks];
    const inProgress: Promise<void>[] = [];
    const failedChunks: SyncChunk[] = [];
    
    while (queue.length > 0 || inProgress.length > 0) {
      // Fill up to max concurrent
      while (queue.length > 0 && inProgress.length < this.config.maxConcurrent) {
        const chunk = queue.shift()!;
        
        const uploadPromise = this.uploadChunkWithRetry(chunk, uploadFn)
          .then((success) => {
            if (!success) {
              failedChunks.push(chunk);
            } else {
              const progress = this.uploadProgress.get(id);
              if (progress) {
                progress.completed++;
                this.notifyProgress(id, progress.completed, progress.total);
              }
            }
          })
          .catch(() => {
            failedChunks.push(chunk);
          });
        
        inProgress.push(uploadPromise);
      }
      
      // Wait for at least one to complete
      if (inProgress.length > 0) {
        await Promise.race(inProgress);
        // Remove completed promises
        inProgress.splice(0, inProgress.length);
      }
    }
    
    // Cleanup
    this.uploadProgress.delete(id);
    this.pendingChunks.delete(id);
    
    const success = failedChunks.length === 0;
    
    logger.info("[ChunkedSync] Upload completed", {
      id,
      success,
      failedChunks: failedChunks.length,
    });
    
    return success;
  }

  private async uploadChunkWithRetry(
    chunk: SyncChunk,
    uploadFn: (chunk: SyncChunk) => Promise<boolean>
  ): Promise<boolean> {
    let retries = 0;
    
    while (retries < this.config.maxRetries) {
      try {
        const success = await uploadFn(chunk);
        if (success) return true;
      } catch (error) {
        logger.warn("[ChunkedSync] Chunk upload failed", {
          chunkId: chunk.id,
          retry: retries,
          error,
        });
      }
      
      retries++;
      
      // Exponential backoff
      const delay = this.config.retryDelayMs * Math.pow(2, retries - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    return false;
  }

  private generateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }

  /**
   * Subscribe to upload progress
   */
  onProgress(callback: (progress: { id: string; completed: number; total: number }) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyProgress(id: string, completed: number, total: number): void {
    const progress = { id, completed, total };
    this.listeners.forEach(cb => cb(progress));
  }

  /**
   * Get current upload progress
   */
  getProgress(id: string): { completed: number; total: number } | null {
    return this.uploadProgress.get(id) || null;
  }

  /**
   * Cancel pending upload
   */
  cancelUpload(id: string): void {
    this.pendingChunks.delete(id);
    this.uploadProgress.delete(id);
    logger.info("[ChunkedSync] Upload cancelled", { id });
  }

  /**
   * Get pending chunks for resume
   */
  getPendingChunks(id: string): SyncChunk[] {
    return this.pendingChunks.get(id) || [];
  }
}

export const chunkedSyncManager = new ChunkedSyncManager();

// Priority data types that should sync first
export const CRITICAL_DATA_TYPES = [
  "fleet_status",
  "alerts",
  "emergencies",
  "vessel_position",
  "crew_check_in",
] as const;

export const HIGH_PRIORITY_DATA_TYPES = [
  "maintenance_critical",
  "compliance_alerts",
  "weather_warnings",
  "fuel_alerts",
] as const;

export const NORMAL_DATA_TYPES = [
  "maintenance_scheduled",
  "reports",
  "checklists",
  "documents",
] as const;

export const LOW_PRIORITY_DATA_TYPES = [
  "analytics",
  "logs",
  "historical_data",
  "training_records",
] as const;

/**
 * Get sync priority for a data type
 */
export function getSyncPriority(table: string): "critical" | "high" | "normal" | "low" {
  if (CRITICAL_DATA_TYPES.includes(table as any)) return "critical";
  if (HIGH_PRIORITY_DATA_TYPES.includes(table as any)) return "high";
  if (LOW_PRIORITY_DATA_TYPES.includes(table as any)) return "low";
  return "normal";
}
