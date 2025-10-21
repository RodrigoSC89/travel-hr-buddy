/**
 * ControlPanel Component
 * Dynamic alerts system with acknowledgment workflow
 * 
 * Features:
 * - Responsive grid layout (1 col mobile, 2 cols desktop)
 * - Alert cards with title, description, and actions
 * - MQTT event publishing on acknowledgment
 * - Framer Motion animations for smooth transitions
 * - WCAG 2.1 AA compliant
 * 
 * Alerts are published to nautilus/alerts/ack topic when acknowledged,
 * enabling backend tracking and integration with monitoring systems.
 * 
 * @module ControlPanel
 * @version 2.0.0 (Patch 9)
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { publishEvent } from "@/lib/mqtt/publisher";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: number;
}

interface ControlPanelProps {
  className?: string;
}

export default function ControlPanel({ className }: ControlPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch alerts from API
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint
      const response = await fetch("/api/alerts");
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      } else {
        // Mock data for development
        setAlerts([]);
      }
    } catch (error) {
      console.error("❌ Falha ao carregar alertas:", error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = (alertId: string) => {
    // Publish acknowledgment to MQTT
    publishEvent("nautilus/alerts/ack", {
      alertId,
      acknowledgedAt: Date.now(),
      acknowledgedBy: "user", // TODO: Replace with actual user info
    });

    // Remove alert from UI
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const getSeverityBadge = (severity: Alert["severity"]) => {
    const variants: Record<Alert["severity"], { color: string; label: string }> = {
      low: { color: "bg-blue-500", label: "Baixa" },
      medium: { color: "bg-yellow-500", label: "Média" },
      high: { color: "bg-orange-500", label: "Alta" },
      critical: { color: "bg-red-500", label: "Crítica" },
    };

    const { color, label } = variants[severity];

    return (
      <Badge className={color} aria-label={`Severidade: ${label}`}>
        {label}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("pt-BR");
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle role="heading" aria-level={2}>
            🚨 Painel de Controle
          </CardTitle>
          <CardDescription>Alertas e notificações do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            role="status"
            aria-live="polite"
            aria-label="Carregando alertas..."
            className="flex items-center justify-center p-8 text-muted-foreground"
          >
            Carregando alertas...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle role="heading" aria-level={2}>
              🚨 Painel de Controle
            </CardTitle>
            <CardDescription>Alertas e notificações do sistema</CardDescription>
          </div>
          <Badge variant="outline" aria-label={`${alerts.length} alertas ativos`}>
            {alerts.length} {alerts.length === 1 ? "Alerta" : "Alertas"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div
            role="status"
            aria-live="polite"
            className="text-center text-muted-foreground p-8"
          >
            Nenhum alerta ativo no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-l-4 border-l-[var(--nautilus-accent)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base" role="heading" aria-level={3}>
                        {alert.title}
                      </CardTitle>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <CardDescription className="text-xs">
                      {formatTimestamp(alert.timestamp)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {alert.description}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(alert.id)}
                      aria-label={`Reconhecer alerta: ${alert.title}`}
                      className="w-full"
                    >
                      ✅ Reconhecer
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
