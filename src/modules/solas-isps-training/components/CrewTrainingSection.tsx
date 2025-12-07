import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Award, AlertTriangle, CheckCircle, BookOpen } from "lucide-react";

interface Props { searchQuery?: string; }

const mockCrew = [
  { id: "1", name: "João Silva", role: "Capitão", trainings: 12, completed: 12, compliance: 100 },
  { id: "2", name: "Maria Santos", role: "Imediato", trainings: 10, completed: 9, compliance: 90 },
  { id: "3", name: "Carlos Lima", role: "Chefe de Máquinas", trainings: 8, completed: 7, compliance: 87 },
  { id: "4", name: "Ana Costa", role: "Oficial de Náutica", trainings: 10, completed: 8, compliance: 80 },
];

export default function CrewTrainingSection({ searchQuery }: Props) {
  const filtered = mockCrew.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">24</p><p className="text-sm text-muted-foreground">Tripulantes</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Award className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">89%</p><p className="text-sm text-muted-foreground">Conformidade Média</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><BookOpen className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">156</p><p className="text-sm text-muted-foreground">Treinamentos</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-amber-500" /><div><p className="text-2xl font-bold">8</p><p className="text-sm text-muted-foreground">Pendentes</p></div></CardContent></Card>
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
