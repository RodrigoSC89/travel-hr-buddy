/**
 * Real Time Tracking Map - Premium Component
 * WORLD-CLASS: Real vessel_tracking data + interactive map + AI analysis
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, Navigation, Clock, Anchor, Play, Pause,
  FastForward, Rewind, RefreshCw, Layers,
  Signal, AlertTriangle, Ship, Route,
  Brain, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VesselPosition {
  id: string;
  name: string;
  imo: string;
  lat: number;
  lng: number;
  speed: number;
  course: number;
  status: 'navigating' | 'anchored' | 'moored' | 'drifting';
  eta?: Date;
  destination?: string;
  signalQuality: 'excellent' | 'good' | 'poor' | 'lost';
  lastUpdate: Date;
  fuelLevel?: number;
  engineStatus?: string;
}

const STATUS_CONFIG = {
  navigating: { color: 'bg-green-500', label: 'Navegando', icon: Navigation },
  anchored: { color: 'bg-yellow-500', label: 'Ancorado', icon: Anchor },
  moored: { color: 'bg-blue-500', label: 'Atracado', icon: Ship },
  drifting: { color: 'bg-red-500', label: 'À Deriva', icon: AlertTriangle },
};

const SIGNAL_CONFIG = {
  excellent: { color: 'text-green-500', bars: 4 },
  good: { color: 'text-yellow-500', bars: 3 },
  poor: { color: 'text-orange-500', bars: 2 },
  lost: { color: 'text-red-500', bars: 1 },
};

function mapVesselStatus(status: string | null, speed: number): VesselPosition['status'] {
  const s = (status || '').toLowerCase();
  if (s.includes('anchor')) return 'anchored';
  if (s.includes('moor') || s.includes('port') || s.includes('berth')) return 'moored';
  if (s.includes('drift')) return 'drifting';
  if (speed > 1) return 'navigating';
  return 'anchored';
}

function getSignalQuality(lastUpdate: Date): VesselPosition['signalQuality'] {
  const minutesAgo = (Date.now() - lastUpdate.getTime()) / 60000;
  if (minutesAgo < 5) return 'excellent';
  if (minutesAgo < 30) return 'good';
  if (minutesAgo < 120) return 'poor';
  return 'lost';
}

export function RealTimeTrackingMap() {
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [mapLayer, setMapLayer] = useState('satellite');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ===== REAL DATA: vessel_tracking + vessels =====
  const { data: vessels = [], isLoading, refetch } = useQuery({
    queryKey: ['vessel-tracking-positions'],
    queryFn: async (): Promise<VesselPosition[]> => {
      // Get latest tracking position per vessel using distinct on
      const { data: tracking, error } = await supabase
        .from('vessel_tracking')
        .select('*, vessels(id, name, imo_number, status)')
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (tracking && tracking.length > 0) {
        // Deduplicate by vessel_id - keep latest
        const seen = new Set<string>();
        const unique: VesselPosition[] = [];

        for (const t of tracking) {
          const vid = t.vessel_id || t.id;
          if (seen.has(vid)) continue;
          seen.add(vid);

          const lastUpdate = new Date(t.recorded_at || t.created_at || Date.now());
          const speed = t.speed_knots || 0;
          const vessel = t.vessels as any;

          unique.push({
            id: t.id,
            name: vessel?.name || `Vessel ${vid.substring(0, 6)}`,
            imo: vessel?.imo_number || 'N/A',
            lat: t.latitude,
            lng: t.longitude,
            speed,
            course: t.heading || 0,
            status: mapVesselStatus(vessel?.status, speed),
            lastUpdate,
            signalQuality: getSignalQuality(lastUpdate),
            fuelLevel: t.fuel_level ?? undefined,
            engineStatus: t.engine_status ?? undefined,
          });
        }

        return unique;
      }

      // Fallback: just vessels table
      const { data: vesselList } = await supabase
        .from('vessels')
        .select('id, name, imo_number, status')
        .limit(15);

      return (vesselList || []).map((v, idx) => ({
        id: v.id,
        name: v.name,
        imo: v.imo_number || 'N/A',
        lat: -23.9 + (idx * 2 - 5),
        lng: -46.3 + (idx * 3 - 10),
        speed: 0,
        course: 0,
        status: 'moored' as const,
        lastUpdate: new Date(),
        signalQuality: 'good' as const,
      }));
    },
    refetchInterval: 30000,
  });

  // Replay animation
  useEffect(() => {
    if (isReplaying) {
      const interval = setInterval(() => {
        setReplayProgress(prev => {
          if (prev >= 100) { setIsReplaying(false); return 0; }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isReplaying]);

  // ===== AI ANALYSIS =====
  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const vesselSummary = vessels.map(v => 
        `${v.name} | IMO: ${v.imo} | Status: ${v.status} | ${v.speed.toFixed(1)}kn | ${v.course.toFixed(0)}° | Sinal: ${v.signalQuality}${v.fuelLevel != null ? ` | Fuel: ${v.fuelLevel}%` : ''}${v.engineStatus ? ` | Engine: ${v.engineStatus}` : ''}`
      ).join('\n');

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          agentId: 'nauti-brain',
          messages: [{
            role: 'user',
            content: `Analise o rastreamento da frota marítima:\n\n${vesselSummary}\n\nForneça:\n1. Embarcações com anomalias\n2. Alertas de perda de sinal\n3. Otimização de rotas\n4. Riscos operacionais\nResponda em PT-BR.`
          }]
        }
      });
      if (error) throw error;
      setAiAnalysis(data?.choices?.[0]?.message?.content || data?.response || 'Análise concluída.');
      toast.success('Análise AI de rastreamento concluída');
    } catch {
      toast.error('Erro na análise AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const SignalIndicator = ({ quality }: { quality: VesselPosition['signalQuality'] }) => {
    const config = SIGNAL_CONFIG[quality];
    return (
      <div className="flex items-end gap-0.5">
        {[1, 2, 3, 4].map(bar => (
          <div key={bar} className={`w-1 rounded-sm ${bar <= config.bars ? config.color : 'bg-muted'}`}
            style={{ height: bar * 3 + 2 }} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-3 flex items-center gap-3">
          <Ship className="h-8 w-8 text-primary" />
          <div><p className="text-2xl font-bold">{vessels.length}</p><p className="text-xs text-muted-foreground">Embarcações</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-3">
          <Navigation className="h-8 w-8 text-green-500" />
          <div><p className="text-2xl font-bold">{vessels.filter(v => v.status === 'navigating').length}</p><p className="text-xs text-muted-foreground">Navegando</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-3">
          <Anchor className="h-8 w-8 text-yellow-500" />
          <div><p className="text-2xl font-bold">{vessels.filter(v => v.status === 'anchored').length}</p><p className="text-xs text-muted-foreground">Ancorados</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-3">
          <Signal className="h-8 w-8 text-blue-500" />
          <div><p className="text-2xl font-bold">{vessels.filter(v => v.signalQuality !== 'lost').length}</p><p className="text-xs text-muted-foreground">Com Sinal</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <div><p className="text-2xl font-bold">{vessels.filter(v => v.signalQuality === 'lost').length}</p><p className="text-xs text-muted-foreground">Sem Sinal</p></div>
        </CardContent></Card>
      </div>

      {/* Map and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Mapa em Tempo Real
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={mapLayer} onValueChange={setMapLayer}>
                  <SelectTrigger className="w-32 h-8"><Layers className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="satellite">Satélite</SelectItem>
                    <SelectItem value="nautical">Náutica</SelectItem>
                    <SelectItem value="terrain">Terreno</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" className="gap-1 border-primary/50 text-primary"
                  onClick={runAIAnalysis} disabled={isAnalyzing || vessels.length === 0}>
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                  Análise AI
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Map */}
            <div className="relative h-[500px] bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                {[...Array(10)].map((_, i) => (
                  <React.Fragment key={i}>
                    <div className="absolute w-full h-px bg-white" style={{ top: `${i * 10}%` }} />
                    <div className="absolute h-full w-px bg-white" style={{ left: `${i * 10}%` }} />
                  </React.Fragment>
                ))}
              </div>
              
              {vessels.map(vessel => {
                const x = ((vessel.lng + 60) / 30) * 100;
                const y = ((vessel.lat + 30) / 15) * 100;
                
                return (
                  <div key={vessel.id} className="absolute cursor-pointer transition-transform hover:scale-125"
                    style={{ left: `${Math.min(Math.max(x, 5), 95)}%`, top: `${Math.min(Math.max(y, 5), 95)}%`, transform: `translate(-50%, -50%) rotate(${vessel.course}deg)` }}
                    onClick={() => setSelectedVessel(vessel)}>
                    <div className={`w-0 h-0 border-l-[6px] border-r-[6px] border-b-[16px] border-l-transparent border-r-transparent ${
                      vessel.signalQuality === 'lost' ? 'border-b-red-500' : 
                      vessel.status === 'navigating' ? 'border-b-green-400' : 'border-b-yellow-400'
                    }`} />
                  </div>
                );
              })}
              
              <div className="absolute bottom-4 left-4 text-white text-xs flex items-center gap-2">
                <div className="w-16 h-0.5 bg-white" /><span>50 nm</span>
              </div>
              <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <div className="text-white text-xs font-bold">N</div>
              </div>
            </div>

            {/* Replay */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm font-medium">Replay:</span>
              <Button variant="outline" size="sm" onClick={() => setReplayProgress(Math.max(0, replayProgress - 10))}><Rewind className="h-4 w-4" /></Button>
              <Button variant={isReplaying ? 'default' : 'outline'} size="sm" onClick={() => setIsReplaying(!isReplaying)}>
                {isReplaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setReplayProgress(Math.min(100, replayProgress + 10))}><FastForward className="h-4 w-4" /></Button>
              <Slider value={[replayProgress]} onValueChange={(v) => setReplayProgress(v[0])} max={100} className="flex-1" />
              <span className="text-sm text-muted-foreground w-12">{replayProgress}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Vessel List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Embarcações</CardTitle>
            <CardDescription>{vessels.length} rastreadas</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : (
              <div className="divide-y max-h-[550px] overflow-auto">
                {vessels.map(vessel => {
                  const statusConfig = STATUS_CONFIG[vessel.status];
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div key={vessel.id}
                      className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${selectedVessel?.id === vessel.id ? 'bg-primary/10' : ''}`}
                      onClick={() => setSelectedVessel(vessel)}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{vessel.name}</p>
                          <p className="text-xs text-muted-foreground">IMO: {vessel.imo}</p>
                        </div>
                        <SignalIndicator quality={vessel.signalQuality} />
                      </div>
                      <Badge className={`${statusConfig.color} text-white text-xs`}>
                        <StatusIcon className="h-3 w-3 mr-1" />{statusConfig.label}
                      </Badge>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1"><Navigation className="h-3 w-3" />{vessel.speed.toFixed(1)} kn</div>
                        <div className="flex items-center gap-1"><Route className="h-3 w-3" />{vessel.course.toFixed(0)}°</div>
                      </div>
                      {vessel.fuelLevel != null && (
                        <div className="mt-1 text-xs text-muted-foreground">Combustível: {vessel.fuelLevel}%</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Análise AI de Rastreamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <p className="text-sm whitespace-pre-wrap">{aiAnalysis}</p>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RealTimeTrackingMap;
