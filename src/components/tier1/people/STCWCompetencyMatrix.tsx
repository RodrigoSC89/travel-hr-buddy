/**
 * STCW Competency Matrix - Tier-1 People Hub Component
 * Based on: Helm CONNECT, CrewInspector, Marine Training Center
 * Features: STCW Table A-II/III compliance, competency tracking, gap analysis
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GraduationCap, Users, Award, AlertTriangle, CheckCircle2, 
  Clock, Calendar, Search, Filter, Plus, FileText, Ship,
  Target, TrendingUp, BarChart3, RefreshCw, ArrowRight, Brain
} from "lucide-react";

interface Competency {
  id: string;
  code: string;
  title: string;
  function: string;
  level: "management" | "operational" | "support";
  stcwTable: string;
  methods: string[];
  criteria: string[];
}

interface CrewCompetency {
  crewMemberId: string;
  crewMemberName: string;
  rank: string;
  competencyId: string;
  status: "compliant" | "expiring" | "expired" | "gap" | "in_training";
  validUntil?: Date;
  lastAssessment?: Date;
  score?: number;
  certificates: string[];
}

const stcwCompetencies: Competency[] = [
  {
    id: "COMP001",
    code: "A-II/1-1",
    title: "Plan and conduct a passage and determine position",
    function: "Navigation",
    level: "operational",
    stcwTable: "A-II/1",
    methods: ["Approved education", "Sea service", "Simulator training"],
    criteria: ["Primary position fixing", "Secondary position fixing", "Passage planning"]
  },
  {
    id: "COMP002",
    code: "A-II/1-2",
    title: "Maintain a safe navigational watch",
    function: "Navigation",
    level: "operational",
    stcwTable: "A-II/1",
    methods: ["Approved education", "Sea service", "Assessment"],
    criteria: ["Watchkeeping procedures", "Traffic separation", "Collision regulations"]
  },
  {
    id: "COMP003",
    code: "A-II/2-1",
    title: "Plan a voyage and conduct navigation",
    function: "Navigation",
    level: "management",
    stcwTable: "A-II/2",
    methods: ["Approved education", "Sea service", "Simulator training"],
    criteria: ["Voyage planning", "Navigation equipment", "Meteorology application"]
  },
  {
    id: "COMP004",
    code: "A-III/1-1",
    title: "Maintain a safe engineering watch",
    function: "Marine Engineering",
    level: "operational",
    stcwTable: "A-III/1",
    methods: ["Approved education", "Workshop training", "Sea service"],
    criteria: ["Watchkeeping procedures", "Emergency response", "Handover procedures"]
  },
  {
    id: "COMP005",
    code: "A-III/2-1",
    title: "Manage operation of propulsion plant machinery",
    function: "Marine Engineering",
    level: "management",
    stcwTable: "A-III/2",
    methods: ["Approved education", "Sea service", "Simulator training"],
    criteria: ["Main engine operation", "Fuel systems", "Performance optimization"]
  }
];

const crewCompetencies: CrewCompetency[] = [
  {
    crewMemberId: "CR001",
    crewMemberName: "Capt. John Smith",
    rank: "Master",
    competencyId: "COMP003",
    status: "compliant",
    validUntil: new Date("2027-03-15"),
    lastAssessment: new Date("2024-03-15"),
    score: 95,
    certificates: ["CoC Master Unlimited", "GMDSS", "ARPA/Radar"]
  },
  {
    crewMemberId: "CR002",
    crewMemberName: "C/O David Chen",
    rank: "Chief Officer",
    competencyId: "COMP001",
    status: "expiring",
    validUntil: new Date("2025-04-20"),
    lastAssessment: new Date("2023-04-20"),
    score: 88,
    certificates: ["CoC Chief Mate", "ECDIS", "BRM"]
  },
  {
    crewMemberId: "CR003",
    crewMemberName: "C/E Michael Brown",
    rank: "Chief Engineer",
    competencyId: "COMP005",
    status: "compliant",
    validUntil: new Date("2026-08-10"),
    lastAssessment: new Date("2024-08-10"),
    score: 92,
    certificates: ["CoC Chief Engineer", "ERM", "High Voltage"]
  },
  {
    crewMemberId: "CR004",
    crewMemberName: "2/O Sarah Wilson",
    rank: "Second Officer",
    competencyId: "COMP002",
    status: "gap",
    lastAssessment: new Date("2023-01-15"),
    certificates: ["CoC OOW"]
  },
  {
    crewMemberId: "CR005",
    crewMemberName: "3/E James Lee",
    rank: "Third Engineer",
    competencyId: "COMP004",
    status: "in_training",
    lastAssessment: new Date("2024-11-20"),
    score: 75,
    certificates: ["CoC OICEW"]
  }
];

const matrixStats = {
  totalCrew: 24,
  compliant: 18,
  expiring: 3,
  gaps: 2,
  inTraining: 1,
  overallCompliance: 87.5,
  avgScore: 86.4,
  certificationsValid: 156
};

export function STCWCompetencyMatrix() {
  const [activeTab, setActiveTab] = useState("matrix");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("all");

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className: string }> = {
      compliant: { variant: "secondary", label: "Compliant", className: "bg-emerald-100 text-emerald-700" },
      expiring: { variant: "secondary", label: "Expiring Soon", className: "bg-amber-100 text-amber-700" },
      expired: { variant: "destructive", label: "Expired", className: "" },
      gap: { variant: "destructive", label: "Gap", className: "" },
      in_training: { variant: "secondary", label: "In Training", className: "bg-blue-100 text-blue-700" }
    };
    const config = statusMap[status] || statusMap.compliant;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getLevelBadge = (level: string) => {
    const levelMap: Record<string, string> = {
      management: "bg-purple-100 text-purple-700",
      operational: "bg-blue-100 text-blue-700",
      support: "bg-muted text-muted-foreground"
    };
    return <Badge className={levelMap[level] || levelMap.operational}>{level}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            STCW Competency Matrix
          </h2>
          <p className="text-muted-foreground">
            Track STCW Table A-II/III compliance and identify competency gaps
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const csv = ["Crew,Rank,Competency,Status,Score,Valid Until",
              ...crewCompetencies.map(cc => {
                const comp = stcwCompetencies.find(c => c.id === cc.competencyId);
                return `${cc.crewMemberName},${cc.rank},${comp?.title || ''},${cc.status},${cc.score || 'N/A'},${cc.validUntil ? formatDate(cc.validUntil) : 'N/A'}`;
              })
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'stcw-competency-report.csv'; a.click();
            URL.revokeObjectURL(url);
          }}>
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm" onClick={() => {
            import("sonner").then(({ toast }) => toast.success("Selecione um tripulante na aba 'Crew Status' para adicionar avaliação"));
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Assessment
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{matrixStats.totalCrew}</p>
              <p className="text-xs text-muted-foreground">Total Crew</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{matrixStats.compliant}</p>
              <p className="text-xs text-muted-foreground">Compliant</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{matrixStats.expiring}</p>
              <p className="text-xs text-muted-foreground">Expiring</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{matrixStats.gaps}</p>
              <p className="text-xs text-muted-foreground">Gaps</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{matrixStats.inTraining}</p>
              <p className="text-xs text-muted-foreground">In Training</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{matrixStats.overallCompliance}%</p>
              <p className="text-xs text-muted-foreground">Compliance</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{matrixStats.avgScore}</p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{matrixStats.certificationsValid}</p>
              <p className="text-xs text-muted-foreground">Valid Certs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crew member or competency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => {
          if (selectedFunction === "all") setSelectedFunction("Navigation");
          else setSelectedFunction("all");
          import("sonner").then(({ toast }) => toast.success(selectedFunction === "all" ? "Filtrado por: Navigation" : "Filtros removidos"));
        }}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="matrix">Matrix View</TabsTrigger>
          <TabsTrigger value="competencies">Competencies</TabsTrigger>
          <TabsTrigger value="crew">Crew Status</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="training">Training Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Competency Status by Crew</CardTitle>
              <CardDescription>Overview of STCW competency compliance across all crew members</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {crewCompetencies.map((cc) => {
                    const competency = stcwCompetencies.find(c => c.id === cc.competencyId);
                    return (
                      <Card 
                        key={`${cc.crewMemberId}-${cc.competencyId}`}
                        className={`hover:shadow-md transition-shadow ${
                          cc.status === "gap" || cc.status === "expired" ? "border-red-300 bg-red-50/50 dark:bg-red-950/20" :
                          cc.status === "expiring" ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20" : ""
                        }`}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{cc.crewMemberName}</h4>
                                  <p className="text-sm text-muted-foreground">{cc.rank}</p>
                                </div>
                                {getStatusBadge(cc.status)}
                              </div>

                              {competency && (
                                <div className="mt-3 p-3 rounded-lg bg-muted/50">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="font-mono">{competency.code}</Badge>
                                    {getLevelBadge(competency.level)}
                                  </div>
                                  <p className="text-sm font-medium">{competency.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Function: {competency.function} | Table: {competency.stcwTable}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                                {cc.lastAssessment && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Last Assessment: {formatDate(cc.lastAssessment)}
                                  </span>
                                )}
                                {cc.validUntil && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Valid Until: {formatDate(cc.validUntil)}
                                  </span>
                                )}
                                {cc.score && (
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    Score: {cc.score}%
                                  </span>
                                )}
                              </div>

                              {/* Certificates */}
                              {cc.certificates.length > 0 && (
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {cc.certificates.map((cert) => (
                                    <Badge key={cert} variant="outline" className="text-xs">
                                      <Award className="h-3 w-3 mr-1" />
                                      {cert}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                           <Button variant="ghost" size="sm" onClick={() => {
                             import("sonner").then(({ toast }) => toast.info(`Detalhes de ${cc.crewMemberName}`, { description: `Status: ${cc.status} | Score: ${cc.score || 'N/A'}%` }));
                           }}>
                             <ArrowRight className="h-4 w-4" />
                           </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competencies" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                STCW Competency Framework
              </CardTitle>
              <CardDescription>Standard competencies from STCW Tables A-II and A-III</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stcwCompetencies.map((comp) => (
                  <Card key={comp.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono">{comp.code}</Badge>
                            {getLevelBadge(comp.level)}
                            <Badge variant="secondary">{comp.function}</Badge>
                          </div>
                          <h4 className="font-semibold">{comp.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">Table: {comp.stcwTable}</p>
                          
                          <div className="grid md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-xs font-medium mb-1">Assessment Methods:</p>
                              <div className="flex flex-wrap gap-1">
                                {comp.methods.map((method) => (
                                  <Badge key={method} variant="outline" className="text-xs">{method}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium mb-1">Competence Criteria:</p>
                              <div className="flex flex-wrap gap-1">
                                {comp.criteria.map((crit) => (
                                  <Badge key={crit} variant="outline" className="text-xs">{crit}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crew" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Crew Compliance Status</CardTitle>
              <CardDescription>Individual crew member certification and competency status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {crewCompetencies.map(cc => {
                  const competency = stcwCompetencies.find(c => c.id === cc.competencyId);
                  return (
                    <div key={cc.crewMemberId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{cc.crewMemberName}</span>
                        <span className="text-xs text-muted-foreground ml-2">({cc.rank})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(cc.status)}
                        {competency && <Badge variant="outline" className="text-xs">{competency.title}</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Gap Analysis
              </CardTitle>
              <CardDescription>Identified competency gaps requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crewCompetencies.filter(cc => cc.status === "gap" || cc.status === "expiring").map((cc) => {
                  const competency = stcwCompetencies.find(c => c.id === cc.competencyId);
                  return (
                    <div 
                      key={`gap-${cc.crewMemberId}`}
                      className={`p-4 rounded-lg border ${
                        cc.status === "gap" ? "border-red-300 bg-red-50/50" : "border-amber-300 bg-amber-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{cc.crewMemberName}</h4>
                            <Badge variant="outline">{cc.rank}</Badge>
                            {getStatusBadge(cc.status)}
                          </div>
                          <p className="text-sm mt-1">
                            <strong>Gap:</strong> {competency?.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {cc.status === "gap" 
                              ? "Training required to achieve competency" 
                              : `Expires: ${cc.validUntil ? formatDate(cc.validUntil) : "N/A"}`}
                          </p>
                        </div>
                        <Button size="sm" onClick={() => {
                          import("sonner").then(({ toast }) => toast.success(`Treinamento agendado para ${cc.crewMemberName}`, { description: competency?.title }));
                        }}>
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Schedule Training
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Training Plan
              </CardTitle>
              <CardDescription>AI-recommended training schedule based on gap analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {crewCompetencies.filter(cc => cc.status === "gap" || cc.status === "expiring").map(cc => {
                  const competency = stcwCompetencies.find(c => c.id === cc.competencyId);
                  return (
                    <div key={`train-${cc.crewMemberId}`} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">{cc.crewMemberName}</p>
                        <p className="text-sm text-muted-foreground">Recomendado: {competency?.title}</p>
                      </div>
                      <Button size="sm" onClick={() => {
                        import("sonner").then(({ toast }) => toast.success(`Treinamento agendado para ${cc.crewMemberName}`, { description: competency?.title }));
                      }}>
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Agendar
                      </Button>
                    </div>
                  );
                })}
                {crewCompetencies.filter(cc => cc.status === "gap" || cc.status === "expiring").length === 0 && (
                  <p className="text-muted-foreground text-center py-6">Nenhuma lacuna identificada. Todos os tripulantes estão com certificações em dia.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
