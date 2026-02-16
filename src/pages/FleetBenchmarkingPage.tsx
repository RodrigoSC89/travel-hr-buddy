/**
 * Fleet Benchmarking - Cross-vessel KPI comparison & ranking
 * World-class competitive intelligence for maritime fleet management
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Ship, TrendingUp, BarChart3, Target, Award, Fuel, Shield, Users, Wrench, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface VesselBenchmark {
  id: string;
  name: string;
  type: string;
  overallScore: number;
  rank: number;
  trend: "up" | "down" | "stable";
  kpis: {
    safety: number;
    compliance: number;
    maintenance: number;
    fuel: number;
    crew: number;
    environmental: number;
  };
  details: {
    psciRate: number;
    ncCount: number;
    mtbf: number;
    fuelEfficiency: number;
    crewSatisfaction: number;
    co2PerNm: number;
  };
}

const VESSELS: VesselBenchmark[] = [
  { id: "1", name: "MV Atlantic Star", type: "Tanker", overallScore: 94, rank: 1, trend: "up", kpis: { safety: 96, compliance: 98, maintenance: 92, fuel: 90, crew: 95, environmental: 88 }, details: { psciRate: 0, ncCount: 2, mtbf: 2800, fuelEfficiency: 92, crewSatisfaction: 88, co2PerNm: 12.5 } },
  { id: "2", name: "MV Pacific Voyager", type: "Bulk Carrier", overallScore: 87, rank: 2, trend: "stable", kpis: { safety: 90, compliance: 92, maintenance: 85, fuel: 82, crew: 88, environmental: 84 }, details: { psciRate: 1, ncCount: 5, mtbf: 2200, fuelEfficiency: 85, crewSatisfaction: 82, co2PerNm: 15.2 } },
  { id: "3", name: "MV Indian Explorer", type: "Container", overallScore: 82, rank: 3, trend: "up", kpis: { safety: 85, compliance: 88, maintenance: 78, fuel: 80, crew: 82, environmental: 79 }, details: { psciRate: 1, ncCount: 7, mtbf: 1900, fuelEfficiency: 80, crewSatisfaction: 78, co2PerNm: 18.1 } },
  { id: "4", name: "MV Arctic Pioneer", type: "AHTS", overallScore: 78, rank: 4, trend: "down", kpis: { safety: 82, compliance: 80, maintenance: 75, fuel: 72, crew: 80, environmental: 76 }, details: { psciRate: 2, ncCount: 10, mtbf: 1600, fuelEfficiency: 75, crewSatisfaction: 72, co2PerNm: 22.3 } },
  { id: "5", name: "MV Southern Cross", type: "PSV", overallScore: 91, rank: 2, trend: "up", kpis: { safety: 94, compliance: 95, maintenance: 88, fuel: 88, crew: 92, environmental: 86 }, details: { psciRate: 0, ncCount: 3, mtbf: 2500, fuelEfficiency: 88, crewSatisfaction: 85, co2PerNm: 14.0 } },
];

const comparisonData = VESSELS.map(v => ({
  name: v.name.replace("MV ", ""),
  Segurança: v.kpis.safety,
  Compliance: v.kpis.compliance,
  Manutenção: v.kpis.maintenance,
  Combustível: v.kpis.fuel,
  Tripulação: v.kpis.crew,
  Ambiental: v.kpis.environmental,
}));

const medalColor = (rank: number) => {
  if (rank === 1) return "text-warning";
  if (rank === 2) return "text-muted-foreground";
  if (rank === 3) return "text-warning/70";
  return "text-muted-foreground";
};

export default function FleetBenchmarkingPage() {
  const [selectedVessel, setSelectedVessel] = useState<VesselBenchmark>(VESSELS[0]);

  const radarData = [
    { kpi: "Segurança", value: selectedVessel.kpis.safety },
    { kpi: "Compliance", value: selectedVessel.kpis.compliance },
    { kpi: "Manutenção", value: selectedVessel.kpis.maintenance },
    { kpi: "Combustível", value: selectedVessel.kpis.fuel },
    { kpi: "Tripulação", value: selectedVessel.kpis.crew },
    { kpi: "Ambiental", value: selectedVessel.kpis.environmental },
  ];

  const industryAvg = { safety: 78, compliance: 80, maintenance: 72, fuel: 70, crew: 75, environmental: 68 };
  const radarWithIndustry = radarData.map(d => ({
    ...d,
    industry: industryAvg[d.kpi.toLowerCase() as keyof typeof industryAvg] || 75,
  }));

  return (
    <div className="space-y-4 py-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-warning" />
          Fleet Benchmarking
          <Badge variant="secondary">World-Class</Badge>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ranking e comparação de KPIs entre embarcações • Benchmarking da indústria
        </p>
      </div>

      {/* Fleet Ranking */}
      <div className="grid gap-3">
        {VESSELS.sort((a, b) => b.overallScore - a.overallScore).map((vessel, idx) => (
          <Card
            key={vessel.id}
            className={cn(
              "border-border/50 cursor-pointer transition-all hover:border-primary/50",
              selectedVessel.id === vessel.id && "border-primary ring-1 ring-primary/20"
            )}
            onClick={() => setSelectedVessel(vessel)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-12">
                  <Trophy className={cn("h-5 w-5", medalColor(idx + 1))} />
                  <span className="font-bold text-lg">#{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium text-sm truncate">{vessel.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{vessel.type}</Badge>
                    {vessel.trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                    {vessel.trend === "down" && <TrendingUp className="h-3 w-3 text-destructive rotate-180" />}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {Object.entries(vessel.kpis).map(([key, val]) => (
                    <div key={key} className="text-center hidden md:block">
                      <p className="text-[10px] text-muted-foreground capitalize">{key === "fuel" ? "Comb." : key === "crew" ? "Trip." : key.substring(0, 4)}</p>
                      <p className={cn("text-xs font-bold", val >= 90 ? "text-success" : val >= 75 ? "text-warning" : "text-destructive")}>{val}</p>
                    </div>
                  ))}
                  <div className="w-20 text-center">
                    <p className="text-[10px] text-muted-foreground">Score</p>
                    <p className="text-xl font-bold text-primary">{vessel.overallScore}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="radar">
        <TabsList>
          <TabsTrigger value="radar">Radar</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>

        <TabsContent value="radar">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                {selectedVessel.name} vs Média da Indústria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarWithIndustry}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="kpi" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name={selectedVessel.name.replace("MV ", "")} dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  <Radar name="Média Indústria" dataKey="industry" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm">Comparação Multi-Embarcação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis type="category" dataKey="name" width={100} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Bar dataKey="Segurança" fill="hsl(var(--primary))" />
                  <Bar dataKey="Compliance" fill="hsl(var(--success))" />
                  <Bar dataKey="Manutenção" fill="hsl(var(--warning))" />
                  <Bar dataKey="Combustível" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="font-medium text-sm">PSC Detentions</span>
                </div>
                <p className="text-3xl font-bold">{selectedVessel.details.psciRate}</p>
                <p className="text-xs text-muted-foreground">nos últimos 12 meses</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-warning" />
                  <span className="font-medium text-sm">MTBF</span>
                </div>
                <p className="text-3xl font-bold">{selectedVessel.details.mtbf}h</p>
                <p className="text-xs text-muted-foreground">Mean Time Between Failures</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-accent-foreground" />
                  <span className="font-medium text-sm">Fuel Efficiency</span>
                </div>
                <p className="text-3xl font-bold">{selectedVessel.details.fuelEfficiency}%</p>
                <Progress value={selectedVessel.details.fuelEfficiency} className="h-2" />
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Crew Satisfaction</span>
                </div>
                <p className="text-3xl font-bold">{selectedVessel.details.crewSatisfaction}%</p>
                <Progress value={selectedVessel.details.crewSatisfaction} className="h-2" />
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-sm">Non-Conformities</span>
                </div>
                <p className="text-3xl font-bold">{selectedVessel.details.ncCount}</p>
                <p className="text-xs text-muted-foreground">abertas atualmente</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-success" />
                  <span className="font-medium text-sm">CO₂/NM</span>
                </div>
                <p className="text-3xl font-bold">{selectedVessel.details.co2PerNm} <span className="text-sm font-normal">kg</span></p>
                <p className="text-xs text-muted-foreground">por milha náutica</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
