import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, BookOpen, Video, FileText, Download, 
  Play, CheckCircle, Clock, Users, Anchor,
  Bot, Lightbulb, ArrowRight, Star, Filter
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  module: string;
  type: "video" | "step-by-step" | "guide";
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  content: any[];
  views: number;
  rating: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  module: string;
  tags: string[];
  helpful: number;
}

interface TrainingPath {
  id: string;
  title: string;
  description: string;
  role: string;
  modules: string[];
  progress: number;
  estimatedTime: string;
  tutorials: Tutorial[];
}

export const IntelligentHelpCenter: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModule, setActiveModule] = useState("all");
  const [activeTab, setActiveTab] = useState("search");
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [trainingPaths, setTrainingPaths] = useState<TrainingPath[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const modules = [
    { id: "all", name: "Todos", icon: Anchor },
    { id: "maritime", name: "Sistema Marítimo", icon: Anchor },
    { id: "hr", name: "Recursos Humanos", icon: Users },
    { id: "travel", name: "Viagens", icon: Play },
    { id: "reservations", name: "Reservas", icon: Clock },
    { id: "price-alerts", name: "Alertas de Preço", icon: FileText }
  ];

  // Dados de exemplo (em produção viria do Supabase)
  const sampleTutorials: Tutorial[] = [
    {
      id: "1",
      title: "Como criar uma escala de tripulação",
      description: "Tutorial completo para criação e gestão de escalas",
      module: "maritime",
      type: "step-by-step",
      duration: "15 min",
      difficulty: "beginner",
      tags: ["escala", "tripulação", "gestão"],
      content: [
        { step: 1, title: "Acesse o módulo Marítimo", description: "Navegue até Sistema Marítimo > Gestão de Tripulação" },
        { step: 2, title: "Clique em \"Nova Escala\"", description: "Localize o botão no canto superior direito" },
        { step: 3, title: "Preencha os dados", description: "Defina embarcação, período e tripulantes" }
      ],
      views: 150,
      rating: 4.8
    },
    {
      id: "2",
      title: "Configurando alertas de preço",
      description: "Como monitorar preços e receber notificações",
      module: "price-alerts",
      type: "video",
      duration: "8 min",
      difficulty: "beginner",
      tags: ["preços", "alertas", "notificações"],
      content: [],
      views: 89,
      rating: 4.6
    }
  ];

  const sampleFAQs: FAQ[] = [
    {
      id: "1",
      question: "Como alterar o status de uma reserva?",
      answer: "Para alterar o status de uma reserva, vá até o módulo Reservas, localize a reserva desejada e clique no menu de ações (três pontos). Selecione \"Alterar Status\" e escolha o novo status.",
      module: "reservations",
      tags: ["reserva", "status", "alteração"],
      helpful: 45
    },
    {
      id: "2",
      question: "Posso exportar relatórios de viagens?",
      answer: "Sim! No módulo Viagens, clique em \"Relatórios\" e selecione o período desejado. Você pode exportar em PDF, Excel ou CSV.",
      module: "travel",
      tags: ["relatórios", "exportar", "viagens"],
      helpful: 32
    }
  ];

  const sampleTrainingPaths: TrainingPath[] = [
    {
      id: "1",
      title: "Onboarding Gestor RH",
      description: "Roteiro completo para gestores de recursos humanos",
      role: "hr_manager",
      modules: ["hr", "maritime"],
      progress: 60,
      estimatedTime: "2h 30min",
      tutorials: [sampleTutorials[0]]
    }
  ];

  useEffect(() => {
    setTutorials(sampleTutorials);
    setFaqs(sampleFAQs);
    setTrainingPaths(sampleTrainingPaths);
  }, []);

  const handleSmartSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Busca no banco de dados
      const { data: searchResults, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("status", "published")
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
        .limit(10);

      if (error) throw error;

      // Registrar analytics da busca
      await supabase
        .from("help_center_analytics")
        .insert({
          action_type: "search",
          session_data: { query, results_count: searchResults?.length || 0 },
          user_id: null // Seria auth.uid() se autenticado
        });

      // Busca inteligente usando IA para sugestões
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: `Buscar ajuda sobre: ${query}`,
          context: "help_search",
          modules: modules.map(m => m.id)
        }
      });

      setSearchResults(searchResults || []);
      
      toast({
        title: "Busca realizada",
        description: `Encontrados ${searchResults?.length || 0} resultados para "${query}"`,
      });

    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível realizar a busca",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trackAnalytics = async (action: string, itemId?: string, data?: any) => {
    try {
      await supabase
        .from("help_center_analytics")
        .insert({
          knowledge_item_id: itemId || null,
          action_type: action,
          session_data: data || {},
          user_id: null // Seria auth.uid() se autenticado
        });
    } catch (error) {
      logger.error("Failed to track user action:", error);
    }
  };

  const handleExportMaterial = async (type: "pdf" | "video" | "image", content: any) => {
    toast({
      title: "Exportando material",
      description: `Preparando ${type.toUpperCase()} para download...`,
    });
    
    // Implementar exportação real
    setTimeout(() => {
      toast({
        title: "Download iniciado",
        description: "O arquivo será baixado em breve",
      });
    }, 2000);
  };

  const filteredContent = (content: any[]) => {
    if (activeModule === "all") return content;
    return content.filter(item => item.module === activeModule);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Central de Ajuda Inteligente
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Encontre respostas, aprenda funcionalidades e domine o Nautilus One com nossa IA especializada
          </p>
        </div>

        {/* Busca Inteligente */}
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Digite sua dúvida ou o que deseja aprender (ex: 'como criar escala?')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSmartSearch(searchQuery)}
                  className="pl-12 text-lg h-14"
                />
              </div>
              <Button 
                onClick={() => handleSmartSearch(searchQuery)}
                disabled={isLoading}
                className="h-14 px-8"
              >
                {isLoading ? <Clock className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Buscar
              </Button>
            </div>

            {/* Resultados da Busca */}
            {searchResults.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold">Resultados da Busca</h3>
                <div className="grid gap-4">
                  {searchResults.map((result) => (
                    <Card key={result.id} className="border border-primary/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={result.type === "tutorial" ? "default" : "secondary"}>
                                {result.type === "tutorial" ? "Tutorial" : "FAQ"}
                              </Badge>
                              {result.type === "tutorial" && (
                                <Badge variant="outline">{result.difficulty}</Badge>
                              )}
                            </div>
                            <h4 className="font-semibold text-lg mb-2">
                              {result.type === "tutorial" ? result.title : result.question}
                            </h4>
                            <p className="text-muted-foreground">
                              {result.type === "tutorial" ? result.description : result.answer}
                            </p>
                            {result.type === "tutorial" && (
                              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {result.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Play className="w-4 h-4" />
                                  {result.views} visualizações
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  {result.rating}
                                </span>
                              </div>
                            )}
                          </div>
                          <Button size="sm" className="ml-4">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filtro por Módulo */}
        <div className="flex flex-wrap gap-2">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Button
                key={module.id}
                variant={activeModule === module.id ? "default" : "outline"}
                onClick={() => setActiveModule(module.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {module.name}
              </Button>
            );
          })}
        </div>

        {/* Conteúdo Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search">🔍 Busca</TabsTrigger>
            <TabsTrigger value="tutorials">📚 Tutoriais</TabsTrigger>
            <TabsTrigger value="faq">❓ FAQ</TabsTrigger>
            <TabsTrigger value="training">🎓 Treinamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sugestões Rápidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Dicas Rápidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm">💡 Use atalhos de teclado Ctrl+K para busca rápida</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="text-sm">⚡ Clique duas vezes em qualquer card para ação rápida</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <p className="text-sm">🎯 Use filtros para encontrar conteúdo específico</p>
                  </div>
                </CardContent>
              </Card>

              {/* Ações Sugeridas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Ações Sugeridas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Criar nova reserva
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Gerenciar tripulação
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Anchor className="w-4 h-4 mr-2" />
                    Configurar embarcação
                  </Button>
                </CardContent>
              </Card>

              {/* Estatísticas de Uso */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Mais Populares
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredContent(tutorials).slice(0, 3).map((tutorial) => (
                    <div key={tutorial.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{tutorial.title}</p>
                        <p className="text-xs text-muted-foreground">{tutorial.views} visualizações</p>
                      </div>
                      <Badge variant="secondary">{tutorial.rating}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent(tutorials).map((tutorial) => (
                <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant={tutorial.type === "video" ? "default" : "secondary"}>
                        {tutorial.type === "video" ? "🎥 Vídeo" : "📋 Passo a passo"}
                      </Badge>
                      <Badge variant="outline">{tutorial.difficulty}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{tutorial.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {tutorial.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {tutorial.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {tutorial.rating}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {tutorial.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportMaterial("pdf", tutorial)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredContent(faqs).map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">{faq.module}</Badge>
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {faq.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4" />
                          <span>{faq.helpful} pessoas acharam útil</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          👍 Útil
                        </Button>
                        <Button variant="outline" size="sm">
                          👎 Não útil
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {trainingPaths.map((path) => (
                <Card key={path.id} className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {path.title}
                        </CardTitle>
                        <p className="text-muted-foreground mt-2">{path.description}</p>
                      </div>
                      <Badge>{path.role}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{path.progress}%</span>
                      </div>
                      <Progress value={path.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tempo estimado</p>
                        <p className="font-medium">{path.estimatedTime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Módulos</p>
                        <p className="font-medium">{path.modules.length} módulos</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium">Próximos passos:</p>
                      {path.tutorials.slice(0, 2).map((tutorial) => (
                        <div key={tutorial.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{tutorial.title}</span>
                        </div>
                      ))}
                    </div>

                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Continuar Treinamento
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IntelligentHelpCenter;