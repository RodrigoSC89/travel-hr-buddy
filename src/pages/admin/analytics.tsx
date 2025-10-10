// ✅ pages/admin/analytics.tsx — Dashboard com filtros, tendência e PDF

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const colors = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"];

interface TestResult {
  created_at: string;
  branch: string;
  status: string;
  coverage_percent?: number;
}

interface BranchCount {
  [key: string]: number;
}

interface StatusCount {
  [key: string]: number;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<TestResult[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filtered, setFiltered] = useState<TestResult[]>([]);

  useEffect(() => {
    fetch("https://your-project.supabase.co/rest/v1/test_results", {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })
      .then((res) => res.json())
      .then(setData);
  }, []);

  useEffect(() => {
    const f = data.filter((r) => {
      const created = new Date(r.created_at);
      return (
        (!startDate || created >= new Date(startDate)) &&
        (!endDate || created <= new Date(endDate))
      );
    });
    setFiltered(f);
  }, [data, startDate, endDate]);

  const branchCount: BranchCount = filtered.reduce((acc: BranchCount, r) => {
    acc[r.branch] = (acc[r.branch] || 0) + 1;
    return acc;
  }, {});

  const statusCount: StatusCount = filtered.reduce((acc: StatusCount, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const coverageTrend = [...filtered]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-15)
    .map((r) => ({
      date: format(new Date(r.created_at), "dd/MM"),
      coverage: r.coverage_percent ?? 0,
    }));

  const branchChart = Object.entries(branchCount).map(([branch, count]) => ({ branch, count }));
  const statusChart = Object.entries(statusCount).map(([status, value]) => ({ status, value }));

  async function exportPDF() {
    const node = document.getElementById("analytics-pdf");
    if (!node) return;
    const canvas = await html2canvas(node);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("ci-analytics.pdf");
  }

  return (
    <div className="p-8 space-y-6" id="analytics-pdf">
      <div className="flex items-center gap-4 flex-wrap">
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button onClick={exportPDF}>📄 Exportar PDF</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">🚀 Builds por Branch</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={branchChart}>
              <XAxis dataKey="branch" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">📦 Builds por Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusChart}
                dataKey="value"
                nameKey="status"
                outerRadius={80}
                label
              >
                {statusChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">📈 Tendência de Cobertura (últimos 15 builds)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={coverageTrend}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="coverage" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
