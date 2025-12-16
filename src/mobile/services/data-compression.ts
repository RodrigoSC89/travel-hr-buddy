/**
 * Data Compression Service
 * Optimizes data transfer for slow networks (2 Mbps target)
 */

interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  timeMs: number;
}

interface CompressionOptions {
  level?: "fast" | "balanced" | "max";
  chunkSize?: number;
}

class DataCompressionService {
  private textEncoder = new TextEncoder();
  private textDecoder = new TextDecoder();

  /**
   * Compress data using CompressionStream API (if available) or LZ-based fallback
   */
  async compress(data: any, _options: CompressionOptions = {}): Promise<{
    compressed: Uint8Array;
    stats: CompressionStats;
  }> {
    const startTime = performance.now();
    const jsonString = JSON.stringify(data);
    const originalBytes = this.textEncoder.encode(jsonString);
    
    let compressedBytes: Uint8Array;

    if (typeof CompressionStream !== "undefined") {
      // Use native CompressionStream API
      compressedBytes = await this.compressWithStream(originalBytes);
    } else {
      // Fallback to simple run-length encoding for basic compression
      compressedBytes = this.simpleCompress(originalBytes);
    }

    const stats: CompressionStats = {
      originalSize: originalBytes.length,
      compressedSize: compressedBytes.length,
      compressionRatio: compressedBytes.length / originalBytes.length,
      timeMs: performance.now() - startTime,
    };

    console.debug("Data compressed", stats);

    return { compressed: compressedBytes, stats };
  }

  /**
   * Decompress data
   */
  async decompress(compressed: Uint8Array): Promise<any> {
    let decompressedBytes: Uint8Array;

    if (typeof DecompressionStream !== "undefined") {
      decompressedBytes = await this.decompressWithStream(compressed);
    } else {
      decompressedBytes = this.simpleDecompress(compressed);
    }

    const jsonString = this.textDecoder.decode(decompressedBytes);
    return JSON.parse(jsonString);
  }

  /**
   * Compress using native CompressionStream (gzip)
   */
  private async compressWithStream(data: Uint8Array): Promise<Uint8Array> {
    const stream = new CompressionStream("gzip");
    const writer = stream.writable.getWriter();
    writer.write(data as unknown as BufferSource);
    writer.close();

    const reader = stream.readable.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  /**
   * Decompress using native DecompressionStream (gzip)
   */
  private async decompressWithStream(data: Uint8Array): Promise<Uint8Array> {
    const stream = new DecompressionStream("gzip");
    const writer = stream.writable.getWriter();
    writer.write(data as unknown as BufferSource);
    writer.close();

    const reader = stream.readable.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  /**
   * Simple RLE compression fallback
   */
  private simpleCompress(data: Uint8Array): Uint8Array {
    const result: number[] = [];
    let i = 0;

    while (i < data.length) {
      const current = data[i];
      let count = 1;

      while (i + count < data.length && data[i + count] === current && count < 255) {
        count++;
      }

      if (count > 3) {
        // Use RLE for runs > 3
        result.push(0xFF, count, current); // 0xFF is escape sequence
      } else {
        // Copy literal bytes
        for (let j = 0; j < count; j++) {
          if (current === 0xFF) {
            result.push(0xFF, 1, current);
          } else {
            result.push(current);
          }
        }
      }

      i += count;
    }

    return new Uint8Array(result);
  }

  /**
   * Simple RLE decompression fallback
   */
  private simpleDecompress(data: Uint8Array): Uint8Array {
    const result: number[] = [];
    let i = 0;

    while (i < data.length) {
      if (data[i] === 0xFF && i + 2 < data.length) {
        const count = data[i + 1];
        const value = data[i + 2];
        for (let j = 0; j < count; j++) {
          result.push(value);
        }
        i += 3;
      } else {
        result.push(data[i]);
        i++;
      }
    }

    return new Uint8Array(result);
  }

  /**
   * Chunk data for incremental transfer
   */
  chunkData(data: Uint8Array, chunkSize: number = 32 * 1024): Uint8Array[] {
    const chunks: Uint8Array[] = [];
    
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  /**
   * Estimate transfer time for data at given speed
   */
  estimateTransferTime(
    dataSize: number, 
    speedMbps: number = 2
  ): { seconds: number; formatted: string } {
    const bitsPerSecond = speedMbps * 1000000;
    const dataBits = dataSize * 8;
    const seconds = dataBits / bitsPerSecond;
    
    let formatted: string;
    if (seconds < 1) {
      formatted = `${Math.round(seconds * 1000)}ms`;
    } else if (seconds < 60) {
      formatted = `${Math.round(seconds)}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      formatted = `${minutes}m ${remainingSeconds}s`;
    }
    
    return { seconds, formatted };
  }

  /**
   * Optimize payload for slow network
   */
  optimizeForSlowNetwork<T extends Record<string, any>>(
    data: T,
    options: {
      excludeFields?: string[];
      maxArrayLength?: number;
      truncateStrings?: number;
    } = {}
  ): T {
    const {
      excludeFields = ["metadata", "raw_data", "debug_info"],
      maxArrayLength = 50,
      truncateStrings = 500,
    } = options;

    const optimize = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      
      if (Array.isArray(obj)) {
        const sliced = obj.slice(0, maxArrayLength);
        return sliced.map(optimize);
      }
      
      if (typeof obj === "object") {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
          if (excludeFields.includes(key)) continue;
          result[key] = optimize(value);
        }
        return result;
      }
      
      if (typeof obj === "string" && obj.length > truncateStrings) {
        return obj.substring(0, truncateStrings) + "...";
      }
      
      return obj;
    };

    return optimize(data) as T;
  }

  /**
   * Get compression recommendations based on network
   */
  getRecommendations(networkSpeed: number): {
    shouldCompress: boolean;
    chunkSize: number;
    compressionLevel: "fast" | "balanced" | "max";
  } {
    if (networkSpeed <= 1) {
      return {
        shouldCompress: true,
        chunkSize: 16 * 1024, // 16KB chunks
        compressionLevel: "max",
      };
    } else if (networkSpeed <= 2) {
      return {
        shouldCompress: true,
        chunkSize: 32 * 1024, // 32KB chunks
        compressionLevel: "balanced",
      };
    } else if (networkSpeed <= 5) {
      return {
        shouldCompress: true,
        chunkSize: 64 * 1024, // 64KB chunks
        compressionLevel: "fast",
      };
    } else {
      return {
        shouldCompress: false,
        chunkSize: 128 * 1024, // 128KB chunks
        compressionLevel: "fast",
      };
    }
  }
}

export const dataCompression = new DataCompressionService();
