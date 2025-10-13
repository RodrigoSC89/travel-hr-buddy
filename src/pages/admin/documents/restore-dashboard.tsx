"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export default function RestoreDashboard() {
  const [searchParams] = useSearchParams();
  const isPublicView = searchParams.get("public") === "1";
  
  const [filterEmail, setFilterEmail] = useState("");
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get session if not in public view
    if (!isPublicView) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });
    }
    
    fetchStats();
    const interval = setInterval(() => fetchStats(), 10000);
    return () => clearInterval(interval);
  }, [filterEmail]);

  async function fetchStats() {
    // Fetch summary data
    const { data: summaryData } = await supabase
      .rpc('get_restore_summary', { email_input: filterEmail || null });

    // Fetch daily data
    const { data: daily } = await supabase
      .rpc('get_restore_count_by_day_with_email', { email_input: filterEmail || null });

    setSummary(summaryData?.[0] || null);
    setDailyData(daily || []);
  }

  function exportCSV() {
    const csv = dailyData.map(d => `${format(new Date(d.day), 'yyyy-MM-dd')},${d.count}`).join('\n');
    const blob = new Blob([`Data,Contagem\n${csv}`], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = 'restore-analytics.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  async function sendEmail() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-restore-dashboard`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ 
            email: session?.user?.email,
            summary,
            dailyData 
          }),
        }
      );
      
      if (response.ok) {
        alert('📧 Relatório enviado com sucesso!');
      } else {
        const error = await response.json();
        alert(`❌ Erro ao enviar: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('❌ Erro ao enviar relatório por e-mail');
    }
  }

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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">📊 Painel de Auditoria - Restaurações</h1>

      {!isPublicView && (
        <div className="flex gap-2">
          <Input
            placeholder="Filtrar por e-mail"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
          />
          <Button onClick={fetchStats}>🔍 Buscar</Button>
          <Button onClick={exportCSV}>📤 CSV</Button>
          <Button onClick={exportPDF}>📄 PDF</Button>
          <Button onClick={sendEmail}>✉️ Enviar por e-mail</Button>
        </div>
      )}

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
          <Bar data={chartData} />
        </div>
      </Card>
    </div>
  );
}
