/**
import { useState } from "react";;
 * Training Matrix Panel Component
 * Painel de matriz de treinamentos com IA integrada
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Brain,
  Users,
  GraduationCap,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { ComplianceTraining, TrainingMatrix } from "../types";

interface TrainingMatrixPanelProps {
  trainings: ComplianceTraining[];
  matrix: TrainingMatrix;
  onGenerateRecommendations: (crewMemberId: string) => Promise<string>;
  onExportMatrix: () => void;
}

export const TrainingMatrixPanel = memo(function({
  trainings,
  matrix,
  onGenerateRecommendations,
  onExportMatrix,
}: TrainingMatrixPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rankFilter, setRankFilter] = useState<string>("all");
  const [loadingRecommendation, setLoadingRecommendation] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});

  const getStatusIcon = (status: ComplianceTraining["status"]) => {
    switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "in-progress":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "expired":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ComplianceTraining["status"]) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      completed: { variant: "default", label: "Concluído" },
      "in-progress": { variant: "secondary", label: "Em Progresso" },
      expired: { variant: "destructive", label: "Expirado" },
      "not-started": { variant: "outline", label: "Não Iniciado" },
    };

    const { variant, label } = variants[status] || variants["not-started"];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.crewMemberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || training.status === statusFilter;
    const matchesRank = rankFilter === "all" || training.crewMemberRank === rankFilter;
    return matchesSearch && matchesStatus && matchesRank;
  });

  const uniqueRanks = [...new Set(trainings.map((t) => t.crewMemberRank))];

  const handleGetRecommendation = async (crewMemberId: string) => {
    setLoadingRecommendation(crewMemberId);
    try {
      const recommendation = await onGenerateRecommendations(crewMemberId);
      setRecommendations((prev) => ({ ...prev, [crewMemberId]: recommendation }));
    } catch (error) {
      console.error("Error generating recommendation:", error);
    } finally {
      setLoadingRecommendation(null);
    }
  };

  // Stats calculation
  const stats = {
    total: trainings.length,
    completed: trainings.filter((t) => t.status === "completed").length,
    inProgress: trainings.filter((t) => t.status === "in-progress").length,
    expired: trainings.filter((t) => t.status === "expired").length,
    notStarted: trainings.filter((t) => t.status === "not-started").length,
  };

  const complianceRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expirados</p>
                <p className="text-2xl font-bold">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conformidade</p>
                <p className="text-2xl font-bold">{complianceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onExportMatrix}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tripulante ou curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="in-progress">Em Progresso</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="not-started">Não Iniciado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rankFilter} onValueChange={setRankFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Funções</SelectItem>
                {uniqueRanks.map((rank) => (
                  <SelectItem key={rank} value={rank}>
                    {rank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Training Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Matriz de Treinamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tripulante</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell className="font-medium">
                      {training.crewMemberName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{training.crewMemberRank}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {training.isMandatory && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              </TooltipTrigger>
                              <TooltipContent>Treinamento Obrigatório</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {training.courseName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(training.status)}
                        {getStatusBadge(training.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <Progress value={training.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground">
                          {training.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {training.expiryDate ? (
                        <span className={training.status === "expired" ? "text-red-500" : ""}>
                          {training.expiryDate}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleGetRecommendation(training.crewMemberId)}
                              disabled={loadingRecommendation === training.crewMemberId}
                            >
                              {loadingRecommendation === training.crewMemberId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4 text-primary" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Recomendação de IA</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {Object.keys(recommendations).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Recomendações de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(recommendations).map(([crewId, recommendation]) => {
                const crew = trainings.find((t) => t.crewMemberId === crewId);
                return (
                  <div
                    key={crewId}
                    className="p-4 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium">{crew?.crewMemberName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{recommendation}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
