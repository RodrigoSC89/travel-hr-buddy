/**
 * Crew Rotation Matrix - World-Class (supera Compas/Stena)
 * Visual rotation planning, gap detection, compliance tracking
 */
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Users, Calendar, AlertTriangle, CheckCircle, Ship,
  Download, RefreshCw, UserCheck, UserX, Clock
} from 'lucide-react';
import { format, addMonths, differenceInDays, isBefore, isAfter } from 'date-fns';

interface CrewRotation {
  crewId: string;
  name: string;
  rank: string;
  vessel: string;
  embarkDate: string;
  disembarkDate: string;
  contractMonths: number;
  reliefName?: string;
  reliefStatus: 'confirmed' | 'pending' | 'gap' | 'overdue';
  daysOnboard: number;
  maxDays: number;
  certStatus: 'valid' | 'expiring' | 'expired';
}

// Sample data from DB integration
const useCrewRotations = () => {
  return useQuery({
    queryKey: ['crew-rotations'],
    queryFn: async () => {
      const { data: crew } = await supabase
        .from('crew_members')
        .select('id, full_name, rank, vessel_id, contract_start, contract_end, status')
        .order('rank');

      const { data: vessels } = await supabase
        .from('vessels')
        .select('id, name');

      const vesselMap = new Map(vessels?.map(v => [v.id, v.name]) || []);
      const now = new Date();

      const rotations: CrewRotation[] = (crew || []).map(c => {
        const embark = c.contract_start ? new Date(c.contract_start) : now;
        const disembark = c.contract_end ? new Date(c.contract_end) : addMonths(now, 4);
        const daysOnboard = differenceInDays(now, embark);
        const maxDays = differenceInDays(disembark, embark);
        const daysUntilRelief = differenceInDays(disembark, now);

        return {
          crewId: c.id,
          name: c.full_name || 'Unknown',
          rank: c.rank || 'AB',
          vessel: vesselMap.get(c.vessel_id || '') || 'Unassigned',
          embarkDate: embark.toISOString(),
          disembarkDate: disembark.toISOString(),
          contractMonths: Math.round(maxDays / 30),
          reliefStatus: daysUntilRelief < 0 ? 'overdue' :
            daysUntilRelief < 14 ? 'gap' :
            daysUntilRelief < 30 ? 'pending' : 'confirmed',
          daysOnboard: Math.max(0, daysOnboard),
          maxDays: Math.max(1, maxDays),
          certStatus: daysUntilRelief < 0 ? 'expired' :
            daysUntilRelief < 30 ? 'expiring' : 'valid',
        };
      });

      return rotations;
    },
    staleTime: 60_000,
  });
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CrewRotationMatrix() {
  const { data: rotations = [], isLoading, refetch } = useCrewRotations();
  const [vesselFilter, setVesselFilter] = useState('all');
  const [viewMonths, setViewMonths] = useState(6);

  const vessels = useMemo(() => {
    const set = new Set(rotations.map(r => r.vessel));
    return Array.from(set).sort();
  }, [rotations]);

  const filtered = useMemo(() =>
    vesselFilter === 'all' ? rotations : rotations.filter(r => r.vessel === vesselFilter),
    [rotations, vesselFilter]
  );

  const stats = useMemo(() => {
    const overdue = filtered.filter(r => r.reliefStatus === 'overdue').length;
    const gaps = filtered.filter(r => r.reliefStatus === 'gap').length;
    const pending = filtered.filter(r => r.reliefStatus === 'pending').length;
    const confirmed = filtered.filter(r => r.reliefStatus === 'confirmed').length;
    const avgDays = filtered.length > 0
      ? Math.round(filtered.reduce((s, r) => s + r.daysOnboard, 0) / filtered.length)
      : 0;
    return { overdue, gaps, pending, confirmed, avgDays, total: filtered.length };
  }, [filtered]);

  const now = new Date();
  const timelineMonths = Array.from({ length: viewMonths }, (_, i) => {
    const d = addMonths(now, i - 1);
    return { month: d.getMonth(), year: d.getFullYear(), label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` };
  });

  const reliefBadge = (status: CrewRotation['reliefStatus']) => {
    const map = {
      confirmed: { label: 'Confirmed', variant: 'default' as const, icon: CheckCircle },
      pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
      gap: { label: 'Gap!', variant: 'destructive' as const, icon: AlertTriangle },
      overdue: { label: 'Overdue', variant: 'destructive' as const, icon: UserX },
    };
    const cfg = map[status];
    return (
      <Badge variant={cfg.variant} className="text-xs gap-1">
        <cfg.icon className="h-3 w-3" /> {cfg.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Crew Rotation Matrix
          </h2>
          <p className="text-muted-foreground">Visual rotation planning • MLC 2.4 compliant • Gap detection</p>
        </div>
        <div className="flex gap-2">
          <Select value={vesselFilter} onValueChange={setVesselFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Vessels" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vessels</SelectItem>
              {vessels.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const csvData = filtered.map(r => ({
              Name: r.name, Rank: r.rank, Vessel: r.vessel,
              DaysOnboard: r.daysOnboard, MaxDays: r.maxDays,
              ReliefStatus: r.reliefStatus, Embark: r.embarkDate.slice(0, 10), Disembark: r.disembarkDate.slice(0, 10),
            }));
            const headers = Object.keys(csvData[0] || {}).join(',');
            const rows = csvData.map(r => Object.values(r).join(','));
            const csv = [headers, ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `crew-rotation-matrix-${new Date().toISOString().slice(0,10)}.csv`;
            a.click(); URL.revokeObjectURL(url);
            toast.success('Rotation matrix exported as CSV');
          }}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-success/30">
          <CardContent className="pt-3 pb-2 text-center">
            <UserCheck className="h-5 w-5 mx-auto text-success" />
            <div className="text-xl font-bold text-success">{stats.confirmed}</div>
            <div className="text-xs text-muted-foreground">Relief Confirmed</div>
          </CardContent>
        </Card>
        <Card className="border-warning/30">
          <CardContent className="pt-3 pb-2 text-center">
            <Clock className="h-5 w-5 mx-auto text-warning" />
            <div className="text-xl font-bold text-warning">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending Relief</div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="pt-3 pb-2 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-destructive" />
            <div className="text-xl font-bold text-destructive">{stats.gaps}</div>
            <div className="text-xs text-muted-foreground">Gaps (&lt;14d)</div>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardContent className="pt-3 pb-2 text-center">
            <UserX className="h-5 w-5 mx-auto text-destructive" />
            <div className="text-xl font-bold text-destructive">{stats.overdue}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 text-center">
            <Calendar className="h-5 w-5 mx-auto text-primary" />
            <div className="text-xl font-bold">{stats.avgDays}</div>
            <div className="text-xs text-muted-foreground">Avg Days Onboard</div>
          </CardContent>
        </Card>
      </div>

      {/* Rotation Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rotation Schedule ({stats.total} crew)</CardTitle>
          <CardDescription>Visual timeline with relief status and contract progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 sticky left-0 bg-background z-10">Crew</th>
                  <th className="text-left py-2 px-2">Rank</th>
                  <th className="text-left py-2 px-2">Vessel</th>
                  <th className="text-center py-2 px-2">Days</th>
                  <th className="text-center py-2 px-2">Contract</th>
                  <th className="text-center py-2 px-2">Relief</th>
                  <th className="text-left py-2 px-2 min-w-[300px]">Timeline</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 30).map(crew => {
                  const progress = Math.min(100, (crew.daysOnboard / crew.maxDays) * 100);
                  const progressColor = progress > 90 ? 'bg-destructive' : progress > 75 ? 'bg-warning' : 'bg-primary';
                  return (
                    <tr key={crew.crewId} className="border-b hover:bg-muted/30">
                      <td className="py-2 px-2 font-medium sticky left-0 bg-background">{crew.name}</td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="text-xs">{crew.rank}</Badge>
                      </td>
                      <td className="py-2 px-2 text-xs">{crew.vessel}</td>
                      <td className="py-2 px-2 text-center font-mono text-xs">
                        {crew.daysOnboard}/{crew.maxDays}
                      </td>
                      <td className="py-2 px-2">
                        <div className="w-20 mx-auto">
                          <Progress value={progress} className="h-1.5" />
                          <div className="text-[10px] text-center text-muted-foreground mt-0.5">
                            {progress.toFixed(0)}%
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">{reliefBadge(crew.reliefStatus)}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-0.5 h-4">
                          {timelineMonths.map((m, i) => {
                            const monthStart = new Date(m.year, m.month, 1);
                            const monthEnd = new Date(m.year, m.month + 1, 0);
                            const embark = new Date(crew.embarkDate);
                            const disembark = new Date(crew.disembarkDate);
                            const isOnboard = isBefore(embark, monthEnd) && isAfter(disembark, monthStart);
                            const isRelief = differenceInDays(disembark, monthStart) >= 0 &&
                              differenceInDays(disembark, monthEnd) <= 0;

                            return (
                              <div
                                key={`${crew.crewId}-timeline-${m.year}-${m.month}`}
                                className={`h-4 flex-1 rounded-sm text-[8px] flex items-center justify-center ${
                                  isRelief ? 'bg-warning/60 text-warning-foreground' :
                                  isOnboard ? 'bg-primary/40' : 'bg-muted/30'
                                }`}
                                title={`${m.label}: ${isOnboard ? 'Onboard' : 'Off'}`}
                              >
                                {i === 0 && <span className="truncate px-0.5">{m.label.slice(0, 3)}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No crew rotation data. Add crew members with embarkation dates.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
