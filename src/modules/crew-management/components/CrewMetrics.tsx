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
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Em Licença",
      value: onLeaveCrew,
      icon: Calendar,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Cert. Vencendo",
      value: expiringCerts,
      icon: AlertTriangle,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
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
          <Card className={`p-4 ${metric.highlight ? "border-rose-500/50 bg-rose-500/5" : ""}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className={`text-3xl font-bold mt-1 ${metric.highlight ? "text-rose-500" : ""}`}>
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
