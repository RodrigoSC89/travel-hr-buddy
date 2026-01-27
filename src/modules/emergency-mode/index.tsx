/**
 * MODO EMERGÊNCIA COM IA DE CRISE - PATCH 874
 * Interface especial ativada em incidentes com protocolos assistidos por IA
 * Full type-safety
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertOctagon,
  Phone,
  Radio,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  Circle,
  Flame,
  Waves,
  Ship,
  AlertTriangle,
  Brain,
  Mic,
  Volume2,
  Send,
  FileText,
  Shield,
  Heart,
  Anchor,
  Navigation,
  Loader2,
  Play,
  Pause,
  SkipForward,
  XCircle
} from "lucide-react";

type EmergencyType = "fire" | "collision" | "man_overboard" | "medical" | "flooding" | "grounding" | "piracy" | "abandon_ship" | "other";

interface EmergencyProtocol {
  id: string;
  title: string;
  steps: ProtocolStep[];
  contacts: EmergencyContact[];
  aiGuidance: string[];
}

interface ProtocolStep {
  id: string;
  order: number;
  title: string;
  description: string;
  responsible: string;
  timeLimit?: string;
  completed: boolean;
  critical: boolean;
}

interface EmergencyContact {
  name: string;
  role: string;
  phone: string;
  priority: number;
}

interface AIMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

const emergencyProtocols: Record<EmergencyType, EmergencyProtocol> = {
  fire: {
    id: "fire",
    title: "Incêndio a Bordo",
    steps: [
      { id: "f1", order: 1, title: "Acionar alarme geral", description: "Ativar sistema de alarme de incêndio", responsible: "Oficial de Serviço", timeLimit: "30s", completed: false, critical: true },
      { id: "f2", order: 2, title: "Identificar localização", description: "Confirmar área afetada pelo incêndio", responsible: "Equipe de Segurança", timeLimit: "1min", completed: false, critical: true },
      { id: "f3", order: 3, title: "Isolar área", description: "Fechar portas estanques e ventilação", responsible: "Equipe de Controle", timeLimit: "2min", completed: false, critical: true },
      { id: "f4", order: 4, title: "Combate inicial", description: "Iniciar combate com extintores apropriados", responsible: "Brigada de Incêndio", timeLimit: "3min", completed: false, critical: false },
      { id: "f5", order: 5, title: "Evacuação se necessário", description: "Preparar pontos de reunião", responsible: "Comandante", completed: false, critical: false },
    ],
    contacts: [
      { name: "Comandante", role: "Autoridade Máxima", phone: "VHF Ch.16", priority: 1 },
      { name: "MRCC", role: "Centro de Salvamento", phone: "+55 21 2104-6699", priority: 2 },
    ],
    aiGuidance: [
      "Priorize a segurança da tripulação sobre combate ao incêndio",
      "Verifique o tipo de material em combustão antes de escolher extintor",
    ],
  },
  collision: {
    id: "collision",
    title: "Colisão",
    steps: [
      { id: "c1", order: 1, title: "Parar máquinas", description: "Cessar propulsão imediatamente", responsible: "Comandante", timeLimit: "30s", completed: false, critical: true },
      { id: "c2", order: 2, title: "Avaliar danos", description: "Inspeção rápida do casco", responsible: "Chefe de Máquinas", timeLimit: "5min", completed: false, critical: true },
      { id: "c3", order: 3, title: "Verificar alagamento", description: "Checar compartimentos estanques", responsible: "Equipe de Segurança", timeLimit: "3min", completed: false, critical: true },
    ],
    contacts: [
      { name: "MRCC", role: "Centro de Salvamento", phone: "+55 21 2104-6699", priority: 1 },
    ],
    aiGuidance: ["Documente todas as comunicações com a outra embarcação"],
  },
  man_overboard: {
    id: "man_overboard",
    title: "Homem ao Mar",
    steps: [
      { id: "m1", order: 1, title: "Gritar 'Homem ao Mar'", description: "Alertar toda a tripulação", responsible: "Qualquer tripulante", timeLimit: "Imediato", completed: false, critical: true },
      { id: "m2", order: 2, title: "Lançar boia", description: "Jogar boia com luz na direção da vítima", responsible: "Observador", timeLimit: "10s", completed: false, critical: true },
      { id: "m3", order: 3, title: "Manter visual", description: "Designar observador dedicado", responsible: "Oficial de Serviço", completed: false, critical: true },
      { id: "m4", order: 4, title: "Manobra de resgate", description: "Executar manobra Williamson ou Anderson", responsible: "Comandante", completed: false, critical: true },
    ],
    contacts: [
      { name: "MRCC", role: "Centro de Salvamento", phone: "+55 21 2104-6699", priority: 1 },
    ],
    aiGuidance: ["Tempo é crítico - hipotermia pode ocorrer em minutos"],
  },
  medical: {
    id: "medical",
    title: "Emergência Médica",
    steps: [
      { id: "med1", order: 1, title: "Avaliar vítima", description: "Verificar sinais vitais", responsible: "Oficial Médico", timeLimit: "1min", completed: false, critical: true },
      { id: "med2", order: 2, title: "Primeiros socorros", description: "Aplicar procedimentos de emergência", responsible: "Oficial Médico", completed: false, critical: true },
      { id: "med3", order: 3, title: "Contatar TMAS", description: "Assistência Médica Marítima", responsible: "Comandante", completed: false, critical: false },
    ],
    contacts: [
      { name: "TMAS Brasil", role: "Telemedicina", phone: "+55 21 2104-6699", priority: 1 },
    ],
    aiGuidance: ["Documente todos os sintomas e medicações administradas"],
  },
  flooding: {
    id: "flooding",
    title: "Alagamento",
    steps: [
      { id: "fl1", order: 1, title: "Identificar origem", description: "Localizar ponto de entrada de água", responsible: "Chefe de Máquinas", timeLimit: "2min", completed: false, critical: true },
      { id: "fl2", order: 2, title: "Fechar válvulas", description: "Isolar sistema afetado", responsible: "Equipe de Máquinas", completed: false, critical: true },
      { id: "fl3", order: 3, title: "Acionar bombas", description: "Iniciar esgotamento", responsible: "Sala de Controle", completed: false, critical: true },
    ],
    contacts: [
      { name: "MRCC", role: "Centro de Salvamento", phone: "+55 21 2104-6699", priority: 1 },
    ],
    aiGuidance: ["Monitore estabilidade da embarcação continuamente"],
  },
  grounding: {
    id: "grounding",
    title: "Encalhe",
    steps: [
      { id: "g1", order: 1, title: "Parar máquinas", description: "Evitar danos adicionais", responsible: "Comandante", timeLimit: "Imediato", completed: false, critical: true },
      { id: "g2", order: 2, title: "Avaliar condição", description: "Verificar integridade do casco", responsible: "Chefe de Máquinas", completed: false, critical: true },
    ],
    contacts: [
      { name: "MRCC", role: "Centro de Salvamento", phone: "+55 21 2104-6699", priority: 1 },
    ],
    aiGuidance: ["Não tente desencalhar sem avaliar danos"],
  },
  piracy: {
    id: "piracy",
    title: "Pirataria",
    steps: [
      { id: "p1", order: 1, title: "Ativar citadela", description: "Reunir tripulação em área segura", responsible: "Comandante", completed: false, critical: true },
      { id: "p2", order: 2, title: "Enviar alerta SSAS", description: "Ativar sistema de segurança", responsible: "Oficial de Comunicações", completed: false, critical: true },
    ],
    contacts: [
      { name: "MRCC", role: "Centro de Salvamento", phone: "+55 21 2104-6699", priority: 1 },
      { name: "Marinha", role: "Forças Armadas", phone: "VHF Ch.16", priority: 2 },
    ],
    aiGuidance: ["Não confronte os invasores diretamente"],
  },
  abandon_ship: {
    id: "abandon_ship",
    title: "Abandono de Embarcação",
    steps: [
      { id: "a1", order: 1, title: "Ordem de abandono", description: "7 toques curtos + 1 longo", responsible: "Comandante", completed: false, critical: true },
      { id: "a2", order: 2, title: "Reunir em pontos", description: "Tripulação nos pontos designados", responsible: "Oficiais", completed: false, critical: true },
      { id: "a3", order: 3, title: "Preparar balsas", description: "Lançar embarcações de sobrevivência", responsible: "Equipe de Convés", completed: false, critical: true },
    ],
    contacts: [
      { name: "MRCC", role: "Centro de Salvamento", phone: "+55 21 2104-6699", priority: 1 },
    ],
    aiGuidance: ["Leve rádio EPIRB e água potável"],
  },
  other: {
    id: "other",
    title: "Outra Emergência",
    steps: [
      { id: "o1", order: 1, title: "Avaliar situação", description: "Identificar natureza da emergência", responsible: "Comandante", completed: false, critical: true },
      { id: "o2", order: 2, title: "Acionar protocolo", description: "Selecionar procedimento apropriado", responsible: "Oficial de Serviço", completed: false, critical: false },
    ],
    contacts: [
      { name: "MRCC", role: "Centro de Salvamento", phone: "+55 21 2104-6699", priority: 1 },
    ],
    aiGuidance: ["Documente todos os eventos"],
  },
};

const emergencyIcons: Record<EmergencyType, React.ReactNode> = {
  fire: <Flame className="h-6 w-6" />,
  collision: <Ship className="h-6 w-6" />,
  man_overboard: <Users className="h-6 w-6" />,
  medical: <Heart className="h-6 w-6" />,
  flooding: <Waves className="h-6 w-6" />,
  grounding: <Anchor className="h-6 w-6" />,
  piracy: <Shield className="h-6 w-6" />,
  abandon_ship: <Navigation className="h-6 w-6" />,
  other: <AlertTriangle className="h-6 w-6" />,
};

export default function EmergencyMode() {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencyType, setEmergencyType] = useState<EmergencyType | null>(null);
  const [protocol, setProtocol] = useState<EmergencyProtocol | null>(null);
  const [steps, setSteps] = useState<ProtocolStep[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { toast } = useToast();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isEmergencyActive && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isEmergencyActive, isPaused]);

  const activateEmergency = (type: EmergencyType) => {
    const selectedProtocol = emergencyProtocols[type];
    setEmergencyType(type);
    setProtocol(selectedProtocol);
    setSteps(selectedProtocol.steps.map(s => ({ ...s, completed: false })));
    setIsEmergencyActive(true);
    setElapsedTime(0);
    setAiMessages([
      {
        role: "assistant",
        content: `Emergência ${selectedProtocol.title} ativada. ${selectedProtocol.aiGuidance[0] || "Siga o protocolo cuidadosamente."}`,
        timestamp: new Date(),
      },
    ]);
    
    toast({
      title: "⚠️ EMERGÊNCIA ATIVADA",
      description: selectedProtocol.title,
      variant: "destructive",
    });
  };

  const deactivateEmergency = () => {
    setIsEmergencyActive(false);
    setEmergencyType(null);
    setProtocol(null);
    setSteps([]);
    setElapsedTime(0);
    setAiMessages([]);
    
    toast({
      title: "Emergência encerrada",
      description: "Protocolo concluído",
    });
  };

  const toggleStepComplete = (stepId: string) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, completed: !s.completed } : s
    ));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAiChat = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage: AIMessage = {
      role: "user",
      content: aiInput,
      timestamp: new Date(),
    };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput("");
    setIsAiProcessing(true);

    try {
      const response = await supabase.functions.invoke("ai-emergency-assistant", {
        body: {
          emergencyType,
          protocol,
          steps,
          question: aiInput,
          elapsedTime,
        }
      });

      const aiResponse: AIMessage = {
        role: "assistant",
        content: response.data?.answer || getDefaultAIResponse(aiInput),
        timestamp: new Date(),
      };
      setAiMessages(prev => [...prev, aiResponse]);
    } catch {
      const fallbackResponse: AIMessage = {
        role: "assistant",
        content: getDefaultAIResponse(aiInput),
        timestamp: new Date(),
      };
      setAiMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const getDefaultAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("próximo") || lowerQuestion.includes("proximo")) {
      const nextStep = steps.find(s => !s.completed);
      return nextStep 
        ? `A próxima etapa é: "${nextStep.title}"\n\n${nextStep.description}\n\nResponsável: ${nextStep.responsible}${nextStep.timeLimit ? `\nTempo limite: ${nextStep.timeLimit}` : ""}`
        : "Todas as etapas do protocolo foram concluídas!";
    }
    
    if (lowerQuestion.includes("contato") || lowerQuestion.includes("telefone")) {
      if (protocol?.contacts) {
        return protocol.contacts.map(c => `${c.name} (${c.role}): ${c.phone}`).join("\n");
      }
    }
    
    return "Estou aqui para ajudar. Continue seguindo o protocolo de emergência estabelecido.";
  };

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  if (!isEmergencyActive) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-destructive">
            <CardHeader className="bg-destructive/10">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertOctagon className="h-6 w-6" />
                Modo Emergência
              </CardTitle>
              <CardDescription>
                Selecione o tipo de emergência para ativar o protocolo correspondente
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.keys(emergencyProtocols) as EmergencyType[]).map(type => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-24 flex flex-col gap-2 hover:bg-destructive/10 hover:border-destructive"
                    onClick={() => activateEmergency(type)}
                  >
                    {emergencyIcons[type]}
                    <span className="text-sm">{emergencyProtocols[type].title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-destructive/5 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-destructive"
                >
                  {emergencyType && emergencyIcons[emergencyType]}
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-destructive">
                    {protocol?.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tempo decorrido: {formatTime(elapsedTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deactivateEmergency}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Encerrar
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span>{completedSteps}/{steps.length} etapas</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Protocol Steps */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Protocolo de Emergência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all ${
                            step.completed 
                              ? "bg-success/10 border-success" 
                              : step.critical 
                                ? "border-destructive" 
                                : ""
                          }`}
                          onClick={() => toggleStepComplete(step.id)}
                        >
                          <CardContent className="py-3">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {step.completed ? (
                                  <CheckCircle className="h-5 w-5 text-success" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {step.order}. {step.title}
                                  </span>
                                  {step.critical && (
                                    <Badge variant="destructive">Crítico</Badge>
                                  )}
                                  {step.timeLimit && (
                                    <Badge variant="outline">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {step.timeLimit}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {step.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Responsável: {step.responsible}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant & Contacts */}
          <div className="space-y-4">
            {/* AI Chat */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4" />
                  Assistente de Crise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px] mb-3">
                  <div className="space-y-2">
                    {aiMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded text-sm ${
                          msg.role === "assistant"
                            ? "bg-muted"
                            : "bg-primary/10 ml-4"
                        }`}
                      >
                        {msg.content}
                      </div>
                    ))}
                    {isAiProcessing && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando...
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Pergunte ao assistente..."
                    onKeyDown={(e) => e.key === "Enter" && handleAiChat()}
                  />
                  <Button size="icon" onClick={handleAiChat} disabled={isAiProcessing}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  Contatos de Emergência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {protocol?.contacts.map((contact, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.role}</p>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-primary hover:underline text-sm"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
