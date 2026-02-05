 /**
  * Voice Assistant Intelligence
  * Enterprise VUI with multi-intent, slot filling, context management
  * Based on Alexa for Business, Google Dialogflow best practices
  */
 
 import React, { useState, useEffect } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Progress } from "@/components/ui/progress";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { 
   Mic, 
   MicOff,
   Volume2,
   VolumeX,
   Brain,
   MessageSquare,
   Settings,
   Activity,
   CheckCircle,
   AlertTriangle,
   Clock,
   Zap,
   Target,
   TrendingUp,
   HelpCircle,
   Command,
   Radio,
   Waves,
   Ship,
   Users,
   FileText,
   Anchor
 } from "lucide-react";
 
 // Voice Commands Catalog
 const voiceCommands = [
   {
     category: "Navegação",
     icon: Ship,
     commands: [
       { phrase: "Mostrar status da frota", intent: "fleet.status", slots: [] },
       { phrase: "Qual a posição do [navio]", intent: "vessel.position", slots: ["vessel_name"] },
       { phrase: "Abrir mapa de tracking", intent: "navigation.tracking", slots: [] }
     ]
   },
   {
     category: "Tripulação",
     icon: Users,
     commands: [
       { phrase: "Quantos tripulantes embarcados", intent: "crew.count", slots: [] },
       { phrase: "Verificar certificados do [tripulante]", intent: "crew.certificates", slots: ["crew_name"] },
       { phrase: "Criar escala para [navio]", intent: "crew.schedule", slots: ["vessel_name"] }
     ]
   },
   {
     category: "Documentos",
     icon: FileText,
     commands: [
       { phrase: "Buscar documento [tipo]", intent: "document.search", slots: ["doc_type"] },
       { phrase: "Certificados expirando este mês", intent: "document.expiring", slots: [] },
       { phrase: "Gerar relatório de [módulo]", intent: "report.generate", slots: ["module"] }
     ]
   },
   {
     category: "Manutenção",
     icon: Anchor,
     commands: [
       { phrase: "Ordens de manutenção pendentes", intent: "maintenance.pending", slots: [] },
       { phrase: "Agendar manutenção para [equipamento]", intent: "maintenance.schedule", slots: ["equipment"] },
       { phrase: "Status do drydock do [navio]", intent: "drydock.status", slots: ["vessel_name"] }
     ]
   }
 ];
 
 // VUI Metrics
 const vuiMetrics = {
   firstCallResolution: 87.5,
   avgHandlingTime: 4.2,
   customerSatisfaction: 4.6,
   avgTurns: 2.3,
   misrouteRate: 3.2,
   userChurn: 5.8
 };
 
 // Recent Interactions
 const recentInteractions = [
   {
     id: 1,
     timestamp: "14:32:15",
     user: "Capitão Silva",
     utterance: "Qual a previsão do tempo para Rotterdam?",
     intent: "weather.forecast",
     confidence: 0.94,
     slots: { location: "Rotterdam" },
     response: "A previsão para Rotterdam indica céu nublado com temperatura de 12°C e ventos de 15 nós.",
     success: true,
     turns: 1
   },
   {
     id: 2,
     timestamp: "14:28:42",
     user: "Eng. Costa",
     utterance: "Agendar manutenção do motor principal",
     intent: "maintenance.schedule",
     confidence: 0.78,
     slots: { equipment: "motor principal" },
     response: "Para qual embarcação você deseja agendar a manutenção?",
     success: true,
     turns: 3,
     slotFilling: true
   },
   {
     id: 3,
     timestamp: "14:15:33",
     user: "Admin",
     utterance: "Mostrar tripulantes com certificados vencidos",
     intent: "crew.certificates.expired",
     confidence: 0.91,
     slots: {},
     response: "Encontrei 12 tripulantes com certificados vencidos. Deseja ver a lista completa?",
     success: true,
     turns: 2
   }
 ];
 
 // Disambiguation Examples
 const disambiguationQueue = [
   {
     id: 1,
     utterance: "Atualizar status",
     possibleIntents: [
       { intent: "vessel.status.update", label: "Status da Embarcação", confidence: 0.45 },
       { intent: "crew.status.update", label: "Status da Tripulação", confidence: 0.42 },
       { intent: "maintenance.status.update", label: "Status de Manutenção", confidence: 0.38 }
     ]
   }
 ];
 
 export default function VoiceAssistantIntelligence() {
   const [isListening, setIsListening] = useState(false);
   const [isMuted, setIsMuted] = useState(false);
   const [currentUtterance, setCurrentUtterance] = useState("");
   const [processingStage, setProcessingStage] = useState<"idle" | "asr" | "nlu" | "response">("idle");
   const [confidence, setConfidence] = useState(0);
 
   // Simulate listening animation
   useEffect(() => {
     if (isListening) {
       const interval = setInterval(() => {
         setConfidence(prev => Math.min(100, prev + Math.random() * 20));
       }, 200);
       return () => clearInterval(interval);
     } else {
       setConfidence(0);
     }
   }, [isListening]);
 
   const toggleListening = () => {
     setIsListening(!isListening);
     if (!isListening) {
       setProcessingStage("asr");
       setTimeout(() => setProcessingStage("nlu"), 1500);
       setTimeout(() => setProcessingStage("response"), 2500);
       setTimeout(() => {
         setIsListening(false);
         setProcessingStage("idle");
       }, 4000);
     }
   };
 
   return (
     <div className="space-y-6">
       {/* Main Voice Interface */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Voice Control Panel */}
         <Card className="lg:col-span-2">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Radio className="h-5 w-5" />
               Nauti Voice Assistant
             </CardTitle>
             <CardDescription>Assistente de voz com NLU avançado para operações marítimas</CardDescription>
           </CardHeader>
           <CardContent>
             {/* Voice Activation Area */}
             <div className="relative flex flex-col items-center justify-center py-12 bg-gradient-to-b from-primary/5 to-transparent rounded-xl">
               {/* Waveform Animation */}
               <div className="absolute inset-0 flex items-center justify-center opacity-20">
                 {isListening && (
                   <div className="flex items-center gap-1">
                     {[...Array(20)].map((_, i) => (
                       <div
                         key={i}
                         className="w-1 bg-primary rounded-full animate-pulse"
                         style={{
                           height: `${Math.random() * 60 + 20}px`,
                           animationDelay: `${i * 0.05}s`
                         }}
                       />
                     ))}
                   </div>
                 )}
               </div>
 
               {/* Main Mic Button */}
               <button
                 onClick={toggleListening}
                 className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                   isListening 
                     ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50 scale-110" 
                     : "bg-muted hover:bg-primary/20"
                 }`}
               >
                 {isListening ? (
                   <Waves className="h-10 w-10 animate-pulse" />
                 ) : (
                   <Mic className="h-10 w-10" />
                 )}
               </button>
 
               {/* Status Text */}
               <div className="mt-6 text-center">
                 {isListening ? (
                   <div className="space-y-2">
                     <p className="font-medium text-primary">Ouvindo...</p>
                     <div className="flex items-center justify-center gap-2">
                       <Badge variant={processingStage === "asr" ? "default" : "secondary"}>
                         ASR
                       </Badge>
                       <span>→</span>
                       <Badge variant={processingStage === "nlu" ? "default" : "secondary"}>
                         NLU
                       </Badge>
                       <span>→</span>
                       <Badge variant={processingStage === "response" ? "default" : "secondary"}>
                         Response
                       </Badge>
                     </div>
                   </div>
                 ) : (
                   <p className="text-muted-foreground">
                     Diga "Olá Nauti" ou clique para ativar
                   </p>
                 )}
               </div>
 
               {/* Quick Actions */}
               <div className="flex items-center gap-4 mt-6">
                 <Button 
                   variant="outline" 
                   size="sm"
                   onClick={() => setIsMuted(!isMuted)}
                 >
                   {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                 </Button>
                 <Button variant="outline" size="sm">
                   <Settings className="h-4 w-4" />
                 </Button>
                 <Button variant="outline" size="sm">
                   <HelpCircle className="h-4 w-4" />
                 </Button>
               </div>
             </div>
 
             {/* Recent Utterance */}
             {currentUtterance && (
               <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                 <p className="text-sm text-muted-foreground">Última frase:</p>
                 <p className="font-medium">"{currentUtterance}"</p>
               </div>
             )}
           </CardContent>
         </Card>
 
         {/* VUI Metrics */}
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Activity className="h-5 w-5" />
               Métricas VUI
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="p-3 bg-emerald-500/10 rounded-lg">
               <div className="flex items-center justify-between mb-1">
                 <span className="text-sm">First Call Resolution</span>
                 <span className="font-semibold text-emerald-600">{vuiMetrics.firstCallResolution}%</span>
               </div>
               <Progress value={vuiMetrics.firstCallResolution} className="h-2" />
             </div>
 
             <div className="p-3 bg-blue-500/10 rounded-lg">
               <div className="flex items-center justify-between mb-1">
                 <span className="text-sm">Satisfação (CSAT)</span>
                 <span className="font-semibold text-blue-600">{vuiMetrics.customerSatisfaction}/5.0</span>
               </div>
               <Progress value={vuiMetrics.customerSatisfaction * 20} className="h-2" />
             </div>
 
             <div className="grid grid-cols-2 gap-3">
               <div className="p-3 bg-muted/50 rounded-lg text-center">
                 <p className="text-xs text-muted-foreground">Tempo Médio</p>
                 <p className="text-lg font-bold">{vuiMetrics.avgHandlingTime}s</p>
               </div>
               <div className="p-3 bg-muted/50 rounded-lg text-center">
                 <p className="text-xs text-muted-foreground">Turnos/Task</p>
                 <p className="text-lg font-bold">{vuiMetrics.avgTurns}</p>
               </div>
               <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                 <p className="text-xs text-muted-foreground">Misroute</p>
                 <p className="text-lg font-bold text-amber-600">{vuiMetrics.misrouteRate}%</p>
               </div>
               <div className="p-3 bg-muted/50 rounded-lg text-center">
                 <p className="text-xs text-muted-foreground">Churn</p>
                 <p className="text-lg font-bold">{vuiMetrics.userChurn}%</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
 
       {/* Commands & Interactions */}
       <Tabs defaultValue="commands" className="space-y-4">
         <TabsList>
           <TabsTrigger value="commands">Comandos Disponíveis</TabsTrigger>
           <TabsTrigger value="history">Histórico</TabsTrigger>
           <TabsTrigger value="disambiguation">Desambiguação</TabsTrigger>
           <TabsTrigger value="training">Treinamento NLU</TabsTrigger>
         </TabsList>
 
         {/* Commands Catalog */}
         <TabsContent value="commands" className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {voiceCommands.map((category) => (
               <Card key={category.category}>
                 <CardHeader className="pb-3">
                   <CardTitle className="text-sm flex items-center gap-2">
                     <category.icon className="h-4 w-4" />
                     {category.category}
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2">
                   {category.commands.map((cmd, idx) => (
                     <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                       <div>
                         <p className="text-sm font-medium">"{cmd.phrase}"</p>
                         <p className="text-xs text-muted-foreground">Intent: {cmd.intent}</p>
                       </div>
                       {cmd.slots.length > 0 && (
                         <Badge variant="outline" className="text-xs">
                           {cmd.slots.length} slot{cmd.slots.length > 1 ? "s" : ""}
                         </Badge>
                       )}
                     </div>
                   ))}
                 </CardContent>
               </Card>
             ))}
           </div>
         </TabsContent>
 
         {/* History */}
         <TabsContent value="history" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="text-sm">Interações Recentes</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
               {recentInteractions.map((interaction) => (
                 <div key={interaction.id} className="p-4 border rounded-lg">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                       <Clock className="h-4 w-4 text-muted-foreground" />
                       <span className="text-sm text-muted-foreground">{interaction.timestamp}</span>
                       <Badge variant="outline">{interaction.user}</Badge>
                     </div>
                     <div className="flex items-center gap-2">
                       <Badge 
                         variant={interaction.confidence > 0.85 ? "default" : "secondary"}
                         className="flex items-center gap-1"
                       >
                         <Target className="h-3 w-3" />
                         {(interaction.confidence * 100).toFixed(0)}%
                       </Badge>
                       {interaction.success ? (
                         <CheckCircle className="h-4 w-4 text-emerald-500" />
                       ) : (
                         <AlertTriangle className="h-4 w-4 text-amber-500" />
                       )}
                     </div>
                   </div>
                   <div className="space-y-2">
                     <div className="flex items-start gap-2">
                       <Mic className="h-4 w-4 mt-1 text-primary" />
                       <p className="text-sm font-medium">"{interaction.utterance}"</p>
                     </div>
                     <div className="flex items-start gap-2">
                       <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground" />
                       <p className="text-sm text-muted-foreground">{interaction.response}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                     <span>Intent: {interaction.intent}</span>
                     <span>Turns: {interaction.turns}</span>
                     {interaction.slotFilling && (
                       <Badge variant="secondary" className="text-xs">Slot Filling</Badge>
                     )}
                   </div>
                 </div>
               ))}
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* Disambiguation */}
         <TabsContent value="disambiguation" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Brain className="h-5 w-5" />
                 Fila de Desambiguação
               </CardTitle>
               <CardDescription>Frases que precisam de clarificação do usuário</CardDescription>
             </CardHeader>
             <CardContent>
               {disambiguationQueue.map((item) => (
                 <div key={item.id} className="p-4 border rounded-lg">
                   <p className="font-medium mb-3">Utterance: "{item.utterance}"</p>
                   <p className="text-sm text-muted-foreground mb-3">Possíveis intents:</p>
                   <div className="space-y-2">
                     {item.possibleIntents.map((intent, idx) => (
                       <div 
                         key={idx} 
                         className="flex items-center justify-between p-3 bg-muted/50 rounded hover:bg-primary/10 cursor-pointer transition-colors"
                       >
                         <div className="flex items-center gap-2">
                           <Command className="h-4 w-4" />
                           <span className="font-medium">{intent.label}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Progress value={intent.confidence * 100} className="w-20 h-2" />
                           <span className="text-sm text-muted-foreground">
                             {(intent.confidence * 100).toFixed(0)}%
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="mt-4">
                     <p className="text-sm text-primary">
                       Sugestão: "Você quis dizer atualizar o status da embarcação, da tripulação, ou da manutenção?"
                     </p>
                   </div>
                 </div>
               ))}
             </CardContent>
           </Card>
         </TabsContent>
 
         {/* NLU Training */}
         <TabsContent value="training" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Zap className="h-5 w-5" />
                 Treinamento do Modelo NLU
               </CardTitle>
               <CardDescription>Adicione novas frases de exemplo para melhorar o reconhecimento</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-4 border rounded-lg text-center">
                   <p className="text-3xl font-bold text-primary">1,247</p>
                   <p className="text-sm text-muted-foreground">Training Phrases</p>
                 </div>
                 <div className="p-4 border rounded-lg text-center">
                   <p className="text-3xl font-bold text-emerald-600">48</p>
                   <p className="text-sm text-muted-foreground">Intents Ativos</p>
                 </div>
                 <div className="p-4 border rounded-lg text-center">
                   <p className="text-3xl font-bold text-blue-600">92.4%</p>
                   <p className="text-sm text-muted-foreground">Acurácia do Modelo</p>
                 </div>
               </div>
               
               <div className="mt-6">
                 <Button className="w-full">
                   <TrendingUp className="h-4 w-4 mr-2" />
                   Retreinar Modelo NLU
                 </Button>
               </div>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }