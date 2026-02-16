/**
 * Crew Change Manager - vs Compas/MariApps
 * End-to-end crew change coordination with travel, documentation, and handover
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Plane, FileCheck, Clock, AlertTriangle, CheckCircle2, 
  Calendar, MapPin, Ship, ArrowRightLeft, Download, Plus 
} from "lucide-react";
import { toast } from "sonner";

interface CrewChange {
  id: string;
  vessel: string;
  port: string;
  date: string;
  signOnCount: number;
  signOffCount: number;
  status: "planning" | "confirmed" | "in_progress" | "completed";
  readiness: number;
  tasks: { name: string; done: boolean }[];
}

const mockChanges: CrewChange[] = [
  {
    id: "CC-001", vessel: "MV Atlantic Pioneer", port: "Rotterdam, NL",
    date: "2026-02-28", signOnCount: 8, signOffCount: 7,
    status: "confirmed", readiness: 78,
    tasks: [
      { name: "Visas confirmed", done: true },
      { name: "Flights booked", done: true },
      { name: "Medical certs valid", done: true },
      { name: "STCW docs verified", done: false },
      { name: "Hotel reserved", done: true },
      { name: "Launch arranged", done: false },
      { name: "Handover notes prepared", done: false },
    ]
  },
  {
    id: "CC-002", vessel: "MV Pacific Star", port: "Singapore, SG",
    date: "2026-03-15", signOnCount: 12, signOffCount: 11,
    status: "planning", readiness: 45,
    tasks: [
      { name: "Visas confirmed", done: true },
      { name: "Flights booked", done: false },
      { name: "Medical certs valid", done: true },
      { name: "STCW docs verified", done: false },
      { name: "Hotel reserved", done: false },
      { name: "Launch arranged", done: false },
      { name: "Handover notes prepared", done: false },
    ]
  },
  {
    id: "CC-003", vessel: "MV Northern Spirit", port: "Houston, US",
    date: "2026-02-20", signOnCount: 6, signOffCount: 6,
    status: "in_progress", readiness: 92,
    tasks: [
      { name: "Visas confirmed", done: true },
      { name: "Flights booked", done: true },
      { name: "Medical certs valid", done: true },
      { name: "STCW docs verified", done: true },
      { name: "Hotel reserved", done: true },
      { name: "Launch arranged", done: true },
      { name: "Handover notes prepared", done: false },
    ]
  },
];

const statusConfig = {
  planning: { label: "Planning", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  confirmed: { label: "Confirmed", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  in_progress: { label: "In Progress", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

export function CrewChangeManager() {
  const [activeTab, setActiveTab] = useState("overview");

  const totalOnSigners = mockChanges.reduce((s, c) => s + c.signOnCount, 0);
  const totalOffSigners = mockChanges.reduce((s, c) => s + c.signOffCount, 0);
  const avgReadiness = Math.round(mockChanges.reduce((s, c) => s + c.readiness, 0) / mockChanges.length);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-7 w-7 text-cyan-400" />
            Crew Change Manager
          </h1>
          <p className="text-muted-foreground">End-to-end crew rotation coordination • vs Compas/MariApps</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Crew change report exported")}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-1" /> New Change
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Planned Changes</p>
          <p className="text-3xl font-bold text-cyan-400">{mockChanges.length}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Sign-On / Sign-Off</p>
          <p className="text-3xl font-bold">{totalOnSigners}<span className="text-muted-foreground text-lg">/{totalOffSigners}</span></p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Avg Readiness</p>
          <p className="text-3xl font-bold text-amber-400">{avgReadiness}%</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Next Change</p>
          <p className="text-lg font-bold text-emerald-400">4 days</p>
        </CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checklist">Checklists</TabsTrigger>
          <TabsTrigger value="travel">Travel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {mockChanges.map(cc => (
            <Card key={cc.id} className="border-border/50 bg-card/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Ship className="h-4 w-4 text-cyan-400" />
                      <span className="font-semibold">{cc.vessel}</span>
                      <Badge variant="outline" className={statusConfig[cc.status].color}>
                        {statusConfig[cc.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{cc.port}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{cc.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm"><span className="text-emerald-400">↑{cc.signOnCount}</span> / <span className="text-rose-400">↓{cc.signOffCount}</span></div>
                    <p className="text-xs text-muted-foreground">On/Off</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={cc.readiness} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{cc.readiness}%</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {cc.tasks.map((t, i) => (
                    <Badge key={i} variant="outline" className={t.done ? "text-emerald-400 border-emerald-500/30" : "text-muted-foreground border-border/50"}>
                      {t.done ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-lg">Pre-Change Checklist</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {["Passport validity > 6 months", "Flag State endorsements current", "STCW certificates valid", "Medical fitness certificate", "Yellow fever vaccination", "Seaman's book up to date", "Drug & alcohol test completed", "Pre-embarkation briefing done", "COVID vaccination record", "Travel insurance confirmed"].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                  <CheckCircle2 className={`h-5 w-5 ${i < 6 ? "text-emerald-400" : "text-muted-foreground"}`} />
                  <span className={i < 6 ? "" : "text-muted-foreground"}>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="travel" className="mt-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Plane className="h-5 w-5" /> Travel Arrangements</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Capt. J. Silva", flight: "KL1050 GRU→AMS", date: "2026-02-27", status: "confirmed" },
                { name: "C/E M. Santos", flight: "SQ321 GRU→SIN", date: "2026-03-14", status: "pending" },
                { name: "2/O R. Lima", flight: "UA850 GIG→IAH", date: "2026-02-19", status: "confirmed" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.flight} • {t.date}</p>
                  </div>
                  <Badge variant="outline" className={t.status === "confirmed" ? "text-emerald-400 border-emerald-500/30" : "text-amber-400 border-amber-500/30"}>
                    {t.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
