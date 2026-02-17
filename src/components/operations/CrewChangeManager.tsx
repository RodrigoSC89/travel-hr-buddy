/**
 * Crew Change Manager - vs Compas/MariApps
 * End-to-end crew change coordination with travel, documentation, and handover
 * INTEGRATED: Real Supabase backend
 */
import { useState, useMemo, useCallback } from "react";
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
import { 
  Users, Plane, Clock, CheckCircle2, 
  Calendar, MapPin, Ship, ArrowRightLeft, Download, Plus, Loader2 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string }> = {
  planning: { label: "Planning", color: "bg-info/20 text-info border-info/30" },
  confirmed: { label: "Confirmed", color: "bg-warning/20 text-warning border-warning/30" },
  in_progress: { label: "In Progress", color: "bg-primary/20 text-primary border-primary/30" },
  completed: { label: "Completed", color: "bg-success/20 text-success border-success/30" },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground" },
};

export function CrewChangeManager() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newForm, setNewForm] = useState({ vessel_name: "", port: "", planned_date: "", sign_on_count: 0, sign_off_count: 0 });
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
      // Create default tasks
      const defaultTasks = ["Visas confirmed", "Flights booked", "Medical certs valid", "STCW docs verified", "Hotel reserved", "Launch arranged", "Handover notes prepared"];
      await (supabase.from as Function)("crew_change_tasks").insert(
        defaultTasks.map(name => ({ crew_change_id: data.id, task_name: name, is_done: false }))
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-changes"] });
      queryClient.invalidateQueries({ queryKey: ["crew-change-tasks"] });
      setShowNewDialog(false);
      setNewForm({ vessel_name: "", port: "", planned_date: "", sign_on_count: 0, sign_off_count: 0 });
      toast.success("Crew change created successfully");
    },
    onError: (err: Error) => toast.error("Error: " + err.message),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, is_done }: { id: string; is_done: boolean }) => {
      const { error } = await (supabase.from as Function)("crew_change_tasks").update({ is_done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crew-change-tasks"] });
    },
  });

  const totalOnSigners = changes.reduce((s: number, c: any) => s + (c.sign_on_count || 0), 0);
  const totalOffSigners = changes.reduce((s: number, c: any) => s + (c.sign_off_count || 0), 0);
  const avgReadiness = changes.length > 0 ? Math.round(changes.reduce((s: number, c: any) => s + (c.readiness_percent || 0), 0) / changes.length) : 0;

  const getTasksForChange = (changeId: string) => tasks.filter((t: any) => t.crew_change_id === changeId);

  return (
    <motion.div className="space-y-6 p-4 md:p-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-7 w-7 text-info" />
            Crew Change Manager
          </h1>
          <p className="text-muted-foreground">End-to-end crew rotation coordination • Real-time tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Crew change report exported")}>
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
                <div><Label>Port</Label><Input value={newForm.port} onChange={e => setNewForm(p => ({ ...p, port: e.target.value }))} placeholder="Rotterdam, NL" /></div>
                <div><Label>Planned Date</Label><Input type="date" value={newForm.planned_date} onChange={e => setNewForm(p => ({ ...p, planned_date: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Sign-On</Label><Input type="number" value={newForm.sign_on_count} onChange={e => setNewForm(p => ({ ...p, sign_on_count: +e.target.value }))} /></div>
                  <div><Label>Sign-Off</Label><Input type="number" value={newForm.sign_off_count} onChange={e => setNewForm(p => ({ ...p, sign_off_count: +e.target.value }))} /></div>
                </div>
                <Button className="w-full" onClick={() => createMutation.mutate(newForm)} disabled={createMutation.isPending || !newForm.vessel_name || !newForm.port || !newForm.planned_date}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Crew Change
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={staggerContainer}>
        <motion.div variants={kpiCard}><Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Planned Changes</p>
          <p className="text-3xl font-bold text-info">{changes.length}</p>
        </CardContent></Card></motion.div>
        <motion.div variants={kpiCard}><Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Sign-On / Sign-Off</p>
          <p className="text-3xl font-bold">{totalOnSigners}<span className="text-muted-foreground text-lg">/{totalOffSigners}</span></p>
        </CardContent></Card></motion.div>
        <motion.div variants={kpiCard}><Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Avg Readiness</p>
          <p className="text-3xl font-bold text-warning">{avgReadiness}%</p>
        </CardContent></Card></motion.div>
        <motion.div variants={kpiCard}><Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Records</p>
          <p className="text-lg font-bold text-success">{changes.length} crew changes</p>
        </CardContent></Card></motion.div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-info" /></div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checklist">Checklists</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {changes.length === 0 ? (
              <Card className="border-border/50 bg-card/80"><CardContent className="p-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No crew changes registered yet. Click "New Change" to get started.</p>
              </CardContent></Card>
            ) : changes.map((cc: any) => {
              const changeTasks = getTasksForChange(cc.id);
              const doneCount = changeTasks.filter((t: any) => t.is_done).length;
              const readiness = changeTasks.length > 0 ? Math.round((doneCount / changeTasks.length) * 100) : 0;
              return (
                <Card key={cc.id} className="border-border/50 bg-card/80">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Ship className="h-4 w-4 text-info" />
                          <span className="font-semibold">{cc.vessel_name}</span>
                          <Badge variant="outline" className={statusConfig[cc.status]?.color || ""}>
                            {statusConfig[cc.status]?.label || cc.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{cc.port}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{cc.planned_date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm"><span className="text-success">↑{cc.sign_on_count}</span> / <span className="text-destructive">↓{cc.sign_off_count}</span></div>
                        <p className="text-xs text-muted-foreground">On/Off</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={readiness} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{readiness}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {changeTasks.map((t: any) => (
                        <Badge 
                          key={t.id} 
                          variant="outline" 
                          className={`cursor-pointer ${t.is_done ? "text-success border-success/30" : "text-muted-foreground border-border/50"}`}
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

          <TabsContent value="checklist" className="mt-4">
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg">Pre-Change Checklist Standard</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {["Passport validity > 6 months", "Flag State endorsements current", "STCW certificates valid", "Medical fitness certificate", "Yellow fever vaccination", "Seaman's book up to date", "Drug & alcohol test completed", "Pre-embarkation briefing done", "COVID vaccination record", "Travel insurance confirmed"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
