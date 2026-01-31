/**
 * Interactivity Scoreboard
 * Dashboard showing module completeness scores (0-100)
 * Modules with score < 100 are blocked for testing
 */

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  RefreshCw, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  BarChart3,
  Filter,
  Clock,
  Shield,
  Anchor,
  Wrench,
  Brain,
  GraduationCap,
  Users,
  Wallet,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/lib/logger';

interface ModuleScore {
  key: string;
  name: string;
  score: number;
  blockers: number;
  category: string;
  status: "ready" | "in_progress" | "blocked" | "disabled";
  featureFlagOff?: boolean;
}

interface ScoreReport {
  generatedAt: string;
  version: string;
  averageScore: number;
  totalModules: number;
  readyForTest: number;
  blocked: number;
  scores: ModuleScore[];
  categoryAverages: Record<string, number>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  operations: <Anchor className="h-4 w-4" />,
  maintenance: <Wrench className="h-4 w-4" />,
  ai: <Brain className="h-4 w-4" />,
  training: <GraduationCap className="h-4 w-4" />,
  compliance: <Shield className="h-4 w-4" />,
  hr: <Users className="h-4 w-4" />,
  finance: <Wallet className="h-4 w-4" />,
  enterprise: <FileText className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  ready: "bg-green-500",
  in_progress: "bg-yellow-500",
  blocked: "bg-red-500",
  disabled: "bg-gray-400",
};

const statusLabels: Record<string, string> = {
  ready: "Pronto para Teste",
  in_progress: "Em Progresso",
  blocked: "Bloqueado",
  disabled: "Desabilitado",
};

export default function InteractivityScoreboard() {
  const [report, setReport] = useState<ScoreReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const loadReport = async () => {
    setLoading(true);
    try {
      // Try to fetch from public folder
      const response = await fetch("/qa/module-scores.json");
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        // Fallback to embedded data
        setReport(getDefaultReport());
      }
    } catch (error) {
      logger.warn("Could not load scores, using defaults");
      setReport(getDefaultReport());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const filteredModules = useMemo(() => {
    if (!report) return [];
    
    return report.scores.filter((module) => {
      const matchesSearch = 
        module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.key.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || module.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || module.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [report, searchQuery, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    if (!report) return { avg: 0, ready: 0, blocked: 0, total: 0 };
    
    const activeModules = report.scores.filter(m => m.status !== "disabled");
    const avg = activeModules.length > 0 
      ? Math.round(activeModules.reduce((sum, m) => sum + m.score, 0) / activeModules.length)
      : 0;
    
    return {
      avg,
      ready: activeModules.filter(m => m.score >= 100).length,
      blocked: activeModules.filter(m => m.score < 100).length,
      total: activeModules.length,
    };
  }, [report]);

  const categories = useMemo(() => {
    if (!report) return [];
    return [...new Set(report.scores.map(m => m.category))];
  }, [report]);

  const handleExport = () => {
    if (!report) return;
    
    const csv = [
      ["Módulo", "Score", "Status", "Categoria", "Blockers"].join(","),
      ...report.scores.map(m => 
        [m.name, m.score, statusLabels[m.status], m.category, m.blockers].join(",")
      )
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interactivity-scores-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    
    toast({
      title: "Exportado",
      description: "Relatório exportado com sucesso",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 100) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 100) return "bg-green-500";
    if (score >= 80) return "bg-yellow-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Interactivity Scoreboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento de completude e interatividade dos módulos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadReport}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Score Médio</CardDescription>
            <CardTitle className={`text-3xl ${getScoreColor(stats.avg)}`}>
              {stats.avg}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.avg} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Prontos para Teste</CardDescription>
            <CardTitle className="text-3xl text-green-600 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              {stats.ready}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              de {stats.total} módulos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bloqueados</CardDescription>
            <CardTitle className="text-3xl text-red-600 flex items-center gap-2">
              <XCircle className="h-6 w-6" />
              {stats.blocked}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              requerem correções
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Última Atualização</CardDescription>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {report?.generatedAt 
                ? new Date(report.generatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : "-"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Versão: {report?.version || "1.0.0"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Averages */}
      {report?.categoryAverages && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Score por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.entries(report.categoryAverages).map(([category, score]) => (
                <div key={category} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {categoryIcons[category]}
                    <span className="text-xs capitalize">{category}</span>
                  </div>
                  <div className={`text-xl font-bold ${getScoreColor(score)}`}>
                    {score}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar módulo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="all">Todas Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="all">Todos Status</option>
            <option value="ready">Pronto</option>
            <option value="in_progress">Em Progresso</option>
            <option value="blocked">Bloqueado</option>
            <option value="disabled">Desabilitado</option>
          </select>
        </div>
      </div>

      {/* Module List */}
      <div className="grid gap-4">
        {filteredModules.map((module) => (
          <Card key={module.key} className={module.status === "disabled" ? "opacity-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${statusColors[module.status]}`} />
                  <div>
                    <h3 className="font-semibold">{module.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {categoryIcons[module.category]}
                      <span className="capitalize">{module.category}</span>
                      <span>•</span>
                      <span>{module.key}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(module.score)}`}>
                      {module.score}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {module.blockers > 0 && (
                        <span className="text-red-500">
                          {module.blockers} bloqueador{module.blockers > 1 ? "es" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-32">
                    <Progress 
                      value={module.score} 
                      className="h-2"
                    />
                  </div>

                  <Badge 
                    variant={module.status === "ready" ? "default" : "secondary"}
                    className={module.status === "blocked" ? "bg-red-100 text-red-800" : ""}
                  >
                    {statusLabels[module.status]}
                  </Badge>
                </div>
              </div>

              {module.score < 100 && module.status !== "disabled" && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-yellow-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      Módulo bloqueado para testes. Necessário atingir 100% de completude.
                    </span>
                  </div>
                </div>
              )}

              {module.featureFlagOff && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Feature flag UNDERWATER_ENABLED=false - Módulo removido do sistema</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredModules.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum módulo encontrado com os filtros aplicados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Default report fallback
function getDefaultReport(): ScoreReport {
  return {
    generatedAt: new Date().toISOString(),
    version: "1.0.0",
    averageScore: 72,
    totalModules: 35,
    readyForTest: 2,
    blocked: 32,
    scores: [
      { key: "crew_wellbeing", name: "Crew Wellbeing", score: 100, blockers: 0, category: "hr", status: "ready" },
      { key: "training_academy", name: "Training Academy", score: 100, blockers: 0, category: "training", status: "ready" },
      { key: "maritime_command", name: "Maritime Command", score: 85, blockers: 2, category: "operations", status: "in_progress" },
      { key: "digital_twin", name: "Digital Twin", score: 78, blockers: 3, category: "operations", status: "in_progress" },
      { key: "underwater_ops", name: "Operações Submarinas", score: 0, blockers: 0, category: "operations", status: "disabled", featureFlagOff: true },
    ],
    categoryAverages: {
      operations: 71,
      maintenance: 78,
      ai: 79,
      training: 94,
      compliance: 76,
      hr: 84,
      finance: 74,
      enterprise: 79
    }
  };
}
