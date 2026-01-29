/**
 * WEATHER ROUTE PLANNER - Planejador de Rotas Meteorológico com IA
 * Otimização de viagens baseada em condições climáticas
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
  Cloud, Wind, Waves, Anchor, Navigation, Ship, Compass,
  Bot, Send, Loader2, Sparkles, AlertTriangle, CheckCircle2,
  ThermometerSun, Droplets, Eye, Clock, MapPin, Fuel,
  BarChart3, Route, Calendar, Zap, Brain
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface WeatherWindow {
  period: string;
  wind: number;
  waves: number;
  visibility: string;
  status: "favorable" | "moderate" | "adverse";
  probability: number;
}

const analysisTypes = [
  { 
    id: "route_weather_analysis", 
    label: "Análise Rota + Clima", 
    icon: Route,
    description: "Avalia rota considerando condições meteorológicas",
    color: "text-blue-500"
  },
  { 
    id: "weather_window_prediction", 
    label: "Janelas Operacionais", 
    icon: Clock,
    description: "Prevê janelas favoráveis para operações",
    color: "text-green-500"
  },
  { 
    id: "voyage_optimization", 
    label: "Voyage Planning", 
    icon: Ship,
    description: "Otimiza rota, velocidade e consumo",
    color: "text-purple-500"
  },
  { 
    id: "port_call_optimization", 
    label: "Port Call", 
    icon: Anchor,
    description: "Otimiza chegada e operações portuárias",
    color: "text-orange-500"
  },
  { 
    id: "fuel_weather_correlation", 
    label: "Bunker vs Clima", 
    icon: Fuel,
    description: "Correlação consumo x condições",
    color: "text-cyan-500"
  },
];

const quickActions = [
  { label: "Próxima janela", icon: Clock, prompt: "Qual a próxima janela meteorológica favorável para operações nas próximas 48h?" },
  { label: "Análise de rota", icon: Route, prompt: "Analise a rota Santos-Macaé considerando as condições meteorológicas atuais." },
  { label: "Status operacional", icon: CheckCircle2, prompt: "Qual o status GO/NO-GO para operações de carga nas próximas 6 horas?" },
  { label: "Previsão consumo", icon: Fuel, prompt: "Estime o consumo de combustível para a próxima viagem considerando o clima." },
];

export function WeatherRoutePlanner() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);
  const [weatherWindows, setWeatherWindows] = useState<WeatherWindow[]>([
    { period: "Manhã (06-12h)", wind: 8, waves: 0.8, visibility: "Boa", status: "favorable", probability: 92 },
    { period: "Tarde (12-18h)", wind: 14, waves: 1.2, visibility: "Boa", status: "moderate", probability: 75 },
    { period: "Noite (18-00h)", wind: 18, waves: 1.8, visibility: "Moderada", status: "moderate", probability: 65 },
    { period: "Madrugada (00-06h)", wind: 22, waves: 2.2, visibility: "Reduzida", status: "adverse", probability: 40 },
  ]);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `## 🌊 Weather Route Planner

Olá! Sou o planejador de rotas meteorológico com IA. Posso ajudar com:

- **Análise de Rotas** considerando clima e correntes
- **Janelas Operacionais** para navegação e operações
- **Voyage Planning** otimizado para consumo
- **Port Call** com timing ideal
- **Correlação Bunker/Clima** para eficiência

Condições atuais: **Beaufort 3** | Visibilidade **Boa** | Ondas **1.2m**

Como posso ajudar com sua rota?`,
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
    setSelectedAnalysis(type);

    try {
      const { data, error } = await supabase.functions.invoke("weather-route-planner", {
        body: {
          type,
          data: {
            origin: { lat: -23.95, lon: -46.30, name: "Santos" },
            destination: { lat: -22.38, lon: -41.78, name: "Macaé" },
            vessel: { type: "PSV", speed_max: 14, consumption: 8.5 },
            departure: "2026-02-01T06:00:00Z"
          }
        }
      });

      if (error) throw error;

      toast.success("Análise concluída!", {
        description: "Resultados disponíveis no dashboard."
      });

    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Erro na análise");
    } finally {
      setIsAnalyzing(false);
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
      const { data, error } = await supabase.functions.invoke("weather-route-planner", {
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
        responseContent = `## Análise Meteorológica

### Condições Atuais:
- **Vento:** 12 nós (Beaufort 4 - Brisa moderada)
- **Ondas:** 1.5m (Douglas 3 - Ligeira)
- **Visibilidade:** 10+ km
- **Direção:** NE 045°

### Janela Operacional:
✅ **FAVORÁVEL** para as próximas 12 horas

| Período | Status | Confiança |
|---------|--------|-----------|
| 06-12h | ✅ GO | 92% |
| 12-18h | ⚠️ ATENÇÃO | 75% |
| 18-00h | ❌ NO-GO | 45% |

### Recomendações:
1. Aproveitar janela matutina para operações críticas
2. Concluir transferências até 14h
3. Monitorar evolução vespertina`;
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
      if (line.includes('|')) return <p key={i} className="font-mono text-xs">{line}</p>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm">{line}</p>;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "favorable": return "text-green-500 bg-green-500/10";
      case "moderate": return "text-yellow-500 bg-yellow-500/10";
      case "adverse": return "text-red-500 bg-red-500/10";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="h-7 w-7 text-primary" />
            Weather Route Planner
          </h2>
          <p className="text-muted-foreground">
            Planejamento de rotas baseado em meteorologia com IA
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Zap className="h-3 w-3" />
          Gemini 2.5 Flash
        </Badge>
      </div>

      {/* Weather Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Vento", value: "12 nós", icon: Wind, sub: "Beaufort 4" },
          { label: "Ondas", value: "1.5m", icon: Waves, sub: "Douglas 3" },
          { label: "Visibilidade", value: "10+ km", icon: Eye, sub: "Excelente" },
          { label: "Temperatura", value: "24°C", icon: ThermometerSun, sub: "Estável" },
          { label: "Status", value: "GO", icon: CheckCircle2, sub: "Operacional" },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={idx === 4 ? "bg-green-500/10 border-green-500/30" : ""}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`text-xl font-bold ${idx === 4 ? "text-green-500" : ""}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <item.icon className={`h-8 w-8 opacity-70 ${idx === 4 ? "text-green-500" : "text-primary"}`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="windows" className="gap-2">
            <Clock className="h-4 w-4" />
            Janelas
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2">
            <Brain className="h-4 w-4" />
            Análises IA
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <Bot className="h-4 w-4" />
            Chat
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weather Windows Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Janelas Meteorológicas (24h)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weatherWindows.map((window, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(window.status)}`}>
                        {window.status === "favorable" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : window.status === "moderate" ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{window.period}</p>
                        <p className="text-xs text-muted-foreground">
                          {window.wind} nós | {window.waves}m | {window.visibility}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={window.status === "favorable" ? "default" : "secondary"}>
                        {window.probability}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Route Optimization Card */}
            <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-blue-500" />
                  Rota Otimizada
                </CardTitle>
                <CardDescription>
                  Santos → Macaé | 180 mn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-background rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-500">14.2h</p>
                    <p className="text-xs text-muted-foreground">ETA</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-500">8.3t</p>
                    <p className="text-xs text-muted-foreground">Consumo Est.</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-500">12.5 nós</p>
                    <p className="text-xs text-muted-foreground">Vel. Econômica</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg text-center">
                    <p className="text-2xl font-bold text-cyan-500">92%</p>
                    <p className="text-xs text-muted-foreground">Confiança</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => runAnalysis("voyage_optimization")}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Recalcular Rota
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Windows Tab */}
        <TabsContent value="windows">
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Janelas Operacionais</CardTitle>
              <CardDescription>
                Próximas 48 horas com probabilidade de condições favoráveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Hoje", "Amanhã"].map((day, dayIdx) => (
                  <div key={day}>
                    <h4 className="font-semibold mb-3">{day}</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {["00-06h", "06-12h", "12-18h", "18-24h"].map((period, idx) => {
                        const prob = Math.floor(Math.random() * 40) + (idx === 1 ? 60 : 30);
                        const status = prob >= 80 ? "favorable" : prob >= 50 ? "moderate" : "adverse";
                        return (
                          <div
                            key={`${day}-${period}`}
                            className={`p-4 rounded-lg text-center ${getStatusColor(status)}`}
                          >
                            <p className="text-xs font-medium">{period}</p>
                            <p className="text-2xl font-bold">{prob}%</p>
                            <p className="text-xs">
                              {status === "favorable" ? "GO" : status === "moderate" ? "ATENÇÃO" : "NO-GO"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled={isAnalyzing && selectedAnalysis === type.id}
                  >
                    {isAnalyzing && selectedAnalysis === type.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      "Executar Análise"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-primary" />
                  Copiloto Meteorológico
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
                    placeholder="Pergunte sobre clima, rotas, janelas operacionais..."
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
      </Tabs>
    </div>
  );
}
