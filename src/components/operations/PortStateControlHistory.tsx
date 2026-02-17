/**
 * Port State Control History - vs Equasis / Paris MoU THETIS
 * Fleet PSC inspection history, detention tracking, and risk profiling
 */
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, kpiCard } from "@/lib/animations/motion-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, Ship, MapPin, AlertTriangle, CheckCircle2,
  XCircle, Clock, Download, TrendingDown, Globe
} from "lucide-react";
import { toast } from "sonner";

interface PSCRecord {
  id: string;
  vessel: string;
  port: string;
  country: string;
  mouRegime: string;
  date: string;
  deficiencies: number;
  detainable: number;
  detained: boolean;
  inspectionType: "initial" | "more_detailed" | "expanded";
  riskProfile: "low" | "standard" | "high";
}

const mockRecords: PSCRecord[] = [
  { id: "PSC-001", vessel: "MV Atlantic Pioneer", port: "Rotterdam", country: "NL",
    mouRegime: "Paris MoU", date: "2026-01-20", deficiencies: 2, detainable: 0,
    detained: false, inspectionType: "initial", riskProfile: "low" },
  { id: "PSC-002", vessel: "MV Pacific Star", port: "Singapore", country: "SG",
    mouRegime: "Tokyo MoU", date: "2025-11-15", deficiencies: 0, detainable: 0,
    detained: false, inspectionType: "initial", riskProfile: "low" },
  { id: "PSC-003", vessel: "MV Northern Spirit", port: "Houston", country: "US",
    mouRegime: "USCG", date: "2025-12-05", deficiencies: 4, detainable: 1,
    detained: false, inspectionType: "more_detailed", riskProfile: "standard" },
  { id: "PSC-004", vessel: "MV Southern Cross", port: "Santos", country: "BR",
    mouRegime: "Viña del Mar", date: "2025-10-22", deficiencies: 1, detainable: 0,
    detained: false, inspectionType: "initial", riskProfile: "low" },
  { id: "PSC-005", vessel: "MV Indian Ocean", port: "Durban", country: "ZA",
    mouRegime: "Indian Ocean MoU", date: "2025-09-10", deficiencies: 6, detainable: 2,
    detained: true, inspectionType: "expanded", riskProfile: "high" },
];

const riskColors = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  standard: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export function PortStateControlHistory() {
  const [tab, setTab] = useState("history");

  const totalInspections = mockRecords.length;
  const totalDeficiencies = mockRecords.reduce((s, r) => s + r.deficiencies, 0);
  const detentions = mockRecords.filter(r => r.detained).length;
  const detentionRate = ((detentions / totalInspections) * 100).toFixed(1);

  const handleExport = useCallback(() => toast.success("PSC history exported"), []);

  return (
    <motion.div className="space-y-6 p-4 md:p-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-info" />
            Port State Control History
          </h1>
          <p className="text-muted-foreground">Fleet PSC performance tracker • Paris/Tokyo MoU, USCG • vs Equasis/THETIS</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Inspections (12m)</p>
          <p className="text-3xl font-bold text-cyan-400">{totalInspections}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Deficiencies</p>
          <p className="text-3xl font-bold text-amber-400">{totalDeficiencies}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Detentions</p>
          <p className="text-3xl font-bold text-rose-400">{detentions}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Detention Rate</p>
          <p className="text-3xl font-bold">{detentionRate}%</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Avg Def/Inspection</p>
          <p className="text-3xl font-bold text-cyan-400">{(totalDeficiencies / totalInspections).toFixed(1)}</p>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="history">Inspection History</TabsTrigger>
          <TabsTrigger value="deficiency">Deficiency Analysis</TabsTrigger>
          <TabsTrigger value="risk">Risk Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-3 mt-4">
          {mockRecords.map(rec => (
            <Card key={rec.id} className="border-border/50 bg-card/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Ship className="h-4 w-4 text-cyan-400" />
                      <span className="font-semibold">{rec.vessel}</span>
                      {rec.detained && <Badge variant="destructive" className="text-xs">DETAINED</Badge>}
                      <Badge variant="outline" className={riskColors[rec.riskProfile]}>{rec.riskProfile}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{rec.port}, {rec.country}</span>
                      <span>{rec.mouRegime}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rec.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{rec.deficiencies} <span className="text-sm text-muted-foreground">def.</span></p>
                    {rec.detainable > 0 && <p className="text-xs text-rose-400">{rec.detainable} detainable</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="deficiency" className="mt-4">
          <Card className="border-border/50 bg-card/80">
            <CardHeader><CardTitle className="text-lg">Top Deficiency Categories</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { cat: "Fire Safety", code: "07", count: 4, pct: 31 },
                { cat: "Life-Saving Appliances", code: "08", count: 3, pct: 23 },
                { cat: "Safety of Navigation", code: "09", count: 2, pct: 15 },
                { cat: "MARPOL Annex I", code: "13", count: 2, pct: 15 },
                { cat: "Working & Living Conditions", code: "14", count: 1, pct: 8 },
                { cat: "ISM Code", code: "15", count: 1, pct: 8 },
              ].map((d) => (
                <div key={d.code} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-6">{d.code}</span>
                  <span className="text-sm flex-1">{d.cat}</span>
                  <div className="w-32">
                    <Progress value={d.pct} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{d.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { vessel: "MV Atlantic Pioneer", risk: "low" as const, score: 95 },
              { vessel: "MV Pacific Star", risk: "low" as const, score: 95 },
              { vessel: "MV Northern Spirit", risk: "standard" as const, score: 72 },
              { vessel: "MV Southern Cross", risk: "low" as const, score: 88 },
            ].map(({ vessel, risk, score }) => {
              return (
                <Card key={vessel} className="border-border/50 bg-card/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold flex items-center gap-2">
                        <Ship className="h-4 w-4 text-cyan-400" />{vessel}
                      </span>
                      <Badge variant="outline" className={riskColors[risk]}>{risk} risk</Badge>
                    </div>
                    <Progress value={score} className="h-2 mb-1" />
                    <p className="text-xs text-muted-foreground">PSC Readiness Score: {score}%</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
