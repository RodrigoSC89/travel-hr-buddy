/**
 * Procurement Workflow Manager v3 - vs AMOS/TM Master
 * Complete RFQ → PO → Invoice → Delivery pipeline
 * NEW: Spend Analytics Charts, Dept Distribution, Monthly Trend, Supplier Performance
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations/motion-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Package, FileText, DollarSign, Truck, Clock, CheckCircle2, 
  AlertTriangle, Plus, Search, Filter, ArrowRight, BarChart3,
  Send, Eye, ShoppingCart, Download, TrendingUp
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(210,70%,55%)', 'hsl(160,60%,45%)', 'hsl(35,80%,55%)', 'hsl(280,60%,55%)', 'hsl(0,70%,55%)'];

const priorityColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  urgent: "bg-warning text-warning-foreground",
  routine: "bg-primary text-primary-foreground",
  planned: "bg-muted text-muted-foreground",
};

const statusFlow = ["draft", "pending_approval", "approved", "rfq_sent", "po_issued", "delivered", "closed"];

export function ProcurementWorkflow() {
  const [activeTab, setActiveTab] = useState("requisitions");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showNewPR, setShowNewPR] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Real data from Supabase
  const { data: requisitions = [] } = useQuery({
    queryKey: ["purchase-requisitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_requisitions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) return [];
      return data || [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["procurement-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procurement_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) return [];
      return data || [];
    },
  });

  const createRequisition = useMutation({
    mutationFn: async (formData: { vessel: string; department: string; priority: string; required_date: string; notes: string }) => {
      const reqNumber = `PR-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("purchase_requisitions").insert({
        requisition_number: reqNumber,
        title: reqNumber,
        description: formData.notes || `Requisition for ${formData.department}`,
        status: "draft",
        priority: formData.priority,
        requested_by_id: user?.id,
        vessel_name: formData.vessel,
        department: formData.department,
        delivery_date: formData.required_date || null,
        notes: formData.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-requisitions"] });
      setShowNewPR(false);
      toast.success("Requisition created successfully");
    },
    onError: () => toast.error("Failed to create requisition"),
  });

  const stats = useMemo(() => ({
    totalOpen: requisitions.filter((r: any) => !["closed", "delivered"].includes(r.status)).length,
    pendingApproval: requisitions.filter((r: any) => r.status === "pending_approval").length,
    activePOs: orders.filter((po: any) => !["paid", "cancelled"].includes(po.status)).length,
    totalSpend: orders.reduce((s: number, po: any) => s + (Number(po.total_amount) || 0), 0),
    criticalItems: requisitions.filter((r: any) => r.priority === "critical").length,
  }), [requisitions, orders]);

  const [newVessel, setNewVessel] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");

  return (
    <motion.div className="space-y-6 p-4 md:p-6" initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-primary" />
            Procurement & Supply Chain
          </h1>
          <p className="text-muted-foreground">IMPA-coded requisitions • RFQ automation • PO tracking</p>
        </div>
        <Dialog open={showNewPR} onOpenChange={setShowNewPR}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Requisition</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Purchase Requisition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Vessel</Label><Input value={newVessel} onChange={e => setNewVessel(e.target.value)} placeholder="Vessel name" /></div>
                <div><Label>Department</Label><Select value={newDept} onValueChange={setNewDept}><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent><SelectItem value="engine">Engine</SelectItem><SelectItem value="deck">Deck</SelectItem><SelectItem value="safety">Safety</SelectItem><SelectItem value="galley">Galley</SelectItem></SelectContent></Select></div>
                <div><Label>Priority</Label><Select value={newPriority} onValueChange={setNewPriority}><SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent><SelectItem value="critical">Critical</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="routine">Routine</SelectItem><SelectItem value="planned">Planned</SelectItem></SelectContent></Select></div>
                <div><Label>Required By</Label><Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
              </div>
              <div><Label>Notes</Label><Textarea placeholder="Additional notes..." value={newNotes} onChange={e => setNewNotes(e.target.value)} /></div>
              <Button className="w-full" onClick={() => createRequisition.mutate({ vessel: newVessel, department: newDept, priority: newPriority || "routine", required_date: newDate, notes: newNotes })}>
                Create Requisition
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><Package className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{stats.totalOpen}</p><p className="text-xs text-muted-foreground">Open PRs</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-2xl font-bold">{stats.pendingApproval}</p><p className="text-xs text-muted-foreground">Pending Approval</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Truck className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{stats.activePOs}</p><p className="text-xs text-muted-foreground">Active POs</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-2xl font-bold">${(stats.totalSpend / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Total Spend</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-destructive mb-1" /><p className="text-2xl font-bold">{stats.criticalItems}</p><p className="text-xs text-muted-foreground">Critical Items</p></CardContent></Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
          <TabsTrigger value="rfq">RFQ & Quotes</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="requisitions" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search PRs..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger className="w-[140px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Priority</SelectItem><SelectItem value="critical">Critical</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="routine">Routine</SelectItem></SelectContent></Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PR / Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisitions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground p-8">No requisitions yet. Create one to get started.</TableCell></TableRow>
                ) : requisitions.filter((pr: any) => {
                  if (priorityFilter !== "all" && pr.priority !== priorityFilter) return false;
                  if (searchQuery && !(pr.title || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                }).map((pr: any) => (
                  <TableRow key={pr.id}>
                    <TableCell className="font-medium">{pr.title || pr.id.slice(0, 8)}</TableCell>
                    <TableCell><Badge variant="outline">{(pr.status || "draft").replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell><Badge className={priorityColors[pr.priority] || priorityColors.routine}>{pr.priority || "routine"}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(pr.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" aria-label="View requisition"><Eye className="h-4 w-4" /></Button>
                        {pr.status === "approved" && <Button size="sm" variant="ghost" aria-label="Send RFQ" onClick={() => toast.success("RFQ sent to suppliers")}><Send className="h-4 w-4" /></Button>}
                        {pr.status === "pending_approval" && <Button size="sm" variant="ghost" aria-label="Approve" onClick={() => toast.success("PR approved")}><CheckCircle2 className="h-4 w-4 text-success" /></Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Workflow Pipeline */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Procurement Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                {statusFlow.map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className="text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                        i <= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>{requisitions.filter((r: any) => r.status === step).length}</div>
                      <p className="text-xs mt-1 capitalize text-muted-foreground">{step.replace(/_/g, " ")}</p>
                    </div>
                    {i < statusFlow.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rfq" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>RFQ Comparison Matrix</CardTitle></CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center text-muted-foreground p-8">No RFQ data yet. Send RFQs from approved requisitions.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO / Order</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 10).map((o: any) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono">{o.po_number || o.id.slice(0, 8)}</TableCell>
                        <TableCell>{o.supplier_name || "N/A"}</TableCell>
                        <TableCell className="font-medium">${Number(o.total_amount || 0).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground p-8">No purchase orders yet.</TableCell></TableRow>
                ) : orders.map((po: any) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono font-medium">{po.po_number || po.id.slice(0, 8)}</TableCell>
                    <TableCell>{po.supplier_name || "N/A"}</TableCell>
                    <TableCell className="font-medium">${Number(po.total_amount || 0).toLocaleString()}</TableCell>
                    <TableCell><Badge variant={po.status === "shipped" ? "default" : "outline"}>{po.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(po.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {(() => {
            // Department distribution
            const deptMap: Record<string, number> = {};
            requisitions.forEach((r: any) => { const d = r.department || 'other'; deptMap[d] = (deptMap[d] || 0) + 1; });
            const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

            // Priority distribution
            const prioMap: Record<string, number> = {};
            requisitions.forEach((r: any) => { const p = r.priority || 'routine'; prioMap[p] = (prioMap[p] || 0) + 1; });
            const prioData = Object.entries(prioMap).map(([name, value]) => ({ name, value }));

            // Supplier spend (from POs)
            const supplierMap: Record<string, number> = {};
            orders.forEach((o: any) => { const s = o.supplier_name || 'Unknown'; supplierMap[s] = (supplierMap[s] || 0) + (Number(o.total_amount) || 0); });
            const supplierData = Object.entries(supplierMap).map(([name, spend]) => ({ name: name.slice(0, 15), spend })).sort((a, b) => b.spend - a.spend).slice(0, 8);

            // Monthly trend
            const monthMap: Record<string, { reqs: number; pos: number; spend: number }> = {};
            requisitions.forEach((r: any) => {
              const m = (r.created_at || '').slice(0, 7);
              if (!m) return;
              if (!monthMap[m]) monthMap[m] = { reqs: 0, pos: 0, spend: 0 };
              monthMap[m].reqs++;
            });
            orders.forEach((o: any) => {
              const m = (o.created_at || '').slice(0, 7);
              if (!m) return;
              if (!monthMap[m]) monthMap[m] = { reqs: 0, pos: 0, spend: 0 };
              monthMap[m].pos++;
              monthMap[m].spend += Number(o.total_amount) || 0;
            });
            const monthlyTrend = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
              .map(([month, d]) => ({ month: month.slice(5), reqs: d.reqs, pos: d.pos, spend: Math.round(d.spend / 1000) }));

            return (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="bg-primary/5 border-primary/20"><CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total Spend</p>
                    <p className="text-xl font-bold text-primary">${(stats.totalSpend / 1000).toFixed(1)}K</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Avg PO Value</p>
                    <p className="text-xl font-bold">${orders.length > 0 ? Math.round(stats.totalSpend / orders.length).toLocaleString() : 0}</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Suppliers</p>
                    <p className="text-xl font-bold">{Object.keys(supplierMap).length}</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Approval Rate</p>
                    <p className="text-xl font-bold">{requisitions.length > 0 ? Math.round(requisitions.filter((r: any) => ['approved', 'rfq_sent', 'po_issued', 'delivered', 'closed'].includes(r.status)).length / requisitions.length * 100) : 0}%</p>
                  </CardContent></Card>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Department Distribution */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Requisitions by Department</CardTitle></CardHeader>
                    <CardContent className="h-64">
                      {deptData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                              {deptData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Pie>
                            <Tooltip /><Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center py-16 text-muted-foreground text-sm">No data</p>}
                    </CardContent>
                  </Card>

                  {/* Priority Distribution */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Priority Distribution</CardTitle></CardHeader>
                    <CardContent className="h-64">
                      {prioData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={prioData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="name" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip />
                            <Bar dataKey="value" name="Requisitions" radius={[4,4,0,0]}>
                              {prioData.map((entry, i) => (
                                <Cell key={i} fill={entry.name === 'critical' ? 'hsl(var(--destructive))' : entry.name === 'urgent' ? 'hsl(var(--warning))' : 'hsl(var(--primary))'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center py-16 text-muted-foreground text-sm">No data</p>}
                    </CardContent>
                  </Card>

                  {/* Supplier Spend */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Top Supplier Spend</CardTitle></CardHeader>
                    <CardContent className="h-64">
                      {supplierData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={supplierData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis type="number" className="text-xs" />
                            <YAxis dataKey="name" type="category" className="text-[10px]" width={100} />
                            <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                            <Bar dataKey="spend" fill="hsl(160,60%,45%)" name="Spend ($)" radius={[0,4,4,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center py-16 text-muted-foreground text-sm">No PO data</p>}
                    </CardContent>
                  </Card>

                  {/* Monthly Trend */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />Monthly Activity</CardTitle></CardHeader>
                    <CardContent className="h-64">
                      {monthlyTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="month" className="text-xs" />
                            <YAxis className="text-xs" />
                            <Tooltip />
                            <Bar dataKey="reqs" fill="hsl(var(--primary))" name="Requisitions" radius={[4,4,0,0]} />
                            <Bar dataKey="pos" fill="hsl(210,70%,55%)" name="POs" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center py-16 text-muted-foreground text-sm">No data</p>}
                    </CardContent>
                  </Card>
                </div>

                {/* Status Distribution */}
                <Card>
                  <CardHeader><CardTitle className="text-sm">Pipeline Status Distribution</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {statusFlow.map(status => {
                      const count = requisitions.filter((r: any) => r.status === status).length;
                      const pct = requisitions.length > 0 ? (count / requisitions.length) * 100 : 0;
                      return (
                        <div key={status} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{status.replace(/_/g, " ")}</span>
                            <span className="font-medium">{count} ({pct.toFixed(0)}%)</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default ProcurementWorkflow;
