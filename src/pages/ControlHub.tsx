/**
 * ControlHub - Painel Central de Telemetria e Observabilidade
 * 
 * Dashboard de monitoramento em tempo real com MQTT, AI insights e alertas unificados.
 * 
 * @module ControlHub
 * @version 1.3.0 (Patch 18 - AI Incident Response & Resilience Integration)
 */

import React, { Suspense, PropsWithChildren } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loader, Activity, ShieldCheck, Radio, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ControlHubPanel = safeLazyImport(() => import("@/components/control-hub/ControlHubPanel"), "ControlHubPanel");
const SystemAlerts = safeLazyImport(() => import("@/components/control-hub/SystemAlerts"), "SystemAlerts");
const AIInsightReporter = safeLazyImport(() => import("@/components/control-hub/AIInsightReporter"), "AIInsightReporter");
const ComplianceDashboard = safeLazyImport(() => import("@/components/compliance/ComplianceDashboard"), "ComplianceDashboard");
const ForecastDashboard = safeLazyImport(() => import("@/components/control-hub/ForecastDashboard"), "ForecastDashboard");
const ResilienceMonitor = safeLazyImport(() => import("@/components/resilience/ResilienceMonitor"), "ResilienceMonitor");
const ResilienceComplianceDashboard = safeLazyImport(() => import("@/components/resilience/ComplianceDashboard"), "ComplianceDashboard");
const IncidentResponsePanel = safeLazyImport(() => import("@/components/resilience/IncidentResponsePanel"), "IncidentResponsePanel");
const MaintenanceDashboard = safeLazyImport(() => import("@/components/maintenance/MaintenanceDashboard"), "MaintenanceDashboard");

const heroStats = [
  {
    label: "Telemetria ativa",
    value: "1.2M msg/min",
    detail: "Streams MQTT + AIS",
    icon: Radio,
  },
  {
    label: "Playbooks resilientes",
    value: "24",
    detail: "auditados nas últimas 48h",
    icon: ShieldCheck,
  },
  {
    label: "Insights de IA",
    value: "+320",
    detail: "recomendações/dia",
    icon: Sparkles,
  },
];

export default function ControlHub() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <section className="rounded-4xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-950 p-8 shadow-2xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-6">
              <Badge variant="outline" className="border-emerald-400/40 bg-emerald-500/10 text-emerald-200">
                Operação Global Ativa
              </Badge>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Centro de comando</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                  Control Hub · Observability & AI Insights
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  Painel executivo com telemetria em tempo real, alertas unificados e modelos de IA distribuídos para decisões rápidas e auditáveis.
                </p>
              </div>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <Card key={stat.label} className="border-border bg-card text-card-foreground">
                  <CardContent className="space-y-2 p-4">
                    <stat.icon className="h-5 w-5 text-success" />
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            title="Telemetria e Previsão"
            description="Streams críticos com suporte de IA, previsões e automação assistida"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            <ModuleSurface
              title="Núcleo de Observabilidade"
              description="MQTT, AIS e sensores convergindo em tempo real"
            >
              <Suspense fallback={<LoadingCard label="Observabilidade" />}>
                <ControlHubPanel />
              </Suspense>
            </ModuleSurface>

            <ModuleSurface
              title="Alertas unificados"
              description="Correlação automática de eventos críticos"
            >
              <Suspense fallback={<LoadingCard label="Alertas" />}>
                <SystemAlerts />
              </Suspense>
            </ModuleSurface>

            <ModuleSurface
              title="Forecast assistido por IA"
              description="Desempenho da frota e riscos previstos"
            >
              <Suspense fallback={<LoadingCard label="Forecast" />}>
                <ForecastDashboard />
              </Suspense>
            </ModuleSurface>
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader
            title="Resiliência & Compliance"
            description="KPIs de continuidade, auditoria viva e manutenção crítica"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ModuleSurface title="Resilience Monitor" description="Saúde dos clusters e módulos redundantes">
              <Suspense fallback={<LoadingCard label="Resilience" />}>
                <ResilienceMonitor />
              </Suspense>
            </ModuleSurface>

            <ModuleSurface
              title="Compliance Resiliente"
              description="Evidências auditáveis e certificação ativa"
            >
              <Suspense fallback={<LoadingCard label="Compliance" />}>
                <ResilienceComplianceDashboard />
              </Suspense>
            </ModuleSurface>

            <ModuleSurface title="Manutenção preditiva" description="Backlogs críticos e telemetria de ativos">
              <Suspense fallback={<LoadingCard label="Manutenção" />}>
                <MaintenanceDashboard />
              </Suspense>
            </ModuleSurface>

            <ModuleSurface title="Governança regulatória" description="Checklist global de conformidade">
              <Suspense fallback={<LoadingCard label="Auditoria" />}>
                <ComplianceDashboard />
              </Suspense>
            </ModuleSurface>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border bg-card text-card-foreground">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Resposta a incidentes</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Playbooks com IA, comunicação automatizada e trilhas de auditoria completas
                </p>
              </div>
              <Badge variant="outline" className="border-warning/50 bg-warning/10 text-warning-foreground">
                Em standby
              </Badge>
            </CardHeader>
            <CardContent className="rounded-3xl border border-border bg-muted/40 p-4">
              <Suspense fallback={<LoadingCard label="Incident Response" />}>
                <IncidentResponsePanel />
              </Suspense>
            </CardContent>
          </Card>

          <Card className="border-border bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>AI Insight Reporter</CardTitle>
              <p className="text-sm text-muted-foreground">
                Insights priorizados por criticidade, explicados e prontos para ação executiva
              </p>
            </CardHeader>
            <CardContent className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <Suspense fallback={<LoadingCard label="AI Insights" />}>
                <AIInsightReporter />
              </Suspense>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
        <div className="h-1 w-6 rounded-full bg-emerald-400" />
        {title}
      </div>
      <p className="text-base text-slate-300">{description}</p>
    </div>
  );
}

function ModuleSurface({ title, description, children }: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 text-card-foreground shadow-lg backdrop-blur">
      <div className="space-y-1 px-1 pb-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-2xl border border-border bg-muted/30 p-3">
        {children}
      </div>
    </div>
  );
}

function LoadingCard({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-muted/60 p-6 text-muted-foreground">
      <Loader className="h-6 w-6 animate-spin text-success" />
      {label && <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>}
    </div>
  );
}
