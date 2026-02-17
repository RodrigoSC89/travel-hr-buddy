/**
 * Ship Vetting Manager - vs RightShip / OCIMF SIRE / CDI
 * INTEGRATED with Supabase backend
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Shield, Star, AlertTriangle, CheckCircle2, Clock,
  Ship, Download, Plus, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { quickExport } from "@/lib/export-utils";

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/20 text-primary border-primary/30",
  in_progress: "bg-info/20 text-info border-info/30",
  completed: "bg-success/20 text-success border-success/30",
  overdue: "bg-destructive/20 text-destructive border-destructive/30",
};

export function ShipVettingManager() {
  const [tab, setTab] = useState("inspections");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newForm, setNewForm] = useState({ vessel_name: "", inspection_type: "SIRE", port: "", inspection_date: "", inspector_name: "" });
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["ship-vetting-records"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("ship_vetting_records")
        .select("*")
        .order("inspection_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: typeof newForm) => {
      const { error } = await (supabase.from as Function)("ship_vetting_records").insert({
        vessel_name: form.vessel_name,
        inspection_type: form.inspection_type,
        port: form.port,
        inspection_date: form.inspection_date,
        inspector_name: form.inspector_name,
        status: "scheduled",
        overall_score: 0,
        observations_count: 0,
        critical_findings: 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ship-vetting-records"] });
      setShowNewDialog(false);
      setNewForm({ vessel_name: "", inspection_type: "SIRE", port: "", inspection_date: "", inspector_name: "" });
      toast.success("Vetting inspection scheduled");
    },
    onError: (err: Error) => toast.error("Error: " + err.message),
  });

  const completeInspection = useMutation({
    mutationFn: async ({ id, score, findings }: { id: string; score: number; findings: number }) => {
      const { error } = await (supabase.from as Function)("ship_vetting_records").update({
        status: "completed",
        overall_score: score,
        observations_count: findings,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ship-vetting-records"] });
      toast.success("Inspection completed");
    },
  });

  const avgScore = records.filter((r: any) => r.status === "completed" && r.overall_score).length > 0
    ? (records.filter((r: any) => r.status === "completed").reduce((s: number, r: any) => s + (r.overall_score || 0), 0) / records.filter((r: any) => r.status === "completed").length).toFixed(1)
    : "—";

  return (
    <motion.div className="space-y-6 p-4 md:p-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-emerald-400" />
            Ship Vetting Manager
          </h1>
          <p className="text-muted-foreground">SIRE 2.0, CDI, RightShip GHG rating tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => quickExport(records.map((r: any) => ({ Vessel: r.vessel_name, Type: r.inspection_type, Port: r.port, Date: r.inspection_date, Inspector: r.inspector_name, Score: r.overall_score, Findings: r.observations_count, Status: r.status })), "Ship Vetting Report")}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-success hover:bg-success/90">
                <Plus className="h-4 w-4 mr-1" /> New Inspection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule Vetting Inspection</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Vessel Name</Label><Input value={newForm.vessel_name} onChange={e => setNewForm(p => ({ ...p, vessel_name: e.target.value }))} /></div>
                <div><Label>Type</Label>
                  <Select value={newForm.inspection_type} onValueChange={v => setNewForm(p => ({ ...p, inspection_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIRE">SIRE 2.0</SelectItem>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="RightShip">RightShip</SelectItem>
                      <SelectItem value="Internal">Internal</SelectItem>
                      <SelectItem value="Oil_Major">Oil Major</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Port</Label><Input value={newForm.port} onChange={e => setNewForm(p => ({ ...p, port: e.target.value }))} /></div>
                <div><Label>Date</Label><Input type="date" value={newForm.inspection_date} onChange={e => setNewForm(p => ({ ...p, inspection_date: e.target.value }))} /></div>
                <div><Label>Inspector</Label><Input value={newForm.inspector_name} onChange={e => setNewForm(p => ({ ...p, inspector_name: e.target.value }))} /></div>
                <Button className="w-full" onClick={() => createMutation.mutate(newForm)} disabled={createMutation.isPending || !newForm.vessel_name}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Schedule Inspection
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Fleet Avg Score</p>
          <p className="text-3xl font-bold text-emerald-400">{avgScore}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Inspections</p>
          <p className="text-3xl font-bold text-cyan-400">{records.length}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Open Findings</p>
          <p className="text-3xl font-bold text-amber-400">{records.reduce((s: number, r: any) => s + (r.observations_count || 0), 0)}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Scheduled</p>
          <p className="text-3xl font-bold text-primary">{records.filter((r: any) => r.status === "scheduled").length}</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted/30">
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="matrix">Approval Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="inspections" className="space-y-4 mt-4">
            {records.length === 0 ? (
              <Card className="border-border/50 bg-card/80"><CardContent className="p-8 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No vetting records. Schedule your first inspection.</p>
              </CardContent></Card>
            ) : records.map((rec: any) => (
              <Card key={rec.id} className="border-border/50 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Ship className="h-4 w-4 text-cyan-400" />
                        <span className="font-semibold">{rec.vessel_name}</span>
                        <Badge variant="outline">{rec.inspection_type}</Badge>
                        <Badge variant="outline" className={statusColors[rec.status] || ""}>
                          {rec.status?.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rec.inspector_name || "TBD"} • {rec.inspection_date || "TBD"} • {rec.port || "TBD"}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      {rec.status === "completed" && rec.overall_score > 0 && (
                        <p className="text-2xl font-bold">{rec.overall_score}<span className="text-sm text-muted-foreground">/100</span></p>
                      )}
                      {rec.status === "scheduled" && (
                        <Button size="sm" variant="outline" onClick={() => completeInspection.mutate({ id: rec.id, score: 92, findings: 2 })}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                  {rec.status === "completed" && rec.overall_score > 0 && (
                    <Progress value={rec.overall_score} className="h-2 mt-3" />
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="matrix" className="mt-4">
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg">Oil Major Approval Matrix</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-left p-2">Vessel</th>
                        <th className="text-center p-2">Shell</th>
                        <th className="text-center p-2">BP</th>
                        <th className="text-center p-2">TotalEnergies</th>
                        <th className="text-center p-2">ExxonMobil</th>
                        <th className="text-center p-2">Chevron</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([...new Set(records.map((r: any) => r.vessel_name))] as string[]).slice(0, 6).map((vessel: string) => (
                        <tr key={vessel} className="border-b border-border/20">
                          <td className="p-2 font-medium">{vessel}</td>
                          {[0,1,2,3,4].map(j => (
                            <td key={j} className="text-center p-2">
                              {records.some((r: any) => r.vessel_name === vessel && r.status === "completed") ? 
                                <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto" /> : 
                                <Clock className="h-5 w-5 text-amber-400 mx-auto" />
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {records.length === 0 && <p className="text-center text-muted-foreground py-4">Add inspections to populate the matrix</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
