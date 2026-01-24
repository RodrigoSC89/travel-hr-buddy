/**
 * Sustainability Score - ESG Score (0-100), Badges, Vessel Comparison
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Leaf,
  Award,
  TrendingUp,
  TrendingDown,
  Ship,
  Droplets,
  Wind,
  Trash2,
  Users,
  Shield,
  Target,
  BarChart3,
  Trophy,
  Star,
  Medal,
  Crown
} from "lucide-react";
import { toast } from "sonner";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";

interface VesselScore {
  vesselId: string;
  vesselName: string;
  overallScore: number;
  rank: number;
  environmental: { emissions: number; waste: number; efficiency: number };
  social: { safety: number; training: number; welfare: number };
  governance: { compliance: number; reporting: number; audits: number };
  trend: "up" | "down" | "stable";
  badges: string[];
}

interface ESGMetric {
  category: string;
  metric: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
}

const VESSELS: VesselScore[] = [
  {
    vesselId: "v1",
    vesselName: "PSV Atlantic Star",
    overallScore: 87,
    rank: 1,
    environmental: { emissions: 85, waste: 92, efficiency: 88 },
    social: { safety: 90, training: 85, welfare: 82 },
    governance: { compliance: 95, reporting: 88, audits: 90 },
    trend: "up",
    badges: ["🌿 Green Champion", "⭐ Zero Incidents", "📊 Top Reporter"]
  },
  {
    vesselId: "v2",
    vesselName: "PSV Ocean Pioneer",
    overallScore: 82,
    rank: 2,
    environmental: { emissions: 80, waste: 85, efficiency: 82 },
    social: { safety: 88, training: 80, welfare: 78 },
    governance: { compliance: 90, reporting: 82, audits: 85 },
    trend: "stable",
    badges: ["🛡️ Safety First", "📈 Improver"]
  },
  {
    vesselId: "v3",
    vesselName: "PSV Marine Explorer",
    overallScore: 78,
    rank: 3,
    environmental: { emissions: 75, waste: 80, efficiency: 78 },
    social: { safety: 82, training: 75, welfare: 80 },
    governance: { compliance: 85, reporting: 78, audits: 80 },
    trend: "up",
    badges: ["🎯 Target Achiever"]
  },
  {
    vesselId: "v4",
    vesselName: "PSV Deep Voyager",
    overallScore: 72,
    rank: 4,
    environmental: { emissions: 68, waste: 75, efficiency: 72 },
    social: { safety: 78, training: 70, welfare: 72 },
    governance: { compliance: 80, reporting: 72, audits: 75 },
    trend: "down",
    badges: []
  }
];

const ESG_METRICS: ESGMetric[] = [
  { category: "Environmental", metric: "CO₂ Emissions", value: 1245, target: 1500, unit: "ton", trend: "down" },
  { category: "Environmental", metric: "Fuel Efficiency", value: 0.45, target: 0.50, unit: "ton/NM", trend: "down" },
  { category: "Environmental", metric: "Waste Recycled", value: 78, target: 75, unit: "%", trend: "up" },
  { category: "Environmental", metric: "Oil Spills", value: 0, target: 0, unit: "incidents", trend: "stable" },
  { category: "Social", metric: "LTIF", value: 0.5, target: 1.0, unit: "rate", trend: "down" },
  { category: "Social", metric: "Training Hours", value: 42, target: 40, unit: "hrs/person", trend: "up" },
  { category: "Social", metric: "Crew Satisfaction", value: 85, target: 80, unit: "%", trend: "up" },
  { category: "Governance", metric: "Compliance Rate", value: 98, target: 95, unit: "%", trend: "up" },
  { category: "Governance", metric: "Audit Score", value: 92, target: 90, unit: "%", trend: "stable" }
];

const MONTHLY_TREND = [
  { month: "Jul", environmental: 82, social: 80, governance: 88 },
  { month: "Ago", environmental: 83, social: 82, governance: 89 },
  { month: "Set", environmental: 85, social: 84, governance: 90 },
  { month: "Out", environmental: 84, social: 85, governance: 91 },
  { month: "Nov", environmental: 86, social: 86, governance: 92 },
  { month: "Dez", environmental: 87, social: 87, governance: 93 }
];

export function SustainabilityScore() {
  const [selectedVessel, setSelectedVessel] = useState<VesselScore>(VESSELS[0]);
  const [activeTab, setActiveTab] = useState("overview");

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    if (score >= 50) return "text-warning/80";
    return "text-destructive";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 85) return "from-success to-success/80";
    if (score >= 70) return "from-warning to-warning/80";
    if (score >= 50) return "from-warning/80 to-destructive";
    return "from-destructive to-destructive/80";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-success" />;
      case "down": return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <Star className="h-5 w-5 text-gray-300" />;
    }
  };

  const radarData = [
    { metric: "Emissões", value: selectedVessel.environmental.emissions },
    { metric: "Resíduos", value: selectedVessel.environmental.waste },
    { metric: "Eficiência", value: selectedVessel.environmental.efficiency },
    { metric: "Segurança", value: selectedVessel.social.safety },
    { metric: "Treinamento", value: selectedVessel.social.training },
    { metric: "Bem-estar", value: selectedVessel.social.welfare },
    { metric: "Compliance", value: selectedVessel.governance.compliance },
    { metric: "Relatórios", value: selectedVessel.governance.reporting },
    { metric: "Auditorias", value: selectedVessel.governance.audits }
  ];

  const comparisonData = VESSELS.map(v => ({
    name: v.vesselName.replace("PSV ", ""),
    Environmental: Math.round((v.environmental.emissions + v.environmental.waste + v.environmental.efficiency) / 3),
    Social: Math.round((v.social.safety + v.social.training + v.social.welfare) / 3),
    Governance: Math.round((v.governance.compliance + v.governance.reporting + v.governance.audits) / 3)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
            <Leaf className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Sustainability Score
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                ESG Dashboard
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Score consolidado • Ranking de embarcações • Badges de conquistas
            </p>
          </div>
        </div>
        <Select value={selectedVessel.vesselId} onValueChange={(v) => setSelectedVessel(VESSELS.find(ves => ves.vesselId === v) || VESSELS[0])}>
          <SelectTrigger className="w-48">
            <Ship className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VESSELS.map((v) => (
              <SelectItem key={v.vesselId} value={v.vesselId}>
                {v.vesselName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Score Card */}
      <Card className={`bg-gradient-to-r ${getScoreGradient(selectedVessel.overallScore)}/10 border-${getScoreGradient(selectedVessel.overallScore).split(" ")[0].replace("from-", "")}/30`}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreGradient(selectedVessel.overallScore)} flex items-center justify-center shadow-lg`}>
                <div className="text-center">
                  <span className="text-4xl font-bold text-white">{selectedVessel.overallScore}</span>
                  <p className="text-white/80 text-sm">/ 100</p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">{selectedVessel.vesselName}</h3>
                  {getTrendIcon(selectedVessel.trend)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {getRankIcon(selectedVessel.rank)}
                  <span className="text-lg">#{selectedVessel.rank} no ranking da frota</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedVessel.badges.map((badge, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold">{Math.round((selectedVessel.environmental.emissions + selectedVessel.environmental.waste + selectedVessel.environmental.efficiency) / 3)}</span>
                </div>
                <p className="text-sm mt-2 flex items-center justify-center gap-1">
                  <Leaf className="h-3 w-3 text-green-500" />
                  Environmental
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold">{Math.round((selectedVessel.social.safety + selectedVessel.social.training + selectedVessel.social.welfare) / 3)}</span>
                </div>
                <p className="text-sm mt-2 flex items-center justify-center gap-1">
                  <Users className="h-3 w-3 text-blue-500" />
                  Social
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full border-4 border-purple-500 flex items-center justify-center mx-auto">
                  <span className="text-xl font-bold">{Math.round((selectedVessel.governance.compliance + selectedVessel.governance.reporting + selectedVessel.governance.audits) / 3)}</span>
                </div>
                <p className="text-sm mt-2 flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3 text-purple-500" />
                  Governance
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Análise
          </TabsTrigger>
          <TabsTrigger value="ranking">
            <Trophy className="h-4 w-4 mr-2" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <Target className="h-4 w-4 mr-2" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="h-4 w-4 mr-2" />
            Badges
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Análise de Competências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar name="Score" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Evolução Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MONTHLY_TREND}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[70, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="environmental" name="Environmental" stroke="#22c55e" strokeWidth={2} />
                      <Line type="monotone" dataKey="social" name="Social" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="governance" name="Governance" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ranking Tab */}
        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking da Frota</CardTitle>
              <CardDescription>Comparativo de performance ESG entre embarcações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {VESSELS.sort((a, b) => a.rank - b.rank).map((vessel) => (
                  <div
                    key={vessel.vesselId}
                    className={`p-4 border rounded-lg ${vessel.vesselId === selectedVessel.vesselId ? "bg-primary/5 border-primary/30" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankIcon(vessel.rank)}
                        </div>
                        <div>
                          <p className="font-medium">{vessel.vesselName}</p>
                          <div className="flex gap-1 mt-1">
                            {vessel.badges.slice(0, 2).map((badge, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Environmental</p>
                          <p className="font-bold text-green-500">
                            {Math.round((vessel.environmental.emissions + vessel.environmental.waste + vessel.environmental.efficiency) / 3)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Social</p>
                          <p className="font-bold text-blue-500">
                            {Math.round((vessel.social.safety + vessel.social.training + vessel.social.welfare) / 3)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Governance</p>
                          <p className="font-bold text-purple-500">
                            {Math.round((vessel.governance.compliance + vessel.governance.reporting + vessel.governance.audits) / 3)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${getScoreColor(vessel.overallScore)}`}>
                            {vessel.overallScore}
                          </span>
                          {getTrendIcon(vessel.trend)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Environmental" fill="#22c55e" />
                      <Bar dataKey="Social" fill="#3b82f6" />
                      <Bar dataKey="Governance" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Environmental", "Social", "Governance"].map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {category === "Environmental" && <Leaf className="h-4 w-4 text-green-500" />}
                    {category === "Social" && <Users className="h-4 w-4 text-blue-500" />}
                    {category === "Governance" && <Shield className="h-4 w-4 text-purple-500" />}
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ESG_METRICS.filter(m => m.category === category).map((metric, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{metric.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{metric.value} {metric.unit}</span>
                            {getTrendIcon(metric.trend)}
                          </div>
                        </div>
                        <Progress
                          value={Math.min((metric.value / metric.target) * 100, 100)}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Meta: {metric.target} {metric.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Badges Disponíveis</CardTitle>
              <CardDescription>Conquistas que podem ser alcançadas pela frota</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { emoji: "🌿", name: "Green Champion", description: "Score ambiental > 90", unlocked: true },
                  { emoji: "⭐", name: "Zero Incidents", description: "Sem incidentes por 90 dias", unlocked: true },
                  { emoji: "📊", name: "Top Reporter", description: "100% dos relatórios em dia", unlocked: true },
                  { emoji: "🛡️", name: "Safety First", description: "LTIF < 0.5", unlocked: true },
                  { emoji: "📈", name: "Improver", description: "Aumento de 10% no score", unlocked: true },
                  { emoji: "🎯", name: "Target Achiever", description: "Todas metas alcançadas", unlocked: true },
                  { emoji: "♻️", name: "Recycling Hero", description: "Reciclagem > 90%", unlocked: false },
                  { emoji: "🏆", name: "Fleet Champion", description: "#1 no ranking por 3 meses", unlocked: false },
                  { emoji: "🌊", name: "Clean Seas", description: "Zero derramamentos no ano", unlocked: false },
                  { emoji: "🎓", name: "Training Excellence", description: "> 50h treinamento/pessoa", unlocked: false },
                  { emoji: "💯", name: "Perfect Audit", description: "Score de auditoria 100%", unlocked: false },
                  { emoji: "🌟", name: "ESG Pioneer", description: "Score geral > 95", unlocked: false }
                ].map((badge, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border rounded-lg text-center ${badge.unlocked ? "" : "opacity-50 grayscale"}`}
                  >
                    <span className="text-4xl">{badge.emoji}</span>
                    <p className="font-medium mt-2">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {badge.unlocked ? (
                      <Badge className="mt-2 bg-green-500/20 text-green-500">Conquistado</Badge>
                    ) : (
                      <Badge className="mt-2" variant="secondary">Bloqueado</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SustainabilityScore;
