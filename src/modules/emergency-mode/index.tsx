/**
 * MODO EMERGÊNCIA COM IA DE CRISE
 * Interface especial ativada em incidentes com protocolos assistidos por IA
 * Melhoria Lovable #13
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
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";
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
      { id: "1", order: 1, title: "Alarme Geral", description: "Acionar alarme de incêndio e anunciar localização", responsible: "Oficial de Serviço", timeLimit: "30 seg", completed: false, critical: true },
      { id: "2", order: 2, title: "Isolar Área", description: "Fechar portas corta-fogo e isolar ventilação", responsible: "Equipe de Emergência", timeLimit: "2 min", completed: false, critical: true },
      { id: "3", order: 3, title: "Combate ao Fogo", description: "Iniciar combate com extintores apropriados", responsible: "Brigada de Incêndio", timeLimit: "5 min", completed: false, critical: true },
      { id: "4", order: 4, title: "Evacuação", description: "Evacuar área afetada se necessário", responsible: "Oficial de Segurança", completed: false, critical: false },
      { id: "5", order: 5, title: "Comunicar MRCC", description: "Notificar Centro de Coordenação de Salvamento", responsible: "Comandante", timeLimit: "15 min", completed: false, critical: true },
      { id: "6", order: 6, title: "Verificar Vítimas", description: "Contabilizar tripulação e verificar feridos", responsible: "Médico de Bordo", completed: false, critical: true },
    ],
    contacts: [
      { name: "MRCC Brasil", role: "Centro de Salvamento", phone: "+55 21 2104-6767", priority: 1 },
      { name: "Armador - Emergência", role: "Suporte Terra", phone: "+55 11 99999-0000", priority: 2 },
      { name: "P&I Club", role: "Seguro Marítimo", phone: "+44 20 7234 0000", priority: 3 },
    ],
    aiGuidance: [
      "Identifique a classe do incêndio antes de escolher o agente extintor",
      "Mantenha comunicação constante com a ponte de comando",
      "Documente todas as ações com timestamps para relatório posterior",
    ],
  },
  collision: {
    id: "collision",
    title: "Colisão",
    steps: [
      { id: "1", order: 1, title: "Avaliar Danos", description: "Verificar estabilidade e integridade do casco", responsible: "Imediato", timeLimit: "2 min", completed: false, critical: true },
      { id: "2", order: 2, title: "Controle de Avarias", description: "Iniciar procedimentos de controle de alagamento", responsible: "Equipe de Emergência", completed: false, critical: true },
      { id: "3", order: 3, title: "Registrar Posição", description: "Anotar coordenadas, hora e condições", responsible: "Oficial de Navegação", timeLimit: "5 min", completed: false, critical: true },
      { id: "4", order: 4, title: "Comunicar MRCC", description: "Notificar autoridades e outra embarcação", responsible: "Comandante", completed: false, critical: true },
      { id: "5", order: 5, title: "Assistência a Vítimas", description: "Prestar socorro se houver feridos", responsible: "Médico de Bordo", completed: false, critical: true },
    ],
    contacts: [
      { name: "MRCC Brasil", role: "Centro de Salvamento", phone: "+55 21 2104-6767", priority: 1 },
      { name: "Armador - Emergência", role: "Suporte Terra", phone: "+55 11 99999-0000", priority: 2 },
    ],
    aiGuidance: [
      "Documente a outra embarcação envolvida (nome, bandeira, IMO)",
      "Tire fotos dos danos quando seguro",
      "Não admita culpa - registre apenas fatos objetivos",
    ],
  },
  man_overboard: {
    id: "man_overboard",
    title: "Homem ao Mar",
    steps: [
      { id: "1", order: 1, title: "Alarme MOB", description: "Gritar 'HOMEM AO MAR' e apontar para a pessoa", responsible: "Observador", timeLimit: "Imediato", completed: false, critical: true },
      { id: "2", order: 2, title: "Marcar Posição", description: "Acionar MOB no GPS e lançar boia", responsible: "Ponte de Comando", timeLimit: "30 seg", completed: false, critical: true },
      { id: "3", order: 3, title: "Manobra de Resgate", description: "Executar manobra Williamson ou equivalente", responsible: "Comandante", completed: false, critical: true },
      { id: "4", order: 4, title: "Preparar Resgate", description: "Preparar embarcação de resgate e equipamentos", responsible: "Equipe de Convés", completed: false, critical: true },
      { id: "5", order: 5, title: "Comunicar MRCC", description: "Notificar Centro de Salvamento se necessário", responsible: "Oficial de Comunicações", completed: false, critical: false },
    ],
    contacts: [
      { name: "MRCC Brasil", role: "Centro de Salvamento", phone: "+55 21 2104-6767", priority: 1 },
    ],
    aiGuidance: [
      "Tempo crítico: hipotermia pode ocorrer em 15-30 minutos em águas frias",
      "Manter contato visual é prioridade absoluta",
      "Considerar condições de mar e corrente na manobra de aproximação",
    ],
  },
  medical: {
    id: "medical",
    title: "Emergência Médica",
    steps: [
      { id: "1", order: 1, title: "Avaliar Vítima", description: "Verificar sinais vitais e nível de consciência", responsible: "Médico/Enfermeiro", timeLimit: "1 min", completed: false, critical: true },
      { id: "2", order: 2, title: "Primeiros Socorros", description: "Iniciar procedimentos de emergência", responsible: "Equipe Médica", completed: false, critical: true },
      { id: "3", order: 3, title: "Contatar TMAS", description: "Consultar Serviço de Assistência Médica", responsible: "Oficial de Comunicações", timeLimit: "10 min", completed: false, critical: true },
      { id: "4", order: 4, title: "Documentar", description: "Registrar sintomas, medicamentos e evolução", responsible: "Médico de Bordo", completed: false, critical: false },
      { id: "5", order: 5, title: "Evacuar se Necessário", description: "Preparar evacuação médica se recomendado", responsible: "Comandante", completed: false, critical: false },
    ],
    contacts: [
      { name: "TMAS Brasil", role: "Assistência Médica", phone: "+55 21 3323-3399", priority: 1 },
      { name: "MRCC Brasil", role: "Evacuação Médica", phone: "+55 21 2104-6767", priority: 2 },
    ],
    aiGuidance: [
      "Mantenha a calma e comunique-se claramente com a vítima",
      "Prepare histórico médico do paciente para consulta TMAS",
      "Verifique medicamentos disponíveis no kit médico do navio",
    ],
  },
  flooding: {
    id: "flooding",
    title: "Alagamento",
    steps: [
      { id: "1", order: 1, title: "Localizar Origem", description: "Identificar ponto de entrada de água", responsible: "Oficial de Máquinas", timeLimit: "5 min", completed: false, critical: true },
      { id: "2", order: 2, title: "Acionar Bombas", description: "Ligar bombas de esgoto e lastro", responsible: "Sala de Máquinas", timeLimit: "2 min", completed: false, critical: true },
      { id: "3", order: 3, title: "Controle de Avarias", description: "Aplicar medidas de contenção (batoque, cimento)", responsible: "Equipe de Emergência", completed: false, critical: true },
      { id: "4", order: 4, title: "Avaliar Estabilidade", description: "Calcular efeito na estabilidade do navio", responsible: "Imediato", completed: false, critical: true },
      { id: "5", order: 5, title: "Comunicar Situação", description: "Notificar MRCC e armador", responsible: "Comandante", completed: false, critical: true },
    ],
    contacts: [
      { name: "MRCC Brasil", role: "Centro de Salvamento", phone: "+55 21 2104-6767", priority: 1 },
      { name: "Armador - Emergência", role: "Suporte Técnico", phone: "+55 11 99999-0000", priority: 2 },
    ],
    aiGuidance: [
      "Priorize compartimentos críticos (praça de máquinas, tanques de combustível)",
      "Monitore continuamente nível de água e banda do navio",
      "Prepare plano de evacuação caso situação deteriore",
    ],
  },
  grounding: {
    id: "grounding",
    title: "Encalhe",
    steps: [
      { id: "1", order: 1, title: "Parar Máquinas", description: "Desligar propulsão para evitar danos adicionais", responsible: "Ponte de Comando", timeLimit: "Imediato", completed: false, critical: true },
      { id: "2", order: 2, title: "Verificar Integridade", description: "Inspecionar casco e tanques", responsible: "Imediato", completed: false, critical: true },
      { id: "3", order: 3, title: "Registrar Posição", description: "Anotar coordenadas, maré e condições", responsible: "Oficial de Navegação", completed: false, critical: true },
      { id: "4", order: 4, title: "Notificar Autoridades", description: "Comunicar MRCC, armador e P&I", responsible: "Comandante", timeLimit: "15 min", completed: false, critical: true },
      { id: "5", order: 5, title: "Plano de Desencalhe", description: "Avaliar opções com apoio de rebocadores", responsible: "Comandante", completed: false, critical: false },
    ],
    contacts: [
      { name: "MRCC Brasil", role: "Centro de Salvamento", phone: "+55 21 2104-6767", priority: 1 },
      { name: "Praticagem Local", role: "Assistência Técnica", phone: "VHF Canal 16", priority: 2 },
    ],
    aiGuidance: [
      "Não tente sair por conta própria - pode causar danos adicionais",
      "Aguarde análise de maré e condições para desencalhe",
      "Documente condições do fundo (areia, lama, rocha)",
    ],
  },
  piracy: {
    id: "piracy",
    title: "Pirataria/Ataque",
    steps: [
      { id: "1", order: 1, title: "Alerta Silencioso", description: "Acionar SSAS (Ship Security Alert System)", responsible: "Comandante", timeLimit: "Imediato", completed: false, critical: true },
      { id: "2", order: 2, title: "Citadela", description: "Reunir tripulação em área segura", responsible: "Oficial de Segurança", timeLimit: "5 min", completed: false, critical: true },
      { id: "3", order: 3, title: "Comunicação", description: "Contatar autoridades navais e armador", responsible: "Oficial de Comunicações", completed: false, critical: true },
      { id: "4", order: 4, title: "Registrar Invasores", description: "Documentar número, aparência e armamento", responsible: "Qualquer Observador", completed: false, critical: false },
      { id: "5", order: 5, title: "Não Resistir", description: "Evitar confronto físico - prioridade é a vida", responsible: "Toda Tripulação", completed: false, critical: true },
    ],
    contacts: [
      { name: "UKMTO", role: "UK Maritime Trade Operations", phone: "+44 2392 222060", priority: 1 },
      { name: "Armador - Segurança", role: "Crisis Management", phone: "+55 11 99999-0000", priority: 2 },
    ],
    aiGuidance: [
      "A segurança da tripulação é prioridade absoluta",
      "Mantenha comunicação discreta se possível",
      "Siga orientações do armador e forças navais",
    ],
  },
  abandon_ship: {
    id: "abandon_ship",
    title: "Abandono do Navio",
    steps: [
      { id: "1", order: 1, title: "Ordem de Abandono", description: "Comandante autoriza abandono oficial", responsible: "Comandante", completed: false, critical: true },
      { id: "2", order: 2, title: "Distribuir Coletes", description: "Garantir que todos usem coletes salva-vidas", responsible: "Oficiais de Seção", timeLimit: "2 min", completed: false, critical: true },
      { id: "3", order: 3, title: "Preparar Baleeiras", description: "Lançar embarcações de sobrevivência", responsible: "Equipe de Convés", completed: false, critical: true },
      { id: "4", order: 4, title: "Enviar MAYDAY", description: "Transmitir chamada de socorro em VHF Canal 16", responsible: "Oficial de Comunicações", completed: false, critical: true },
      { id: "5", order: 5, title: "Acionar EPIRB", description: "Ativar radiobaliza de emergência", responsible: "Comandante", completed: false, critical: true },
      { id: "6", order: 6, title: "Contagem Final", description: "Verificar que todos abandonaram o navio", responsible: "Imediato", completed: false, critical: true },
    ],
    contacts: [
      { name: "MRCC Brasil", role: "Coordenação SAR", phone: "VHF Canal 16", priority: 1 },
      { name: "Armador - Emergência", role: "Suporte Crise", phone: "+55 11 99999-0000", priority: 2 },
    ],
    aiGuidance: [
      "Abandono é ÚLTIMA opção - o navio é o melhor salva-vidas",
      "Leve EPIRB, SART e rádio VHF portátil para a baleeira",
      "Mantenha-se junto às embarcações de sobrevivência",
    ],
  },
  other: {
    id: "other",
    title: "Outra Emergência",
    steps: [
      { id: "1", order: 1, title: "Avaliar Situação", description: "Identificar natureza e gravidade da emergência", responsible: "Oficial de Serviço", completed: false, critical: true },
      { id: "2", order: 2, title: "Acionar Alarme", description: "Alertar tripulação conforme necessário", responsible: "Ponte de Comando", completed: false, critical: false },
      { id: "3", order: 3, title: "Consultar Procedimentos", description: "Verificar planos de emergência do navio", responsible: "Oficial de Segurança", completed: false, critical: false },
      { id: "4", order: 4, title: "Notificar Autoridades", description: "Comunicar se necessário", responsible: "Comandante", completed: false, critical: false },
    ],
    contacts: [
      { name: "MRCC Brasil", role: "Centro de Salvamento", phone: "+55 21 2104-6767", priority: 1 },
    ],
    aiGuidance: [
      "Adapte os procedimentos à situação específica",
      "Documente todas as ações tomadas",
      "Mantenha comunicação clara com toda a tripulação",
    ],
  },
};

const EmergencyMode = () => {
  const { toast } = useToast();
  const { getEmergencyGuidance, isLoading: aiLoading } = useNautilusEnhancementAI();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencyType, setEmergencyType] = useState<EmergencyType | null>(null);
  const [protocol, setProtocol] = useState<EmergencyProtocol | null>(null);
  const [steps, setSteps] = useState<ProtocolStep[]>([]);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [emergencyStartTime, setEmergencyStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [vesselInfo, setVesselInfo] = useState({ name: "MV Ocean Star", position: "23°55'S 046°20'W" });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isEmergencyActive && emergencyStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - emergencyStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isEmergencyActive, emergencyStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activateEmergency = (type: EmergencyType) => {
    const selectedProtocol = emergencyProtocols[type];
    setEmergencyType(type);
    setProtocol(selectedProtocol);
    setSteps(selectedProtocol.steps);
    setIsEmergencyActive(true);
    setEmergencyStartTime(new Date());
    setShowActivationDialog(false);
    
    // Initial AI message
    setAiMessages([{
      role: "assistant",
      content: `🚨 MODO EMERGÊNCIA ATIVADO: ${selectedProtocol.title}\n\nSou o assistente de crise do Nautilus. Estou aqui para guiar você pelos protocolos de emergência.\n\n${selectedProtocol.aiGuidance[0]}`,
      timestamp: new Date(),
    }]);

    toast({
      title: "EMERGÊNCIA ATIVADA",
      description: selectedProtocol.title,
      variant: "destructive",
    });
  };

  const completeStep = (stepId: string) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, completed: true } : s
    ));
    
    const step = steps.find(s => s.id === stepId);
    if (step) {
      setAiMessages(prev => [...prev, {
        role: "assistant",
        content: `✅ Etapa concluída: "${step.title}"\n\nTempo decorrido: ${formatTime(elapsedTime)}`,
        timestamp: new Date(),
      }]);
    }
  };

  const askAI = async () => {
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
    } catch (error) {
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
      return protocol?.contacts.map(c => `${c.name} (${c.role}): ${c.phone}`).join("\n") || "Nenhum contato disponível";
    }
    
    if (lowerQuestion.includes("status") || lowerQuestion.includes("resumo")) {
      const completed = steps.filter(s => s.completed).length;
      return `Status atual:\n• ${completed}/${steps.length} etapas concluídas\n• Tempo decorrido: ${formatTime(elapsedTime)}\n• ${steps.filter(s => s.critical && !s.completed).length} etapas críticas pendentes`;
    }
    
    return `Para emergências de ${protocol?.title}, mantenha a calma e siga o protocolo estabelecido. Posso ajudar com:\n• "próxima etapa" - ver próxima ação\n• "contatos" - listar números de emergência\n• "status" - resumo da situação`;
  };

  const deactivateEmergency = () => {
    setIsEmergencyActive(false);
    setEmergencyType(null);
    setProtocol(null);
    setSteps([]);
    setAiMessages([]);
    setEmergencyStartTime(null);
    setElapsedTime(0);
    toast({ title: "Emergência Encerrada", description: "Modo normal restaurado" });
  };

  const getProgressPercentage = () => {
    if (steps.length === 0) return 0;
    return (steps.filter(s => s.completed).length / steps.length) * 100;
  };

  const getEmergencyIcon = (type: EmergencyType) => {
    switch (type) {
      case "fire": return <Flame className="h-6 w-6" />;
      case "collision": return <Ship className="h-6 w-6" />;
      case "man_overboard": return <Users className="h-6 w-6" />;
      case "medical": return <Heart className="h-6 w-6" />;
      case "flooding": return <Waves className="h-6 w-6" />;
      case "grounding": return <Anchor className="h-6 w-6" />;
      case "piracy": return <Shield className="h-6 w-6" />;
      case "abandon_ship": return <Navigation className="h-6 w-6" />;
      default: return <AlertOctagon className="h-6 w-6" />;
    }
  };

  if (!isEmergencyActive) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <div className="text-center py-12">
            <div className="inline-flex p-6 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
              <AlertOctagon className="h-16 w-16 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Modo Emergência</h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Interface especial para gerenciamento de crises com protocolos assistidos por IA.
              Ative apenas em situações reais de emergência.
            </p>
            
            <Button 
              size="lg"
              variant="destructive"
              className="text-lg px-8 py-6"
              onClick={() => setShowActivationDialog(true)}
            >
              <AlertOctagon className="h-6 w-6 mr-2" />
              ATIVAR MODO EMERGÊNCIA
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {Object.entries(emergencyProtocols).slice(0, 8).map(([key, proto]) => (
              <Card key={key} className="text-center p-4 hover:border-red-300 transition-colors cursor-pointer"
                onClick={() => activateEmergency(key as EmergencyType)}>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600">
                    {getEmergencyIcon(key as EmergencyType)}
                  </div>
                  <span className="text-sm font-medium">{proto.title}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertOctagon className="h-5 w-5" />
                Confirmar Ativação de Emergência
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Selecione o tipo de emergência para ativar o protocolo correspondente:
              </p>
              <Select onValueChange={(v) => activateEmergency(v as EmergencyType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de emergência" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(emergencyProtocols).map(([key, proto]) => (
                    <SelectItem key={key} value={key}>{proto.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-950">
      {/* Emergency Header */}
      <div className="bg-red-600 text-white py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              {getEmergencyIcon(emergencyType!)}
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">{protocol?.title}</h1>
              <p className="text-red-100">{vesselInfo.name} • {vesselInfo.position}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold">{formatTime(elapsedTime)}</div>
              <div className="text-xs text-red-200">TEMPO DECORRIDO</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold">{steps.filter(s => s.completed).length}/{steps.length}</div>
              <div className="text-xs text-red-200">ETAPAS</div>
            </div>

            <Button variant="secondary" onClick={deactivateEmergency}>
              <XCircle className="h-4 w-4 mr-2" />
              Encerrar
            </Button>
          </div>
        </div>
        <Progress value={getProgressPercentage()} className="mt-4 h-2 bg-red-800" />
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Protocol Steps */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-red-900/50 border-red-800">
              <CardHeader>
                <CardTitle className="text-white">Protocolo de Ação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.map((step) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-lg border ${
                        step.completed 
                          ? "bg-green-900/50 border-green-700" 
                          : step.critical 
                            ? "bg-red-800/50 border-red-600" 
                            : "bg-red-900/30 border-red-800"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Button
                          size="sm"
                          variant={step.completed ? "default" : "outline"}
                          className={step.completed ? "bg-green-600" : ""}
                          onClick={() => !step.completed && completeStep(step.id)}
                          disabled={step.completed}
                        >
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${step.completed ? "text-green-400" : "text-white"}`}>
                              {step.order}. {step.title}
                            </span>
                            {step.critical && !step.completed && (
                              <Badge variant="destructive" className="text-xs">CRÍTICO</Badge>
                            )}
                            {step.timeLimit && !step.completed && (
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {step.timeLimit}
                              </Badge>
                            )}
                          </div>
                          <p className="text-red-200 text-sm mt-1">{step.description}</p>
                          <p className="text-red-300 text-xs mt-1">Responsável: {step.responsible}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="bg-red-900/50 border-red-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contatos de Emergência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {protocol?.contacts.map((contact, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-red-800/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{contact.name}</p>
                        <p className="text-sm text-red-300">{contact.role}</p>
                      </div>
                      <Button variant="secondary" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        {contact.phone}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant */}
          <div>
            <Card className="bg-red-900/50 border-red-800 h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Assistente de Crise IA
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 h-[400px] pr-4">
                  <div className="space-y-4">
                    {aiMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg ${
                          msg.role === "assistant"
                            ? "bg-purple-900/50 border border-purple-700"
                            : "bg-red-800/50 border border-red-700"
                        }`}
                      >
                        <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs text-red-300 mt-2">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                    {isAiProcessing && (
                      <div className="flex items-center gap-2 text-purple-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Processando...</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2 mt-4">
                  <Input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Pergunte à IA..."
                    className="bg-red-800/50 border-red-700 text-white placeholder:text-red-400"
                    onKeyDown={(e) => e.key === "Enter" && askAI()}
                  />
                  <Button onClick={askAI} disabled={isAiProcessing}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMode;
