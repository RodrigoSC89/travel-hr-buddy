import DashboardJobs from "@/components/bi/DashboardJobs";
import JobsTrendChart from "@/components/bi/JobsTrendChart";
import JobsForecastReport from "@/components/bi/JobsForecastReport";

export default function BIPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 Business Intelligence - Dashboard</h1>
        <p className="text-muted-foreground">
          Análise de manutenção com visualizações de dados e previsões com IA
        </p>
      </div>

      {/* Jobs by Component */}
      <div className="w-full">
        <DashboardJobs />
      </div>

      {/* Jobs Trend Chart */}
      <div className="w-full">
        <JobsTrendChart />
      </div>

      {/* AI Forecast */}
      <div className="w-full">
        <JobsForecastReport />
      </div>
    </div>
  );
}
