/**
 * Compliance Command Dashboard - Premium Compliance Center
 * Centro de Comando de Compliance Unificado
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, FileCheck, AlertTriangle, CheckCircle2, Clock,
  FileText, Calendar, Target, TrendingUp, Brain, Sparkles,
  Ship, Award, ClipboardCheck, BookOpen, AlertCircle,
  ArrowRight, Eye, RefreshCw, Download, Filter, Search
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Mock data
const complianceScore = {
  overall: 94,
  ism: 98,
  isps: 96,
  mlc: 92,
  marpol: 95,
  solas: 97,
};

const regulationStatus = [
  { name: "ISM Code", status: "compliant", audits: 2, lastAudit: "2026-01-15", nextAudit: "2027-01-15", score: 98 },
  { name: "ISPS Code", status: "compliant", audits: 1, lastAudit: "2025-12-10", nextAudit: "2026-12-10", score: 96 },
  { name: "MLC 2006", status: "attention", audits: 3, lastAudit: "2026-01-20", nextAudit: "2026-07-20", score: 92 },
  { name: "MARPOL", status: "compliant", audits: 4, lastAudit: "2026-01-25", nextAudit: "2027-01-25", score: 95 },
  { name: "SOLAS", status: "compliant", audits: 2, lastAudit: "2025-11-30", nextAudit: "2026-11-30", score: 97 },
  { name: "STCW", status: "attention", audits: 1, lastAudit: "2025-10-15", nextAudit: "2026-04-15", score: 88 },
];

const pendingAudits = [
  { id: "1", type: "PSC", vessel: "MV Atlântico Sul", date: "2026-02-10", port: "Santos", priority: "high" },
  { id: "2", type: "Flag State", vessel: "MV Horizonte", date: "2026-02-15", port: "Rio de Janeiro", priority: "high" },
  { id: "3", type: "ISM Internal", vessel: "MV Oceano", date: "2026-02-20", port: "-", priority: "normal" },
  { id: "4", type: "MLC", vessel: "MV Pacífico", date: "2026-03-01", port: "Paranaguá", priority: "normal" },
];

const nonConformities = [
  { id: "1", code: "NC-2026-001", description: "Certificado GMDSS vencido - 1 tripulante", severity: "major", status: "open", vessel: "MV Atlântico Sul", dueDate: "2026-02-15" },
  { id: "2", code: "NC-2026-002", description: "Equipamento de salvatagem com manutenção atrasada", severity: "major", status: "in_progress", vessel: "MV Horizonte", dueDate: "2026-02-20" },
  { id: "3", code: "NC-2026-003", description: "Documentação ORB incompleta", severity: "minor", status: "open", vessel: "MV Oceano", dueDate: "2026-02-28" },
];

const complianceTrend = [
  { month: "Ago", score: 89 },
  { month: "Set", score: 91 },
  { month: "Out", score: 90 },
  { month: "Nov", score: 93 },
  { month: "Dez", score: 92 },
  { month: "Jan", score: 94 },
];

const aiFindings = [
  { id: "1", type: "risk", message: "3 embarcações com auditorias PSC em janela de 60 dias - Priorizar preparação", priority: "high", action: "Ver plano" },
  { id: "2", type: "optimization", message: "Padrão de NCs em documentação ORB sugere necessidade de treinamento", priority: "warning", action: "Ver análise" },
  { id: "3", type: "prediction", message: "Score MLC pode cair 4% se certificações pendentes não forem renovadas", priority: "warning", action: "Ver certificações" },
  { id: "4", type: "compliance", message: "Nova regulamentação IMO 2026 requer atualização em 2 procedimentos", priority: "info", action: "Ver detalhes" },
];

const scoreDistribution = [
  { name: "Excelente (>95)", value: 3, color: "#10b981" },
  { name: "Bom (90-95)", value: 2, color: "#3b82f6" },
  { name: "Atenção (80-90)", value: 1, color: "#f59e0b" },
];

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    compliant: { label: "Conforme", className: "bg-success/10 text-success border-success/20" },
    attention: { label: "Atenção", className: "bg-warning/10 text-warning border-warning/20" },
    critical: { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const variant = variants[status] || variants.attention;
  return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
}

function SeverityBadge({ severity }: { severity: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    major: { label: "Major", className: "bg-destructive/10 text-destructive border-destructive/20" },
    minor: { label: "Minor", className: "bg-warning/10 text-warning border-warning/20" },
    observation: { label: "Observação", className: "bg-muted text-muted-foreground" },
  };
  const variant = variants[severity] || variants.minor;
  return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
}

export default function ComplianceCommandDashboard() {
  return (
    <div className="space-y-6">
      {/* Overall Score + Regulation Scores */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
          <Card className="border-l-4 border-l-success h-full">
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Score Geral</p>
                  <p className="text-4xl font-bold text-success">{complianceScore.overall}%</p>
                  <p className="text-xs text-success">+2% vs mês anterior</p>
                </div>
                <Shield className="h-12 w-12 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {Object.entries(complianceScore).filter(([key]) => key !== "overall").map(([key, value], idx) => (
          <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (idx + 1) }}>
            <Card className={`border-l-4 ${value >= 95 ? "border-l-success" : value >= 90 ? "border-l-primary" : "border-l-warning"} hover:shadow-lg transition-shadow cursor-pointer`}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase">{key}</p>
                <p className={`text-2xl font-bold ${value >= 95 ? "text-success" : value >= 90 ? "text-primary" : "text-warning"}`}>{value}%</p>
                <Progress value={value} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Trend Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Evolução do Compliance
                  </CardTitle>
                  <CardDescription>Score geral nos últimos 6 meses</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={complianceTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis domain={[80, 100]} className="text-xs" />
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Score" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Insights IA Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[240px]">
              <div className="space-y-3">
                {aiFindings.map((finding) => (
                  <motion.div
                    key={finding.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${
                      finding.priority === "high" ? "border-destructive/50 bg-destructive/5" :
                      finding.priority === "warning" ? "border-warning/50 bg-warning/5" :
                      "border-primary/50 bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Brain className={`h-4 w-4 mt-0.5 ${
                        finding.priority === "high" ? "text-destructive" :
                        finding.priority === "warning" ? "text-warning" : "text-primary"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{finding.message}</p>
                        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs gap-1 p-0">
                          {finding.action}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Audits */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Auditorias Programadas
              </CardTitle>
              <Badge variant="secondary">{pendingAudits.length} pendentes</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-3">
                {pendingAudits.map((audit, idx) => (
                  <motion.div
                    key={audit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      audit.priority === "high" ? "border-destructive/30 bg-destructive/5" : ""
                    } hover:bg-accent/50 transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{audit.type}</Badge>
                          {audit.priority === "high" && (
                            <Badge variant="destructive" className="text-xs">Urgente</Badge>
                          )}
                        </div>
                        <p className="font-medium mt-1">{audit.vessel}</p>
                        <p className="text-xs text-muted-foreground">
                          {audit.date} {audit.port !== "-" && `• ${audit.port}`}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Non-Conformities */}
        <Card className="border-warning/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Não Conformidades Abertas
              </CardTitle>
              <Badge variant="destructive">{nonConformities.filter(nc => nc.status === "open").length} abertas</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-3">
                {nonConformities.map((nc, idx) => (
                  <motion.div
                    key={nc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      nc.severity === "major" ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{nc.code}</Badge>
                      <SeverityBadge severity={nc.severity} />
                    </div>
                    <p className="text-sm font-medium">{nc.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">{nc.vessel} • Prazo: {nc.dueDate}</p>
                      <Badge variant={nc.status === "open" ? "secondary" : "default"}>
                        {nc.status === "open" ? "Aberta" : "Em andamento"}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Regulation Status Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Status por Regulamentação
            </CardTitle>
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {regulationStatus.map((reg, idx) => (
              <motion.div
                key={reg.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-xl border text-center hover:shadow-lg transition-all cursor-pointer ${
                  reg.status === "compliant" ? "hover:border-success" : "hover:border-warning"
                }`}
              >
                <StatusBadge status={reg.status} />
                <p className="font-bold text-lg mt-2">{reg.name}</p>
                <p className={`text-2xl font-bold mt-1 ${
                  reg.score >= 95 ? "text-success" : reg.score >= 90 ? "text-primary" : "text-warning"
                }`}>{reg.score}%</p>
                <Progress value={reg.score} className="h-1.5 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Próx: {reg.nextAudit}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
