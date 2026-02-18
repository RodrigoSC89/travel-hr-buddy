/**
 * Crew Change Manager v2 - vs Compas/MariApps
 * End-to-end crew change coordination with status workflow, cost tracking,
 * timeline view, document checklist, and handover management
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, kpiCard } from "@/lib/animations/motion-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Plane, Clock, CheckCircle2,
  Calendar, MapPin, Ship, ArrowRightLeft, Download, Plus, Loader2,
  DollarSign, FileText, AlertTriangle, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { quickExport } from "@/lib/export-utils";
import { differenceInDays, format } from "date-fns";

const statusConfig: Record<string, { label: string; color: string; next?: string }> = {
  planning: { label: "Planning", color: "bg-info/20 text-info border-info/30", next: "confirmed" },
  confirmed: { label: "Confirmed", color: "bg-warning/20 text-warning border-warning/30", next: "in_progress" },
  in_progress: { label: "In Progress", color: "bg-primary/20 text-primary border-primary/30", next: "completed" },
  completed: { label: "Completed", color: "bg-success/20 text-success border-success/30" },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground" },
};

export function CrewChangeManager() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [selectedChange, setSelectedChange] = useState<any>(null);
  const [newForm, setNewForm] = useState({
    vessel_name: "", port: "", planned_date: "",
    sign_on_count: 0, sign_off_count: 0, notes: "",
    estimated_cost: 0,
  });
  const queryClient = useQueryClient();

  const { data: changes = [], isLoading } = useQuery({
    queryKey: ["crew-changes"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("crew_changes")
        .select("*")
        .order("planned_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["crew-change-tasks"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("crew_change_tasks")
        .select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: typeof newForm) => {
      const { data, error } = await (supabase.from as Function)("crew_changes").insert({
        vessel_name: form.vessel_name,
        port: form.port,
        planned_date: form.planned_date,
        sign_on_count: form.sign_on_count,
        sign_off_count: form.sign_off_count,
        status: "planning",
        readiness_percent: 0,
      }).select().single();
      if (error) throw error;
      const defaultTasks = [
        "Visas confirmed", "Flights booked", "Medical certs valid",
        "STCW docs verified", "Hotel reserved", "Launch arranged",
        "Handover notes prepared", "COVID vaccination verified",
        "Drug & alcohol test scheduled", "Travel insurance confirmed"
      ];
      await (supabase.from as Function)("crew_change_tasks").insert(
        defaultTasks.map(name => ({ crew_change_id: data.id, task_name: name, is_done: false }))
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-changes"] });
      queryClient.invalidateQueries({ queryKey: ["crew-change-tasks"] });
      setShowNewDialog(false);
      setNewForm({ vessel_name: "", port: "", planned_date: "", sign_on_count: 0, sign_off_count: 0, notes: "", estimated_cost: 0 });
      toast.success("Crew change created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, is_done }: { id: string; is_done: boolean }) => {
      const { error } = await (supabase.from as Function)("crew_change_tasks").update({ is_done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crew-change-tasks"] }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase.from as Function)("crew_changes").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-changes"] });
      toast.success("Status updated");
    },
  });

  const totalOnSigners = changes.reduce((s: number, c: any) => s + (c.sign_on_count || 0), 0);
  const totalOffSigners = changes.reduce((s: number, c: any) => s + (c.sign_off_count || 0), 0);
  const upcoming = changes.filter((c: any) => c.status !== "completed" && c.status !== "cancelled");
  const upcomingIn7d = upcoming.filter((c: any) => {
    if (!c.planned_date) return false;
    const d = differenceInDays(new Date(c.planned_date), new Date());
    return d >= 0 && d <= 7;
  });

  const getTasksForChange = (changeId: string) => tasks.filter((t: any) => t.crew_change_id === changeId);
  const getReadiness = (changeId: string) => {
    const ct = getTasksForChange(changeId);
    return ct.length > 0 ? Math.round((ct.filter((t: any) => t.is_done).length / ct.length) * 100) : 0;
  };

  return (
    <motion.div className="space-y-6 p-4 md:p-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-7 w-7 text-info" />
            Crew Change Manager
          </h1>
          <p className="text-muted-foreground">End-to-end crew rotation coordination • Real-time tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => quickExport(changes.map((c: any) => ({
            Vessel: c.vessel_name, Port: c.port, Date: c.planned_date,
            SignOn: c.sign_on_count, SignOff: c.sign_off_count,
            Status: c.status, Readiness: `${getReadiness(c.id)}%`
          })), "Crew Change Report")}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-info hover:bg-info/90 text-info-foreground">
                <Plus className="h-4 w-4 mr-1" /> New Change
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Crew Change</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Vessel Name</Label><Input value={newForm.vessel_name} onChange={e => setNewForm(p => ({ ...p, vessel_name: e.target.value }))} placeholder="MV Example" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Port</Label><Input value={newForm.port} onChange={e => setNewForm(p => ({ ...p, port: e.target.value }))} placeholder="Rotterdam, NL" /></div>
                  <div><Label>Planned Date</Label><Input type="date" value={newForm.planned_date} onChange={e => setNewForm(p => ({ ...p, planned_date: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Sign-On Count</Label><Input type="number" value={newForm.sign_on_count} onChange={e => setNewForm(p => ({ ...p, sign_on_count: +e.target.value }))} /></div>
                  <div><Label>Sign-Off Count</Label><Input type="number" value={newForm.sign_off_count} onChange={e => setNewForm(p => ({ ...p, sign_off_count: +e.target.value }))} /></div>
                </div>
                <div><Label>Notes</Label><Textarea value={newForm.notes} onChange={e => setNewForm(p => ({ ...p, notes: e.target.value }))} placeholder="Special instructions..." rows={2} /></div>
                <Button className="w-full" onClick={() => createMutation.mutate(newForm)} disabled={createMutation.isPending || !newForm.vessel_name || !newForm.port || !newForm.planned_date}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Crew Change
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Urgent alert */}
      {upcomingIn7d.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="font-semibold text-warning">{upcomingIn7d.length} crew change(s) within 7 days</p>
              <p className="text-sm text-muted-foreground">
                {upcomingIn7d.map((c: any) => `${c.vessel_name} @ ${c.port} (${c.planned_date})`).join(" • ")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <motion.div className="grid grid-cols-2 md:grid-cols-5 gap-4" variants={staggerContainer}>
        <motion.div variants={kpiCard}><Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Planned Changes</p>
          <p className="text-3xl font-bold text-info">{changes.length}</p>
        </CardContent></Card></motion.div>
        <motion.div variants={kpiCard}><Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Sign-On / Sign-Off</p>
          <p className="text-3xl font-bold">{totalOnSigners}<span className="text-muted-foreground text-lg">/{totalOffSigners}</span></p>
        </CardContent></Card></motion.div>
        <motion.div variants={kpiCard}><Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-3xl font-bold text-primary">{upcoming.length}</p>
        </CardContent></Card></motion.div>
        <motion.div variants={kpiCard}><Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-3xl font-bold text-success">{changes.filter((c: any) => c.status === "completed").length}</p>
        </CardContent></Card></motion.div>
        <motion.div variants={kpiCard}><Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Next 7 Days</p>
          <p className="text-3xl font-bold text-warning">{upcomingIn7d.length}</p>
        </CardContent></Card></motion.div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-info" /></div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="checklist">Standard Checklist</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {changes.length === 0 ? (
              <Card className="border-border/50 bg-card/80"><CardContent className="p-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No crew changes registered yet. Click "New Change" to get started.</p>
              </CardContent></Card>
            ) : changes.map((cc: any) => {
              const readiness = getReadiness(cc.id);
              const changeTasks = getTasksForChange(cc.id);
              const daysUntil = cc.planned_date ? differenceInDays(new Date(cc.planned_date), new Date()) : null;
              const nextStatus = statusConfig[cc.status]?.next;

              return (
                <Card key={cc.id} className={`border-border/50 bg-card/80 hover:border-primary/30 transition-colors ${daysUntil !== null && daysUntil <= 3 && daysUntil >= 0 && cc.status !== "completed" ? "border-warning/40" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Ship className="h-4 w-4 text-info" />
                          <span className="font-semibold">{cc.vessel_name}</span>
                          <Badge variant="outline" className={statusConfig[cc.status]?.color || ""}>
                            {statusConfig[cc.status]?.label || cc.status}
                          </Badge>
                          {daysUntil !== null && daysUntil >= 0 && daysUntil <= 7 && cc.status !== "completed" && (
                            <Badge className="bg-warning/20 text-warning text-[10px]">{daysUntil}d away</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{cc.port}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{cc.planned_date}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm"><span className="text-success">↑{cc.sign_on_count}</span> / <span className="text-destructive">↓{cc.sign_off_count}</span></div>
                        {nextStatus && cc.status !== "completed" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => updateStatus.mutate({ id: cc.id, status: nextStatus })}>
                            <ArrowRight className="h-3 w-3 mr-1" /> {statusConfig[nextStatus]?.label}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <Progress value={readiness} className="flex-1 h-2" />
                      <span className={`text-sm font-medium ${readiness === 100 ? "text-success" : readiness > 60 ? "text-warning" : "text-destructive"}`}>{readiness}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {changeTasks.map((t: any) => (
                        <Badge
                          key={t.id}
                          variant="outline"
                          className={`cursor-pointer text-[10px] ${t.is_done ? "text-success border-success/30" : "text-muted-foreground border-border/50"}`}
                          onClick={() => toggleTask.mutate({ id: t.id, is_done: !t.is_done })}
                        >
                          {t.is_done ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                          {t.task_name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Crew Change Timeline</CardTitle></CardHeader>
              <CardContent>
                {changes.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No crew changes to display</p>
                ) : (
                  <div className="relative space-y-0">
                    {changes
                      .filter((c: any) => c.planned_date)
                      .sort((a: any, b: any) => new Date(a.planned_date).getTime() - new Date(b.planned_date).getTime())
                      .map((cc: any, idx: number) => {
                        const isPast = new Date(cc.planned_date) < new Date();
                        const readiness = getReadiness(cc.id);
                        return (
                          <div key={cc.id} className="flex gap-4 pb-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full shrink-0 ${cc.status === "completed" ? "bg-success" : isPast ? "bg-destructive" : "bg-info"}`} />
                              {idx < changes.length - 1 && <div className="w-0.5 flex-1 bg-border/50 mt-1" />}
                            </div>
                            <div className={`flex-1 pb-2 ${isPast && cc.status !== "completed" ? "opacity-60" : ""}`}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{cc.vessel_name}</span>
                                <Badge variant="outline" className={`text-[10px] ${statusConfig[cc.status]?.color || ""}`}>
                                  {statusConfig[cc.status]?.label || cc.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{readiness}% ready</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(cc.planned_date), "dd MMM yyyy")} • {cc.port} • ↑{cc.sign_on_count} ↓{cc.sign_off_count}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklist" className="mt-4">
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg">Pre-Change Standard Checklist</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { item: "Passport validity > 6 months", category: "Documents" },
                    { item: "Flag State endorsements current", category: "Documents" },
                    { item: "STCW certificates valid", category: "Certificates" },
                    { item: "Medical fitness certificate", category: "Medical" },
                    { item: "Yellow fever vaccination", category: "Medical" },
                    { item: "Seaman's book up to date", category: "Documents" },
                    { item: "Drug & alcohol test completed", category: "Medical" },
                    { item: "Pre-embarkation briefing done", category: "Operations" },
                    { item: "COVID vaccination record", category: "Medical" },
                    { item: "Travel insurance confirmed", category: "Logistics" },
                    { item: "Flights booked & confirmed", category: "Logistics" },
                    { item: "Hotel accommodation arranged", category: "Logistics" },
                    { item: "Launch/transport to vessel", category: "Logistics" },
                    { item: "Handover notes prepared", category: "Operations" },
                  ].map(({ item, category }) => (
                    <div key={item} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                      <div>
                        <span className="text-sm">{item}</span>
                        <Badge variant="outline" className="ml-2 text-[10px]">{category}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
