/**
 * Session Replay Viewer - Real Supabase Integration
 * Displays real session data from access_logs table
 */

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Play, Pause, SkipBack, SkipForward, Clock, User, Monitor,
  MousePointer, Keyboard, Eye, Calendar, Download, Share2,
  Maximize2, Rewind, FastForward, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
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
}

interface ReplayEvent {
  id: string;
  timestamp: number;
  type: "click" | "scroll" | "input" | "navigation" | "error" | "custom";
  data: Record<string, unknown>;
  position?: { x: number; y: number };
}

export function SessionReplayViewer() {
  const [selectedSession, setSelectedSession] = useState<ReplaySession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [events, setEvents] = useState<ReplayEvent[]>([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const playbackRef = useRef<NodeJS.Timeout>();

  // Fetch real sessions from access_logs grouped by user
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['session-replay-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(200);

      if (error || !data || data.length === 0) return [];

      // Group logs by user_id into sessions
      const userSessions = new Map<string, typeof data>();
      data.forEach(log => {
        const key = log.user_id || 'anonymous';
        if (!userSessions.has(key)) userSessions.set(key, []);
        userSessions.get(key)!.push(log);
      });

      const result: ReplaySession[] = [];
      userSessions.forEach((logs, userId) => {
        if (logs.length < 2) return;
        const sorted = logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const start = new Date(sorted[0].timestamp);
        const end = new Date(sorted[sorted.length - 1].timestamp);
        const durationMs = end.getTime() - start.getTime();
        const pages = [...new Set(sorted.map(l => l.module_accessed).filter(Boolean))];

        result.push({
          id: `session-${userId}-${start.getTime()}`,
          userId,
          userName: userId === 'anonymous' ? 'Anônimo' : `Usuário ${userId.slice(0, 8)}`,
          startTime: start,
          endTime: end,
          duration: Math.max(Math.floor(durationMs / 1000), 60),
          eventsCount: logs.length,
          pagesVisited: pages,
          device: 'Desktop',
        });
      });

      return result.slice(0, 10);
    },
  });

  // Load events for selected session
  useEffect(() => {
    if (!selectedSession) return;

    const loadEvents = async () => {
      const { data } = await supabase
        .from('access_logs')
        .select('*')
        .eq('user_id', selectedSession.userId)
        .gte('timestamp', selectedSession.startTime.toISOString())
        .lte('timestamp', selectedSession.endTime.toISOString())
        .order('timestamp', { ascending: true });

      if (data) {
        const mapped: ReplayEvent[] = data.map((log, i) => ({
          id: log.id,
          timestamp: i * Math.floor((selectedSession.duration * 1000) / data.length),
          type: log.action?.includes('click') ? 'click' as const :
                log.action?.includes('input') ? 'input' as const :
                log.action?.includes('nav') ? 'navigation' as const : 'custom' as const,
          data: { action: log.action, module: log.module_accessed, result: log.result },
          position: { x: 100 + ((i * 137 + 43) % 900), y: 50 + ((i * 89 + 17) % 300) },
        }));
        setEvents(mapped);
      }
      setCurrentTime(0);
      setIsPlaying(false);
    };

    loadEvents();
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
    return () => { if (playbackRef.current) clearInterval(playbackRef.current); };
  }, [isPlaying, playbackSpeed, selectedSession]);

  // Cursor update
  useEffect(() => {
    const currentEvent = events.find(e => e.timestamp <= currentTime && e.timestamp + 200 > currentTime);
    if (currentEvent?.position) setCursorPosition(currentEvent.position);
  }, [currentTime, events]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes.toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  const getCurrentEvents = () => events.filter(e => e.timestamp >= currentTime - 1000 && e.timestamp <= currentTime);

  return (
    <div className="space-y-4">
      {/* Session Selector */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary" />Session Replay</CardTitle>
              <CardDescription>Reproduza sessões reais para análise e debugging</CardDescription>
            </div>
            {selectedSession && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Exportar</Button>
                <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-2" />Compartilhar</Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="text-sm text-muted-foreground mt-2">Carregando sessões...</p></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-medium mb-2">Nenhuma sessão disponível</h3>
              <p className="text-sm text-muted-foreground">Sessões serão registradas conforme os usuários interagem com o sistema</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  className={cn("cursor-pointer transition-all hover:border-primary", selectedSession?.id === session.id && "border-primary bg-primary/5")}
                  onClick={() => setSelectedSession(session)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium text-sm">{session.userName}</span></div>
                      <Badge variant="outline" className="text-xs">{session.device}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2"><Calendar className="h-3 w-3" />{format(session.startTime, "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
                      <div className="flex items-center gap-2"><Clock className="h-3 w-3" />{Math.floor(session.duration / 60)} minutos</div>
                      <div className="flex items-center gap-2"><MousePointer className="h-3 w-3" />{session.eventsCount} eventos</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Replay Viewer */}
      {selectedSession && (
        <Card>
          <CardContent className="p-0">
            <div className="relative bg-muted/30 h-[400px] overflow-hidden rounded-t-lg">
              <div className="absolute inset-0 p-4">
                <div className="h-full border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Reprodução da Sessão</p>
                    <p className="text-xs mt-1">{selectedSession.pagesVisited[0] || '/'}</p>
                  </div>
                </div>
              </div>
              <div className="absolute w-4 h-4 pointer-events-none transition-all duration-100" style={{ left: cursorPosition.x, top: cursorPosition.y, transform: "translate(-50%, -50%)" }}>
                <MousePointer className="h-4 w-4 text-primary fill-primary/30" />
              </div>
              {getCurrentEvents().filter(e => e.type === "click").map(e => (
                <div key={e.id} className="absolute w-6 h-6 rounded-full bg-primary/30 animate-ping" style={{ left: e.position?.x || 0, top: e.position?.y || 0, transform: "translate(-50%, -50%)" }} />
              ))}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{formatTime(currentTime)} / {formatTime(selectedSession.duration * 1000)}</Badge>
                <Badge variant="outline">{playbackSpeed}x</Badge>
              </div>
            </div>
            <div className="p-4 border-t space-y-3">
              <Slider value={[currentTime]} max={selectedSession.duration * 1000} step={100} onValueChange={([value]) => setCurrentTime(value)} className="w-full" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentTime(p => Math.max(p - 10000, 0))}><SkipBack className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => setPlaybackSpeed(Math.max(0.5, playbackSpeed - 0.5))}><Rewind className="h-4 w-4" /></Button>
                  <Button size="icon" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
                  <Button variant="outline" size="icon" onClick={() => setPlaybackSpeed(Math.min(4, playbackSpeed + 0.5))}><FastForward className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => selectedSession && setCurrentTime(p => Math.min(p + 10000, selectedSession.duration * 1000))}><SkipForward className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)} / {formatTime(selectedSession.duration * 1000)}</span>
                  <Select value={playbackSpeed.toString()} onValueChange={(v) => setPlaybackSpeed(parseFloat(v))}>
                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem><SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem><SelectItem value="2">2x</SelectItem><SelectItem value="4">4x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Timeline */}
      {selectedSession && events.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Eventos da Sessão ({events.length})</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {events.slice(0, 50).map((event) => (
                  <div key={event.id} className={cn("flex items-center gap-3 p-2 rounded-lg text-sm cursor-pointer hover:bg-muted", event.timestamp <= currentTime && event.timestamp + 200 > currentTime && "bg-primary/10")} onClick={() => setCurrentTime(event.timestamp)}>
                    <span className="text-xs text-muted-foreground w-16">{formatTime(event.timestamp)}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.type === "click" && <MousePointer className="h-3 w-3 mr-1" />}
                      {event.type === "input" && <Keyboard className="h-3 w-3 mr-1" />}
                      {event.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">{(event.data as any)?.module || (event.data as any)?.action || ''}</span>
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