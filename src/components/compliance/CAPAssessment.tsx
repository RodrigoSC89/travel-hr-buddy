/**
 * Condition Assessment Program (CAP) - vs DNV ShipManager
 * Hull & machinery condition grading with class survey integration
 */
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, kpiCard } from "@/lib/animations/motion-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield, Ship, AlertTriangle, CheckCircle2, Eye,
  Camera, FileText, BarChart3, Wrench, Target, Anchor
} from "lucide-react";
import { toast } from "sonner";
import { quickExport } from "@/lib/export-utils";

interface CAPInspection {
  id: string;
  vessel: string;
  inspectionDate: string;
  inspector: string;
  classificationSociety: string;
  overallRating: number; // 1-5 (1=very good, 5=very poor)
  areas: CAPArea[];
  status: "completed" | "in_progress" | "scheduled";
  nextDue: string;
  recommendations: string[];
}

interface CAPArea {
  name: string;
  category: "hull" | "machinery" | "cargo" | "safety" | "accommodation";
  rating: number; // 1-5
  subAreas: CAPSubArea[];
}

interface CAPSubArea {
  name: string;
  rating: number;
  findings: string;
  photos: number;
  condition: "satisfactory" | "fair" | "poor" | "deficient";
}

const INITIAL_INSPECTIONS: CAPInspection[] = [
  {
    id: "1", vessel: "MV Atlantic Pioneer", inspectionDate: "2026-01-20",
    inspector: "DNV GL Surveyor K. Hansen", classificationSociety: "DNV GL",
    overallRating: 2, status: "completed", nextDue: "2027-01-20",
    recommendations: [
      "Ballast tank #3 coating renewal recommended within 12 months",
      "Main engine turbocharger overhaul due at next drydock",
      "Replace deteriorated fire dampers in engine room ventilation"
    ],
    areas: [
      {
        name: "Hull Structure", category: "hull", rating: 2,
        subAreas: [
          { name: "Shell Plating", rating: 1, findings: "No significant corrosion", photos: 12, condition: "satisfactory" },
          { name: "Ballast Tanks", rating: 3, findings: "Coating breakdown in tank #3 (15% affected)", photos: 24, condition: "fair" },
          { name: "Deck Plating", rating: 2, findings: "Minor pitting on forecastle deck", photos: 8, condition: "satisfactory" },
          { name: "Bulkheads", rating: 2, findings: "All within acceptable limits", photos: 6, condition: "satisfactory" },
        ]
      },
      {
        name: "Machinery", category: "machinery", rating: 2,
        subAreas: [
          { name: "Main Engine", rating: 2, findings: "Good condition, turbocharger showing wear", photos: 15, condition: "satisfactory" },
          { name: "Auxiliary Engines", rating: 1, findings: "Recently overhauled, excellent condition", photos: 10, condition: "satisfactory" },
          { name: "Propulsion System", rating: 2, findings: "Propeller tip erosion within class limits", photos: 8, condition: "satisfactory" },
          { name: "Electrical Systems", rating: 2, findings: "Insulation resistance satisfactory", photos: 6, condition: "satisfactory" },
        ]
      },
      {
        name: "Safety Equipment", category: "safety", rating: 1,
        subAreas: [
          { name: "LSA Equipment", rating: 1, findings: "All lifeboats serviced, certificates valid", photos: 12, condition: "satisfactory" },
          { name: "Fire Fighting", rating: 2, findings: "3 fire dampers need replacement", photos: 8, condition: "fair" },
          { name: "Navigation Equipment", rating: 1, findings: "All equipment calibrated and functional", photos: 6, condition: "satisfactory" },
        ]
      },
      {
        name: "Accommodation", category: "accommodation", rating: 2,
        subAreas: [
          { name: "Crew Quarters", rating: 2, findings: "General good condition, minor paint work needed", photos: 10, condition: "satisfactory" },
          { name: "Galley & Mess", rating: 1, findings: "Excellent condition, recently renovated", photos: 6, condition: "satisfactory" },
          { name: "Sanitary Spaces", rating: 2, findings: "Acceptable standard maintained", photos: 4, condition: "satisfactory" },
        ]
      },
    ]
  },
];
function getRatingBadge(rating: number) {
  const labels = ["", "Very Good", "Good", "Fair", "Poor", "Very Poor"];
  const colors = ["", "bg-success", "bg-success/80", "bg-warning", "bg-warning/70", "bg-destructive"];
  return <span className={`px-2 py-0.5 rounded text-white text-xs font-bold ${colors[rating]}`}>{rating} - {labels[rating]}</span>;
}

function getConditionBadge(condition: string) {
  const colors: Record<string, string> = {
    satisfactory: "default",
    fair: "secondary",
    poor: "destructive",
    deficient: "destructive",
  };
  return <Badge variant={colors[condition] as "default" | "secondary" | "destructive" || "outline"}>{condition}</Badge>;
}

export function CAPAssessment() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVessel, setSelectedVessel] = useState("MV Atlantic Pioneer");
  const inspection = INITIAL_INSPECTIONS[0];

  return (
    <motion.div className="space-y-6 p-4 md:p-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            Condition Assessment Program (CAP)
          </h1>
          <p className="text-muted-foreground">DNV GL CAP grading • Hull & Machinery • Class survey tracking</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MV Atlantic Pioneer">MV Atlantic Pioneer</SelectItem>
              <SelectItem value="MV Pacific Guardian">MV Pacific Guardian</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => quickExport(inspection.areas.flatMap(a => a.subAreas.map(s => ({ Area: a.name, SubArea: s.name, Rating: s.rating, Condition: s.condition, Findings: s.findings, Photos: s.photos }))), "CAP Assessment")}><FileText className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center"><Ship className="h-5 w-5 mx-auto text-primary mb-1" /><div className="mt-1">{getRatingBadge(inspection.overallRating)}</div><p className="text-xs text-muted-foreground mt-1">Overall Rating</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Anchor className="h-5 w-5 mx-auto text-primary mb-1" />{getRatingBadge(inspection.areas.find(a => a.category === "hull")?.rating || 0)}<p className="text-xs text-muted-foreground mt-1">Hull</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Wrench className="h-5 w-5 mx-auto text-warning mb-1" />{getRatingBadge(inspection.areas.find(a => a.category === "machinery")?.rating || 0)}<p className="text-xs text-muted-foreground mt-1">Machinery</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Shield className="h-5 w-5 mx-auto text-success mb-1" />{getRatingBadge(inspection.areas.find(a => a.category === "safety")?.rating || 0)}<p className="text-xs text-muted-foreground mt-1">Safety</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Camera className="h-5 w-5 mx-auto text-accent-foreground mb-1" /><p className="text-2xl font-bold">{inspection.areas.flatMap(a => a.subAreas).reduce((s, sa) => s + sa.photos, 0)}</p><p className="text-xs text-muted-foreground">Photos</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Assessment</TabsTrigger>
          <TabsTrigger value="details">Detailed Findings</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle className="text-base">{inspection.vessel} - CAP Assessment</CardTitle>
                <Badge>{inspection.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Inspector: {inspection.inspector} | Date: {inspection.inspectionDate} | Society: {inspection.classificationSociety}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {inspection.areas.map(area => (
                <div key={area.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{area.name}</h3>
                    {getRatingBadge(area.rating)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {area.subAreas.map(sub => (
                      <div key={sub.name} className="flex items-center justify-between p-2 rounded bg-muted/50 border">
                        <div>
                          <p className="text-sm font-medium">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">{sub.findings}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{sub.photos} 📷</span>
                          {getConditionBadge(sub.condition)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Sub-Area</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Findings</TableHead>
                  <TableHead>Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspection.areas.flatMap(area =>
                  area.subAreas.map(sub => (
                    <TableRow key={`${area.name}-${sub.name}`}>
                      <TableCell className="font-medium">{area.name}</TableCell>
                      <TableCell>{sub.name}</TableCell>
                      <TableCell>{getRatingBadge(sub.rating)}</TableCell>
                      <TableCell>{getConditionBadge(sub.condition)}</TableCell>
                      <TableCell className="text-sm max-w-xs">{sub.findings}</TableCell>
                      <TableCell>{sub.photos} photos</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Surveyor Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {inspection.recommendations.map((rec, i) => (
                <div key={`rec-${rec.slice(0, 20)}-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">{rec}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={async () => { try { const { error } = await (await import("@/integrations/supabase/client")).supabase.from("maintenance_tasks").insert({ title: `CAP: ${rec.slice(0, 80)}`, priority: "medium", status: "pending", component_name: "CAP Recommendation" }); if (error) throw error; toast.success("Work order created in Maintenance"); } catch { toast.error("Erro ao criar work order"); } }}>
                        <Wrench className="h-3 w-3 mr-1" />Create Work Order
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toast.success("Acknowledged — recommendation noted")}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />Acknowledge
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Assessment History</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { date: "2026-01-20", rating: 2, society: "DNV GL", findings: 3 },
                { date: "2025-01-15", rating: 2, society: "DNV GL", findings: 5 },
                { date: "2024-01-10", rating: 3, society: "DNV GL", findings: 8 },
                { date: "2023-01-08", rating: 3, society: "DNV GL", findings: 6 },
              ].map((h) => (
                <div key={h.date} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div><p className="font-medium text-sm">{h.date}</p><p className="text-xs text-muted-foreground">{h.society} • {h.findings} findings</p></div>
                  {getRatingBadge(h.rating)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default CAPAssessment;
