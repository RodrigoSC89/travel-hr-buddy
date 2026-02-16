/**
 * Ship Vetting Manager - vs RightShip / OCIMF SIRE / CDI
 * Comprehensive vetting inspection tracking and risk scoring
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, Star, AlertTriangle, CheckCircle2, Clock,
  Ship, FileText, Download, Eye, TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface VettingRecord {
  id: string;
  vessel: string;
  type: "SIRE" | "CDI" | "RightShip" | "Internal" | "Client";
  inspector: string;
  date: string;
  score: number;
  maxScore: number;
  findings: number;
  criticalFindings: number;
  status: "passed" | "conditional" | "failed" | "pending";
  expiryDate: string;
}

const mockRecords: VettingRecord[] = [
  { id: "VET-001", vessel: "MV Atlantic Pioneer", type: "SIRE", inspector: "OCIMF Inspector",
    date: "2026-01-15", score: 92, maxScore: 100, findings: 4, criticalFindings: 0,
    status: "passed", expiryDate: "2027-01-15" },
  { id: "VET-002", vessel: "MV Pacific Star", type: "RightShip", inspector: "RightShip GHG",
    date: "2025-11-20", score: 3.5, maxScore: 5, findings: 2, criticalFindings: 0,
    status: "passed", expiryDate: "2026-11-20" },
  { id: "VET-003", vessel: "MV Northern Spirit", type: "CDI", inspector: "CDI Auditor",
    date: "2026-02-01", score: 87, maxScore: 100, findings: 8, criticalFindings: 1,
    status: "conditional", expiryDate: "2027-02-01" },
  { id: "VET-004", vessel: "MV Southern Cross", type: "Client", inspector: "Shell Marine",
    date: "2026-02-10", score: 0, maxScore: 100, findings: 0, criticalFindings: 0,
    status: "pending", expiryDate: "-" },
];

const statusColors = {
  passed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  conditional: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  failed: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  pending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export function ShipVettingManager() {
  const [tab, setTab] = useState("inspections");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-emerald-400" />
            Ship Vetting Manager
          </h1>
          <p className="text-muted-foreground">SIRE 2.0, CDI, RightShip GHG rating • vs RightShip/OCIMF</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.success("Vetting report exported")}>
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Fleet Avg Score</p>
          <p className="text-3xl font-bold text-emerald-400">91.2</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Active Approvals</p>
          <p className="text-3xl font-bold text-cyan-400">12</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Open Findings</p>
          <p className="text-3xl font-bold text-amber-400">6</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">RightShip GHG</p>
          <div className="flex items-center justify-center gap-1">
            {[1,2,3].map(i => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
            <Star className="h-5 w-5 fill-amber-400/50 text-amber-400" />
            <Star className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="matrix">Approval Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="inspections" className="space-y-4 mt-4">
          {mockRecords.map(rec => (
            <Card key={rec.id} className="border-border/50 bg-card/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Ship className="h-4 w-4 text-cyan-400" />
                      <span className="font-semibold">{rec.vessel}</span>
                      <Badge variant="outline">{rec.type}</Badge>
                      <Badge variant="outline" className={statusColors[rec.status]}>
                        {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rec.inspector} • {rec.date} • Expires: {rec.expiryDate}
                    </p>
                  </div>
                  <div className="text-right">
                    {rec.status !== "pending" && (
                      <>
                        <p className="text-2xl font-bold">{rec.score}<span className="text-sm text-muted-foreground">/{rec.maxScore}</span></p>
                        <p className="text-xs text-muted-foreground">{rec.findings} findings ({rec.criticalFindings} critical)</p>
                      </>
                    )}
                    {rec.status === "pending" && <Badge className="bg-blue-500/20 text-blue-400">Scheduled</Badge>}
                  </div>
                </div>
                {rec.status !== "pending" && (
                  <Progress value={(rec.score / rec.maxScore) * 100} className="h-2 mt-3" />
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="findings" className="mt-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-lg">Open Findings Tracker</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { finding: "Emergency generator start-up time exceeded", vessel: "MV Northern Spirit", severity: "critical", deadline: "2026-02-28" },
                { finding: "ECDIS chart update overdue", vessel: "MV Atlantic Pioneer", severity: "major", deadline: "2026-03-05" },
                { finding: "LSA equipment maintenance records incomplete", vessel: "MV Atlantic Pioneer", severity: "minor", deadline: "2026-03-10" },
                { finding: "Ballast water treatment system calibration", vessel: "MV Northern Spirit", severity: "major", deadline: "2026-03-01" },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{f.finding}</p>
                    <p className="text-xs text-muted-foreground">{f.vessel} • Due: {f.deadline}</p>
                  </div>
                  <Badge variant="outline" className={
                    f.severity === "critical" ? "text-rose-400 border-rose-500/30" :
                    f.severity === "major" ? "text-amber-400 border-amber-500/30" :
                    "text-blue-400 border-blue-500/30"
                  }>{f.severity}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
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
                    {["MV Atlantic Pioneer", "MV Pacific Star", "MV Northern Spirit", "MV Southern Cross"].map((v, i) => (
                      <tr key={i} className="border-b border-border/20">
                        <td className="p-2 font-medium">{v}</td>
                        {[0,1,2,3,4].map(j => (
                          <td key={j} className="text-center p-2">
                            {Math.random() > 0.3 ? 
                              <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto" /> : 
                              <Clock className="h-5 w-5 text-amber-400 mx-auto" />
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
