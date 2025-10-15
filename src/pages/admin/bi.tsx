import { Card, CardContent } from "@/components/ui/card";
import { SendForecastEmailButton } from "@/components/bi/SendForecastEmailButton";
import DashboardJobs from "@/components/bi/DashboardJobs";

/**
 * Admin BI Dashboard
 * Business Intelligence dashboard for administrators
 * Includes forecast email testing and job distribution analytics
 */
export default function AdminBI() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">📊 BI - Business Intelligence</h1>
      </div>

      {/* Email Forecast Section */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">📧 Relatório de Previsão por E-mail</h2>
          <p className="text-sm text-slate-600 mb-4">
            Use este botão para testar manualmente o envio do relatório de previsão de jobs.
            Em produção, este processo seria executado automaticamente via cron job.
          </p>
          <SendForecastEmailButton />
        </CardContent>
      </Card>

      {/* Jobs Analytics Section */}
      <DashboardJobs />
    </div>
  );
}
