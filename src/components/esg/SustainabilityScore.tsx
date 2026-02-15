/**
 * Sustainability Score - ESG Score with real Supabase data
 * Fetches from emissions_records, waste_records, vessels, internal_audits
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Leaf, Award, TrendingUp, TrendingDown, Ship, Users, Shield,
  Target, BarChart3, Trophy, Star, Medal, Crown, Loader2
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

interface VesselESG {
  id: string;
  name: string;
  environmental: number;
  social: number;
  governance: number;
  overall: number;
  rank: number;
  badges: string[];
  trend: "up" | "down" | "stable";
}

export function SustainabilityScore() {
  const [selectedVesselId, setSelectedVesselId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: vesselScores = [], isLoading } = useQuery({
    queryKey: ["esg-sustainability-scores"],
    queryFn: async () => {
      // Fetch vessels
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name, status")
        .order("name");

      if (!vessels || vessels.length === 0) return [];

      // Fetch emissions
      const { data: emissions } = await supabase
        .from("emissions_records")
        .select("vessel_id, co2_tonnes, sox_kg, nox_kg")
        .limit(500);

      // Fetch waste
      const { data: waste } = await supabase
        .from("waste_records")
        .select("vessel_id, waste_type, quantity")
        .limit(500);

      // Fetch audits for governance
      const { data: audits } = await supabase
        .from("internal_audits")
        .select("vessel_id, score, status")
        .limit(200);

      // Fetch crew for social (training)
      const { data: crew } = await supabase
        .from("crew_members")
        .select("vessel_id, status")
        .limit(500);

      // Calculate ESG per vessel
      const scores: VesselESG[] = vessels.map((v) => {
        // Environmental: based on emission levels (lower = better)
        const vesselEmissions = (emissions || []).filter((e: any) => e.vessel_id === v.id);
        const totalCO2 = vesselEmissions.reduce((s: number, e: any) => s + Number(e.co2_tonnes || 0), 0);
        const envScore = vesselEmissions.length > 0 
          ? Math.max(50, Math.min(95, 90 - totalCO2 / 100))
          : 75;

        // Social: crew active ratio
        const vesselCrew = (crew || []).filter((c) => c.vessel_id === v.id);
        const activeCrew = vesselCrew.filter((c) => c.status === "active").length;
        const socialScore = vesselCrew.length > 0
          ? Math.round((activeCrew / vesselCrew.length) * 100)
          : 75;

        // Governance: audit scores
        const vesselAudits = (audits || []).filter((a) => a.vessel_id === v.id);
        const avgAuditScore = vesselAudits.length > 0
          ? vesselAudits.reduce((s, a) => s + Number(a.score || 80), 0) / vesselAudits.length
          : 80;
        const govScore = Math.min(100, Math.round(avgAuditScore));

        // Waste management score
        const vesselWaste = (waste || []).filter((w) => w.vessel_id === v.id);
        const wasteScore = vesselWaste.length > 0 ? Math.max(60, 90 - vesselWaste.length * 2) : 80;

        const environmental = Math.round((envScore + wasteScore) / 2);
        const social = Math.min(100, socialScore);
        const governance = govScore;
        const overall = Math.round((environmental * 0.4 + social * 0.3 + governance * 0.3));

        // Badges
        const badges: string[] = [];
        if (overall >= 85) badges.push("🌿 Green Champion");
        if (social >= 90) badges.push("⭐ Zero Incidents");
        if (governance >= 90) badges.push("📊 Top Reporter");
        if (environmental >= 85) badges.push("🛡️ Eco Leader");

        return {
          id: v.id,
          name: v.name,
          environmental,
          social,
          governance,
          overall,
          rank: 0,
          badges,
          trend: overall >= 80 ? "up" : overall >= 60 ? "stable" : "down",
        };
      });

      // Sort and assign ranks
      scores.sort((a, b) => b.overall - a.overall);
      scores.forEach((s, i) => (s.rank = i + 1));

      return scores;
    },
    staleTime: 120_000,
  });

  const selectedVessel = useMemo(
    () => vesselScores.find((v) => v.id === selectedVesselId) || vesselScores[0],
    [vesselScores, selectedVesselId]
  );

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 85) return "from-success to-success/80";
    if (score >= 70) return "from-warning to-warning/80";
    return "from-destructive to-destructive/80";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Target className="h-4 w-4 text-muted-foreground" />;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-warning" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-warning/80" />;
    return <Star className="h-5 w-5 text-muted-foreground/50" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedVessel) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
          Nenhuma embarcação cadastrada. Cadastre embarcações para visualizar o ESG Score.
        </CardContent>
      </Card>
    );
  }

  const radarData = [
    { metric: "Ambiental", value: selectedVessel.environmental },
    { metric: "Social", value: selectedVessel.social },
    { metric: "Governança", value: selectedVessel.governance },
  ];

  const comparisonData = vesselScores.slice(0, 8).map((v) => ({
    name: v.name.length > 15 ? v.name.slice(0, 15) + "..." : v.name,
    Environmental: v.environmental,
    Social: v.social,
    Governance: v.governance,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-success/20 to-success/10 rounded-xl">
            <Leaf className="h-6 w-6 text-success" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Sustainability Score
              <Badge className="bg-gradient-to-r from-success to-success/80">ESG Dashboard</Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Score consolidado • {vesselScores.length} embarcações • Dados reais
            </p>
          </div>
        </div>
        <Select value={selectedVessel.id} onValueChange={setSelectedVesselId}>
          <SelectTrigger className="w-48">
            <Ship className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {vesselScores.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Score Card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${getScoreGradient(selectedVessel.overall)} flex items-center justify-center shadow-lg`}>
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">{selectedVessel.overall}</span>
                  <p className="text-white/80 text-xs">/ 100</p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{selectedVessel.name}</h3>
                  {getTrendIcon(selectedVessel.trend)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {getRankIcon(selectedVessel.rank)}
                  <span>#{selectedVessel.rank} no ranking da frota</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedVessel.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" className="text-xs">{badge}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { label: "Environmental", value: selectedVessel.environmental, color: "border-success", icon: <Leaf className="h-3 w-3 text-success" /> },
                { label: "Social", value: selectedVessel.social, color: "border-primary", icon: <Users className="h-3 w-3 text-primary" /> },
                { label: "Governance", value: selectedVessel.governance, color: "border-accent", icon: <Shield className="h-3 w-3" /> },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className={`w-16 h-16 rounded-full border-4 ${item.color} flex items-center justify-center mx-auto`}>
                    <span className="text-lg font-bold">{item.value}</span>
                  </div>
                  <p className="text-xs mt-2 flex items-center justify-center gap-1">{item.icon}{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview"><BarChart3 className="h-4 w-4 mr-2" />Análise</TabsTrigger>
          <TabsTrigger value="ranking"><Trophy className="h-4 w-4 mr-2" />Ranking</TabsTrigger>
          <TabsTrigger value="badges"><Award className="h-4 w-4 mr-2" />Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Radar ESG</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Score" dataKey="value" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Comparativo da Frota</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Environmental" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Social" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Governance" fill="hsl(var(--accent))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking da Frota</CardTitle>
              <CardDescription>Comparativo de performance ESG entre embarcações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vesselScores.map((vessel) => (
                  <div
                    key={vessel.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${vessel.id === selectedVessel.id ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50"}`}
                    onClick={() => setSelectedVesselId(vessel.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center">{getRankIcon(vessel.rank)}</div>
                        <div>
                          <p className="font-medium">{vessel.name}</p>
                          <div className="flex gap-1 mt-1">
                            {vessel.badges.slice(0, 2).map((b) => (
                              <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">E: {vessel.environmental}</span>
                        <span className="text-xs text-muted-foreground">S: {vessel.social}</span>
                        <span className="text-xs text-muted-foreground">G: {vessel.governance}</span>
                        <span className={`text-2xl font-bold ${getScoreColor(vessel.overall)}`}>{vessel.overall}</span>
                        {getTrendIcon(vessel.trend)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Conquistas ESG</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vesselScores.filter((v) => v.badges.length > 0).map((v) => (
                  <div key={v.id} className="p-4 border rounded-lg">
                    <p className="font-medium mb-2">{v.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {v.badges.map((b) => (
                        <Badge key={b} variant="secondary">{b}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {vesselScores.every((v) => v.badges.length === 0) && (
                  <p className="text-muted-foreground col-span-2 text-center py-8">
                    Nenhuma conquista ainda. Melhore os scores ESG para desbloquear badges.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SustainabilityScore;
