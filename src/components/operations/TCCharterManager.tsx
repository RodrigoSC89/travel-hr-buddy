/**
 * Time Charter Manager - vs Veson IMOS
 * TC-In / TC-Out management with hire calculations
 * REAL DATA from Supabase time_charters table
 */
import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  TrendingUp, AlertTriangle, CheckCircle2, Anchor 
} from "lucide-react";
import { toast } from "sonner";
import { quickExport } from "@/lib/export-utils";
import { useAuth } from "@/contexts/AuthContext";

function useTimeCharters() {
  return useQuery({
    queryKey: ["time-charters"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("time_charters")
        .select("*, vessels(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
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

  // Form state
  const [form, setForm] = useState({
    type: "tc-in", cpForm: "NYPE 2015", hireRate: "", commission: "",
    counterparty: "", commencement: "", redelivery: "", period: "",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from as Function)("time_charters").insert({
        charter_id: `TC-${form.type === "tc-in" ? "IN" : "OUT"}-${Date.now().toString(36).toUpperCase()}`,
        type: form.type,
        counterparty: form.counterparty || "TBD",
        hire_rate: Number(form.hireRate) || 0,
        currency: "USD/day",
        period: form.period || null,
        commencement_date: form.commencement || new Date().toISOString().split("T")[0],
        redelivery_date: form.redelivery || null,
        cp_form: form.cpForm,
        address_commission: form.commission ? `${form.commission}%` : null,
        status: "pending",
        created_by: user?.id,
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

  if (isLoading) {
    return <div className="space-y-4 p-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  return (
    <motion.div className="space-y-6 p-4 md:p-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Anchor className="h-7 w-7 text-primary" />
            Time Charter Management
          </h1>
          <p className="text-muted-foreground">TC-In / TC-Out • Hire statements • Off-hire tracking • NYPE / SHELLTIME</p>
        </div>
        <Dialog open={showNewCharter} onOpenChange={setShowNewCharter}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Charter</Button>
          </DialogTrigger>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><Ship className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{activeCharters.length}</p><p className="text-xs text-muted-foreground">Active Charters</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-2xl font-bold">${totalDailyHire.toLocaleString()}</p><p className="text-xs text-muted-foreground">Daily Hire Rate</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">${(totalEarned / 1000).toFixed(0)}K</p><p className="text-xs text-muted-foreground">Total Hire Earned</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-2xl font-bold">{totalOffHire}</p><p className="text-xs text-muted-foreground">Off-Hire Days</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" /><p className="text-2xl font-bold">{charters.filter((c: any) => c.status === "pending").length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Charters</TabsTrigger>
          <TabsTrigger value="hire-statement">Hire Statement</TabsTrigger>
          <TabsTrigger value="off-hire">Off-Hire Log</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="tc-in">TC-In</SelectItem><SelectItem value="tc-out">TC-Out</SelectItem></SelectContent></Select>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Charter ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead>CP Form</TableHead>
                  <TableHead>Hire Rate</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Off-Hire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum charter encontrado. Clique em "New Charter" para criar.</TableCell></TableRow>
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
                <p className="text-center py-8 text-muted-foreground">Nenhum charter ativo para gerar statement.</p>
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
                            {commPct > 0 && <TableRow><TableCell>Less: Commission ({commPct}%)</TableCell><TableCell /><TableCell /><TableCell className="text-right text-destructive">-${commDeduction.toLocaleString()}</TableCell></TableRow>}
                            <TableRow className="border-t-2"><TableCell className="font-bold">Net Hire Due</TableCell><TableCell /><TableCell /><TableCell className="text-right font-bold text-lg">${netHire.toLocaleString()}</TableCell></TableRow>
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
          <Card>
            <Table>
              <TableHeader><TableRow><TableHead>Charter</TableHead><TableHead>Off-Hire Days</TableHead><TableHead>Deduction</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {charters.filter((c: any) => Number(c.off_hire_days) > 0).length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum off-hire registrado</TableCell></TableRow>
                ) : charters.filter((c: any) => Number(c.off_hire_days) > 0).map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.charter_id}</TableCell>
                    <TableCell>{c.off_hire_days} days</TableCell>
                    <TableCell className="text-destructive font-medium">-${(Number(c.off_hire_days) * Number(c.hire_rate)).toLocaleString()}</TableCell>
                    <TableCell><Badge>Recorded</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Charter Revenue by Vessel (YTD)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {charters.filter((c: any) => Number(c.total_hire_earned) > 0).map((c: any) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between text-sm"><span>{c.vessels?.name || c.charter_id}</span><span className="font-medium">${(Number(c.total_hire_earned) / 1000).toFixed(0)}K</span></div>
                    <Progress value={totalEarned > 0 ? (Number(c.total_hire_earned) / totalEarned) * 100 : 0} className="h-2" />
                  </div>
                ))}
                {charters.filter((c: any) => Number(c.total_hire_earned) > 0).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Sem dados de receita ainda</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Utilization Rate</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {activeCharters.map((c: any) => {
                  const days = Math.ceil((Date.now() - new Date(c.commencement_date).getTime()) / 86400000);
                  const util = days > 0 ? Math.round(((days - Number(c.off_hire_days)) / days) * 100) : 100;
                  return (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div><p className="font-medium text-sm">{c.vessels?.name || c.charter_id}</p><p className="text-xs text-muted-foreground">{c.off_hire_days} off-hire days</p></div>
                      <div className="text-right"><p className="text-xl font-bold">{util}%</p><p className="text-xs text-muted-foreground">utilization</p></div>
                    </div>
                  );
                })}
                {activeCharters.length === 0 && <p className="text-center text-muted-foreground py-4">Sem charters ativos</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default TCCharterManager;
