import DashboardJobs from '@/components/bi/DashboardJobs';
import JobsTrendChart from '@/components/bi/JobsTrendChart';
import JobsForecastReport from '@/components/bi/JobsForecastReport';

export default function BIPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel BI - Business Intelligence</h1>
          <p className="text-muted-foreground mt-2">
            Análise unificada de dados, tendências e previsões para manutenção
          </p>
        </div>
      </div>

      {/* Dashboard Jobs - Jobs by Component */}
      <DashboardJobs />

      {/* Jobs Trend Chart - Trend of completed jobs */}
      <JobsTrendChart />

      {/* Jobs Forecast Report - AI predictions with preventive actions */}
      <JobsForecastReport />
    </div>
  );
}
