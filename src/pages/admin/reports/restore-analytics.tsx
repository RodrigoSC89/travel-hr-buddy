"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: string;
}

interface DailyData {
  day: string;
  count: number;
}

export default function RestoreAnalyticsPage() {
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [filterEmail, setFilterEmail] = useState("");

  const fetchStats = useCallback(async () => {
    const { data: summaryData } = await supabase
      .rpc('get_restore_summary', { email_input: filterEmail || null });
    const { data: daily } = await supabase
      .rpc('get_restore_count_by_day_with_email', { email_input: filterEmail || null });

    setSummary(summaryData?.[0] || null);
    setDailyData(daily || []);
  }, [filterEmail]);

  function exportCSV() {
    const csv = dailyData.map(d => `${format(new Date(d.day), 'yyyy-MM-dd')},${d.count}`).join('\n');
    const blob = new Blob([`Data,Contagem\n${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'restore-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text('Relatório de Restaurações', 14, 16);
    autoTable(doc, {
      head: [['Data', 'Contagem']],
      body: dailyData.map((d) => [format(new Date(d.day), 'dd/MM/yyyy'), d.count.toString()]),
    });
    doc.save('restore-analytics.pdf');
  }

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 10000); // Atualiza a cada 10s para TV Wall
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = {
    labels: dailyData.map((d) => format(new Date(d.day), 'dd/MM')),
    datasets: [
      {
        label: 'Restaurações por dia',
        data: dailyData.map((d) => d.count),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📊 Painel de Auditoria - Restaurações</h1>

      <div className="flex gap-2">
        <Input
          placeholder="Filtrar por e-mail"
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
        />
        <Button onClick={fetchStats}>🔍 Buscar</Button>
        <Button onClick={exportCSV}>📤 CSV</Button>
        <Button onClick={exportPDF}>📄 PDF</Button>
      </div>

      {summary && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold">📈 Estatísticas</h2>
          <ul className="text-sm mt-2 space-y-1">
            <li>🔢 Total de restaurações: {summary.total}</li>
            <li>📄 Documentos únicos restaurados: {summary.unique_docs}</li>
            <li>📆 Média por dia: {summary.avg_per_day}</li>
          </ul>
        </Card>
      )}

      <Card className="p-4">
        <h2 className="text-lg font-semibold">📅 Gráfico de Restaurações</h2>
        <div className="h-64">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Card>
    </div>
  );
}
