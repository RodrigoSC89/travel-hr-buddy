/**
 * PATCH 839: Analytics Dashboard Component
 * Comprehensive analytics visualization
 */

import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Activity,
  Eye,
  MousePointer,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsData } from "@/lib/analytics/advanced-analytics";
import { cn } from "@/lib/utils";

export function AnalyticsDashboard() {
  const { events, metrics, session } = useAnalyticsData();

  // Calculate stats
  const pageViews = events.filter(e => e.name === "page_view").length;
  const interactions = events.filter(e => e.category === "engagement").length;
  const errors = events.filter(e => e.category === "system" && e.name === "error").length;
  const sessionDuration = Math.floor(session.duration / 1000 / 60);

  // Get performance metrics
  const lcp = metrics.find(m => m.name === "LCP")?.value;
  const fcp = metrics.find(m => m.name === "FCP")?.value;
  const cls = metrics.find(m => m.name === "CLS")?.value;
  const fid = metrics.find(m => m.name === "FID")?.value;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Visualizações"
          value={pageViews}
          icon={<Eye className="w-4 h-4" />}
          color="text-primary"
        />
        <MetricCard
          title="Interações"
          value={interactions}
          icon={<MousePointer className="w-4 h-4" />}
          color="text-accent"
        />
        <MetricCard
          title="Tempo de Sessão"
          value={`${sessionDuration}min`}
          icon={<Clock className="w-4 h-4" />}
          color="text-success"
        />
        <MetricCard
          title="Erros"
          value={errors}
          icon={<Activity className="w-4 h-4" />}
          color="text-destructive"
        />
      </div>

      {/* Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4 text-primary" />
            Web Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <VitalCard
              name="LCP"
              value={lcp}
              unit="ms"
              description="Largest Contentful Paint"
              thresholds={{ good: 2500, poor: 4000 }}
            />
            <VitalCard
              name="FCP"
              value={fcp}
              unit="ms"
              description="First Contentful Paint"
              thresholds={{ good: 1800, poor: 3000 }}
            />
            <VitalCard
              name="FID"
              value={fid}
              unit="ms"
              description="First Input Delay"
              thresholds={{ good: 100, poor: 300 }}
            />
            <VitalCard
              name="CLS"
              value={cls}
              unit=""
              description="Cumulative Layout Shift"
              thresholds={{ good: 0.1, poor: 0.25 }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4 text-primary" />
            Eventos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-auto">
            {events.slice(-10).reverse().map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-sm"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  event.category === "navigation" && "bg-primary",
                  event.category === "engagement" && "bg-accent",
                  event.category === "system" && "bg-muted-foreground"
                )} />
                <span className="font-medium text-foreground">{event.name}</span>
                <span className="text-muted-foreground">{event.category}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <span className={color}>{icon}</span>
        <span className="text-xs">{title}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </motion.div>
  );
}

interface VitalCardProps {
  name: string;
  value?: number;
  unit: string;
  description: string;
  thresholds: { good: number; poor: number };
}

function VitalCard({ name, value, unit, description, thresholds }: VitalCardProps) {
  const getStatus = () => {
    if (value === undefined) return "unknown";
    if (value <= thresholds.good) return "good";
    if (value <= thresholds.poor) return "needs-improvement";
    return "poor";
  };

  const status = getStatus();

  const statusColors = {
    good: "bg-success/10 text-success border-success/20",
    "needs-improvement": "bg-warning/10 text-warning border-warning/20",
    poor: "bg-destructive/10 text-destructive border-destructive/20",
    unknown: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border",
      statusColors[status]
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm">{name}</span>
        {status !== "unknown" && (
          <span className="text-xs capitalize">{status.replace("-", " ")}</span>
        )}
      </div>
      <p className="text-lg font-bold">
        {value !== undefined ? `${Math.round(value)}${unit}` : "—"}
      </p>
      <p className="text-xs opacity-70 mt-1">{description}</p>
    </div>
  );
}
