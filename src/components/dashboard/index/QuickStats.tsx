import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Activity } from "lucide-react";

interface QuickStatsProps {
  uptimeValue?: string;
  crewValue?: string;
  missionsValue?: string;
}

export const QuickStats = React.memo<QuickStatsProps>(({
  uptimeValue = "96.8%",
  crewValue = "347",
  missionsValue = "12",
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-success/20 bg-success/5">
        <CardContent className="pt-6 text-center">
          <div className="inline-flex p-4 rounded-full bg-success/10 mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <p className="text-4xl font-bold font-playfair text-success mb-2">{uptimeValue}</p>
          <p className="text-sm text-muted-foreground">Uptime Geral da Frota</p>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-center">
          <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <p className="text-4xl font-bold font-playfair text-primary mb-2">{crewValue}</p>
          <p className="text-sm text-muted-foreground">Tripulantes Ativos</p>
        </CardContent>
      </Card>

      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="pt-6 text-center">
          <div className="inline-flex p-4 rounded-full bg-accent/10 mb-4">
            <Activity className="h-8 w-8 text-accent-foreground" />
          </div>
          <p className="text-4xl font-bold font-playfair text-accent-foreground mb-2">{missionsValue}</p>
          <p className="text-sm text-muted-foreground">Missões em Andamento</p>
        </CardContent>
      </Card>
    </div>
  );
});

QuickStats.displayName = "QuickStats";
