import * as React from "react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarPlus, ChevronLeft, ChevronRight, Download, ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useEvents, useRemove, useSave, useTasks } from "../api";
import { EVENT_KINDS, EVENT_STATUSES, eventStatusTone } from "../constants";
import { useCtContext } from "../context";
import { fmtDateTime, fromLocalInput, memberName, toLocalInput } from "../lib/format";
import { downloadText, eventsToIcs } from "../lib/ics";
import { exportExcel } from "../lib/export";
import { useExportData } from "../hooks";
import type { CtEvent, EventKind, EventStatus } from "../types";
import { Field, MemberSelect, OptionSelect, PageHeader, Tone } from "../components/shared";

function EventDialog({ open, onOpenChange, item, defaultDate }: { open: boolean; onOpenChange: (v: boolean) => void; item: CtEvent | null; defaultDate?: Date | null }) {
  const { me, members } = useCtContext();
  const { data: tasks = [] } = useTasks();
  const save = useSave<CtEvent>("ct_events", item ? "Compromisso atualizado" : "Compromisso criado");
  const remove = useRemove("ct_events");
  const [d, setD] = React.useState<Partial<CtEvent>>({});

  React.useEffect(() => {
    if (!open) return;
    if (item) return setD({ ...item });
    const other = members.find((m) => m.id !== me.id);
    const start = defaultDate ? new Date(defaultDate.getFullYear(), defaultDate.getMonth(), defaultDate.getDate(), 9, 0) : null;
    setD({
      kind: "Reunião",
      status: start ? "A confirmar" : "A agendar",
      owner_id: me.id,
      reviewer_id: other?.id ?? null,
      starts_at: start?.toISOString() ?? null,
      ends_at: start ? new Date(start.getTime() + 3600_000).toISOString() : null,
    });
  }, [open, item, defaultDate, me.id, members]);

  const set = <K extends keyof CtEvent>(k: K, v: CtEvent[K] | null) => setD((p) => ({ ...p, [k]: v }));
  const needsDate = (d.status === "Confirmado" || d.status === "Realizado") && !d.starts_at;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsDate) return void toast.error("Compromisso confirmado precisa de data e hora");
    await save.mutateAsync({ ...d, id: item?.id }).then(() => onOpenChange(false)).catch(() => undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? `${item.code} · editar compromisso` : "Novo compromisso"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Compromisso / resultado *" className="sm:col-span-2">
            <Input value={d.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
          </Field>
          <Field label="Tipo">
            <OptionSelect<EventKind> value={d.kind} onChange={(v) => set("kind", v ?? "Reunião")} options={EVENT_KINDS} />
          </Field>
          <Field label="Situação" hint="Somente compromissos com data podem ser confirmados">
            <OptionSelect<EventStatus> value={d.status} onChange={(v) => set("status", v ?? "A agendar")} options={EVENT_STATUSES} />
          </Field>
          <Field label="Início">
            <Input type="datetime-local" value={toLocalInput(d.starts_at ?? null)} onChange={(e) => set("starts_at", fromLocalInput(e.target.value))} />
          </Field>
          <Field label="Fim">
            <Input type="datetime-local" value={toLocalInput(d.ends_at ?? null)} onChange={(e) => set("ends_at", fromLocalInput(e.target.value))} />
          </Field>
          <Field label="Cliente / frente">
            <Input value={d.client ?? ""} onChange={(e) => set("client", e.target.value)} />
          </Field>
          <Field label="Tarefa vinculada">
            <OptionSelect value={d.task_id} onChange={(v) => set("task_id", v)} allowEmpty options={tasks.map((t) => ({ value: t.id, label: `${t.code} · ${t.title}` }))} />
          </Field>
          <Field label="Dono">
            <MemberSelect value={d.owner_id} onChange={(v) => set("owner_id", v)} allowEmpty />
          </Field>
          <Field label="Revisor">
            <MemberSelect value={d.reviewer_id} onChange={(v) => set("reviewer_id", v)} allowEmpty exclude={d.owner_id} />
          </Field>
          <Field label="Local">
            <Input value={d.location ?? ""} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="Convite / link">
            <Input value={d.link ?? ""} onChange={(e) => set("link", e.target.value)} placeholder="https://teams…" />
          </Field>
          <Field label="Pauta / objetivo" className="sm:col-span-2">
            <Textarea rows={2} value={d.agenda ?? ""} onChange={(e) => set("agenda", e.target.value)} />
          </Field>
          <Field label="Registro / resultado (ata)" className="sm:col-span-2">
            <Textarea rows={3} value={d.outcome ?? ""} onChange={(e) => set("outcome", e.target.value)} placeholder="Decisões, responsáveis, prazos…" />
          </Field>
          <Field label="Próxima ação">
            <Input value={d.next_action ?? ""} onChange={(e) => set("next_action", e.target.value)} />
          </Field>
          <Field label="Observações">
            <Input value={d.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </Field>
          <DialogFooter className="gap-2 sm:col-span-2">
            {item && (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto text-destructive"
                onClick={() => remove.mutateAsync(item.id).then(() => onOpenChange(false)).catch(() => undefined)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
            )}
            {item?.starts_at && (
              <Button type="button" variant="outline" onClick={() => downloadText(`${item.code}.ics`, eventsToIcs([item]))}>
                <CalendarPlus className="mr-2 h-4 w-4" /> Adicionar ao calendário
              </Button>
            )}
            <Button type="submit" disabled={save.isPending || !d.title}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function AgendaPage() {
  const { members } = useCtContext();
  const { data: events = [] } = useEvents();
  const exportData = useExportData();
  const [month, setMonth] = React.useState(() => startOfMonth(new Date()));
  const [editing, setEditing] = React.useState<{ item: CtEvent | null; date?: Date | null } | null>(null);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const dated = events.filter((e) => e.starts_at).sort((a, b) => (a.starts_at ?? "").localeCompare(b.starts_at ?? ""));
  const undated = events.filter((e) => !e.starts_at && e.status !== "Cancelado");
  const inMonth = dated.filter((e) => isSameMonth(parseISO(e.starts_at as string), month));
  const today = new Date();

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle="Reuniões, auditorias e treinamentos. Sem data confirmada não vira reunião agendada."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => downloadText(`MB_Agenda_${format(new Date(), "yyyyMMdd")}.ics`, eventsToIcs(dated.filter((e) => e.status !== "Cancelado")))}>
              <Download className="mr-2 h-4 w-4" /> Exportar .ics
            </Button>
            <Button variant="outline" size="sm" disabled={!exportData} onClick={() => exportData && exportExcel(exportData, "Agenda")}>
              Excel
            </Button>
            <Button size="sm" onClick={() => setEditing({ item: null })}>
              <Plus className="mr-2 h-4 w-4" /> Novo compromisso
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base capitalize">{format(month, "MMMM yyyy", { locale: ptBR })}</CardTitle>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" aria-label="Mês anterior" onClick={() => setMonth((m) => addMonths(m, -1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setMonth(startOfMonth(new Date()))}>
                Hoje
              </Button>
              <Button size="icon" variant="ghost" aria-label="Próximo mês" onClick={() => setMonth((m) => addMonths(m, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border text-xs">
              {WEEKDAYS.map((w) => (
                <div key={w} className="bg-muted/60 px-1 py-1.5 text-center font-medium text-muted-foreground">
                  {w}
                </div>
              ))}
              {days.map((day) => {
                const evs = dated.filter((e) => isSameDay(parseISO(e.starts_at as string), day));
                return (
                  <button
                    type="button"
                    key={day.toISOString()}
                    onClick={() => setEditing({ item: null, date: day })}
                    className={cn(
                      "flex min-h-[72px] flex-col items-stretch gap-0.5 bg-card p-1 text-left align-top transition hover:bg-muted/40 sm:min-h-[96px]",
                      !isSameMonth(day, month) && "text-muted-foreground opacity-40",
                    )}
                  >
                    <span className={cn("mb-0.5 self-end rounded-full px-1.5 text-[11px]", isSameDay(day, today) && "bg-primary font-semibold text-primary-foreground")}>
                      {format(day, "d")}
                    </span>
                    {evs.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        role="button"
                        tabIndex={0}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setEditing({ item: e });
                        }}
                        onKeyDown={(ev) => ev.key === "Enter" && setEditing({ item: e })}
                        className={cn("truncate rounded border px-1 py-0.5 text-[10px] leading-tight", eventStatusTone[e.status], e.status === "Cancelado" && "line-through")}
                        title={`${format(parseISO(e.starts_at as string), "HH:mm")} ${e.title}`}
                      >
                        <span className="hidden sm:inline">{format(parseISO(e.starts_at as string), "HH:mm")} </span>
                        {e.title}
                      </span>
                    ))}
                    {evs.length > 3 && <span className="text-[10px] text-muted-foreground">+{evs.length - 3}</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {inMonth.length} compromissos no mês · clique em um dia para criar
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">A agendar / confirmar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {undated.length === 0 && <p className="text-sm text-muted-foreground">Nada pendente.</p>}
              {undated.map((e) => (
                <button key={e.id} type="button" onClick={() => setEditing({ item: e })} className="w-full rounded-md border p-2.5 text-left text-sm transition hover:border-primary/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{e.code}</span>
                    <Tone className={cn("text-[10px]", eventStatusTone[e.status])}>{e.status}</Tone>
                  </div>
                  <p className="mt-1 font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.client} · {memberName(members, e.owner_id)}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Próximos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dated
                .filter((e) => parseISO(e.starts_at as string) >= new Date(today.toDateString()) && e.status !== "Cancelado")
                .slice(0, 8)
                .map((e) => (
                  <button key={e.id} type="button" onClick={() => setEditing({ item: e })} className="w-full rounded-md border p-2.5 text-left text-sm transition hover:border-primary/40">
                    <p className="text-xs font-medium">{fmtDateTime(e.starts_at)}</p>
                    <p className="truncate">{e.title}</p>
                    {e.link && (
                      <a href={e.link} target="_blank" rel="noreferrer" onClick={(ev) => ev.stopPropagation()} className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" /> Abrir convite
                      </a>
                    )}
                  </button>
                ))}
            </CardContent>
          </Card>
          <p className="px-1 text-xs text-muted-foreground">
            O arquivo .ics importa os compromissos no Google Calendar, Outlook / Microsoft 365 ou Apple Calendar. A sincronização automática está prevista para a Etapa 2.
          </p>
        </div>
      </div>

      <EventDialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)} item={editing?.item ?? null} defaultDate={editing?.date} />
    </div>
  );
}
