/**
 * Bridge A11y Component
 * MQTT-based synchronization bridge for DP displays and remote consoles
 * Provides real-time status of MQTT connection for accessibility features
 */

import React, { useEffect, useState } from "react";
import { MQTTClient } from "@/core/MQTTClient";
import { Badge } from "@/components/ui/badge";

export default function BridgeA11y() {
  const [status, setStatus] = useState("Desconectado");

  useEffect(() => {
    // Initialize MQTT connection
    const mqttUrl = import.meta.env.VITE_MQTT_URL;
    
    if (!mqttUrl) {
      console.warn("⚠️ VITE_MQTT_URL não configurado");
      setStatus("Não Configurado");
      return;
    }

    // Connect to MQTT broker
    MQTTClient.connect({
      url: mqttUrl,
      topics: ["nautilus/bridge/sync", "nautilus/alerts/ack"]
    });

    // Monitor connection status
    const checkStatus = () => {
      const mqttStatus = MQTTClient.getStatus();
      if (mqttStatus.connected) {
        setStatus("Conectado");
      } else if (mqttStatus.connecting) {
        setStatus("Conectando...");
      } else {
        setStatus("Desconectado");
      }
    };

    // Check status initially and periodically
    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    // Subscribe to bridge sync topic
    MQTTClient.subscribe("nautilus/bridge/sync");

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="flex items-center justify-between bg-[var(--nautilus-bg)] border border-[var(--nautilus-accent)] rounded-lg p-3"
      aria-live="polite"
      role="status"
    >
      <span className="font-medium">Bridge A11y</span>
      <Badge
        variant={status === "Conectado" ? "success" : "destructive"}
        aria-label={`Status: ${status}`}
      >
        {status}
      </Badge>
    </div>
  );
}
