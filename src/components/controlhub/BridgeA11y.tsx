/**
 * BridgeA11y Component
 * Real-time MQTT connection status monitoring for display synchronization
 * 
 * Features:
 * - Connects to MQTT broker automatically
 * - Shows connection status: Conectado/Desconectado/Conectando/Não Configurado
 * - Subscribes to nautilus/bridge/sync for display coordination
 * - Full ARIA support for screen readers
 * - WCAG 2.1 AA compliant
 * 
 * Status Indicators:
 * 🟢 Conectado - Active MQTT connection
 * 🔴 Desconectado - No connection
 * 🟡 Conectando... - Connection in progress
 * ⚪ Não Configurado - MQTT URL not configured
 * 
 * @module BridgeA11y
 * @version 2.0.0 (Patch 9)
 */

import React, { useState, useEffect } from "react";
import mqtt, { MqttClient } from "mqtt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ConnectionStatus = "connected" | "disconnected" | "connecting" | "not-configured";

interface BridgeA11yProps {
  className?: string;
}

export default function BridgeA11y({ className }: BridgeA11yProps) {
  const [status, setStatus] = useState<ConnectionStatus>("not-configured");
  const [client, setClient] = useState<MqttClient | null>(null);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const mqttUrl = import.meta.env.VITE_MQTT_URL;

    if (!mqttUrl) {
      setStatus("not-configured");
      return;
    }

    setStatus("connecting");

    const mqttClient = mqtt.connect(mqttUrl);

    mqttClient.on("connect", () => {
      console.log("✅ MQTT Bridge A11y conectado");
      setStatus("connected");
      
      // Subscribe to bridge sync topic
      mqttClient.subscribe("nautilus/bridge/sync", (err) => {
        if (err) {
          console.error("❌ Falha ao assinar nautilus/bridge/sync:", err);
        } else {
          console.log("✅ Assinado em nautilus/bridge/sync");
        }
      });
    });

    mqttClient.on("message", (topic, message) => {
      if (topic === "nautilus/bridge/sync") {
        try {
          const data = JSON.parse(message.toString());
          setLastMessage(JSON.stringify(data));
          console.log("📥 Mensagem bridge sync recebida:", data);
        } catch (err) {
          console.error("❌ Falha ao processar mensagem MQTT:", err);
        }
      }
    });

    mqttClient.on("error", (err) => {
      console.error("❌ Erro de conexão MQTT:", err);
      setStatus("disconnected");
    });

    mqttClient.on("close", () => {
      console.log("🔌 Conexão MQTT fechada");
      setStatus("disconnected");
    });

    mqttClient.on("reconnect", () => {
      console.log("🔄 Reconectando MQTT...");
      setStatus("connecting");
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  const getStatusBadge = () => {
    switch (status) {
    case "connected":
      return (
        <Badge className="bg-green-500" aria-label="Status: Conectado">
            🟢 Conectado
        </Badge>
      );
    case "disconnected":
      return (
        <Badge variant="destructive" aria-label="Status: Desconectado">
            🔴 Desconectado
        </Badge>
      );
    case "connecting":
      return (
        <Badge variant="secondary" aria-label="Status: Conectando">
            🟡 Conectando...
        </Badge>
      );
    case "not-configured":
      return (
        <Badge variant="outline" aria-label="Status: Não Configurado">
            ⚪ Não Configurado
        </Badge>
      );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle role="heading" aria-level={2}>
              🌉 Bridge A11y
            </CardTitle>
            <CardDescription>
              Sincronização de displays via MQTT
            </CardDescription>
          </div>
          <div role="status" aria-live="polite">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Tópico MQTT:
            </p>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              nautilus/bridge/sync
            </code>
          </div>
          
          {lastMessage && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Última mensagem:
              </p>
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                {lastMessage}
              </pre>
            </div>
          )}
          
          {status === "not-configured" && (
            <div
              role="alert"
              className="text-sm text-muted-foreground p-3 bg-muted rounded"
            >
              Configure VITE_MQTT_URL no arquivo .env para habilitar a
              sincronização de displays.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
