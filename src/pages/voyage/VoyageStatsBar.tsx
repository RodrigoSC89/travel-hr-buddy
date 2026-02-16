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
    { label: "Viagens Ativas", value: stats.active, color: "text-green-600", icon: Ship, iconColor: "text-green-500" },
    { label: "Planejadas", value: stats.planned, color: "text-blue-600", icon: Calendar, iconColor: "text-blue-500" },
    { label: "Milhas Total", value: stats.totalDistance.toLocaleString(), icon: Navigation, iconColor: "text-primary" },
    { label: "Combustível", value: `${stats.totalFuel.toLocaleString()}t`, icon: Fuel, iconColor: "text-amber-500" },
    { label: "Pontualidade", value: `${stats.onTimeRate}%`, color: "text-green-600", icon: Target, iconColor: "text-green-500" },
    { label: "Economia IA", value: `${stats.fuelSaved}t`, color: "text-emerald-600", icon: Sparkles, iconColor: "text-emerald-500" },
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
