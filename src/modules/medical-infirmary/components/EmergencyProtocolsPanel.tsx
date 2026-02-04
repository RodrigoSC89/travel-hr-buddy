/**
 * Emergency Protocols Panel - Protocolos de Emergência Médica
 * Guias interativos para situações de emergência marítima
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, Heart, Thermometer, Bone, Zap, 
  Droplets, Wind, Brain, Phone, Clock, CheckCircle2,
  ChevronRight, Search, Star, Bookmark, Play, Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Protocol {
  id: string;
  name: string;
  category: "cardiac" | "trauma" | "respiratory" | "neurological" | "burns" | "hypothermia" | "drowning";
  severity: "critical" | "high" | "medium";
  estimatedTime: string;
  steps: {
    step: number;
    title: string;
    description: string;
    warning?: string;
    timer?: number; // seconds
  }[];
  medications?: {
    name: string;
    dose: string;
    route: string;
  }[];
  callTelemedicine: boolean;
  evacuationRequired: boolean;
}

const PROTOCOLS: Protocol[] = [
  {
    id: "cardiac-arrest",
    name: "Parada Cardiorrespiratória (PCR)",
    category: "cardiac",
    severity: "critical",
    estimatedTime: "30+ min",
    callTelemedicine: true,
    evacuationRequired: true,
    steps: [
      { step: 1, title: "Verificar Segurança", description: "Garantir ambiente seguro para socorrista e vítima", timer: 10 },
      { step: 2, title: "Verificar Responsividade", description: "Tocar ombros e chamar alto. Se não responder, acionar emergência.", timer: 10 },
      { step: 3, title: "Chamar Ajuda", description: "Acionar telemedicina e solicitar DEA. Não deixar a vítima sozinha.", warning: "Tempo crítico - cada minuto sem RCP reduz 10% de sobrevida" },
      { step: 4, title: "Verificar Pulso", description: "Palpar pulso carotídeo por no máximo 10 segundos", timer: 10 },
      { step: 5, title: "Iniciar RCP", description: "30 compressões torácicas + 2 ventilações. Frequência: 100-120/min, profundidade: 5-6cm", timer: 120 },
      { step: 6, title: "Aplicar DEA", description: "Ligar DEA, seguir comandos de voz, afastar durante análise e choque" },
      { step: 7, title: "Continuar RCP", description: "Alternar RCP e análise DEA até chegada de socorro avançado" },
    ],
    medications: [
      { name: "Adrenalina", dose: "1mg", route: "EV a cada 3-5 min" },
      { name: "Amiodarona", dose: "300mg", route: "EV (FV/TV refratária)" },
    ]
  },
  {
    id: "stroke",
    name: "AVC - Acidente Vascular Cerebral",
    category: "neurological",
    severity: "critical",
    estimatedTime: "Tempo é cérebro",
    callTelemedicine: true,
    evacuationRequired: true,
    steps: [
      { step: 1, title: "Reconhecer Sinais", description: "FAST: Face caída, Arm fraqueza, Speech alterada, Time hora início" },
      { step: 2, title: "Anotar Hora Início", description: "Crucial para decisão de trombólise (janela 4.5h)", warning: "Janela terapêutica limitada" },
      { step: 3, title: "Posicionar Paciente", description: "Decúbito dorsal com cabeceira 30°, O2 se SpO2 < 94%" },
      { step: 4, title: "Não Dar Medicações", description: "Evitar AAS, anticoagulantes até definição diagnóstica" },
      { step: 5, title: "Monitorar Sinais Vitais", description: "PA, FC, SpO2, Glasgow a cada 15 min" },
      { step: 6, title: "Telemedicina Urgente", description: "Neurologista para orientação de evacuação" },
    ]
  },
  {
    id: "severe-burn",
    name: "Queimadura Grave",
    category: "burns",
    severity: "high",
    estimatedTime: "45 min",
    callTelemedicine: true,
    evacuationRequired: true,
    steps: [
      { step: 1, title: "Afastar da Fonte", description: "Remover vítima da fonte de calor/químico com segurança" },
      { step: 2, title: "Resfriar Queimadura", description: "Água corrente em temperatura ambiente por 20 minutos", timer: 1200, warning: "Não usar gelo - risco de hipotermia" },
      { step: 3, title: "Remover Roupas", description: "Retirar roupas não aderidas e jóias na área afetada" },
      { step: 4, title: "Calcular SCQ", description: "Regra dos 9: Cabeça 9%, Membro superior 9% cada, Tronco anterior 18%" },
      { step: 5, title: "Acesso Venoso", description: "Obter 2 acessos calibrosos se SCQ > 20%" },
      { step: 6, title: "Reposição Volêmica", description: "Fórmula Parkland: 4ml x peso x %SCQ nas primeiras 24h" },
      { step: 7, title: "Curativo Estéril", description: "Cobrir com compressas estéreis úmidas, manter aquecido" },
    ],
    medications: [
      { name: "Morfina", dose: "2-4mg", route: "EV lento" },
      { name: "Ringer Lactato", dose: "Parkland", route: "EV" },
    ]
  },
  {
    id: "hypothermia",
    name: "Hipotermia",
    category: "hypothermia",
    severity: "high",
    estimatedTime: "1-2h",
    callTelemedicine: true,
    evacuationRequired: true,
    steps: [
      { step: 1, title: "Remover do Ambiente Frio", description: "Levar para local aquecido e protegido do vento" },
      { step: 2, title: "Avaliar Temperatura Central", description: "Usar termômetro retal/esofágico. Axilar é imprecisa.", warning: "Não esfregar extremidades - risco de arritmia" },
      { step: 3, title: "Remover Roupas Molhadas", description: "Secar e cobrir com cobertores secos" },
      { step: 4, title: "Reaquecimento Passivo", description: "Cobertores, bolsas térmicas no tronco (axilas, virilha)" },
      { step: 5, title: "Líquidos Aquecidos", description: "Se consciente: líquidos mornos sem álcool/cafeína" },
      { step: 6, title: "Monitorar ECG", description: "Risco de arritmias (onda J de Osborn)" },
    ]
  },
  {
    id: "drowning",
    name: "Afogamento",
    category: "drowning",
    severity: "critical",
    estimatedTime: "Variável",
    callTelemedicine: true,
    evacuationRequired: true,
    steps: [
      { step: 1, title: "Resgate Seguro", description: "Usar equipamento flutuante. Não se tornar segunda vítima." },
      { step: 2, title: "Posicionar na Horizontal", description: "Manter em posição horizontal durante resgate" },
      { step: 3, title: "Avaliar Respiração", description: "VOS por 10 segundos", timer: 10 },
      { step: 4, title: "Ventilação de Resgate", description: "5 ventilações de resgate iniciais" },
      { step: 5, title: "RCP se Necessário", description: "30:2 se sem pulso. Priorizar ventilação." },
      { step: 6, title: "Posição de Recuperação", description: "Se respirando, posição lateral de segurança" },
      { step: 7, title: "Monitorar por 24h", description: "Risco de edema pulmonar tardio", warning: "Todo afogado deve ser observado" },
    ]
  },
];

const categoryIcons = {
  cardiac: Heart,
  trauma: Bone,
  respiratory: Wind,
  neurological: Brain,
  burns: Thermometer,
  hypothermia: Thermometer,
  drowning: Droplets,
};

const categoryLabels = {
  cardiac: "Cardíaco",
  trauma: "Trauma",
  respiratory: "Respiratório",
  neurological: "Neurológico",
  burns: "Queimaduras",
  hypothermia: "Hipotermia",
  drowning: "Afogamento",
};

export default function EmergencyProtocolsPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [favorites, setFavorites] = useState<string[]>(["cardiac-arrest", "severe-burn"]);

  const filteredProtocols = PROTOCOLS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    categoryLabels[p.category].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerActive(true);
    
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          toast.success("Tempo concluído!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  if (selectedProtocol) {
    const Icon = categoryIcons[selectedProtocol.category];
    
    return (
      <div className="space-y-4">
        {/* Protocol Header */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-destructive/20">
                  <Icon className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {selectedProtocol.name}
                    <Badge variant="destructive">{selectedProtocol.severity.toUpperCase()}</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedProtocol.estimatedTime}
                    </span>
                    {selectedProtocol.callTelemedicine && (
                      <span className="flex items-center gap-1 text-primary">
                        <Phone className="h-3 w-3" />
                        Telemedicina
                      </span>
                    )}
                    {selectedProtocol.evacuationRequired && (
                      <span className="flex items-center gap-1 text-warning">
                        <AlertTriangle className="h-3 w-3" />
                        Evacuação
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Telemedicina
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedProtocol(null)}>
                  Voltar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Timer Display */}
        {timerActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card className="border-primary shadow-lg">
              <CardContent className="p-4 flex items-center gap-4">
                <Timer className="h-6 w-6 text-primary animate-pulse" />
                <span className="text-3xl font-mono font-bold">{formatTime(timerSeconds)}</span>
                <Button size="sm" variant="destructive" onClick={() => setTimerActive(false)}>
                  Parar
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {selectedProtocol.steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all ${
                    activeStep === index 
                      ? "border-primary shadow-md bg-primary/5" 
                      : activeStep > index 
                        ? "border-success/50 bg-success/5" 
                        : ""
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`
                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold
                        ${activeStep === index ? "bg-primary text-primary-foreground" : 
                          activeStep > index ? "bg-success text-success-foreground" : "bg-muted"}
                      `}>
                        {activeStep > index ? <CheckCircle2 className="h-5 w-5" /> : step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{step.title}</h4>
                          {step.timer && activeStep === index && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                startTimer(step.timer!);
                              }}
                            >
                              <Play className="h-3 w-3" />
                              {step.timer}s
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        {step.warning && (
                          <div className="mt-2 p-2 rounded bg-warning/10 border border-warning/30 text-warning text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            {step.warning}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                disabled={activeStep === 0}
                onClick={() => setActiveStep(prev => prev - 1)}
              >
                Passo Anterior
              </Button>
              <Button 
                disabled={activeStep === selectedProtocol.steps.length - 1}
                onClick={() => setActiveStep(prev => prev + 1)}
              >
                Próximo Passo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Medications & Notes */}
          <div className="space-y-4">
            {selectedProtocol.medications && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-warning" />
                    Medicações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedProtocol.medications.map((med, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {med.dose} - {med.route}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="font-medium">Telemedicina 24/7</span>
                </div>
                <Button className="w-full gap-2" variant="default">
                  <Phone className="h-4 w-4" />
                  Conectar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Protocolos de Emergência
          </h2>
          <p className="text-sm text-muted-foreground">
            Guias passo a passo para emergências médicas a bordo
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar protocolo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-warning" />
            Favoritos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROTOCOLS.filter(p => favorites.includes(p.id)).map((protocol) => {
              const Icon = categoryIcons[protocol.category];
              return (
                <Card 
                  key={protocol.id}
                  className="cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => {
                    setSelectedProtocol(protocol);
                    setActiveStep(0);
                  }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-destructive/10">
                      <Icon className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{protocol.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {protocol.estimatedTime}
                      </p>
                    </div>
                    <Badge variant={protocol.severity === "critical" ? "destructive" : "secondary"}>
                      {protocol.severity}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Protocols */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Todos os Protocolos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProtocols.map((protocol) => {
            const Icon = categoryIcons[protocol.category];
            return (
              <motion.div
                key={protocol.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card 
                  className="cursor-pointer hover:border-primary/50 transition-all h-full"
                  onClick={() => {
                    setSelectedProtocol(protocol);
                    setActiveStep(0);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(protocol.id);
                        }}
                      >
                        <Star className={`h-4 w-4 ${favorites.includes(protocol.id) ? "fill-warning text-warning" : ""}`} />
                      </Button>
                    </div>
                    <h4 className="font-medium mb-1">{protocol.name}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[protocol.category]}
                      </Badge>
                      <Badge 
                        variant={protocol.severity === "critical" ? "destructive" : 
                          protocol.severity === "high" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {protocol.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {protocol.estimatedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        {protocol.steps.length} passos
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
