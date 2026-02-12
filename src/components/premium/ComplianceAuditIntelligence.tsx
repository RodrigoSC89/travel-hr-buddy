/**
 * Compliance & Audit Intelligence Hub
 * Advanced compliance management with AI agents, certifications, and risk matrix
 * Based on DNV, ISM, ISPS, and MLC 2006 standards
 * REFACTORED: Uses real Supabase data via useComplianceIntelligenceData
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield, AlertTriangle, CheckCircle, Bot, Brain,
  Calendar, Clock, Target, Users,
  Award, Zap, Eye, Loader2,
  ClipboardCheck, Scale, Activity
} from "lucide-react";
import { toast } from "sonner";
import { useComplianceIntelligenceData } from "@/hooks/useComplianceIntelligenceData";

export default function ComplianceAuditIntelligence() {
  const [activeTab, setActiveTab] = useState("certifications");
  const { 
    certificates, agents, audits, nonConformities, 
    readiness, items, isLoading, error 
  } = useComplianceIntelligenceData();

  const validCerts = certificates.filter(c => c.status === "valid").length;
  const openNCs = nonConformities.filter(nc => nc.status !== "closed").length;
  const highRisks = readiness.filter(r => r.status === "critical").length;
  const activeAgents = agents.filter(a => a.status === "active").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid": case "active": case "closed": case "completed": case "ready":
        return "bg-success/10 text-success border-success/20";
      case "renewal_due": case "in_progress": case "standby": case "attention":
        return "bg-warning/10 text-warning border-warning/20";
      case "expired": case "open": case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando dados de compliance...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        <AlertTriangle className="h-6 w-6 mr-2" />
        <span>Erro ao carregar: {(error as Error).message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Certificados Válidos</p>
                <p className="text-2xl font-bold">{validCerts}/{certificates.length}</p>
                <Progress value={certificates.length > 0 ? (validCerts / certificates.length) * 100 : 0} className="h-1 mt-1" />
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
                <p className="text-xs text-muted-foreground">Áreas Críticas</p>
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
                <p className="text-xs text-muted-foreground">AI Agents</p>
                <p className="text-2xl font-bold">{activeAgents}/{agents.length}</p>
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
          <TabsTrigger value="readiness" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Readiness
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
                {certificates.length} certificados registrados — dados reais do Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Nenhum certificado registrado.</p>
                  <p className="text-sm">Adicione certificados no módulo de Compliance.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {certificates.map(cert => (
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
                              {cert.status === "valid" ? "Válido" : 
                               cert.status === "renewal_due" ? "Renovação Pendente" : "Expirado"}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Emissão</p>
                            <p className="font-medium">{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Validade</p>
                            <p className={`font-medium ${cert.status === 'expired' ? 'text-red-500' : cert.status === 'renewal_due' ? 'text-amber-500' : ''}`}>
                              {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
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
                Agentes de IA registrados no agent_registry
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Nenhum agente de auditoria registrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map(agent => (
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
                                Precisão: {agent.accuracy}%
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(agent.status)}>
                            {agent.status === "active" ? "Ativo" : "Standby"}
                          </Badge>
                        </div>

                        {agent.capabilities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 3).map((cap, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{String(cap)}</Badge>
                            ))}
                          </div>
                        )}

                        <Button size="sm" className="w-full" variant="outline"
                          onClick={async () => {
                            toast.loading(`Executando ${agent.name}...`, { id: `agent-${agent.id}` });
                            try {
                              const { supabase } = await import("@/integrations/supabase/client");
                              await supabase.from("ai_audit_logs").insert({
                                user_input: `Execução manual do agente: ${agent.name}`,
                                interaction_type: "agent_execution",
                                module_name: "compliance-audit-intelligence"
                              });
                              toast.success(`${agent.name} executado com sucesso`, { id: `agent-${agent.id}` });
                            } catch {
                              toast.error(`Erro ao executar ${agent.name}`, { id: `agent-${agent.id}` });
                            }
                          }}>
                          <Zap className="h-3 w-3 mr-1" />
                          Executar Agora
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
              {audits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Nenhuma auditoria agendada.</p>
                </div>
              ) : (
                <ScrollArea className="h-[350px]">
                  <div className="space-y-4">
                    {audits.map(audit => (
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
                          {audit.scheduledDate ? new Date(audit.scheduledDate).toLocaleDateString('pt-BR') : 'N/A'}
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
              )}
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
              {nonConformities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>Nenhuma não-conformidade registrada. Excelente!</p>
                </div>
              ) : (
                <ScrollArea className="h-[350px]">
                  <div className="space-y-4">
                    {nonConformities.map(nc => (
                      <div key={nc.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">{nc.id.slice(0, 8)}</Badge>
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
                          <span>Aberta: {nc.raisedDate ? new Date(nc.raisedDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inspection Readiness Tab */}
        <TabsContent value="readiness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Inspection Readiness
              </CardTitle>
              <CardDescription>
                Prontidão calculada a partir de certificados e NCs reais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {readiness.map(r => (
                  <div key={r.type} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{r.type}</h4>
                      <Badge className={getStatusColor(r.status)}>
                        {r.status === "ready" ? "Pronto" : r.status === "attention" ? "Atenção" : "Crítico"}
                      </Badge>
                    </div>
                    <Progress value={r.score} className={`h-2 mb-2 ${
                      r.score < 50 ? "[&>div]:bg-red-500" : r.score < 80 ? "[&>div]:bg-amber-500" : ""
                    }`} />
                    <div className="grid grid-cols-3 gap-4 text-sm text-center mt-3">
                      <div>
                        <p className="text-muted-foreground">Score</p>
                        <p className={`font-bold ${r.score >= 80 ? 'text-green-500' : r.score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                          {r.score}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Findings Abertos</p>
                        <p className="font-bold">{r.openFindings}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Itens Críticos</p>
                        <p className="font-bold text-red-500">{r.criticalItems}</p>
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
