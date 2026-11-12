/**
 * Exporta compromissos em formato iCalendar (.ics), importável no
 * Google Calendar, Outlook / Microsoft 365 e Apple Calendar.
 * Ponte simples até a integração direta (Etapa 2).
 */
import type { CtEvent } from "../types";

const pad = (n: number) => String(n).padStart(2, "0");
const icsDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
};
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

export function eventsToIcs(events: CtEvent[]): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MB Maritime//Control Tower//PT-BR", "CALSCALE:GREGORIAN"];
  for (const e of events) {
    if (!e.starts_at) continue;
    const end = e.ends_at ?? new Date(new Date(e.starts_at).getTime() + 60 * 60 * 1000).toISOString();
    const desc = [e.agenda && `Pauta: ${e.agenda}`, e.next_action && `Próxima ação: ${e.next_action}`, e.notes]
      .filter(Boolean)
      .join("\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@control-tower.mbmaritime`,
      `DTSTAMP:${icsDate(new Date().toISOString())}`,
      `DTSTART:${icsDate(e.starts_at)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${esc(`[${e.code}] ${e.title}${e.client ? ` · ${e.client}` : ""}`)}`,
      ...(desc ? [`DESCRIPTION:${esc(desc)}`] : []),
      ...(e.location ? [`LOCATION:${esc(e.location)}`] : []),
      ...(e.link ? [`URL:${esc(e.link)}`] : []),
      `STATUS:${e.status === "Cancelado" ? "CANCELLED" : e.status === "Confirmado" || e.status === "Realizado" ? "CONFIRMED" : "TENTATIVE"}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadText(filename: string, content: string, mime = "text/calendar;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
