/**
 * CIDM - Central de Inteligência de Documentos Marítimos
 * Dashboard com busca conversacional e visualização RAG
 */

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Search,
  Send,
  Bot,
  User,
  FileSearch,
  BookOpen,
  Clock,
  Star,
  ExternalLink,
  Upload,
  Loader2,
  Sparkles,
  TrendingUp,
  Database
} from "lucide-react";

// Mock data
const mockConversation = [
  {
    id: 1,
    role: "user",
    content: "Como verificar o nível de óleo do motor principal?",
    timestamp: "14:30"
  },
  {
    id: 2,
    role: "assistant",
    content: `De acordo com o **Engine Manual Appendix B** (páginas 12-13):

1. Certifique-se de que o motor está frio (aguarde 30 min após desligamento)
2. Localize a vareta no lado de boreste (tampa amarela)
3. Extraia completamente, limpe
4. Reinsira até assentar
5. Extraia novamente, leia o nível

**Faixa normal:** entre MIN (18mm) e MAX (22mm)

**Ação:** Se abaixo de MIN, adicione óleo SAE 40 (2 litros por 1mm)

📅 **Próxima verificação:** 2025-02-28 (conforme log de manutenção)`,
    sources: [
      { name: "Engine Manual Appendix B", pages: "12-13", similarity: 0.92 },
      { name: "Maintenance Log 2024", pages: "45", similarity: 0.88 }
    ],
    timestamp: "14:30"
  }
];

const recentSearches = [
  { query: "Procedimento reset sensor pressão hidráulica", time: "2h atrás" },
  { query: "Última falha motor reciprocante 2023", time: "4h atrás" },
  { query: "Requisito PEOTRAM watchkeeping", time: "1 dia atrás" },
  { query: "Padrão falhas fuel injection 2020-2025", time: "2 dias atrás" }
];

const documentStats = {
  total: 12453,
  indexed: 12100,
  pending: 353,
  categories: [
    { name: "Manuais Técnicos", count: 2340 },
    { name: "Procedures", count: 3120 },
    { name: "Regulações", count: 1850 },
    { name: "Logs de Manutenção", count: 4200 },
    { name: "Relatórios de Incidente", count: 943 }
  ]
};

const topDocuments = [
  { name: "Engine Manual v4.2", searches: 1240, rating: 4.8 },
  { name: "SOLAS Regulations 2024", searches: 980, rating: 4.9 },
  { name: "Safety Procedures Manual", searches: 856, rating: 4.7 },
  { name: "MLC 2006 Guidelines", searches: 742, rating: 4.6 }
];

export default function DocumentIntelligenceDashboard() {
  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState(mockConversation);
  const [isSearching, setIsSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSearch = () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    const newUserMessage = {
      id: conversation.length + 1,
      role: "user" as const,
      content: query,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };
    
    setConversation(prev => [...prev, newUserMessage]);
    setQuery("");

    // Simular resposta
    setTimeout(() => {
      const newAssistantMessage = {
        id: conversation.length + 2,
        role: "assistant" as const,
        content: `Analisando sua consulta sobre "${query}"...

Encontrei **3 documentos relevantes** na base de conhecimento.

Com base na análise, aqui está a informação solicitada:

📋 **Resultado da busca:** A documentação indica que o procedimento deve seguir as diretrizes estabelecidas no manual operacional, seção 4.2.

**Referências:**
- Manual Operacional v3.1, página 45
- Procedure Guide 2024, seção 4.2
- Technical Bulletin TB-2024-089`,
        sources: [
          { name: "Manual Operacional v3.1", pages: "45", similarity: 0.89 },
          { name: "Procedure Guide 2024", pages: "4.2", similarity: 0.85 },
          { name: "Technical Bulletin TB-2024-089", pages: "1-2", similarity: 0.78 }
        ],
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      };
      
      setConversation(prev => [...prev, newAssistantMessage]);
      setIsSearching(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-500" />
            CIDM - Central de Documentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Inteligência de documentos marítimos com busca conversacional
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Importar Documentos
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documentos</p>
                <p className="text-2xl font-bold text-blue-500">{documentStats.total.toLocaleString()}</p>
                <p className="text-xs text-blue-400">{documentStats.pending} pendentes</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Indexados</p>
                <p className="text-2xl font-bold text-emerald-500">{documentStats.indexed.toLocaleString()}</p>
                <p className="text-xs text-emerald-400">97% do total</p>
              </div>
              <Database className="h-10 w-10 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Buscas Hoje</p>
                <p className="text-2xl font-bold text-purple-500">247</p>
                <p className="text-xs text-purple-400">+18% vs ontem</p>
              </div>
              <Search className="h-10 w-10 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Precisão RAG</p>
                <p className="text-2xl font-bold text-amber-500">92%</p>
                <p className="text-xs text-amber-400">Top performance</p>
              </div>
              <Sparkles className="h-10 w-10 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Busca Conversacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {conversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-500" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {msg.content.split("\n").map((line, i) => (
                          <p key={i} className="mb-2 last:mb-0">{line}</p>
                        ))}
                      </div>
                      {"sources" in msg && msg.sources && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-2">Fontes:</p>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((source, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                <FileSearch className="h-3 w-3 mr-1" />
                                {source.name} (p. {source.pages}) - {Math.round(source.similarity * 100)}%
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">{msg.timestamp}</p>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                {isSearching && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Buscando nos documentos...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Pergunte sobre qualquer documento marítimo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={isSearching}
              />
              <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Buscas Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Buscas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentSearches.map((search, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setQuery(search.query)}
                  >
                    <p className="text-sm truncate">{search.query}</p>
                    <p className="text-xs text-muted-foreground">{search.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documentos Populares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Mais Consultados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.searches} buscas</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs">{doc.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categorias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {documentStats.categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm">{cat.name}</span>
                    <Badge variant="secondary">{cat.count.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
