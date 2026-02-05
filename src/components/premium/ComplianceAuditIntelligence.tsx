 /**
  * Compliance & Audit Intelligence Hub
  * Advanced compliance management with AI agents, certifications, and risk matrix
  * Based on DNV, ISM, ISPS, and MLC 2006 standards
  */
 
 import React, { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   Shield, FileCheck, AlertTriangle, CheckCircle, Bot, Brain,
   Calendar, Clock, Target, TrendingUp, Users, FileText,
   Award, Zap, BarChart3, Eye, Search, RefreshCw, Download,
   ClipboardCheck, Scale, Sparkles, Flag, Activity
 } from "lucide-react";
 import { toast } from "sonner";
 
 // Certification Types
 const CERTIFICATIONS = [
   { 
     id: "1", name: "Document of Compliance (DOC)", issuer: "DNV",
     vessel: "Fleet-wide", issueDate: "2023-06-15", expiryDate: "2028-06-15",
     status: "valid", annualVerification: "2024-06-15", category: "ISM"
   },
   { 
     id: "2", name: "Safety Management Certificate (SMC)", issuer: "DNV",
     vessel: "MV Atlântico Sul", issueDate: "2023-06-20", expiryDate: "2028-06-20",
     status: "valid", annualVerification: "2024-06-20", category: "ISM"
   },
   { 
     id: "3", name: "International Ship Security Certificate (ISSC)", issuer: "Flag State",
     vessel: "MV Atlântico Sul", issueDate: "2022-09-10", expiryDate: "2027-09-10",
     status: "valid", annualVerification: "2024-09-10", category: "ISPS"
   },
   { 
     id: "4", name: "Maritime Labour Certificate (MLC)", issuer: "Flag State",
     vessel: "MV Ocean Pride", issueDate: "2021-11-05", expiryDate: "2026-11-05",
     status: "renewal_due", annualVerification: "2024-11-05", category: "MLC"
   },
   { 
     id: "5", name: "IOPP Certificate", issuer: "DNV",
     vessel: "MV Pacific Star", issueDate: "2023-03-12", expiryDate: "2028-03-12",
     status: "valid", annualVerification: "2024-03-12", category: "MARPOL"
   },
 ];
 
 // AI Compliance Agents
 const AI_AGENTS = [
   { 
     id: "ism-agent", name: "ISM Auditor Agent", status: "active",
     lastRun: "2024-02-03 14:30", findings: 3, resolved: 2,
     capabilities: ["Non-conformity detection", "Root cause analysis", "CAPA generation"],
     accuracy: 94
   },
   { 
     id: "mlc-agent", name: "MLC 2006 Compliance Agent", status: "active",
     lastRun: "2024-02-04 08:15", findings: 5, resolved: 4,
     capabilities: ["Work/rest hour monitoring", "Contract validation", "Wage calculation"],
     accuracy: 97
   },
   { 
     id: "stcw-agent", name: "STCW Matrix Agent", status: "active",
     lastRun: "2024-02-04 09:00", findings: 2, resolved: 2,
     capabilities: ["Certificate tracking", "Training gap analysis", "Competency mapping"],
     accuracy: 99
   },
   { 
     id: "psc-agent", name: "PSC Preparation Agent", status: "standby",
     lastRun: "2024-01-28 16:45", findings: 8, resolved: 6,
     capabilities: ["Deficiency prediction", "Inspection readiness", "Port risk assessment"],
     accuracy: 91
   },
 ];
 
 // Audit Schedule
 const AUDITS = [
   { 
     id: "1", type: "Internal Audit", vessel: "MV Atlântico Sul",
     auditor: "Quality Team", scheduledDate: "2024-02-15", status: "scheduled",
     scope: ["Bridge Operations", "Navigation Safety", "ISM Compliance"]
   },
   { 
     id: "2", type: "External Audit (DNV)", vessel: "Fleet-wide",
     auditor: "DNV GL", scheduledDate: "2024-03-10", status: "scheduled",
     scope: ["DOC Annual Verification", "ISM Code Compliance"]
   },
   { 
     id: "3", type: "PSC Inspection", vessel: "MV Ocean Pride",
     auditor: "Paris MOU", scheduledDate: "2024-01-22", status: "completed",
     scope: ["SOLAS", "MARPOL", "MLC"], findings: 2, detained: false
   },
   { 
     id: "4", type: "Vetting Inspection", vessel: "MV Pacific Star",
     auditor: "OCIMF (SIRE 2.0)", scheduledDate: "2024-02-28", status: "scheduled",
     scope: ["SIRE 2.0 Questionnaire", "Crew Competency", "HSQE"]
   },
 ];
 
 // Risk Matrix
 const RISK_MATRIX = [
   { category: "Navigation", likelihood: 2, severity: 4, riskScore: 8, status: "medium", mitigations: 3 },
   { category: "Fire Safety", likelihood: 1, severity: 5, riskScore: 5, status: "low", mitigations: 5 },
   { category: "Cargo Operations", likelihood: 3, severity: 4, riskScore: 12, status: "high", mitigations: 2 },
   { category: "Crew Welfare", likelihood: 2, severity: 3, riskScore: 6, status: "medium", mitigations: 4 },
   { category: "Environmental", likelihood: 2, severity: 5, riskScore: 10, status: "high", mitigations: 3 },
   { category: "Security (ISPS)", likelihood: 1, severity: 5, riskScore: 5, status: "low", mitigations: 6 },
 ];
 
 // Non-Conformities
 const NON_CONFORMITIES = [
   { 
     id: "NC-2024-001", description: "Missing fire drill record for January",
     category: "ISM", severity: "minor", status: "closed",
     raisedDate: "2024-01-25", closedDate: "2024-01-28", vessel: "MV Atlântico Sul"
   },
   { 
     id: "NC-2024-002", description: "Crew work/rest hour violation detected",
     category: "MLC", severity: "major", status: "open",
     raisedDate: "2024-02-01", closedDate: null, vessel: "MV Ocean Pride"
   },
   { 
     id: "NC-2024-003", description: "Overdue lifeboat davit maintenance",
     category: "SOLAS", severity: "major", status: "in_progress",
     raisedDate: "2024-02-02", closedDate: null, vessel: "MV Pacific Star"
   },
 ];
 
 export default function ComplianceAuditIntelligence() {
   const [activeTab, setActiveTab] = useState("certifications");
 
   const validCerts = CERTIFICATIONS.filter(c => c.status === "valid").length;
   const openNCs = NON_CONFORMITIES.filter(nc => nc.status !== "closed").length;
   const highRisks = RISK_MATRIX.filter(r => r.status === "high").length;
   const activeAgents = AI_AGENTS.filter(a => a.status === "active").length;
 
   const getStatusColor = (status: string) => {
     switch (status) {
       case "valid": case "active": case "closed": case "completed":
         return "bg-green-500/10 text-green-500 border-green-500/20";
       case "renewal_due": case "in_progress": case "standby":
         return "bg-amber-500/10 text-amber-500 border-amber-500/20";
       case "expired": case "open":
         return "bg-red-500/10 text-red-500 border-red-500/20";
       default: return "bg-muted text-muted-foreground";
     }
   };
 
   const getRiskColor = (status: string) => {
     switch (status) {
       case "low": return "bg-green-500";
       case "medium": return "bg-amber-500";
       case "high": return "bg-red-500";
       default: return "bg-muted";
     }
   };
 
   return (
     <div className="space-y-6">
       {/* Header Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="border-l-4 border-l-green-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Certificados Válidos</p>
                 <p className="text-2xl font-bold">{validCerts}/{CERTIFICATIONS.length}</p>
                 <Progress value={(validCerts / CERTIFICATIONS.length) * 100} className="h-1 mt-1" />
               </div>
               <Award className="h-8 w-8 text-green-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-amber-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">NCs Abertas</p>
                 <p className="text-2xl font-bold">{openNCs}</p>
                 <p className="text-xs text-amber-500">Requerem ação</p>
               </div>
               <AlertTriangle className="h-8 w-8 text-amber-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-red-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">Riscos Altos</p>
                 <p className="text-2xl font-bold">{highRisks}</p>
                 <p className="text-xs text-red-500">Atenção prioritária</p>
               </div>
               <Target className="h-8 w-8 text-red-500" />
             </div>
           </CardContent>
         </Card>
 
         <Card className="border-l-4 border-l-blue-500">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-xs text-muted-foreground">AI Agents Ativos</p>
                 <p className="text-2xl font-bold">{activeAgents}/{AI_AGENTS.length}</p>
                 <p className="text-xs text-blue-500">Monitorando 24/7</p>
               </div>
               <Bot className="h-8 w-8 text-blue-500" />
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Main Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
         <TabsList className="grid grid-cols-5 w-full">
           <TabsTrigger value="certifications" className="flex items-center gap-2">
             <Award className="h-4 w-4" />
             Certificações
           </TabsTrigger>
           <TabsTrigger value="agents" className="flex items-center gap-2">
             <Bot className="h-4 w-4" />
             AI Agents
           </TabsTrigger>
           <TabsTrigger value="audits" className="flex items-center gap-2">
             <ClipboardCheck className="h-4 w-4" />
             Auditorias
           </TabsTrigger>
           <TabsTrigger value="ncs" className="flex items-center gap-2">
             <AlertTriangle className="h-4 w-4" />
             NCs & CAPAs
           </TabsTrigger>
           <TabsTrigger value="risk" className="flex items-center gap-2">
             <Scale className="h-4 w-4" />
             Risk Matrix
           </TabsTrigger>
         </TabsList>
 
         {/* Certifications Tab */}
         <TabsContent value="certifications" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Award className="h-5 w-5 text-green-500" />
                 Statutory Certifications
               </CardTitle>
               <CardDescription>
                 Certificados estatutários e de classe da frota
               </CardDescription>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[400px]">
                 <div className="space-y-4">
                   {CERTIFICATIONS.map(cert => (
                     <div key={cert.id} className="p-4 border rounded-lg space-y-3">
                       <div className="flex items-center justify-between">
                         <div>
                           <h4 className="font-semibold">{cert.name}</h4>
                           <p className="text-sm text-muted-foreground">
                             {cert.vessel} • {cert.issuer}
                           </p>
                         </div>
                         <div className="flex items-center gap-2">
                           <Badge variant="outline">{cert.category}</Badge>
                           <Badge className={getStatusColor(cert.status)}>
                             {cert.status === "valid" ? "Válido" : "Renovação Pendente"}
                           </Badge>
                         </div>
                       </div>
                       <div className="grid grid-cols-3 gap-4 text-sm">
                         <div>
                           <p className="text-muted-foreground">Emissão</p>
                           <p className="font-medium">{cert.issueDate}</p>
                         </div>
                         <div>
                           <p className="text-muted-foreground">Validade</p>
                           <p className="font-medium">{cert.expiryDate}</p>
                         </div>
                         <div>
                           <p className="text-muted-foreground">Verificação Anual</p>
                           <p className={`font-medium ${
                             new Date(cert.annualVerification) < new Date() ? "text-amber-500" : ""
                           }`}>{cert.annualVerification}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* AI Agents Tab */}
         <TabsContent value="agents" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Bot className="h-5 w-5 text-blue-500" />
                 Compliance AI Agents
               </CardTitle>
               <CardDescription>
                 Agentes de IA para monitoramento contínuo de compliance
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {AI_AGENTS.map(agent => (
                   <Card key={agent.id} className="border-l-4 border-l-blue-500">
                     <CardContent className="p-4 space-y-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                             agent.status === "active" ? "bg-green-500/10" : "bg-amber-500/10"
                           }`}>
                             <Brain className={`h-5 w-5 ${
                               agent.status === "active" ? "text-green-500" : "text-amber-500"
                             }`} />
                           </div>
                           <div>
                             <h4 className="font-semibold">{agent.name}</h4>
                             <p className="text-xs text-muted-foreground">
                               Última execução: {agent.lastRun}
                             </p>
                           </div>
                         </div>
                         <Badge className={getStatusColor(agent.status)}>
                           {agent.status === "active" ? "Ativo" : "Standby"}
                         </Badge>
                       </div>
 
                       <div className="grid grid-cols-3 gap-2 text-center">
                         <div className="p-2 bg-muted/50 rounded">
                           <p className="text-lg font-bold">{agent.findings}</p>
                           <p className="text-xs text-muted-foreground">Findings</p>
                         </div>
                         <div className="p-2 bg-muted/50 rounded">
                           <p className="text-lg font-bold text-green-500">{agent.resolved}</p>
                           <p className="text-xs text-muted-foreground">Resolvidos</p>
                         </div>
                         <div className="p-2 bg-muted/50 rounded">
                           <p className="text-lg font-bold text-blue-500">{agent.accuracy}%</p>
                           <p className="text-xs text-muted-foreground">Precisão</p>
                         </div>
                       </div>
 
                       <div className="flex flex-wrap gap-1">
                         {agent.capabilities.map((cap, i) => (
                           <Badge key={i} variant="outline" className="text-xs">{cap}</Badge>
                         ))}
                       </div>
 
                       <Button size="sm" className="w-full" variant="outline"
                         onClick={() => toast.success(`Executando ${agent.name}...`)}>
                         <Zap className="h-3 w-3 mr-1" />
                         Executar Agora
                       </Button>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Audits Tab */}
         <TabsContent value="audits" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <ClipboardCheck className="h-5 w-5 text-purple-500" />
                 Audit Schedule
               </CardTitle>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[350px]">
                 <div className="space-y-4">
                   {AUDITS.map(audit => (
                     <div key={audit.id} className="p-4 border rounded-lg space-y-3">
                       <div className="flex items-center justify-between">
                         <div>
                           <h4 className="font-semibold">{audit.type}</h4>
                           <p className="text-sm text-muted-foreground">
                             {audit.vessel} • {audit.auditor}
                           </p>
                         </div>
                         <Badge className={getStatusColor(audit.status)}>
                           {audit.status === "completed" ? "Concluída" : "Agendada"}
                         </Badge>
                       </div>
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <Calendar className="h-4 w-4" />
                         {audit.scheduledDate}
                       </div>
                       <div className="flex flex-wrap gap-1">
                         {audit.scope.map((s, i) => (
                           <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* NCs & CAPAs Tab */}
         <TabsContent value="ncs" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <AlertTriangle className="h-5 w-5 text-amber-500" />
                 Non-Conformities & CAPAs
               </CardTitle>
             </CardHeader>
             <CardContent>
               <ScrollArea className="h-[350px]">
                 <div className="space-y-4">
                   {NON_CONFORMITIES.map(nc => (
                     <div key={nc.id} className="p-4 border rounded-lg space-y-3">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <Badge variant="outline" className="font-mono">{nc.id}</Badge>
                           <Badge variant="outline">{nc.category}</Badge>
                           <Badge className={
                             nc.severity === "major" 
                               ? "bg-red-500/10 text-red-500" 
                               : "bg-amber-500/10 text-amber-500"
                           }>
                             {nc.severity}
                           </Badge>
                         </div>
                         <Badge className={getStatusColor(nc.status)}>
                           {nc.status === "closed" ? "Fechada" : 
                            nc.status === "in_progress" ? "Em Progresso" : "Aberta"}
                         </Badge>
                       </div>
                       <p className="text-sm">{nc.description}</p>
                       <div className="flex items-center justify-between text-xs text-muted-foreground">
                         <span>{nc.vessel}</span>
                         <span>Aberta: {nc.raisedDate}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </ScrollArea>
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Risk Matrix Tab */}
         <TabsContent value="risk" className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Scale className="h-5 w-5 text-purple-500" />
                 Risk Assessment Matrix
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {RISK_MATRIX.map(risk => (
                   <div key={risk.category} className="p-4 border rounded-lg">
                     <div className="flex items-center justify-between mb-3">
                       <h4 className="font-semibold">{risk.category}</h4>
                       <div className="flex items-center gap-2">
                         <div className={`w-3 h-3 rounded-full ${getRiskColor(risk.status)}`} />
                         <span className="text-sm font-medium capitalize">{risk.status}</span>
                       </div>
                     </div>
                     <div className="grid grid-cols-4 gap-4 text-sm text-center">
                       <div>
                         <p className="text-muted-foreground">Likelihood</p>
                         <p className="font-bold">{risk.likelihood}/5</p>
                       </div>
                       <div>
                         <p className="text-muted-foreground">Severity</p>
                         <p className="font-bold">{risk.severity}/5</p>
                       </div>
                       <div>
                         <p className="text-muted-foreground">Risk Score</p>
                         <p className={`font-bold ${
                           risk.riskScore >= 10 ? "text-red-500" :
                           risk.riskScore >= 6 ? "text-amber-500" : "text-green-500"
                         }`}>{risk.riskScore}</p>
                       </div>
                       <div>
                         <p className="text-muted-foreground">Mitigations</p>
                         <p className="font-bold text-blue-500">{risk.mitigations}</p>
                       </div>
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