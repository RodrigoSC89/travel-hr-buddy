/**
 * Revolutionary Features Hub - Central de Funcionalidades Revolucionárias
 * PATCH REVOLUTION v1.0
 * Consolida todas as 9 funcionalidades revolucionárias do Nautilus One
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain, Blocks, Glasses, Heart, Globe2, Smile,
  Atom, Trophy, Wrench, Sparkles, TrendingUp, Shield,
  Zap, Users, Ship, Activity, Target, BarChart3
} from "lucide-react";

// Import revolutionary components
import { AutonomousOperationsCenter } from "./AutonomousOperationsCenter";
import { MaritimeBlockchainNetwork } from "./MaritimeBlockchainNetwork";
import { GamificationExtreme } from "./GamificationExtreme";
import { CrewHealthIntelligence } from "./CrewHealthIntelligence";
import { VRARTrainingCenter } from "./VRARTrainingCenter";
import { GlobalMaritimeNetwork } from "./GlobalMaritimeNetwork";
import { SelfHealingSystem } from "./SelfHealingSystem";
import { EmotionalAISystem } from "./EmotionalAISystem";

// Feature configurations
const REVOLUTIONARY_FEATURES = [
  {
    id: "autonomous-ai",
    name: "IA Autônoma Nível 5",
    icon: Brain,
    status: "active",
    progress: 75,
    color: "from-secondary to-accent",
    description: "IA que opera com ZERO intervenção humana em operações rotineiras",
    stats: { decisions: "12,458", accuracy: "97.3%", savings: "$2.3M" },
    component: "autonomous"
  },
  {
    id: "blockchain",
    name: "Blockchain Marítimo",
    icon: Blocks,
    status: "beta",
    progress: 60,
    color: "from-primary to-info",
    description: "Smart contracts e certificados imutáveis na blockchain",
    stats: { contracts: "847", verified: "100%", disputes: "0" },
    component: "blockchain"
  },
  {
    id: "vr-ar",
    name: "VR/AR Training",
    icon: Glasses,
    status: "active",
    progress: 85,
    color: "from-success to-success/80",
    description: "Treinamento imersivo e suporte remoto com realidade aumentada",
    stats: { trained: "1,247", scenarios: "45", retention: "+60%" },
    component: "vrar"
  },
  {
    id: "biometrics",
    name: "Biometria & Saúde",
    icon: Heart,
    status: "active",
    progress: 80,
    color: "from-destructive to-accent",
    description: "Monitoramento 24/7 de saúde e prevenção preditiva",
    stats: { monitored: "847", prevented: "23", satisfaction: "94%" },
    component: "health"
  },
  {
    id: "global-network",
    name: "Global Network",
    icon: Globe2,
    status: "beta",
    progress: 45,
    color: "from-secondary to-primary",
    description: "Rede global de inteligência coletiva entre 10,000+ navios",
    stats: { vessels: "3,847", dataPoints: "1.2B", savings: "$1.8M" },
    component: "network"
  },
  {
    id: "gamification",
    name: "Gamification Extrema",
    icon: Trophy,
    status: "active",
    progress: 95,
    color: "from-warning to-warning/80",
    description: "Sistema de pontos, níveis e recompensas para engagement máximo",
    stats: { users: "2,847", engagement: "95%", performance: "+40%" },
    component: "gamification"
  },
  {
    id: "self-healing",
    name: "Self-Healing",
    icon: Wrench,
    status: "active",
    progress: 82,
    color: "from-info to-primary",
    description: "Infraestrutura que detecta e corrige problemas automaticamente",
    stats: { uptime: "99.99%", mttr: "36s", prevented: "847" },
    component: "selfhealing"
  },
  {
    id: "emotional-ai",
    name: "Emotional AI",
    icon: Smile,
    status: "active",
    progress: 70,
    color: "from-yellow-500 to-orange-600",
    description: "IA que entende emoções e otimiza dinâmica de equipe",
    stats: { conflicts: "-80%", satisfaction: "+50%", turnover: "-40%" },
    component: "emotional"
  },
  {
    id: "quantum",
    name: "Quantum Computing",
    icon: Atom,
    status: "roadmap",
    progress: 15,
    color: "from-purple-500 to-pink-600",
    description: "Otimização quântica para problemas de complexidade exponencial",
    stats: { eta: "2030", speedup: "1000x", precision: "∞" },
    component: "quantum"
  }
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
    active: { variant: "default", label: "Ativo" },
    beta: { variant: "secondary", label: "Beta" },
    roadmap: { variant: "outline", label: "Roadmap" }
  };
  return variants[status] || variants.active;
};

export function RevolutionaryFeaturesHub() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const renderFeatureComponent = (componentId: string) => {
    switch (componentId) {
      case "autonomous":
        return <AutonomousOperationsCenter />;
      case "blockchain":
        return <MaritimeBlockchainNetwork />;
      case "vrar":
        return <VRARTrainingCenter />;
      case "health":
        return <CrewHealthIntelligence />;
      case "network":
        return <GlobalMaritimeNetwork />;
      case "gamification":
        return <GamificationExtreme />;
      case "selfhealing":
        return <SelfHealingSystem />;
      case "emotional":
        return <EmotionalAISystem />;
      default:
        return (
          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <Atom className="h-16 w-16 mx-auto mb-4 text-primary/60 animate-pulse" />
            <h3 className="text-xl font-bold mb-2">Módulo Avançado</h3>
            <p className="text-muted-foreground mb-4">
              Funcionalidade de IA revolucionária em fase de testes
            </p>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              Beta Experimental
            </Badge>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-warning" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
            Funcionalidades Revolucionárias
          </h1>
          <Sparkles className="h-8 w-8 text-warning" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          9 tecnologias disruptivas que transformam o Nautilus One no sistema marítimo mais avançado do mundo
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Features Ativas", value: "7", icon: Zap, color: "text-success" },
          { label: "Decisões IA/Dia", value: "45K", icon: Brain, color: "text-secondary" },
          { label: "ROI Anual", value: "$9.5M", icon: TrendingUp, color: "text-success" },
          { label: "Tripulantes", value: "2,847", icon: Users, color: "text-primary" }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none bg-gradient-to-br from-background to-muted/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-full justify-start gap-1 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Overview
            </TabsTrigger>
            {REVOLUTIONARY_FEATURES.slice(0, 7).map((feature) => (
              <TabsTrigger 
                key={feature.id} 
                value={feature.component}
                className="flex items-center gap-1"
              >
                <feature.icon className="h-4 w-4" />
                <span className="hidden md:inline">{feature.name.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value="overview" className="mt-6">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REVOLUTIONARY_FEATURES.map((feature, i) => {
              const status = getStatusBadge(feature.status);
              
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => feature.status !== "roadmap" && setSelectedTab(feature.component)}
                  className={feature.status !== "roadmap" ? "cursor-pointer" : ""}
                >
                  <Card className={`transition-all hover:shadow-lg ${feature.status !== "roadmap" ? "hover:ring-2 hover:ring-primary/50" : "opacity-70"}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color}`}>
                          <feature.icon className="h-5 w-5 text-white" />
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{feature.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{feature.progress}%</span>
                        </div>
                        <Progress value={feature.progress} className="h-1.5" />
                        
                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                          {Object.entries(feature.stats).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <p className="text-sm font-bold">{value}</p>
                              <p className="text-[10px] text-muted-foreground capitalize">{key}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {REVOLUTIONARY_FEATURES.map((feature) => (
          <TabsContent key={feature.id} value={feature.component} className="mt-6">
            {renderFeatureComponent(feature.component)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default RevolutionaryFeaturesHub;
