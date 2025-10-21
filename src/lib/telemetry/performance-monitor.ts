import { useEffect, useState } from "react";

interface PerfMetrics {
  cpu: number;
  memory: number;
  fps: number;
  timestamp: string;
}

/**
 * Hook de monitoramento de performance local
 * Envia métricas para o Nautilus ControlHub via MQTT
 */
export function usePerformanceMonitor(mqttClient?: any) {
  const [metrics, setMetrics] = useState<PerfMetrics>({
    cpu: 0,
    memory: 0,
    fps: 0,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = now;

        const mem = (performance as any).memory?.usedJSHeapSize / 1048576 || 0;
        const cpu = Math.random() * 10 + 30; // simulação para cliente web

        const newMetrics = {
          cpu: parseFloat(cpu.toFixed(2)),
          memory: parseFloat(mem.toFixed(2)),
          fps,
          timestamp: new Date().toISOString(),
        };

        setMetrics(newMetrics);

        if (mqttClient && mqttClient.connected) {
          mqttClient.publish(
            "nautilus/telemetry/performance",
            JSON.stringify(newMetrics),
            { qos: 0 }
          );
        }
      }
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [mqttClient]);

  return metrics;
}
