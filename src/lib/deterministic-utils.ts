/**
 * Deterministic utility functions to replace Math.random() in production code.
 * Uses hash-based, index-based, or time-based sine waves for stable values.
 */

/** Simple string hash returning a number 0-1 */
export function hashToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash % 10000) / 10000;
}

/** Deterministic value in range based on string seed */
export function hashInRange(seed: string, min: number, max: number): number {
  return min + hashToNumber(seed) * (max - min);
}

/** Time-based sine wave value (smooth, deterministic for same timestamp) */
export function sineWave(periodMs: number, amplitude: number, offset: number, phase: number = 0): number {
  const now = Date.now();
  return offset + Math.sin((now / periodMs) + phase) * amplitude;
}

/** Index-based deterministic value in range */
export function indexInRange(index: number, min: number, max: number, total: number = 100): number {
  const normalized = (index % total) / total;
  return min + normalized * (max - min);
}

/** Generate deterministic chart data points using sine waves */
export function generateDeterministicTimeSeries(
  pointCount: number,
  baseValue: number,
  amplitude: number,
  label: string = ""
): { time: string; value: number }[] {
  const now = new Date();
  const seed = label.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  
  return Array.from({ length: pointCount }, (_, i) => {
    const time = new Date(now.getTime() - (pointCount - 1 - i) * 60 * 60 * 1000);
    const sineVal = Math.sin((i / pointCount) * Math.PI * 2 + seed) * amplitude;
    const cosVal = Math.cos((i / pointCount) * Math.PI * 3 + seed * 0.7) * (amplitude * 0.3);
    return {
      time: time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      value: Math.max(0, baseValue + sineVal + cosVal)
    };
  });
}
