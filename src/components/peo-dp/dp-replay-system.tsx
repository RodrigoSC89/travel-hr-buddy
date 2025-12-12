import { useState } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Download,
  Calendar,
  Clock,
  AlertTriangle,
  Activity,
  Anchor,
  Navigation,
  Gauge,
  Zap,
  Eye,
  Flag,
  Target,
  Ship,
  Wind,
  Waves,
  RotateCcw
} from "lucide-react";

interface ReplayEvent {
  id: string;
  timestamp: number;
  type: "mode_change" | "alarm" | "sensor" | "position" | "thruster" | "environmental";
  description: string;
  severity: "info" | "warning" | "critical";
  data?: Record<string, any>;
}

interface ReplaySession {
  id: string;
  vesselName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  operation: string;
  events: ReplayEvent[];
  anomaliesDetected: number;
}

const mockSessions: ReplaySession[] = [
  {
    id: "REPLAY-001",
    vesselName: "MV Atlantic Explorer",
    date: "2024-12-03",
    startTime: "08:00:00",
    endTime: "16:00:00",
    duration: 28800,
    operation: "Offloading Operation - FPSO Santos",
    events: [
      { id: "E001", timestamp: 0, type: "mode_change", description: "Sistema DP ativado - Auto DP", severity: "info" },
      { id: "E002", timestamp: 1800, type: "position", description: "Aproximação iniciada - 500m da FPSO", severity: "info" },
      { id: "E003", timestamp: 3600, type: "thruster", description: "Thruster #2 carga aumentada para 75%", severity: "info" },
      { id: "E004", timestamp: 5400, type: "environmental", description: "Corrente aumentou para 1.2 kn", severity: "warning" },
      { id: "E005", timestamp: 7200, type: "alarm", description: "Alarme: Aproximando limite ASOG de corrente", severity: "warning" },
      { id: "E006", timestamp: 9000, type: "sensor", description: "Perda temporária MRU#1 - Fallback ativo", severity: "critical" },
      { id: "E007", timestamp: 9045, type: "sensor", description: "MRU#1 restaurado", severity: "info" },
      { id: "E008", timestamp: 14400, type: "mode_change", description: "Mudança para TAM - operação crítica", severity: "warning" },
      { id: "E009", timestamp: 21600, type: "mode_change", description: "Retorno para Auto DP", severity: "info" },
      { id: "E010", timestamp: 28800, type: "mode_change", description: "Operação finalizada - DP desativado", severity: "info" }
    ],
    anomaliesDetected: 3
  },
  {
    id: "REPLAY-002",
    vesselName: "OSV Petrobras XXI",
    date: "2024-12-01",
    startTime: "06:00:00",
    endTime: "18:00:00",
    duration: 43200,
    operation: "ROV Support - Inspeção Submarina",
    events: [],
    anomaliesDetected: 1
  }
];

export const DPReplaySystem: React.FC = () => {
  const [sessions] = useState<ReplaySession[]>(mockSessions);
  const [selectedSession, setSelectedSession] = useState<ReplaySession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getCurrentEvents = () => {
    if (!selectedSession) return [];
    return selectedSession.events.filter(e => e.timestamp <= currentTime);
  };

  const getEventAtTime = () => {
    if (!selectedSession) return null;
    const events = selectedSession.events.filter(e => e.timestamp <= currentTime);
    return events[events.length - 1];
  };

  const handlePlay = () => {
    if (!selectedSession) {
      toast.error("Selecione uma sessão para replay");
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkipToEvent = (eventTimestamp: number) => {
    setCurrentTime(eventTimestamp);
  };

  const handleExport = () => {
    toast.success("Exportando replay para análise...");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical": return "text-red-500 bg-red-500/10";
    case "warning": return "text-yellow-500 bg-yellow-500/10";
    default: return "text-blue-500 bg-blue-500/10";
    }
  };

  // Simulated vessel state based on current time
  const getVesselState = () => {
    const baseHeading = 180;
    const baseLat = -22.9068;
    const baseLon = -43.1729;
    const variation = Math.sin(currentTime / 1000) * 0.5;
    
    return {
      heading: baseHeading + variation * 2,
      position: { lat: baseLat + variation * 0.0001, lon: baseLon + variation * 0.0001 },
      thrusterLoad: [65 + variation * 10, 70 + variation * 5, 55 + variation * 8, 60 + variation * 12],
      windSpeed: 15 + variation * 3,
      windDir: 190 + variation * 10,
      waveHeight: 1.5 + variation * 0.3,
      current: 0.8 + Math.abs(variation) * 0.4,
      dpMode: currentTime > 14400 && currentTime < 21600 ? "TAM" : "Auto DP"
    };
  };

  const vesselState = getVesselState();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <RotateCcw className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Replay Operacional DP</h2>
            <p className="text-muted-foreground">Análise forense de operações com detecção de anomalias</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />Exportar Análise
          </Button>
        </div>
      </div>

      {/* Session Selector */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <Select value={selectedSession?.id || ""} onValueChange={(id) => setSelectedSession(sessions.find(s => s.id === id) || null)}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Selecionar sessão para replay..." />
              </SelectTrigger>
              <SelectContent>
                {sessions.map(session => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.vesselName} - {session.date} ({session.operation.substring(0, 30)}...)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSession && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{selectedSession.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{selectedSession.startTime} - {selectedSession.endTime}</span>
                <Badge variant={selectedSession.anomaliesDetected > 0 ? "destructive" : "secondary"}>
                  {selectedSession.anomaliesDetected} anomalias detectadas
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedSession && (
        <>
          {/* Main Replay Area */}
          <div className="grid grid-cols-3 gap-4">
            {/* Vessel Visualization */}
            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Visualização da Embarcação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-[300px] bg-gradient-to-b from-blue-900/20 to-blue-950/40 rounded-lg border overflow-hidden">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  
                  {/* Vessel representation */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative" style={{ transform: `rotate(${vesselState.heading - 180}deg)` }}>
                      <div className="w-16 h-32 bg-primary/30 rounded-t-full rounded-b-lg border-2 border-primary flex items-center justify-center">
                        <Navigation className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Info overlays */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className="bg-background/80 backdrop-blur-sm rounded px-3 py-1 text-sm">
                      <span className="text-muted-foreground">Modo:</span>
                      <Badge className="ml-2" variant={vesselState.dpMode === "TAM" ? "destructive" : "default"}>{vesselState.dpMode}</Badge>
                    </div>
                    <div className="bg-background/80 backdrop-blur-sm rounded px-3 py-1 text-sm">
                      <span className="text-muted-foreground">Heading:</span>
                      <span className="ml-2 font-mono">{vesselState.heading.toFixed(1)}°</span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 space-y-2">
                    <div className="bg-background/80 backdrop-blur-sm rounded px-3 py-1 text-sm flex items-center gap-2">
                      <Wind className="h-4 w-4" />
                      <span>{vesselState.windSpeed.toFixed(0)} kn / {vesselState.windDir.toFixed(0)}°</span>
                    </div>
                    <div className="bg-background/80 backdrop-blur-sm rounded px-3 py-1 text-sm flex items-center gap-2">
                      <Waves className="h-4 w-4" />
                      <span>{vesselState.waveHeight.toFixed(1)} m Hs</span>
                    </div>
                    <div className="bg-background/80 backdrop-blur-sm rounded px-3 py-1 text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>{vesselState.current.toFixed(2)} kn</span>
                    </div>
                  </div>

                  {/* Thruster indicators */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-background/80 backdrop-blur-sm rounded p-2">
                      <p className="text-xs text-muted-foreground mb-2">Carga dos Thrusters</p>
                      <div className="grid grid-cols-4 gap-2">
                        {vesselState.thrusterLoad.map((load, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>T{i + 1}</span>
                              <span>{load.toFixed(0)}%</span>
                            </div>
                            <Progress value={load} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Timeline */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Timeline de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {selectedSession.events.map(event => (
                      <div
                        key={event.id}
                        className={`p-2 rounded-lg border cursor-pointer transition-all ${event.timestamp <= currentTime ? "opacity-100" : "opacity-40"} ${getSeverityColor(event.severity)}`}
                        onClick={() => handleSkipToEvent(event.timestamp)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono">{formatTime(event.timestamp)}</span>
                          {event.severity !== "info" && <AlertTriangle className="h-3 w-3" />}
                        </div>
                        <p className="text-xs mt-1">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Playback Controls */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={selectedSession.duration}
                    step={1}
                    onValueChange={([v]) => setCurrentTime(v)}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(selectedSession.duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => setCurrentTime(0)}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentTime(Math.max(0, currentTime - 300))}>
                    <Rewind className="h-4 w-4" />
                  </Button>
                  <Button size="lg" onClick={handlePlay} className="px-8">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentTime(Math.min(selectedSession.duration, currentTime + 300))}>
                    <FastForward className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentTime(selectedSession.duration)}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Velocidade:</span>
                    <Select value={playbackSpeed.toString()} onValueChange={(v) => setPlaybackSpeed(Number(v))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                        <SelectItem value="4">4x</SelectItem>
                        <SelectItem value="10">10x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Análise de Anomalias (IA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-sm font-medium text-yellow-500">⚠️ Anomalia Detectada</p>
                  <p className="text-xs text-muted-foreground mt-1">Perda de sensor MRU#1 às 02:30:00 - Fallback automático funcionou corretamente, mas recomenda-se inspeção preventiva.</p>
                </div>
                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-sm font-medium text-yellow-500">⚠️ Padrão Identificado</p>
                  <p className="text-xs text-muted-foreground mt-1">Corrente excedeu threshold ASOG por 15 minutos. Considerar ajuste de limites ou procedimentos operacionais.</p>
                </div>
                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-sm font-medium text-green-500">✅ Conformidade</p>
                  <p className="text-xs text-muted-foreground mt-1">Mudança para TAM durante operação crítica seguiu procedimentos corretos conforme DPOM.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DPReplaySystem;
