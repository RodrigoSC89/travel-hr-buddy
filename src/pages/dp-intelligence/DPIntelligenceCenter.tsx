import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Database, TrendingUp, Compass, AlertTriangle } from "lucide-react";

export default function DPIntelligenceCenter() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">DP Intelligence Center</h1>
        <p className="text-muted-foreground">
          Centro de Inteligência de Posicionamento Dinâmico
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status DP</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operacional</div>
            <p className="text-xs text-muted-foreground">Todos os sistemas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisão</CardTitle>
            <Compass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">±0.5m</div>
            <p className="text-xs text-muted-foreground">Dentro do padrão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Telemetry Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Telemetria de Sistemas
          </CardTitle>
          <CardDescription>Monitoramento ativo de sistemas de posicionamento</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Thrusters Ativos</p>
              <p className="text-2xl font-bold">8/8</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Sensores Online</p>
              <p className="text-2xl font-bold">12/12</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button>Gerar Relatório</Button>
            <Button variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Sincronizar Dados DP
            </Button>
            <Button variant="outline">Histórico</Button>
          </div>
        </CardContent>
      </Card>

      {/* System Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Sistemas</CardTitle>
          <CardDescription>
            Monitoramento em tempo real e análise preditiva
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span className="text-sm font-medium">Sistema de Redundância</span>
              <span className="text-green-600 font-bold">Ativo</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span className="text-sm font-medium">Auto-Calibração</span>
              <span className="text-green-600 font-bold">Ativo</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span className="text-sm font-medium">Monitoramento Ambiental</span>
              <span className="text-green-600 font-bold">Online</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
