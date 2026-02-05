/**
 * Compliance Scorecard Component
 * Dashboard de conformidade com scores por embarcação e regulamentação
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck,
  Ship,
  Calendar,
  TrendingUp,
  Eye,
  Download
} from "lucide-react";

interface VesselCompliance {
  id: string;
  vesselName: string;
  imoNumber: string;
  overallScore: number;
  ismScore: number;
  ispsScore: number;
  mlcScore: number;
  marpolScore: number;
  stcwScore: number;
  lastAudit: string;
  nextAudit: string;
  openFindings: number;
  status: "compliant" | "attention" | "critical";
}

interface UpcomingInspection {
  id: string;
  vesselName: string;
  inspectionType: string;
  authority: string;
  scheduledDate: string;
  priority: "high" | "medium" | "low";
}

const mockVessels: VesselCompliance[] = [
  {
    id: "1",
    vesselName: "MV Atlantic Pioneer",
    imoNumber: "9876543",
    overallScore: 94,
    ismScore: 96,
    ispsScore: 92,
    mlcScore: 95,
    marpolScore: 93,
    stcwScore: 94,
    lastAudit: "2025-01-15",
    nextAudit: "2025-07-15",
    openFindings: 2,
    status: "compliant"
  },
  {
    id: "2",
    vesselName: "MV Pacific Voyager",
    imoNumber: "9876544",
    overallScore: 78,
    ismScore: 82,
    ispsScore: 75,
    mlcScore: 80,
    marpolScore: 72,
    stcwScore: 81,
    lastAudit: "2024-11-20",
    nextAudit: "2025-05-20",
    openFindings: 8,
    status: "attention"
  },
  {
    id: "3",
    vesselName: "MV Nordic Star",
    imoNumber: "9876545",
    overallScore: 62,
    ismScore: 65,
    ispsScore: 58,
    mlcScore: 70,
    marpolScore: 55,
    stcwScore: 62,
    lastAudit: "2024-09-10",
    nextAudit: "2025-03-10",
    openFindings: 15,
    status: "critical"
  }
];

const mockInspections: UpcomingInspection[] = [
  {
    id: "1",
    vesselName: "MV Nordic Star",
    inspectionType: "PSC Inspection",
    authority: "Paris MoU",
    scheduledDate: "2025-02-15",
    priority: "high"
  },
  {
    id: "2",
    vesselName: "MV Pacific Voyager",
    inspectionType: "ISM Audit",
    authority: "DNV",
    scheduledDate: "2025-02-28",
    priority: "medium"
  },
  {
    id: "3",
    vesselName: "MV Atlantic Pioneer",
    inspectionType: "ISPS Verification",
    authority: "Flag State",
    scheduledDate: "2025-03-15",
    priority: "low"
  }
];

export function ComplianceScorecard() {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status: VesselCompliance["status"]) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Conforme</Badge>;
      case "attention":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Atenção</Badge>;
      case "critical":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Crítico</Badge>;
    }
  };

  const getPriorityBadge = (priority: UpcomingInspection["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Média</Badge>;
      case "low":
        return <Badge variant="secondary">Baixa</Badge>;
    }
  };

  const fleetAverage = Math.round(
    mockVessels.reduce((acc, v) => acc + v.overallScore, 0) / mockVessels.length
  );

  const totalFindings = mockVessels.reduce((acc, v) => acc + v.openFindings, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Médio da Frota</p>
                <p className={`text-3xl font-bold ${getScoreColor(fleetAverage)}`}>
                  {fleetAverage}%
                </p>
              </div>
              <div className={`p-3 rounded-full ${getScoreBg(fleetAverage)}/10`}>
                <Shield className={`h-6 w-6 ${getScoreColor(fleetAverage)}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Embarcações Conformes</p>
                <p className="text-3xl font-bold text-green-500">
                  {mockVessels.filter(v => v.status === "compliant").length}/{mockVessels.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Findings Abertos</p>
                <p className="text-3xl font-bold text-yellow-500">{totalFindings}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próximas Inspeções</p>
                <p className="text-3xl font-bold">{mockInspections.length}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vessels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vessels" className="gap-2">
            <Ship className="h-4 w-4" />
            Por Embarcação
          </TabsTrigger>
          <TabsTrigger value="inspections" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Próximas Inspeções
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vessels" className="space-y-4">
          {mockVessels.map((vessel) => (
            <Card key={vessel.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getScoreBg(vessel.overallScore)}/10`}>
                      <Ship className={`h-5 w-5 ${getScoreColor(vessel.overallScore)}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{vessel.vesselName}</CardTitle>
                      <p className="text-sm text-muted-foreground">IMO: {vessel.imoNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(vessel.status)}
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getScoreColor(vessel.overallScore)}`}>
                        {vessel.overallScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">Score Geral</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Regulation Scores */}
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { name: "ISM", score: vessel.ismScore },
                    { name: "ISPS", score: vessel.ispsScore },
                    { name: "MLC", score: vessel.mlcScore },
                    { name: "MARPOL", score: vessel.marpolScore },
                    { name: "STCW", score: vessel.stcwScore }
                  ].map((reg) => (
                    <div key={reg.name} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">{reg.name}</p>
                      <div className="relative pt-1">
                        <Progress 
                          value={reg.score} 
                          className="h-2"
                        />
                        <p className={`text-sm font-medium mt-1 ${getScoreColor(reg.score)}`}>
                          {reg.score}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Última: {new Date(vessel.lastAudit).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Próxima: {new Date(vessel.nextAudit).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {vessel.openFindings} findings abertos
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Relatório
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Inspeções Agendadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{inspection.vesselName}</p>
                        <p className="text-sm text-muted-foreground">
                          {inspection.inspectionType} - {inspection.authority}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {new Date(inspection.scheduledDate).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Em {Math.ceil((new Date(inspection.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                        </p>
                      </div>
                      {getPriorityBadge(inspection.priority)}
                    </div>
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

export default ComplianceScorecard;
