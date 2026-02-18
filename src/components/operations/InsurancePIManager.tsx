/**
 * Insurance & P&I Manager - World-Class v2 (vs Cloud Fleet Manager / DNV)
 * Full CRUD, coverage gap analysis, renewal alerts, claims analytics, premium benchmarking
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Shield, DollarSign, AlertTriangle, FileText, Clock, Plus, Download,
  Search, RefreshCw, Edit, Trash2, TrendingUp, Calendar, CheckCircle,
  ShieldAlert, Target, BarChart3, Gauge, ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { differenceInDays, format, addDays } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";

const POLICY_TYPES = ["H&M", "P&I", "FD&D", "War Risk", "Loss of Hire", "Cargo"] as const;
const CLAIM_STATUSES = ["open", "under_review", "approved", "paid", "rejected"] as const;
const COLORS = ["hsl(var(--primary))", "hsl(210,70%,55%)", "hsl(160,60%,45%)", "hsl(35,80%,55%)", "hsl(280,60%,55%)", "hsl(0,70%,55%)"];

const POLICY_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-success/20 text-success" },
  expiring: { label: "Expiring", color: "bg-warning/20 text-warning" },
  expired: { label: "Expired", color: "bg-destructive/20 text-destructive" },
  renewal: { label: "Renewal", color: "bg-primary/20 text-primary" },
};

const emptyPolicy = {
  type: "H&M" as string, insurer: "", vessel_id: "", premium: 0,
  coverage: 0, deductible: 0, start_date: "", end_date: "", notes: "",
};

const emptyClaim = {
  policy_id: "", vessel_id: "", incident_date: "",
  description: "", amount_claimed: 0, amount_recovered: 0, status: "open",
};

// Industry benchmark premiums by type (USD per vessel-year)
const INDUSTRY_BENCHMARKS: Record<string, { avg: number; low: number; high: number }> = {
  "H&M": { avg: 85000, low: 45000, high: 150000 },
  "P&I": { avg: 120000, low: 60000, high: 250000 },
  "FD&D": { avg: 15000, low: 8000, high: 35000 },
  "War Risk": { avg: 25000, low: 10000, high: 80000 },
  "Loss of Hire": { avg: 40000, low: 20000, high: 90000 },
  "Cargo": { avg: 30000, low: 15000, high: 65000 },
};

export function InsurancePIManager() {
  const [activeTab, setActiveTab] = useState("policies");
  const [showNewPolicy, setShowNewPolicy] = useState(false);
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [policyForm, setPolicyForm] = useState(emptyPolicy);
  const [claimForm, setClaimForm] = useState(emptyClaim);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: vessels = [] } = useQuery({
    queryKey: ["insurance-vessels"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name").order("name");
      return data || [];
    },
  });

  const { data: policies = [], isLoading: policiesLoading } = useQuery({
    queryKey: ["insurance-policies"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("insurance_policies")
        .select("*, vessels:vessel_id(name)")
        .order("end_date", { ascending: true });
      if (error) throw error;
      return (data || []).map((p: any) => {
        const daysUntilExpiry = p.end_date ? differenceInDays(new Date(p.end_date), new Date()) : 999;
        const computedStatus = daysUntilExpiry < 0 ? "expired" : daysUntilExpiry < 60 ? "expiring" : "active";
        return { ...p, computed_status: p.status || computedStatus, days_until_expiry: daysUntilExpiry };
      });
    },
  });

  const { data: claims = [], isLoading: claimsLoading } = useQuery({
    queryKey: ["insurance-claims"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("insurance_claims")
        .select("*, vessels:vessel_id(name), insurance_policies:policy_id(type, insurer)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createPolicy = useMutation({
    mutationFn: async (f: typeof emptyPolicy) => {
      const { error } = await (supabase.from as Function)("insurance_policies").insert({
        type: f.type, insurer: f.insurer, vessel_id: f.vessel_id || null,
        premium: f.premium, coverage: f.coverage, deductible: f.deductible,
        start_date: f.start_date, end_date: f.end_date, notes: f.notes || null,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-policies"] });
      setShowNewPolicy(false);
      setPolicyForm(emptyPolicy);
      toast.success("Policy created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createClaim = useMutation({
    mutationFn: async (f: typeof emptyClaim) => {
      const { error } = await (supabase.from as Function)("insurance_claims").insert({
        policy_id: f.policy_id || null, vessel_id: f.vessel_id || null,
        incident_date: f.incident_date, description: f.description,
        amount_claimed: f.amount_claimed, amount_recovered: f.amount_recovered,
        status: f.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-claims"] });
      setShowNewClaim(false);
      setClaimForm(emptyClaim);
      toast.success("Claim filed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deletePolicy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from as Function)("insurance_policies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-policies"] });
      toast.success("Policy deleted");
    },
  });

  const updateClaimStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase.from as Function)("insurance_claims")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance-claims"] });
      toast.success("Claim status updated");
    },
  });

  const totalPremium = policies.reduce((s: number, p: any) => s + (Number(p.premium) || 0), 0);
  const totalCoverage = policies.reduce((s: number, p: any) => s + (Number(p.coverage) || 0), 0);
  const openClaims = claims.filter((c: any) => c.status === "open" || c.status === "under_review").length;
  const totalClaimed = claims.reduce((s: number, c: any) => s + (Number(c.amount_claimed) || 0), 0);
  const totalRecovered = claims.reduce((s: number, c: any) => s + (Number(c.amount_recovered) || 0), 0);
  const recoveryRate = totalClaimed > 0 ? (totalRecovered / totalClaimed) * 100 : 0;
  const expiringPolicies = policies.filter((p: any) => p.days_until_expiry > 0 && p.days_until_expiry <= 60);
  const expiredPolicies = policies.filter((p: any) => p.days_until_expiry < 0);
  const lossRatio = totalPremium > 0 ? (totalClaimed / totalPremium) * 100 : 0;

  // Coverage Gap Analysis
  const coverageGaps = useMemo(() => {
    const gaps: { vessel: string; vesselId: string; missingTypes: string[] }[] = [];
    const requiredTypes = ["H&M", "P&I"];
    vessels.forEach((v) => {
      const vesselPolicies = policies.filter(
        (p: any) => p.vessel_id === v.id && p.days_until_expiry >= 0
      );
      const coveredTypes = vesselPolicies.map((p: any) => p.type);
      const missing = requiredTypes.filter((t) => !coveredTypes.includes(t));
      if (missing.length > 0) {
        gaps.push({ vessel: v.name, vesselId: v.id, missingTypes: missing });
      }
    });
    return gaps;
  }, [vessels, policies]);

  // Premium benchmarking
  const benchmarkData = useMemo(() => {
    return POLICY_TYPES.map((type) => {
      const typePolicies = policies.filter((p: any) => p.type === type);
      const avgPremium = typePolicies.length > 0
        ? typePolicies.reduce((s: number, p: any) => s + Number(p.premium || 0), 0) / typePolicies.length
        : 0;
      const benchmark = INDUSTRY_BENCHMARKS[type];
      return {
        type,
        yourAvg: Math.round(avgPremium),
        industryAvg: benchmark.avg,
        industryLow: benchmark.low,
        industryHigh: benchmark.high,
        count: typePolicies.length,
        saving: avgPremium > 0 ? Math.round(((avgPremium - benchmark.avg) / benchmark.avg) * 100) : null,
      };
    }).filter((d) => d.count > 0);
  }, [policies]);

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    policies.forEach((p: any) => { counts[p.type] = (counts[p.type] || 0) + Number(p.premium || 0); });
    return Object.entries(counts).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [policies]);

  // Claims by month for trend
  const claimsTrend = useMemo(() => {
    const months: Record<string, { month: string; count: number; amount: number }> = {};
    claims.forEach((c: any) => {
      const d = c.incident_date || c.created_at;
      if (!d) return;
      const key = format(new Date(d), "yyyy-MM");
      if (!months[key]) months[key] = { month: format(new Date(d), "MMM yy"), count: 0, amount: 0 };
      months[key].count++;
      months[key].amount += Number(c.amount_claimed || 0);
    });
    return Object.values(months).slice(-12);
  }, [claims]);

  const handleExport = () => {
    const csv = [
      ["Type", "Insurer", "Vessel", "Premium", "Coverage", "Expiry", "Status"].join(","),
      ...policies.map((p: any) => [
        p.type, `"${p.insurer}"`, `"${(p.vessels as any)?.name || ""}"`,
        p.premium, p.coverage, p.end_date, p.computed_status
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `insurance-policies-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Exported");
  };

  const isLoading = policiesLoading || claimsLoading;

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-64" /><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}</div><Skeleton className="h-96" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Coverage Gap Alert */}
      {coverageGaps.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-destructive">Coverage Gaps Detected</h3>
            </div>
            <div className="space-y-1">
              {coverageGaps.map((g) => (
                <p key={g.vesselId} className="text-sm">
                  <span className="font-medium">{g.vessel}</span> — missing:{" "}
                  {g.missingTypes.map((t) => (
                    <Badge key={t} variant="destructive" className="text-[10px] mr-1">{t}</Badge>
                  ))}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Shield className="h-4 w-4" /> Policies</div>
          <p className="text-2xl font-bold mt-1">{policies.length}</p>
          {expiredPolicies.length > 0 && <p className="text-xs text-destructive">{expiredPolicies.length} expired</p>}
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><DollarSign className="h-4 w-4" /> Annual Premium</div>
          <p className="text-2xl font-bold mt-1">${(totalPremium / 1000).toFixed(0)}K</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Shield className="h-4 w-4" /> Coverage</div>
          <p className="text-2xl font-bold mt-1">${(totalCoverage / 1e6).toFixed(1)}M</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><AlertTriangle className="h-4 w-4" /> Open Claims</div>
          <p className="text-2xl font-bold mt-1">{openClaims}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><TrendingUp className="h-4 w-4" /> Recovery</div>
          <Progress value={recoveryRate} className="mt-2" />
          <p className="text-sm font-medium mt-1">{recoveryRate.toFixed(0)}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm"><Gauge className="h-4 w-4" /> Loss Ratio</div>
          <p className={`text-2xl font-bold mt-1 ${lossRatio > 70 ? "text-destructive" : lossRatio > 40 ? "text-warning" : "text-success"}`}>
            {lossRatio.toFixed(0)}%
          </p>
        </CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="policies">Policies ({policies.length})</TabsTrigger>
            <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
            <TabsTrigger value="renewals">
              Renewals
              {expiringPolicies.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-[10px] h-4 px-1">{expiringPolicies.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="coverage">Coverage Map</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="benchmark">Benchmarking</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export</Button>
            <Button size="sm" onClick={() => setShowNewPolicy(true)}><Plus className="h-4 w-4 mr-1" /> New Policy</Button>
          </div>
        </div>

        <TabsContent value="policies" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <div className="mb-3">
                <Input
                  placeholder="Search by type, insurer, vessel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-muted-foreground">
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Vessel</th>
                      <th className="text-left p-2">Insurer</th>
                      <th className="text-right p-2">Premium</th>
                      <th className="text-right p-2">Coverage</th>
                      <th className="text-right p-2">Deductible</th>
                      <th className="text-center p-2">Expiry</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-center p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.length === 0 ? (
                      <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">
                        <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        No policies. Add H&M, P&I, or War Risk policies.
                      </td></tr>
                    ) : policies
                        .filter((p: any) => {
                          if (!searchTerm) return true;
                          const q = searchTerm.toLowerCase();
                          return (
                            p.type?.toLowerCase().includes(q) ||
                            p.insurer?.toLowerCase().includes(q) ||
                            (p.vessels as any)?.name?.toLowerCase().includes(q)
                          );
                        })
                        .map((p: any) => (
                      <tr key={p.id} className="border-b hover:bg-muted/30">
                        <td className="p-2"><Badge variant="outline">{p.type}</Badge></td>
                        <td className="p-2 text-xs">{(p.vessels as any)?.name || "—"}</td>
                        <td className="p-2 text-xs">{p.insurer}</td>
                        <td className="p-2 text-right font-mono text-xs">${Number(p.premium || 0).toLocaleString()}</td>
                        <td className="p-2 text-right font-mono text-xs">${(Number(p.coverage || 0) / 1e6).toFixed(1)}M</td>
                        <td className="p-2 text-right font-mono text-xs">${Number(p.deductible || 0).toLocaleString()}</td>
                        <td className="p-2 text-center text-xs">
                          {p.end_date ? format(new Date(p.end_date), "dd MMM yyyy") : "—"}
                          {p.days_until_expiry <= 30 && p.days_until_expiry >= 0 && (
                            <span className="block text-destructive text-[10px]">{p.days_until_expiry}d left!</span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <Badge className={`text-[10px] ${POLICY_STATUS_CONFIG[p.computed_status]?.color || ""}`}>
                            {POLICY_STATUS_CONFIG[p.computed_status]?.label || p.computed_status}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => {
                            if (confirm("Delete this policy?")) deletePolicy.mutate(p.id);
                          }} aria-label="Delete policy"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowNewClaim(true)}><Plus className="h-4 w-4 mr-1" /> File Claim</Button>
          </div>
          {claims.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              No claims filed yet.
            </CardContent></Card>
          ) : claims.map((c: any) => (
            <Card key={c.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{(c.insurance_policies as any)?.type || "—"}</Badge>
                      <Badge className={c.status === "paid" || c.status === "approved" ? "bg-success/20 text-success" : c.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}>
                        {c.status}
                      </Badge>
                      {(c.vessels as any)?.name && <span className="text-xs text-muted-foreground">🚢 {(c.vessels as any).name}</span>}
                    </div>
                    <p className="text-sm">{c.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Incident: {c.incident_date || "—"} • Insurer: {(c.insurance_policies as any)?.insurer || "—"}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-mono">Claimed: <span className="text-warning">${Number(c.amount_claimed || 0).toLocaleString()}</span></p>
                    <p className="text-sm font-mono">Recovered: <span className="text-success">${Number(c.amount_recovered || 0).toLocaleString()}</span></p>
                    {(c.status === "open" || c.status === "under_review") && (
                      <Select value={c.status} onValueChange={(v) => updateClaimStatus.mutate({ id: c.id, status: v })}>
                        <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CLAIM_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="renewals" className="mt-4 space-y-3">
          {/* Renewal timeline */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Renewal Timeline (Next 90 Days)</CardTitle></CardHeader>
            <CardContent>
              {(() => {
                const upcoming = policies
                  .filter((p: any) => p.days_until_expiry > 0 && p.days_until_expiry <= 90)
                  .sort((a: any, b: any) => a.days_until_expiry - b.days_until_expiry);
                if (upcoming.length === 0) {
                  return (
                    <div className="text-center py-6 text-muted-foreground">
                      <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-50 text-success" />
                      All policies current. No renewals within 90 days.
                    </div>
                  );
                }
                return (
                  <div className="space-y-2">
                    {upcoming.map((p: any) => {
                      const urgency = p.days_until_expiry <= 15 ? "destructive" : p.days_until_expiry <= 30 ? "warning" : "muted-foreground";
                      return (
                        <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border ${p.days_until_expiry <= 15 ? "border-destructive/40 bg-destructive/5" : p.days_until_expiry <= 30 ? "border-warning/40 bg-warning/5" : "border-border"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${p.days_until_expiry <= 15 ? "bg-destructive animate-pulse" : p.days_until_expiry <= 30 ? "bg-warning" : "bg-muted-foreground"}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">{p.type}</Badge>
                                <span className="font-medium text-sm">{p.insurer}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{(p.vessels as any)?.name} • Expires {format(new Date(p.end_date), "dd MMM yyyy")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-mono">${Number(p.premium || 0).toLocaleString()}</span>
                            <Badge className={p.days_until_expiry <= 15 ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}>
                              {p.days_until_expiry}d
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-xs text-muted-foreground pt-2">
                      Total renewal premium: <span className="font-bold">${upcoming.reduce((s: number, p: any) => s + Number(p.premium || 0), 0).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Fleet Coverage Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-2">Vessel</th>
                      {POLICY_TYPES.map((t) => <th key={t} className="text-center p-2 text-xs">{t}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {vessels.length === 0 ? (
                      <tr><td colSpan={POLICY_TYPES.length + 1} className="p-8 text-center text-muted-foreground">No vessels found</td></tr>
                    ) : vessels.map((v) => (
                      <tr key={v.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{v.name}</td>
                        {POLICY_TYPES.map((type) => {
                          const policy = policies.find((p: any) => p.vessel_id === v.id && p.type === type && p.days_until_expiry >= 0);
                          return (
                            <td key={type} className="p-2 text-center">
                              {policy ? (
                                <Badge className="bg-success/20 text-success text-[10px]">
                                  {(policy as any).days_until_expiry}d
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground/50">—</Badge>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success" /> Covered</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Not covered</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Premium by Type</CardTitle></CardHeader>
              <CardContent>
                {typeDistribution.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={typeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {typeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Loss Ratio Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Premiums Paid</span><span className="font-mono font-bold">${(totalPremium / 1000).toFixed(0)}K</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Claims Filed</span><span className="font-mono font-bold text-warning">${(totalClaimed / 1000).toFixed(0)}K</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Recovered</span><span className="font-mono font-bold text-success">${(totalRecovered / 1000).toFixed(0)}K</span></div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-muted-foreground">Loss Ratio</span>
                  <span className={`font-bold ${lossRatio > 70 ? "text-destructive" : lossRatio > 40 ? "text-warning" : "text-success"}`}>
                    {lossRatio.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">Net Position</span>
                  <span className={`font-bold ${totalPremium - totalClaimed >= 0 ? "text-success" : "text-destructive"}`}>
                    ${((totalPremium - totalClaimed) / 1000).toFixed(0)}K
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-base">Claims Trend</CardTitle></CardHeader>
              <CardContent>
                {claimsTrend.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No claims data</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={claimsTrend}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Area type="monotone" dataKey="amount" fill="hsl(var(--warning))" fillOpacity={0.2} stroke="hsl(var(--warning))" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmark" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Premium Benchmarking vs Industry
              </CardTitle>
            </CardHeader>
            <CardContent>
              {benchmarkData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Add policies to see benchmarks</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={benchmarkData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="type" width={60} fontSize={11} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="yourAvg" fill="hsl(var(--primary))" name="Your Average" radius={[0,4,4,0]} />
                      <Bar dataKey="industryAvg" fill="hsl(var(--muted-foreground))" name="Industry Average" radius={[0,4,4,0]} opacity={0.5} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {benchmarkData.map((d) => (
                      <div key={d.type} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30">
                        <span className="font-medium">{d.type}</span>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-xs">Yours: ${d.yourAvg.toLocaleString()}</span>
                          <span className="font-mono text-xs text-muted-foreground">Ind: ${d.industryAvg.toLocaleString()}</span>
                          {d.saving !== null && (
                            <Badge className={d.saving > 10 ? "bg-destructive/20 text-destructive" : d.saving < -10 ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                              {d.saving > 0 ? `+${d.saving}%` : `${d.saving}%`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Policy Dialog */}
      <Dialog open={showNewPolicy} onOpenChange={setShowNewPolicy}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>New Insurance Policy</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label>
                <Select value={policyForm.type} onValueChange={v => setPolicyForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{POLICY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Insurer / P&I Club</Label><Input value={policyForm.insurer} onChange={e => setPolicyForm(p => ({ ...p, insurer: e.target.value }))} placeholder="Gard, Skuld, West of England..." /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Vessel</Label>
                <Select value={policyForm.vessel_id} onValueChange={v => setPolicyForm(p => ({ ...p, vessel_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Start Date</Label><Input type="date" value={policyForm.start_date} onChange={e => setPolicyForm(p => ({ ...p, start_date: e.target.value }))} /></div>
              <div><Label>End Date</Label><Input type="date" value={policyForm.end_date} onChange={e => setPolicyForm(p => ({ ...p, end_date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Premium (USD)</Label><Input type="number" value={policyForm.premium || ""} onChange={e => setPolicyForm(p => ({ ...p, premium: Number(e.target.value) }))} /></div>
              <div><Label>Coverage (USD)</Label><Input type="number" value={policyForm.coverage || ""} onChange={e => setPolicyForm(p => ({ ...p, coverage: Number(e.target.value) }))} /></div>
              <div><Label>Deductible (USD)</Label><Input type="number" value={policyForm.deductible || ""} onChange={e => setPolicyForm(p => ({ ...p, deductible: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={policyForm.notes} onChange={e => setPolicyForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
            <Button className="w-full" onClick={() => createPolicy.mutate(policyForm)} disabled={createPolicy.isPending || !policyForm.insurer || !policyForm.type}>
              {createPolicy.isPending ? "Saving..." : "Create Policy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Claim Dialog */}
      <Dialog open={showNewClaim} onOpenChange={setShowNewClaim}>
        <DialogContent>
          <DialogHeader><DialogTitle>File Insurance Claim</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Policy</Label>
              <Select value={claimForm.policy_id} onValueChange={v => setClaimForm(p => ({ ...p, policy_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select policy" /></SelectTrigger>
                <SelectContent>{policies.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.type} - {p.insurer}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Vessel</Label>
                <Select value={claimForm.vessel_id} onValueChange={v => setClaimForm(p => ({ ...p, vessel_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{vessels.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Incident Date</Label><Input type="date" value={claimForm.incident_date} onChange={e => setClaimForm(p => ({ ...p, incident_date: e.target.value }))} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={claimForm.description} onChange={e => setClaimForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Amount Claimed (USD)</Label><Input type="number" value={claimForm.amount_claimed || ""} onChange={e => setClaimForm(p => ({ ...p, amount_claimed: Number(e.target.value) }))} /></div>
              <div><Label>Amount Recovered (USD)</Label><Input type="number" value={claimForm.amount_recovered || ""} onChange={e => setClaimForm(p => ({ ...p, amount_recovered: Number(e.target.value) }))} /></div>
            </div>
            <Button className="w-full" onClick={() => createClaim.mutate(claimForm)} disabled={createClaim.isPending || !claimForm.description}>
              {createClaim.isPending ? "Filing..." : "File Claim"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InsurancePIManager;
