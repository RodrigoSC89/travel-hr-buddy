import { Card } from "@/components/ui/card";
import { Users, CheckCircle, Calendar, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface CrewMetricsProps {
  totalCrew: number;
  activeCrew: number;
  onLeaveCrew: number;
  expiringCerts: number;
}

export function CrewMetrics({ totalCrew, activeCrew, onLeaveCrew, expiringCerts }: CrewMetricsProps) {
  const metrics = [
    {
      label: "Total de Tripulantes",
      value: totalCrew,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Ativos",
      value: activeCrew,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Em Licença",
      value: onLeaveCrew,
      icon: Calendar,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Cert. Vencendo",
      value: expiringCerts,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      highlight: expiringCerts > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`p-4 ${metric.highlight ? 'border-destructive/50 bg-destructive/5' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className={`text-3xl font-bold mt-1 ${metric.highlight ? 'text-destructive' : ''}`}>
                  {metric.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
