import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  TrendingUp,
  Award,
  Target,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  searchQuery?: string;
}

interface Drill {
  id: string;
  name: string;
  type: "fire" | "abandon" | "mob" | "blackout" | "collision" | "pollution" | "isps";
  frequency: string;
  lastExecution: string;
  nextDue: string;
  status: "completed" | "due" | "overdue";
  participants: number;
  totalCrew: number;
}

const mockDrills: Drill[] = [
  { id: "1", name: "Exercício de Incêndio", type: "fire", frequency: "Mensal", lastExecution: "2024-01-10", nextDue: "2024-02-10", status: "completed", participants: 24, totalCrew: 24 },
  { id: "2", name: "Abandono de Embarcação", type: "abandon", frequency: "Mensal", lastExecution: "2024-01-05", nextDue: "2024-02-05", status: "completed", participants: 24, totalCrew: 24 },
  { id: "3", name: "Homem ao Mar (MOB)", type: "mob", frequency: "Trimestral", lastExecution: "2023-11-15", nextDue: "2024-02-15", status: "due", participants: 0, totalCrew: 24 },
  { id: "4", name: "Blackout Recovery", type: "blackout", frequency: "Semestral", lastExecution: "2023-08-20", nextDue: "2024-02-20", status: "due", participants: 0, totalCrew: 24 },
  { id: "5", name: "Combate à Poluição", type: "pollution", frequency: "Trimestral", lastExecution: "2023-10-01", nextDue: "2024-01-01", status: "overdue", participants: 0, totalCrew: 24 },
  { id: "6", name: "ISPS Security Drill", type: "isps", frequency: "Trimestral", lastExecution: "2023-12-15", nextDue: "2024-03-15", status: "completed", participants: 20, totalCrew: 24 },
];

export default function TrainingDashboardSection({ searchQuery }: Props) {
  const { toast } = useToast();
  const [chatMessage, setChatMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    { 
      role: "assistant", 
      content: "Olá! Sou o assistente de treinamentos SOLAS, ISPS & ISM. Posso ajudar com:\n\n• Procedimentos de drills e simulados\n• Requisitos SOLAS e ISM Code\n• Treinamentos ISPS Code\n• Verificação de certificações STCW\n• Geração de relatórios\n\nComo posso ajudar?" 
    },
  ]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [...prev, { role: "user", content: chatMessage }]);
    setIsLoading(true);
    const userMsg = chatMessage;
    setChatMessage("");

    // Simulate AI response (in production, this would call the edge function)
    setTimeout(() => {
      const responses: Record<string, string> = {
        incendio: `## Procedimento Exercício de Incêndio (SOLAS III/19.3)

1. **Acionamento do Alarme**
   - Soar alarme geral de incêndio
   - Tempo máximo para acionamento: 30 segundos

2. **Reunião da Equipe**
   - Tripulação assume estações de emergência
   - Equipe de combate com EPIs completos

3. **Isolamento da Área**
   - Fechar portas estanques
   - Desligar ventilação da área afetada

4. **Combate ao Incêndio**
   - Uso de extintores e mangueiras
   - Seguir técnicas de ataque

5. **Debrief e Registro**
   - Registrar no Safety Drill Log
   - Coletar assinaturas de todos os participantes

📋 Frequência obrigatória: Mensal (SOLAS Reg. III/19.3.2)`,
        abandono: `## Procedimento de Abandono (SOLAS III/19.3)

**Sinal de Alarme:** 7 toques curtos + 1 toque longo

1. **Reunião nos Muster Stations**
   - Tripulação com coletes salva-vidas
   - Tempo máximo: 10 minutos

2. **Verificação de Pessoal**
   - Lista de presença completa
   - Comunicação com ponte

3. **Preparação de Balsas/Botes**
   - Verificar equipamentos de sobrevivência
   - Checar rações e água

4. **Embarque Ordenado**
   - Priorizar feridos e incapacitados
   - Manter calma e disciplina

📋 Tempo total máximo recomendado: 30 minutos`,
        isps: `## Treinamentos ISPS Code Obrigatórios

O **ISPS Code** (International Ship and Port Facility Security Code) estabelece requisitos de segurança marítima.

### Níveis de Segurança
- **Nível 1**: Operações normais
- **Nível 2**: Risco elevado
- **Nível 3**: Ameaça iminente

### Treinamentos Obrigatórios
1. **Security Awareness** - Todos tripulantes
2. **Security Duties** - Pessoal com responsabilidades
3. **Ship Security Officer (SSO)** - Certificação específica
4. **Company Security Officer (CSO)** - Certificação em terra

### Drills ISPS
- Exercícios de busca
- Controle de acesso
- Resposta a ameaças
- Comunicação de segurança

📋 Frequência: Trimestral conforme Port State Control`,
        vencimentos: `## Certificados Expirando (Próximos 90 dias)

| Tripulante | Certificado | Validade | Status |
|------------|-------------|----------|--------|
| Maria Santos | Advanced Fire Fighting | 20/08/2024 | ⚠️ Expirando |
| Carlos Lima | Medical First Aid | 10/03/2024 | ⚠️ Expirando |
| Ana Costa | Survival Craft | 25/01/2024 | ❌ Expirado |

### Ações Recomendadas
1. Agendar reciclagem para Ana Costa (URGENTE)
2. Programar renovação para Maria e Carlos
3. Verificar disponibilidade de cursos credenciados

💡 **Dica IA**: Sugiro criar um plano de renovação escalonado para evitar gaps de certificação.`,
        default: `Posso ajudar com:

• **Procedimentos de Drills** - Incêndio, abandono, MOB, blackout
• **Requisitos SOLAS/ISM** - Frequências, documentação
• **Treinamentos ISPS** - Security awareness, SSO, CSO
• **Certificações STCW** - Validades, renovações
• **Relatórios** - Safety Drill Log, compliance reports

Por favor, especifique o que precisa ou pergunte diretamente!`,
      };
      
      const msgLower = userMsg.toLowerCase();
      const key = msgLower.includes("incêndio") || msgLower.includes("fogo") || msgLower.includes("fire") ? "incendio" 
        : msgLower.includes("abandon") ? "abandono"
          : msgLower.includes("isps") || msgLower.includes("security") || msgLower.includes("segurança") ? "isps"
            : msgLower.includes("venc") || msgLower.includes("certificado") || msgLower.includes("stcw") ? "vencimentos"
              : "default";
        
      setChatHistory(prev => [...prev, { role: "assistant", content: responses[key] }]);
      setIsLoading(false);
    }, 1500);
  });

  const filteredDrills = mockDrills.filter(drill => 
    !searchQuery || drill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overdueDrills = mockDrills.filter(d => d.status === "overdue").length;
  const dueDrills = mockDrills.filter(d => d.status === "due").length;
  const completedDrills = mockDrills.filter(d => d.status === "completed").length;
  const complianceRate = Math.round((completedDrills / mockDrills.length) * 100);

  const handleScheduleDrill = (drill: Drill) => {
    toast({
      title: "Agendar Drill",
      description: `Abrindo agendamento para ${drill.name}`,
    };
  };

  const handleStartDrill = (drill: Drill) => {
    toast({
      title: "Iniciar Drill",
      description: `Iniciando simulado: ${drill.name}`,
    };
  };

  const getDrillIcon = (type: string) => {
    switch (type) {
    case "fire": return <Flame className="h-5 w-5" />;
    case "abandon": return <LifeBuoy className="h-5 w-5" />;
    case "mob": return <Anchor className="h-5 w-5" />;
    case "isps": return <ShieldAlert className="h-5 w-5" />;
    default: return <Siren className="h-5 w-5" />;
    }
  };

  const getDrillColor = (type: string) => {
    switch (type) {
    case "fire": return "bg-red-500/10 text-red-600";
    case "abandon": return "bg-blue-500/10 text-blue-600";
    case "mob": return "bg-cyan-500/10 text-cyan-600";
    case "isps": return "bg-purple-500/10 text-purple-600";
    default: return "bg-amber-500/10 text-amber-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary bg-gradient-to-br from-background to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformidade SOLAS</p>
                <p className="text-2xl font-bold">{complianceRate}%</p>
                <Progress value={complianceRate} className="mt-2 h-1.5" />
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-background to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drills Concluídos</p>
                <p className="text-2xl font-bold">{completedDrills}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  Este trimestre
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-background to-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drills Pendentes</p>
                <p className="text-2xl font-bold">{dueDrills}</p>
                <p className="text-xs text-amber-600 mt-1">Agendar</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Calendar className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-background to-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drills Atrasados</p>
                <p className="text-2xl font-bold">{overdueDrills}</p>
                <p className="text-xs text-red-600 mt-1">Ação urgente</p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-background to-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certs Expirando</p>
                <p className="text-2xl font-bold">4</p>
                <p className="text-xs text-purple-600 mt-1">Próximos 90 dias</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant + Drills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Training Assistant */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-purple-500/5 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-orange-500" />
              Assistente IA SOLAS/ISPS
              <Badge variant="secondary" className="ml-auto bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                LLM
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 mb-4 p-3 bg-background/50 rounded-lg border">
              <div className="space-y-3">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[90%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                      <Activity className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">Analisando...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Pergunte sobre drills, SOLAS, ISPS..."
                value={chatMessage}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
              />
              <Button size="icon" onClick={handleSendMessage} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                Incêndio
              </Button>
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                ISPS
              </Button>
              <Button variant="outline" size="sm" onClick={handleSetChatMessage}>
                Certificados
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Calendário
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600">
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Drill
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredDrills.map((drill) => (
                  <div key={drill.id} className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    drill.status === "overdue" ? "bg-red-500/10 border-red-500/30" :
                      drill.status === "due" ? "bg-amber-500/10 border-amber-500/30" :
                        "bg-muted/30 border-border"
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getDrillColor(drill.type)}`}>
                          {getDrillIcon(drill.type)}
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
                      <div className="flex gap-2">
                        {drill.status !== "completed" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handlehandleScheduleDrill}>
                              Agendar
                            </Button>
                            <Button size="sm" variant="default" onClick={() => handlehandleStartDrill}>
                              <Play className="h-3 w-3 mr-1" />
                              Iniciar
                            </Button>
                          </>
                        )}
                        {drill.status === "completed" && (
                          <Button variant="outline" size="sm">
                            <FileText className="h-3 w-3 mr-1" />
                            Relatório
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
