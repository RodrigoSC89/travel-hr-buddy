import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Mock data for builds by branch
const mockBuildsByBranch = [
  { branch: "main", count: 45 },
  { branch: "develop", count: 32 },
  { branch: "feature/ui", count: 18 },
  { branch: "hotfix/bug", count: 12 },
  { branch: "release/v2", count: 8 },
];

// Mock data for builds by status
const mockBuildsByStatus = [
  { status: "Success", value: 85 },
  { status: "Failed", value: 12 },
  { status: "Cancelled", value: 8 },
];

// Mock data for coverage trend (last 15 builds)
const mockCoverageTrend = [
  { date: "01/10", coverage: 78 },
  { date: "02/10", coverage: 80 },
  { date: "03/10", coverage: 82 },
  { date: "04/10", coverage: 81 },
  { date: "05/10", coverage: 83 },
  { date: "06/10", coverage: 85 },
  { date: "07/10", coverage: 84 },
  { date: "08/10", coverage: 86 },
  { date: "09/10", coverage: 87 },
  { date: "10/10", coverage: 88 },
  { date: "11/10", coverage: 87 },
  { date: "12/10", coverage: 89 },
  { date: "13/10", coverage: 90 },
  { date: "14/10", coverage: 91 },
  { date: "15/10", coverage: 92 },
];

// Mock data for branch coverage (for calculating average coverage per branch)
const mockBranchCoverageData = [
  { branch: "main", coverage: 92 },
  { branch: "main", coverage: 90 },
  { branch: "main", coverage: 91 },
  { branch: "develop", coverage: 85 },
  { branch: "develop", coverage: 87 },
  { branch: "develop", coverage: 86 },
  { branch: "feature/ui", coverage: 78 },
  { branch: "feature/ui", coverage: 80 },
  { branch: "feature/ui", coverage: 79 },
  { branch: "hotfix/bug", coverage: 88 },
  { branch: "hotfix/bug", coverage: 89 },
  { branch: "release/v2", coverage: 93 },
  { branch: "release/v2", coverage: 94 },
];

const colors = ["#3b82f6", "#ef4444", "#eab308"];

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter data based on date range (simplified for demonstration)
  const branchChart = useMemo(() => {
    // In a real implementation, you would filter based on startDate and endDate
    return mockBuildsByBranch;
  }, [startDate, endDate]);

  const statusChart = useMemo(() => {
    return mockBuildsByStatus;
  }, [startDate, endDate]);

  const coverageTrend = useMemo(() => {
    return mockCoverageTrend;
  }, [startDate, endDate]);

  // Calculate average coverage by branch
  const branchCoverageChart = useMemo(() => {
    const branchCoverageMap = mockBranchCoverageData.reduce(
      (acc, { branch, coverage }) => {
        if (!acc[branch]) {
          acc[branch] = { total: 0, count: 0 };
        }
        acc[branch].total += coverage;
        acc[branch].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    return Object.entries(branchCoverageMap).map(([branch, { total, count }]) => ({
      branch,
      avgCoverage: Math.round(total / count),
    }));
  }, [startDate, endDate]);

  const exportPDF = async () => {
    const node = document.getElementById("analytics-pdf");
    if (!node) return;

    try {
      const canvas = await html2canvas(node);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("ci-analytics.pdf");
    } catch (error) {
    }
  };

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          title="CI Analytics"
          description="Dashboard completo com filtros e exportação"
          icon={BarChart3}
        />

        <div className="p-8" id="analytics-pdf">
          <h1 className="text-2xl font-bold mb-6">📊 CI Analytics</h1>

          <div className="flex gap-4 mb-6 items-center flex-wrap">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Data inicial"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Data final"
            />
            <Button onClick={exportPDF}>📄 Exportar PDF</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <Card className="col-span-1 md:col-span-2">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">
                  📈 Tendência de Cobertura (últimos 15 builds)
                </h2>
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

            <Card className="col-span-1 md:col-span-2">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">📊 Cobertura Média por Branch</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={branchCoverageChart}>
                    <XAxis dataKey="branch" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="avgCoverage" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
