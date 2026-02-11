/**
 * People Analytics - Analytics de Pessoas
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Award, Target, Activity } from "lucide-react";

export default function PeopleAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">People Analytics</h2>
          <p className="text-muted-foreground">Análise de dados de recursos humanos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Retenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-success">94%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Metas Atingidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">87%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4" />
              NPS Interno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-success">+72</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">4.2</span>
            <span className="text-muted-foreground">/5</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendências de Turnover</CardTitle>
            <CardDescription>Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Gráfico de tendências
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Senioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { level: "Junior", count: 45, percentage: 20 },
                { level: "Pleno", count: 98, percentage: 44 },
                { level: "Senior", count: 58, percentage: 26 },
                { level: "Especialista", count: 22, percentage: 10 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.level}</span>
                    <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
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
    </div>
  );
}
