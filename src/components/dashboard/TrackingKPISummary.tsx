/**
 * TrackingKPISummary - Real-time tracking KPI cards
 * Shows vessel positions, active alerts, sensor health
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Ship, AlertTriangle, Activity, Wifi } from "lucide-react";

export function TrackingKPISummary() {
  const { data: vessels = [] } = useQuery({
    queryKey: ["tracking-kpi-vessels"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vessels")
        .select("id, status")
        .order("name");
      return data || [];
    },
    staleTime: 15000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["tracking-kpi-alerts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("telemetry_alerts")
        .select("id, severity, resolved, acknowledged")
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
    staleTime: 15000,
  });

  const { data: sensors = [] } = useQuery({
    queryKey: ["tracking-kpi-sensors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("iot_sensors")
        .select("id, status, sensor_type")
        .limit(200);
      return data || [];
    },
    staleTime: 30000,
  });

  const activeVessels = vessels.filter(v => v.status === "active" || v.status === "operational").length;
  const criticalAlerts = alerts.filter(a => a.severity === "critical" || a.severity === "high").length;
  const onlineSensors = sensors.filter(s => s.status === "active" || s.status === "online").length;
  const sensorHealth = sensors.length > 0 ? Math.round((onlineSensors / sensors.length) * 100) : 0;

  const kpis = [
    {
      label: "Embarcações Rastreadas",
      value: vessels.length,
      subtitle: `${activeVessels} ativas`,
      icon: Ship,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Alertas Ativos",
      value: alerts.length,
      subtitle: `${criticalAlerts} críticos`,
      icon: AlertTriangle,
      color: alerts.length > 0 ? "text-destructive" : "text-success",
      bg: alerts.length > 0 ? "bg-destructive/10" : "bg-success/10",
    },
    {
      label: "Sensores IoT",
      value: sensors.length,
      subtitle: `${onlineSensors} online`,
      icon: Activity,
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      label: "Saúde Sensores",
      value: `${sensorHealth}%`,
      subtitle: sensorHealth >= 90 ? "Excelente" : sensorHealth >= 70 ? "Bom" : "Atenção",
      icon: Wifi,
      color: sensorHealth >= 90 ? "text-success" : sensorHealth >= 70 ? "text-warning" : "text-destructive",
      bg: sensorHealth >= 90 ? "bg-success/10" : sensorHealth >= 70 ? "bg-warning/10" : "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                <p className={`text-xs mt-0.5 ${kpi.color}`}>{kpi.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default TrackingKPISummary;
