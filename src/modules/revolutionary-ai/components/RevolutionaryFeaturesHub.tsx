/**
 * Revolutionary Features Hub - Central de Funcionalidades Revolucionárias
 * Consolida todas as 9 funcionalidades revolucionárias do Nautilus One
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Blocks, Glasses, Heart, Globe2, Smile,
  Atom, Trophy, Wrench, Sparkles, TrendingUp, Shield,
  Zap, Users, Ship, Activity, Target, BarChart3
} from "lucide-react";

// Feature configurations
const REVOLUTIONARY_FEATURES = [
  {
    id: "autonomous-ai",
    name: "IA Autônoma Nível 5",
    icon: Brain,
    status: "active",
    progress: 75,
    color: "from-violet-500 to-purple-600",
    description: "IA que opera com ZERO intervenção humana em operações rotineiras",
    stats: { decisions: "12,458", accuracy: "97.3%", savings: "$2.3M" }
  },
  {
    id: "blockchain",
    name: "Blockchain Marítimo",
    icon: Blocks,
    status: "beta",
    progress: 60,
    color: "from-blue-500 to-cyan-600",
    description: "Smart contracts e certificados imutáveis na blockchain",
    stats: { contracts: "847", verified: "100%", disputes: "0" }
  },
  {
    id: "vr-ar",
    name: "VR/AR Training",
    icon: Glasses,
    status: "active",
    progress: 85,
    color: "from-green-500 to-emerald-600",
    description: "Treinamento imersivo e suporte remoto com realidade aumentada",
    stats: { trained: "1,247", scenarios: "45", retention: "+60%" }
  },
  {
    id: "biometrics",
    name: "Biometria & Saúde",
    icon: Heart,
    status: "active",
    progress: 80,
    color: "from-red-500 to-pink-600",
    description: "Monitoramento 24/7 de saúde e prevenção preditiva",
    stats: { monitored: "847", prevented: "23", satisfaction: "94%" }
  },
  {
    id: "global-network",
    name: "Global Network",
    icon: Globe2,
    status: "beta",
    progress: 45,
    color: "from-indigo-500 to-blue-600",
    description: "Rede global de inteligência coletiva entre 10,000+ navios",
    stats: { vessels: "3,847", dataPoints: "1.2B", savings: "$1.8M" }
  },
  {
    id: "emotional-ai",
    name: "Emotional AI",
    icon: Smile,
    status: "active",
    progress: 70,
    color: "from-yellow-500 to-orange-600",
    description: "IA que entende emoções e otimiza dinâmica de equipe",
    stats: { conflicts: "-80%", satisfaction: "+50%", turnover: "-40%" }
  },
  {
    id: "quantum",
    name: "Quantum Computing",
    icon: Atom,
    status: "roadmap",
    progress: 15,
    color: "from-purple-500 to-pink-600",
    description: "Otimização quântica para problemas de complexidade exponencial",
    stats: { eta: "2030", speedup: "1000x", precision: "∞" }
  },
  {
    id: "gamification",
    name: "Gamification Extrema",
    icon: Trophy,
    status: "active",
    progress: 95,
    color: "from-amber-500 to-yellow-600",
    description: "Sistema de pontos, níveis e recompensas para engagement máximo",
    stats: { users: "2,847", engagement: "95%", performance: "+40%" }
  },
  {
    id: "self-healing",
    name: "Self-Healing",
    icon: Wrench,
    status: "active",
    progress: 82,
    color: "from-teal-500 to-cyan-600",
    description: "Infraestrutura que detecta e corrige problemas automaticamente",
    stats: { uptime: "99.99%", mttr: "36s", prevented: "847" }
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
  const [selectedFeature, setSelectedFeature] = useState(REVOLUTIONARY_FEATURES[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Funcionalidades Revolucionárias
          </h1>
          <Sparkles className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          9 tecnologias disruptivas que transformam o Nautilus One no sistema marítimo mais avançado do mundo
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Features Ativas", value: "7", icon: Zap, color: "text-green-500" },
          { label: "Decisões IA/Dia", value: "45K", icon: Brain, color: "text-violet-500" },
          { label: "ROI Anual", value: "$9.5M", icon: TrendingUp, color: "text-emerald-500" },
          { label: "Tripulantes", value: "2,847", icon: Users, color: "text-blue-500" }
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

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REVOLUTIONARY_FEATURES.map((feature, i) => {
          const status = getStatusBadge(feature.status);
          const isSelected = selectedFeature.id === feature.id;
          
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedFeature(feature)}
              className="cursor-pointer"
            >
              <Card className={`transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}>
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

      {/* Selected Feature Detail */}
      <motion.div
        key={selectedFeature.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className={`bg-gradient-to-br ${selectedFeature.color} text-white`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <selectedFeature.icon className="h-8 w-8" />
              <div>
                <CardTitle className="text-2xl text-white">{selectedFeature.name}</CardTitle>
                <CardDescription className="text-white/80">
                  {selectedFeature.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(selectedFeature.stats).map(([key, value]) => (
                <div key={key} className="bg-white/10 rounded-lg p-4 text-center backdrop-blur-sm">
                  <p className="text-3xl font-bold">{value}</p>
                  <p className="text-sm text-white/70 capitalize">{key}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1">
                <Activity className="h-4 w-4 mr-2" />
                Ver Métricas
              </Button>
              <Button variant="secondary" className="flex-1">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="secondary" className="flex-1">
                <Target className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default RevolutionaryFeaturesHub;
