/**
 * Telemetria Tabs - All tab content for TelemetriaCommand
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Activity, Radio, AlertTriangle, Brain, History,
  RefreshCw, Search, Download, Bell, Settings,
  CheckCircle2, TrendingUp, Wifi
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TelemetryLog, TelemetryAlert, getSensorIcon, getStatusColor, getSeverityBadge } from "./types";
import type { TelemetryInsight } from "@/hooks/useTelemetryAI";

interface TelemetriaTabsProps {
  activeTab: string;
  setActiveTab: (v: string) => void;
  sensors: TelemetryLog[];
  alerts: TelemetryAlert[];
  chartData: Record<string, unknown>[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterType: string;
  setFilterType: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  filteredSensors: TelemetryLog[];
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  runAnalysis: () => void;
  aiLoading: boolean;
  lastAnalysis: { anomalies: number; predictions: number; overallHealth: number; insights: TelemetryInsight[]; timestamp: string } | null;
}

export function TelemetriaTabs({
  activeTab, setActiveTab, sensors, alerts, chartData,
  searchTerm, setSearchTerm, filterType, setFilterType,
  filterStatus, setFilterStatus, filteredSensors,
  acknowledgeAlert, resolveAlert, runAnalysis, aiLoading, lastAnalysis
}: TelemetriaTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="overview" className="flex items-center gap-1">
          <Activity className="h-4 w-4" />
          <span className="hidden md:inline">Visão Geral</span>
        </TabsTrigger>
        <TabsTrigger value="sensors" className="flex items-center gap-1">
          <Radio className="h-4 w-4" />
          <span className="hidden md:inline">Sensores</span>
        </TabsTrigger>
        <TabsTrigger value="alerts" className="flex items-center gap-1 relative">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden md:inline">Alertas</span>
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {alerts.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="ai" className="flex items-center gap-1">
          <Brain className="h-4 w-4" />
          <span className="hidden md:inline">IA Preditiva</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-1">
          <History className="h-4 w-4" />
          <span className="hidden md:inline">Histórico</span>
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Leituras em Tempo Real</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="temperature" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.13} name="Temperatura" />
                    <Area type="monotone" dataKey="pressure" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.13} name="Pressão" />
                    <Area type="monotone" dataKey="fuel_level" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.13} name="Combustível" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Status dos Sensores</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {sensors.slice(0, 10).map(sensor => (
                    <div key={sensor.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(sensor.status)}`} />
                        {getSensorIcon(sensor.sensor_type)}
                        <div>
                          <p className="font-medium text-sm">{sensor.sensor_id}</p>
                          <p className="text-xs text-muted-foreground">{sensor.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{sensor.value} {sensor.unit}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(sensor.timestamp), "HH:mm:ss")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Sensors Tab */}
      <TabsContent value="sensors" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Sensores & Sinais</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar sensor..." className="pl-8 w-48" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="temperature">Temperatura</SelectItem>
                    <SelectItem value="pressure">Pressão</SelectItem>
                    <SelectItem value="fuel_level">Combustível</SelectItem>
                    <SelectItem value="vibration">Vibração</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredSensors.map(sensor => (
                  <div key={sensor.id} className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${sensor.status === "critical" ? "border-destructive bg-destructive/5" : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(sensor.status)}`} />
                      <div className="p-2 rounded-lg bg-muted">{getSensorIcon(sensor.sensor_type)}</div>
                      <div>
                        <p className="font-semibold">{sensor.sensor_id}</p>
                        <p className="text-sm text-muted-foreground">{sensor.location}</p>
                        <p className="text-xs text-muted-foreground capitalize">{sensor.sensor_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{sensor.value}</p>
                      <p className="text-sm text-muted-foreground">{sensor.unit}</p>
                      <Badge variant={sensor.status === "normal" ? "default" : sensor.status === "critical" ? "destructive" : "secondary"}>{sensor.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Alerts Tab */}
      <TabsContent value="alerts" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Alertas Técnicos
              {alerts.length > 0 && <Badge variant="destructive">{alerts.length} ativos</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
                <p>Nenhum alerta ativo no momento</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-lg border ${alert.severity === "critical" ? "border-destructive bg-destructive/5" : alert.severity === "high" ? "border-warning bg-warning/5" : "border-warning/50 bg-warning/5"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getSeverityBadge(alert.severity)}
                            <span className="text-sm text-muted-foreground">{alert.sensor_id}</span>
                            {alert.acknowledged && <Badge variant="outline" className="text-xs">Reconhecido</Badge>}
                          </div>
                          <p className="font-medium">{alert.message}</p>
                          {alert.recommended_action && <p className="text-sm text-muted-foreground mt-1"><strong>Ação:</strong> {alert.recommended_action}</p>}
                          <p className="text-xs text-muted-foreground mt-2">{format(new Date(alert.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                        </div>
                        <div className="flex gap-2">
                          {!alert.acknowledged && <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)}>Reconhecer</Button>}
                          <Button size="sm" onClick={() => resolveAlert(alert.id)}>Resolver</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* AI Tab */}
      <TabsContent value="ai" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> IA Preditiva</CardTitle>
                <CardDescription>Análise inteligente de padrões e previsão de falhas</CardDescription>
              </div>
              <Button onClick={runAnalysis} disabled={aiLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${aiLoading ? "animate-spin" : ""}`} /> Nova Análise
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!lastAnalysis ? (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Clique em "Nova Análise" para executar a IA preditiva</p>
                <Button onClick={runAnalysis} disabled={aiLoading}>Iniciar Análise</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted"><p className="text-3xl font-bold text-destructive">{lastAnalysis.anomalies}</p><p className="text-sm text-muted-foreground">Anomalias</p></div>
                  <div className="text-center p-4 rounded-lg bg-muted"><p className="text-3xl font-bold text-warning">{lastAnalysis.predictions}</p><p className="text-sm text-muted-foreground">Previsões</p></div>
                  <div className="text-center p-4 rounded-lg bg-muted"><p className="text-3xl font-bold text-success">{lastAnalysis.overallHealth}%</p><p className="text-sm text-muted-foreground">Saúde</p></div>
                </div>
                <div className="space-y-3">
                  {lastAnalysis.insights.map(insight => (
                    <div key={insight.id} className={`p-4 rounded-lg border ${insight.severity === "critical" ? "border-destructive bg-destructive/5" : insight.severity === "high" ? "border-warning bg-warning/5" : "bg-muted/50"}`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${insight.type === "anomaly" ? "bg-destructive/20" : insight.type === "prediction" ? "bg-warning/20" : "bg-primary/20"}`}>
                          {insight.type === "anomaly" ? <AlertTriangle className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <Badge variant="outline" className="text-xs">{Math.round(insight.confidence * 100)}% confiança</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                          <div className="mt-2 p-2 rounded bg-muted"><p className="text-sm"><strong>Ação recomendada:</strong> {insight.recommended_action}</p></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">Última análise: {format(new Date(lastAnalysis.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* History Tab */}
      <TabsContent value="history" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> Histórico & Tendências</CardTitle>
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Exportar CSV</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="temperature" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Temperatura" />
                  <Line type="monotone" dataKey="pressure" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Pressão" />
                  <Line type="monotone" dataKey="fuel_level" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Combustível" />
                  <Line type="monotone" dataKey="vibration" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} name="Vibração" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
