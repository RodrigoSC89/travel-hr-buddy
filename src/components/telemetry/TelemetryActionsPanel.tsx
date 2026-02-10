/**
 * Telemetry Actions Panel
 * Interactive telemetry with replay, comments, alerts and export
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Play, Pause, RotateCcw, FastForward, Rewind, 
  Download, Bell, BellOff, MessageSquare, Send,
  AlertTriangle, CheckCircle, Clock, Activity, 
  Thermometer, Gauge, Droplets, Wind, Anchor,
  RefreshCw, Settings, Eye, Filter, Calendar, 
  TrendingUp, TrendingDown, Zap, Radio
} from "lucide-react";
import { format, subHours, addMinutes } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface TelemetryReading {
  timestamp: string;
  temperature: number;
  pressure: number;
  rpm: number;
  fuelFlow: number;
  vibration: number;
  humidity: number;
}

interface TelemetryAlert {
  id: string;
  type: "critical" | "warning" | "info";
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  acknowledged: boolean;
}

interface TelemetryComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  metric?: string;
}

// Generate mock telemetry data
function generateTelemetryData(hours: number = 24): TelemetryReading[] {
  const data: TelemetryReading[] = [];
  const now = new Date();
  
  for (let i = hours * 60; i >= 0; i -= 5) {
    const timestamp = subHours(now, i / 60);
    data.push({
      timestamp: timestamp.toISOString(),
      temperature: 65 + Math.sin(i / 30) * 10 + Math.sin(i / 7) * 3,
      pressure: 2.5 + Math.sin(i / 25) * 0.25,
      rpm: 1200 + Math.sin(i / 20) * 100 + Math.sin(i / 8) * 30,
      fuelFlow: 45 + Math.sin(i / 15) * 7,
      vibration: 0.5 + Math.sin(i / 12) * 0.15,
      humidity: 55 + Math.sin(i / 18) * 10
    });
  }
  return data;
}

export function TelemetryActionsPanel() {
  const { toast } = useToast();
  
  // Data state
  const [telemetryData, setTelemetryData] = useState<TelemetryReading[]>([]);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const [comments, setComments] = useState<TelemetryComment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Replay state
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1);
  
  // Filters
  const [selectedMetric, setSelectedMetric] = useState<string>("temperature");
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [showAlerts, setShowAlerts] = useState(true);
  
  // Dialogs
  const [isAlertConfigOpen, setIsAlertConfigOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  
  // Alert thresholds
  const [thresholds, setThresholds] = useState({
    temperature: { warning: 80, critical: 90 },
    pressure: { warning: 2.8, critical: 3.0 },
    rpm: { warning: 1350, critical: 1450 },
    vibration: { warning: 0.7, critical: 0.9 }
  });

  const metrics = [
    { key: "temperature", label: "Temperatura", unit: "°C", icon: <Thermometer className="h-4 w-4" /> },
    { key: "pressure", label: "Pressão", unit: "bar", icon: <Gauge className="h-4 w-4" /> },
    { key: "rpm", label: "RPM", unit: "rpm", icon: <Activity className="h-4 w-4" /> },
    { key: "fuelFlow", label: "Fluxo Combustível", unit: "L/h", icon: <Droplets className="h-4 w-4" /> },
    { key: "vibration", label: "Vibração", unit: "mm/s", icon: <Radio className="h-4 w-4" /> },
    { key: "humidity", label: "Umidade", unit: "%", icon: <Wind className="h-4 w-4" /> }
  ];

  // Load data
  useEffect(() => {
    setLoading(true);
    const data = generateTelemetryData(24);
    setTelemetryData(data);
    
    // Fallback alerts for telemetry monitoring
    const fallbackAlerts: TelemetryAlert[] = [
      {
        id: "1",
        type: "warning",
        metric: "temperature",
        message: "Temperatura acima do normal",
        value: 82,
        threshold: 80,
        timestamp: new Date().toISOString(),
        acknowledged: false
      },
      {
        id: "2",
        type: "critical",
        metric: "vibration",
        message: "Vibração crítica detectada",
        value: 0.92,
        threshold: 0.9,
        timestamp: subHours(new Date(), 2).toISOString(),
        acknowledged: true
      }
    ];
    setAlerts(fallbackAlerts);
    setLoading(false);
  }, [timeRange]);

  // Replay logic
  useEffect(() => {
    if (!isReplaying) return;
    
    const interval = setInterval(() => {
      setReplayIndex(prev => {
        if (prev >= telemetryData.length - 1) {
          setIsReplaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / replaySpeed);

    return () => clearInterval(interval);
  }, [isReplaying, replaySpeed, telemetryData.length]);

  const startReplay = () => {
    setReplayIndex(0);
    setIsReplaying(true);
    toast({ title: "Replay iniciado" });
  };

  const pauseReplay = () => {
    setIsReplaying(false);
  };

  const resetReplay = () => {
    setReplayIndex(0);
    setIsReplaying(false);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
    toast({ title: "Alerta reconhecido" });
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment: TelemetryComment = {
      id: Date.now().toString(),
      author: "Operador",
      content: newComment,
      timestamp: new Date().toISOString(),
      metric: selectedMetric
    };
    setComments([comment, ...comments]);
    setNewComment("");
    toast({ title: "Comentário adicionado" });
  };

  const exportData = () => {
    const csv = [
      ["Timestamp", ...metrics.map(m => m.label)].join(","),
      ...telemetryData.map(d => [
        d.timestamp,
        d.temperature.toFixed(1),
        d.pressure.toFixed(2),
        d.rpm.toFixed(0),
        d.fuelFlow.toFixed(1),
        d.vibration.toFixed(2),
        d.humidity.toFixed(1)
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telemetry-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;
    a.click();
    toast({ title: "Dados exportados" });
  };

  const currentData = isReplaying ? telemetryData.slice(0, replayIndex + 1) : telemetryData;
  const latestReading = currentData[currentData.length - 1];

  const getMetricStatus = (metric: string, value: number) => {
    const t = thresholds[metric as keyof typeof thresholds];
    if (!t) return "normal";
    if (value >= t.critical) return "critical";
    if (value >= t.warning) return "warning";
    return "normal";
  };

  const chartData = currentData.map(d => ({
    time: format(new Date(d.timestamp), "HH:mm"),
    value: d[selectedMetric as keyof TelemetryReading] as number
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Telemetria em Tempo Real
          </h2>
          <p className="text-muted-foreground">
            Monitoramento com replay, alertas e anotações
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hora</SelectItem>
              <SelectItem value="6h">6 horas</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setIsAlertConfigOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Alertas
          </Button>
          <Button variant="outline" onClick={() => setIsCommentsOpen(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Notas ({comments.length})
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Current Values Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map(metric => {
          const value = latestReading?.[metric.key as keyof TelemetryReading] as number || 0;
          const status = getMetricStatus(metric.key, value);
          
          return (
            <Card 
              key={metric.key}
              className={`cursor-pointer transition-all ${
                selectedMetric === metric.key ? "ring-2 ring-primary" : ""
              } ${status === "critical" ? "border-red-500" : status === "warning" ? "border-yellow-500" : ""}`}
              onClick={() => setSelectedMetric(metric.key)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {metric.icon}
                    {metric.label}
                  </div>
                  {status === "critical" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  {status === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                </div>
                <p className="text-2xl font-bold">
                  {value.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {metric.unit}
                  </span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {metrics.find(m => m.key === selectedMetric)?.label}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={showAlerts}
                onCheckedChange={setShowAlerts}
              />
              <Label className="text-sm">Mostrar alertas</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
                {showAlerts && thresholds[selectedMetric as keyof typeof thresholds] && (
                  <>
                    <ReferenceLine 
                      y={thresholds[selectedMetric as keyof typeof thresholds].warning} 
                      stroke="#eab308" 
                      strokeDasharray="5 5" 
                      label="Alerta"
                    />
                    <ReferenceLine 
                      y={thresholds[selectedMetric as keyof typeof thresholds].critical} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5" 
                      label="Crítico"
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Replay Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={resetReplay}
                disabled={replayIndex === 0 && !isReplaying}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setReplayIndex(Math.max(0, replayIndex - 10))}
              >
                <Rewind className="h-4 w-4" />
              </Button>
              <Button 
                size="icon"
                onClick={isReplaying ? pauseReplay : startReplay}
              >
                {isReplaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setReplayIndex(Math.min(telemetryData.length - 1, replayIndex + 10))}
              >
                <FastForward className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <Slider
                value={[replayIndex]}
                max={telemetryData.length - 1}
                step={1}
                onValueChange={([val]) => setReplayIndex(val)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Velocidade:</span>
              <Select value={replaySpeed.toString()} onValueChange={v => setReplaySpeed(Number(v))}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                  <SelectItem value="5">5x</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {telemetryData[replayIndex] && format(new Date(telemetryData[replayIndex].timestamp), "dd/MM HH:mm:ss")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Panel */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              Alertas Ativos ({alerts.filter(a => !a.acknowledged).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.filter(a => !a.acknowledged).map(alert => (
                <div 
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    alert.type === "critical" ? "bg-red-500/10" : "bg-yellow-500/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-5 w-5 ${
                      alert.type === "critical" ? "text-red-500" : "text-yellow-500"
                    }`} />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        Valor: {alert.value.toFixed(2)} (limite: {alert.threshold})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(alert.timestamp), "HH:mm")}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Reconhecer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Configuration Dialog */}
      <Dialog open={isAlertConfigOpen} onOpenChange={setIsAlertConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuração de Alertas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(thresholds).map(([key, values]) => (
              <div key={key} className="space-y-2">
                <Label className="capitalize">{key}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Alerta</Label>
                    <Input
                      type="number"
                      value={values.warning}
                      onChange={(e) => setThresholds(prev => ({
                        ...prev,
                        [key]: { ...prev[key as keyof typeof prev], warning: Number(e.target.value) }
                      }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Crítico</Label>
                    <Input
                      type="number"
                      value={values.critical}
                      onChange={(e) => setThresholds(prev => ({
                        ...prev,
                        [key]: { ...prev[key as keyof typeof prev], critical: Number(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setIsAlertConfigOpen(false);
              toast({ title: "Configurações salvas" });
            }}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anotações de Telemetria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicionar anotação..."
                onKeyDown={(e) => e.key === "Enter" && addComment()}
              />
              <Button onClick={addComment}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[300px]">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma anotação
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map(comment => (
                    <div key={comment.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.timestamp), "dd/MM HH:mm")}
                        </span>
                      </div>
                      {comment.metric && (
                        <Badge variant="outline" className="text-xs mb-1">
                          {metrics.find(m => m.key === comment.metric)?.label}
                        </Badge>
                      )}
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TelemetryActionsPanel;
