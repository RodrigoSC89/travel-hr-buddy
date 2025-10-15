import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

interface TrendData {
  month: string;
  total_jobs: number;
}

interface ExportBIReportProps {
  trend: TrendData[];
  forecast: string;
}

export function ExportBIReport({ trend, forecast }: ExportBIReportProps) {
  function handleExport() {
    toast.info("Gerando PDF...");
    
    const date = new Date().toISOString().split('T')[0];
    const formattedDate = new Date().toLocaleDateString('pt-BR');
    
    const content = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h1 style="text-align: center; color: #0f172a; margin-bottom: 10px;">📊 Relatório BI de Manutenção</h1>
        <p style="text-align: center; color: #64748b;"><strong>Data:</strong> ${formattedDate}</p>
        <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;" />

        <h2 style="color: #0f172a; margin-top: 30px; margin-bottom: 15px;">📈 Tendência de Jobs (Últimos 6 meses)</h2>
        ${trend && trend.length > 0 ? `
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Mês</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #cbd5e1;">Jobs Finalizados</th>
              </tr>
            </thead>
            <tbody>
              ${trend.map((t, i) => `
                <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${t.month}</td>
                  <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e2e8f0;">${t.total_jobs}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p style="color: #64748b;">Nenhum dado de tendência disponível.</p>'}

        <h2 style="color: #0f172a; margin-top: 30px; margin-bottom: 15px;">🔮 Previsão da IA</h2>
        <div style="white-space: pre-wrap; background: #f1f5f9; padding: 15px; border-radius: 8px; color: #334155; line-height: 1.6;">
          ${forecast || 'Nenhuma previsão disponível.'}
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `BI_Report_${date}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(content)
      .save()
      .then(() => {
        toast.success("PDF exportado com sucesso!");
      })
      .catch((error: Error) => {
        console.error("Error generating PDF:", error);
        toast.error("Erro ao gerar PDF. Tente novamente.");
      });
  }

  return (
    <Button 
      onClick={handleExport} 
      className="mt-4"
      disabled={!trend || trend.length === 0}
    >
      📄 Exportar PDF
    </Button>
  );
}
