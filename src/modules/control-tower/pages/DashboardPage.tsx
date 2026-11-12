import * as React from "react";
import { addDays, isAfter, isBefore, parseISO } from "date-fns";
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, ClipboardList, FileSignature, Handshake, PackageCheck, RotateCcw, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useContracts, useDeliverableProgress, useDeliverables, useEvents, useOpportunities, useTasks } from "../api";
import { CT_BASE, TASK_STATUSES, eventStatusTone, priorityTone } from "../constants";
import { useCtContext } from "../context";
import { deadlineTone, fmtDateTime, fmtShort, memberName, taskDeadline } from "../lib/format";
import type { Task } from "../types";
import { taskPermissions } from "../components/TaskWorkflow";
import { MemberAvatar, PageHeader, Tone } from "../components/shared";

function Kpi({ label, value, icon: Icon, tone, to, hint }: { label: string; value: React.ReactNode; icon: React.ElementType; tone?: string; to?: string; hint?: string }) {
  const body = (
    <Card className={cn("h-full transition hover:border-primary/40", to && "cursor-pointer")}>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className={cn("mt-1 text-3xl font-semibold tabular-nums", tone)}>{value}</p>
          {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
        <Icon className={cn("h-5 w-5 shrink-0 text-muted-foreground", tone)} />
      </CardContent>
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function TaskLine({ t, extra }: { t: Task; extra?: React.ReactNode }) {
  const dl = taskDeadline(t);
  return (
    <Link
      to={`${CT_BASE}/tarefas?task=${t.id}`}
      className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition hover:bg-muted/60"
    >
      <Tone className={cn("px-1.5 text-[10px]", priorityTone(t.priority))}>{t.priority}</Tone>
      <span className="min-w-0 flex-1 truncate">
        <span className="mr-2 font-mono text-xs text-muted-foreground">{t.code}</span>
        {t.title}
      </span>
      {extra}
      <span className={cn("shrink-0 text-xs", deadlineTone[dl])}>{t.due_date ? fmtShort(t.due_date) : "sem prazo"}</span>
    </Link>
  );
}

const STEPS = [
  ["Contratar", "Conferir contrato assinado + OS e escopo do cliente."],
  ["Distribuir", "Definir executor, revisor, horas e prazo."],
  ["Executar", "Produzir documento, relatório, evidência e versão."],
  ["Double check", "Revisão independente, sem autoaprovação."],
  ["Entregar", "Registrar envio, aceite externo e lote liberado."],
  ["Medir / crescer", "Conciliar horas, faturamento e capacidade."],
];

export default function DashboardPage() {
  const { me, members } = useCtContext();
  const { data: tasks = [] } = useTasks();
  const { data: contracts = [] } = useContracts();
  const { data: deliverables = [] } = useDeliverables();
  const { data: progress = [] } = useDeliverableProgress();
  const { data: events = [] } = useEvents();
  const { data: opps = [] } = useOpportunities();

  const open = tasks.filter((t) => t.status !== "concluida");
  const overdue = open.filter((t) => taskDeadline(t) === "vencido");
  const inReview = tasks.filter((t) => t.status === "em_double_check");
  const myReview = inReview.filter((t) => taskPermissions(t, me.id).canReview);
  const myAdjust = tasks.filter((t) => t.status === "em_ajuste" && t.executor_id === me.id);
  const mySoon = open.filter((t) => t.executor_id === me.id && ["vencido", "hoje", "proximo"].includes(taskDeadline(t)));
  const noDeadline = open.filter((t) => !t.due_date).length;

  const now = new Date();
  const horizon = addDays(now, 30);
  const upcoming = events
    .filter((e) => e.starts_at && e.status !== "Cancelado" && isAfter(parseISO(e.starts_at), addDays(now, -1)) && isBefore(parseISO(e.starts_at), horizon))
    .sort((a, b) => (a.starts_at ?? "").localeCompare(b.starts_at ?? ""));
  const toSchedule = events.filter((e) => e.status === "A agendar" || e.status === "A confirmar");

  const targetSum = deliverables.reduce((s, d) => s + Number(d.target_qty ?? 0), 0);
  const released = progress.reduce((s, p) => s + Number(p.released_qty ?? 0), 0);
  const activeOpps = opps.filter((o) => !["Ganha", "Perdida", "Monitoramento", "Relacionamento"].includes(o.phase));
  const signed = contracts.filter((c) => c.signed_status === "Sim").length;

  const load = members
    .filter((m) => m.active)
    .map((m) => {
      const exec = open.filter((t) => t.executor_id === m.id);
      const rev = open.filter((t) => t.reviewer_id === m.id);
      const hours = exec.reduce((s, t) => s + Number(t.hours_executor ?? 0), 0) + rev.reduce((s, t) => s + Number(t.hours_reviewer ?? 0), 0);
      return { m, exec: exec.length, rev: rev.length, hours, pendingReview: rev.filter((t) => t.status === "em_double_check").length };
    });

  const greeting = now.getHours() < 12 ? "Bom dia" : now.getHours() < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-6">
      <PageHeader title={`${greeting}, ${me.short_name}`} subtitle="Visão geral da MB Maritime: contratos, entregas, prazos e double check." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Tarefas em aberto" value={open.length} icon={ClipboardList} to={`${CT_BASE}/tarefas`} hint={noDeadline ? `${noDeadline} sem prazo definido` : undefined} />
        <Kpi label="Prazos vencidos" value={overdue.length} icon={AlertTriangle} tone={overdue.length ? "text-red-600 dark:text-red-400" : undefined} to={`${CT_BASE}/tarefas`} />
        <Kpi label="Em double check" value={inReview.length} icon={ShieldCheck} tone={myReview.length ? "text-violet-600 dark:text-violet-300" : undefined} to={`${CT_BASE}/tarefas?scope=revisar`} hint={myReview.length ? `${myReview.length} aguardando você` : undefined} />
        <Kpi label="Contratos conferidos" value={`${signed}/${contracts.length}`} icon={FileSignature} tone={signed < contracts.length ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"} to={`${CT_BASE}/contratos`} hint="Assinado + OS verificados" />
        <Kpi label="Unidades liberadas" value={`${released}/${targetSum}`} icon={PackageCheck} to={`${CT_BASE}/entregaveis`} hint="Lotes aprovados e aceitos" />
        <Kpi label="Próximos compromissos" value={upcoming.length} icon={CalendarDays} to={`${CT_BASE}/agenda`} hint={`${toSchedule.length} ainda sem agendamento`} />
        <Kpi label="Oportunidades ativas" value={activeOpps.length} icon={Handshake} to={`${CT_BASE}/comercial`} hint={`${opps.length} contas na carteira`} />
        <Kpi label="Concluídas" value={tasks.length - open.length} icon={CheckCircle2} tone="text-emerald-600 dark:text-emerald-400" hint="Com double check registrado" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Minha fila</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myReview.length + myAdjust.length + mySoon.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Nada urgente para você agora.</p>
            )}
            {myReview.length > 0 && (
              <section>
                <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> Aguardando sua revisão
                </h4>
                {myReview.map((t) => (
                  <TaskLine key={t.id} t={t} extra={<span className="text-xs text-muted-foreground">de {memberName(members, t.submitted_by)}</span>} />
                ))}
              </section>
            )}
            {myAdjust.length > 0 && (
              <section>
                <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-300">
                  <RotateCcw className="h-3.5 w-3.5" /> Devolvidas para ajuste
                </h4>
                {myAdjust.map((t) => (
                  <TaskLine key={t.id} t={t} />
                ))}
              </section>
            )}
            {mySoon.length > 0 && (
              <section>
                <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Vencidas ou vencendo em 3 dias
                </h4>
                {mySoon.map((t) => (
                  <TaskLine key={t.id} t={t} />
                ))}
              </section>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Carga da equipe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {load.map(({ m, exec, rev, hours, pendingReview }) => (
              <div key={m.id} className="flex items-center gap-3">
                <MemberAvatar id={m.id} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exec} executando · {rev} revisando{pendingReview ? ` (${pendingReview} pendentes)` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums">{hours.toLocaleString("pt-BR")}h</p>
                  <p className="text-[10px] text-muted-foreground">estimadas</p>
                </div>
              </div>
            ))}
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">Tarefas por status</p>
              <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                {TASK_STATUSES.map((s) => {
                  const n = tasks.filter((t) => t.status === s.value).length;
                  return n ? <div key={s.value} title={`${s.label}: ${n}`} className={cn("h-full border-r border-background", s.tone)} style={{ width: `${(n / tasks.length) * 100}%` }} /> : null;
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {TASK_STATUSES.map((s) => (
                  <span key={s.value} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className={cn("h-2 w-2 rounded-full border", s.tone)} /> {s.label} {tasks.filter((t) => t.status === s.value).length}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Contratos em execução</CardTitle>
            <Link to={`${CT_BASE}/contratos`} className="flex items-center gap-1 text-xs text-primary hover:underline">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {contracts.map((c) => {
              const ds = deliverables.filter((d) => d.contract_id === c.id);
              const tgt = ds.reduce((s, d) => s + Number(d.target_qty ?? 0), 0);
              const rel = ds.reduce((s, d) => s + Number(progress.find((p) => p.deliverable_id === d.id)?.released_qty ?? 0), 0);
              const ct = open.filter((t) => t.contract_id === c.id).length;
              return (
                <Link key={c.id} to={`${CT_BASE}/contratos?c=${c.id}`} className="block rounded-lg border p-3 transition hover:border-primary/40">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{c.client}</span>
                      <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Tone className={c.signed_status === "Sim" ? "border-emerald-500/40 text-emerald-600" : "border-amber-500/40 text-amber-600 dark:text-amber-400"}>
                        Assinado: {c.signed_status}
                      </Tone>
                      <span className="text-muted-foreground">{ct} tarefas abertas</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Próximo marco: {c.next_milestone || "—"}</p>
                  {tgt > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={(rel / tgt) * 100} className="h-1.5" />
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {rel}/{tgt}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Agenda · 30 dias</CardTitle>
            <Link to={`${CT_BASE}/agenda`} className="flex items-center gap-1 text-xs text-primary hover:underline">
              Abrir <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nenhum compromisso com data confirmada.</p>}
            {upcoming.slice(0, 6).map((e) => (
              <div key={e.id} className="rounded-md border p-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{fmtDateTime(e.starts_at)}</span>
                  <Tone className={cn("text-[10px]", eventStatusTone[e.status])}>{e.status}</Tone>
                </div>
                <p className="mt-1 truncate">{e.title}</p>
              </div>
            ))}
            {toSchedule.length > 0 && (
              <p className="pt-1 text-xs text-amber-600 dark:text-amber-400">{toSchedule.length} compromissos a agendar / confirmar</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Trilha de operação</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="rounded-lg border bg-muted/20 p-3">
                <p className="text-xs font-semibold text-primary">0{i + 1}</p>
                <p className="text-sm font-semibold">{t}</p>
                <p className="mt-1 text-xs text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
