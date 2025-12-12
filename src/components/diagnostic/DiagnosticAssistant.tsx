/**
import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
 * Technical Diagnostic Assistant - PHASE 4
 * IA dedicada para apoiar engenheiros de bordo na diagnose de falhas técnicas
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Wrench, 
  Send,
  Bot,
  User,
  AlertTriangle,
  CheckCircle,
  FileText,
  Loader2,
  Search,
  History,
  Lightbulb,
  BookOpen,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
  steps?: string[];
}

interface DiagnosticHistory {
  id: string;
  equipment: string;
  issue: string;
  resolution: string;
  date: Date;
}

const mockHistory: DiagnosticHistory[] = [
  {
    id: "1",
    equipment: "Gerador Principal #1",
    issue: "Código de alarme 032-A - Alta temperatura",
    resolution: "Limpeza do radiador e substituição do termostato",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: "2",
    equipment: "Bomba de Lastro #2",
    issue: "Falha de partida intermitente",
    resolution: "Substituição do contator de partida danificado",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  },
  {
    id: "3",
    equipment: "Sistema DP",
    issue: "Perda de posição durante operação",
    resolution: "Recalibração dos giroscópios e verificação de antenas GPS",
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
  }
];

const commonIssues = [
  { code: "032-A", equipment: "Gerador", description: "Alta temperatura do motor" },
  { code: "045-B", equipment: "Bomba", description: "Pressão de descarga baixa" },
  { code: "078-C", equipment: "Sistema Elétrico", description: "Sobrecarga no barramento" },
  { code: "091-D", equipment: "Compressor", description: "Vibração excessiva" },
];

export const DiagnosticAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou o Assistente de Diagnóstico Técnico do Nautilus One. Descreva o problema que está enfrentando, incluindo o código de alarme (se houver) e o equipamento afetado. Consultarei a documentação técnica e o histórico da embarcação para ajudá-lo.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateDiagnosticResponse = (query: string): Message => {
    const q = query.toLowerCase();
    
    let content = "";
    let sources: string[] = [];
    let steps: string[] = [];
    
    if (q.includes("032-a") || q.includes("temperatura") || q.includes("gerador")) {
      content = `## Diagnóstico: Código de Alarme 032-A - Alta Temperatura do Gerador

Baseado no histórico desta embarcação e na documentação técnica, identifiquei as seguintes verificações prioritárias:

### Causa Provável
O código 032-A indica temperatura acima do limiar operacional (geralmente >85°C). Em registros anteriores desta embarcação, este alarme foi resolvido com limpeza do sistema de arrefecimento.

### Verificações Recomendadas
1. **Nível do refrigerante** - Verificar se está no nível adequado
2. **Radiador** - Inspecionar por obstruções ou sujeira
3. **Termostato** - Testar abertura/fechamento correto
4. **Bomba d'água** - Verificar pressão e fluxo
5. **Correias** - Inspecionar tensão e desgaste

### Ação Imediata
Reduza a carga do gerador em 25% e monitore a temperatura. Se continuar acima de 80°C, recomendo desligar e realizar inspeção física.`;
      
      sources = [
        "Manual Técnico CAT C32 - Seção 4.3.2",
        "Histórico de Manutenção - Evento #1842",
        "Procedimento Operacional PO-ENG-042"
      ];
      
      steps = [
        "Verificar nível do refrigerante",
        "Inspecionar radiador",
        "Testar termostato",
        "Verificar bomba d'água",
        "Inspecionar correias"
      ];
    } else if (q.includes("bomba") || q.includes("pressão") || q.includes("lastro")) {
      content = `## Diagnóstico: Problema na Bomba de Lastro

### Análise Inicial
Com base na descrição, as causas mais comuns para falhas em bombas de lastro são:

1. **Filtro obstruído** - Verificar e limpar filtro de sucção
2. **Cavitação** - Checar nível do tanque de sucção
3. **Selo mecânico** - Inspecionar por vazamentos
4. **Motor elétrico** - Medir corrente e comparar com nominal

### Histórico Relevante
Esta embarcação teve 2 ocorrências similares nos últimos 6 meses, ambas resolvidas com limpeza de filtros.

### Recomendação
Iniciar pela verificação do filtro de sucção antes de procedimentos mais invasivos.`;
      
      sources = [
        "Manual IMO - SOPEP",
        "Histórico de Manutenção - Eventos #1756, #1689"
      ];
    } else if (q.includes("dp") || q.includes("posicionamento") || q.includes("gps")) {
      content = `## Diagnóstico: Sistema DP

### Análise do Sistema de Posicionamento Dinâmico

O sistema DP é crítico para operações offshore. Problemas comuns incluem:

1. **Referências de posição** - Verificar status de todos os sensores GPS/DGPS
2. **Giroscópios** - Checar drift e calibração
3. **Sensores de vento** - Verificar leituras e comparar com dados meteorológicos
4. **Thrusters** - Verificar resposta de todos os propulsores

### Procedimento de Verificação
- Executar teste de redundância
- Verificar alarmes ativos no sistema
- Comparar leituras dos diferentes sensores

### Atenção
Não realize operações críticas até que o sistema seja totalmente verificado e aprovado.`;
      
      sources = [
        "IMCA M 103 - Guidelines for DP",
        "Manual do Sistema Kongsberg K-POS"
      ];
    } else {
      content = `Obrigado pela descrição. Para fornecer um diagnóstico mais preciso, por favor informe:

1. **Código de alarme** (se houver) - Ex: 032-A
2. **Equipamento afetado** - Ex: Gerador Principal #1
3. **Quando o problema começou** - Data/hora aproximada
4. **Condições operacionais** - Carga, clima, operação em andamento

Enquanto isso, verifiquei o histórico desta embarcação e não encontrei ocorrências similares recentes. Você pode também consultar os problemas mais comuns na aba "Códigos de Erro".`;
    }
    
    return {
      id: Date.now().toString(),
      role: "assistant",
      content,
      timestamp: new Date(),
      sources,
      steps
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = generateDiagnosticResponse(input);
    setMessages(prev => [...prev, response]);
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Chat */}
      <div className="lg:col-span-2">
        <Card className="h-[700px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Assistente de Diagnóstico Técnico
            </CardTitle>
            <CardDescription>
              IA especializada em diagnóstico de falhas com acesso a manuais e histórico
            </CardDescription>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="p-2 rounded-full bg-primary/10 h-fit">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${msg.role === "user" ? "order-first" : ""}`}>
                    <div
                      className={`rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {msg.content.split("\n").map((line, i) => (
                          <p key={i} className="mb-1 last:mb-0">
                            {line.startsWith("##") ? (
                              <strong>{line.replace(/^#+\s*/, "")}</strong>
                            ) : line.startsWith("-") || line.match(/^\d+\./) ? (
                              <span className="block ml-4">{line}</span>
                            ) : (
                              line
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {msg.sources.map((source, i) => (
                          <Badge key={i} variant="outline" className="text-xs gap-1">
                            <FileText className="h-3 w-3" />
                            {source}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(msg.timestamp, "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  
                  {msg.role === "user" && (
                    <div className="p-2 rounded-full bg-primary h-fit">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="p-2 rounded-full bg-primary/10 h-fit">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analisando documentação técnica...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Descreva o problema ou informe o código de erro..."
                value={input}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend(}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex gap-2 mt-2">
              {["Gerador com código 032-A", "Bomba de lastro não parte", "Problema no sistema DP"].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={handleSetInput}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <Tabs defaultValue="codes">
          <TabsList className="w-full">
            <TabsTrigger value="codes" className="flex-1 gap-1">
              <AlertTriangle className="h-4 w-4" />
              Códigos
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-1">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="codes">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Códigos de Erro Comuns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {commonIssues.map((issue) => (
                  <button
                    key={issue.code}
                    onClick={handleSetInput}
                    className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{issue.code}</Badge>
                      <span className="text-xs text-muted-foreground">{issue.equipment}</span>
                    </div>
                    <p className="text-sm mt-1">{issue.description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Diagnósticos Anteriores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockHistory.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{item.equipment}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(item.date, "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.issue}</p>
                    <div className="flex items-center gap-1 mt-2 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-xs">{item.resolution}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Dicas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Inclua o código de alarme para diagnósticos mais precisos</p>
            <p>• Descreva quando o problema começou</p>
            <p>• Mencione condições operacionais relevantes</p>
            <p>• O assistente consulta manuais e histórico automaticamente</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiagnosticAssistant;
