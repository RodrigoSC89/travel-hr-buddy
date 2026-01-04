/**
 * PATCH 859: Product Roadmap Page
 * Visual roadmap showing module status, versions, and progress
 */

import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Rocket, 
  Shield, 
  Brain, 
  Database, 
  Smartphone,
  FileText,
  TestTube,
  Eye,
  Zap,
  Ship,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "planned" | "beta";
  progress: number;
  version: string;
  icon: React.ElementType;
  features: string[];
  releaseDate?: string;
}

const roadmapItems: RoadmapItem[] = [
  {
    id: "security",
    title: "Segurança Supabase",
    description: "RLS, proteção de senhas, auditoria completa",
    status: "completed",
    progress: 100,
    version: "v3.2.0",
    icon: Shield,
    features: [
      "RLS em todas tabelas sensíveis",
      "Audit logs completos",
      "Security scanner automático",
      "Extensões em schema separado"
    ],
    releaseDate: "2024-12"
  },
  {
    id: "beta-program",
    title: "Beta Program Management",
    description: "Email automation, feedback forms, status page",
    status: "completed",
    progress: 100,
    version: "v3.2.0",
    icon: Rocket,
    features: [
      "Email automation (Resend)",
      "Beta feedback form interativo",
      "Status page realtime",
      "Dashboard de resultados"
    ],
    releaseDate: "2025-01"
  },
  {
    id: "typescript",
    title: "Type Safety Completo",
    description: "Remoção de @ts-nocheck e tipagem estrita",
    status: "in-progress",
    progress: 90,
    version: "v3.2.0",
    icon: FileText,
    features: [
      "Workflows tipado ✓",
      "Core services tipados",
      "Edge Functions mantidos",
      "~20 arquivos restantes"
    ]
  },
  {
    id: "performance",
    title: "Performance Otimizada",
    description: "Lazy loading, cache trimming, modo lite",
    status: "in-progress",
    progress: 90,
    version: "v3.2.0",
    icon: Zap,
    features: [
      "usePerformanceMonitor hook ✓",
      "Core Web Vitals tracking ✓",
      "Lighthouse config ✓",
      "Bundle optimization ✓"
    ]
  },
  {
    id: "pwa-mobile",
    title: "PWA & Mobile Ready",
    description: "TWA Android, Expo iOS, offline completo",
    status: "in-progress",
    progress: 85,
    version: "v3.2.0",
    icon: Smartphone,
    features: [
      "usePWAStatus hook ✓",
      "Background sync worker ✓",
      "Offline detection ✓",
      "Install prompt ✓"
    ]
  },
  {
    id: "voice-ai",
    title: "IA de Voz",
    description: "Web Speech + ElevenLabs + AssemblyAI",
    status: "beta",
    progress: 70,
    version: "v3.2.0",
    icon: Activity,
    features: [
      "Comandos de voz",
      "Transcrição em tempo real",
      "Resposta por voz",
      "Contexto por módulo"
    ]
  },
  {
    id: "ai-autonomy",
    title: "IA Autônoma Nível 2",
    description: "Auto-correção e manutenção inteligente",
    status: "beta",
    progress: 60,
    version: "v3.2.0",
    icon: Brain,
    features: [
      "Detecção de falhas",
      "Correção automática",
      "Logs em ai_self_healing_logs",
      "Painel /ai-ops/logs"
    ]
  },
  {
    id: "external-apis",
    title: "APIs Externas",
    description: "Amadeus prod, StormGlass, Copernicus",
    status: "in-progress",
    progress: 50,
    version: "v3.2.0",
    icon: Database,
    features: [
      "Amadeus produção",
      "StormGlass meteorologia",
      "Copernicus satélite",
      "Zapier webhooks"
    ]
  },
  {
    id: "testing",
    title: "Testes E2E Playwright",
    description: "Cobertura completa de módulos críticos",
    status: "in-progress",
    progress: 70,
    version: "v3.2.0",
    icon: TestTube,
    features: [
      "Beta Program ✓",
      "Voice AI ✓",
      "Performance/PWA ✓",
      "Critical Features ✓",
      "12+ spec files"
    ]
  },
  {
    id: "observability",
    title: "Observabilidade Central",
    description: "Sentry, PostHog, heatmaps",
    status: "planned",
    progress: 30,
    version: "v3.3.0",
    icon: Eye,
    features: [
      "Sentry para erros",
      "PostHog analytics",
      "Heatmaps de uso",
      "Tracking por módulo"
    ]
  },
  {
    id: "documentation",
    title: "Documentação Técnica",
    description: "Storybook, OpenAPI, Markdown automático",
    status: "planned",
    progress: 20,
    version: "v3.3.0",
    icon: FileText,
    features: [
      "Storybook para UI",
      "OpenAPI para Edge Functions",
      "Markdown por módulo",
      "Publicação em /docs"
    ]
  }
];

const getStatusColor = (status: RoadmapItem["status"]) => {
  switch (status) {
    case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "in-progress": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "planned": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    case "beta": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  }
};

const getStatusIcon = (status: RoadmapItem["status"]) => {
  switch (status) {
    case "completed": return CheckCircle2;
    case "in-progress": return Clock;
    case "planned": return AlertCircle;
    case "beta": return Rocket;
  }
};

const getStatusLabel = (status: RoadmapItem["status"]) => {
  switch (status) {
    case "completed": return "Concluído";
    case "in-progress": return "Em Progresso";
    case "planned": return "Planejado";
    case "beta": return "Beta";
  }
};

export default function Roadmap() {
  const completedCount = roadmapItems.filter(i => i.status === "completed").length;
  const inProgressCount = roadmapItems.filter(i => i.status === "in-progress").length;
  const overallProgress = Math.round(roadmapItems.reduce((sum, i) => sum + i.progress, 0) / roadmapItems.length);

  return (
    <>
      <Helmet>
        <title>Roadmap | Nautilus One</title>
        <meta name="description" content="Roadmap de desenvolvimento do Nautilus One - Status de módulos e funcionalidades" />
      </Helmet>

      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Ship className="h-8 w-8 text-primary" />
                Roadmap v3.2.0
              </h1>
              <p className="text-muted-foreground mt-1">
                Status de desenvolvimento e funcionalidades planejadas
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{completedCount}</div>
                <div className="text-xs text-muted-foreground">Concluídos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{inProgressCount}</div>
                <div className="text-xs text-muted-foreground">Em Progresso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{overallProgress}%</div>
                <div className="text-xs text-muted-foreground">Progresso Total</div>
              </div>
            </div>
          </motion.div>

          {/* Progress Overview */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progresso Geral v3.2.0</span>
                <span className="text-sm font-medium text-foreground">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="completed">Concluídos</TabsTrigger>
              <TabsTrigger value="in-progress">Em Progresso</TabsTrigger>
              <TabsTrigger value="beta">Beta</TabsTrigger>
              <TabsTrigger value="planned">Planejados</TabsTrigger>
            </TabsList>

            {["all", "completed", "in-progress", "beta", "planned"].map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {roadmapItems
                    .filter(item => tab === "all" || item.status === tab)
                    .map((item, index) => {
                      const StatusIcon = getStatusIcon(item.status);
                      const ItemIcon = item.icon;
                      
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="h-full border-border/50 bg-card/50 backdrop-blur hover:border-primary/30 transition-colors">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-primary/10">
                                    <ItemIcon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-base">{item.title}</CardTitle>
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {item.version}
                                    </Badge>
                                  </div>
                                </div>
                                <Badge className={`${getStatusColor(item.status)} flex items-center gap-1`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {getStatusLabel(item.status)}
                                </Badge>
                              </div>
                              <CardDescription className="mt-2">
                                {item.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">Progresso</span>
                                    <span className="font-medium">{item.progress}%</span>
                                  </div>
                                  <Progress value={item.progress} className="h-2" />
                                </div>
                                
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {item.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <CheckCircle2 className="h-3 w-3 text-primary/60" />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>

                                {item.releaseDate && (
                                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                                    Lançado em: {item.releaseDate}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Release Notes */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                Notas de Release v3.2.0
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ul className="space-y-2 text-muted-foreground">
                  <li>✅ RLS aplicado em todas as tabelas sensíveis</li>
                  <li>✅ Security scanner automático implementado</li>
                  <li>✅ PWA com Service Worker v4 e offline completo</li>
                  <li>✅ IA integrada em todos os módulos principais</li>
                  <li>✅ Sistema de tripulação com certificações</li>
                  <li>🔄 Remoção de @ts-nocheck em progresso (85%)</li>
                  <li>🔄 Testes E2E Playwright em desenvolvimento</li>
                  <li>🧪 IA de voz em beta testing</li>
                  <li>🧪 IA Autônoma Nível 2 em beta</li>
                  <li>📋 Documentação técnica planejada para v3.3.0</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
