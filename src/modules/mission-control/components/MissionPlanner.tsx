import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Rocket, Users, Ship, Calendar, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const MissionPlanner: React.FC = () => {
  const { toast } = useToast();
  const [missions] = useState([
    { id: "1", code: "MSNA01", name: "Emergency Response Alpha", status: "planning", priority: "critical", team_size: 12 },
    { id: "2", code: "MSNO02", name: "Maintenance Operation", status: "active", priority: "medium", team_size: 6 },
  ]);

  const activateMission = (missionId: string) => {
    toast({ title: "Missão Ativada", description: "Contagem regressiva iniciada..." });
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold flex items-center gap-2"><Rocket className="h-6 w-6" />Planejamento de Missões</h2><p className="text-muted-foreground mt-1">PATCH 284 - Mission Control Tactical Planning</p></div>
      <div className="space-y-4">{missions.map(m => (<Card key={m.id}><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="text-lg">{m.code}</CardTitle><p className="text-sm text-muted-foreground">{m.name}</p></div><Badge variant={m.priority === "critical" ? "destructive" : "default"}>{m.priority}</Badge></div></CardHeader><CardContent><div className="flex items-center justify-between"><div className="flex gap-4"><div className="flex items-center gap-1"><Users className="h-4 w-4" /><span className="text-sm">{m.team_size}</span></div><div className="flex items-center gap-1"><Ship className="h-4 w-4" /><span className="text-sm">3 vessels</span></div></div>{m.status === "planning" && (<Button onClick={() => activateMission(m.id)}><Play className="mr-2 h-4 w-4" />Ativar Missão</Button>)}{m.status === "active" && (<Badge variant="outline" className="animate-pulse">EM ANDAMENTO</Badge>)}</div></CardContent></Card>))}</div>
    </div>
  );
};
