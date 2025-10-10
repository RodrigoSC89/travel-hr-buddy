import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { CheckCircle, XCircle, Clock, GitBranch, Calendar, Filter } from "lucide-react";
import { format } from "date-fns";

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
  commit: {
    message: string;
    sha: string;
  };
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
    commit: {
      message: "feat: Add CI history page",
      sha: "abc1234"
    }
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
    commit: {
      message: "fix: Update dependencies",
      sha: "def5678"
    }
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
    commit: {
      message: "docs: Update README",
      sha: "ghi9012"
    }
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
    commit: {
      message: "refactor: Improve performance",
      sha: "jkl3456"
    }
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
    commit: {
      message: "fix: Critical security patch",
      sha: "mno7890"
    }
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
    commit: {
      message: "feat: Add new feature",
      sha: "pqr1234"
    }
  },
  {
    id: "7",
    name: "Run Tests",
    branch: "feature/ui-improvements",
    status: "in_progress",
    conclusion: "in_progress",
    created_at: "2025-10-10T03:00:00Z",
    updated_at: "2025-10-10T03:00:00Z",
    duration: 0,
    triggeredBy: "push",
    commit: {
      message: "ui: Improve admin interface",
      sha: "stu5678"
    }
  }
];

export default function CIHistoryPage() {
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter and sort workflow runs
  const filteredRuns = useMemo(() => {
    let filtered = mockWorkflowRuns;

    // Filter by branch
    if (branchFilter) {
      filtered = filtered.filter(run => 
        run.branch.toLowerCase().includes(branchFilter.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(run => run.status === statusFilter);
    }

    // Sort by date (descending - newest first)
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [branchFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "success":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
            Success
        </Badge>
      );
    case "failure":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
            Failure
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
            In Progress
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const stats = useMemo(() => {
    const total = mockWorkflowRuns.length;
    const successful = mockWorkflowRuns.filter(r => r.status === "success").length;
    const failed = mockWorkflowRuns.filter(r => r.status === "failure").length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

    return { total, successful, failed, successRate };
  }, []);

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          title="Histórico de CI/CD"
          description="Visualize e monitore o histórico de execuções do pipeline CI/CD"
          icon={GitBranch}
        />

        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Execuções
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Falhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
              <CardDescription>
                Filtre o histórico por branch e status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Branch
                  </label>
                  <Input
                    placeholder="Digite o nome da branch..."
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <label className="text-sm font-medium mb-2 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failure">Failure</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Runs List */}
          <Card>
            <CardHeader>
              <CardTitle>Execuções do Workflow</CardTitle>
              <CardDescription>
                Ordenado por data (mais recente primeiro) • {filteredRuns.length} resultado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRuns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma execução encontrada com os filtros aplicados.
                  </div>
                ) : (
                  filteredRuns.map((run) => (
                    <Card key={run.id} className="border-l-4" style={{
                      borderLeftColor: run.status === "success" ? "#22c55e" : 
                        run.status === "failure" ? "#ef4444" : "#eab308"
                    }}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{run.name}</h3>
                              {getStatusBadge(run.status)}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <GitBranch className="w-4 h-4" />
                                <span className="font-mono">{run.branch}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {format(new Date(run.created_at), "dd/MM/yyyy HH:mm")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatDuration(run.duration)}</span>
                              </div>
                            </div>

                            <div className="text-sm">
                              <span className="text-muted-foreground">Commit:</span>{" "}
                              <code className="bg-muted px-2 py-0.5 rounded text-xs">
                                {run.commit.sha}
                              </code>{" "}
                              <span className="text-muted-foreground">-</span>{" "}
                              {run.commit.message}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              Triggered by: {run.triggeredBy}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
