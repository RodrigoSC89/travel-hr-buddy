/**
 * Port State Control History - vs Equasis / Paris MoU THETIS
 * REAL DATA from Supabase psc_inspections table
 */
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations/motion-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, Ship, MapPin, AlertTriangle,
  Clock, Download
} from "lucide-react";
import { toast } from "sonner";
import { quickExport } from "@/lib/export-utils";

const riskColors: Record<string, string> = {
  low: "bg-success/20 text-success border-success/30",
  standard: "bg-warning/20 text-warning border-warning/30",
  high: "bg-destructive/20 text-destructive border-destructive/30",
};

function getRiskProfile(deficiencies: number, detained: boolean): string {
  if (detained || deficiencies >= 5) return "high";
  if (deficiencies >= 3) return "standard";
  return "low";
}

function usePSCInspections() {
  return useQuery({
    queryKey: ["psc-inspections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("psc_inspections")
        .select("*, vessels(name)")
        .order("inspection_date", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

export function PortStateControlHistory() {
  const { data: records = [], isLoading } = usePSCInspections();
  const [tab, setTab] = useState("history");

  const totalInspections = records.length;
  const totalDeficiencies = useMemo(() => records.reduce((s: number, r: any) => s + (r.deficiencies_count || 0), 0), [records]);
  const detentions = useMemo(() => records.filter((r: any) => r.detention).length, [records]);
  const detentionRate = totalInspections > 0 ? ((detentions / totalInspections) * 100).toFixed(1) : "0.0";
  const avgDefPerInspection = totalInspections > 0 ? (totalDeficiencies / totalInspections).toFixed(1) : "0.0";

  const handleExport = useCallback(() => {
    const exportData = records.map((r: any) => ({
      Vessel: r.vessels?.name || "—",
      Port: `${r.port_name}, ${r.port_country}`,
      Date: r.inspection_date,
      Authority: r.port_state_authority || "—",
      Type: r.inspection_type || "initial",
      Deficiencies: r.deficiencies_count || 0,
      Detained: r.detention ? "Yes" : "No",
      Risk: getRiskProfile(r.deficiencies_count || 0, r.detention),
    }));
    quickExport(exportData, "PSC_History");
    toast.success("PSC history exported");
  }, [records]);

  if (isLoading) {
    return <div className="space-y-4 p-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

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
          <p className="text-xs text-muted-foreground">Inspections</p>
          <p className="text-3xl font-bold text-info">{totalInspections}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Deficiencies</p>
          <p className="text-3xl font-bold text-warning">{totalDeficiencies}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Detentions</p>
          <p className="text-3xl font-bold text-destructive">{detentions}</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Detention Rate</p>
          <p className="text-3xl font-bold">{detentionRate}%</p>
        </CardContent></Card>
        <Card className="border-border/50 bg-card/80"><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Avg Def/Inspection</p>
          <p className="text-3xl font-bold text-info">{avgDefPerInspection}</p>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="history">Inspection History</TabsTrigger>
          <TabsTrigger value="risk">Risk Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-3 mt-4">
          {records.length === 0 ? (
            <Card className="border-border/50 bg-card/80"><CardContent className="p-8 text-center text-muted-foreground">Nenhuma inspeção PSC registrada.</CardContent></Card>
          ) : records.map((rec: any) => {
            const risk = getRiskProfile(rec.deficiencies_count || 0, rec.detention);
            return (
              <Card key={rec.id} className="border-border/50 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Ship className="h-4 w-4 text-info" />
                        <span className="font-semibold">{rec.vessels?.name || "Vessel"}</span>
                        {rec.detention && <Badge variant="destructive" className="text-xs">DETAINED</Badge>}
                        <Badge variant="outline" className={riskColors[risk]}>{risk}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{rec.port_name}, {rec.port_country}</span>
                        <span>{rec.port_state_authority || "—"}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rec.inspection_date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{rec.deficiencies_count || 0} <span className="text-sm text-muted-foreground">def.</span></p>
                      <p className="text-xs text-muted-foreground">{rec.inspection_type || "initial"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              // Group by vessel
              const vesselMap = new Map<string, { name: string; inspections: number; deficiencies: number; detained: boolean }>();
              records.forEach((r: any) => {
                const vName = r.vessels?.name || "Unknown";
                const existing = vesselMap.get(vName) || { name: vName, inspections: 0, deficiencies: 0, detained: false };
                existing.inspections++;
                existing.deficiencies += r.deficiencies_count || 0;
                if (r.detention) existing.detained = true;
                vesselMap.set(vName, existing);
              });
              const vessels = Array.from(vesselMap.values());
              if (vessels.length === 0) return <p className="text-center text-muted-foreground py-8 col-span-2">Sem dados de risco</p>;
              return vessels.map(v => {
                const risk = getRiskProfile(v.deficiencies, v.detained);
                const score = Math.max(0, 100 - v.deficiencies * 5 - (v.detained ? 20 : 0));
                return (
                  <Card key={v.name} className="border-border/50 bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold flex items-center gap-2">
                          <Ship className="h-4 w-4 text-info" />{v.name}
                        </span>
                        <Badge variant="outline" className={riskColors[risk]}>{risk} risk</Badge>
                      </div>
                      <Progress value={score} className="h-2 mb-1" />
                      <p className="text-xs text-muted-foreground">PSC Readiness Score: {score}% • {v.inspections} inspections</p>
                    </CardContent>
                  </Card>
                );
              });
            })()}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
