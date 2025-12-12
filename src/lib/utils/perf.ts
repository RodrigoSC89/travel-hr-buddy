import { logger } from "@/lib/logger";

/**
 * Monitora e otimiza eventos pesados (MQTT, AI e Builds)
 */
export const optimizeEventLoop = () => {
  const t0 = performance.now();
  requestIdleCallback(() => {
    const duration = performance.now() - t0;
    if (duration > 16) {
      logger.warn(`⚠️ Event loop blocked for ${duration.toFixed(2)}ms`);
    }
  });
};

/**
 * Força GC leve entre ciclos MQTT
 */
export const forceGC = () => {
  if (globalThis.gc) {
    logger.info("🧹 GC manual executado");
    globalThis.gc();
  }
};
