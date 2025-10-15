import React, { useEffect, useState } from 'react';
import DashboardJobs from '@/components/bi/DashboardJobs';
import JobsTrendChart from '@/components/bi/JobsTrendChart';
import JobsForecastReport from '@/components/bi/JobsForecastReport';
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { BarChart3, TrendingUp, Brain, Sparkles } from "lucide-react";

interface TrendData {
  data: string;
  concluídos: number;
  iniciados: number;
}

export default function BIPage() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    async function fetchTrend() {
      try {
        // In production, this would call: const res = await fetch('/api/bi/jobs-trend');
        // For now, we'll let the JobsTrendChart component handle its own data
        // const json = await res.json();
        // setTrendData(json);
      } catch (error) {
        console.error('Error fetching trend data:', error);
      }
    }
    fetchTrend();
  }, []);

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Brain}
        title="Business Intelligence - Painel BI"
        description="Análise inteligente de jobs, tendências e previsões com IA"
        gradient="purple"
        badges={[
          { icon: BarChart3, label: "Dashboard Unificado" },
          { icon: TrendingUp, label: "Tendências em Tempo Real" },
          { icon: Sparkles, label: "Previsões IA" }
        ]}
      />
      
      <div className="grid gap-6 p-6">
        <DashboardJobs />
        <JobsTrendChart />
        <JobsForecastReport trend={trendData} />
      </div>
    </ModulePageWrapper>
  );
}
