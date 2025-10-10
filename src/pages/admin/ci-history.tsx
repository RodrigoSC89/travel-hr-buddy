import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { GitBranch } from "lucide-react";
import { format } from "date-fns";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

interface WorkflowRun {
  id: string;
  name: string;
  branch: string;
  status: "success" | "failure" | "in_progress";
  conclusion: string;
  created_at: string;
  updated_at: string;
  duration: number;
  triggeredBy: string;
  commit_hash: string;
  coverage_percent: number | null;
  triggered_by: string;
}

// Mock data for demonstration
const mockWorkflowRuns: WorkflowRun[] = [
  {
    id: "1",
    name: "Run Tests",
    branch: "main",
    status: "success",
    conclusion: "success",
    created_at: "2025-10-10T02:30:00Z",
    updated_at: "2025-10-10T02:35:00Z",
    duration: 300,
    triggeredBy: "push",
    commit_hash: "abc1234567",
    coverage_percent: 85,
    triggered_by: "push",
  },
  {
    id: "2",
    name: "Run Tests",
    branch: "feature/new-module",
    status: "failure",
    conclusion: "failure",
    created_at: "2025-10-09T18:45:00Z",
    updated_at: "2025-10-09T18:48:00Z",
    duration: 180,
    triggeredBy: "pull_request",
    commit_hash: "def5678901",
    coverage_percent: 72,
    triggered_by: "pull_request",
  },
  {
    id: "3",
    name: "Run Tests",
    branch: "main",
    status: "success",
    conclusion: "success",
    created_at: "2025-10-09T14:20:00Z",
    updated_at: "2025-10-09T14:24:00Z",
    duration: 240,
    triggeredBy: "push",
    commit_hash: "ghi9012345",
    coverage_percent: 83,
    triggered_by: "push",
  },
  {
    id: "4",
    name: "Run Tests",
    branch: "develop",
    status: "success",
    conclusion: "success",
    created_at: "2025-10-09T10:15:00Z",
    updated_at: "2025-10-09T10:19:00Z",
    duration: 240,
    triggeredBy: "push",
    commit_hash: "jkl3456789",
    coverage_percent: 80,
    triggered_by: "push",
  },
  {
    id: "5",
    name: "Run Tests",
    branch: "hotfix/critical-bug",
    status: "failure",
    conclusion: "failure",
    created_at: "2025-10-08T22:30:00Z",
    updated_at: "2025-10-08T22:32:00Z",
    duration: 120,
    triggeredBy: "pull_request",
    commit_hash: "mno7890123",
    coverage_percent: 68,
    triggered_by: "pull_request",
  },
  {
    id: "6",
    name: "Run Tests",
    branch: "main",
    status: "success",
    conclusion: "success",
    created_at: "2025-10-08T16:45:00Z",
    updated_at: "2025-10-08T16:50:00Z",
    duration: 300,
    triggeredBy: "push",
    commit_hash: "pqr1234567",
    coverage_percent: 78,
    triggered_by: "push",
  },
  {
    id: "7",
    name: "Run Tests",
    branch: "feature/ui-improvements",
    status: "success",
    conclusion: "success",
    created_at: "2025-10-10T03:00:00Z",
    updated_at: "2025-10-10T03:02:00Z",
    duration: 120,
    triggeredBy: "push",
    commit_hash: "stu5678901",
    coverage_percent: 87,
    triggered_by: "push",
  },
  {
    id: "8",
    name: "Run Tests",
    branch: "main",
    status: "success",
    conclusion: "success",
    created_at: "2025-10-07T14:20:00Z",
    updated_at: "2025-10-07T14:24:00Z",
    duration: 240,
    triggeredBy: "push",
    commit_hash: "vwx2345678",
    coverage_percent: 75,
    triggered_by: "push",
  },
];

export default function CIHistoryPage() {
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Filter workflow runs
  const filtered = useMemo(() => {
    let result = mockWorkflowRuns;

    // Filter by branch
    if (branch) {
      result = result.filter(run => run.branch.toLowerCase().includes(branch.toLowerCase()));
    }

    // Filter by status
    if (status && status !== "all") {
      result = result.filter(run => run.status === status);
    }

    // Filter by date range
    if (startDate) {
      result = result.filter(run => new Date(run.created_at) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter(run => new Date(run.created_at) <= new Date(endDate + "T23:59:59Z"));
    }

    // Sort by date (descending - newest first)
    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [branch, status, startDate, endDate]);

  // Paginate results
  const paginated = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Prepare chart data for coverage evolution
  const chartData = useMemo(() => {
    return mockWorkflowRuns
      .filter(run => run.coverage_percent !== null && run.status === "success")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(run => ({
        name: format(new Date(run.created_at), "dd/MM"),
        coverage: run.coverage_percent,
      }));
  }, []);

  // Export to CSV
  const exportCSV = () => {
    const headers = ["Commit", "Branch", "Status", "Coverage", "Disparado por", "Data"];
    const rows = filtered.map(r => [
      r.commit_hash.slice(0, 7),
      r.branch,
      r.status,
      r.coverage_percent ? `${r.coverage_percent}%` : "—",
      r.triggered_by,
      format(new Date(r.created_at), "dd/MM/yyyy HH:mm"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ci-history-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          title="Histórico de CI/CD"
          description="Visualize e monitore o histórico de execuções do pipeline CI/CD"
          icon={GitBranch}
        />

        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4 mb-4 items-center flex-wrap">
            <Input
              type="text"
              placeholder="Filtrar por branch..."
              value={branch}
              onChange={e => setBranch(e.target.value)}
            />
            <Select
              value={status || "all"}
              onValueChange={val => setStatus(val === "all" ? "" : val)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">✅ Sucesso</SelectItem>
                <SelectItem value="failure">❌ Falha</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            <Button onClick={exportCSV}>📤 Exportar CSV</Button>
          </div>

          {/* Coverage Evolution Chart */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-2">📈 Evolução da Cobertura</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="coverage"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commit</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Disparado por</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">
                        {r.commit_hash.slice(0, 7)}
                      </TableCell>
                      <TableCell>{r.branch}</TableCell>
                      <TableCell>
                        <span
                          className={`text-sm font-medium ${r.status === "success" ? "text-green-600" : "text-red-500"}`}
                        >
                          {r.status}
                        </span>
                      </TableCell>
                      <TableCell>{r.coverage_percent ?? "—"}%</TableCell>
                      <TableCell>{r.triggered_by}</TableCell>
                      <TableCell>{format(new Date(r.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between pt-4">
                <Button variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  ⬅️ Anterior
                </Button>
                <Button
                  variant="outline"
                  disabled={(page + 1) * pageSize >= filtered.length}
                  onClick={() => setPage(p => p + 1)}
                >
                  Próxima ➡️
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
