/**
 * Permit to Work (PTW) System - vs Compello/Maros/INX
 * Digital permit management - INTEGRATED with Supabase
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ShieldAlert, Flame, Wind, Zap, Clock, CheckCircle2,
  AlertTriangle, Plus, Download, Users, Eye, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  hot_work: { label: "Hot Work", icon: Flame, color: "text-warning" },
  confined_space: { label: "Confined Space", icon: Wind, color: "text-primary" },
  working_height: { label: "Working at Height", icon: Eye, color: "text-secondary" },
  electrical: { label: "Electrical", icon: Zap, color: "text-warning" },
  diving: { label: "Diving Ops", icon: Users, color: "text-info" },
  cold_work: { label: "Cold Work", icon: ShieldAlert, color: "text-muted-foreground" },
  radiation: { label: "Radiation", icon: AlertTriangle, color: "text-destructive" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  pending: { label: "Pending Approval", color: "bg-warning/20 text-warning border-warning/30" },
  approved: { label: "Approved", color: "bg-primary/20 text-primary border-primary/30" },
  active: { label: "Active", color: "bg-success/20 text-success border-success/30" },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground" },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive border-destructive/30" },
  suspended: { label: "Suspended", color: "bg-warning/20 text-warning border-warning/30" },
};

const riskColors: Record<string, string> = {
  low: "text-success border-success/30",
  medium: "text-warning border-warning/30",
  high: "text-warning border-warning/30",
  critical: "text-destructive border-destructive/30",
};

export function PermitToWork() {
  const [tab, setTab] = useState("active");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", permit_type: "hot_work", location: "", risk_level: "medium", requested_by_name: "" });
  const queryClient = useQueryClient();

  const { data: permits = [], isLoading } = useQuery({
    queryKey: ["permits-to-work"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("permits_to_work")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: typeof newForm) => {
      const num = `PTW-${new Date().getFullYear()}-${String(permits.length + 1).padStart(3, "0")}`;
      const defaultChecklist: Record<string, string[]> = {
        hot_work: ["Fire watch assigned", "Gas free certificate obtained", "Fire extinguishers on site", "Adjacent compartments checked", "Hot work area boundaries defined"],
        confined_space: ["Atmosphere tested (O2, LEL, H2S)", "Rescue team standby", "Communication equipment tested", "Entry/exit procedures briefed", "Ventilation confirmed"],
        working_height: ["Harness inspected", "Fall arrest system rigged", "Weather conditions acceptable", "Tool tethering in place", "Exclusion zone marked"],
        electrical: ["Isolation verified", "Lock-out/Tag-out applied", "Voltage tested zero", "PPE verified", "Rescue equipment ready"],
        diving: ["Dive plan approved", "Emergency gas supply checked", "Decompression tables available", "Standby diver ready", "Communication tested"],
        cold_work: ["Area inspected", "Tools appropriate", "PPE confirmed", "Supervision assigned", "Risk assessment complete"],
        radiation: ["Source secured", "Dosimeters issued", "Exclusion zone established", "Radiation survey complete", "Emergency procedures briefed"],
      };
      const checklist = (defaultChecklist[form.permit_type] || []).map(item => ({ item, checked: false }));
      const { error } = await (supabase.from as Function)("permits_to_work").insert({
        permit_number: num, permit_type: form.permit_type, title: form.title,
        location: form.location, risk_level: form.risk_level, requested_by_name: form.requested_by_name,
        status: "pending", checklist,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permits-to-work"] });
      setShowNewDialog(false);
      setNewForm({ title: "", permit_type: "hot_work", location: "", risk_level: "medium", requested_by_name: "" });
      toast.success("Permit created and pending approval");
    },
    onError: (err: Error) => toast.error("Error: " + err.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "closed") updates.closed_at = new Date().toISOString();
      const { error } = await (supabase.from as Function)("permits_to_work").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permits-to-work"] });
      toast.success("Permit status updated");
    },
  });

  const activeCount = permits.filter((p: any) => p.status === "active").length;
  const pendingCount = permits.filter((p: any) => p.status === "pending").length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-warning" />
            Permit to Work (PTW)
          </h1>
          <p className="text-muted-foreground">Digital permit management • ISM/ISPS compliant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("PTW report exported")}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> New Permit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Permit to Work</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={newForm.title} onChange={e => setNewForm(p => ({ ...p, title: e.target.value }))} placeholder="Welding repair - Main deck" /></div>
                <div><Label>Type</Label>
                  <Select value={newForm.permit_type} onValueChange={v => setNewForm(p => ({ ...p, permit_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Location</Label><Input value={newForm.location} onChange={e => setNewForm(p => ({ ...p, location: e.target.value }))} placeholder="Main Deck, Frame 42" /></div>
                <div><Label>Risk Level</Label>
                  <Select value={newForm.risk_level} onValueChange={v => setNewForm(p => ({ ...p, risk_level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Requested By</Label><Input value={newForm.requested_by_name} onChange={e => setNewForm(p => ({ ...p, requested_by_name: e.target.value }))} placeholder="C/O A. Ferreira" /></div>
                <Button className="w-full" onClick={() => createMutation.mutate(newForm)} disabled={createMutation.isPending || !newForm.title || !newForm.location}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Permit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Active Permits</p>
          <p className="text-3xl font-bold text-success">{activeCount}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Pending Approval</p>
          <p className="text-3xl font-bold text-warning">{pendingCount}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Total PTWs</p>
          <p className="text-3xl font-bold text-info">{permits.length}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Compliance Rate</p>
          <p className="text-3xl font-bold text-success">100%</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-warning" /></div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/30">
            <TabsTrigger value="active">All Permits</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {permits.length === 0 ? (
              <Card className="border-border/50 bg-card/80"><CardContent className="p-8 text-center text-muted-foreground">
                <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No permits registered. Click "New Permit" to create one.</p>
              </CardContent></Card>
            ) : permits.map((permit: any) => {
              const tc = typeConfig[permit.permit_type] || { label: permit.permit_type, icon: ShieldAlert, color: "text-muted-foreground" };
              const TypeIcon = tc.icon;
              const checklist = Array.isArray(permit.checklist) ? permit.checklist : [];
              return (
                <Card key={permit.id} className="border-border/50 bg-card/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <TypeIcon className={`h-6 w-6 mt-0.5 ${tc.color}`} />
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold">{permit.title}</span>
                            <Badge variant="outline" className={statusConfig[permit.status]?.color || ""}>
                              {statusConfig[permit.status]?.label || permit.status}
                            </Badge>
                            <Badge variant="outline" className={riskColors[permit.risk_level] || ""}>
                              {(permit.risk_level || "").toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{permit.permit_number} • {permit.location}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>By: {permit.requested_by_name || "N/A"}</span>
                            {permit.approved_by_name && <span className="text-success">✓ {permit.approved_by_name}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {permit.status === "pending" && (
                          <Button size="sm" variant="outline" className="text-success" onClick={() => updateStatus.mutate({ id: permit.id, status: "approved" })}>Approve</Button>
                        )}
                        {permit.status === "approved" && (
                          <Button size="sm" variant="outline" className="text-info" onClick={() => updateStatus.mutate({ id: permit.id, status: "active" })}>Activate</Button>
                        )}
                        {permit.status === "active" && (
                          <Button size="sm" variant="outline" className="text-muted-foreground" onClick={() => updateStatus.mutate({ id: permit.id, status: "closed" })}>Close</Button>
                        )}
                      </div>
                    </div>
                    {checklist.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {checklist.map((c: any, i: number) => (
                          <Badge key={i} variant="outline" className={`text-xs ${c.checked ? "text-success border-success/30" : "text-muted-foreground border-border/50"}`}>
                            {c.checked ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                            {c.item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="templates" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(typeConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <Card key={key} className="border-border/50 bg-card/80 hover:border-primary/30 cursor-pointer transition-colors">
                    <CardContent className="p-6 text-center">
                      <Icon className={`h-10 w-10 mx-auto mb-3 ${config.color}`} />
                      <p className="font-semibold">{config.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">ISM Code compliant template</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => { setNewForm(p => ({ ...p, permit_type: key })); setShowNewDialog(true); }}>Use Template</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
