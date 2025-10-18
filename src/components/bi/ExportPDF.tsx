import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

interface TrendData {
  month: string;
  total_jobs: number;
  monthLabel?: string;
}

export function ExportBIReport({ trend, forecast }: { trend: TrendData[]; forecast: string }) {
  function handleExport() {
    try {
      toast.info("Gerando PDF...");
      
      const date = new Date().toISOString().split("T")[0];
      const formattedDate = new Date().toLocaleDateString("pt-BR");
      
      const content = `
        <div style="font-family: Arial; padding: 20px;">
          <h1 style="text-align:center">📊 Relatório BI de Manutenção</h1>
          <p><strong>Data:</strong> ${formattedDate}</p>
          <hr />

          <h2>📈 Tendência de Jobs (Últimos 6 meses)</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Mês</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Jobs Finalizados</th>
              </tr>
            </thead>
            <tbody>
              ${trend.map(t => `
                <tr>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${t.monthLabel || t.month}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${t.total_jobs}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h2>🔮 Previsão da IA</h2>
          <div style="white-space: pre-wrap; background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #0f172a;">
            ${forecast || "Nenhuma previsão disponível."}
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `BI_Report_${date}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const }
      };

      html2pdf().set(opt).from(content).save().then(() => {
        toast.success("PDF exportado com sucesso!");
      }).catch((error) => {
        console.error("Error generating PDF:", error);
        toast.error("Erro ao gerar PDF. Tente novamente.");
      });
    } catch (error) {
      console.error("Error in handleExport:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    }
  }

  const hasData = trend && trend.length > 0;

  return (
    <Button 
      onClick={handleExport} 
      disabled={!hasData}
      className="mt-4"
      title={!hasData ? "Aguardando dados para exportar" : "Exportar relatório em PDF"}
    >
      📄 Exportar PDF
    </Button>
  );
}
