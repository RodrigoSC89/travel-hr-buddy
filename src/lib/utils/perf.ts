/**
 * Monitora e otimiza eventos pesados (MQTT, AI e Builds)
 */
export const optimizeEventLoop = () => {
  const t0 = performance.now();
  requestIdleCallback(() => {
    const duration = performance.now() - t0;
    if (duration > 16) console.warn(`⚙️ Evento pesado: ${duration.toFixed(2)}ms`);
  });
};

/**
 * Força GC leve entre ciclos MQTT
 */
export const forceGC = () => {
  if (globalThis.gc) {
    console.log("🧹 GC manual executado");
    globalThis.gc();
  }
};
