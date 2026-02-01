/**
 * HR Dashboard - Dashboard de RH
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Award, Calendar, Clock, BarChart3 } from "lucide-react";

export default function HRDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Dashboard de RH</h2>
          <p className="text-muted-foreground">Gestão de recursos humanos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Colaboradores</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">245</span>
            <Badge variant="outline" className="ml-2 text-green-600">+12</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Treinamentos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">18</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avaliações Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-yellow-500">7</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Satisfação</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">4.5</span>
            <span className="text-muted-foreground">/5</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Treinamento STCW", date: "05/02/2026", type: "training" },
                { title: "Avaliação de Desempenho", date: "10/02/2026", type: "evaluation" },
                { title: "Reunião de Equipe", date: "12/02/2026", type: "meeting" },
              ].map((event, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{event.date}</span>
                    </div>
                  </div>
                  <Badge variant="outline">{event.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { cert: "STCW", valid: 180, total: 198 },
                { cert: "Primeiros Socorros", valid: 165, total: 198 },
                { cert: "Segurança", valid: 192, total: 198 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.cert}</span>
                    <span className="text-sm text-muted-foreground">{item.valid}/{item.total}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(item.valid / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
