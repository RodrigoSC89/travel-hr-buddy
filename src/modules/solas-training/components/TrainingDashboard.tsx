import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Sparkles,
  Send,
  FileText,
  Play,
  Flame,
  Anchor,
  LifeBuoy,
  Siren,
} from "lucide-react";

interface Drill {
  id: string;
  name: string;
  type: "fire" | "abandon" | "mob" | "blackout" | "collision" | "pollution";
  frequency: string;
  lastExecution: string;
  nextDue: string;
  status: "completed" | "due" | "overdue";
  participants: number;
  totalCrew: number;
}

interface TrainingRecord {
  id: string;
  crewMember: string;
  training: string;
  certDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
}

const mockDrills: Drill[] = [
  { id: "1", name: "Exercício de Incêndio", type: "fire", frequency: "Mensal", lastExecution: "2024-01-10", nextDue: "2024-02-10", status: "completed", participants: 24, totalCrew: 24 },
  { id: "2", name: "Abandono de Embarcação", type: "abandon", frequency: "Mensal", lastExecution: "2024-01-05", nextDue: "2024-02-05", status: "completed", participants: 24, totalCrew: 24 },
  { id: "3", name: "Homem ao Mar (MOB)", type: "mob", frequency: "Trimestral", lastExecution: "2023-11-15", nextDue: "2024-02-15", status: "due", participants: 0, totalCrew: 24 },
  { id: "4", name: "Blackout Recovery", type: "blackout", frequency: "Semestral", lastExecution: "2023-08-20", nextDue: "2024-02-20", status: "due", participants: 0, totalCrew: 24 },
  { id: "5", name: "Combate à Poluição", type: "pollution", frequency: "Trimestral", lastExecution: "2023-10-01", nextDue: "2024-01-01", status: "overdue", participants: 0, totalCrew: 24 },
];

const mockTrainings: TrainingRecord[] = [
  { id: "1", crewMember: "João Silva", training: "STCW Basic Safety", certDate: "2022-05-15", expiryDate: "2027-05-15", status: "valid" },
  { id: "2", crewMember: "Maria Santos", training: "Advanced Fire Fighting", certDate: "2021-08-20", expiryDate: "2024-08-20", status: "expiring" },
  { id: "3", crewMember: "Carlos Lima", training: "Medical First Aid", certDate: "2020-03-10", expiryDate: "2024-03-10", status: "expiring" },
  { id: "4", crewMember: "Ana Costa", training: "Survival Craft", certDate: "2019-11-25", expiryDate: "2024-01-25", status: "expired" },
];

export default function TrainingDashboard() {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Olá! Sou o assistente de treinamentos SOLAS/ISM. Posso ajudar com procedimentos de drills, planejamento e relatórios. Como posso ajudar?" },
  ]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatHistory(prev => [...prev, { role: "user", content: chatMessage }]);
    
    setTimeout(() => {
      const responses: Record<string, string> = {
        incendio: "Procedimento Exercício de Incêndio: 1) Acionar alarme geral, 2) Tripulação assume estações, 3) Isolar área, 4) Equipe de combate com EPIs, 5) Simular combate, 6) Debrief. Registrar no Safety Drill Log com assinaturas.",
        abandono: "Procedimento de Abandono: 1) 7 toques curtos + 1 longo, 2) Tripulação com coletes, 3) Muster stations, 4) Verificar lista de presença, 5) Preparar balsas/botes, 6) Simular embarque ordenado. Duração máxima: 30 minutos.",
        vencimentos: "Certificados expirando (90 dias): 3 tripulantes. 1 STCW expirado (Ana Costa). Recomendo agendar reciclagem imediata para manter conformidade ISM.",
        default: "Posso ajudar com procedimentos de drills, verificar vencimentos, gerar plano anual de treinamentos ou explicar requisitos SOLAS/ISM. O que precisa?",
      };
      
      const key = chatMessage.toLowerCase().includes("incêndio") || chatMessage.toLowerCase().includes("fogo") ? "incendio" 
        : chatMessage.toLowerCase().includes("abandon") ? "abandono"
          : chatMessage.toLowerCase().includes("venc") || chatMessage.toLowerCase().includes("certificado") ? "vencimentos"
            : "default";
        
      setChatHistory(prev => [...prev, { role: "assistant", content: responses[key] }]);
    }, 1000);
    
    setChatMessage("");
  };

  const overdueDrills = mockDrills.filter(d => d.status === "overdue").length;
  const dueDrills = mockDrills.filter(d => d.status === "due").length;
  const expiringCerts = mockTrainings.filter(t => t.status === "expiring" || t.status === "expired").length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformidade SOLAS</p>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-xs text-muted-foreground">Drills em dia</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drills Concluídos</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-green-600">Este trimestre</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drills Pendentes</p>
                <p className="text-2xl font-bold">{dueDrills}</p>
                <p className="text-xs text-amber-600">Agendar</p>
              </div>
              <Calendar className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drills Atrasados</p>
                <p className="text-2xl font-bold">{overdueDrills}</p>
                <p className="text-xs text-red-600">Ação urgente</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certs Expirando</p>
                <p className="text-2xl font-bold">{expiringCerts}</p>
                <p className="text-xs text-purple-600">Próximos 90 dias</p>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant + Drills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Training Assistant */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-orange-500" />
              Assistente SOLAS/ISM
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                LLM
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto space-y-3 mb-4 p-3 bg-background/50 rounded-lg">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Pergunte sobre drills, SOLAS..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => setChatMessage("Procedimento incêndio")}>
                Incêndio
              </Button>
              <Button variant="outline" size="sm" onClick={() => setChatMessage("Como fazer abandono?")}>
                Abandono
              </Button>
              <Button variant="outline" size="sm" onClick={() => setChatMessage("Verificar vencimentos")}>
                Vencimentos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Drills Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendário de Exercícios
              </CardTitle>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Drill
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockDrills.map((drill) => (
                <div key={drill.id} className={`p-4 rounded-lg border ${
                  drill.status === "overdue" ? "bg-red-500/10 border-red-500/30" :
                    drill.status === "due" ? "bg-amber-500/10 border-amber-500/30" :
                      "bg-muted/30 border-border"
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        drill.type === "fire" ? "bg-red-500/10 text-red-600" :
                          drill.type === "abandon" ? "bg-blue-500/10 text-blue-600" :
                            drill.type === "mob" ? "bg-cyan-500/10 text-cyan-600" :
                              "bg-amber-500/10 text-amber-600"
                      }`}>
                        {drill.type === "fire" && <Flame className="h-5 w-5" />}
                        {drill.type === "abandon" && <LifeBuoy className="h-5 w-5" />}
                        {drill.type === "mob" && <Anchor className="h-5 w-5" />}
                        {drill.type === "blackout" && <Siren className="h-5 w-5" />}
                        {drill.type === "pollution" && <Siren className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{drill.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Frequência: {drill.frequency} • Último: {drill.lastExecution}
                        </p>
                      </div>
                    </div>
                    <Badge variant={drill.status === "completed" ? "default" : drill.status === "overdue" ? "destructive" : "secondary"}>
                      {drill.status === "completed" ? "Concluído" : drill.status === "due" ? "Pendente" : "Atrasado"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Próximo: {drill.nextDue}
                      </span>
                      {drill.status === "completed" && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {drill.participants}/{drill.totalCrew} participantes
                        </span>
                      )}
                    </div>
                    {drill.status !== "completed" && (
                      <Button variant="outline" size="sm">
                        Agendar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certifications Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Certificações STCW da Tripulação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockTrainings.map((training) => (
              <div key={training.id} className={`p-4 rounded-lg border ${
                training.status === "expired" ? "bg-red-500/10 border-red-500/30" :
                  training.status === "expiring" ? "bg-amber-500/10 border-amber-500/30" :
                    "bg-muted/30 border-border"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{training.crewMember}</p>
                  <Badge variant={training.status === "valid" ? "outline" : training.status === "expired" ? "destructive" : "secondary"}>
                    {training.status === "valid" ? "Válido" : training.status === "expiring" ? "Expirando" : "Expirado"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{training.training}</p>
                <div className="text-xs text-muted-foreground">
                  <p>Emissão: {training.certDate}</p>
                  <p>Validade: {training.expiryDate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
