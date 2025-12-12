import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Clock, Target, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { missionLoggingService } from "../services/mission-logging";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: "available" | "assigned" | "offline";
}

interface Mission {
  id: string;
  name: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "planned" | "active" | "completed" | "cancelled";
  agents: Agent[];
  createdAt: Date;
  startDate?: Date;
  endDate?: Date;
}

export const MissionManager = memo(function() {
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: "1",
      name: "Rotina de Inspeção - Plataforma Alpha",
      description: "Inspeção trimestral de segurança e manutenção",
      priority: "medium",
      status: "active",
      agents: [
        { id: "a1", name: "João Silva", role: "Inspector", status: "assigned" },
        { id: "a2", name: "Maria Santos", role: "Safety Officer", status: "assigned" }
      ],
      createdAt: new Date("2025-10-20"),
      startDate: new Date("2025-10-27")
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMission, setNewMission] = useState({
    name: "",
    description: "",
    priority: "medium" as Mission["priority"],
    agents: [] as string[]
  });

  const availableAgents: Agent[] = [
    { id: "a1", name: "João Silva", role: "Inspector", status: "available" },
    { id: "a2", name: "Maria Santos", role: "Safety Officer", status: "available" },
    { id: "a3", name: "Pedro Costa", role: "Engineer", status: "available" },
    { id: "a4", name: "Ana Oliveira", role: "Coordinator", status: "assigned" },
    { id: "a5", name: "Carlos Mendes", role: "Technician", status: "available" }
  ];

  const handleCreateMission = async () => {
    if (!newMission.name || !newMission.description) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const selectedAgents = availableAgents.filter(a => newMission.agents.includes(a.id));

    const mission: Mission = {
      id: `m-${Date.now()}`,
      name: newMission.name,
      description: newMission.description,
      priority: newMission.priority,
      status: "planned",
      agents: selectedAgents.map(a => ({ ...a, status: "assigned" as const })),
      createdAt: new Date()
    };

    setMissions([mission, ...missions]);
    
    // Log mission creation to mission_control_logs
    await missionLoggingService.logEvent(
      mission.id,
      "mission_created",
      "info",
      `Mission "${mission.name}" created with ${selectedAgents.length} agent(s)`,
      {
        missionName: mission.name,
        priority: mission.priority,
        agentCount: selectedAgents.length,
        agents: selectedAgents.map(a => ({ id: a.id, name: a.name, role: a.role }))
      }
    );
    
    toast.success("Missão criada com sucesso!", {
      description: `${selectedAgents.length} agente(s) atribuído(s)`
    });

    setIsDialogOpen(false);
    setNewMission({
      name: "",
      description: "",
      priority: "medium",
      agents: []
    });
  };

  const getPriorityColor = (priority: Mission["priority"]) => {
    switch (priority) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    }
  };

  const getStatusColor = (status: Mission["status"]) => {
    switch (status) {
    case "active":
      return "bg-blue-500";
    case "planned":
      return "bg-purple-500";
    case "completed":
      return "bg-green-500";
    case "cancelled":
      return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Missões</h2>
          <p className="text-muted-foreground">
            Crie e gerencie missões táticas com atribuição de agentes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Missão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Missão</DialogTitle>
              <DialogDescription>
                Defina os detalhes da missão e atribua agentes
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Missão *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Inspeção de Segurança"
                  value={newMission.name}
                  onChange={handleChange})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os objetivos e detalhes da missão"
                  value={newMission.description}
                  onChange={handleChange})}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={newMission.priority}
                  onValueChange={(value) => setNewMission({ ...newMission, priority: value as Mission["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Agentes Disponíveis</Label>
                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {availableAgents.map((agent) => (
                    <label
                      key={agent.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-accent p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={newMission.agents.includes(agent.id)}
                        disabled={agent.status === "assigned"}
                        onChange={handleChange});
                          } else {
                            setNewMission({ ...newMission, agents: newMission.agents.filter(id => id !== agent.id) });
                          }
                        }}
                        className="rounded"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">{agent.role}</div>
                        </div>
                        <Badge variant={agent.status === "available" ? "default" : "secondary"}>
                          {agent.status === "available" ? "Disponível" : "Ocupado"}
                        </Badge>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleSetIsDialogOpen}>
                Cancelar
              </Button>
              <Button onClick={handleCreateMission}>
                Criar Missão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Missions List */}
      <div className="grid gap-4">
        {missions.map((mission) => (
          <Card key={mission.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {mission.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{mission.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(mission.priority)}>
                    {mission.priority}
                  </Badge>
                  <Badge className={getStatusColor(mission.status)}>
                    {mission.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Criada em {mission.createdAt.toLocaleDateString()}
                  </div>
                  {mission.startDate && (
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Início: {mission.startDate.toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Agentes Atribuídos ({mission.agents.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mission.agents.map((agent) => (
                      <Badge key={agent.id} variant="outline">
                        {agent.name} - {agent.role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                  {mission.status === "planned" && (
                    <Button size="sm">
                      Iniciar Missão
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
