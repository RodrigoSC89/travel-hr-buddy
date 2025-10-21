import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Activity } from "lucide-react";
import { publishEvent } from "@/lib/mqtt/publisher";
import type { Alert } from "@/types/controlhub";

/**
 * ControlPanel - Alerts Dashboard
 * 
 * Displays active system alerts with acknowledgment workflow.
 * Publishes acknowledgment events to MQTT broker when alerts are acknowledged.
 * 
 * Features:
 * - Responsive grid layout (1 column on mobile, 2 columns on desktop)
 * - Alert cards with title, description, and actions
 * - MQTT event publishing on acknowledgment
 * - Framer Motion animations for smooth transitions
 * - Empty state when no alerts are available
 * 
 * WCAG 2.1 AA Compliant:
 * - Proper heading hierarchy
 * - ARIA labels on interactive elements
 * - Keyboard accessible
 * - Color contrast meets AA standards
 * - Icons marked as decorative with aria-hidden
 */
export default function ControlPanel() {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/alerts");
        if (res.ok) {
          const data = await res.json();
          setActiveAlerts(data);
        } else {
          console.warn("Failed to fetch alerts, using empty array");
          setActiveAlerts([]);
        }
      } catch (error) {
        console.error("Error fetching alerts:", error);
        setActiveAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleAcknowledge = (alert: Alert) => {
    // Publish acknowledgment to MQTT
    publishEvent("nautilus/alerts/ack", { 
      id: alert.id,
      timestamp: new Date().toISOString()
    });

    // Remove alert from local state
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alert.id));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 text-gray-400 py-8">
          <Activity className="animate-spin" aria-hidden="true" />
          <span>Carregando alertas...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <section aria-labelledby="control-panel-heading">
      <h2 
        id="control-panel-heading"
        className="text-2xl font-bold mb-4"
        role="heading"
        aria-level={2}
      >
        Painel de Controle
      </h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {activeAlerts.length > 0 ? (
          activeAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className="border-l-4 border-[var(--nautilus-primary)] shadow-lg"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle 
                    className="text-[var(--nautilus-error)]" 
                    aria-hidden="true" 
                  />
                  <span>{alert.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{alert.message || alert.severity}</p>
                <Button
                  variant="outline"
                  aria-label={`Reconhecer alerta ${alert.title}`}
                  onClick={() => handleAcknowledge(alert)}
                >
                  Reconhecer
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2">
            <CardContent className="flex items-center justify-center gap-2 text-gray-400 py-8">
              <Activity aria-hidden="true" />
              <span>Nenhum alerta ativo.</span>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </section>
  );
}
