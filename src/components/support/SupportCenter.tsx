/**
 * Support Center - Complete Support Hub
 * PATCH ROADMAP-COMPLETE: UI for Support System (70% → 100%)
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  BookOpen, 
  MessageSquare, 
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Ticket,
  Lightbulb,
  FileText,
  Users,
  Ship,
  Wrench,
  DollarSign,
  Bot,
  Smartphone,
  Link,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// Mock articles for KB
const kbArticles = [
  {
    id: "1",
    title: "Primeiros Passos com Nauti One",
    category: "getting-started",
    content: "Aprenda a configurar sua conta e começar a usar o sistema...",
    tags: ["início", "configuração", "tutorial"],
    views: 1250,
    helpful: 98
  },
  {
    id: "2",
    title: "Como usar os Assistentes de IA",
    category: "ai-features",
    content: "Guia completo dos assistentes de IA disponíveis...",
    tags: ["ia", "chatbot", "nauti brain"],
    views: 890,
    helpful: 95
  },
  {
    id: "3",
    title: "Gestão de Tripulação - Guia Completo",
    category: "crew-management",
    content: "Cadastro, certificados, rotação e escalas...",
    tags: ["tripulação", "certificados", "rotação"],
    views: 750,
    helpful: 92
  },
  {
    id: "4",
    title: "Manutenção Preditiva com IoT",
    category: "maintenance",
    content: "Como funciona a manutenção preditiva e integração IoT...",
    tags: ["manutenção", "iot", "preditiva"],
    views: 620,
    helpful: 94
  },
  {
    id: "5",
    title: "Compliance MLC 2006",
    category: "compliance",
    content: "Guia completo sobre Maritime Labour Convention...",
    tags: ["mlc", "compliance", "imo"],
    views: 580,
    helpful: 96
  },
  {
    id: "6",
    title: "Solucionando Problemas de Login",
    category: "troubleshooting",
    content: "Passos para resolver problemas de acesso...",
    tags: ["login", "senha", "erro"],
    views: 1100,
    helpful: 91
  }
];

const categories = [
  { id: "getting-started", name: "Primeiros Passos", icon: Lightbulb, count: 8 },
  { id: "crew-management", name: "Tripulação", icon: Users, count: 15 },
  { id: "vessel-operations", name: "Operações", icon: Ship, count: 12 },
  { id: "maintenance", name: "Manutenção", icon: Wrench, count: 10 },
  { id: "compliance", name: "Compliance", icon: FileText, count: 18 },
  { id: "ai-features", name: "IA & Assistentes", icon: Bot, count: 6 },
  { id: "finance", name: "Finanças", icon: DollarSign, count: 8 },
  { id: "mobile-app", name: "App Mobile", icon: Smartphone, count: 5 },
  { id: "integrations", name: "Integrações", icon: Link, count: 7 },
  { id: "troubleshooting", name: "Solução de Problemas", icon: AlertCircle, count: 20 }
];

export function SupportCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<typeof kbArticles[0] | null>(null);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");
  const [ticketPriority, setTicketPriority] = useState("");

  const filteredArticles = kbArticles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === null || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitTicket = () => {
    if (!ticketSubject || !ticketDescription || !ticketCategory || !ticketPriority) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    toast.success("Ticket criado com sucesso! Você receberá uma resposta em breve.");
    setTicketSubject("");
    setTicketDescription("");
    setTicketCategory("");
    setTicketPriority("");
  };

  const handleVote = (articleId: string, helpful: boolean) => {
    toast.success(helpful ? "Obrigado pelo feedback positivo!" : "Obrigado pelo feedback. Vamos melhorar!");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Central de Suporte</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Encontre respostas rápidas, explore nossa base de conhecimento ou abra um ticket de suporte.
        </p>
        
        {/* Search */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artigos, guias, tutoriais..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="knowledge-base" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="knowledge-base">
            <BookOpen className="h-4 w-4 mr-2" />
            Base de Conhecimento
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <Ticket className="h-4 w-4 mr-2" />
            Meus Tickets
          </TabsTrigger>
          <TabsTrigger value="new-ticket">
            <MessageSquare className="h-4 w-4 mr-2" />
            Novo Ticket
          </TabsTrigger>
        </TabsList>

        {/* Knowledge Base */}
        <TabsContent value="knowledge-base" className="space-y-6">
          {selectedArticle ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setSelectedArticle(null)}>
                    ← Voltar
                  </Button>
                  <div className="flex gap-2">
                    {selectedArticle.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
                <CardDescription>
                  {selectedArticle.views} visualizações • {selectedArticle.helpful}% acharam útil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p>{selectedArticle.content}</p>
                  <h2>Configuração Inicial</h2>
                  <ol>
                    <li>Login: Acesse com seu email corporativo</li>
                    <li>Perfil: Complete seu perfil de usuário</li>
                    <li>Organização: Configure sua empresa/frota</li>
                    <li>Embarcações: Cadastre seus navios</li>
                    <li>Tripulação: Importe ou cadastre tripulantes</li>
                  </ol>
                  <h2>Módulos Principais</h2>
                  <ul>
                    <li><strong>RH & Pessoas:</strong> Gestão completa de tripulação</li>
                    <li><strong>Operações:</strong> Planejamento de viagens e escalas</li>
                    <li><strong>Manutenção:</strong> PMS e manutenção preditiva</li>
                    <li><strong>Compliance:</strong> MLC, STCW, ISM, ISPS</li>
                    <li><strong>IA:</strong> Assistentes inteligentes especializados</li>
                  </ul>
                </div>

                <div className="border-t pt-6">
                  <p className="text-sm text-muted-foreground mb-3">Este artigo foi útil?</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleVote(selectedArticle.id, true)}>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Sim
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleVote(selectedArticle.id, false)}>
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Não
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Categories */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <Card 
                      key={category.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.id ? null : category.id
                      )}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.count} artigos</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Articles */}
              <div className="grid md:grid-cols-2 gap-4">
                {filteredArticles.map(article => (
                  <Card 
                    key={article.id} 
                    className="cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{article.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {article.helpful}% útil
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.content}
                      </p>
                      <div className="flex gap-1 mt-3">
                        {article.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Nenhum artigo encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Tente uma busca diferente ou abra um ticket de suporte.
                    </p>
                    <Button>Abrir Ticket</Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* My Tickets */}
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Meus Tickets</CardTitle>
              <CardDescription>Acompanhe o status dos seus tickets de suporte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhum ticket aberto</h3>
                <p className="text-muted-foreground mb-4">
                  Você não tem tickets de suporte ativos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Ticket */}
        <TabsContent value="new-ticket">
          <Card>
            <CardHeader>
              <CardTitle>Abrir Novo Ticket</CardTitle>
              <CardDescription>
                Descreva seu problema ou dúvida. Nossa equipe responderá em até 24 horas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Assunto *</label>
                <Input
                  placeholder="Resumo do problema ou dúvida"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria *</label>
                  <Select value={ticketCategory} onValueChange={setTicketCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug / Erro</SelectItem>
                      <SelectItem value="feature">Sugestão de Melhoria</SelectItem>
                      <SelectItem value="question">Dúvida</SelectItem>
                      <SelectItem value="account">Conta / Acesso</SelectItem>
                      <SelectItem value="billing">Faturamento</SelectItem>
                      <SelectItem value="security">Segurança</SelectItem>
                      <SelectItem value="integration">Integrações</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridade *</label>
                  <Select value={ticketPriority} onValueChange={setTicketPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição *</label>
                <Textarea
                  placeholder="Descreva seu problema em detalhes. Inclua passos para reproduzir, mensagens de erro, etc."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  rows={6}
                />
              </div>

              <Button onClick={handleSubmitTicket} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Enviar Ticket
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SupportCenter;
