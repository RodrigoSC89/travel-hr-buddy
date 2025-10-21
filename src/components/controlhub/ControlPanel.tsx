/**
 * ControlPanel Component
 * Main control panel for ControlHub displaying alerts and system status
 */

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Activity } from "lucide-react";
import { publishEvent } from "@/lib/mqtt/publisher";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity?: string;
  timestamp?: string;
}

export default function ControlPanel() {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Try to fetch from API - in production this would be a real endpoint
        // For now, simulate with mock data
        const mockAlerts: Alert[] = [];
        setActiveAlerts(mockAlerts);
      } catch (error) {
        console.error("Erro ao carregar alertas:", error);
        setActiveAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
  }, []);

  const handleAcknowledge = (alertId: string) => {
    publishEvent("nautilus/alerts/ack", { id: alertId });
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {activeAlerts.map((alert) => (
        <Card key={alert.id} className="border-l-4 border-[var(--nautilus-primary)] shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-[var(--nautilus-error)]" aria-hidden="true" />
              {alert.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{alert.description}</p>
            <Button
              variant="outline"
              className="mt-2"
              aria-label={`Reconhecer alerta ${alert.title}`}
              onClick={() => handleAcknowledge(alert.id)}
            >
              Reconhecer
            </Button>
          </CardContent>
        </Card>
      ))}
      {activeAlerts.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center gap-2 text-gray-400 p-8">
            <Activity aria-hidden="true" /> 
            <span>Nenhum alerta ativo.</span>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
