/**
 * PATCH 524 - Incident Replay AI
 * Timeline-based incident reconstruction with AI analysis
 * 
 * Features:
 * - Variable speed playback (0.5x-4x) with interactive timeline scrubbing
 * - Event-by-event telemetry visualization (speed, heading, temperature, pressure)
 * - GPS coordinates with depth data per event
 * - AI insights contextual to each incident step
 * - JSON export for replay logs
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
  SkipBack,
  SkipForward,
  Download,
  MapPin,
  Gauge,
  Compass,
  Thermometer,
  Activity,
  Brain,
  Clock,
  Navigation,
  Waves,
} from "lucide-react";
import { incidentReplayService } from "./services/incidentReplayService";
import { IncidentReplay, ReplayState } from "./types";
import { toast } from "sonner";

const IncidentReplayAI: React.FC = () => {
  const [incident, setIncident] = useState<IncidentReplay | null>(null);
  const [replayState, setReplayState] = useState<ReplayState>({
    currentEventIndex: 0,
    isPlaying: false,
    playbackSpeed: 1,
    totalDuration: 0,
    currentTime: 0,
  });
  const [loading, setLoading] = useState(false);

  // Playback speeds
  const speeds = [0.5, 1, 2, 4];

  // Load default incident on mount
  useEffect(() => {
    loadIncident("incident-001");
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!replayState.isPlaying || !incident) return;

    const interval = setInterval(() => {
      setReplayState(prev => {
        const nextIndex = prev.currentEventIndex + 1;
        if (nextIndex >= incident.events.length) {
          toast.success("Replay completado");
          return { ...prev, isPlaying: false, currentEventIndex: incident.events.length - 1 };
        }
        return { ...prev, currentEventIndex: nextIndex };
      });
    }, 2000 / replayState.playbackSpeed); // Base speed: 2 seconds per event

    return () => clearInterval(interval);
  }, [replayState.isPlaying, replayState.playbackSpeed, incident]);

  const loadIncident = async (incidentId: string) => {
    setLoading(true);
    try {
      const data = await incidentReplayService.loadIncident(incidentId);
      setIncident(data);
      setReplayState(prev => ({
        ...prev,
        currentEventIndex: 0,
        totalDuration: data.events.length,
      }));
      toast.success("Incidente carregado com sucesso");
    } catch (error) {
      console.error("Failed to load incident:", error);
      toast.error("Falha ao carregar incidente");
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    setReplayState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const skipToEvent = (index: number) => {
    if (!incident) return;
    const clampedIndex = Math.max(0, Math.min(index, incident.events.length - 1));
    setReplayState(prev => ({ ...prev, currentEventIndex: clampedIndex, isPlaying: false }));
  };

  const changeSpeed = () => {
    const currentSpeedIndex = speeds.indexOf(replayState.playbackSpeed);
    const nextSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
    setReplayState(prev => ({ ...prev, playbackSpeed: speeds[nextSpeedIndex] }));
    toast.info(`Velocidade: ${speeds[nextSpeedIndex]}x`);
  };

  const exportLog = () => {
    if (!incident) return;
    incidentReplayService.exportReplayLog(incident);
    toast.success("Log exportado com sucesso");
  };

  const currentEvent = incident?.events[replayState.currentEventIndex];

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-green-500",
      medium: "bg-yellow-500",
      high: "bg-orange-500",
      critical: "bg-red-500",
    };
    return colors[severity as keyof typeof colors] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-cyan-500" />
          <p className="text-muted-foreground">Carregando incidente...</p>
        </div>
      </div>
    );
  }

  if (!incident || !currentEvent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Nenhum incidente carregado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-950 to-cyan-950 border-cyan-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-cyan-400" />
              <div>
                <CardTitle className="text-2xl text-white">Incident Replay AI</CardTitle>
                <p className="text-cyan-300 text-sm">{incident.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={exportLog} className="border-cyan-600 hover:bg-cyan-900">
              <Download className="h-4 w-4 mr-2" />
              Exportar JSON
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeline and Controls */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-cyan-400" />
              Timeline Interativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timeline Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Evento {replayState.currentEventIndex + 1} de {incident.events.length}</span>
                <span>{new Date(currentEvent.timestamp).toLocaleTimeString()}</span>
              </div>
              <Slider
                value={[replayState.currentEventIndex]}
                max={incident.events.length - 1}
                step={1}
                onValueChange={([value]) => skipToEvent(value)}
                className="cursor-pointer"
              />
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => skipToEvent(0)}
                disabled={replayState.currentEventIndex === 0}
                className="border-cyan-600"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                onClick={togglePlayback}
                className="h-12 w-12 bg-cyan-600 hover:bg-cyan-700"
              >
                {replayState.isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => skipToEvent(incident.events.length - 1)}
                disabled={replayState.currentEventIndex === incident.events.length - 1}
                className="border-cyan-600"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={changeSpeed}
                className="border-cyan-600"
              >
                {replayState.playbackSpeed}x
              </Button>
            </div>

            {/* Current Event Details */}
            <div className="space-y-3 bg-slate-800/50 p-4 rounded-lg border border-cyan-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${getSeverityColor(currentEvent.severity)} text-white`}>
                    {currentEvent.severity.toUpperCase()}
                  </Badge>
                  <span className="text-white font-medium">{currentEvent.eventType}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(currentEvent.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-300">{currentEvent.description}</p>
              
              {currentEvent.aiInsight && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-cyan-950/30 rounded border border-cyan-700/30">
                  <Brain className="h-5 w-5 text-cyan-400 mt-0.5" />
                  <p className="text-cyan-300 text-sm">{currentEvent.aiInsight}</p>
                </div>
              )}
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-cyan-800/30">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs text-gray-400">Velocidade</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {currentEvent.telemetry.speed.toFixed(1)} kt
                </p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg border border-cyan-800/30">
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs text-gray-400">Heading</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {currentEvent.telemetry.heading.toFixed(0)}°
                </p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg border border-cyan-800/30">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs text-gray-400">Temperatura</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {currentEvent.telemetry.temperature.toFixed(1)}°C
                </p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg border border-cyan-800/30">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs text-gray-400">Pressão</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {currentEvent.telemetry.pressure.toFixed(0)} hPa
                </p>
              </div>
            </div>

            {/* GPS and Depth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-cyan-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Coordenadas GPS</span>
                </div>
                <p className="text-white font-mono text-sm">
                  Lat: {currentEvent.telemetry.gps.latitude.toFixed(6)}
                </p>
                <p className="text-white font-mono text-sm">
                  Lon: {currentEvent.telemetry.gps.longitude.toFixed(6)}
                </p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg border border-cyan-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <Waves className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Profundidade</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {currentEvent.telemetry.depth.toFixed(1)} m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Timeline List */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Navigation className="h-5 w-5 text-cyan-400" />
              Eventos ({incident.events.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {incident.events.map((event, index) => (
                  <div
                    key={event.id}
                    onClick={() => skipToEvent(index)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      index === replayState.currentEventIndex
                        ? "bg-cyan-900/50 border-cyan-600"
                        : "bg-slate-800/50 border-cyan-800/30 hover:border-cyan-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <Badge
                        variant="outline"
                        className={`${getSeverityColor(event.severity)} text-white text-xs`}
                      >
                        {event.severity}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-white font-medium">{event.eventType}</p>
                    <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Incident Info Footer */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">Vessel</p>
              <p className="text-white font-medium">{incident.vesselName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Início</p>
              <p className="text-white font-medium">
                {new Date(incident.startTime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Término</p>
              <p className="text-white font-medium">
                {new Date(incident.endTime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Duração</p>
              <p className="text-white font-medium">
                {Math.round((new Date(incident.endTime).getTime() - new Date(incident.startTime).getTime()) / 60000)} min
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentReplayAI;
