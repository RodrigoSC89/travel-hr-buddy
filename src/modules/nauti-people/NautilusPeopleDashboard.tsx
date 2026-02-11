/**
 * Nautilus People Dashboard
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, TrendingUp, Award, Clock } from "lucide-react";

const stats = [
  { label: "Total Tripulantes", value: 245, icon: Users, trend: "+12" },
  { label: "Ativos", value: 198, icon: UserCheck, trend: "+5" },
  { label: "Em Licença", value: 32, icon: Clock, trend: "-3" },
  { label: "Certificados OK", value: "94%", icon: Award, trend: "+2%" },
];

export default function NautilusPeopleDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Nautilus People</h2>
          <p className="text-muted-foreground">Visão geral da tripulação</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{stat.value}</span>
                <Badge variant="outline" className="text-success">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Função</CardTitle>
          <CardDescription>Tripulantes por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { role: "Oficiais de Convés", count: 45, percentage: 18 },
              { role: "Oficiais de Máquinas", count: 38, percentage: 15 },
              { role: "Marinheiros", count: 72, percentage: 29 },
              { role: "Praticantes", count: 28, percentage: 11 },
              { role: "Outros", count: 62, percentage: 25 },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.role}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
