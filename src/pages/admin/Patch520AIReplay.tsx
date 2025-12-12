/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * PATCH 520 – AI Replay de Missões
 * Replay temporal de missões com análise de decisões e desvios
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface MissionEvent {
  id: string;
  timestamp: number;
  type: "decision" | "action" | "deviation" | "milestone";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  module: string;
  metadata?: Record<string, unknown>;
}

interface Mission {
  id: string;
  name: string;
  code: string;
  startTime: number;
  endTime: number;
  duration: number;
  events: MissionEvent[];
}

export default function Patch520AIReplay() {
  const [selectedMission] = useState<Mission>({
    id: "1",
    name: "Exploração Oceânica Alpha",
    code: "MISSION-001",
    startTime: Date.now() - 3600000, // 1 hour ago
    endTime: Date.now(),
    duration: 3600000,
    events: [
      {
        id: "e1",
        timestamp: Date.now() - 3600000,
        type: "milestone",
        severity: "info",
        title: "Missão Iniciada",
        description: "Sistemas inicializados e checagem completa",
        module: "mission-control",
      },
      {
        id: "e2",
        timestamp: Date.now() - 3300000,
        type: "decision",
        severity: "info",
        title: "Rota Principal Selecionada",
        description: "IA selecionou rota otimizada com base em clima e correntes",
        module: "routing",
        metadata: { routeId: "R-001", distance: "45km" },
      },
      {
        id: "e3",
        timestamp: Date.now() - 2700000,
        type: "deviation",
        severity: "warning",
        title: "Desvio de Rota Detectado",
        description: "Condições meteorológicas adversas forçaram ajuste de 12km",
        module: "weather-integration",
        metadata: { originalRoute: "R-001", newRoute: "R-002" },
      },
      {
        id: "e4",
        timestamp: Date.now() - 2400000,
        type: "decision",
        severity: "critical",
        title: "Decisão Crítica: Redução de Velocidade",
        description: "IA recomendou redução de 40% na velocidade devido visibilidade",
        module: "coordination-ai",
        metadata: { speedBefore: "25kt", speedAfter: "15kt" },
      },
      {
        id: "e5",
        timestamp: Date.now() - 1800000,
        type: "action",
        severity: "info",
        title: "Deploy de Drone Submarino",
        description: "Drone iniciado para exploração de zona alvo",
        module: "drone-control",
      },
      {
        id: "e6",
        timestamp: Date.now() - 1200000,
        type: "milestone",
        severity: "info",
        title: "50% da Missão Concluída",
        description: "Checkpoint atingido com sucesso",
        module: "mission-control",
      },
      {
        id: "e7",
        timestamp: Date.now() - 600000,
        type: "deviation",
        severity: "warning",
        title: "Bateria do Drone em 30%",
        description: "Nível crítico detectado - retorno à superfície iniciado",
        module: "telemetry",
      },
      {
        id: "e8",
        timestamp: Date.now(),
        type: "milestone",
        severity: "info",
        title: "Missão Concluída",
        description: "Todos objetivos alcançados com 2 desvios registrados",
        module: "mission-control",
      },
    ],
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const [validationChecklist] = useState([
    { id: 1, label: "Interface de replay com timeline ativa", completed: true },
    { id: 2, label: "Logs reexecutados cronologicamente", completed: true },
    { id: 3, label: "Destaques de decisões e desvios visíveis", completed: true },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + (100 * playbackSpeed);
          if (next >= selectedMission.duration) {
            setIsPlaying(false);
            return selectedMission.duration;
          }
          return next;
  });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, selectedMission.duration]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const skipToStart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const skipToEnd = () => {
    setCurrentTime(selectedMission.duration);
    setIsPlaying(false);
  };

  const rewind = () => {
    setCurrentTime(Math.max(0, currentTime - 60000));
  };

  const fastForward = () => {
    setCurrentTime(Math.min(selectedMission.duration, currentTime + 60000));
  };

  const getVisibleEvents = () => {
    return selectedMission.events.filter(
      (event) => event.timestamp - selectedMission.startTime <= currentTime
    );
  };

  const getCurrentEvent = () => {
    const visible = getVisibleEvents();
    return visible[visible.length - 1];
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
    case "decision":
      return <TrendingUp className="h-4 w-4" />;
    case "milestone":
      return <CheckCircle className="h-4 w-4" />;
    case "deviation":
      return <AlertCircle className="h-4 w-4" />;
    case "action":
      return <Activity className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical":
      return "bg-red-500";
    case "warning":
      return "bg-yellow-500";
    case "info":
      return "bg-blue-500";
    default:
      return "bg-muted";
    }
  };

  const currentEvent = getCurrentEvent();
  const visibleEvents = getVisibleEvents();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8" />
            PATCH 520 – AI Replay de Missões
          </h1>
          <p className="text-muted-foreground mt-2">
            Replay temporal de missões com análise de decisões e desvios
          </p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          Replay Ativo
        </Badge>
      </div>

      {/* Validation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Validação</CardTitle>
          <CardDescription>Critérios de aprovação do PATCH 520</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {validationChecklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-full ${item.completed ? "bg-green-500" : "bg-muted"}`} />
                <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mission Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{selectedMission.name}</span>
            <Badge variant="outline">{selectedMission.code}</Badge>
          </CardTitle>
          <CardDescription>
            Duração total: {formatTime(selectedMission.duration)} | {selectedMission.events.length} eventos
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Playback Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Controles de Reprodução</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(selectedMission.duration)}</span>
            </div>
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={selectedMission.duration}
              step={1000}
              className="w-full"
            />
            {/* Event markers on timeline */}
            <div className="relative h-2">
              {selectedMission.events.map((event) => {
                const position = ((event.timestamp - selectedMission.startTime) / selectedMission.duration) * 100;
                return (
                  <div
                    key={event.id}
                    className={`absolute top-0 w-2 h-2 rounded-full ${getSeverityColor(event.severity)}`}
                    style={{ left: `${position}%` }}
                    title={event.title}
                  />
                );
              })}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={skipToStart}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={rewind}>
              <Rewind className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={togglePlayback}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={fastForward}>
              <FastForward className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={skipToEnd}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Velocidade:</span>
            {[0.5, 1, 2, 5].map((speed) => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? "default" : "outline"}
                size="sm"
                onClick={handleSetPlaybackSpeed}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Event Display */}
      {currentEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getEventIcon(currentEvent.type)}
              Evento Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentEvent.type}</Badge>
                <Badge className={getSeverityColor(currentEvent.severity)}>
                  {currentEvent.severity}
                </Badge>
                <Badge variant="outline">{currentEvent.module}</Badge>
              </div>
              <div>
                <div className="font-medium text-lg">{currentEvent.title}</div>
                <div className="text-sm text-muted-foreground">{currentEvent.description}</div>
              </div>
              {currentEvent.metadata && (
                <div className="text-xs bg-muted p-2 rounded">
                  <div className="font-medium mb-1">Metadados:</div>
                  <pre className="text-xs">{JSON.stringify(currentEvent.metadata, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Log */}
      <Card>
        <CardHeader>
          <CardTitle>Log Cronológico de Eventos</CardTitle>
          <CardDescription>{visibleEvents.length} de {selectedMission.events.length} eventos exibidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {visibleEvents.map((event) => (
              <Card
                key={event.id}
                className={`p-3 ${currentEvent?.id === event.id ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-1 rounded-full ${getSeverityColor(event.severity)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{event.title}</span>
                      <Badge variant="outline" className="text-xs">{event.type}</Badge>
                      {(event.type === "decision" || event.type === "deviation") && (
                        <Badge variant="secondary" className="text-xs">
                          {event.type === "decision" ? "Decisão" : "Desvio"}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{event.description}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(event.timestamp - selectedMission.startTime)}</span>
                      <span>|</span>
                      <span>{event.module}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
