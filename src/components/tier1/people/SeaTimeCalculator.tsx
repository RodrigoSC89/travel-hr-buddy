/**
 * Sea Time Calculator - Tier-1 People Hub Component
 * Based on: CrewInspector, Helm CONNECT, MTC
 * Features: Sea service tracking, MLC compliance, certificate eligibility
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
  Clock, Ship, Users, Calendar, Anchor, Award, CheckCircle2,
  AlertTriangle, TrendingUp, Target, FileText, Plus, Search,
  Filter, ArrowRight, BarChart3
} from "lucide-react";

interface SeaServiceRecord {
  id: string;
  crewMemberId: string;
  vesselName: string;
  vesselType: string;
  vesselGT: number;
  rank: string;
  signOnDate: Date;
  signOffDate?: Date;
  totalDays: number;
  seaDays: number;
  portDays: number;
  status: "active" | "completed";
}

interface CrewSeaTime {
  crewMemberId: string;
  crewMemberName: string;
  currentRank: string;
  targetRank: string;
  totalSeaTime: number;
  requiredSeaTime: number;
  progress: number;
  status: "eligible" | "in_progress" | "pending";
  records: SeaServiceRecord[];
  certificates: {
    name: string;
    eligible: boolean;
    remaining?: number;
  }[];
}

const crewSeaTimeData: CrewSeaTime[] = [
  {
    crewMemberId: "CR001",
    crewMemberName: "3/O James Wilson",
    currentRank: "Third Officer",
    targetRank: "Second Officer",
    totalSeaTime: 540,
    requiredSeaTime: 720,
    progress: 75,
    status: "in_progress",
    records: [
      {
        id: "SR001",
        crewMemberId: "CR001",
        vesselName: "MV Atlantic Explorer",
        vesselType: "Tanker",
        vesselGT: 85000,
        rank: "Third Officer",
        signOnDate: new Date("2024-08-15"),
        totalDays: 180,
        seaDays: 165,
        portDays: 15,
        status: "active"
      },
      {
        id: "SR002",
        crewMemberId: "CR001",
        vesselName: "MV Pacific Star",
        vesselType: "Bulk Carrier",
        vesselGT: 72000,
        rank: "Third Officer",
        signOnDate: new Date("2024-01-10"),
        signOffDate: new Date("2024-07-10"),
        totalDays: 182,
        seaDays: 170,
        portDays: 12,
        status: "completed"
      }
    ],
    certificates: [
      { name: "CoC Second Mate Unlimited", eligible: false, remaining: 180 },
      { name: "ECDIS", eligible: true },
      { name: "ARPA/Radar", eligible: true }
    ]
  },
  {
    crewMemberId: "CR002",
    crewMemberName: "Jr. Eng. Michael Lee",
    currentRank: "Junior Engineer",
    targetRank: "Fourth Engineer",
    totalSeaTime: 365,
    requiredSeaTime: 360,
    progress: 100,
    status: "eligible",
    records: [
      {
        id: "SR003",
        crewMemberId: "CR002",
        vesselName: "MV Nordic Voyager",
        vesselType: "Container",
        vesselGT: 95000,
        rank: "Junior Engineer",
        signOnDate: new Date("2024-06-01"),
        totalDays: 250,
        seaDays: 235,
        portDays: 15,
        status: "active"
      }
    ],
    certificates: [
      { name: "CoC Fourth Engineer", eligible: true },
      { name: "Engine Room Resource Management", eligible: true }
    ]
  },
  {
    crewMemberId: "CR003",
    crewMemberName: "Cadet Sarah Brown",
    currentRank: "Deck Cadet",
    targetRank: "Third Officer",
    totalSeaTime: 180,
    requiredSeaTime: 365,
    progress: 49,
    status: "in_progress",
    records: [
      {
        id: "SR004",
        crewMemberId: "CR003",
        vesselName: "MV Atlantic Explorer",
        vesselType: "Tanker",
        vesselGT: 85000,
        rank: "Deck Cadet",
        signOnDate: new Date("2024-09-01"),
        totalDays: 160,
        seaDays: 150,
        portDays: 10,
        status: "active"
      }
    ],
    certificates: [
      { name: "CoC OOW", eligible: false, remaining: 185 },
      { name: "STCW Basic Safety", eligible: true }
    ]
  }
];

const seaTimeStats = {
  totalCrew: 24,
  activeContracts: 18,
  avgSeaTime: 245,
  eligibleForPromotion: 5,
  pendingCertificates: 8,
  mlcCompliance: 98.5
};

export function SeaTimeCalculator() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className: string }> = {
      eligible: { variant: "secondary", label: "Eligible", className: "bg-emerald-100 text-emerald-700" },
      in_progress: { variant: "secondary", label: "In Progress", className: "bg-blue-100 text-blue-700" },
      pending: { variant: "secondary", label: "Pending", className: "bg-amber-100 text-amber-700" }
    };
    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
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
            <Clock className="h-6 w-6 text-primary" />
            Sea Time Calculator
          </h2>
          <p className="text-muted-foreground">
            Track sea service, calculate eligibility, and manage MLC compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const csv = ["Crew,Rank,Target Rank,Sea Days,Required,Progress,Status",
              ...crewSeaTimeData.map(c => `${c.crewMemberName},${c.currentRank},${c.targetRank},${c.totalSeaTime},${c.requiredSeaTime},${c.progress}%,${c.status}`)
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'sea-time-records.csv'; a.click();
            URL.revokeObjectURL(url);
          }}>
            <FileText className="h-4 w-4 mr-2" />
            Export Records
          </Button>
          <Button size="sm" onClick={() => {
            import("sonner").then(({ toast }) => toast.success("Selecione um tripulante na lista abaixo para adicionar registro"));
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{seaTimeStats.totalCrew}</p>
              <p className="text-xs text-muted-foreground">Total Crew</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{seaTimeStats.activeContracts}</p>
              <p className="text-xs text-muted-foreground">Active Contracts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{seaTimeStats.avgSeaTime}</p>
              <p className="text-xs text-muted-foreground">Avg Days</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{seaTimeStats.eligibleForPromotion}</p>
              <p className="text-xs text-muted-foreground">Promotion Ready</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{seaTimeStats.pendingCertificates}</p>
              <p className="text-xs text-muted-foreground">Pending Certs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{seaTimeStats.mlcCompliance}%</p>
              <p className="text-xs text-muted-foreground">MLC Compliance</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crew member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => {
          import("sonner").then(({ toast }) => toast.success("Filtros disponíveis: Status, Rank, Vessel Type"));
        }}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Service Records</TabsTrigger>
          <TabsTrigger value="eligibility">Certificate Eligibility</TabsTrigger>
          <TabsTrigger value="mlc">MLC Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sea Time Progress</CardTitle>
              <CardDescription>Track progress towards next certificate eligibility</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {crewSeaTimeData.map((crew) => (
                    <Card 
                      key={crew.crewMemberId}
                      className={`hover:shadow-md transition-shadow ${
                        crew.status === "eligible" ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20" : ""
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
                                <h4 className="font-semibold">{crew.crewMemberName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {crew.currentRank} → {crew.targetRank}
                                </p>
                              </div>
                              {getStatusBadge(crew.status)}
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Sea Time Progress</span>
                                <span className="font-medium">
                                  {crew.totalSeaTime} / {crew.requiredSeaTime} days ({crew.progress}%)
                                </span>
                              </div>
                              <Progress 
                                value={crew.progress} 
                                className={`h-3 ${
                                  crew.progress >= 100 ? "[&>div]:bg-emerald-500" : ""
                                }`}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {crew.progress >= 100 
                                  ? "Eligible for certificate application"
                                  : `${crew.requiredSeaTime - crew.totalSeaTime} days remaining`}
                              </p>
                            </div>

                            {/* Latest service record */}
                            {crew.records[0] && (
                              <div className="mt-3 p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-2 mb-1">
                                  <Ship className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{crew.records[0].vesselName}</span>
                                  <Badge variant="outline" className="text-xs">{crew.records[0].vesselType}</Badge>
                                  {crew.records[0].status === "active" && (
                                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Sign-on: {formatDate(crew.records[0].signOnDate)} | 
                                  {crew.records[0].seaDays} sea days | 
                                  {crew.records[0].vesselGT.toLocaleString()} GT
                                </p>
                              </div>
                            )}

                            {/* Certificate eligibility */}
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              {crew.certificates.map((cert, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className={`text-xs ${
                                    cert.eligible 
                                      ? "border-emerald-500 text-emerald-600" 
                                      : "border-amber-500 text-amber-600"
                                  }`}
                                >
                                  {cert.eligible ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Clock className="h-3 w-3 mr-1" />
                                  )}
                                  {cert.name}
                                  {!cert.eligible && cert.remaining && ` (${cert.remaining}d)`}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Button variant="ghost" size="sm" onClick={() => {
                            setActiveTab("records");
                            import("sonner").then(({ toast }) => toast.success(`Carregando registros de ${crew.crewMemberName}`));
                          }}>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Sea Service Records
              </CardTitle>
              <CardDescription>Complete service history across all vessels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crewSeaTimeData.flatMap((crew) => 
                  crew.records.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Anchor className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{record.vesselName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {record.vesselType} | {record.vesselGT.toLocaleString()} GT | {record.rank}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge variant={record.status === "active" ? "secondary" : "outline"} 
                            className={record.status === "active" ? "bg-emerald-100 text-emerald-700" : ""}>
                            {record.status === "active" ? "Active" : "Completed"}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">
                          {formatDate(record.signOnDate)} - {record.signOffDate ? formatDate(record.signOffDate) : "Present"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.seaDays} sea days | {record.portDays} port days
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificate Eligibility
              </CardTitle>
              <CardDescription>STCW certificate requirements and eligibility status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 border border-dashed rounded-lg">
                <Award className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground font-medium">Matriz de Elegibilidade de Certificados</p>
                <p className="text-xs text-muted-foreground mt-1">Consulte a aba "Sea Time" para cálculos de tempo embarcado.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => {
                  window.history.pushState({}, "", "/compliance?tab=certificates");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}>
                  Ver Certificados no Compliance Hub
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mlc" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                MLC 2006 Compliance
              </CardTitle>
              <CardDescription>Maritime Labour Convention work/rest hour compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Rest Hour Requirements</h4>
                  <div className="space-y-3">
                    {[
                      { rule: "Min 10 hours rest per 24h period", status: "compliant", value: "11.2h avg" },
                      { rule: "Min 77 hours rest per 7-day period", status: "compliant", value: "84h avg" },
                      { rule: "Max work hours per day: 14h", status: "compliant", value: "12.8h max" },
                      { rule: "Max work hours per week: 72h", status: "warning", value: "71h current" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {item.status === "compliant" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          <span className="text-sm">{item.rule}</span>
                        </div>
                        <Badge variant={item.status === "compliant" ? "secondary" : "outline"}
                          className={item.status === "compliant" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                          {item.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Compliance by Rank</h4>
                  <div className="space-y-3">
                    {[
                      { rank: "Officers", compliance: 100 },
                      { rank: "Engineers", compliance: 98 },
                      { rank: "Ratings", compliance: 96 },
                      { rank: "Cadets", compliance: 100 }
                    ].map((item) => (
                      <div key={item.rank}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.rank}</span>
                          <span className="font-medium text-emerald-600">{item.compliance}%</span>
                        </div>
                        <Progress value={item.compliance} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
