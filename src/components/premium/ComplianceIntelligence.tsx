 /**
  * Compliance Intelligence Component
  * Based on best practices from DNV ShipManager, ClassNK
  * Features: PSC readiness, automated audits, risk matrix
  */
 
  import { useState } from "react";
  import { useComplianceIntelligenceData, type InspectionReadiness, type ComplianceItem } from "@/hooks/useComplianceIntelligenceData";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { 
   Shield, CheckCircle2, AlertTriangle, Clock, FileCheck,
   Ship, Calendar, Target, Brain, BarChart3, Eye, Download,
   XCircle, AlertOctagon, TrendingUp, Zap
 } from "lucide-react";
 
  // Types are now imported from the hook
 
export default function ComplianceIntelligence() {
    const { readiness: mockReadiness, items: mockItems, isLoading } = useComplianceIntelligenceData();
    const avgReadiness = mockReadiness.reduce((sum: number, r: InspectionReadiness) => sum + r.score, 0) / Math.max(mockReadiness.length, 1);
    const criticalCount = mockReadiness.filter((r: InspectionReadiness) => r.status === "critical").length;
    const totalFindings = mockReadiness.reduce((sum: number, r: InspectionReadiness) => sum + r.openFindings, 0);
    const expiredItems = mockItems.filter((i: ComplianceItem) => i.status === "expired" || i.status === "non_compliant").length;
 
   const getStatusConfig = (status: string) => {
     const config: Record<string, { color: string; bgColor: string; label: string }> = {
       ready: { color: "text-success", bgColor: "bg-success/10", label: "Pronto" },
       attention: { color: "text-warning", bgColor: "bg-warning/10", label: "Atenção" },
       critical: { color: "text-destructive", bgColor: "bg-destructive/10", label: "Crítico" },
       compliant: { color: "text-success", bgColor: "bg-success/10", label: "Conforme" },
       non_compliant: { color: "text-destructive", bgColor: "bg-destructive/10", label: "Não Conforme" },
       pending: { color: "text-warning", bgColor: "bg-warning/10", label: "Pendente" },
       expired: { color: "text-destructive", bgColor: "bg-destructive/10", label: "Vencido" },
     };
     return config[status] || config.pending;
   };
 
   return (
     <div className="space-y-6">
       {/* KPI Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
         <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
           <CardContent className="p-4 text-center">
             <Shield className="h-5 w-5 text-primary mx-auto mb-2" />
             <p className="text-2xl font-bold">{avgReadiness.toFixed(0)}%</p>
             <p className="text-xs text-muted-foreground">Prontidão Média</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-success/10 to-success/5">
           <CardContent className="p-4 text-center">
             <CheckCircle2 className="h-5 w-5 text-success mx-auto mb-2" />
             <p className="text-2xl font-bold">{mockReadiness.filter(r => r.status === "ready").length}</p>
             <p className="text-xs text-muted-foreground">Prontos</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5">
           <CardContent className="p-4 text-center">
             <AlertOctagon className="h-5 w-5 text-destructive mx-auto mb-2" />
             <p className="text-2xl font-bold">{criticalCount}</p>
             <p className="text-xs text-muted-foreground">Críticos</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-warning/10 to-warning/5">
           <CardContent className="p-4 text-center">
             <AlertTriangle className="h-5 w-5 text-warning mx-auto mb-2" />
             <p className="text-2xl font-bold">{totalFindings}</p>
             <p className="text-xs text-muted-foreground">Findings Abertos</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-info/10 to-info/5">
           <CardContent className="p-4 text-center">
             <XCircle className="h-5 w-5 text-info mx-auto mb-2" />
             <p className="text-2xl font-bold">{expiredItems}</p>
             <p className="text-xs text-muted-foreground">Não Conformes</p>
           </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
           <CardContent className="p-4 text-center">
             <Brain className="h-5 w-5 text-secondary-foreground mx-auto mb-2" />
             <p className="text-2xl font-bold">94%</p>
             <p className="text-xs text-muted-foreground">Precisão IA</p>
           </CardContent>
         </Card>
       </div>
 
       {/* AI Alert */}
       {expiredItems > 0 && (
         <Card className="border-destructive/50 bg-gradient-to-r from-destructive/5 to-transparent">
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-destructive/10 animate-pulse">
                   <Brain className="h-5 w-5 text-destructive" />
                 </div>
                 <div>
                   <p className="font-semibold text-destructive">⚠️ Alerta de Compliance</p>
                   <p className="text-sm text-muted-foreground">
                     {expiredItems} item(s) vencido(s) ou não conforme(s). Risco de detenção PSC aumentado em 35%.
                   </p>
                 </div>
               </div>
               <Button size="sm" variant="destructive" className="gap-2">
                 <Zap className="h-4 w-4" />
                 Ação Imediata
               </Button>
             </div>
           </CardContent>
         </Card>
       )}
 
       {/* Inspection Readiness */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Target className="h-5 w-5 text-primary" />
             Prontidão para Inspeções
           </CardTitle>
           <CardDescription>Score de preparação baseado em IA</CardDescription>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {mockReadiness.map((inspection) => {
               const statusConfig = getStatusConfig(inspection.status);
               return (
                 <div key={inspection.type} className={`p-4 rounded-lg border ${statusConfig.bgColor}`}>
                   <div className="flex items-center justify-between mb-3">
                     <span className="font-bold text-lg">{inspection.type}</span>
                     <Badge className={`${statusConfig.color} bg-transparent border`}>
                       {statusConfig.label}
                     </Badge>
                   </div>
                   <div className="text-center mb-3">
                     <p className={`text-4xl font-bold ${statusConfig.color}`}>{inspection.score}%</p>
                     <p className="text-xs text-muted-foreground">Prontidão</p>
                   </div>
                   <Progress value={inspection.score} className="h-2 mb-3" />
                   <div className="space-y-1 text-sm">
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Próxima</span>
                       <span>{new Date(inspection.nextDue).toLocaleDateString("pt-BR")}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Findings</span>
                       <span className={inspection.openFindings > 0 ? "text-warning font-bold" : ""}>
                         {inspection.openFindings}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Críticos</span>
                       <span className={inspection.criticalItems > 0 ? "text-destructive font-bold" : ""}>
                         {inspection.criticalItems}
                       </span>
                     </div>
                   </div>
                   <Button variant="outline" size="sm" className="w-full mt-3 gap-2">
                     <Eye className="h-4 w-4" />
                     Ver Checklist
                   </Button>
                 </div>
               );
             })}
           </div>
         </CardContent>
       </Card>
 
       {/* Compliance Items with AI Recommendations */}
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle className="flex items-center gap-2">
                 <FileCheck className="h-5 w-5 text-primary" />
                 Itens de Compliance
               </CardTitle>
               <CardDescription>Monitoramento com recomendações de IA</CardDescription>
             </div>
             <Button variant="outline" size="sm" className="gap-2">
               <Download className="h-4 w-4" />
               Exportar
             </Button>
           </div>
         </CardHeader>
         <CardContent>
           <ScrollArea className="h-[350px]">
             <div className="space-y-4">
               {mockItems.map((item) => {
                 const statusConfig = getStatusConfig(item.status);
                 return (
                   <div key={item.id} className={`p-4 rounded-lg border ${
                     item.status === "expired" || item.status === "non_compliant" ? "border-destructive/50" : ""
                   }`}>
                     <div className="flex items-start justify-between mb-2">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <Badge variant="outline">{item.category}</Badge>
                           <Badge className={`${statusConfig.color} bg-transparent border`}>
                             {statusConfig.label}
                           </Badge>
                         </div>
                         <p className="font-semibold">{item.requirement}</p>
                         <p className="text-sm text-muted-foreground flex items-center gap-1">
                           <Ship className="h-3 w-3" />
                           {item.vessel}
                           <span className="mx-2">•</span>
                           <Calendar className="h-3 w-3" />
                           {new Date(item.dueDate).toLocaleDateString("pt-BR")}
                         </p>
                       </div>
                       <Badge variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "secondary" : "outline"}>
                         {item.priority === "high" ? "Alta" : item.priority === "medium" ? "Média" : "Baixa"}
                       </Badge>
                     </div>
                     {item.aiRecommendation && (
                       <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                         <div className="flex items-center gap-2 mb-1">
                           <Brain className="h-4 w-4 text-primary" />
                           <span className="text-xs font-medium text-primary">Recomendação IA</span>
                         </div>
                         <p className="text-sm">{item.aiRecommendation}</p>
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
           </ScrollArea>
         </CardContent>
       </Card>
     </div>
   );
 }