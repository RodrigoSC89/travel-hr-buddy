/**
 * ISPS Module - Ship Security Plan, Assessments, Drills, Cybersecurity
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Lock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Users,
  Clock,
  Calendar,
  Ship,
  Wifi,
  Server,
  Eye,
  Target,
  Zap,
  RefreshCw,
  Download,
  Plus,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SecurityAssessment {
  id: string;
  area: string;
  status: "compliant" | "minor" | "major" | "critical";
  lastAssessment: Date;
  nextAssessment: Date;
  findings: number;
  score: number;
}

interface SecurityDrill {
  id: string;
  type: string;
  date: Date;
  participants: number;
  result: "satisfactory" | "needs_improvement" | "failed";
  notes: string;
}

interface CyberThreat {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "detected" | "investigating" | "mitigated" | "resolved";
  timestamp: Date;
  source: string;
}

const SECURITY_LEVELS = [
  { level: 1, name: "Normal", description: "Operações normais, medidas mínimas de segurança", color: "bg-green-500" },
  { level: 2, name: "Elevado", description: "Medidas de segurança adicionais por período prolongado", color: "bg-yellow-500" },
  { level: 3, name: "Excepcional", description: "Medidas de segurança intensificadas por ameaça provável", color: "bg-red-500" }
];

const COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

export function ISPSModule() {
  const [currentSecurityLevel, setCurrentSecurityLevel] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");

  const assessments: SecurityAssessment[] = [
    { id: "a1", area: "Access Control", status: "compliant", lastAssessment: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), nextAssessment: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), findings: 0, score: 98 },
    { id: "a2", area: "Cargo Handling", status: "minor", lastAssessment: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), nextAssessment: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), findings: 2, score: 85 },
    { id: "a3", area: "Ship's Stores", status: "compliant", lastAssessment: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), nextAssessment: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000), findings: 0, score: 92 },
    { id: "a4", area: "Unaccompanied Baggage", status: "compliant", lastAssessment: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), findings: 1, score: 88 },
    { id: "a5", area: "Ship Security Alert System", status: "compliant", lastAssessment: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), nextAssessment: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), findings: 0, score: 100 },
    { id: "a6", area: "Cybersecurity", status: "major", lastAssessment: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), nextAssessment: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), findings: 4, score: 72 }
  ];

  const drills: SecurityDrill[] = [
    { id: "d1", type: "Ship Security Alert", date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), participants: 24, result: "satisfactory", notes: "Tempo de resposta dentro do esperado" },
    { id: "d2", type: "Bomb Threat", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), participants: 28, result: "satisfactory", notes: "Evacuação realizada em 12 minutos" },
    { id: "d3", type: "Unauthorized Access", date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), participants: 18, result: "needs_improvement", notes: "Comunicação entre equipes precisa melhorar" },
    { id: "d4", type: "Cyber Attack Response", date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), participants: 12, result: "satisfactory", notes: "Sistemas isolados em 5 minutos" }
  ];

  const cyberThreats: CyberThreat[] = [
    { id: "ct1", type: "Phishing Attempt", severity: "medium", status: "resolved", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), source: "Email" },
    { id: "ct2", type: "Port Scan", severity: "low", status: "mitigated", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), source: "External IP" },
    { id: "ct3", type: "Malware Detection", severity: "high", status: "resolved", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), source: "USB Device" },
    { id: "ct4", type: "Unauthorized Login", severity: "medium", status: "investigating", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), source: "VPN" }
  ];

  const complianceData = [
    { name: "Conforme", value: assessments.filter(a => a.status === "compliant").length },
    { name: "Menor", value: assessments.filter(a => a.status === "minor").length },
    { name: "Maior", value: assessments.filter(a => a.status === "major").length },
    { name: "Crítico", value: assessments.filter(a => a.status === "critical").length }
  ].filter(d => d.value > 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant": return <Badge className="bg-green-500/20 text-green-500">Conforme</Badge>;
      case "minor": return <Badge className="bg-yellow-500/20 text-yellow-500">Menor</Badge>;
      case "major": return <Badge className="bg-orange-500/20 text-orange-500">Maior</Badge>;
      case "critical": return <Badge variant="destructive">Crítico</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDrillResultBadge = (result: string) => {
    switch (result) {
      case "satisfactory": return <Badge className="bg-green-500/20 text-green-500">Satisfatório</Badge>;
      case "needs_improvement": return <Badge className="bg-yellow-500/20 text-yellow-500">Precisa Melhorar</Badge>;
      case "failed": return <Badge variant="destructive">Reprovado</Badge>;
      default: return <Badge variant="secondary">{result}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">Crítico</Badge>;
      case "high": return <Badge className="bg-orange-500/20 text-orange-500">Alto</Badge>;
      case "medium": return <Badge className="bg-yellow-500/20 text-yellow-500">Médio</Badge>;
      case "low": return <Badge className="bg-green-500/20 text-green-500">Baixo</Badge>;
      default: return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const overallScore = Math.round(assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl">
            <Shield className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              ISPS Code Compliance
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500">
                Security Level {currentSecurityLevel}
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Ship Security Plan • Assessments • Drills • Cybersecurity
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={async () => {
            try {
              const { jsPDF } = await import('jspdf');
              const doc = new jsPDF();
              doc.setFontSize(18);
              doc.text('Ship Security Plan (SSP)', 20, 30);
              doc.setFontSize(12);
              doc.text(`Security Level: ${currentSecurityLevel}`, 20, 50);
              doc.text(`Generated: ${new Date().toLocaleDateString('pt-BR')}`, 20, 60);
              doc.text('ISPS Code Compliance Report', 20, 80);
              doc.save('SSP-Report.pdf');
              toast.success('SSP exportado com sucesso');
            } catch {
              toast.error('Erro ao gerar PDF do SSP');
            }
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export SSP
          </Button>
          <Button onClick={() => {
            toast.info("Avaliação de segurança — Em desenvolvimento (Q2/2026). Use o módulo Compliance Hub para auditorias.");
          }} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Security Level Banner */}
      <Card className={`${SECURITY_LEVELS[currentSecurityLevel - 1].color}/10 border-${SECURITY_LEVELS[currentSecurityLevel - 1].color.replace("bg-", "")}/30`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${SECURITY_LEVELS[currentSecurityLevel - 1].color} flex items-center justify-center`}>
                <span className="text-white font-bold text-2xl">{currentSecurityLevel}</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Security Level {currentSecurityLevel} - {SECURITY_LEVELS[currentSecurityLevel - 1].name}</h3>
                <p className="text-sm text-muted-foreground">{SECURITY_LEVELS[currentSecurityLevel - 1].description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((level) => (
                <Button
                  key={level}
                  variant={currentSecurityLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCurrentSecurityLevel(level);
                    toast.success(`Nível de segurança alterado para ${level}`);
                  }}
                >
                  Level {level}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{overallScore}%</p>
                <p className="text-xs text-muted-foreground">Overall Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{assessments.filter(a => a.status === "compliant").length}/{assessments.length}</p>
                <p className="text-xs text-muted-foreground">Áreas Conformes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{drills.length}</p>
                <p className="text-xs text-muted-foreground">Drills (90 dias)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{cyberThreats.filter(t => t.status !== "resolved").length}</p>
                <p className="text-xs text-muted-foreground">Ameaças Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Shield className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="ssp">
            <FileText className="h-4 w-4 mr-2" />
            SSP
          </TabsTrigger>
          <TabsTrigger value="assessments">
            <Target className="h-4 w-4 mr-2" />
            Assessments
          </TabsTrigger>
          <TabsTrigger value="drills">
            <Users className="h-4 w-4 mr-2" />
            Drills
          </TabsTrigger>
          <TabsTrigger value="cyber">
            <Lock className="h-4 w-4 mr-2" />
            Cybersecurity
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status de Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={complianceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {complianceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Próximas Atividades</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {assessments
                      .sort((a, b) => a.nextAssessment.getTime() - b.nextAssessment.getTime())
                      .slice(0, 5)
                      .map((assessment) => (
                        <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{assessment.area}</p>
                            <p className="text-xs text-muted-foreground">
                              Próxima: {assessment.nextAssessment.toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          {getStatusBadge(assessment.status)}
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SSP Tab */}
        <TabsContent value="ssp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ship Security Plan (SSP)</CardTitle>
              <CardDescription>Plano de Segurança do Navio conforme ISPS Code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { section: "1. Organization", status: "approved", lastReview: "2024-01-15" },
                  { section: "2. Security Measures", status: "approved", lastReview: "2024-02-20" },
                  { section: "3. Access Control", status: "approved", lastReview: "2024-03-10" },
                  { section: "4. Restricted Areas", status: "under_review", lastReview: "2024-11-01" },
                  { section: "5. Cargo Handling", status: "approved", lastReview: "2024-04-15" },
                  { section: "6. Security Equipment", status: "approved", lastReview: "2024-05-20" },
                  { section: "7. Training & Drills", status: "approved", lastReview: "2024-06-10" },
                  { section: "8. Records & Reports", status: "approved", lastReview: "2024-07-01" }
                ].map((section, idx) => (
                  <div key={idx} className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{section.section}</p>
                        <p className="text-xs text-muted-foreground">Última revisão: {section.lastReview}</p>
                      </div>
                      <Badge className={section.status === "approved" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}>
                        {section.status === "approved" ? "Aprovado" : "Em Revisão"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security Assessments</CardTitle>
                <Button size="sm" onClick={() => toast.info("Abrindo formulário de nova avaliação...")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Avaliação
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {assessments.map((assessment) => (
                    <div key={assessment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{assessment.area}</span>
                            {getStatusBadge(assessment.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>Score: {assessment.score}%</span>
                            <span>Findings: {assessment.findings}</span>
                            <span>Última: {assessment.lastAssessment.toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">Próxima avaliação</p>
                          <p className="font-medium">{assessment.nextAssessment.toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                      <Progress value={assessment.score} className="h-2 mt-3" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drills Tab */}
        <TabsContent value="drills" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security Drills</CardTitle>
                <Button size="sm" onClick={() => toast.info("Abrindo agenda de drills de segurança...")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Drill
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {drills.map((drill) => (
                    <div key={drill.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{drill.type}</span>
                            {getDrillResultBadge(drill.result)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{drill.participants} participantes</span>
                            <span>{drill.date.toLocaleDateString("pt-BR")}</span>
                          </div>
                          <p className="text-sm mt-2">{drill.notes}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toast.info(`Abrindo relatório do drill "${drill.type}"...`)}>
                          Ver Relatório
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cybersecurity Tab */}
        <TabsContent value="cyber" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Maritime Cybersecurity
                </CardTitle>
                <Badge className="bg-green-500/20 text-green-500">
                  <Wifi className="h-3 w-3 mr-1" />
                  Systems Online
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {cyberThreats.map((threat) => (
                    <div key={threat.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {threat.status === "resolved" ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : threat.status === "investigating" ? (
                              <Eye className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="font-medium">{threat.type}</span>
                            {getSeverityBadge(threat.severity)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>Source: {threat.source}</span>
                            <span>{threat.timestamp.toLocaleString("pt-BR")}</span>
                          </div>
                        </div>
                        <Badge variant={threat.status === "resolved" ? "secondary" : "outline"}>
                          {threat.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ISPSModule;
