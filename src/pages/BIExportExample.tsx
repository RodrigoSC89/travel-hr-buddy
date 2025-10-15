import { ExportBIReport } from "@/components/bi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BIExportExample() {
  // Sample trend data for the last 6 months
  const trendData = [
    { month: "Abril", total_jobs: 15 },
    { month: "Maio", total_jobs: 18 },
    { month: "Junho", total_jobs: 22 },
    { month: "Julho", total_jobs: 19 },
    { month: "Agosto", total_jobs: 25 },
    { month: "Setembro", total_jobs: 28 },
  ];

  // Sample AI forecast
  const aiForecast = `
📈 Análise de Tendências:
• Crescimento médio de 15% nos últimos 6 meses
• Pico de atividade detectado em Setembro (28 jobs)

🔮 Previsão para Outubro:
• Expectativa de 30-32 jobs finalizados
• Tendência de crescimento mantém-se estável

💡 Recomendações da IA:
• Alocar mais recursos para atender demanda crescente
• Considerar expansão da equipe de manutenção
• Implementar automações para otimizar processos repetitivos
  `.trim();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">📊 Business Intelligence - Relatórios de Manutenção</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Jobs (Últimos 6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {trendData.map((item) => (
              <li key={item.month} className="flex justify-between">
                <span className="font-medium">{item.month}:</span>
                <span className="text-muted-foreground">{item.total_jobs} jobs finalizados</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔮 Previsão da IA</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            {aiForecast}
          </pre>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <ExportBIReport trend={trendData} forecast={aiForecast} />
      </div>
    </div>
  );
}
