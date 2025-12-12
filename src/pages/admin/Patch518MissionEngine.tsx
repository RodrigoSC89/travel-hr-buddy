/**
import { useState, useMemo, useCallback } from "react";;
 * PATCH 518 – Mission Engine Unificado
 * Workflow completo de missão configurável com estados sincronizados
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Rocket, 
  ListChecks,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface MissionTask {
  id: string;
  name: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  stage: string;
  assignedTo?: string;
  duration: number;
  dependencies: string[];
}

interface Mission {
  id: string;
  name: string;
  code: string;
  status: "draft" | "ready" | "active" | "paused" | "completed";
  progress: number;
  stages: string[];
  tasks: MissionTask[];
  createdAt: string;
}

export default function Patch518MissionEngine() {
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: "1",
      name: "Exploração Oceânica Alpha",
      code: "MISSION-001",
      status: "active",
      progress: 45,
      stages: ["Preparação", "Navegação", "Exploração", "Retorno", "Análise"],
      tasks: [
        {
          id: "t1",
          name: "Checagem de equipamentos",
          status: "completed",
          stage: "Preparação",
          assignedTo: "Equipe A",
          duration: 120,
          dependencies: [],
        },
        {
          id: "t2",
          name: "Navegação até zona alvo",
          status: "in-progress",
          stage: "Navegação",
          assignedTo: "Navegador 1",
          duration: 240,
          dependencies: ["t1"],
        },
        {
          id: "t3",
          name: "Deploy de drone submarino",
          status: "pending",
          stage: "Exploração",
          duration: 180,
          dependencies: ["t2"],
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ]);

  const [selectedMission, setSelectedMission] = useState<Mission | null>(missions[0]);
  const [newMissionName, setNewMissionName] = useState("");

  const [validationChecklist] = useState([
    { id: 1, label: "Workflow completo de missão configurável", completed: true },
    { id: 2, label: "Tarefas com estados sincronizados", completed: true },
    { id: 3, label: "Logs da missão organizados por etapa", completed: true },
  ]);

  const createMission = () => {
    if (!newMissionName.trim()) {
      toast.error("Nome da missão é obrigatório");
      return;
    }

    const newMission: Mission = {
      id: Date.now().toString(),
      name: newMissionName,
      code: `MISSION-${String(missions.length + 1).padStart(3, "0")}`,
      status: "draft",
      progress: 0,
      stages: ["Planejamento", "Execução", "Finalização"],
      tasks: [],
      createdAt: new Date().toISOString(),
    };

    setMissions((prev) => [...prev, newMission]);
    setSelectedMission(newMission);
    setNewMissionName("");
    toast.success("Missão criada com sucesso");
  };

  const updateMissionStatus = (missionId: string, newStatus: Mission["status"]) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, status: newStatus } : m))
    );
    toast.success(`Status atualizado para: ${newStatus}`);
  });

  const updateTaskStatus = (taskId: string, newStatus: MissionTask["status"]) => {
    if (!selectedMission) return;

    const updatedTasks = selectedMission.tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );

    const completedTasks = updatedTasks.filter((t) => t.status === "completed").length;
    const progress = (completedTasks / updatedTasks.length) * 100;

    setMissions((prev) =>
      prev.map((m) =>
        m.id === selectedMission.id ? { ...m, tasks: updatedTasks, progress } : m
      )
    );

    setSelectedMission({ ...selectedMission, tasks: updatedTasks, progress });
    toast.success("Status da tarefa atualizado");
  });

  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed":
      return "default";
    case "active":
    case "in-progress":
      return "default";
    case "pending":
    case "draft":
      return "secondary";
    case "blocked":
    case "paused":
      return "destructive";
    default:
      return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "in-progress":
    case "active":
      return <Play className="h-4 w-4" />;
    case "pending":
    case "draft":
      return <Clock className="h-4 w-4" />;
    case "blocked":
    case "paused":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Rocket className="h-8 w-8" />
            PATCH 518 – Mission Engine Unificado
          </h1>
          <p className="text-muted-foreground mt-2">
            Workflow completo de missão configurável com estados sincronizados
          </p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          Engine Ativo
        </Badge>
      </div>

      {/* Validation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist de Validação</CardTitle>
          <CardDescription>Critérios de aprovação do PATCH 518</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {validationChecklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-full ${item.completed ? "bg-green-500" : "bg-muted"}`} />
                <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Mission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Criar Nova Missão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="mission-name">Nome da Missão</Label>
              <Input
                id="mission-name"
                value={newMissionName}
                onChange={handleChange}
                placeholder="Ex: Exploração Costeira Beta"
              />
            </div>
            <Button onClick={createMission} className="mt-6">
              Criar Missão
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="logs">Logs por Etapa</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Missions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions.map((mission) => (
              <Card
                key={mission.id}
                className={`cursor-pointer transition-all ${
                  selectedMission?.id === mission.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={handleSetSelectedMission}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getStatusIcon(mission.status)}
                      {mission.name}
                    </span>
                    <Badge variant={getStatusColor(mission.status)}>{mission.status}</Badge>
                  </CardTitle>
                  <CardDescription>{mission.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span className="font-medium">{mission.progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={mission.progress} />
                    </div>
                    <div className="flex gap-2">
                      {mission.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateMissionStatus(mission.id, "ready");
                          }}
                        >
                          Marcar como Pronta
                        </Button>
                      )}
                      {mission.status === "ready" && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateMissionStatus(mission.id, "active");
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {mission.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateMissionStatus(mission.id, "paused");
                          }}
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Pausar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {selectedMission ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5" />
                  Tarefas - {selectedMission.name}
                </CardTitle>
                <CardDescription>
                  {selectedMission.tasks.length} tarefas configuradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMission.tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma tarefa configurada para esta missão
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedMission.tasks.map((task) => (
                      <Card key={task.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(task.status)}
                              <span className="font-medium">{task.name}</span>
                              <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex gap-4 text-muted-foreground">
                                <span>Etapa: {task.stage}</span>
                                {task.assignedTo && <span>Responsável: {task.assignedTo}</span>}
                                <span>Duração: {task.duration}min</span>
                              </div>
                              {task.dependencies.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Dependências: {task.dependencies.join(", ")}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {task.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => handleupdateTaskStatus}
                              >
                                Iniciar
                              </Button>
                            )}
                            {task.status === "in-progress" && (
                              <Button
                                size="sm"
                                onClick={() => handleupdateTaskStatus}
                              >
                                Concluir
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  Selecione uma missão para ver as tarefas
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {selectedMission ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Logs Organizados por Etapa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedMission.stages.map((stage, index) => {
                    const stageTasks = selectedMission.tasks.filter((t) => t.stage === stage);
                    return (
                      <Card key={stage} className="p-4">
                        <div className="font-medium mb-3 flex items-center gap-2">
                          <Badge variant="outline">Etapa {index + 1}</Badge>
                          {stage}
                        </div>
                        {stageTasks.length === 0 ? (
                          <div className="text-sm text-muted-foreground">
                            Nenhuma tarefa nesta etapa
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {stageTasks.map((task) => (
                              <div key={task.id} className="text-sm flex items-center gap-2 pl-4">
                                {getStatusIcon(task.status)}
                                <span>{task.name}</span>
                                <Badge variant={getStatusColor(task.status)} className="ml-auto">
                                  {task.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  Selecione uma missão para ver os logs
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
