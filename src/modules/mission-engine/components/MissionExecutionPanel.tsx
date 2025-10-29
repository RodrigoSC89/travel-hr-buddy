/**
 * PATCH 477: Mission Execution Panel
 * UI for executing missions step-by-step with real-time progress
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  AlertCircle,
  Target
} from "lucide-react";
import { 
  missionExecutionService,
  type ExecutedMission,
  type MissionStep,
  type MissionDefinition
} from "../services/execution-service";
import { toast } from "sonner";

export const MissionExecutionPanel: React.FC = () => {
  const [missions, setMissions] = useState<ExecutedMission[]>([]);
  const [selectedMission, setSelectedMission] = useState<ExecutedMission | null>(null);
  const [missionSteps, setMissionSteps] = useState<MissionStep[]>([]);
  const [executing, setExecuting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMissions();
  }, []);

  useEffect(() => {
    if (selectedMission) {
      loadMissionSteps(selectedMission.id);
    }
  }, [selectedMission]);

  const loadMissions = async () => {
    setLoading(true);
    const fetchedMissions = await missionExecutionService.getAllMissions();
    setMissions(fetchedMissions);
    setLoading(false);
  };

  const loadMissionSteps = async (missionId: string) => {
    const steps = await missionExecutionService.getMissionSteps(missionId);
    setMissionSteps(steps);
  };

  const createAndExecuteDemoMission = async () => {
    setExecuting(true);

    try {
      // Define a demo mission
      const demoMission: MissionDefinition = {
        name: "Navegação de Teste - Rota A",
        type: "navigation",
        estimated_duration_minutes: 5,
        steps: [
          {
            name: "Verificação de Sistemas",
            description: "Verificar status de todos os sistemas críticos",
            executor: async () => {
              await new Promise(resolve => setTimeout(resolve, 2000));
              return { systems_checked: 5, all_operational: true };
            },
          },
          {
            name: "Planejamento de Rota",
            description: "Calcular rota otimizada",
            executor: async () => {
              await new Promise(resolve => setTimeout(resolve, 3000));
              return { 
                waypoints: 12, 
                distance_nm: 45.2, 
                estimated_time_hours: 3.5 
              };
            },
          },
          {
            name: "Verificação Meteorológica",
            description: "Análise de condições meteorológicas",
            executor: async () => {
              await new Promise(resolve => setTimeout(resolve, 2500));
              return { 
                conditions: "favorable", 
                wind_speed_knots: 12, 
                wave_height_m: 1.5 
              };
            },
          },
          {
            name: "Ativação de Sensores",
            description: "Ativar sistemas de navegação e sensores",
            executor: async () => {
              await new Promise(resolve => setTimeout(resolve, 2000));
              return { 
                gps_active: true, 
                radar_active: true, 
                sonar_active: true 
              };
            },
          },
          {
            name: "Iniciar Navegação",
            description: "Iniciar execução da rota planejada",
            executor: async () => {
              await new Promise(resolve => setTimeout(resolve, 1500));
              return { 
                navigation_started: true, 
                current_speed_knots: 15,
                heading: 045
              };
            },
          },
        ],
      };

      // Create mission
      const mission = await missionExecutionService.createMission(demoMission);
      if (!mission) {
        throw new Error("Failed to create mission");
      }

      toast.success("Missão criada com sucesso");
      setSelectedMission(mission);

      // Execute mission with progress updates
      const success = await missionExecutionService.executeMission(
        mission.id,
        demoMission,
        (updatedMission, currentStep, allSteps) => {
          // Update UI with progress
          setSelectedMission(updatedMission);
          setMissionSteps(allSteps);
        }
      );

      if (success) {
        toast.success("Missão completada com sucesso!");
      } else {
        toast.error("Missão falhou durante execução");
      }

      // Reload missions list
      await loadMissions();
    } catch (error) {
      console.error("Error executing demo mission:", error);
      toast.error("Erro ao executar missão");
    } finally {
      setExecuting(false);
    }
  };

  const getStatusColor = (status: ExecutedMission["status"] | MissionStep["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "in_progress":
        return "text-blue-500";
      case "failed":
        return "text-red-500";
      case "aborted":
        return "text-orange-500";
      case "pending":
        return "text-gray-500";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: ExecutedMission["status"] | MissionStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "aborted":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: ExecutedMission["status"] | MissionStep["status"]) => {
    const labels = {
      pending: "Pendente",
      in_progress: "Em Execução",
      completed: "Completada",
      failed: "Falhou",
      aborted: "Abortada",
      skipped: "Pulada",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Motor de Execução de Missões
              </CardTitle>
              <CardDescription>
                Execute missões passo a passo com monitoramento em tempo real
              </CardDescription>
            </div>
            <Button
              onClick={createAndExecuteDemoMission}
              disabled={executing}
            >
              {executing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Executar Missão Demo
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mission List */}
            <div>
              <h3 className="text-sm font-medium mb-3">Missões Executadas</h3>
              <ScrollArea className="h-[400px] border rounded-lg p-2">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : missions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Target className="h-8 w-8 mb-2" />
                    <p className="text-sm">Nenhuma missão executada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {missions.map((mission) => (
                      <div
                        key={mission.id}
                        onClick={() => setSelectedMission(mission)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          selectedMission?.id === mission.id ? "bg-accent" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">{mission.mission_name}</div>
                          <Badge variant="outline" className={getStatusColor(mission.status)}>
                            {getStatusLabel(mission.status)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {new Date(mission.created_at).toLocaleString()}
                        </div>
                        <Progress value={mission.progress_percentage} className="h-1" />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Mission Details */}
            <div>
              <h3 className="text-sm font-medium mb-3">Detalhes da Missão</h3>
              {selectedMission ? (
                <div className="border rounded-lg p-4 space-y-4">
                  <div>
                    <div className="font-medium mb-2">{selectedMission.mission_name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{selectedMission.mission_type}</Badge>
                      <span className={`flex items-center gap-1 ${getStatusColor(selectedMission.status)}`}>
                        {getStatusIcon(selectedMission.status)}
                        {getStatusLabel(selectedMission.status)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Progresso</div>
                    <div className="space-y-2">
                      <Progress value={selectedMission.progress_percentage} />
                      <div className="text-xs text-muted-foreground text-right">
                        {selectedMission.progress_percentage}%
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <ScrollArea className="h-[250px]">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Passos da Missão</h4>
                      {missionSteps.map((step) => (
                        <div key={step.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={getStatusColor(step.status)}>
                                {getStatusIcon(step.status)}
                              </div>
                              <div className="text-sm font-medium">
                                {step.step_number}. {step.step_name}
                              </div>
                            </div>
                            <Badge variant="outline" className={getStatusColor(step.status)}>
                              {getStatusLabel(step.status)}
                            </Badge>
                          </div>
                          {step.step_description && (
                            <div className="text-xs text-muted-foreground mb-2">
                              {step.step_description}
                            </div>
                          )}
                          {step.duration_seconds && (
                            <div className="text-xs text-muted-foreground">
                              Duração: {step.duration_seconds}s
                            </div>
                          )}
                          {step.error_message && (
                            <div className="text-xs text-red-500 mt-2">
                              Erro: {step.error_message}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="border rounded-lg p-4 h-[400px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Target className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Selecione uma missão para ver os detalhes</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
