/**
 * Data Compression Utilities
 * Compress data before sending/storing
 */

/**
 * Compress string data using native compression API
 */
export async function compressString(data: string): Promise<Uint8Array> {
  if (!('CompressionStream' in window)) {
    // Fallback: return as-is
    return new TextEncoder().encode(data);
  }

  const stream = new Blob([data]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
  const reader = compressedStream.getReader();
  
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Decompress data
 */
export async function decompressString(data: Uint8Array): Promise<string> {
  if (!('DecompressionStream' in window)) {
    return new TextDecoder().decode(data);
  }

  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  const blob = new Blob([arrayBuffer]);
  const stream = blob.stream();
  const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
  const reader = decompressedStream.getReader();
  
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(result);
}

/**
 * Compress JSON data
 */
export async function compressJSON<T>(data: T): Promise<string> {
  const json = JSON.stringify(data);
  const compressed = await compressString(json);
  return btoa(String.fromCharCode(...compressed));
}

/**
 * Decompress JSON data
 */
export async function decompressJSON<T>(compressed: string): Promise<T> {
  const binary = atob(compressed);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const json = await decompressString(bytes);
  return JSON.parse(json);
}

/**
 * Calculate compression ratio
 */
export function getCompressionRatio(original: string, compressed: Uint8Array): number {
  const originalSize = new TextEncoder().encode(original).length;
  const compressedSize = compressed.length;
  return 1 - (compressedSize / originalSize);
}

/**
 * Check if compression is worth it (only compress if savings > 20%)
 */
export async function shouldCompress(data: string): Promise<boolean> {
  if (data.length < 1000) return false; // Don't compress small data
  
  const compressed = await compressString(data);
  const ratio = getCompressionRatio(data, compressed);
  
  return ratio > 0.2;
}
