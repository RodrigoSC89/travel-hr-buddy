/**
 * Time Charter Manager v3 - vs Veson IMOS
 * TC-In / TC-Out management with hire calculations
 * V3: Hire Revenue Trend, Off-Hire Analytics, Fleet Utilization, Commission Tracking
 */
import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations/motion-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Ship, DollarSign, Calendar, Clock, FileText, Plus, 
  TrendingUp, AlertTriangle, CheckCircle2, Anchor, Download, BarChart3, Percent
} from "lucide-react";
import { toast } from "sonner";
import { quickExport } from "@/lib/export-utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))'];

function useTimeCharters() {
  return useQuery({
    queryKey: ["time-charters"],
    queryFn: async () => {
      const { data, error } = await fromUntyped("time_charters")
        .select("*, vessels(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Array<Record<string, unknown>>;
    },
  });
}

export function TCCharterManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: charters = [], isLoading } = useTimeCharters();
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewCharter, setShowNewCharter] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");

  const [form, setForm] = useState({
    type: "tc-in", cpForm: "NYPE 2015", hireRate: "", commission: "",
    counterparty: "", commencement: "", redelivery: "", period: "",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await fromUntyped("time_charters").insert({
        charter_id: `TC-${form.type === "tc-in" ? "IN" : "OUT"}-${Date.now().toString(36).toUpperCase()}`,
        type: form.type, counterparty: form.counterparty || "TBD",
        hire_rate: Number(form.hireRate) || 0, currency: "USD/day",
        period: form.period || null,
        commencement_date: form.commencement || new Date().toISOString().split("T")[0],
        redelivery_date: form.redelivery || null, cp_form: form.cpForm,
        address_commission: form.commission ? `${form.commission}%` : null,
        status: "pending", created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-charters"] });
      setShowNewCharter(false);
      setForm({ type: "tc-in", cpForm: "NYPE 2015", hireRate: "", commission: "", counterparty: "", commencement: "", redelivery: "", period: "" });
      toast.success("Charter created successfully");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const activeCharters = useMemo(() => charters.filter((c: any) => c.status === "active"), [charters]);
  const totalDailyHire = useMemo(() => activeCharters.reduce((s: number, c: any) => s + Number(c.hire_rate || 0), 0), [activeCharters]);
  const totalEarned = useMemo(() => charters.reduce((s: number, c: any) => s + Number(c.total_hire_earned || 0), 0), [charters]);
  const totalOffHire = useMemo(() => charters.reduce((s: number, c: any) => s + Number(c.off_hire_days || 0), 0), [charters]);

  const filtered = useMemo(() => 
    typeFilter === "all" ? charters : charters.filter((c: any) => c.type === typeFilter),
    [charters, typeFilter]
  );

  // V3 Analytics
  const v3Analytics = useMemo(() => {
    if (charters.length === 0) return null;
    
    // Total commission deductions
    const totalCommission = activeCharters.reduce((s: number, c: any) => {
      const days = Math.ceil((Date.now() - new Date(c.commencement_date).getTime()) / 86400000);
      const gross = days * Number(c.hire_rate || 0);
      const commPct = parseFloat(c.address_commission) || 0;
      return s + (gross * commPct / 100);
    }, 0);

    // TC-In vs TC-Out split
    const tcIn = charters.filter((c: any) => c.type === 'tc-in');
    const tcOut = charters.filter((c: any) => c.type === 'tc-out');
    const typeSplit = [
      { name: 'TC-In', value: tcIn.length, hire: tcIn.reduce((s: number, c: any) => s + Number(c.hire_rate || 0), 0) },
      { name: 'TC-Out', value: tcOut.length, hire: tcOut.reduce((s: number, c: any) => s + Number(c.hire_rate || 0), 0) },
    ].filter(d => d.value > 0);

    // Hire rate ranking
    const hireRanking = [...charters]
      .filter((c: any) => Number(c.hire_rate) > 0)
      .sort((a: any, b: any) => Number(b.hire_rate) - Number(a.hire_rate))
      .slice(0, 10)
      .map((c: any) => ({
        name: c.vessels?.name || c.charter_id,
        rate: Number(c.hire_rate),
        type: c.type,
        status: c.status,
      }));

    // Fleet utilization
    const totalCharterDays = activeCharters.reduce((s: number, c: any) => {
      return s + Math.ceil((Date.now() - new Date(c.commencement_date).getTime()) / 86400000);
    }, 0);
    const totalOnHireDays = totalCharterDays - totalOffHire;
    const fleetUtil = totalCharterDays > 0 ? Math.round((totalOnHireDays / totalCharterDays) * 100) : 100;

    // Off-hire cost impact
    const offHireCost = charters.reduce((s: number, c: any) => s + (Number(c.off_hire_days || 0) * Number(c.hire_rate || 0)), 0);

    // Monthly revenue projection
    const monthlyProjection = totalDailyHire * 30;
    const annualProjection = totalDailyHire * 365;

    return {
      totalCommission, typeSplit, hireRanking, fleetUtil,
      offHireCost, monthlyProjection, annualProjection,
      totalCharterDays, totalOnHireDays,
    };
  }, [charters, activeCharters, totalDailyHire, totalOffHire]);

  if (isLoading) {
    return <div className="space-y-4 p-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  return (
    <motion.div className="space-y-6 p-4 md:p-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Anchor className="h-7 w-7 text-primary" />
            Time Charter Management <Badge variant="outline" className="text-[10px]">v3</Badge>
          </h1>
          <p className="text-muted-foreground">TC-In / TC-Out • Hire statements • Off-hire • Revenue Analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => quickExport(charters, "Time-Charters")}><Download className="h-4 w-4 mr-1" />Export</Button>
          <Dialog open={showNewCharter} onOpenChange={setShowNewCharter}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Charter</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New Time Charter</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Type</Label><Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tc-in">TC-In</SelectItem><SelectItem value="tc-out">TC-Out</SelectItem></SelectContent></Select></div>
                  <div><Label>CP Form</Label><Select value={form.cpForm} onValueChange={v => setForm(p => ({ ...p, cpForm: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NYPE 2015">NYPE 2015</SelectItem><SelectItem value="SHELLTIME 4">SHELLTIME 4</SelectItem><SelectItem value="BALTIME">BALTIME</SelectItem><SelectItem value="GENTIME">GENTIME</SelectItem></SelectContent></Select></div>
                  <div><Label>Counterparty</Label><Input value={form.counterparty} onChange={e => setForm(p => ({ ...p, counterparty: e.target.value }))} placeholder="Company name" /></div>
                  <div><Label>Period</Label><Input value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder="12 months ± 30 days" /></div>
                  <div><Label>Hire Rate (USD/day)</Label><Input type="number" value={form.hireRate} onChange={e => setForm(p => ({ ...p, hireRate: e.target.value }))} placeholder="18500" /></div>
                  <div><Label>Commission %</Label><Input type="number" value={form.commission} onChange={e => setForm(p => ({ ...p, commission: e.target.value }))} placeholder="3.75" /></div>
                  <div><Label>Commencement</Label><Input type="date" value={form.commencement} onChange={e => setForm(p => ({ ...p, commencement: e.target.value }))} /></div>
                  <div><Label>Redelivery</Label><Input type="date" value={form.redelivery} onChange={e => setForm(p => ({ ...p, redelivery: e.target.value }))} /></div>
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Charter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <Card><CardContent className="p-3 text-center"><Ship className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-xl font-bold">{activeCharters.length}</p><p className="text-[10px] text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><DollarSign className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-xl font-bold">${totalDailyHire.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Daily Rate</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-xl font-bold">${(totalEarned / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Hire Earned</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-xl font-bold">{totalOffHire}</p><p className="text-[10px] text-muted-foreground">Off-Hire Days</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><BarChart3 className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-xl font-bold">{v3Analytics?.fleetUtil || 100}%</p><p className="text-[10px] text-muted-foreground">Utilization</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Percent className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-xl font-bold">${((v3Analytics?.totalCommission || 0) / 1000).toFixed(0)}K</p><p className="text-[10px] text-muted-foreground">Commission</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" /><p className="text-xl font-bold">${((v3Analytics?.monthlyProjection || 0) / 1e6).toFixed(2)}M</p><p className="text-[10px] text-muted-foreground">Monthly Proj.</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Charters</TabsTrigger>
          <TabsTrigger value="hire-statement">Hire Statement</TabsTrigger>
          <TabsTrigger value="off-hire">Off-Hire Log</TabsTrigger>
          <TabsTrigger value="analytics">Revenue Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="tc-in">TC-In</SelectItem><SelectItem value="tc-out">TC-Out</SelectItem></SelectContent></Select>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Charter ID</TableHead><TableHead>Type</TableHead><TableHead>Vessel</TableHead>
                  <TableHead>Counterparty</TableHead><TableHead>CP Form</TableHead><TableHead>Hire Rate</TableHead>
                  <TableHead>Period</TableHead><TableHead>Status</TableHead><TableHead>Off-Hire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum charter encontrado.</TableCell></TableRow>
                ) : filtered.map((charter: any) => (
                  <TableRow key={charter.id}>
                    <TableCell className="font-mono font-medium">{charter.charter_id}</TableCell>
                    <TableCell><Badge variant={charter.type === "tc-in" ? "default" : "secondary"}>{charter.type.toUpperCase()}</Badge></TableCell>
                    <TableCell>{charter.vessels?.name || "—"}</TableCell>
                    <TableCell>{charter.counterparty}</TableCell>
                    <TableCell className="text-xs">{charter.cp_form}</TableCell>
                    <TableCell className="font-medium">${Number(charter.hire_rate).toLocaleString()}/day</TableCell>
                    <TableCell className="text-xs">{charter.commencement_date} → {charter.redelivery_date || "TBD"}</TableCell>
                    <TableCell><Badge variant={charter.status === "active" ? "default" : "outline"}>{charter.status}</Badge></TableCell>
                    <TableCell>{Number(charter.off_hire_days) > 0 ? <span className="text-warning font-medium">{charter.off_hire_days}d</span> : <span className="text-success">0</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="hire-statement" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Hire Statement Generator</CardTitle></CardHeader>
            <CardContent>
              {activeCharters.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhum charter ativo.</p>
              ) : (
                <div className="space-y-4">
                  {activeCharters.map((c: any) => {
                    const days = Math.ceil((Date.now() - new Date(c.commencement_date).getTime()) / 86400000);
                    const grossHire = days * Number(c.hire_rate);
                    const offHireDeduction = Number(c.off_hire_days) * Number(c.hire_rate);
                    const commPct = parseFloat(c.address_commission) || 0;
                    const commDeduction = (grossHire - offHireDeduction) * (commPct / 100);
                    const netHire = grossHire - offHireDeduction - commDeduction;
                    return (
                      <div key={c.id} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{c.vessels?.name || c.charter_id}</h4>
                        <Table>
                          <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Days</TableHead><TableHead className="text-right">Rate</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                          <TableBody>
                            <TableRow><TableCell>Gross Hire</TableCell><TableCell className="text-right">{days}</TableCell><TableCell className="text-right">${Number(c.hire_rate).toLocaleString()}</TableCell><TableCell className="text-right font-medium">${grossHire.toLocaleString()}</TableCell></TableRow>
                            {Number(c.off_hire_days) > 0 && <TableRow><TableCell className="text-destructive">Less: Off-hire</TableCell><TableCell className="text-right text-destructive">-{c.off_hire_days}</TableCell><TableCell className="text-right">${Number(c.hire_rate).toLocaleString()}</TableCell><TableCell className="text-right text-destructive">-${offHireDeduction.toLocaleString()}</TableCell></TableRow>}
                            {commPct > 0 && <TableRow><TableCell>Less: Commission ({commPct}%)</TableCell><TableCell /><TableCell /><TableCell className="text-right text-destructive">-${Math.round(commDeduction).toLocaleString()}</TableCell></TableRow>}
                            <TableRow className="border-t-2"><TableCell className="font-bold">Net Hire Due</TableCell><TableCell /><TableCell /><TableCell className="text-right font-bold text-lg">${Math.round(netHire).toLocaleString()}</TableCell></TableRow>
                          </TableBody>
                        </Table>
                        <div className="mt-3 flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => quickExport([{ Item: "Gross Hire", Days: days, Rate: c.hire_rate, Amount: grossHire }, { Item: "Net Due", Days: "", Rate: "", Amount: netHire }], `Hire-Statement-${c.charter_id}`)}><FileText className="h-4 w-4 mr-2" />Export</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="off-hire" className="space-y-4">
          {/* Off-hire cost summary */}
          {v3Analytics && v3Analytics.offHireCost > 0 && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4 flex items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-warning" />
                <div>
                  <div className="font-bold text-lg text-warning">${v3Analytics.offHireCost.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total off-hire revenue loss across {totalOffHire} days</div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Charter</TableHead><TableHead>Vessel</TableHead><TableHead>Off-Hire Days</TableHead><TableHead>Daily Rate</TableHead><TableHead>Revenue Loss</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {charters.filter((c: any) => Number(c.off_hire_days) > 0).length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground"><CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />Nenhum off-hire registrado</TableCell></TableRow>
                ) : charters.filter((c: any) => Number(c.off_hire_days) > 0).map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.charter_id}</TableCell>
                    <TableCell>{c.vessels?.name || '—'}</TableCell>
                    <TableCell className="font-bold">{c.off_hire_days} days</TableCell>
                    <TableCell>${Number(c.hire_rate).toLocaleString()}/day</TableCell>
                    <TableCell className="text-destructive font-medium">-${(Number(c.off_hire_days) * Number(c.hire_rate)).toLocaleString()}</TableCell>
                    <TableCell><Badge>Recorded</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* V3: Revenue Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Hire Rate por Embarcação</CardTitle></CardHeader>
              <CardContent className="h-72">
                {v3Analytics?.hireRanking?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={v3Analytics.hireRanking} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis type="category" dataKey="name" className="text-xs" width={120} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}/day`} />
                      <Bar dataKey="rate" fill="hsl(var(--primary))" name="Hire Rate" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">TC-In vs TC-Out</CardTitle></CardHeader>
              <CardContent className="h-72">
                {v3Analytics?.typeSplit?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={v3Analytics.typeSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                        {v3Analytics.typeSplit.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Utilization & Revenue per Charter</CardTitle></CardHeader>
              <CardContent>
                {activeCharters.length > 0 ? (
                  <div className="space-y-3">
                    {activeCharters.map((c: any) => {
                      const days = Math.ceil((Date.now() - new Date(c.commencement_date).getTime()) / 86400000);
                      const util = days > 0 ? Math.round(((days - Number(c.off_hire_days || 0)) / days) * 100) : 100;
                      const revenue = days * Number(c.hire_rate || 0);
                      return (
                        <div key={c.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{c.vessels?.name || c.charter_id}</span>
                              <Badge variant={c.type === 'tc-in' ? 'default' : 'secondary'} className="text-[10px]">{c.type.toUpperCase()}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              ${Number(c.hire_rate).toLocaleString()}/day · {days} days · {c.off_hire_days || 0} off-hire
                            </div>
                          </div>
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1"><span>Utilization</span><span className="font-bold">{util}%</span></div>
                            <Progress value={util} className={`h-2 ${util < 90 ? '[&>div]:bg-warning' : ''}`} />
                          </div>
                          <div className="text-right w-24">
                            <div className="font-bold text-sm">${(revenue / 1e6).toFixed(2)}M</div>
                            <div className="text-[10px] text-muted-foreground">revenue</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-muted-foreground text-center py-8">Nenhum charter ativo</p>}
              </CardContent>
            </Card>
            {/* Revenue projection */}
            {v3Analytics && (
              <Card className="md:col-span-2 border-primary/20">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">${totalDailyHire.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Daily Revenue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">${(v3Analytics.monthlyProjection / 1e6).toFixed(2)}M</div>
                      <div className="text-xs text-muted-foreground">Monthly Projection</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">${(v3Analytics.annualProjection / 1e6).toFixed(1)}M</div>
                      <div className="text-xs text-muted-foreground">Annual Projection</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default TCCharterManager;
