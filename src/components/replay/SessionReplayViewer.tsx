/**
 * PATCH 1008 - Session Replay Viewer
 * Replay past sessions and events for debugging and analysis
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  User,
  Monitor,
  MousePointer,
  Keyboard,
  Eye,
  Calendar,
  Download,
  Share2,
  Maximize2,
  Volume2,
  VolumeX,
  Rewind,
  FastForward,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDuration, intervalToDuration } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReplaySession {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  eventsCount: number;
  pagesVisited: string[];
  device: string;
  browser: string;
}

interface ReplayEvent {
  id: string;
  timestamp: number;
  type: "click" | "scroll" | "input" | "navigation" | "error" | "custom";
  data: Record<string, unknown>;
  position?: { x: number; y: number };
}

// Mock sessions for demo
const MOCK_SESSIONS: ReplaySession[] = [
  {
    id: "session-1",
    userId: "user-1",
    userName: "Carlos Silva",
    startTime: new Date(Date.now() - 7200000),
    endTime: new Date(Date.now() - 3600000),
    duration: 3600,
    eventsCount: 245,
    pagesVisited: ["/dashboard", "/fleet", "/crew", "/maintenance"],
    device: "Desktop",
    browser: "Chrome 120",
  },
  {
    id: "session-2",
    userId: "user-2",
    userName: "Maria Santos",
    startTime: new Date(Date.now() - 14400000),
    endTime: new Date(Date.now() - 10800000),
    duration: 3600,
    eventsCount: 189,
    pagesVisited: ["/dashboard", "/documents", "/compliance"],
    device: "Mobile",
    browser: "Safari 17",
  },
  {
    id: "session-3",
    userId: "user-3",
    userName: "João Pereira",
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() - 82800000),
    duration: 3600,
    eventsCount: 312,
    pagesVisited: ["/nautilus-command", "/fleet", "/maintenance", "/reports"],
    device: "Desktop",
    browser: "Firefox 121",
  },
];

// Mock events for selected session
const generateMockEvents = (count: number): ReplayEvent[] => {
  const events: ReplayEvent[] = [];
  const types: ReplayEvent["type"][] = ["click", "scroll", "input", "navigation"];
  
  for (let i = 0; i < count; i++) {
    events.push({
      id: `event-${i}`,
      timestamp: i * 100,
      type: types[Math.floor(Math.random() * types.length)],
      data: {
        target: `element-${Math.floor(Math.random() * 20)}`,
        value: Math.random() > 0.5 ? "sample text" : undefined,
      },
      position: {
        x: Math.floor(Math.random() * 1200),
        y: Math.floor(Math.random() * 800),
      },
    });
  }
  
  return events;
};

export function SessionReplayViewer() {
  const [selectedSession, setSelectedSession] = useState<ReplaySession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [events, setEvents] = useState<ReplayEvent[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const playbackRef = useRef<NodeJS.Timeout>();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load session events when selected
  useEffect(() => {
    if (selectedSession) {
      const mockEvents = generateMockEvents(selectedSession.eventsCount);
      setEvents(mockEvents);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [selectedSession]);

  // Playback logic
  useEffect(() => {
    if (isPlaying && selectedSession) {
      playbackRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 100 * playbackSpeed;
          if (next >= selectedSession.duration * 1000) {
            setIsPlaying(false);
            return selectedSession.duration * 1000;
          }
          return next;
        });
      }, 100);
    }

    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, selectedSession]);

  // Update cursor position based on current time
  useEffect(() => {
    const currentEvent = events.find(
      (e) => e.timestamp <= currentTime && e.timestamp + 100 > currentTime
    );
    if (currentEvent?.position) {
      setCursorPosition(currentEvent.position);
    }
  }, [currentTime, events]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
  };

  const skipForward = () => {
    if (selectedSession) {
      setCurrentTime((prev) =>
        Math.min(prev + 10000, selectedSession.duration * 1000)
      );
    }
  };

  const skipBackward = () => {
    setCurrentTime((prev) => Math.max(prev - 10000, 0));
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getCurrentEvents = () => {
    return events.filter(
      (e) => e.timestamp >= currentTime - 1000 && e.timestamp <= currentTime
    );
  };

  return (
    <div className="space-y-4">
      {/* Session Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Session Replay
              </CardTitle>
              <CardDescription>
                Reproduza sessões passadas para análise e debugging
              </CardDescription>
            </div>
            {selectedSession && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_SESSIONS.map((session) => (
              <Card
                key={session.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary",
                  selectedSession?.id === session.id && "border-primary bg-primary/5"
                )}
                onClick={() => setSelectedSession(session)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{session.userName}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {session.device}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {format(session.startTime, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {Math.floor(session.duration / 60)} minutos
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-3 w-3" />
                      {session.eventsCount} eventos
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Replay Viewer */}
      {selectedSession && (
        <Card>
          <CardContent className="p-0">
            {/* Replay Canvas */}
            <div
              ref={canvasRef}
              className="relative bg-muted/30 h-[400px] overflow-hidden rounded-t-lg"
            >
              {/* Simulated page content */}
              <div className="absolute inset-0 p-4">
                <div className="h-full border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Reprodução da Sessão</p>
                    <p className="text-xs mt-1">
                      {selectedSession.pagesVisited[0]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cursor overlay */}
              <div
                className="absolute w-4 h-4 pointer-events-none transition-all duration-100"
                style={{
                  left: cursorPosition.x,
                  top: cursorPosition.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <MousePointer className="h-4 w-4 text-primary fill-primary/30" />
              </div>

              {/* Click indicators */}
              {getCurrentEvents()
                .filter((e) => e.type === "click")
                .map((e) => (
                  <div
                    key={e.id}
                    className="absolute w-6 h-6 rounded-full bg-primary/30 animate-ping"
                    style={{
                      left: e.position?.x || 0,
                      top: e.position?.y || 0,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}

              {/* Timeline badge */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(currentTime)} / {formatTime(selectedSession.duration * 1000)}
                </Badge>
                <Badge variant="outline">{playbackSpeed}x</Badge>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-t space-y-3">
              {/* Timeline slider */}
              <Slider
                value={[currentTime]}
                max={selectedSession.duration * 1000}
                step={100}
                onValueChange={([value]) => seekTo(value)}
                className="w-full"
              />

              {/* Playback controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={skipBackward}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setPlaybackSpeed(Math.max(0.5, playbackSpeed - 0.5))}>
                    <Rewind className="h-4 w-4" />
                  </Button>
                  <Button size="icon" onClick={togglePlayback}>
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setPlaybackSpeed(Math.min(4, playbackSpeed + 0.5))}>
                    <FastForward className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={skipForward}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    {formatTime(currentTime)} / {formatTime(selectedSession.duration * 1000)}
                  </span>
                  <Select
                    value={playbackSpeed.toString()}
                    onValueChange={(v) => setPlaybackSpeed(parseFloat(v))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                      <SelectItem value="4">4x</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Timeline */}
      {selectedSession && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Eventos da Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {events.slice(0, 50).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg text-sm cursor-pointer hover:bg-muted",
                      event.timestamp <= currentTime && event.timestamp + 100 > currentTime && "bg-primary/10"
                    )}
                    onClick={() => seekTo(event.timestamp)}
                  >
                    <span className="text-xs text-muted-foreground w-16">
                      {formatTime(event.timestamp)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {event.type === "click" && <MousePointer className="h-3 w-3 mr-1" />}
                      {event.type === "input" && <Keyboard className="h-3 w-3 mr-1" />}
                      {event.type}
                    </Badge>
                    {event.position && (
                      <span className="text-xs text-muted-foreground">
                        ({event.position.x}, {event.position.y})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SessionReplayViewer;
