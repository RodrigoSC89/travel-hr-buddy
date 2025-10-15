import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";

interface TrendData {
  month: string;
  total_jobs: number;
}

export function ExportBIReport({ trend, forecast }: { trend: TrendData[]; forecast: string }) {
  function handleExport() {
    const date = new Date().toLocaleDateString();
    const content = `
      <div style="font-family: Arial; padding: 20px;">
        <h1 style="text-align:center">📊 Relatório BI de Manutenção</h1>
        <p><strong>Data:</strong> ${date}</p>
        <hr />

        <h2>Tendência de Jobs (Últimos 6 meses)</h2>
        <ul>
          ${trend.map(t => `<li>${t.month}: ${t.total_jobs} jobs finalizados</li>`).join("")}
        </ul>

        <h2>🔮 Previsão da IA</h2>
        <pre style="white-space: pre-wrap; background: #f1f5f9; padding: 10px; border-radius: 8px;">${forecast}</pre>
      </div>
    `;

    html2pdf().from(content).save(`Relatorio-BI-${date}.pdf`);
  }

  return (
    <Button onClick={handleExport} className="mt-4">📄 Exportar Relatório BI</Button>
  );
}
