import html2pdf from "html2pdf.js";
import type { Job } from "@/services/mmi/jobsApi";

export function generateMaintenanceReport(jobs: Job[]) {
  const now = new Date().toLocaleDateString("pt-BR");
  const content = `
    <div style="font-family: Arial; padding: 20px;">
      <h1 style="text-align:center">Relatório Inteligente de Manutenção</h1>
      <p><strong>Data:</strong> ${now}</p>
      <p><strong>Total de Jobs:</strong> ${jobs.length}</p>
      <hr />
      ${jobs
        .map(
          (j) => `
        <div style="margin-bottom: 16px;">
          <h3>🔧 ${j.title}</h3>
          <p><strong>Componente:</strong> ${j.component.name}</p>
          <p><strong>Status:</strong> ${j.status}</p>
          <p><strong>Prazo:</strong> ${j.due_date?.slice(0, 10) || "Não definido"}</p>
          <p><strong>Prioridade:</strong> ${j.priority || "Normal"}</p>
          <p><strong>Sugestão IA:</strong> ${j.suggestion_ia || "N/A"}</p>
          ${
            j.resolved_history
              ? `<p><strong>📚 Histórico de OS resolvidas:</strong><br/>${j.resolved_history}</p>`
              : ""
          }
        </div>
      `
        )
        .join("")}
    </div>
  `;

  html2pdf()
    .from(content)
    .save(`Relatorio-MMI-${now.replace(/\//g, "-")}.pdf`);
}

