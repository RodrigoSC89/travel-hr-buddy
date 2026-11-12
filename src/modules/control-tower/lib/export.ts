/**
 * Exportações (contingência): Excel completo e relatório PDF.
 * Bibliotecas carregadas sob demanda para não pesar o bundle inicial.
 */
import { format } from "date-fns";
import { taskStatusLabel, LOT_STATUSES } from "../constants";
import type { Contract, CtEvent, Deliverable, DeliverableLot, DeliverableProgress, Member, Opportunity, Task } from "../types";
import { deadlineLabel, fmtDate, fmtDateTime, memberName, taskDeadline } from "./format";

export interface ExportData {
  members: Member[];
  contracts: Contract[];
  deliverables: Deliverable[];
  progress: DeliverableProgress[];
  lots: DeliverableLot[];
  tasks: Task[];
  events: CtEvent[];
  opportunities: Opportunity[];
}

const stamp = () => format(new Date(), "yyyyMMdd-HHmm");

function rows(d: ExportData) {
  const m = (id: string | null) => memberName(d.members, id);
  const contractCode = (id: string | null) => d.contracts.find((c) => c.id === id)?.code ?? "";
  const deliverableCode = (id: string | null) => d.deliverables.find((x) => x.id === id)?.code ?? "";

  return {
    Contratos: d.contracts.map((c) => ({
      "ID contrato": c.code,
      Cliente: c.client,
      "Status informado": c.status_informed,
      "Contrato assinado conferido?": c.signed_status,
      "Fonte / versão": c.source_version ?? "",
      Início: fmtDate(c.start_date),
      Fim: fmtDate(c.end_date),
      "Líder MB": m(c.leader_id),
      "Revisor MB": m(c.reviewer_id),
      "Ponto focal": c.client_focal ?? "",
      "Escopo operacionalizado?": c.scope_status,
      "Financeiro conciliado?": c.finance_status,
      "Próximo marco": c.next_milestone ?? "",
      "Próxima ação": c.next_action ?? "",
      Observações: c.notes ?? "",
    })),
    Entregaveis: d.deliverables.map((x) => {
      const p = d.progress.find((pp) => pp.deliverable_id === x.id);
      const done = Number(p?.released_qty ?? 0);
      return {
        ID: x.code,
        Contrato: contractCode(x.contract_id),
        Unidade: x.unit ?? "",
        "Pacote / entregável": x.package,
        Meta: x.target_qty ?? "",
        "Concluídos verificados": done,
        Restantes: x.target_qty != null ? Math.max(0, Number(x.target_qty) - done) : "",
        "Progresso %": x.target_qty ? Math.round((done / Number(x.target_qty)) * 100) : "",
        "Regra / gatilho": x.rule ?? "",
        Prazo: fmtDate(x.due_date),
        Executor: m(x.executor_id),
        Revisor: m(x.reviewer_id),
        Status: x.status,
        "Aceite cliente": x.client_acceptance,
        Fonte: x.source ?? "",
        Observações: x.notes ?? "",
      };
    }),
    Aceites: d.lots.map((l) => ({
      Entregável: deliverableCode(l.deliverable_id),
      Lote: l.description,
      Qtd: l.qty,
      Executor: m(l.executor_id),
      Status: LOT_STATUSES.find((s) => s.value === l.status)?.label ?? l.status,
      "Enviado por": m(l.submitted_by),
      "Enviado em": fmtDateTime(l.submitted_at),
      "Revisado por": m(l.reviewed_by),
      "Revisado em": fmtDateTime(l.reviewed_at),
      "Aceite externo": l.external_acceptance,
      Evidência: l.evidence_note ?? "",
      "Comentário revisão": l.review_comment ?? "",
    })),
    Tarefas: d.tasks.map((t) => ({
      ID: t.code,
      Prioridade: t.priority,
      "Cliente / frente": t.front ?? "",
      Contrato: contractCode(t.contract_id),
      Entregável: deliverableCode(t.deliverable_id),
      Tarefa: t.title,
      Executor: m(t.executor_id),
      "Parte do executor": t.executor_part ?? "",
      Revisor: m(t.reviewer_id),
      "Parte do revisor": t.reviewer_part ?? "",
      Status: taskStatusLabel(t.status),
      Início: fmtDate(t.start_date),
      Prazo: fmtDate(t.due_date),
      Semáforo: deadlineLabel[taskDeadline(t)],
      "Horas executor": t.hours_executor ?? "",
      "Horas revisor": t.hours_reviewer ?? "",
      "Aceite cliente": t.client_acceptance,
      "Evidência / versão": t.evidence_note ?? "",
      "Enviado por": m(t.submitted_by),
      "Enviado em": fmtDateTime(t.submitted_at),
      "Aprovado por": m(t.reviewed_by),
      "Aprovado em": fmtDateTime(t.reviewed_at),
      "Comentário revisão": t.review_comment ?? "",
      "Próxima ação": t.next_action ?? "",
      Observações: t.notes ?? "",
    })),
    Agenda: d.events.map((e) => ({
      ID: e.code,
      Tipo: e.kind,
      Início: fmtDateTime(e.starts_at),
      Fim: fmtDateTime(e.ends_at),
      "Cliente / frente": e.client ?? "",
      Compromisso: e.title,
      Tarefa: d.tasks.find((t) => t.id === e.task_id)?.code ?? "",
      Situação: e.status,
      Dono: m(e.owner_id),
      Revisor: m(e.reviewer_id),
      Pauta: e.agenda ?? "",
      Local: e.location ?? "",
      Link: e.link ?? "",
      Resultado: e.outcome ?? "",
      "Próxima ação": e.next_action ?? "",
      Observações: e.notes ?? "",
    })),
    Comercial: d.opportunities.map((o) => ({
      ID: o.code,
      Conta: o.account,
      Contato: o.contact ?? "",
      Fase: o.phase,
      Demanda: o.demand ?? "",
      "Próxima ação": o.next_action ?? "",
      "Follow-up": fmtDate(o.follow_up_date),
      Responsável: m(o.owner_id),
      Revisor: m(o.reviewer_id),
      Evidência: o.evidence_status ?? "",
      "Reunião confirmada?": o.meeting_confirmed,
      "Proposta enviada?": o.proposal_sent,
      "Capacidade checada?": o.capacity_checked,
      "Valor estimado (R$)": o.estimated_value ?? "",
      Observações: o.notes ?? "",
    })),
  };
}

export type SheetName = keyof ReturnType<typeof rows>;

export async function exportExcel(d: ExportData, only?: SheetName) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const all = rows(d);
  const names = (only ? [only] : (Object.keys(all) as SheetName[]));
  for (const name of names) {
    const data = all[name];
    const ws = XLSX.utils.json_to_sheet(data.length ? data : [{ "(sem registros)": "" }]);
    const headers = Object.keys(data[0] ?? { x: "" });
    ws["!cols"] = headers.map((h) => ({
      wch: Math.min(60, Math.max(h.length, ...data.map((r) => String((r as Record<string, unknown>)[h] ?? "").length)) + 2),
    }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  XLSX.writeFile(wb, `MB_Control_Tower_${only ?? "Completo"}_${stamp()}.xlsx`);
}

export async function exportPdfReport(d: ExportData) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const all = rows(d);
  const navy: [number, number, number] = [12, 35, 64];
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(...navy);
  doc.rect(0, 0, pageW, 56, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("MB MARITIME · OPERATIONS CONTROL TOWER", 32, 26);
  doc.setFontSize(10);
  doc.text(`Relatório de situação · ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 32, 44);
  doc.setTextColor(20, 20, 20);

  const open = d.tasks.filter((t) => t.status !== "concluida");
  const overdue = open.filter((t) => taskDeadline(t) === "vencido");
  const inReview = d.tasks.filter((t) => t.status === "em_double_check");
  const kpis = [
    ["Contratos", String(d.contracts.length)],
    ["Contratos conferidos", `${d.contracts.filter((c) => c.signed_status === "Sim").length} / ${d.contracts.length}`],
    ["Tarefas em aberto", String(open.length)],
    ["Prazos vencidos", String(overdue.length)],
    ["Em double check", String(inReview.length)],
    ["Oportunidades ativas", String(d.opportunities.filter((o) => !["Ganha", "Perdida"].includes(o.phase)).length)],
  ];
  autoTable(doc, {
    startY: 72,
    head: [kpis.map((k) => k[0])],
    body: [kpis.map((k) => k[1])],
    theme: "grid",
    headStyles: { fillColor: navy, fontSize: 9 },
    bodyStyles: { fontSize: 14, fontStyle: "bold", halign: "center" },
  });

  const section = (title: string, data: Record<string, unknown>[], cols: string[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const y = ((doc as any).lastAutoTable?.finalY ?? 72) + 24;
    doc.setFontSize(12);
    doc.text(title, 32, y);
    autoTable(doc, {
      startY: y + 8,
      head: [cols],
      body: data.length ? data.map((r) => cols.map((c) => String(r[c] ?? ""))) : [[{ content: "Sem registros", colSpan: cols.length }]],
      theme: "striped",
      headStyles: { fillColor: navy, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 32, right: 32 },
    });
  };

  section("Contratos", all.Contratos, ["ID contrato", "Cliente", "Status informado", "Contrato assinado conferido?", "Próximo marco", "Próxima ação"]);
  section(
    "Tarefas em aberto",
    all.Tarefas.filter((t) => t.Status !== "Concluída"),
    ["ID", "Prioridade", "Cliente / frente", "Tarefa", "Executor", "Revisor", "Status", "Prazo", "Semáforo"],
  );
  section("Entregáveis", all.Entregaveis, ["ID", "Contrato", "Unidade", "Pacote / entregável", "Meta", "Concluídos verificados", "Status"]);
  section("Agenda", all.Agenda.filter((e) => e.Situação !== "Cancelado"), ["ID", "Tipo", "Início", "Cliente / frente", "Compromisso", "Situação", "Dono"]);
  section("Comercial", all.Comercial, ["ID", "Conta", "Contato", "Fase", "Próxima ação", "Follow-up", "Responsável"]);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`MB Maritime · Control Tower · página ${i}/${pages}`, 32, doc.internal.pageSize.getHeight() - 16);
  }
  doc.save(`MB_Control_Tower_Relatorio_${stamp()}.pdf`);
}
