import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, BookOpen, Users, Lock, AlertTriangle, CheckCircle, Play } from "lucide-react";

const ispsModules = [
  { id: "1", title: "ISPS Code Awareness", level: "Básico", duration: "2h", status: "completed", participants: 24 },
  { id: "2", title: "Security Duties", level: "Intermediário", duration: "4h", status: "available", participants: 0 },
  { id: "3", title: "Ship Security Officer (SSO)", level: "Avançado", duration: "8h", status: "available", participants: 0 },
  { id: "4", title: "Threat Recognition", level: "Básico", duration: "1h", status: "completed", participants: 20 },
  { id: "5", title: "Access Control Procedures", level: "Intermediário", duration: "3h", status: "in_progress", participants: 12 },
];

export default function ISPSCodeSection() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-purple-500/20"><Shield className="h-10 w-10 text-purple-500" /></div>
            <div>
              <h2 className="text-2xl font-bold">ISPS Code Training Center</h2>
              <p className="text-muted-foreground">International Ship and Port Facility Security Code - Treinamentos de Segurança Marítima</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Lock className="h-8 w-8 text-purple-500" /><div><p className="text-2xl font-bold">Nível 1</p><p className="text-sm text-muted-foreground">Status Atual</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">92%</p><p className="text-sm text-muted-foreground">Tripulação Treinada</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">2</p><p className="text-sm text-muted-foreground">Drills Realizados</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Módulos de Treinamento ISPS</CardTitle>
          <CardDescription>Treinamentos obrigatórios conforme ISPS Code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ispsModules.map(mod => (
              <div key={mod.id} className="p-4 border rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${mod.status === "completed" ? "bg-green-500/10" : mod.status === "in_progress" ? "bg-blue-500/10" : "bg-muted"}`}>
                    {mod.status === "completed" ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Shield className="h-6 w-6 text-purple-500" />}
                  </div>
                  <div>
                    <p className="font-bold">{mod.title}</p>
                    <p className="text-sm text-muted-foreground">Nível: {mod.level} • Duração: {mod.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={mod.status === "completed" ? "default" : mod.status === "in_progress" ? "secondary" : "outline"}>
                    {mod.status === "completed" ? "Concluído" : mod.status === "in_progress" ? "Em Andamento" : "Disponível"}
                  </Badge>
                  <Button variant={mod.status === "completed" ? "outline" : "default"} size="sm">
                    {mod.status === "completed" ? "Revisar" : <><Play className="h-3 w-3 mr-1" />Iniciar</>}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
