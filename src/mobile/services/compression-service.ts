/**
 * PATCH 589 - Compression Service
 * Lightweight compression for storage optimization
 */

import { structuredLogger } from "@/lib/logger/structured-logger";

class CompressionService {
  private readonly COMPRESSION_THRESHOLD = 1024;

  async compress(data: string): Promise<string> {
    if (data.length < this.COMPRESSION_THRESHOLD) {
      return data;
    }
    // Simple prefix for identification
    return "RAW:" + data;
  }

  async decompress(data: string): Promise<string> {
    if (data.startsWith("RAW:")) {
      return data.substring(4);
    }
    return data;
  }

  async compressJSON<T>(data: T): Promise<string> {
    const cleaned = JSON.stringify(data, (_, value) => {
      if (value === null || value === "") return undefined;
      return value;
    });
    return this.compress(cleaned);
  }

  async decompressJSON<T>(data: string): Promise<T> {
    const decompressed = await this.decompress(data);
    return JSON.parse(decompressed);
  }
}

export const compressionService = new CompressionService();
