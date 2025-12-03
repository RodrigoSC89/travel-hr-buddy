import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Layers,
  ShieldCheck,
  Ship,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import nautilusLogo from "@/assets/nautilus-logo.png";

const kpiCards = [
  {
    label: "Receita Anual",
    value: "R$ 45.2M",
    change: "+12.5%",
    sublabel: "vs. último trimestre",
    icon: TrendingUp,
    accent: "from-emerald-500/20 to-emerald-500/0",
  },
  {
    label: "Embarcações em Operação",
    value: "38 / 42",
    change: "+3",
    sublabel: "novas integrações aprovadas",
    icon: Ship,
    accent: "from-sky-500/20 to-sky-500/0",
  },
  {
    label: "Compliance Global",
    value: "94.8%",
    change: "-2 alertas",
    sublabel: "pendências resolvidas nas últimas 24h",
    icon: ShieldCheck,
    accent: "from-amber-500/20 to-amber-500/0",
  },
  {
    label: "Eficiência Operacional",
    value: "87.3%",
    change: "+3.2%",
    sublabel: "vs. baseline da frota",
    icon: Zap,
    accent: "from-fuchsia-500/20 to-fuchsia-500/0",
  },
];

const systemSignals = [
  {
    title: "Módulos Monitorados",
    value: "39",
    detail: "36 em execução estável",
    icon: Layers,
    color: "text-foreground",
  },
  {
    title: "Uptime médio",
    value: "98.9%",
    detail: "SLA Platinum",
    icon: Activity,
    color: "text-success",
  },
  {
    title: "Alertas críticos",
    value: "00",
    detail: "últimas 72h",
    icon: AlertTriangle,
    color: "text-warning",
  },
];

const missionHighlights = [
  {
    label: "IA Operacional",
    description: "Modelos preditivos calibrados e auditados",
  },
  {
    label: "Segurança",
    description: "Zero incidentes de compliance em 120 dias",
  },
  {
    label: "Experiência",
    description: "Tempo médio de resposta de 142ms na frota",
  },
  {
    label: "Governança",
    description: "Fluxos aprovados por 5 stakeholders globais",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        {/* Hero */}
        <section className="overflow-hidden rounded-4xl bg-gradient-to-br from-slate-900 via-slate-900/40 to-slate-950 p-8 shadow-2xl ring-1 ring-white/10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Operação Global Ativa
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <img src={nautilusLogo} alt="Nautilus One" className="h-16 w-16 rounded-2xl border border-white/10 bg-white/5 p-1" />
                  <div>
                    <p className="text-sm text-slate-300">Comando estratégico</p>
                    <h1 className="font-display text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                      Nautilus One – Painel Executivo
                    </h1>
                  </div>
                </div>
                <p className="max-w-2xl text-base leading-relaxed text-slate-300">
                  Visualização consolidada da performance operacional, integridade regulatória e insights de IA para decisões críticas da frota.
                </p>
              </div>
            </div>
            <div className="grid gap-6 rounded-3xl border border-white/5 bg-white/5 p-6 text-sm text-slate-200 md:grid-cols-2">
              {missionHighlights.map((highlight) => (
                <div key={highlight.label} className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {highlight.label}
                  </p>
                  <p className="text-base font-medium text-white">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => (
            <Card
              key={card.label}
              className="relative overflow-hidden border-slate-800/80 bg-slate-900/50 text-white shadow-xl backdrop-blur"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent}`}
                aria-hidden
              />
              <CardContent className="relative space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-semibold text-success">{card.change}</span>
                  <span>{card.sublabel}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* System signals */}
        <section className="grid gap-5 md:grid-cols-3">
          {systemSignals.map((signal) => (
            <Card
              key={signal.title}
              className="border-border bg-card text-card-foreground backdrop-blur"
            >
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {signal.title}
                    </p>
                    <p className={`mt-3 text-3xl font-semibold ${signal.color}`}>{signal.value}</p>
                    <p className="text-sm text-muted-foreground">{signal.detail}</p>
                  </div>
                  <signal.icon className="h-10 w-10 text-primary" />
                </div>
                <Progress value={signal.title === "Módulos Monitorados" ? 92 : 100} className="h-2 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Operational integrity */}
        <section className="grid gap-5 lg:grid-cols-2">
          <Card className="border-border bg-card text-card-foreground backdrop-blur">
            <CardHeader>
              <CardTitle>Integridade Operacional</CardTitle>
              <CardDescription>
                Indicadores críticos monitorados em tempo real pela IA distribuída
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                {
                  label: "Checklist Dinâmico",
                  value: "100%",
                  detail: "37 fluxos validados",
                  color: "text-success",
                  progress: 100,
                },
                {
                  label: "Planos de contingência",
                  value: "12 ativos",
                  detail: "Testados nas últimas 48h",
                  color: "text-primary",
                  progress: 86,
                },
                {
                  label: "Inspeções críticas",
                  value: "8 pendências",
                  detail: "Prazo médio 4h",
                  color: "text-warning",
                  progress: 64,
                },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className={`${item.color} text-lg font-semibold`}>{item.value}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.detail}</span>
                  </div>
                  <Progress value={item.progress} className="h-2 bg-muted" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card text-card-foreground backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>
                  Todos os serviços essenciais passam em auditoria de contraste WCAG 2.1 AA
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-success/40 bg-success/10 text-success-foreground">
                Estável
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Dashboard otimizado com tokens de contraste atualizados",
                "Camadas de navegação e sidebar alinhadas às guidelines de spacing",
                "Verificações de segurança, autenticação e telemetria ativas",
                "Fluxos de IA e automação com monitoramento contínuo",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-success" />
                  <span>{item}</span>
                </div>
              ))}
              <div className="rounded-2xl border border-border bg-gradient-to-r from-success/10 to-success/5 p-4 text-xs text-muted-foreground">
                Painel certificado para operação em ambientes de ponte e centros de comando, mantendo legibilidade mínima de 4.5:1 em todos os textos principais.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
