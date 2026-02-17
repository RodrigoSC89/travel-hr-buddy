/**
 * Voyage Command Center - Quick Stats Bar
 */
import { Card, CardContent } from "@/components/ui/card";
import { Ship, Calendar, Navigation, Fuel, Target, Sparkles } from "lucide-react";

interface VoyageStats {
  active: number;
  planned: number;
  totalDistance: number;
  totalFuel: number;
  onTimeRate: number;
  fuelSaved: number;
}

interface Props {
  stats: VoyageStats;
}

export function VoyageStatsBar({ stats }: Props) {
  const items = [
    { label: "Viagens Ativas", value: stats.active, color: "text-success", icon: Ship, iconColor: "text-success" },
    { label: "Planejadas", value: stats.planned, color: "text-info", icon: Calendar, iconColor: "text-info" },
    { label: "Milhas Total", value: stats.totalDistance.toLocaleString(), icon: Navigation, iconColor: "text-primary" },
    { label: "Combustível", value: `${stats.totalFuel.toLocaleString()}t`, icon: Fuel, iconColor: "text-warning" },
    { label: "Pontualidade", value: `${stats.onTimeRate}%`, color: "text-success", icon: Target, iconColor: "text-success" },
    { label: "Economia IA", value: `${stats.fuelSaved}t`, color: "text-success", icon: Sparkles, iconColor: "text-success" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {items.map(item => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color || ""}`}>{item.value}</p>
              </div>
              <item.icon className={`h-8 w-8 ${item.iconColor} opacity-80`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
