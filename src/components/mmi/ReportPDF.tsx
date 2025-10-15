import html2pdf from "html2pdf.js";
import type { Job } from "@/services/mmi/jobsApi";

/**
 * Generates a professional PDF report for MMI Jobs with resolved history
 * @param jobs - Array of Job objects to include in the report
 * @returns Promise that resolves when PDF is generated
 */
export const generateMMIReport = async (jobs: Job[]): Promise<void> => {
  if (!jobs || jobs.length === 0) {
    throw new Error("Nenhum job disponível para gerar relatório");
  }

  // Format date in Brazilian Portuguese
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get current date for report header
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Build HTML content for the report
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">
        Relatório Inteligente de Manutenção
      </h1>
      <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
        <strong>Data de Geração:</strong> ${currentDate}<br />
        <strong>Total de Jobs:</strong> ${jobs.length}
      </p>

      ${jobs
        .map(
          (job) => `
        <div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background-color: #f9fafb;">
          <h2 style="color: #1e40af; font-size: 18px; margin-top: 0;">
            🔧 ${job.title}
          </h2>
          
          <div style="margin-bottom: 10px;">
            <p style="margin: 5px 0; font-size: 14px;">
              <strong>Componente:</strong> ${job.component.name}
            </p>
            <p style="margin: 5px 0; font-size: 14px;">
              <strong>Equipamento:</strong> ${job.component.asset.name}
            </p>
            <p style="margin: 5px 0; font-size: 14px;">
              <strong>Embarcação:</strong> ${job.component.asset.vessel}
            </p>
            <p style="margin: 5px 0; font-size: 14px;">
              <strong>Status:</strong> <span style="background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px;">${job.status}</span>
            </p>
            <p style="margin: 5px 0; font-size: 14px;">
              <strong>Prioridade:</strong> <span style="background-color: ${
                job.priority === "Crítica"
                  ? "#fee2e2; color: #991b1b"
                  : job.priority === "Alta"
                    ? "#fef3c7; color: #92400e"
                    : "#dcfce7; color: #166534"
              }; padding: 2px 8px; border-radius: 4px;">${job.priority}</span>
            </p>
            <p style="margin: 5px 0; font-size: 14px;">
              <strong>Prazo:</strong> ${formatDate(job.due_date)}
            </p>
          </div>

          ${
            job.suggestion_ia
              ? `
          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 10px; margin: 10px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #1e40af;">
              <strong>💡 Sugestão IA:</strong> ${job.suggestion_ia}
            </p>
          </div>
          `
              : ""
          }

          ${
            job.resolved_history && job.resolved_history.length > 0
              ? `
          <div style="margin-top: 15px; padding: 10px; background-color: #f0fdf4; border-radius: 4px; border: 1px solid #bbf7d0;">
            <h3 style="color: #15803d; font-size: 14px; margin: 0 0 8px 0;">
              📚 Histórico de OS resolvidas:
            </h3>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #166534;">
              ${job.resolved_history.map((history) => `<li style="margin: 3px 0;">${history}</li>`).join("")}
            </ul>
          </div>
          `
              : ""
          }
        </div>
      `
        )
        .join("")}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <p>Relatório gerado automaticamente pelo Sistema MMI - Travel HR Buddy</p>
        <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
      </div>
    </div>
  `;

  // PDF generation options
  const options = {
    margin: 10,
    filename: `MMI_Relatorio_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  // Generate and download PDF
  const element = document.createElement("div");
  element.innerHTML = htmlContent;
  
  await html2pdf().set(options).from(element).save();
};
