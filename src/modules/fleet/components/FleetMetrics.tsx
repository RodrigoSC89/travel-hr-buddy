import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Ship, 
  Users, 
  Wrench, 
  MapPin, 
  Fuel, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  color?: "blue" | "green" | "orange" | "red" | "purple";
  delay?: number;
}

const colorClasses = {
  blue: "from-blue-500/20 to-blue-600/5 text-blue-600",
  green: "from-green-500/20 to-green-600/5 text-green-600",
  orange: "from-orange-500/20 to-orange-600/5 text-orange-600",
  red: "from-red-500/20 to-red-600/5 text-red-600",
  purple: "from-purple-500/20 to-purple-600/5 text-purple-600",
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50 group-hover:opacity-70 transition-opacity",
          colorClasses[color]
        )} />
        
        <CardHeader className="relative flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={cn("p-2 rounded-lg bg-background/80", colorClasses[color].split(" ")[2])}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{value}</span>
            {trend !== undefined && (
              <span className={cn(
                "text-sm font-medium flex items-center gap-1",
                trend >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface FleetMetricsProps {
  vessels: any[];
  maintenance: any[];
  crewAssignments: any[];
}

export const FleetMetrics: React.FC<FleetMetricsProps> = ({
  vessels,
  maintenance,
  crewAssignments
}) => {
  const activeVessels = vessels.filter(v => 
    v.status === "active" || v.status === "operational"
  ).length;
  
  const maintenanceVessels = vessels.filter(v => v.status === "maintenance").length;
  const pendingMaintenance = maintenance.filter(m => m.status === "pending").length;
  const totalCrew = crewAssignments.length || vessels.reduce((acc, v) => acc + (v.crew_count || 0), 0);
  
  const operationalRate = vessels.length > 0 
    ? Math.round((activeVessels / vessels.length) * 100) 
    : 0;

  const avgFuelLevel = vessels.length > 0
    ? Math.round(vessels.reduce((acc, v) => acc + (v.fuel_level || 75), 0) / vessels.length)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <MetricCard
        title="Total de Embarcações"
        value={vessels.length}
        subtitle={`${activeVessels} operacionais`}
        icon={Ship}
        color="blue"
        delay={0}
      />
      
      <MetricCard
        title="Taxa Operacional"
        value={`${operationalRate}%`}
        subtitle={`${maintenanceVessels} em manutenção`}
        icon={Activity}
        trend={operationalRate > 90 ? 5 : -3}
        color="green"
        delay={0.05}
      />
      
      <MetricCard
        title="Tripulação Total"
        value={totalCrew}
        subtitle="Membros atribuídos"
        icon={Users}
        color="purple"
        delay={0.1}
      />
      
      <MetricCard
        title="Manutenções Pendentes"
        value={pendingMaintenance}
        subtitle={pendingMaintenance > 5 ? "Atenção necessária" : "Sob controle"}
        icon={Wrench}
        color={pendingMaintenance > 5 ? "red" : "orange"}
        delay={0.15}
      />
      
      <MetricCard
        title="Combustível Médio"
        value={`${avgFuelLevel}%`}
        subtitle="Nível da frota"
        icon={Fuel}
        trend={avgFuelLevel > 70 ? 2 : -5}
        color={avgFuelLevel > 60 ? "green" : "orange"}
        delay={0.2}
      />
      
      <MetricCard
        title="Posições Rastreadas"
        value={`${activeVessels}/${vessels.length}`}
        subtitle="Rastreamento ativo"
        icon={MapPin}
        color="blue"
        delay={0.25}
      />
    </div>
  );
};
