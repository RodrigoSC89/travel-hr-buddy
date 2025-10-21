import React, { useEffect, useState } from "react";
import { initSecureMQTT } from "@/lib/mqtt/secure-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

type ConnectionStatus = "Conectado" | "Desconectado" | "Conectando..." | "Não Configurado";

/**
 * BridgeA11y - MQTT Connection Status Monitor
 * 
 * Displays real-time MQTT connection status for Bridge synchronization
 * between DP consoles and remote displays.
 * 
 * Status Indicators:
 * - 🟢 Conectado: Active MQTT connection
 * - 🔴 Desconectado: No connection
 * - 🟡 Conectando...: Connection in progress
 * - ⚪ Não Configurado: MQTT URL not configured
 * 
 * WCAG 2.1 AA Compliant:
 * - Proper ARIA labels for screen readers
 * - Live region for status updates
 * - Semantic HTML structure
 * - Color contrast meets AA standards
 */
export default function BridgeA11y() {
  const [status, setStatus] = useState<ConnectionStatus>("Desconectado");

  useEffect(() => {
    // Check if MQTT is configured
    const mqttUrl = import.meta.env.VITE_MQTT_URL;
    if (!mqttUrl) {
      setStatus("Não Configurado");
      return;
    }

    setStatus("Conectando...");

    const client = initSecureMQTT();

    // Handle connection events
    const handleConnect = () => {
      setStatus("Conectado");
    };

    const handleOffline = () => {
      setStatus("Desconectado");
    };

    const handleError = () => {
      setStatus("Desconectado");
    };

    client.on("connect", handleConnect);
    client.on("offline", handleOffline);
    client.on("error", handleError);

    // Subscribe to bridge sync topic
    client.subscribe("nautilus/bridge/sync", (error) => {
      if (error) {
        console.error("❌ Failed to subscribe to nautilus/bridge/sync:", error);
      } else {
        console.log("✅ Subscribed to nautilus/bridge/sync");
      }
    });

    // Handle incoming sync messages
    client.on("message", (topic, message) => {
      if (topic === "nautilus/bridge/sync") {
        console.log("📡 Sync recebido:", message.toString());
      }
    });

    return () => {
      client.off("connect", handleConnect);
      client.off("offline", handleOffline);
      client.off("error", handleError);
    };
  }, []);

  const getStatusVariant = (): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
    case "Conectado":
      return "default";
    case "Desconectado":
      return "destructive";
    case "Conectando...":
      return "secondary";
    default:
      return "outline";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
    case "Conectado":
      return "🟢";
    case "Desconectado":
      return "🔴";
    case "Conectando...":
      return "🟡";
    default:
      return "⚪";
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div 
          className="flex items-center justify-between"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--nautilus-primary)]" aria-hidden="true" />
            <h2 
              className="text-lg font-semibold"
              role="heading"
              aria-level={2}
            >
              Bridge A11y
            </h2>
          </div>
          <Badge
            variant={getStatusVariant()}
            aria-label={`Status: ${status}`}
            className="flex items-center gap-1"
          >
            <span aria-hidden="true">{getStatusIcon()}</span>
            <span>{status}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
