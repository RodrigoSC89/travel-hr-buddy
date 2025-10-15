import DashboardJobs from '@/components/bi/DashboardJobs';
import JobsTrendChart from '@/components/bi/JobsTrendChart';
import JobsForecastReport from '@/components/bi/JobsForecastReport';
import { ExportBIReport } from '@/components/bi/ExportPDF';
import { useState } from 'react';

const initialTrendData = [
  { sistema: "Gerador", ia_efetiva: 6, total: 10 },
  { sistema: "Hidráulico", ia_efetiva: 8, total: 12 },
  { sistema: "Propulsão", ia_efetiva: 4, total: 9 },
  { sistema: "Climatização", ia_efetiva: 5, total: 5 },
];

export default function MmiBI() {
  const [trendData] = useState<any[]>(initialTrendData);
  const [forecastText, setForecastText] = useState('');

  return (
    <div className="grid gap-6 p-6">
      <h1 className="text-2xl font-bold">🔍 BI - Efetividade da IA na Manutenção</h1>
      <DashboardJobs />
      <JobsTrendChart />
      <JobsForecastReport trend={trendData} />
      <ExportBIReport trend={trendData} forecast={forecastText} />
    </div>
  );
}
