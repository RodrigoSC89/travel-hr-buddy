/**
 * M009 - Swarm Formation Panel
 * Visual UI for dynamic agent swarm formation and mission management
 */
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Network, Users, Zap, Shield, Anchor, DollarSign, Leaf, Ship,
  AlertTriangle, Target, Play, X, ChevronRight,
} from "lucide-react";
import { swarmFormation, type MissionType, type SwarmResult } from "@/services/ai/swarm-formation.service";
import { cn } from "@/lib/utils";

const MISSION_ICONS: Record<MissionType, React.ReactNode> = {
  voyage_planning: <Ship className="h-4 w-4" />,
  maintenance_critical: <Zap className="h-4 w-4" />,
  compliance_audit: <Shield className="h-4 w-4" />,
  crew_optimization: <Users className="h-4 w-4" />,
  emergency_response: <AlertTriangle className="h-4 w-4" />,
  financial_review: <DollarSign className="h-4 w-4" />,
  esg_reporting: <Leaf className="h-4 w-4" />,
  fleet_overview: <Anchor className="h-4 w-4" />,
  port_inspection: <Target className="h-4 w-4" />,
  custom: <Network className="h-4 w-4" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-yellow-500/20 text-yellow-400",
  critical: "bg-destructive/20 text-destructive",
};

export const SwarmFormationPanel: React.FC = () => {
  const [activeSwarm, setActiveSwarm] = useState<SwarmResult | null>(null);
  const [selectedMission, setSelectedMission] = useState<MissionType | null>(null);

  const missions = useMemo(() => swarmFormation.getAvailableMissions(), []);

  const handleFormSwarm = (type: MissionType) => {
    const result = swarmFormation.formSwarm(type);
    setActiveSwarm(result);
    setSelectedMission(type);
  };

  const handleDisband = () => {
    if (activeSwarm) {
      swarmFormation.disbandSwarm(activeSwarm.formation.id);
      setActiveSwarm(null);
      setSelectedMission(null);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Network className="h-5 w-5 text-primary" />
          Swarm Formation
          <Badge variant="outline" className="text-xs">M009</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Mission selector */}
        {!activeSwarm && (
          <ScrollArea className="h-[320px]">
            <div className="grid gap-2">
              {missions.filter(m => m.type !== "custom").map((mission) => (
                <button
                  key={mission.type}
                  onClick={() => handleFormSwarm(mission.type)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                    "hover:bg-accent/50 hover:border-primary/30",
                    selectedMission === mission.type && "border-primary bg-primary/5"
                  )}
                >
                  <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {MISSION_ICONS[mission.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{mission.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{mission.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {mission.agentCount} agents
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Active swarm details */}
        {activeSwarm && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {MISSION_ICONS[activeSwarm.formation.missionType]}
                <span className="font-medium text-sm">{activeSwarm.formation.name}</span>
                <Badge className={cn("text-xs", PRIORITY_COLORS[activeSwarm.formation.priority])}>
                  {activeSwarm.formation.priority}
                </Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={handleDisband}>
                <X className="h-4 w-4 mr-1" /> Disband
              </Button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border p-2 text-center">
                <p className="text-xs text-muted-foreground">Cobertura</p>
                <p className="text-lg font-bold text-primary">{activeSwarm.coverageScore}%</p>
                <Progress value={activeSwarm.coverageScore} className="h-1 mt-1" />
              </div>
              <div className="rounded-lg border p-2 text-center">
                <p className="text-xs text-muted-foreground">Agentes</p>
                <p className="text-lg font-bold">{activeSwarm.agentDetails.length}</p>
              </div>
              <div className="rounded-lg border p-2 text-center">
                <p className="text-xs text-muted-foreground">Redundância</p>
                <p className="text-lg font-bold text-yellow-400">{activeSwarm.redundancy}%</p>
              </div>
            </div>

            {/* Agent list */}
            <ScrollArea className="h-[180px]">
              <div className="space-y-1.5">
                {activeSwarm.agentDetails.map((agent) => (
                  <div
                    key={agent.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md border text-sm",
                      agent.id === activeSwarm.formation.leader && "border-primary/40 bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      agent.level === "SUPERVISOR" ? "bg-red-400" :
                        agent.level === "COORDINATOR" ? "bg-yellow-400" : "bg-green-400"
                    )} />
                    <span className="font-medium truncate flex-1">{agent.name}</span>
                    {agent.id === activeSwarm.formation.leader && (
                      <Badge variant="outline" className="text-xs shrink-0">Líder</Badge>
                    )}
                    <Badge variant="secondary" className="text-xs shrink-0">
                      L{agent.autonomyLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Button className="w-full" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Executar Missão
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SwarmFormationPanel;
