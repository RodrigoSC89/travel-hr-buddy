/**
 * 🔧 WARRANTY CLAIMS TRACKER - World-Class (vs AMOS/TM Master)
 * Full CRUD with Supabase, export, filtering
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, DollarSign, Clock, CheckCircle, AlertTriangle, FileText,
  Plus, Download, Wrench, Search, RefreshCw, Trash2, Edit, TrendingUp, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", color: "bg-primary/20 text-primary" },
  under_review: { label: "Under Review", color: "bg-warning/20 text-warning" },
  approved: { label: "Approved", color: "bg-success/20 text-success" },
  partial: { label: "Partial Recovery", color: "bg-info/20 text-info" },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive" },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground" },
};

const CHART_COLORS = ["hsl(var(--primary))", "hsl(210,70%,55%)", "hsl(160,60%,45%)", "hsl(35,80%,55%)", "hsl(280,60%,55%)", "hsl(0,70%,55%)"];

export function WarrantyClaimsTracker() {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const emptyForm = {
    equipment: "", manufacturer: "", vessel_id: "", vessel_name: "",
    failure_description: "", failure_date: "", claim_date: new Date().toISOString().split("T")[0],
    warranty_expiry: "", claim_amount: 0, recovered_amount: 0, status: "draft",
  };
  const [form, setForm] = useState(emptyForm);

  const { data: vessels = [] } = useQuery({
    queryKey: ["warranty-vessels"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: claims = [], isLoading, refetch } = useQuery({
    queryKey: ["warranty-claims"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("warranty_claims")
        .select("*, vessels:vessel_id(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (f: typeof emptyForm) => {
      const num = `WC-${new Date().getFullYear()}-${String(claims.length + 1).padStart(3, "0")}`;
      const { error } = await (supabase.from as Function)("warranty_claims").insert({
        claim_number: num,
        equipment: f.equipment,
        manufacturer: f.manufacturer,
        vessel_id: f.vessel_id || null,
        failure_description: f.failure_description,
        failure_date: f.failure_date || null,
        claim_date: f.claim_date,
        warranty_expiry: f.warranty_expiry || null,
        claim_amount: f.claim_amount,
        recovered_amount: f.recovered_amount,
        status: f.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warranty-claims"] });
      setShowCreate(false);
      setForm(emptyForm);
      toast.success("Warranty claim created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await (supabase.from as Function)("warranty_claims").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warranty-claims"] });
      setShowEdit(null);
      toast.success("Claim updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as Function)("warranty_claims").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warranty-claims"] });
      toast.success("Claim deleted");
    },
  });

  const filtered = useMemo(() => {
    return claims.filter((c: any) => {
      const matchSearch = !searchTerm ||
        c.equipment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.claim_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [claims, searchTerm, statusFilter]);

  const totalClaimed = claims.reduce((s: number, c: any) => s + (Number(c.claim_amount) || 0), 0);
  const totalRecovered = claims.reduce((s: number, c: any) => s + (Number(c.recovered_amount) || 0), 0);
  const recoveryRate = totalClaimed > 0 ? (totalRecovered / totalClaimed) * 100 : 0;
  const openClaims = claims.filter((c: any) => !["closed", "rejected"].includes(c.status)).length;

  // Charts data
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    claims.forEach((c: any) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: STATUS_CONFIG[name]?.label || name, value
    }));
  }, [claims]);

  const monthlyData = useMemo(() => {
    const byMonth: Record<string, { claimed: number; recovered: number }> = {};
    claims.forEach((c: any) => {
      const month = c.claim_date ? format(new Date(c.claim_date), "MMM/yy", { locale: ptBR }) : "N/A";
      if (!byMonth[month]) byMonth[month] = { claimed: 0, recovered: 0 };
      byMonth[month].claimed += Number(c.claim_amount) || 0;
      byMonth[month].recovered += Number(c.recovered_amount) || 0;
    });
    return Object.entries(byMonth).map(([month, d]) => ({ month, ...d })).slice(-12);
  }, [claims]);

  const handleExport = () => {
    if (!filtered.length) { toast.error("No data to export"); return; }
    const csv = [
      ["Claim #", "Equipment", "Manufacturer", "Claimed", "Recovered", "Status", "Date"].join(","),
      ...filtered.map((c: any) => [
        c.claim_number, `"${c.equipment}"`, `"${c.manufacturer}"`,
        c.claim_amount, c.recovered_amount, c.status, c.claim_date
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warranty-claims-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  const editClaim = claims.find((c: any) => c.id === showEdit);

  const ClaimForm = ({ isEdit, initial, onSubmit, isPending }: {
    isEdit: boolean;
    initial: typeof emptyForm;
    onSubmit: (f: typeof emptyForm) => void;
    isPending: boolean;
  }) => {
    const [f, setF] = useState(initial);
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Equipment</Label><Input value={f.equipment} onChange={e => setF(p => ({ ...p, equipment: e.target.value }))} placeholder="Main Engine Turbocharger" /></div>
          <div><Label>Manufacturer</Label><Input value={f.manufacturer} onChange={e => setF(p => ({ ...p, manufacturer: e.target.value }))} placeholder="MAN Energy Solutions" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Vessel</Label>
            <Select value={f.vessel_id} onValueChange={v => setF(p => ({ ...p, vessel_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
              <SelectContent>{vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={f.status} onValueChange={v => setF(p => ({ ...p, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Failure Description</Label><Textarea value={f.failure_description} onChange={e => setF(p => ({ ...p, failure_description: e.target.value }))} rows={2} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><Label>Failure Date</Label><Input type="date" value={f.failure_date} onChange={e => setF(p => ({ ...p, failure_date: e.target.value }))} /></div>
          <div><Label>Claim Date</Label><Input type="date" value={f.claim_date} onChange={e => setF(p => ({ ...p, claim_date: e.target.value }))} /></div>
          <div><Label>Warranty Expiry</Label><Input type="date" value={f.warranty_expiry} onChange={e => setF(p => ({ ...p, warranty_expiry: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Amount Claimed (USD)</Label><Input type="number" value={f.claim_amount || ""} onChange={e => setF(p => ({ ...p, claim_amount: Number(e.target.value) }))} /></div>
          <div><Label>Amount Recovered (USD)</Label><Input type="number" value={f.recovered_amount || ""} onChange={e => setF(p => ({ ...p, recovered_amount: Number(e.target.value) }))} /></div>
        </div>
        <Button className="w-full" onClick={() => onSubmit(f)} disabled={isPending || !f.equipment}>
          {isPending ? "Saving..." : isEdit ? "Update Claim" : "Create Claim"}
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-64" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Wrench className="h-6 w-6 text-primary" /> Warranty Claims Tracker</h2>
          <p className="text-muted-foreground">{claims.length} claims • ${(totalClaimed / 1000).toFixed(0)}K claimed • {recoveryRate.toFixed(0)}% recovery</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-1" />Refresh</Button>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={() => { setForm(emptyForm); setShowCreate(true); }}><Plus className="h-4 w-4 mr-1" />New Claim</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><FileText className="h-4 w-4" /> Open Claims</div>
          <div className="text-2xl font-bold">{openClaims}</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><DollarSign className="h-4 w-4" /> Total Claimed</div>
          <div className="text-2xl font-bold text-warning">${(totalClaimed / 1000).toFixed(0)}K</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><CheckCircle className="h-4 w-4" /> Recovered</div>
          <div className="text-2xl font-bold text-success">${(totalRecovered / 1000).toFixed(0)}K</div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3">
          <div className="text-sm text-muted-foreground mb-1">Recovery Rate</div>
          <div className="text-2xl font-bold text-primary">{recoveryRate.toFixed(1)}%</div>
          <Progress value={recoveryRate} className="h-1 mt-1" />
        </CardContent></Card>
      </div>

      <Tabs defaultValue="claims">
        <TabsList>
          <TabsTrigger value="claims">Claims ({filtered.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-4 mt-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search equipment, manufacturer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No warranty claims found. Create one to start tracking equipment warranties.</p>
            </CardContent></Card>
          ) : (
            <Card>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-xs">
                        <th className="text-left py-2 px-2">Claim #</th>
                        <th className="text-left py-2 px-2">Vessel</th>
                        <th className="text-left py-2 px-2">Equipment</th>
                        <th className="text-left py-2 px-2">Manufacturer</th>
                        <th className="text-right py-2 px-2">Claimed</th>
                        <th className="text-right py-2 px-2">Recovered</th>
                        <th className="text-center py-2 px-2">Status</th>
                        <th className="text-center py-2 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c: any) => {
                        const vessel = c.vessels as Record<string, unknown> | null;
                        const daysOpen = c.claim_date ? Math.ceil((Date.now() - new Date(c.claim_date).getTime()) / 86400000) : 0;
                        return (
                          <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="py-2 px-2 font-mono text-xs">{c.claim_number}</td>
                            <td className="py-2 px-2 text-xs">{(vessel?.name as string) || "—"}</td>
                            <td className="py-2 px-2 text-xs max-w-[200px] truncate">{c.equipment}</td>
                            <td className="py-2 px-2 text-xs">{c.manufacturer}</td>
                            <td className="py-2 px-2 text-right font-mono text-xs">${Number(c.claim_amount || 0).toLocaleString()}</td>
                            <td className="py-2 px-2 text-right font-mono text-xs text-success">${Number(c.recovered_amount || 0).toLocaleString()}</td>
                            <td className="py-2 px-2 text-center">
                              <Badge className={`text-[10px] ${STATUS_CONFIG[c.status]?.color || ""}`}>
                                {STATUS_CONFIG[c.status]?.label || c.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <div className="flex gap-1 justify-center">
                                <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Editar garantia" onClick={() => {
                                  setForm({
                                    equipment: c.equipment || "", manufacturer: c.manufacturer || "",
                                    vessel_id: c.vessel_id || "", vessel_name: "",
                                    failure_description: c.failure_description || "",
                                    failure_date: c.failure_date?.split("T")[0] || "",
                                    claim_date: c.claim_date?.split("T")[0] || "",
                                    warranty_expiry: c.warranty_expiry?.split("T")[0] || "",
                                    claim_amount: c.claim_amount || 0,
                                    recovered_amount: c.recovered_amount || 0,
                                    status: c.status || "draft",
                                  });
                                  setShowEdit(c.id);
                                }} ><Edit className="h-3.5 w-3.5" /></Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => {
                                  if (confirm("Delete this claim?")) deleteMutation.mutate(c.id);
                                }} aria-label="Delete claim"><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Claims by Month</CardTitle></CardHeader>
              <CardContent>
                {monthlyData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="claimed" fill="hsl(35,80%,55%)" name="Claimed" />
                      <Bar dataKey="recovered" fill="hsl(160,60%,45%)" name="Recovered" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Status Distribution</CardTitle></CardHeader>
              <CardContent>
                {statusDistribution.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {statusDistribution.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Warranty Claim</DialogTitle></DialogHeader>
          <ClaimForm isEdit={false} initial={emptyForm} onSubmit={f => createMutation.mutate(f)} isPending={createMutation.isPending} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!showEdit} onOpenChange={() => setShowEdit(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Warranty Claim</DialogTitle></DialogHeader>
          {editClaim && (
            <ClaimForm isEdit initial={form} onSubmit={f => updateMutation.mutate({
              id: showEdit!,
              updates: {
                equipment: f.equipment, manufacturer: f.manufacturer, vessel_id: f.vessel_id || null,
                failure_description: f.failure_description, failure_date: f.failure_date || null,
                claim_date: f.claim_date, warranty_expiry: f.warranty_expiry || null,
                claim_amount: f.claim_amount, recovered_amount: f.recovered_amount, status: f.status,
              }
            })} isPending={updateMutation.isPending} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WarrantyClaimsTracker;
