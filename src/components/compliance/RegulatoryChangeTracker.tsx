/**
 * 📋 REGULATORY CHANGE TRACKER - vs DNV Compliance Planner
 * IMO/Flag State regulatory radar, impact assessment, compliance timeline
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Calendar, AlertTriangle, CheckCircle, Clock, Globe, FileText, Bell, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface RegulatoryChange {
  id: string;
  regulation: string;
  authority: string;
  category: "environmental" | "safety" | "security" | "crew" | "technical" | "operational";
  title: string;
  description: string;
  effective_date: string;
  adoption_date: string;
  impact_level: "high" | "medium" | "low";
  status: "upcoming" | "in_force" | "preparation" | "compliant" | "gap_identified";
  affected_vessel_types: string[];
  action_required: string;
  reference: string;
  days_until: number;
}

const REGULATIONS: RegulatoryChange[] = [
  { id: "1", regulation: "MEPC.1/Circ.912", authority: "IMO", category: "environmental", title: "CII Rating Scheme - Enhanced Corrective Action Plan", description: "Ships rated D for 3+ years or E must submit enhanced corrective action plan to Administration", effective_date: "2026-01-01", adoption_date: "2024-07-15", impact_level: "high", status: "in_force", affected_vessel_types: ["All ships ≥5000 GT"], action_required: "Review CII ratings, prepare corrective action plans for D/E rated vessels", reference: "MARPOL Annex VI Reg. 28", days_until: -47 },
  { id: "2", regulation: "MEPC.391(82)", authority: "IMO", category: "environmental", title: "Mediterranean Sea SOx ECA", description: "Mediterranean Sea designated as SOx Emission Control Area - 0.10% sulphur limit", effective_date: "2027-05-01", adoption_date: "2025-12-01", impact_level: "high", status: "preparation", affected_vessel_types: ["All ships"], action_required: "Assess bunker procurement strategy, scrubber compliance, fuel switching procedures", reference: "MARPOL Annex VI Reg. 14", days_until: 439 },
  { id: "3", regulation: "MSC.1/Circ.1668", authority: "IMO", category: "security", title: "Maritime Cyber Risk Management - Mandatory ISM Integration", description: "Cyber risk management must be incorporated into ISM Code safety management systems", effective_date: "2026-01-01", adoption_date: "2025-06-01", impact_level: "high", status: "gap_identified", affected_vessel_types: ["All ships"], action_required: "Update SMS with cyber risk assessment, implement NIST framework, train crew", reference: "ISM Code / MSC-FAL.1/Circ.3/Rev.2", days_until: -47 },
  { id: "4", regulation: "MEPC.1/Circ.905", authority: "IMO", category: "environmental", title: "EU ETS Phase 3 - Maritime Expansion", description: "100% MRV reporting and ETS compliance for voyages to/from EU ports", effective_date: "2026-01-01", adoption_date: "2023-05-10", impact_level: "high", status: "compliant", affected_vessel_types: ["Ships ≥5000 GT on EU voyages"], action_required: "MRV reporting, EUA surrender, monitoring plan updates", reference: "EU Regulation 2023/957", days_until: -47 },
  { id: "5", regulation: "A.1180(33)", authority: "IMO", category: "crew", title: "Revised STCW Training Requirements - ECDIS & BRM Updates", description: "Enhanced ECDIS training and Bridge Resource Management requirements for all watch officers", effective_date: "2026-07-01", adoption_date: "2025-12-10", impact_level: "medium", status: "preparation", affected_vessel_types: ["All ships"], action_required: "Update training matrix, schedule ECDIS refresher courses, verify BRM certificates", reference: "STCW Code A-II/1, A-II/2", days_until: 135 },
  { id: "6", regulation: "SOLAS XI-2/6.1", authority: "IMO", category: "safety", title: "SOLAS Amendments - Life-saving Appliance Code Updates", description: "Revised testing and maintenance requirements for lifeboats and rescue boats", effective_date: "2026-07-01", adoption_date: "2025-11-01", impact_level: "medium", status: "upcoming", affected_vessel_types: ["All passenger and cargo ships"], action_required: "Review LSA maintenance procedures, update PMS schedules, procure updated test equipment", reference: "SOLAS Ch. III / LSA Code", days_until: 135 },
  { id: "7", regulation: "Resolution A.1184(33)", authority: "IMO", category: "technical", title: "Goal-based Standards for Bulk Carriers & Oil Tankers - Phase 2", description: "Enhanced structural requirements for new ships under Common Structural Rules", effective_date: "2027-01-01", adoption_date: "2025-12-01", impact_level: "low", status: "upcoming", affected_vessel_types: ["New bulk carriers & oil tankers"], action_required: "Review newbuilding contracts, update technical specifications", reference: "SOLAS II-1 / GBS", days_until: 319 },
];

const impactColors: Record<string, string> = {
  high: "bg-red-500/20 text-red-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-blue-500/20 text-blue-400",
};

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-500/20 text-blue-400",
  in_force: "bg-green-500/20 text-green-400",
  preparation: "bg-yellow-500/20 text-yellow-400",
  compliant: "bg-green-500/20 text-green-400",
  gap_identified: "bg-red-500/20 text-red-400",
};

const categoryIcons: Record<string, string> = {
  environmental: "🌱",
  safety: "🛡️",
  security: "🔒",
  crew: "👥",
  technical: "⚙️",
  operational: "🚢",
};

export function RegulatoryChangeTracker() {
  const [filterImpact, setFilterImpact] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const filtered = REGULATIONS
    .filter(r => filterImpact === "all" || r.impact_level === filterImpact)
    .filter(r => filterCategory === "all" || r.category === filterCategory);

  const highImpact = REGULATIONS.filter(r => r.impact_level === "high").length;
  const gaps = REGULATIONS.filter(r => r.status === "gap_identified").length;
  const upcoming = REGULATIONS.filter(r => r.days_until > 0).length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Globe className="h-4 w-4" /> Tracked Regulations</div>
            <div className="text-2xl font-bold">{REGULATIONS.length}</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><AlertTriangle className="h-4 w-4" /> High Impact</div>
            <div className="text-2xl font-bold text-red-400">{highImpact}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Shield className="h-4 w-4" /> Gaps Identified</div>
            <div className="text-2xl font-bold text-yellow-400">{gaps}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Calendar className="h-4 w-4" /> Upcoming</div>
            <div className="text-2xl font-bold text-blue-400">{upcoming}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterImpact} onValueChange={setFilterImpact}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Impact" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Impact</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="environmental">Environmental</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="crew">Crew</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="gap-2"><Bell className="h-4 w-4" /> Set Alerts</Button>
      </div>

      {/* Regulation Cards */}
      <div className="space-y-3">
        {filtered.map(r => (
          <Card key={r.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-lg">{categoryIcons[r.category]}</span>
                    <span className="font-semibold">{r.title}</span>
                    <Badge variant="outline" className="text-[10px]">{r.regulation}</Badge>
                    <Badge className={impactColors[r.impact_level]}>{r.impact_level}</Badge>
                    <Badge className={statusColors[r.status]}>{r.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{r.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {r.authority}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Effective: {r.effective_date}</span>
                    <span className="flex items-center gap-1">
                      {r.days_until > 0 ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                      {r.days_until > 0 ? `${r.days_until} days to comply` : 'In force'}
                    </span>
                  </div>
                  <div className="mt-2 p-2 rounded bg-muted/30 text-xs">
                    <strong>Action Required:</strong> {r.action_required}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RegulatoryChangeTracker;
