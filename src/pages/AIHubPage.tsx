/**
 * AI Hub Page - Central de IAs do Nauti One
 * Acesso a todas as 16 IAs especializadas
 * PATCH AI-TRAINING v2.0
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  Brain, 
  Zap, 
  Shield,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AIModuleSelector } from '@/components/ai/AIModuleSelector';
import { UniversalAIChat } from '@/components/ai/UniversalAIChat';
import { AI_MODULES, type AIModuleKey } from '@/lib/ai-prompts';

export default function AIHubPage() {
  const [selectedModule, setSelectedModule] = useState<AIModuleKey>('command');

  const stats = {
    totalModules: Object.keys(AI_MODULES).length,
    totalCapabilities: Object.values(AI_MODULES).reduce(
      (acc, m) => acc + m.capabilities.length, 0
    ),
    categories: 4,
    availability: '99.9%'
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nauti One AI Hub</h1>
              <p className="text-muted-foreground">
                Central de Inteligência Artificial Marítima
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {stats.totalModules} IAs Especializadas
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            {stats.totalCapabilities} Capacidades
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Bot className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalModules}</div>
                <div className="text-sm text-muted-foreground">IAs Ativas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalCapabilities}</div>
                <div className="text-sm text-muted-foreground">Capacidades</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.availability}</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">Enterprise</div>
                <div className="text-sm text-muted-foreground">Segurança</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="selector" className="space-y-4">
        <TabsList>
          <TabsTrigger value="selector" className="gap-2">
            <Bot className="h-4 w-4" />
            Selecionar IA
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat Direto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="selector">
          <Card>
            <CardHeader>
              <CardTitle>IAs Especializadas</CardTitle>
              <CardDescription>
                Escolha a IA mais adequada para sua necessidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIModuleSelector 
                onSelect={setSelectedModule}
                showChat={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Module List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">IAs Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 p-2">
                  {Object.entries(AI_MODULES).map(([key, config]) => (
                    <button
                      key={key}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                        selectedModule === key 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedModule(key as AIModuleKey)}
                    >
                      <span className="text-lg">{config.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{config.name}</div>
                        <div className={`text-xs ${
                          selectedModule === key 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {config.capabilities.length} capacidades
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <div className="lg:col-span-2">
              <UniversalAIChat
                module={selectedModule}
                welcomeMessage={`Olá! Sou o **${AI_MODULES[selectedModule].name}** - ${AI_MODULES[selectedModule].description}.\n\nPosso ajudar com:\n${AI_MODULES[selectedModule].capabilities.slice(0, 5).map(c => `• ${c.replace(/_/g, ' ')}`).join('\n')}\n\nComo posso ajudar você hoje?`}
                className="h-[600px]"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">Conhecimento Profundo</CardTitle>
              <CardDescription>
                System prompts de 1500-2000 palavras com conhecimento técnico marítimo especializado
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-info" />
              </div>
              <CardTitle className="text-base">Respostas Estruturadas</CardTitle>
              <CardDescription>
                Formatos otimizados para cada tipo de consulta: evidências, análises, relatórios
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <CardTitle className="text-base">Compliance Integrado</CardTitle>
              <CardDescription>
                IAs treinadas com SOLAS, MARPOL, STCW, MLC, ISM, ISPS e regulamentações Petrobras
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}