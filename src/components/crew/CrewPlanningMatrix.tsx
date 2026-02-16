/**
 * Crew Planning Matrix - vs Compas/Stena
 * Vessel × Rank planning grid with gap analysis
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Users, Ship, AlertTriangle, CheckCircle2, Calendar,
  UserPlus, Clock, TrendingUp, BarChart3, Eye
} from "lucide-react";
import { toast } from "sonner";

interface VesselCrewSlot {
  rank: string;
  required: number;
  assigned: number;
  onLeave: number;
  crew: CrewAssignment[];
}

interface CrewAssignment {
  name: string;
  nationality: string;
  embarkedDate: string;
  disembarkDate: string;
  daysOnboard: number;
  maxTour: number;
  status: "onboard" | "leave" | "standby" | "relief_due";
}

interface VesselCrew {
  vessel: string;
  vesselType: string;
  flag: string;
  slots: VesselCrewSlot[];
  manning: number;
  compliance: number;
}

const VESSELS: VesselCrew[] = [
  {
    vessel: "MV Atlantic Pioneer", vesselType: "AHTS", flag: "🇳🇴",
    manning: 92, compliance: 95,
    slots: [
      { rank: "Master", required: 1, assigned: 1, onLeave: 0, crew: [{ name: "Capt. J. Silva", nationality: "BR", embarkedDate: "2026-01-05", disembarkDate: "2026-03-05", daysOnboard: 42, maxTour: 60, status: "onboard" }] },
      { rank: "Chief Officer", required: 1, assigned: 1, onLeave: 0, crew: [{ name: "C/O M. Santos", nationality: "BR", embarkedDate: "2026-01-15", disembarkDate: "2026-03-15", daysOnboard: 32, maxTour: 60, status: "onboard" }] },
      { rank: "2nd Officer", required: 1, assigned: 1, onLeave: 0, crew: [{ name: "2/O R. Oliveira", nationality: "BR", embarkedDate: "2025-12-20", disembarkDate: "2026-02-20", daysOnboard: 58, maxTour: 60, status: "relief_due" }] },
      { rank: "Chief Engineer", required: 1, assigned: 1, onLeave: 0, crew: [{ name: "C/E P. Costa", nationality: "PT", embarkedDate: "2026-01-10", disembarkDate: "2026-03-10", daysOnboard: 37, maxTour: 60, status: "onboard" }] },
      { rank: "2nd Engineer", required: 1, assigned: 0, onLeave: 1, crew: [] },
      { rank: "AB Seaman", required: 4, assigned: 3, onLeave: 0, crew: [
        { name: "AB T. Lima", nationality: "BR", embarkedDate: "2026-01-10", disembarkDate: "2026-03-10", daysOnboard: 37, maxTour: 90, status: "onboard" },
        { name: "AB F. Souza", nationality: "BR", embarkedDate: "2026-01-10", disembarkDate: "2026-03-10", daysOnboard: 37, maxTour: 90, status: "onboard" },
        { name: "AB C. Mendes", nationality: "PH", embarkedDate: "2026-02-01", disembarkDate: "2026-04-01", daysOnboard: 15, maxTour: 90, status: "onboard" },
      ]},
      { rank: "Oiler", required: 2, assigned: 2, onLeave: 0, crew: [
        { name: "Oiler A. Pereira", nationality: "BR", embarkedDate: "2026-01-05", disembarkDate: "2026-03-05", daysOnboard: 42, maxTour: 90, status: "onboard" },
        { name: "Oiler L. Alves", nationality: "BR", embarkedDate: "2026-01-15", disembarkDate: "2026-03-15", daysOnboard: 32, maxTour: 90, status: "onboard" },
      ]},
      { rank: "Cook", required: 1, assigned: 1, onLeave: 0, crew: [{ name: "Cook R. Dias", nationality: "BR", embarkedDate: "2026-01-20", disembarkDate: "2026-03-20", daysOnboard: 27, maxTour: 90, status: "onboard" }] },
    ]
  },
  {
    vessel: "MV Pacific Guardian", vesselType: "PSV", flag: "🇧🇷",
    manning: 100, compliance: 100,
    slots: [
      { rank: "Master", required: 1, assigned: 1, onLeave: 0, crew: [{ name: "Capt. A. Ferreira", nationality: "BR", embarkedDate: "2026-02-01", disembarkDate: "2026-04-01", daysOnboard: 15, maxTour: 60, status: "onboard" }] },
      { rank: "Chief Officer", required: 1, assigned: 1, onLeave: 0, crew: [{ name: "C/O D. Nunes", nationality: "BR", embarkedDate: "2026-02-01", disembarkDate: "2026-04-01", daysOnboard: 15, maxTour: 60, status: "onboard" }] },
      { rank: "Chief Engineer", required: 1, assigned: 1, onLeave: 0, crew: [{ name: "C/E H. Martins", nationality: "BR", embarkedDate: "2026-02-01", disembarkDate: "2026-04-01", daysOnboard: 15, maxTour: 60, status: "onboard" }] },
      { rank: "AB Seaman", required: 3, assigned: 3, onLeave: 0, crew: [] },
    ]
  },
];

function getSlotColor(assigned: number, required: number) {
  if (assigned >= required) return "bg-success/20 text-success border-success/30";
  if (assigned > 0) return "bg-warning/20 text-warning border-warning/30";
  return "bg-destructive/20 text-destructive border-destructive/30";
}

function getTourColor(daysOnboard: number, maxTour: number) {
  const pct = (daysOnboard / maxTour) * 100;
  if (pct >= 90) return "text-destructive font-bold";
  if (pct >= 75) return "text-warning font-medium";
  return "text-foreground";
}

export function CrewPlanningMatrix() {
  const [activeTab, setActiveTab] = useState("matrix");
  const [vesselFilter, setVesselFilter] = useState("all");

  const totalRequired = VESSELS.flatMap(v => v.slots).reduce((s, sl) => s + sl.required, 0);
  const totalAssigned = VESSELS.flatMap(v => v.slots).reduce((s, sl) => s + sl.assigned, 0);
  const reliefDue = VESSELS.flatMap(v => v.slots.flatMap(s => s.crew)).filter(c => c.status === "relief_due").length;
  const gaps = totalRequired - totalAssigned;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Crew Planning Matrix
          </h1>
          <p className="text-muted-foreground">Vessel × Rank grid • Tour tracking • Relief planning • STCW compliance</p>
        </div>
        <Button onClick={() => toast.success("Relief plan generated for next 90 days")}>
          <Calendar className="h-4 w-4 mr-2" />Generate Relief Plan
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><Users className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{totalAssigned}/{totalRequired}</p><p className="text-xs text-muted-foreground">Manning Level</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle2 className="h-5 w-5 mx-auto text-success mb-1" /><p className="text-2xl font-bold">{Math.round((totalAssigned / totalRequired) * 100)}%</p><p className="text-xs text-muted-foreground">Fill Rate</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-5 w-5 mx-auto text-destructive mb-1" /><p className="text-2xl font-bold">{gaps}</p><p className="text-xs text-muted-foreground">Open Positions</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="h-5 w-5 mx-auto text-warning mb-1" /><p className="text-2xl font-bold">{reliefDue}</p><p className="text-xs text-muted-foreground">Relief Due</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Ship className="h-5 w-5 mx-auto text-primary mb-1" /><p className="text-2xl font-bold">{VESSELS.length}</p><p className="text-xs text-muted-foreground">Vessels</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matrix">Manning Matrix</TabsTrigger>
          <TabsTrigger value="tour">Tour Tracker</TabsTrigger>
          <TabsTrigger value="relief">Relief Plan</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          {VESSELS.map(vessel => (
            <Card key={vessel.vessel}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {vessel.flag} {vessel.vessel}
                    <Badge variant="outline">{vessel.vesselType}</Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={vessel.compliance >= 95 ? "default" : "destructive"}>
                      {vessel.compliance}% STCW
                    </Badge>
                    <Badge variant="outline">{vessel.manning}% manned</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {vessel.slots.map(slot => (
                    <Tooltip key={slot.rank}>
                      <TooltipTrigger asChild>
                        <div className={`p-3 rounded-lg border text-center cursor-pointer transition-colors hover:opacity-80 ${getSlotColor(slot.assigned, slot.required)}`}>
                          <p className="text-xs font-medium truncate">{slot.rank}</p>
                          <p className="text-lg font-bold">{slot.assigned}/{slot.required}</p>
                          {slot.onLeave > 0 && <p className="text-xs">({slot.onLeave} leave)</p>}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">{slot.rank} - {vessel.vessel}</p>
                          {slot.crew.map(c => (
                            <p key={c.name} className="text-xs">{c.name} ({c.nationality}) - Day {c.daysOnboard}/{c.maxTour}</p>
                          ))}
                          {slot.assigned < slot.required && <p className="text-destructive text-xs">⚠️ {slot.required - slot.assigned} position(s) vacant</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tour" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crew Member</TableHead>
                  <TableHead>Vessel</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Embarked</TableHead>
                  <TableHead>Days Onboard</TableHead>
                  <TableHead>Max Tour</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VESSELS.flatMap(v => v.slots.flatMap(s => s.crew.map(c => ({ ...c, vessel: v.vessel, rank: s.rank })))).sort((a, b) => (b.daysOnboard / b.maxTour) - (a.daysOnboard / a.maxTour)).map(c => (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.vessel}</TableCell>
                    <TableCell>{c.rank}</TableCell>
                    <TableCell>{c.embarkedDate}</TableCell>
                    <TableCell className={getTourColor(c.daysOnboard, c.maxTour)}>{c.daysOnboard} days</TableCell>
                    <TableCell>{c.maxTour} days</TableCell>
                    <TableCell><Progress value={(c.daysOnboard / c.maxTour) * 100} className="h-2 w-20" /></TableCell>
                    <TableCell><Badge variant={c.status === "relief_due" ? "destructive" : "outline"}>{c.status.replace(/_/g, " ")}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="relief" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Relief Schedule - Next 90 Days</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { crew: "2/O R. Oliveira", vessel: "MV Atlantic Pioneer", date: "2026-02-20", replacement: "2/O K. Barros (standby)", urgency: "critical" },
                { crew: "Capt. J. Silva", vessel: "MV Atlantic Pioneer", date: "2026-03-05", replacement: "Capt. G. Rocha (confirmed)", urgency: "planned" },
                { crew: "C/O M. Santos", vessel: "MV Atlantic Pioneer", date: "2026-03-15", replacement: "Pending assignment", urgency: "action" },
                { crew: "C/E P. Costa", vessel: "MV Atlantic Pioneer", date: "2026-03-10", replacement: "C/E V. Fernandes (confirmed)", urgency: "planned" },
              ].map(r => (
                <div key={r.crew} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                  <div>
                    <p className="font-medium text-sm">{r.crew} → {r.vessel}</p>
                    <p className="text-xs text-muted-foreground">Relief: {r.date} • {r.replacement}</p>
                  </div>
                  <Badge variant={r.urgency === "critical" ? "destructive" : r.urgency === "action" ? "secondary" : "outline"}>
                    {r.urgency}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Manning by Nationality</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { nat: "🇧🇷 Brazil", count: 12, pct: 67 },
                  { nat: "🇵🇹 Portugal", count: 3, pct: 17 },
                  { nat: "🇵🇭 Philippines", count: 2, pct: 11 },
                  { nat: "🇮🇳 India", count: 1, pct: 5 },
                ].map(n => (
                  <div key={n.nat} className="space-y-1">
                    <div className="flex justify-between text-sm"><span>{n.nat}</span><span>{n.count} ({n.pct}%)</span></div>
                    <Progress value={n.pct} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Average Tour Duration</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { rank: "Officers", avg: 48, max: 60, pct: 80 },
                  { rank: "Ratings", avg: 62, max: 90, pct: 69 },
                  { rank: "Catering", avg: 45, max: 90, pct: 50 },
                ].map(r => (
                  <div key={r.rank} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div><p className="font-medium text-sm">{r.rank}</p><p className="text-xs text-muted-foreground">Avg {r.avg} / Max {r.max} days</p></div>
                    <p className="text-lg font-bold">{r.pct}%</p>
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

export default CrewPlanningMatrix;
