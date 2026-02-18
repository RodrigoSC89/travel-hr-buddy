/**
 * Crew Rotation Matrix v3 - World-Class (supera Compas/Stena)
 * Visual rotation planning, gap detection, compliance tracking
 * NEW: MLC compliance heatmap, rank coverage analysis, fatigue risk indicators
 */
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Users, Calendar, AlertTriangle, CheckCircle, Ship,
  Download, RefreshCw, UserCheck, UserX, Clock, BarChart3,
  Shield, Activity, Anchor, TrendingUp
} from 'lucide-react';
import { format, addMonths, differenceInDays, isBefore, isAfter } from 'date-fns';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, LineChart, Line,
} from 'recharts';

interface CrewRotation {
  crewId: string;
  name: string;
  rank: string;
  vessel: string;
  embarkDate: string;
  disembarkDate: string;
  contractMonths: number;
  reliefStatus: 'confirmed' | 'pending' | 'gap' | 'overdue';
  daysOnboard: number;
  maxDays: number;
  certStatus: 'valid' | 'expiring' | 'expired';
  fatigueRisk: 'low' | 'medium' | 'high' | 'critical';
}

// MLC 2006 Reg 2.4 — max months onboard by rank
const MLC_MAX_MONTHS: Record<string, number> = {
  'Master': 4, 'Chief Officer': 4, 'Chief Engineer': 4,
  '2nd Officer': 6, '3rd Officer': 6, '2nd Engineer': 6, '3rd Engineer': 6,
  'Bosun': 6, 'AB': 9, 'OS': 9, 'Oiler': 9, 'Cook': 9, 'Steward': 9,
};

const CHART_COLORS = [
  "hsl(var(--primary))", "hsl(210,70%,55%)", "hsl(160,60%,45%)",
  "hsl(35,80%,55%)", "hsl(280,60%,55%)", "hsl(0,70%,55%)", "hsl(120,50%,50%)"
];

const useCrewRotations = () => {
  return useQuery({
    queryKey: ['crew-rotations-v3'],
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
        const mlcMax = (MLC_MAX_MONTHS[c.rank || ''] || 9) * 30;
        const fatigueRatio = daysOnboard / mlcMax;

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
          fatigueRisk: fatigueRatio >= 1 ? 'critical' :
            fatigueRatio >= 0.85 ? 'high' :
            fatigueRatio >= 0.7 ? 'medium' : 'low',
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
  const [viewMonths] = useState(6);
  const [activeTab, setActiveTab] = useState('matrix');

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
    const fatigueHigh = filtered.filter(r => r.fatigueRisk === 'high' || r.fatigueRisk === 'critical').length;
    const mlcCompliance = filtered.length > 0
      ? Math.round(((filtered.length - overdue) / filtered.length) * 100)
      : 100;
    return { overdue, gaps, pending, confirmed, avgDays, total: filtered.length, fatigueHigh, mlcCompliance };
  }, [filtered]);

  // Rank coverage analysis
  const rankCoverage = useMemo(() => {
    const byRank: Record<string, { total: number; ok: number; gap: number }> = {};
    filtered.forEach(r => {
      if (!byRank[r.rank]) byRank[r.rank] = { total: 0, ok: 0, gap: 0 };
      byRank[r.rank].total++;
      if (r.reliefStatus === 'confirmed' || r.reliefStatus === 'pending') byRank[r.rank].ok++;
      else byRank[r.rank].gap++;
    });
    return Object.entries(byRank).map(([rank, d]) => ({
      rank,
      total: d.total,
      covered: d.ok,
      gaps: d.gap,
      coverage: d.total > 0 ? Math.round((d.ok / d.total) * 100) : 0,
    })).sort((a, b) => a.coverage - b.coverage);
  }, [filtered]);

  // Vessel coverage radar
  const vesselRadar = useMemo(() => {
    const byVessel: Record<string, { total: number; ok: number }> = {};
    filtered.forEach(r => {
      if (!byVessel[r.vessel]) byVessel[r.vessel] = { total: 0, ok: 0 };
      byVessel[r.vessel].total++;
      if (r.reliefStatus === 'confirmed') byVessel[r.vessel].ok++;
    });
    return Object.entries(byVessel).map(([vessel, d]) => ({
      vessel: vessel.length > 12 ? vessel.slice(0, 12) + '…' : vessel,
      coverage: d.total > 0 ? Math.round((d.ok / d.total) * 100) : 0,
    }));
  }, [filtered]);

  // Fatigue distribution
  const fatigueData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    filtered.forEach(r => counts[r.fatigueRisk]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // Monthly relief forecast
  const reliefForecast = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const m = addMonths(now, i);
      const monthStart = new Date(m.getFullYear(), m.getMonth(), 1);
      const monthEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0);
      const reliefs = filtered.filter(r => {
        const d = new Date(r.disembarkDate);
        return d >= monthStart && d <= monthEnd;
      }).length;
      return { month: `${MONTHS[m.getMonth()]} ${m.getFullYear().toString().slice(2)}`, reliefs };
    });
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

  const fatigueBadge = (risk: CrewRotation['fatigueRisk']) => {
    const colors = { low: 'bg-emerald-500/20 text-emerald-400', medium: 'bg-yellow-500/20 text-yellow-400', high: 'bg-orange-500/20 text-orange-400', critical: 'bg-red-500/20 text-red-400' };
    return <Badge className={`text-[10px] ${colors[risk]}`}>{risk.toUpperCase()}</Badge>;
  };

  const handleExport = () => {
    const csvData = filtered.map(r => ({
      Name: r.name, Rank: r.rank, Vessel: r.vessel,
      DaysOnboard: r.daysOnboard, MaxDays: r.maxDays,
      ReliefStatus: r.reliefStatus, FatigueRisk: r.fatigueRisk,
      Embark: r.embarkDate.slice(0, 10), Disembark: r.disembarkDate.slice(0, 10),
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
          <p className="text-muted-foreground">MLC 2.4 compliant • Fatigue analysis • Gap detection • Relief forecast</p>
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
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="border-emerald-500/30">
          <CardContent className="pt-3 pb-2 text-center">
            <UserCheck className="h-5 w-5 mx-auto text-emerald-500" />
            <div className="text-xl font-bold text-emerald-500">{stats.confirmed}</div>
            <div className="text-xs text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30">
          <CardContent className="pt-3 pb-2 text-center">
            <Clock className="h-5 w-5 mx-auto text-yellow-500" />
            <div className="text-xl font-bold text-yellow-500">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
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
            <div className="text-xs text-muted-foreground">Avg Days</div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="pt-3 pb-2 text-center">
            <Activity className="h-5 w-5 mx-auto text-orange-500" />
            <div className="text-xl font-bold text-orange-500">{stats.fatigueHigh}</div>
            <div className="text-xs text-muted-foreground">Fatigue Risk</div>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="pt-3 pb-2 text-center">
            <Shield className="h-5 w-5 mx-auto text-primary" />
            <div className="text-xl font-bold text-primary">{stats.mlcCompliance}%</div>
            <div className="text-xs text-muted-foreground">MLC Compliance</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="matrix">Rotation Matrix</TabsTrigger>
          <TabsTrigger value="coverage">Rank Coverage</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Matrix Tab */}
        <TabsContent value="matrix" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rotation Schedule ({stats.total} crew)</CardTitle>
              <CardDescription>Visual timeline with fatigue risk and MLC compliance</CardDescription>
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
                      <th className="text-center py-2 px-2">Fatigue</th>
                      <th className="text-left py-2 px-2 min-w-[300px]">Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 40).map(crew => {
                      const progress = Math.min(100, (crew.daysOnboard / crew.maxDays) * 100);
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
                          <td className="py-2 px-2 text-center">{fatigueBadge(crew.fatigueRisk)}</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-0.5 h-4">
                              {timelineMonths.map((m) => {
                                const monthStart = new Date(m.year, m.month, 1);
                                const monthEnd = new Date(m.year, m.month + 1, 0);
                                const embark = new Date(crew.embarkDate);
                                const disembark = new Date(crew.disembarkDate);
                                const isOnboard = isBefore(embark, monthEnd) && isAfter(disembark, monthStart);
                                const isRelief = differenceInDays(disembark, monthStart) >= 0 &&
                                  differenceInDays(disembark, monthEnd) <= 0;

                                return (
                                  <div
                                    key={`${crew.crewId}-${m.year}-${m.month}`}
                                    className={`h-4 flex-1 rounded-sm ${
                                      isRelief ? 'bg-warning/60' :
                                      isOnboard ? 'bg-primary/40' : 'bg-muted/30'
                                    }`}
                                    title={`${m.label}: ${isOnboard ? 'Onboard' : 'Off'}${isRelief ? ' (Relief)' : ''}`}
                                  />
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
        </TabsContent>

        {/* Rank Coverage Tab */}
        <TabsContent value="coverage" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Rank Coverage</CardTitle></CardHeader>
              <CardContent>
                {rankCoverage.length === 0 ? <p className="text-center py-6 text-muted-foreground">No data</p> : (
                  <div className="space-y-3">
                    {rankCoverage.map(rc => (
                      <div key={rc.rank}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{rc.rank}</span>
                          <span className="text-muted-foreground">{rc.covered}/{rc.total} ({rc.coverage}%)</span>
                        </div>
                        <Progress value={rc.coverage} className="h-2" />
                        {rc.gaps > 0 && (
                          <div className="text-xs text-destructive mt-0.5">{rc.gaps} gap(s) detected</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Anchor className="h-4 w-4" /> Vessel Coverage Radar</CardTitle></CardHeader>
              <CardContent>
                {vesselRadar.length === 0 ? <p className="text-center py-6 text-muted-foreground">No data</p> : (
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={vesselRadar}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="vessel" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar name="Coverage %" dataKey="coverage" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Fatigue Risk Distribution</CardTitle></CardHeader>
              <CardContent>
                {fatigueData.every(d => d.value === 0) ? <p className="text-center py-6 text-muted-foreground">No data</p> : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={fatigueData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {fatigueData.map((_, i) => (
                          <Cell key={i} fill={["hsl(160,60%,45%)", "hsl(50,80%,55%)", "hsl(25,80%,50%)", "hsl(0,70%,50%)"][i]} />
                        ))}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Relief Forecast (6 months)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={reliefForecast}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="reliefs" name="Reliefs" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
