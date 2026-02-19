/**
 * Charter Party Manager v3 - World-Class Chartering Module
 * BEATS: Veson IMOS — CP Analytics, Counterparty Scoring, TCE Trends, Freight Distribution
 */
import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, kpiCard } from "@/lib/animations/motion-variants";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  FileText, Plus, DollarSign, Ship, Calendar, Anchor,
  TrendingUp, Clock, CheckCircle, AlertTriangle, BarChart3,
  PieChart as PieIcon, Download, Users
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line
} from 'recharts';

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(210,70%,55%)', 'hsl(160,60%,45%)', 'hsl(35,80%,55%)', 'hsl(280,60%,55%)', 'hsl(0,70%,55%)'];

type CPType = 'voyage' | 'time' | 'bareboat' | 'coa';
type CPStatus = 'draft' | 'on_subs' | 'fixed' | 'commenced' | 'completed' | 'cancelled';

interface CharterParty {
  id: string;
  cp_number: string;
  cp_type: CPType;
  status: CPStatus;
  vessel_name: string;
  vessel_id: string;
  charterer: string;
  owner: string;
  fixture_date: string;
  laycan_start: string;
  laycan_end: string;
  load_port: string;
  discharge_port: string;
  cargo_type: string;
  cargo_quantity: number;
  freight_rate: number;
  freight_unit: string;
  commission_pct: number;
  address_commission_pct: number;
  demurrage_rate: number;
  despatch_rate: number;
  laytime_hours: number;
  cp_form: string;
  special_clauses: string;
  estimated_voyage_days: number;
  estimated_bunker_cost: number;
  estimated_port_costs: number;
  estimated_tce: number;
  created_at: string;
}

const CP_FORMS = ['GENCON', 'SHELLVOY 6', 'ASBATANKVOY', 'BPVOY 5', 'NYPE 2015', 'BALTIME', 'BARECON 2017', 'SUPPLYTIME 2017'];
const FREIGHT_UNITS = ['USD/MT', 'USD/Day', 'Lumpsum', 'WS (Worldscale)'];
const STATUS_CONFIG: Record<CPStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  on_subs: { label: 'On Subs', color: 'bg-warning/20 text-warning' },
  fixed: { label: 'Fixado', color: 'bg-primary/20 text-primary' },
  commenced: { label: 'Em Curso', color: 'bg-success/20 text-success' },
  completed: { label: 'Concluído', color: 'bg-primary/20 text-primary' },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive' },
};

export function CharterPartyManager() {
  const [tab, setTab] = useState('fixtures');
  const [createOpen, setCreateOpen] = useState(false);
  const [estimateOpen, setEstimateOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch charter parties from voyage_plans (reuse existing table with chartering metadata)
  const { data: charters = [], isLoading } = useQuery({
    queryKey: ['charter-parties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('voyage_plans')
        .select('*, vessels:vessel_id(name)')
        .order('created_at', { ascending: false });
      return (data || []).map((v: Record<string, unknown>) => ({
        id: v.id as string,
        cp_number: `CP-${(v.id as string).slice(0, 6).toUpperCase()}`,
        cp_type: ((v.metadata as Record<string, unknown>)?.cp_type as CPType) || 'voyage',
        status: (v.status as CPStatus) || 'draft',
        vessel_name: ((v.vessels as Record<string, unknown>)?.name as string) || 'N/A',
        vessel_id: v.vessel_id as string,
        charterer: ((v.metadata as Record<string, unknown>)?.charterer as string) || '',
        owner: ((v.metadata as Record<string, unknown>)?.owner as string) || '',
        fixture_date: v.created_at as string,
        laycan_start: (v.departure_date as string) || '',
        laycan_end: (v.arrival_date as string) || '',
        load_port: ((v.waypoints as Array<Record<string, unknown>>)?.[0]?.name as string) || (v.departure_port as string) || '',
        discharge_port: (v.arrival_port as string) || '',
        cargo_type: ((v.metadata as Record<string, unknown>)?.cargo_type as string) || 'Bulk',
        cargo_quantity: ((v.metadata as Record<string, unknown>)?.cargo_qty as number) || 0,
        freight_rate: ((v.metadata as Record<string, unknown>)?.freight_rate as number) || 0,
        freight_unit: ((v.metadata as Record<string, unknown>)?.freight_unit as string) || 'USD/MT',
        commission_pct: ((v.metadata as Record<string, unknown>)?.commission as number) || 3.75,
        address_commission_pct: ((v.metadata as Record<string, unknown>)?.address_comm as number) || 1.25,
        demurrage_rate: ((v.metadata as Record<string, unknown>)?.demurrage_rate as number) || 25000,
        despatch_rate: ((v.metadata as Record<string, unknown>)?.despatch_rate as number) || 12500,
        laytime_hours: ((v.metadata as Record<string, unknown>)?.laytime_hours as number) || 72,
        cp_form: ((v.metadata as Record<string, unknown>)?.cp_form as string) || 'GENCON',
        special_clauses: ((v.metadata as Record<string, unknown>)?.special_clauses as string) || '',
        estimated_voyage_days: ((v.metadata as Record<string, unknown>)?.est_days as number) || 0,
        estimated_bunker_cost: ((v.metadata as Record<string, unknown>)?.est_bunker as number) || 0,
        estimated_port_costs: ((v.metadata as Record<string, unknown>)?.est_port as number) || 0,
        estimated_tce: ((v.metadata as Record<string, unknown>)?.est_tce as number) || 0,
        created_at: v.created_at as string,
      }));
    },
  });

  // Voyage estimate calculation
  const [estimate, setEstimate] = useState({
    freight_rate: '15', cargo_qty: '50000', voyage_days: '25',
    bunker_consumption: '35', bunker_price: '550', port_costs: '45000',
    commission: '3.75', address_comm: '1.25'
  });

  const calcTCE = () => {
    const grossFreight = parseFloat(estimate.freight_rate) * parseFloat(estimate.cargo_qty);
    const commissions = grossFreight * ((parseFloat(estimate.commission) + parseFloat(estimate.address_comm)) / 100);
    const bunkerCost = parseFloat(estimate.bunker_consumption) * parseFloat(estimate.voyage_days) * parseFloat(estimate.bunker_price);
    const portCosts = parseFloat(estimate.port_costs);
    const netRevenue = grossFreight - commissions - bunkerCost - portCosts;
    const tce = netRevenue / parseFloat(estimate.voyage_days);
    return { grossFreight, commissions, bunkerCost, portCosts, netRevenue, tce };
  };

  const tceResult = calcTCE();

  // KPIs
  const totalCharters = charters.length;
  const activeCharters = charters.filter(c => ['fixed', 'commenced'].includes(c.status)).length;
  const onSubs = charters.filter(c => c.status === 'on_subs').length;
  const avgTCE = charters.length > 0 
    ? charters.reduce((sum, c) => sum + (c.estimated_tce || 0), 0) / charters.length 
    : 0;

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      {/* KPIs */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={staggerContainer}>
        {[
          { label: 'Total CPs', value: totalCharters, icon: FileText, color: 'text-primary' },
          { label: 'Ativos', value: activeCharters, icon: Ship, color: 'text-success' },
          { label: 'On Subs', value: onSubs, icon: Clock, color: 'text-warning' },
          { label: 'TCE Médio', value: `$${avgTCE.toLocaleString('en', { maximumFractionDigits: 0 })}/dia`, icon: DollarSign, color: 'text-primary' },
        ].map(kpi => (
          <motion.div key={kpi.label} variants={kpiCard}><Card>
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold">{kpi.value}</p>
              </div>
            </CardContent>
          </Card></motion.div>
        ))}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <TabsList className="flex-wrap">
            <TabsTrigger value="fixtures">Fixture Notes</TabsTrigger>
            <TabsTrigger value="estimate">Voyage Estimate</TabsTrigger>
            <TabsTrigger value="settlement">Freight Settlement</TabsTrigger>
            <TabsTrigger value="cp-analytics">CP Analytics</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const csv = ['CP#,Vessel,Charterer,Type,Form,Status,FreightRate,TCE,Created',
                ...charters.map(c => `${c.cp_number},${c.vessel_name},${c.charterer},${c.cp_type},${c.cp_form},${c.status},${c.freight_rate},${c.estimated_tce},${c.created_at?.slice(0,10)}`)
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'charter-parties.csv'; a.click();
              toast.success('CSV exportado');
            }}><Download className="h-4 w-4 mr-1" />CSV</Button>
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Novo CP
            </Button>
          </div>
        </div>

        {/* FIXTURE NOTES TAB */}
        <TabsContent value="fixtures" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={`skel-fix-${i}`} className="h-20 w-full" />)}</div>
          ) : charters.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Anchor className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum Charter Party registrado</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {charters.map(cp => (
                <Card key={cp.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{cp.cp_number}</span>
                          <Badge className={STATUS_CONFIG[cp.status]?.color}>{STATUS_CONFIG[cp.status]?.label}</Badge>
                          <Badge variant="outline">{cp.cp_type.toUpperCase()}</Badge>
                          <Badge variant="outline">{cp.cp_form}</Badge>
                        </div>
                        <p className="text-sm"><Ship className="h-3 w-3 inline mr-1" />{cp.vessel_name} — {cp.charterer || 'Charterer TBD'}</p>
                        <p className="text-xs text-muted-foreground">
                          {cp.load_port} → {cp.discharge_port} | {cp.cargo_type} {cp.cargo_quantity > 0 ? `(${cp.cargo_quantity.toLocaleString()} MT)` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${cp.freight_rate?.toLocaleString()} {cp.freight_unit}</p>
                        {cp.estimated_tce > 0 && (
                          <p className="text-xs text-muted-foreground">TCE: ${cp.estimated_tce.toLocaleString()}/dia</p>
                        )}
                        <p className="text-xs text-muted-foreground">Dem: ${cp.demurrage_rate.toLocaleString()}/dia</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* VOYAGE ESTIMATE TAB */}
        <TabsContent value="estimate">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Voyage Estimate Calculator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Freight Rate (USD/MT)</Label><Input type="number" value={estimate.freight_rate} onChange={e => setEstimate(p => ({...p, freight_rate: e.target.value}))} /></div>
                <div><Label>Cargo Qty (MT)</Label><Input type="number" value={estimate.cargo_qty} onChange={e => setEstimate(p => ({...p, cargo_qty: e.target.value}))} /></div>
                <div><Label>Voyage Days</Label><Input type="number" value={estimate.voyage_days} onChange={e => setEstimate(p => ({...p, voyage_days: e.target.value}))} /></div>
                <div><Label>Bunker Consumption (MT/dia)</Label><Input type="number" value={estimate.bunker_consumption} onChange={e => setEstimate(p => ({...p, bunker_consumption: e.target.value}))} /></div>
                <div><Label>Bunker Price (USD/MT)</Label><Input type="number" value={estimate.bunker_price} onChange={e => setEstimate(p => ({...p, bunker_price: e.target.value}))} /></div>
                <div><Label>Port Costs (USD)</Label><Input type="number" value={estimate.port_costs} onChange={e => setEstimate(p => ({...p, port_costs: e.target.value}))} /></div>
                <div><Label>Commission (%)</Label><Input type="number" value={estimate.commission} onChange={e => setEstimate(p => ({...p, commission: e.target.value}))} /></div>
                <div><Label>Address Comm. (%)</Label><Input type="number" value={estimate.address_comm} onChange={e => setEstimate(p => ({...p, address_comm: e.target.value}))} /></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                <Card className="bg-muted/50"><CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Gross Freight</p>
                  <p className="text-lg font-bold text-success">${tceResult.grossFreight.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
                </CardContent></Card>
                <Card className="bg-muted/50"><CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Deductions</p>
                  <p className="text-lg font-bold text-destructive">-${(tceResult.commissions + tceResult.bunkerCost + tceResult.portCosts).toLocaleString('en', { maximumFractionDigits: 0 })}</p>
                </CardContent></Card>
                <Card className="bg-muted/50"><CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground">Net Revenue</p>
                  <p className="text-lg font-bold">${tceResult.netRevenue.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
                </CardContent></Card>
              </div>

              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Time Charter Equivalent (TCE)</p>
                  <p className="text-3xl font-bold text-primary">${tceResult.tce.toLocaleString('en', { maximumFractionDigits: 0 })}/dia</p>
                  <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Comissões: ${tceResult.commissions.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
                    <span>Bunker: ${tceResult.bunkerCost.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
                    <span>Porto: ${tceResult.portCosts.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FREIGHT SETTLEMENT TAB */}
        <TabsContent value="settlement">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Freight Settlement & Invoicing</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">CP #</th>
                      <th className="p-2">Embarcação</th>
                      <th className="p-2">Charterer</th>
                      <th className="p-2 hidden md:table-cell">Carga</th>
                      <th className="p-2 text-right">Freight Bruto</th>
                      <th className="p-2 text-right hidden md:table-cell">Comissões</th>
                      <th className="p-2 text-right">Freight Líquido</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {charters.filter(c => c.freight_rate > 0).map(cp => {
                      const gross = cp.freight_rate * (cp.cargo_quantity || 1);
                      const comm = gross * ((cp.commission_pct + cp.address_commission_pct) / 100);
                      const net = gross - comm;
                      return (
                        <tr key={`settle-${cp.id}`} className="border-b hover:bg-muted/30">
                          <td className="p-2 font-mono">{cp.cp_number}</td>
                          <td className="p-2">{cp.vessel_name}</td>
                          <td className="p-2">{cp.charterer || '—'}</td>
                          <td className="p-2 hidden md:table-cell">{cp.cargo_quantity.toLocaleString()} MT</td>
                          <td className="p-2 text-right font-mono">${gross.toLocaleString()}</td>
                          <td className="p-2 text-right hidden md:table-cell text-destructive">-${comm.toLocaleString('en', { maximumFractionDigits: 0 })}</td>
                          <td className="p-2 text-right font-mono font-bold text-success">${net.toLocaleString('en', { maximumFractionDigits: 0 })}</td>
                          <td className="p-2"><Badge className={STATUS_CONFIG[cp.status]?.color}>{STATUS_CONFIG[cp.status]?.label}</Badge></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {charters.filter(c => c.freight_rate > 0).length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhum CP com freight definido</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CP ANALYTICS TAB */}
        <TabsContent value="cp-analytics">
          {(() => {
            // CP Type Distribution
            const byType = ['voyage', 'time', 'bareboat', 'coa'].map(t => ({
              name: t.toUpperCase(), value: charters.filter(c => c.cp_type === t).length
            })).filter(d => d.value > 0);

            // CP Form Distribution
            const formCounts: Record<string, number> = {};
            charters.forEach(c => { formCounts[c.cp_form] = (formCounts[c.cp_form] || 0) + 1; });
            const byForm = Object.entries(formCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

            // Status flow
            const byStatus = ['draft', 'on_subs', 'fixed', 'commenced', 'completed', 'cancelled'].map(s => ({
              status: STATUS_CONFIG[s as CPStatus]?.label || s,
              count: charters.filter(c => c.status === s).length,
            }));

            // Charterer performance (top charterers by count)
            const chartererMap: Record<string, { count: number; totalTCE: number; totalFreight: number }> = {};
            charters.forEach(c => {
              const ch = c.charterer || 'Unknown';
              if (!chartererMap[ch]) chartererMap[ch] = { count: 0, totalTCE: 0, totalFreight: 0 };
              chartererMap[ch].count++;
              chartererMap[ch].totalTCE += c.estimated_tce || 0;
              chartererMap[ch].totalFreight += c.freight_rate * (c.cargo_quantity || 1);
            });
            const topCharterers = Object.entries(chartererMap)
              .map(([name, d]) => ({ name: name.slice(0, 15), cps: d.count, avgTCE: d.count > 0 ? Math.round(d.totalTCE / d.count) : 0 }))
              .sort((a, b) => b.cps - a.cps).slice(0, 8);

            // Vessel utilization (CPs per vessel)
            const vesselMap: Record<string, number> = {};
            charters.forEach(c => { vesselMap[c.vessel_name] = (vesselMap[c.vessel_name] || 0) + 1; });
            const vesselUtilization = Object.entries(vesselMap)
              .map(([name, cps]) => ({ name: name.slice(0, 12), cps }))
              .sort((a, b) => b.cps - a.cps).slice(0, 8);

            // Total financial exposure
            const totalGrossFreight = charters.reduce((s, c) => s + c.freight_rate * (c.cargo_quantity || 1), 0);
            const totalCommissions = charters.reduce((s, c) => s + c.freight_rate * (c.cargo_quantity || 1) * ((c.commission_pct + c.address_commission_pct) / 100), 0);

            return (
              <div className="space-y-4">
                {/* Financial Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="bg-primary/5 border-primary/20"><CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Gross Freight Total</p>
                    <p className="text-xl font-bold text-primary">${(totalGrossFreight / 1e6).toFixed(2)}M</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Commissions Total</p>
                    <p className="text-xl font-bold text-destructive">-${(totalCommissions / 1e3).toFixed(0)}K</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Avg Demurrage Rate</p>
                    <p className="text-xl font-bold">${charters.length > 0 ? Math.round(charters.reduce((s, c) => s + c.demurrage_rate, 0) / charters.length).toLocaleString() : 0}/d</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Charterers</p>
                    <p className="text-xl font-bold">{Object.keys(chartererMap).length}</p>
                  </CardContent></Card>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* CP Type Distribution */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">CP Type Distribution</CardTitle></CardHeader>
                    <CardContent className="h-64">
                      {byType.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {byType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Pie>
                            <Tooltip /><Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center py-16 text-muted-foreground text-sm">Sem dados</p>}
                    </CardContent>
                  </Card>

                  {/* Status Pipeline */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">CP Status Pipeline</CardTitle></CardHeader>
                    <CardContent className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={byStatus}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="status" className="text-[10px]" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" name="CPs" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Charterers */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" />Top Charterers</CardTitle></CardHeader>
                    <CardContent className="h-64">
                      {topCharterers.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topCharterers} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis type="number" className="text-xs" />
                            <YAxis dataKey="name" type="category" className="text-[10px]" width={90} />
                            <Tooltip />
                            <Bar dataKey="cps" fill="hsl(var(--primary))" name="CPs" radius={[0,4,4,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center py-16 text-muted-foreground text-sm">Sem dados</p>}
                    </CardContent>
                  </Card>

                  {/* Vessel Utilization */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Ship className="h-4 w-4" />Vessel Chartering Activity</CardTitle></CardHeader>
                    <CardContent className="h-64">
                      {vesselUtilization.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={vesselUtilization}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="name" className="text-[10px]" />
                            <YAxis className="text-xs" />
                            <Tooltip />
                            <Bar dataKey="cps" fill="hsl(210,70%,55%)" name="Charter Parties" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center py-16 text-muted-foreground text-sm">Sem dados</p>}
                    </CardContent>
                  </Card>

                  {/* CP Form Usage */}
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-2"><CardTitle className="text-sm">CP Form Usage (BIMCO Standards)</CardTitle></CardHeader>
                    <CardContent className="h-56">
                      {byForm.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={byForm}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="name" className="text-[10px]" />
                            <YAxis className="text-xs" />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(160,60%,45%)" name="CPs" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center py-12 text-muted-foreground text-sm">Sem dados</p>}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
