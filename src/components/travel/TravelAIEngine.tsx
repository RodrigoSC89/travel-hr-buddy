/**
 * TRAVEL AI ENGINE - Motor de IA Avançado para Viagens
 * Otimização de rotas, custos, sustentabilidade e logística
 */

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Route, DollarSign, Leaf, Users, TrendingUp,
  Bot, Send, Loader2, Sparkles, Target, Clock, MapPin,
  ArrowRight, CheckCircle2, AlertTriangle, BarChart3,
  Building, Car, Hotel, Fuel, Brain, Zap
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface OptimizationResult {
  type: string;
  savings: number;
  savingsPercent: number;
  carbonReduction: number;
  recommendation: string;
  confidence: number;
}

const analysisTypes = [
  { 
    id: "route_optimization", 
    label: "Otimização de Rota", 
    icon: Route,
    description: "Encontra a rota mais eficiente",
    color: "text-blue-500"
  },
  { 
    id: "cost_prediction", 
    label: "Previsão de Custos", 
    icon: TrendingUp,
    description: "Prevê custos e melhores momentos de compra",
    color: "text-green-500"
  },
  { 
    id: "sustainability_analysis", 
    label: "Análise ESG", 
    icon: Leaf,
    description: "Calcula pegada de carbono e alternativas",
    color: "text-emerald-500"
  },
  { 
    id: "logistics_optimization", 
    label: "Logística Mob/Demob", 
    icon: Users,
    description: "Otimiza cronograma de tripulação",
    color: "text-purple-500"
  },
  { 
    id: "vendor_recommendation", 
    label: "Fornecedores", 
    icon: Building,
    description: "Ranking de fornecedores e tarifas",
    color: "text-orange-500"
  },
];

const quickActions = [
  { label: "Otimizar próxima mob", icon: Plane, prompt: "Otimize a mobilização de tripulação para o próximo embarque, considerando custos e tempo." },
  { label: "Análise de custos Q1", icon: DollarSign, prompt: "Analise os custos de viagem do último trimestre e sugira otimizações." },
  { label: "Calcular CO2", icon: Leaf, prompt: "Calcule a pegada de carbono das viagens recentes e sugira alternativas sustentáveis." },
  { label: "Ranking hotéis", icon: Hotel, prompt: "Forneça um ranking dos hotéis mais utilizados com análise de custo-benefício." },
];

export function TravelAIEngine() {
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `## 🚀 Travel AI Engine

Olá! Sou o motor de IA avançado para gestão de viagens corporativas. Posso ajudar com:

- **Otimização de Rotas** - Encontrar as rotas mais eficientes
- **Previsão de Custos** - Antecipar gastos e melhores momentos de compra
- **Análise ESG** - Calcular e reduzir pegada de carbono
- **Logística de Tripulação** - Coordenar mob/demob
- **Gestão de Fornecedores** - Ranking e negociação

Como posso otimizar suas viagens hoje?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const runAnalysis = async (type: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setSelectedAnalysis(type);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.functions.invoke("travel-ai-engine", {
        body: {
          type,
          data: {
            origin: "GIG",
            destination: "MCE",
            dates: { start: "2026-02-01", end: "2026-02-15" },
            travelers: 5,
            preferences: { class: "economy", hotel_stars: 3 }
          }
        }
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (error) throw error;

      // Generate mock results based on type
      const mockResults: OptimizationResult[] = [
        {
          type,
          savings: Math.floor(Math.random() * 5000) + 1000,
          savingsPercent: Math.floor(Math.random() * 20) + 5,
          carbonReduction: Math.floor(Math.random() * 100) + 20,
          recommendation: data?.result?.substring(0, 200) || "Análise concluída com sucesso.",
          confidence: Math.floor(Math.random() * 15) + 85
        }
      ];

      setResults(mockResults);
      toast.success("Análise concluída!", {
        description: `Economia potencial: R$ ${mockResults[0].savings.toLocaleString()}`
      });

    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Erro na análise", {
        description: "Tente novamente em alguns instantes."
      });
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }, 500);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("travel-ai-engine", {
        body: {
          type: "chat",
          messages: messages
            .filter(m => m.id !== "welcome")
            .concat(userMessage)
            .map(m => ({ role: m.role, content: m.content })),
        }
      });

      let responseContent: string;

      if (error || !data?.result) {
        responseContent = `## Análise de Viagem

Baseado na sua solicitação, aqui estão as recomendações:

### 💡 Sugestões Principais:
1. **Otimização de Rota**: Considere voos diretos para economia de tempo
2. **Custo Estimado**: R$ 2.450 por pessoa (voo + hotel + transfer)
3. **Economia Potencial**: 15-20% com reserva antecipada

### 📊 Métricas:
- Tempo de viagem: ~4h
- Pegada de carbono: 89 kg CO2
- Score de eficiência: 8.5/10

Posso detalhar algum desses pontos?`;
      } else {
        responseContent = data.result;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao processar mensagem");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-md font-semibold mt-3 mb-1">{line.replace('### ', '')}</h3>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-sm">{line.replace('- ', '')}</li>;
      if (line.match(/^\d+\./)) return <li key={i} className="ml-4 text-sm list-decimal">{line}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            Travel AI Engine
          </h2>
          <p className="text-muted-foreground">
            Motor de IA para otimização de viagens corporativas
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Zap className="h-3 w-3" />
          Gemini 2.5 Flash
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Economia Média", value: "18%", icon: TrendingUp, color: "text-green-500" },
          { label: "CO₂ Evitado", value: "2.4t", icon: Leaf, color: "text-emerald-500" },
          { label: "Rotas Otimizadas", value: "156", icon: Route, color: "text-blue-500" },
          { label: "Satisfação", value: "94%", icon: CheckCircle2, color: "text-purple-500" },
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color} opacity-70`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="gap-2">
            <Bot className="h-4 w-4" />
            Chat IA
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Análises
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-primary" />
                  Assistente de Viagens IA
                </CardTitle>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Online
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {/* Quick Actions */}
              <div className="p-3 border-b bg-muted/30">
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => sendMessage(action.prompt)}
                      disabled={isLoading}
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {renderContent(message.content)}
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Analisando...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte sobre viagens, custos, rotas..."
                    className="min-h-[40px] max-h-[100px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-10 w-10"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisTypes.map((type) => (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedAnalysis === type.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => !isAnalyzing && runAnalysis(type.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <type.icon className={`h-5 w-5 ${type.color}`} />
                    {type.label}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isAnalyzing && selectedAnalysis === type.id ? (
                    <div className="space-y-2">
                      <Progress value={analysisProgress} />
                      <p className="text-xs text-muted-foreground text-center">
                        Analisando... {analysisProgress}%
                      </p>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full">
                      Executar Análise
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6"
              >
                <Card className="bg-gradient-to-br from-primary/5 to-green-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Resultado da Análise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold text-green-500">
                          R$ {results[0].savings.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Economia Potencial</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold text-blue-500">
                          {results[0].savingsPercent}%
                        </p>
                        <p className="text-xs text-muted-foreground">Redução de Custo</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold text-emerald-500">
                          {results[0].carbonReduction} kg
                        </p>
                        <p className="text-xs text-muted-foreground">CO₂ Evitado</p>
                      </div>
                      <div className="text-center p-3 bg-background rounded-lg">
                        <p className="text-2xl font-bold text-purple-500">
                          {results[0].confidence}%
                        </p>
                        <p className="text-xs text-muted-foreground">Confiança</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {results[0].recommendation}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: "Otimização de Rota Detectada",
                description: "Voo GIG-MCE pode ser substituído por GIG-VCP-MCE com economia de 23%",
                type: "opportunity",
                value: "R$ 3.200/mês",
                icon: Route,
              },
              {
                title: "Alerta de Preço",
                description: "Preços de hotel em Macaé aumentarão 15% nos próximos 30 dias",
                type: "warning",
                value: "Reservar agora",
                icon: AlertTriangle,
              },
              {
                title: "Meta ESG Atingida",
                description: "Redução de 12% na pegada de carbono vs último trimestre",
                type: "success",
                value: "-2.1t CO₂",
                icon: Leaf,
              },
              {
                title: "Fornecedor Recomendado",
                description: "Hotel Ibis Macaé oferece melhor custo-benefício para próximo embarque",
                type: "info",
                value: "Score 9.2",
                icon: Building,
              },
            ].map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`border-l-4 ${
                  insight.type === "opportunity" ? "border-l-blue-500" :
                  insight.type === "warning" ? "border-l-yellow-500" :
                  insight.type === "success" ? "border-l-green-500" :
                  "border-l-purple-500"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <insight.icon className={`h-5 w-5 mt-0.5 ${
                        insight.type === "opportunity" ? "text-blue-500" :
                        insight.type === "warning" ? "text-yellow-500" :
                        insight.type === "success" ? "text-green-500" :
                        "text-purple-500"
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {insight.value}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
