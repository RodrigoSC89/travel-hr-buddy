/**
 * PATCH 524 - Incident Replay AI
 * AI-powered incident replay system with timeline reconstruction
 * 
 * Features:
 * - Interactive timeline with events
 * - Map visualization with incident locations
 * - AI insights for each step
 * - Telemetry data playback
 * - Speed control (slow, normal, fast)
 * - Export replay logs
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Brain,
  MapPin,
  Activity,
  Clock,
  Download,
  Database,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface IncidentEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location: {
    lat: number;
    lng: number;
    depth?: number;
  };
  telemetry?: {
    speed?: number;
    heading?: number;
    temperature?: number;
    pressure?: number;
  };
  aiInsight?: string;
}

interface IncidentReplay {
  id: string;
  title: string;
  date: string;
  duration: number;
  events: IncidentEvent[];
  severity: string;
}

const IncidentReplayAI: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentReplay[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReplay | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentEvent, setCurrentEvent] = useState<IncidentEvent | null>(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = () => {
    const mockIncidents: IncidentReplay[] = [
      {
        id: "inc-001",
        title: "Underwater Collision Alert",
        date: "2025-10-28T14:30:00Z",
        duration: 300,
        severity: "high",
        events: [
          {
            id: "evt-001",
            timestamp: "2025-10-28T14:30:00Z",
            type: "detection",
            severity: "low",
            description: "Sonar detected unknown object at 50m",
            location: { lat: -23.5505, lng: -46.6333, depth: 50 },
            telemetry: { speed: 5, heading: 270, temperature: 12, pressure: 6 },
            aiInsight: "Object size suggests marine debris. Recommend course adjustment.",
          },
          {
            id: "evt-002",
            timestamp: "2025-10-28T14:31:30Z",
            type: "warning",
            severity: "medium",
            description: "Object approaching - collision risk increasing",
            location: { lat: -23.5506, lng: -46.6330, depth: 48 },
            telemetry: { speed: 5, heading: 268, temperature: 12, pressure: 5.8 },
            aiInsight: "Distance closing faster than expected. AI recommends immediate evasive action.",
          },
          {
            id: "evt-003",
            timestamp: "2025-10-28T14:32:45Z",
            type: "alert",
            severity: "high",
            description: "Critical proximity alert - 10m",
            location: { lat: -23.5507, lng: -46.6328, depth: 45 },
            telemetry: { speed: 4, heading: 265, temperature: 12, pressure: 5.5 },
            aiInsight: "Emergency maneuver executed. AI analysis shows operator response time was optimal.",
          },
          {
            id: "evt-004",
            timestamp: "2025-10-28T14:33:30Z",
            type: "resolution",
            severity: "low",
            description: "Object avoided successfully",
            location: { lat: -23.5508, lng: -46.6325, depth: 42 },
            telemetry: { speed: 6, heading: 260, temperature: 11.5, pressure: 5.2 },
            aiInsight: "Incident resolved. Recommend updating navigation protocols for similar scenarios.",
          },
        ],
      },
    ];
    setIncidents(mockIncidents);
  };

  useEffect(() => {
    if (!isPlaying || !selectedIncident) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + playbackSpeed;
        if (next >= selectedIncident.duration) {
          setIsPlaying(false);
          return selectedIncident.duration;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, selectedIncident]);

  useEffect(() => {
    if (!selectedIncident) return;

    const startTime = new Date(selectedIncident.date).getTime();
    const currentTimestamp = startTime + currentTime * 1000;

    const event = selectedIncident.events
      .filter((e) => new Date(e.timestamp).getTime() <= currentTimestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    setCurrentEvent(event || null);
  }, [currentTime, selectedIncident]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    toast.success(`Velocidade: ${speed}x`);
  };

  const exportReplayLog = () => {
    if (!selectedIncident) return;

    const log = {
      incident: selectedIncident,
      currentTime,
      analysis: {
        totalEvents: selectedIncident.events.length,
        criticalEvents: selectedIncident.events.filter((e) => e.severity === "critical").length,
        aiInsights: selectedIncident.events.map((e) => e.aiInsight).filter(Boolean),
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `incident-replay-${selectedIncident.id}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Log de replay exportado");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      critical: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[severity as keyof typeof colors] || "bg-gray-500/20";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
              Incident Replay AI
            </h1>
            <p className="text-zinc-400 mt-1">
              AI-powered incident reconstruction and analysis - PATCH 524
            </p>
          </div>
          {selectedIncident && (
            <Badge className="bg-orange-500 text-lg px-4 py-2">
              {selectedIncident.severity.toUpperCase()}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                Incidentes Registrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {incidents.map((incident) => (
                    <div
                      key={incident.id}
                      onClick={() => {
                        setSelectedIncident(incident);
                        setCurrentTime(0);
                        setIsPlaying(false);
                      }}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedIncident?.id === incident.id
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-zinc-700 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-semibold text-sm">{incident.title}</span>
                        <Badge variant="outline" className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-400">
                        {new Date(incident.date).toLocaleString()}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {incident.events.length} eventos · {formatTime(incident.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {selectedIncident ? (
              <>
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-2">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(selectedIncident.duration)}</span>
                        </div>
                        <Slider
                          value={[currentTime]}
                          onValueChange={([value]) => setCurrentTime(value)}
                          max={selectedIncident.duration}
                          step={1}
                          className="cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <Button size="sm" variant="outline" onClick={handleRestart} className="border-zinc-600">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSpeedChange(0.5)}
                          className={`border-zinc-600 ${playbackSpeed === 0.5 ? "bg-cyan-500/20" : ""}`}
                        >
                          0.5x
                        </Button>
                        <Button size="lg" onClick={handlePlayPause} className="bg-cyan-600 hover:bg-cyan-700">
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSpeedChange(2)}
                          className={`border-zinc-600 ${playbackSpeed === 2 ? "bg-cyan-500/20" : ""}`}
                        >
                          2x
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSpeedChange(4)}
                          className={`border-zinc-600 ${playbackSpeed === 4 ? "bg-cyan-500/20" : ""}`}
                        >
                          4x
                        </Button>
                        <Button size="sm" variant="outline" onClick={exportReplayLog} className="border-zinc-600">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {currentEvent && (
                  <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        Evento Atual
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-purple-200">{currentEvent.description}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-zinc-400">
                            <Clock className="w-4 h-4" />
                            {new Date(currentEvent.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <Badge className={getSeverityColor(currentEvent.severity)}>
                          {currentEvent.severity.toUpperCase()}
                        </Badge>
                      </div>

                      {currentEvent.telemetry && (
                        <div className="grid grid-cols-4 gap-3">
                          <div className="p-2 bg-zinc-900/50 rounded">
                            <div className="text-xs text-zinc-400">Speed</div>
                            <div className="text-lg font-bold text-cyan-400">{currentEvent.telemetry.speed} kts</div>
                          </div>
                          <div className="p-2 bg-zinc-900/50 rounded">
                            <div className="text-xs text-zinc-400">Heading</div>
                            <div className="text-lg font-bold text-blue-400">{currentEvent.telemetry.heading}°</div>
                          </div>
                          <div className="p-2 bg-zinc-900/50 rounded">
                            <div className="text-xs text-zinc-400">Temp</div>
                            <div className="text-lg font-bold text-green-400">{currentEvent.telemetry.temperature}°C</div>
                          </div>
                          <div className="p-2 bg-zinc-900/50 rounded">
                            <div className="text-xs text-zinc-400">Pressure</div>
                            <div className="text-lg font-bold text-orange-400">{currentEvent.telemetry.pressure} bar</div>
                          </div>
                        </div>
                      )}

                      {currentEvent.aiInsight && (
                        <div className="p-3 bg-purple-500/10 rounded border border-purple-500/30">
                          <div className="flex items-start gap-2">
                            <Brain className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-purple-300 mb-1">AI Insight:</div>
                              <p className="text-sm text-white">{currentEvent.aiInsight}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {currentEvent.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-green-400" />
                          <span className="text-zinc-300">
                            Lat: {currentEvent.location.lat.toFixed(4)}, Lng: {currentEvent.location.lng.toFixed(4)}
                            {currentEvent.location.depth && `, Depth: ${currentEvent.location.depth}m`}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                      Timeline de Eventos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {selectedIncident.events.map((event) => {
                          const eventTime =
                            (new Date(event.timestamp).getTime() - new Date(selectedIncident.date).getTime()) / 1000;
                          const isActive = eventTime <= currentTime;

                          return (
                            <div
                              key={event.id}
                              onClick={() => setCurrentTime(eventTime)}
                              className={`p-3 border rounded cursor-pointer transition-all ${
                                isActive ? "border-cyan-500 bg-cyan-500/10" : "border-zinc-700 opacity-50"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="text-xs text-zinc-400">{formatTime(eventTime)}</div>
                                  <span className="text-sm font-medium">{event.description}</span>
                                </div>
                                <Badge variant="outline" className={getSeverityColor(event.severity)}>
                                  {event.severity}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardContent className="p-12 text-center">
                  <Activity className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                  <h3 className="text-xl font-semibold text-zinc-400 mb-2">Selecione um Incidente</h3>
                  <p className="text-zinc-500">
                    Escolha um incidente da lista para iniciar o replay com análise de IA
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentReplayAI;
