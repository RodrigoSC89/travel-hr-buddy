import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Member, Task } from "../types";

export const fmtDate = (d: string | null | undefined) => (d ? format(parseISO(d), "dd/MM/yyyy") : "—");
export const fmtDateTime = (d: string | null | undefined) =>
  d ? format(parseISO(d), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—";
export const fmtShort = (d: string | null | undefined) => (d ? format(parseISO(d), "dd MMM", { locale: ptBR }) : "—");

export const memberName = (members: Member[] | undefined, id: string | null | undefined) =>
  (id && members?.find((m) => m.id === id)?.short_name) || "—";

export type Deadline = "vencido" | "hoje" | "proximo" | "ok" | "sem_prazo" | "concluido";

export function deadlineState(due: string | null, done = false, today = new Date()): Deadline {
  if (done) return "concluido";
  if (!due) return "sem_prazo";
  const diff = differenceInCalendarDays(parseISO(due), today);
  if (diff < 0) return "vencido";
  if (diff === 0) return "hoje";
  if (diff <= 3) return "proximo";
  return "ok";
}

export const deadlineTone: Record<Deadline, string> = {
  vencido: "text-red-600 dark:text-red-400 font-semibold",
  hoje: "text-orange-600 dark:text-orange-400 font-semibold",
  proximo: "text-amber-600 dark:text-amber-400",
  ok: "text-muted-foreground",
  sem_prazo: "text-muted-foreground italic",
  concluido: "text-emerald-600 dark:text-emerald-400",
};

export const deadlineLabel: Record<Deadline, string> = {
  vencido: "Vencido",
  hoje: "Vence hoje",
  proximo: "Próximos 3 dias",
  ok: "No prazo",
  sem_prazo: "Sem prazo",
  concluido: "Concluído",
};

export const taskDeadline = (t: Task) => deadlineState(t.due_date, t.status === "concluida");

/** Converte "2026-11-12T14:30:00+00:00" para valor de <input type="datetime-local">. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  return format(parseISO(iso), "yyyy-MM-dd'T'HH:mm");
}

/** Converte valor de <input type="datetime-local"> para ISO com fuso. */
export function fromLocalInput(v: string): string | null {
  if (!v) return null;
  return new Date(v).toISOString();
}
