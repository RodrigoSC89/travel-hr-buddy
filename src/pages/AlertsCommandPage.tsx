/**
 * Alerts Command Page - Central de Alertas
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle2, Clock, Filter, X } from "lucide-react";

const alerts = [
  { id: 1, title: "Manutenção preventiva pendente", severity: "high", source: "Fleet", time: "10 min", status: "active" },
  { id: 2, title: "Certificado expirando em 7 dias", severity: "medium", source: "Compliance", time: "1h", status: "active" },
  { id: 3, title: "Tripulante com documentação incompleta", severity: "medium", source: "Crew", time: "2h", status: "active" },
  { id: 4, title: "Consumo de combustível acima do normal", severity: "low", source: "Operations", time: "3h", status: "resolved" },
];

export default function AlertsCommandPage() {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredAlerts = filter 
    ? alerts.filter(a => a.severity === filter)
    : alerts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Central de Alertas</h2>
            <p className="text-muted-foreground">Gerencie todos os alertas do sistema</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFilter(null)}>
            Todos
          </Button>
          <Button 
            variant={filter === "high" ? "destructive" : "outline"} 
            size="sm" 
            onClick={() => setFilter("high")}
          >
            Alta
          </Button>
          <Button 
            variant={filter === "medium" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("medium")}
          >
            Média
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alertas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-red-500">
              {alerts.filter(a => a.status === "active").length}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alta Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-orange-500">
              {alerts.filter(a => a.severity === "high").length}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resolvidos Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">
              {alerts.filter(a => a.status === "resolved").length}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">2.5h</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-4">
                  <AlertTriangle className={`h-5 w-5 ${
                    alert.severity === "high" ? "text-red-500" : 
                    alert.severity === "medium" ? "text-yellow-500" : "text-blue-500"
                  }`} />
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{alert.source}</Badge>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.status === "resolved" ? (
                    <Badge className="bg-green-100 text-green-800">Resolvido</Badge>
                  ) : (
                    <>
                      <Button size="sm" variant="outline">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Resolver
                      </Button>
                      <Button size="sm" variant="ghost">
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
