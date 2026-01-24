import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Award, AlertTriangle, CheckCircle, BookOpen, Loader2 } from "lucide-react";
import { useCrewTrainingCompliance } from "@/hooks/useCrewData";

interface Props { searchQuery?: string; }

export default function CrewTrainingSection({ searchQuery }: Props) {
  const { data: crewData = [], isLoading } = useCrewTrainingCompliance();
  
  const filtered = crewData.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Calculate stats from real data
  const totalCrew = crewData.length;
  const avgCompliance = crewData.length > 0 
    ? Math.round(crewData.reduce((acc, c) => acc + c.compliance, 0) / crewData.length) 
    : 0;
  const totalTrainings = crewData.reduce((acc, c) => acc + c.trainings, 0);
  const pendingTrainings = crewData.reduce((acc, c) => acc + (c.trainings - c.completed), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando dados de treinamento...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{totalCrew}</p><p className="text-sm text-muted-foreground">Tripulantes</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Award className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{avgCompliance}%</p><p className="text-sm text-muted-foreground">Conformidade Média</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><BookOpen className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{totalTrainings}</p><p className="text-sm text-muted-foreground">Treinamentos</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-warning" /><div><p className="text-2xl font-bold">{pendingTrainings}</p><p className="text-sm text-muted-foreground">Pendentes</p></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Tripulação e Treinamentos</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map(crew => (
              <div key={crew.id} className="p-4 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">{crew.name[0]}</div>
                  <div><p className="font-medium">{crew.name}</p><p className="text-sm text-muted-foreground">{crew.role}</p></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center"><p className="text-lg font-bold">{crew.completed}/{crew.trainings}</p><p className="text-xs text-muted-foreground">Treinamentos</p></div>
                  <div className="w-32"><Progress value={crew.compliance} className="h-2" /><p className="text-xs text-center mt-1">{crew.compliance}%</p></div>
                  <Badge variant={crew.compliance >= 90 ? "default" : crew.compliance >= 80 ? "secondary" : "destructive"}>{crew.compliance >= 90 ? "Conforme" : crew.compliance >= 80 ? "Atenção" : "Pendente"}</Badge>
                  <Button variant="outline" size="sm">Ver Detalhes</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
