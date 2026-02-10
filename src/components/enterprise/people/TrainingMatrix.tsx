/**
 * Training Matrix Component
 * Matriz de treinamentos STCW com LMS integrado
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  GraduationCap,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Calendar,
  Award,
  Play,
  BookOpen,
  Download
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Training {
  id: string;
  name: string;
  code: string;
  category: "STCW" | "Safety" | "Technical" | "Compliance" | "Soft Skills";
  duration: string;
  validity: number;
  isMandatory: boolean;
}

interface CrewTraining {
  crewId: string;
  crewName: string;
  rank: string;
  vessel: string;
  trainings: {
    trainingId: string;
    status: "completed" | "in-progress" | "expired" | "not-started";
    completedDate?: string;
    expiryDate?: string;
    progress?: number;
    score?: number;
  }[];
}

const fallbackTrainings: Training[] = [
  { id: "1", name: "Basic Safety Training (BST)", code: "STCW-A-VI/1", category: "STCW", duration: "5 days", validity: 60, isMandatory: true },
  { id: "2", name: "Advanced Fire Fighting", code: "STCW-A-VI/3", category: "STCW", duration: "3 days", validity: 60, isMandatory: true },
  { id: "3", name: "Medical First Aid", code: "STCW-A-VI/4-1", category: "STCW", duration: "3 days", validity: 60, isMandatory: true },
  { id: "4", name: "Ship Security Awareness", code: "STCW-A-VI/6-1", category: "Safety", duration: "1 day", validity: 60, isMandatory: true },
  { id: "5", name: "Bridge Resource Management", code: "STCW-A-II/1", category: "Technical", duration: "5 days", validity: 60, isMandatory: false },
  { id: "6", name: "Engine Room Resource Management", code: "STCW-A-III/1", category: "Technical", duration: "5 days", validity: 60, isMandatory: false }
];

const fallbackCrewTrainings: CrewTraining[] = [
  {
    crewId: "1", crewName: "Carlos Santos", rank: "Chief Officer", vessel: "MV Atlantic Pioneer",
    trainings: [
      { trainingId: "1", status: "completed", completedDate: "2024-06-15", expiryDate: "2029-06-15", score: 92 },
      { trainingId: "2", status: "completed", completedDate: "2024-06-18", expiryDate: "2029-06-18", score: 88 },
      { trainingId: "3", status: "expired", completedDate: "2019-03-10", expiryDate: "2024-03-10" },
      { trainingId: "4", status: "completed", completedDate: "2024-01-20", expiryDate: "2029-01-20", score: 95 },
      { trainingId: "5", status: "in-progress", progress: 65 },
      { trainingId: "6", status: "not-started" }
    ]
  },
  {
    crewId: "2", crewName: "Maria Fernanda", rank: "2nd Engineer", vessel: "MV Pacific Voyager",
    trainings: [
      { trainingId: "1", status: "completed", completedDate: "2023-08-10", expiryDate: "2028-08-10", score: 90 },
      { trainingId: "2", status: "completed", completedDate: "2023-08-12", expiryDate: "2028-08-12", score: 85 },
      { trainingId: "3", status: "completed", completedDate: "2023-08-15", expiryDate: "2028-08-15", score: 91 },
      { trainingId: "4", status: "completed", completedDate: "2023-09-01", expiryDate: "2028-09-01", score: 88 },
      { trainingId: "5", status: "not-started" },
      { trainingId: "6", status: "in-progress", progress: 30 }
    ]
  }
];

export function TrainingMatrix() {
  const [trainings, setTrainings] = useState<Training[]>(fallbackTrainings);
  const [crewTrainings, setCrewTrainings] = useState<CrewTraining[]>(fallbackCrewTrainings);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: courses } = await supabase
          .from("academy_courses")
          .select("id, course_name, metadata")
          .limit(10);

        if (courses && courses.length > 0) {
          setTrainings(courses.map((c: any) => ({
            id: c.id,
            name: c.course_name,
            code: (c.metadata as any)?.code || "N/A",
            category: "STCW" as const,
            duration: `${(c.metadata as any)?.duration_days || 5} days`,
            validity: 60,
            isMandatory: true
          })));
        }
      } catch { /* keep fallback */ }
    };
    load();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVessel, setFilterVessel] = useState("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "not-started":
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10";
      case "in-progress":
        return "bg-blue-500/10";
      case "expired":
        return "bg-red-500/10";
      case "not-started":
        return "bg-muted";
    }
  };

  const vessels = [...new Set(crewTrainings.map(c => c.vessel))];

  const stats = {
    totalTrainings: trainings.length,
    completedRate: Math.round(
      (crewTrainings.flatMap(c => c.trainings).filter(t => t.status === "completed").length /
        (crewTrainings.flatMap(c => c.trainings).length || 1)) * 100
    ),
    expiredCount: crewTrainings.flatMap(c => c.trainings).filter(t => t.status === "expired").length,
    inProgressCount: crewTrainings.flatMap(c => c.trainings).filter(t => t.status === "in-progress").length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cursos Disponíveis</p>
                <p className="text-3xl font-bold">{stats.totalTrainings}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-green-500">{stats.completedRate}%</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-3xl font-bold text-red-500">{stats.expiredCount}</p>
              </div>
              <div className="p-3 rounded-full bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-3xl font-bold text-blue-500">{stats.inProgressCount}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tripulante ou curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterVessel} onValueChange={setFilterVessel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Embarcação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Embarcações</SelectItem>
                {vessels.map(vessel => (
                  <SelectItem key={vessel} value={vessel}>{vessel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              const headers = ["Tripulante", "Posto", "Embarcação", ...trainings.map(t => t.code)];
              const rows = crewTrainings.map(c => [
                c.crewName, c.rank, c.vessel,
                ...trainings.map(t => {
                  const ct = c.trainings.find(tr => tr.trainingId === t.id);
                  return ct?.status || "not-started";
                })
              ]);
              const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `training-matrix-${new Date().toISOString().split("T")[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Matriz de Treinamentos STCW
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-sm">Tripulante</th>
                  {trainings.map((training: Training) => (
                    <th key={training.id} className="p-3 text-center min-w-[100px]">
                      <div className="text-xs font-medium">{training.code}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[100px]" title={training.name}>
                        {training.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crewTrainings.map((crew: CrewTraining) => (
                  <tr key={crew.crewId} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{crew.crewName}</p>
                        <p className="text-xs text-muted-foreground">{crew.rank}</p>
                        <p className="text-xs text-muted-foreground">{crew.vessel}</p>
                      </div>
                    </td>
                    {trainings.map((training: Training) => {
                      const crewTraining = crew.trainings.find((t: { trainingId: string }) => t.trainingId === training.id);
                      return (
                        <td key={training.id} className="p-2 text-center">
                          <div className={`p-2 rounded-lg ${getStatusBg(crewTraining?.status || "not-started")}`}>
                            <div className="flex justify-center mb-1">
                              {getStatusIcon(crewTraining?.status || "not-started")}
                            </div>
                            {crewTraining?.status === "in-progress" && crewTraining.progress && (
                              <Progress value={crewTraining.progress} className="h-1" />
                            )}
                            {crewTraining?.status === "completed" && crewTraining.score && (
                              <p className="text-xs font-medium">{crewTraining.score}%</p>
                            )}
                            {crewTraining?.expiryDate && crewTraining.status === "completed" && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(crewTraining.expiryDate).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Concluído</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Em Andamento</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>Vencido</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <span>Não Iniciado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TrainingMatrix;
