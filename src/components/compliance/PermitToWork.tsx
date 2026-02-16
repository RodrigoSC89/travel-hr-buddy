/**
 * Permit to Work (PTW) System - vs Compello/Maros/INX
 * Digital permit management for hot work, confined space, working at height, etc.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldAlert, Flame, Wind, Zap, Clock, CheckCircle2,
  AlertTriangle, Plus, Download, Users, Eye
} from "lucide-react";
import { toast } from "sonner";

interface Permit {
  id: string;
  type: "hot_work" | "confined_space" | "working_height" | "electrical" | "diving";
  title: string;
  location: string;
  requestedBy: string;
  approvedBy: string | null;
  status: "draft" | "pending" | "approved" | "active" | "closed" | "rejected";
  validFrom: string;
  validTo: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  checklist: { item: string; checked: boolean }[];
}

const typeConfig = {
  hot_work: { label: "Hot Work", icon: Flame, color: "text-orange-400" },
  confined_space: { label: "Confined Space", icon: Wind, color: "text-blue-400" },
  working_height: { label: "Working at Height", icon: Eye, color: "text-purple-400" },
  electrical: { label: "Electrical", icon: Zap, color: "text-yellow-400" },
  diving: { label: "Diving Ops", icon: Users, color: "text-cyan-400" },
};

const statusConfig = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  pending: { label: "Pending Approval", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  approved: { label: "Approved", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground" },
  rejected: { label: "Rejected", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
};

const riskColors = {
  low: "text-emerald-400 border-emerald-500/30",
  medium: "text-amber-400 border-amber-500/30",
  high: "text-orange-400 border-orange-500/30",
  critical: "text-rose-400 border-rose-500/30",
};

const mockPermits: Permit[] = [
  {
    id: "PTW-2026-001", type: "hot_work", title: "Welding repair - Main deck frame 42",
    location: "Main Deck, Frame 42", requestedBy: "C/O A. Ferreira",
    approvedBy: "Capt. J. Silva", status: "active", validFrom: "2026-02-16 08:00",
    validTo: "2026-02-16 17:00", riskLevel: "high",
    checklist: [
      { item: "Fire watch assigned", checked: true },
      { item: "Gas free certificate obtained", checked: true },
      { item: "Fire extinguishers on site", checked: true },
      { item: "Adjacent compartments checked", checked: true },
      { item: "Hot work area boundaries defined", checked: true },
    ]
  },
  {
    id: "PTW-2026-002", type: "confined_space", title: "Ballast tank inspection - DB5P",
    location: "Double Bottom Tank 5 Port", requestedBy: "2/O R. Lima",
    approvedBy: null, status: "pending", validFrom: "2026-02-17 06:00",
    validTo: "2026-02-17 14:00", riskLevel: "critical",
    checklist: [
      { item: "Atmosphere tested (O2, LEL, H2S)", checked: true },
      { item: "Rescue team standby", checked: false },
      { item: "Communication equipment tested", checked: true },
      { item: "Entry/exit procedures briefed", checked: false },
      { item: "Ventilation confirmed", checked: true },
    ]
  },
  {
    id: "PTW-2026-003", type: "working_height", title: "Antenna maintenance - Radar mast",
    location: "Radar Mast", requestedBy: "ETO M. Costa",
    approvedBy: "C/O A. Ferreira", status: "approved", validFrom: "2026-02-18 09:00",
    validTo: "2026-02-18 12:00", riskLevel: "medium",
    checklist: [
      { item: "Harness inspected", checked: true },
      { item: "Fall arrest system rigged", checked: true },
      { item: "Weather conditions acceptable", checked: true },
      { item: "Tool tethering in place", checked: false },
      { item: "Exclusion zone marked", checked: false },
    ]
  },
];

export function PermitToWork() {
  const [tab, setTab] = useState("active");

  const activeCount = mockPermits.filter(p => p.status === "active").length;
  const pendingCount = mockPermits.filter(p => p.status === "pending").length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-orange-400" />
            Permit to Work (PTW)
          </h1>
          <p className="text-muted-foreground">Digital permit management • ISM/ISPS compliant • vs Compello/INX</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("PTW report exported")}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-1" /> New Permit
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Active Permits</p>
          <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Pending Approval</p>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">This Month</p>
          <p className="text-3xl font-bold text-cyan-400">18</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Incident-Free Days</p>
          <p className="text-3xl font-bold text-emerald-400">147</p>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="active">All Permits</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {mockPermits.map(permit => {
            const TypeIcon = typeConfig[permit.type].icon;
            return (
              <Card key={permit.id} className="border-border/50 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <TypeIcon className={`h-6 w-6 mt-0.5 ${typeConfig[permit.type].color}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{permit.title}</span>
                          <Badge variant="outline" className={statusConfig[permit.status].color}>
                            {statusConfig[permit.status].label}
                          </Badge>
                          <Badge variant="outline" className={riskColors[permit.riskLevel]}>
                            {permit.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{permit.id} • {permit.location}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span><Clock className="h-3 w-3 inline mr-1" />{permit.validFrom} → {permit.validTo}</span>
                          <span>By: {permit.requestedBy}</span>
                          {permit.approvedBy && <span className="text-emerald-400">✓ {permit.approvedBy}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {permit.checklist.map((c, i) => (
                      <Badge key={i} variant="outline" className={c.checked ? "text-emerald-400 border-emerald-500/30 text-xs" : "text-muted-foreground border-border/50 text-xs"}>
                        {c.checked ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                        {c.item}
                      </Badge>
                    ))}
                  </div>
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
                    <Button variant="outline" size="sm" className="mt-3">Use Template</Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg">Permits by Type (YTD)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { type: "Hot Work", count: 45, pct: 35 },
                  { type: "Confined Space", count: 28, pct: 22 },
                  { type: "Working at Height", count: 32, pct: 25 },
                  { type: "Electrical", count: 15, pct: 12 },
                  { type: "Diving", count: 8, pct: 6 },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{s.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted/30 rounded-full h-2">
                        <div className="bg-cyan-400 h-2 rounded-full" style={{ width: `${s.pct}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8">{s.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80">
              <CardHeader><CardTitle className="text-lg">Safety Performance</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Total PTWs Issued (YTD)", value: "128" },
                  { label: "Avg Approval Time", value: "2.3h" },
                  { label: "Compliance Rate", value: "98.4%" },
                  { label: "Near-Miss Reports", value: "3" },
                  { label: "Incident-Free Streak", value: "147 days" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
