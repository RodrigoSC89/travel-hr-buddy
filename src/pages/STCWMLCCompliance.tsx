/**
 * STCW & MLC Compliance Center - Página dedicada
 * Separada de Crew Intelligence para rotas únicas
 */
import React, { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Award, Users, BookOpen, Calendar, GraduationCap, 
  FileCheck, Shield, CheckCircle2, AlertTriangle, Clock,
  Ship, TrendingUp, Target, Brain, RefreshCw
} from "lucide-react";

// Lazy load tier-1 components
const STCWCompetencyMatrix = lazy(() => 
  import("@/components/tier1/people/STCWCompetencyMatrix").then(m => ({ default: m.STCWCompetencyMatrix }))
);
const SeaTimeCalculator = lazy(() => 
  import("@/components/tier1/people/SeaTimeCalculator").then(m => ({ default: m.SeaTimeCalculator }))
);
const MLCComplianceModule = lazy(() => 
  import("@/components/tier1/compliance/MLCComplianceModule")
);

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

// Mock data for KPIs
const complianceStats = {
  stcwCompliance: 94.2,
  mlcCompliance: 97.8,
  certificatesValid: 156,
  certificatesExpiring: 12,
  trainingCompleted: 89,
  crewOnboard: 247,
  seaTimeTracked: 45280,
  lastAudit: "2024-01-15"
};

export default function STCWMLCCompliance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Award className="h-8 w-8 text-amber-500" />
            STCW & MLC Compliance Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Standards of Training, Certification and Watchkeeping & Maritime Labour Convention 2006
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {complianceStats.stcwCompliance}% STCW
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
            <Shield className="h-3 w-3 mr-1" />
            {complianceStats.mlcCompliance}% MLC
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Award className="h-5 w-5 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-green-600">{complianceStats.certificatesValid}</p>
              <p className="text-xs text-muted-foreground">Certificados Válidos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold text-amber-600">{complianceStats.certificatesExpiring}</p>
              <p className="text-xs text-muted-foreground">Expirando 90d</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <GraduationCap className="h-5 w-5 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{complianceStats.trainingCompleted}%</p>
              <p className="text-xs text-muted-foreground">Treinamentos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Users className="h-5 w-5 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold">{complianceStats.crewOnboard}</p>
              <p className="text-xs text-muted-foreground">Tripulantes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Ship className="h-5 w-5 mx-auto text-cyan-500 mb-2" />
              <p className="text-2xl font-bold">{(complianceStats.seaTimeTracked / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground">Dias Mar</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-green-600">{complianceStats.stcwCompliance}%</p>
              <p className="text-xs text-muted-foreground">STCW Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Shield className="h-5 w-5 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{complianceStats.mlcCompliance}%</p>
              <p className="text-xs text-muted-foreground">MLC Score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-bold">{complianceStats.lastAudit}</p>
              <p className="text-xs text-muted-foreground">Última Auditoria</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-2">
            <Target className="h-4 w-4" />
            <span className="text-xs">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="stcw-matrix" className="flex flex-col items-center gap-1 py-2">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs">STCW Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="mlc-compliance" className="flex flex-col items-center gap-1 py-2">
            <Shield className="h-4 w-4" />
            <span className="text-xs">MLC 2006</span>
          </TabsTrigger>
          <TabsTrigger value="sea-time" className="flex flex-col items-center gap-1 py-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Sea Time</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex flex-col items-center gap-1 py-2">
            <FileCheck className="h-4 w-4" />
            <span className="text-xs">Certificates</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* STCW Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  STCW Compliance Summary
                </CardTitle>
                <CardDescription>
                  Standards of Training, Certification and Watchkeeping for Seafarers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall STCW Compliance</span>
                    <span className="font-medium text-green-600">{complianceStats.stcwCompliance}%</span>
                  </div>
                  <Progress value={complianceStats.stcwCompliance} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">98%</p>
                    <p className="text-xs text-muted-foreground">Deck Officers</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">96%</p>
                    <p className="text-xs text-muted-foreground">Engine Officers</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">89%</p>
                    <p className="text-xs text-muted-foreground">Ratings Deck</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">93%</p>
                    <p className="text-xs text-muted-foreground">Ratings Engine</p>
                  </div>
                </div>

                <Button className="w-full" variant="outline" onClick={() => handleTabChange("stcw-matrix")}>
                  View Full STCW Matrix
                </Button>
              </CardContent>
            </Card>

            {/* MLC Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  MLC 2006 Compliance Summary
                </CardTitle>
                <CardDescription>
                  Maritime Labour Convention - Seafarers' Rights & Working Conditions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall MLC Compliance</span>
                    <span className="font-medium text-green-600">{complianceStats.mlcCompliance}%</span>
                  </div>
                  <Progress value={complianceStats.mlcCompliance} className="h-2" />
                </div>
                
                <div className="space-y-3 pt-4">
                  {[
                    { title: "Title 1 - Minimum Requirements", score: 100 },
                    { title: "Title 2 - Employment Conditions", score: 98 },
                    { title: "Title 3 - Accommodation & Recreation", score: 95 },
                    { title: "Title 4 - Health Protection", score: 97 },
                    { title: "Title 5 - Compliance & Enforcement", score: 99 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.title}</span>
                        <span className={item.score >= 95 ? "text-green-600" : "text-amber-600"}>
                          {item.score}%
                        </span>
                      </div>
                      <Progress value={item.score} className="h-1" />
                    </div>
                  ))}
                </div>

                <Button className="w-full" variant="outline" onClick={() => handleTabChange("mlc-compliance")}>
                  View Full MLC Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* STCW Matrix Tab */}
        <TabsContent value="stcw-matrix">
          <Suspense fallback={<LoadingSkeleton />}>
            <STCWCompetencyMatrix />
          </Suspense>
        </TabsContent>

        {/* MLC Compliance Tab */}
        <TabsContent value="mlc-compliance">
          <Suspense fallback={<LoadingSkeleton />}>
            <MLCComplianceModule />
          </Suspense>
        </TabsContent>

        {/* Sea Time Tab */}
        <TabsContent value="sea-time">
          <Suspense fallback={<LoadingSkeleton />}>
            <SeaTimeCalculator />
          </Suspense>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-amber-500" />
                Certificate Management
              </CardTitle>
              <CardDescription>
                Track and manage STCW certificates, endorsements, and renewals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                  <CardContent className="pt-6 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
                    <p className="text-3xl font-bold text-green-600">{complianceStats.certificatesValid}</p>
                    <p className="text-sm text-muted-foreground">Valid Certificates</p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                  <CardContent className="pt-6 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-3" />
                    <p className="text-3xl font-bold text-amber-600">{complianceStats.certificatesExpiring}</p>
                    <p className="text-sm text-muted-foreground">Expiring in 90 Days</p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-12 w-12 mx-auto text-red-500 mb-3" />
                    <p className="text-3xl font-bold text-red-600">3</p>
                    <p className="text-sm text-muted-foreground">Expired - Action Required</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <Button className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Certificates with Registry
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
