/**
 * PEO-DP DPO Operations Logbook
 * Digital logbook for DP operations: events, incidents, watch handovers
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Clock, AlertTriangle, CheckCircle, Users,
  Navigation, Shield, Activity, Plus, ArrowRightLeft
} from 'lucide-react';

type EventSeverity = 'info' | 'warning' | 'critical';
type EventType = 'operation' | 'incident' | 'handover' | 'drill' | 'maintenance' | 'environmental';

interface LogEntry {
  id: string;
  timestamp: string;
  type: EventType;
  severity: EventSeverity;
  dpo: string;
  title: string;
  description: string;
  position?: { lat: string; lng: string };
  heading?: number;
  windSpeed?: number;
  waveHeight?: number;
  dpMode?: string;
  thrustersActive?: number;
  excursion?: number;
}

const MOCK_LOG: LogEntry[] = [
  { id: '1', timestamp: '2026-02-15T06:00:00', type: 'handover', severity: 'info', dpo: 'DPO Carlos Mendes', title: 'Watch Handover 06:00', description: 'Relevo de quarto. DP2 Mode, todas as posições estáveis. Heading 045° mantido. Sem incidentes no quarto anterior.', position: { lat: '22°56.3S', lng: '040°12.1W' }, heading: 45, windSpeed: 18, waveHeight: 1.8, dpMode: 'DP2', thrustersActive: 6, excursion: 0.3 },
  { id: '2', timestamp: '2026-02-15T07:23:00', type: 'operation', severity: 'info', dpo: 'DPO Carlos Mendes', title: 'Início de Operação de Mergulho', description: 'Diving operations started. 500m zone enforced. All vessels cleared. DP2 mode confirmed with 6 thrusters online.', dpMode: 'DP2', thrustersActive: 6, excursion: 0.2 },
  { id: '3', timestamp: '2026-02-15T09:15:00', type: 'environmental', severity: 'warning', dpo: 'DPO Carlos Mendes', title: 'Aumento de Ondas', description: 'Wave height increasing from 1.8m to 2.4m. Wind shifting to NW 22kts. Monitoring closely. Within ASOG Green limits.', windSpeed: 22, waveHeight: 2.4, excursion: 0.5 },
  { id: '4', timestamp: '2026-02-15T10:42:00', type: 'incident', severity: 'critical', dpo: 'DPO Carlos Mendes', title: 'Thruster #3 Trip', description: 'Bow thruster #3 tripped offline. Cause: overtemperature alarm. DP capability reduced. CAM initiated. All activities notified. 5 thrusters remaining. Still within DP2 redundancy envelope.', dpMode: 'DP2', thrustersActive: 5, excursion: 1.2 },
  { id: '5', timestamp: '2026-02-15T11:10:00', type: 'maintenance', severity: 'warning', dpo: 'DPO Carlos Mendes', title: 'Thruster #3 Reset', description: 'E/R reports overtemperature cleared. Thruster #3 reset and tested successfully. Back online at 75% capacity. Full redundancy restored.', thrustersActive: 6, excursion: 0.4 },
  { id: '6', timestamp: '2026-02-15T12:00:00', type: 'handover', severity: 'info', dpo: 'DPO André Lima', title: 'Watch Handover 12:00', description: 'Relevo de quarto. Briefing: Thruster #3 had trip at 10:42, restored at 11:10. Current conditions: wind NW 20kts, Hs 2.2m. All systems nominal.', heading: 45, windSpeed: 20, waveHeight: 2.2, dpMode: 'DP2', thrustersActive: 6, excursion: 0.3 },
  { id: '7', timestamp: '2026-02-15T14:30:00', type: 'drill', severity: 'info', dpo: 'DPO André Lima', title: 'Drive-Off Drill', description: 'Scheduled DP drive-off drill conducted. Scenario: Spurious thruster command. Response time: 8 seconds. Emergency disconnect not required. Drill satisfactory.', dpMode: 'DP2', thrustersActive: 6 },
];

const typeIcons: Record<EventType, typeof Clock> = {
  operation: Navigation,
  incident: AlertTriangle,
  handover: ArrowRightLeft,
  drill: Shield,
  maintenance: Activity,
  environmental: Activity,
};

const typeColors: Record<EventType, string> = {
  operation: 'bg-primary/10 text-primary border-primary/30',
  incident: 'bg-destructive/10 text-destructive border-destructive/30',
  handover: 'bg-muted text-foreground border-border',
  drill: 'bg-primary/10 text-primary border-primary/30',
  maintenance: 'bg-warning/10 text-warning border-warning/30',
  environmental: 'bg-warning/10 text-warning border-warning/30',
};

const severityBorder: Record<EventSeverity, string> = {
  info: '',
  warning: 'border-l-4 border-l-warning',
  critical: 'border-l-4 border-l-destructive',
};

const typeLabels: Record<EventType, string> = {
  operation: 'Operação',
  incident: 'Incidente',
  handover: 'Handover',
  drill: 'Drill',
  maintenance: 'Manutenção',
  environmental: 'Ambiental',
};

export function PeoDPLogbook() {
  const [filter, setFilter] = useState<EventType | 'all'>('all');

  const filtered = filter === 'all' ? MOCK_LOG : MOCK_LOG.filter(e => e.type === filter);
  const incidents = MOCK_LOG.filter(e => e.type === 'incident').length;
  const handovers = MOCK_LOG.filter(e => e.type === 'handover').length;
  const drills = MOCK_LOG.filter(e => e.type === 'drill').length;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            DP Operations Logbook
          </CardTitle>
          <CardDescription>Registro digital de operações DP, incidentes, handovers e exercícios</CardDescription>
        </CardHeader>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Entradas Hoje</span>
            </div>
            <p className="text-xl font-bold">{MOCK_LOG.length}</p>
          </CardContent>
        </Card>
        <Card className={incidents > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className={`h-4 w-4 ${incidents > 0 ? 'text-destructive' : 'text-success'}`} />
              <span className="text-xs text-muted-foreground">Incidentes</span>
            </div>
            <p className={`text-xl font-bold ${incidents > 0 ? 'text-destructive' : 'text-success'}`}>{incidents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Handovers</span>
            </div>
            <p className="text-xl font-bold">{handovers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Drills</span>
            </div>
            <p className="text-xl font-bold">{drills}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>Todos</Button>
        {(Object.keys(typeLabels) as EventType[]).map(t => (
          <Button key={t} variant={filter === t ? 'default' : 'outline'} size="sm" onClick={() => setFilter(t)} className="gap-1">
            {typeLabels[t]}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filtered.map((entry, idx) => {
          const Icon = typeIcons[entry.type];
          const time = new Date(entry.timestamp);
          return (
            <Card key={entry.id} className={`${severityBorder[entry.severity]} hover:shadow-md transition-shadow`}>
              <CardContent className="py-3">
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[entry.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeColors[entry.type]}`}>{typeLabels[entry.type]}</Badge>
                      <span className="text-xs text-muted-foreground">• {entry.dpo}</span>
                    </div>
                    <p className="font-medium text-sm">{entry.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                    {/* Metadata */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {entry.dpMode && <Badge variant="outline" className="text-[10px]">Mode: {entry.dpMode}</Badge>}
                      {entry.thrustersActive !== undefined && <Badge variant="outline" className="text-[10px]">Thrusters: {entry.thrustersActive}/6</Badge>}
                      {entry.windSpeed && <Badge variant="outline" className="text-[10px]">Wind: {entry.windSpeed}kts</Badge>}
                      {entry.waveHeight && <Badge variant="outline" className="text-[10px]">Hs: {entry.waveHeight}m</Badge>}
                      {entry.heading !== undefined && <Badge variant="outline" className="text-[10px]">Hdg: {entry.heading}°</Badge>}
                      {entry.excursion !== undefined && <Badge variant="outline" className="text-[10px]">Excursion: {entry.excursion}m</Badge>}
                      {entry.position && <Badge variant="outline" className="text-[10px]">{entry.position.lat} {entry.position.lng}</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
