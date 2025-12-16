/**
 * DP Copilot - AI-powered assistant for Dynamic Positioning operations
 * PATCH 549 - Advanced Maritime Intelligence
 */

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Send,
  Loader2,
  Mic,
  MicOff,
  AlertTriangle,
  Lightbulb,
  Anchor,
  Compass,
  Wind,
  Waves,
  Zap,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "alert" | "recommendation" | "asog";
}

interface ASOGStatus {
  level: "green" | "yellow" | "red";
  category: string;
  description: string;
  recommendations: string[];
}

const ASOG_SCENARIOS: ASOGStatus[] = [
  {
    level: "green",
    category: "Operação Normal",
    description: "Todos os sistemas DP operando dentro dos parâmetros normais",
    recommendations: ["Manter monitoramento padrão", "Registrar leituras de horímetro"]
  },
  {
    level: "yellow",
    category: "Alerta Operacional",
    description: "Desvio detectado em um ou mais sistemas - investigação recomendada",
    recommendations: [
      "Verificar redundância dos thrusters",
      "Confirmar posição com referências alternativas",
      "Notificar supervisor de operações",
      "Preparar procedimento de emergência"
    ]
  },
  {
    level: "red",
    category: "Condição Crítica",
    description: "Falha significativa detectada - ação imediata necessária",
    recommendations: [
      "Iniciar procedimento de contingência DP",
      "Ativar sistema de backup",
      "Comunicar bridge e todas as estações",
      "Preparar para desconexão de emergência se necessário",
      "Registrar todos os eventos em log"
    ]
  }
];

export default function DPCopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou o Copilot DP, seu assistente especializado em operações de Posicionamento Dinâmico. Posso ajudar com:\n\n• Diagnóstico de falhas e alarmes\n• Interpretação de ASOG/WSOG\n• Procedimentos NORMAM-101 e IMCA M 117\n• Análise de condições ambientais\n• Recomendações de manutenção\n\nComo posso ajudar?",
      timestamp: new Date(),
      type: "text"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentASOG, setCurrentASOG] = useState<ASOGStatus>(ASOG_SCENARIOS[0]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "pt-BR";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({ title: "Reconhecimento de voz não suportado", variant: "destructive" });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke("mmi-advanced-copilot", {
        body: {
          message: input,
          context: {
            module: "PEO-DP",
            specialization: "Dynamic Positioning",
            regulations: ["NORMAM-101", "IMCA M 117", "ASOG", "WSOG"],
            currentASOG: currentASOG
          },
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data?.response || "Desculpe, não consegui processar sua solicitação.",
        timestamp: new Date(),
        type: detectMessageType(input)
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Simulate ASOG change based on keywords
      if (input.toLowerCase().includes("falha") || input.toLowerCase().includes("alarme")) {
        simulateASOGChange("yellow");
      } else if (input.toLowerCase().includes("emergência") || input.toLowerCase().includes("crítico")) {
        simulateASOGChange("red");
      }

    } catch (error) {
      console.error("Copilot error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateLocalResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const detectMessageType = (text: string): Message["type"] => {
    const lower = text.toLowerCase();
    if (lower.includes("asog") || lower.includes("wsog")) return "asog";
    if (lower.includes("alerta") || lower.includes("alarme")) return "alert";
    if (lower.includes("recomend") || lower.includes("sugest")) return "recommendation";
    return "text";
  };

  const generateLocalResponse = (query: string): string => {
    const lower = query.toLowerCase();
    
    if (lower.includes("asog") || lower.includes("wsog")) {
      return `**ASOG (Activity Specific Operating Guidelines)** e **WSOG (Well Specific Operating Guidelines)** são documentos críticos para operações DP.

📋 **Status Atual ASOG**: ${currentASOG.category}
${currentASOG.description}

**Recomendações:**
${currentASOG.recommendations.map(r => `• ${r}`).join("\n")}

O ASOG define:
• Limites ambientais (vento, corrente, ondas)
• Configuração mínima de equipamentos
• Critérios de alerta e ação
• Procedimentos de contingência`;
    }

    if (lower.includes("thruster") || lower.includes("propulsor")) {
      return `**Diagnóstico de Thrusters**

Para análise de problemas em thrusters, verifique:

1. **Sinais de Alerta Comuns:**
   • Vibração excessiva
   • Temperatura elevada do motor
   • Queda de pressão hidráulica
   • Ruído anormal

2. **Ações Imediatas:**
   • Verificar leituras do VMS
   • Confirmar redundância disponível
   • Avaliar capability plot atual
   • Preparar thruster backup

3. **IMCA M 117 recomenda:**
   • Teste de funcionalidade antes de operações críticas
   • Registro de performance em log
   • Manutenção preventiva conforme fabricante`;
    }

    if (lower.includes("referência") || lower.includes("posição")) {
      return `**Sistemas de Referência de Posição DP**

Configuração típica para DP2/DP3:

📡 **Referências Principais:**
• DGPS (mínimo 2 sistemas independentes)
• HPR (Hydroacoustic Position Reference)
• Taut Wire (para águas rasas)
• Laser/Radar (para aproximação de plataformas)

⚠️ **NORMAM-101 exige:**
• Mínimo 3 sistemas de referência para DP3
• Redundância completa de sensores
• Comparação automática entre referências

**Melhor Prática:**
Sempre opere com pelo menos 2 referências ativas e 1 em standby.`;
    }

    return `Entendi sua pergunta sobre "${query}". 

Como Copilot DP, posso ajudar com:
• Interpretação de alarmes e diagnósticos
• Procedimentos NORMAM-101 e IMCA M 117
• Análise de ASOG/WSOG
• Configuração de sistemas de referência
• Manutenção preventiva de equipamentos DP

Por favor, forneça mais detalhes sobre a situação específica que está enfrentando.`;
  };

  const simulateASOGChange = (level: "green" | "yellow" | "red") => {
    const scenario = ASOG_SCENARIOS.find(s => s.level === level) || ASOG_SCENARIOS[0];
    setCurrentASOG(scenario);
    
    if (level !== "green") {
      toast({
        title: `ASOG: ${scenario.category}`,
        description: scenario.description,
        variant: level === "red" ? "destructive" : "default"
      });
    }
  };

  const quickActions = [
    { label: "Status ASOG", query: "Qual o status atual do ASOG?" },
    { label: "Verificar Thrusters", query: "Como verificar funcionamento dos thrusters?" },
    { label: "Referências DP", query: "Quais sistemas de referência de posição usar?" },
    { label: "Procedimento Alerta", query: "Procedimento para DP Alert Level 2?" }
  ];

  return (
    <div className="space-y-4">
      {/* ASOG Status Banner */}
      <Card className={`border-l-4 ${
        currentASOG.level === "green" ? "border-l-green-500 bg-green-500/5" :
        currentASOG.level === "yellow" ? "border-l-yellow-500 bg-yellow-500/5" :
        "border-l-red-500 bg-red-500/5"
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                currentASOG.level === "green" ? "bg-green-500/20" :
                currentASOG.level === "yellow" ? "bg-yellow-500/20" :
                "bg-red-500/20"
              }`}>
                {currentASOG.level === "green" ? <CheckCircle className="h-5 w-5 text-green-500" /> :
                 currentASOG.level === "yellow" ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> :
                 <XCircle className="h-5 w-5 text-red-500" />}
              </div>
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  ASOG Status: {currentASOG.category}
                  <Badge variant={currentASOG.level === "green" ? "outline" : currentASOG.level === "yellow" ? "secondary" : "destructive"}>
                    {currentASOG.level.toUpperCase()}
                  </Badge>
                </h4>
                <p className="text-sm text-muted-foreground">{currentASOG.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => simulateASOGChange("green")}>
                <CheckCircle className="h-4 w-4 mr-1" /> Normal
              </Button>
              <Button variant="outline" size="sm" onClick={() => simulateASOGChange("yellow")}>
                <AlertTriangle className="h-4 w-4 mr-1" /> Alerta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chat Area */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Copilot DP
              <Badge variant="outline" className="ml-2">NORMAM-101 • IMCA M 117</Badge>
            </CardTitle>
            <CardDescription>
              Assistente especializado em Posicionamento Dinâmico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <ScrollArea className="h-[350px] pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(action.query);
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Pergunte sobre DP, ASOG, procedimentos..."
                className="min-h-[44px] max-h-[120px]"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Referência Rápida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted">
                <h5 className="font-medium flex items-center gap-2 mb-2">
                  <Compass className="h-4 w-4" /> Classes DP
                </h5>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li><strong>DP1:</strong> Sem redundância</li>
                  <li><strong>DP2:</strong> Redundância parcial</li>
                  <li><strong>DP3:</strong> Redundância total</li>
                </ul>
              </div>
              
              <div className="p-3 rounded-lg bg-muted">
                <h5 className="font-medium flex items-center gap-2 mb-2">
                  <Wind className="h-4 w-4" /> Limites Ambientais
                </h5>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>Vento: Conforme ASOG</li>
                  <li>Corrente: Max. 2.5 kts típico</li>
                  <li>Ondas: Hs conforme capability</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <h5 className="font-medium flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4" /> Alert Levels
                </h5>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li><strong>AL1:</strong> Desvio menor</li>
                  <li><strong>AL2:</strong> Degradação sistema</li>
                  <li><strong>AL3:</strong> Emergência</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Baseado em NORMAM-101 (DPC) e IMCA M 117 Rev. 1
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
