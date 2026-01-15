/**
 * Documentation Hub - Central de Documentação do Sistema
 * Documentação técnica, APIs, guias por módulo
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Book, 
  Code, 
  Cpu, 
  Database, 
  FileCode, 
  Search, 
  ExternalLink,
  ChevronRight,
  Anchor,
  Users,
  Shield,
  Brain,
  Wrench,
  BarChart3
} from "lucide-react";

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  articles: { title: string; path: string }[];
}

export default function DocumentationHub() {
  const [searchQuery, setSearchQuery] = useState("");

  const docSections: DocSection[] = [
    {
      id: "getting-started",
      title: "Primeiros Passos",
      description: "Introdução ao Nautilus One",
      icon: Book,
      articles: [
        { title: "Visão Geral do Sistema", path: "#overview" },
        { title: "Arquitetura do Sistema", path: "#architecture" },
        { title: "Configuração Inicial", path: "#setup" },
        { title: "Autenticação e Segurança", path: "#auth" }
      ]
    },
    {
      id: "modules",
      title: "Módulos do Sistema",
      description: "Documentação por módulo funcional",
      icon: Cpu,
      articles: [
        { title: "Nautilus Command Center", path: "#nautilus-command" },
        { title: "Fleet Command", path: "#fleet-command" },
        { title: "Crew Management", path: "#crew-management" },
        { title: "Maintenance Command", path: "#maintenance" },
        { title: "Compliance Hub", path: "#compliance" },
        { title: "Telemetria Preditiva", path: "#telemetria" }
      ]
    },
    {
      id: "ai",
      title: "Inteligência Artificial",
      description: "Documentação dos hooks e sistemas de IA",
      icon: Brain,
      articles: [
        { title: "useNautiAI - Hook Universal", path: "#use-nauti-ai" },
        { title: "useAIAssistant - Modo Assistente", path: "#use-ai-assistant" },
        { title: "useAIAdvisor - Especialistas", path: "#use-ai-advisor" },
        { title: "useAutonomousAI - IA Autônoma", path: "#use-autonomous-ai" },
        { title: "useTelemetryAI - IA Preditiva", path: "#use-telemetry-ai" },
        { title: "Copilot Contextual", path: "#copilot" }
      ]
    },
    {
      id: "api",
      title: "API & Edge Functions",
      description: "Documentação técnica das APIs",
      icon: Code,
      articles: [
        { title: "nauti-intelligence", path: "#nauti-intelligence" },
        { title: "elevenlabs-voice", path: "#elevenlabs-voice" },
        { title: "external-integrations", path: "#external-integrations" },
        { title: "dp-intelligence-ai", path: "#dp-intelligence" },
        { title: "solas-training-ai", path: "#solas-training" }
      ]
    },
    {
      id: "database",
      title: "Banco de Dados",
      description: "Esquema e políticas RLS",
      icon: Database,
      articles: [
        { title: "Esquema de Tabelas", path: "#schema" },
        { title: "Políticas RLS", path: "#rls" },
        { title: "Migrations", path: "#migrations" },
        { title: "Backup e Recuperação", path: "#backup" }
      ]
    },
    {
      id: "security",
      title: "Segurança",
      description: "Práticas de segurança e compliance",
      icon: Shield,
      articles: [
        { title: "Autenticação JWT", path: "#jwt" },
        { title: "Row Level Security", path: "#rls-policies" },
        { title: "Proteção de PII", path: "#pii" },
        { title: "Auditoria de Acessos", path: "#audit" }
      ]
    }
  ];

  const hooks = [
    { name: "useNautilusAI", description: "Hook universal para interações com IA", status: "stable" },
    { name: "useAIAssistant", description: "Modo assistente com cache e histórico", status: "stable" },
    { name: "useAIAdvisor", description: "Funções especialistas: Auditor, Engenheiro, Gestor", status: "stable" },
    { name: "useAIMemory", description: "Memória persistente para contexto de longo prazo", status: "stable" },
    { name: "useAutonomousAI", description: "Sistema de decisão autônoma com logs", status: "stable" },
    { name: "useTelemetryAI", description: "IA preditiva para sensores e telemetria", status: "stable" }
  ];

  const edgeFunctions = [
    { name: "nautilus-intelligence", description: "Gateway unificado de IA", jwt: false },
    { name: "elevenlabs-voice", description: "Text-to-Speech e Speech-to-Text", jwt: false },
    { name: "external-integrations", description: "Slack, WhatsApp, Webhooks", jwt: false },
    { name: "dp-intelligence-ai", description: "DP Intelligence para posicionamento", jwt: false },
    { name: "solas-training-ai", description: "IA para treinamento SOLAS", jwt: false }
  ];

  const filteredSections = docSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.articles.some(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            📘 Documentação Nautilus One
          </h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto font-medium">
            Documentação técnica completa do sistema de gestão marítima com IA
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
            <Input
              placeholder="Buscar na documentação..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="guides" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="guides">
              <Book className="h-4 w-4 mr-2" />
              Guias
            </TabsTrigger>
            <TabsTrigger value="hooks">
              <Code className="h-4 w-4 mr-2" />
              Hooks IA
            </TabsTrigger>
            <TabsTrigger value="api">
              <FileCode className="h-4 w-4 mr-2" />
              Edge Functions
            </TabsTrigger>
            <TabsTrigger value="changelog">
              <BarChart3 className="h-4 w-4 mr-2" />
              Changelog
            </TabsTrigger>
          </TabsList>

          {/* Guides Tab */}
          <TabsContent value="guides">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer bg-card">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <section.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground font-semibold">{section.title}</CardTitle>
                          <CardDescription className="text-foreground/70 font-medium">{section.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.articles.map((article) => (
                          <li key={article.path}>
                            <a 
                              href={article.path}
                              className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors font-medium"
                            >
                              <ChevronRight className="h-3 w-3 text-primary" />
                              {article.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Hooks Tab */}
          <TabsContent value="hooks">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Hooks de Inteligência Artificial</CardTitle>
                <CardDescription className="text-foreground/70 font-medium">
                  React hooks para integração com o sistema de IA do Nautilus One
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hooks.map((hook) => (
                    <div 
                      key={hook.name}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <code className="font-mono text-sm font-semibold text-primary">{hook.name}</code>
                          <p className="text-sm text-foreground/80 font-medium">{hook.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-success border-success">
                        {hook.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Exemplo de Uso</h4>
                  <pre className="text-sm bg-background p-3 rounded overflow-x-auto">
{`import { useNautilusAI } from "@/hooks/useNautilusAI";

function MyComponent() {
  const { sendMessage, isLoading, response } = useNautilusAI();
  
  const handleAsk = async () => {
    await sendMessage("Analise o status da frota");
  };
  
  return (
    <div>
      <button onClick={handleAsk}>Perguntar à IA</button>
      {response && <p>{response}</p>}
    </div>
  );
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Edge Functions (Supabase)</CardTitle>
                <CardDescription className="text-foreground/70 font-medium">
                  Funções serverless para backend e integrações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {edgeFunctions.map((fn) => (
                    <div 
                      key={fn.name}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <FileCode className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <code className="font-mono text-sm font-semibold text-foreground">{fn.name}</code>
                          <p className="text-sm text-foreground/80 font-medium">{fn.description}</p>
                        </div>
                      </div>
                      <Badge variant={fn.jwt ? "default" : "secondary"}>
                        {fn.jwt ? "JWT Required" : "Public"}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Endpoint Base</h4>
                  <code className="text-sm bg-background p-2 rounded block">
                    https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Changelog Tab */}
          <TabsContent value="changelog">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Changelog</CardTitle>
                <CardDescription className="text-foreground/70 font-medium">Histórico de atualizações do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-6">
                    <div className="border-l-2 border-primary pl-4">
                      <Badge className="mb-2">v2.0.0 - PATCH 853</Badge>
                      <h4 className="font-semibold text-foreground">Ativação Completa do Sistema</h4>
                      <ul className="text-sm text-foreground/80 space-y-1 mt-2 font-medium">
                        <li>✅ IA Autônoma com painel de decisões</li>
                        <li>✅ Comando de Voz com ElevenLabs</li>
                        <li>✅ Telemetria Preditiva com IA</li>
                        <li>✅ Security Center completo</li>
                        <li>✅ Simulador de Incidentes</li>
                        <li>✅ Integrações externas (Slack, WhatsApp, Webhooks)</li>
                        <li>✅ PWA com suporte offline</li>
                        <li>✅ Copilot Contextual por módulo</li>
                      </ul>
                    </div>

                    <div className="border-l-2 border-muted pl-4">
                      <Badge variant="secondary" className="mb-2">v1.9.0 - PATCH 852</Badge>
                      <h4 className="font-semibold text-foreground">AI Operations Center</h4>
                      <ul className="text-sm text-foreground/80 space-y-1 mt-2 font-medium">
                        <li>• Painel de IA Autônoma</li>
                        <li>• Telemetria Preditiva</li>
                        <li>• Security Center inicial</li>
                      </ul>
                    </div>

                    <div className="border-l-2 border-muted pl-4">
                      <Badge variant="secondary" className="mb-2">v1.8.0</Badge>
                      <h4 className="font-semibold text-foreground">Revolutionary Features</h4>
                      <ul className="text-sm text-foreground/80 space-y-1 mt-2 font-medium">
                        <li>• Vision AI para documentos</li>
                        <li>• AIS Tracking global</li>
                        <li>• Certificate Blockchain</li>
                        <li>• Voice Assistant</li>
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
