/**
 * Knowledge Hub Component
 * Base de conhecimento com FAQ e tutoriais
 */

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Search,
  Video,
  FileText,
  HelpCircle,
  Star,
  Eye,
  Clock,
  TrendingUp,
  MessageCircle,
  ExternalLink,
  Play
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  views: number;
  helpful: number;
  lastUpdated: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: string;
  views: number;
}

const fallbackArticles: Article[] = [
  {
    id: "1",
    title: "Guia Completo do Código ISM",
    category: "Compliance",
    content: "O Código ISM (International Safety Management) é um código internacional...",
    views: 1250,
    helpful: 89,
    lastUpdated: "2025-01-15"
  },
  {
    id: "2",
    title: "Procedimentos de Inspeção PSC",
    category: "Inspeções",
    content: "As inspeções Port State Control (PSC) são fundamentais para...",
    views: 890,
    helpful: 76,
    lastUpdated: "2025-01-28"
  },
  {
    id: "3",
    title: "Gestão de Horas de Descanso MLC",
    category: "RH",
    content: "A Convenção do Trabalho Marítimo (MLC 2006) estabelece...",
    views: 2100,
    helpful: 145,
    lastUpdated: "2025-02-01"
  }
];

const fallbackFAQs: FAQ[] = [
  {
    id: "1",
    question: "Como registrar uma não conformidade no sistema?",
    answer: "Para registrar uma não conformidade, acesse o módulo de Compliance, clique em 'Nova NC' e preencha os campos obrigatórios incluindo descrição, categoria, embarcação afetada e responsável pela ação corretiva.",
    category: "Sistema",
    views: 450
  },
  {
    id: "2",
    question: "Qual é o prazo máximo para fechamento de uma NC crítica?",
    answer: "Não conformidades classificadas como críticas devem ser fechadas em até 30 dias, conforme procedimento ISM-PRO-001. O prazo pode ser estendido mediante aprovação do DPA.",
    category: "Compliance",
    views: 380
  },
  {
    id: "3",
    question: "Como atualizar a lista de tripulação no sistema?",
    answer: "Acesse o módulo People Hub > Tripulação > Atualizar Lista. Você pode adicionar, editar ou desembarcar tripulantes. O sistema atualiza automaticamente os documentos de bordo.",
    category: "Sistema",
    views: 520
  },
  {
    id: "4",
    question: "Como gerar o relatório de emissões para CII?",
    answer: "No módulo ESG, acesse 'Emissões' > 'Relatório CII'. Selecione o período e a embarcação, o sistema calculará automaticamente o rating baseado nos dados de combustível e viagens.",
    category: "ESG",
    views: 290
  }
];

const fallbackTutorials: Tutorial[] = [
  {
    id: "1",
    title: "Introdução ao Sistema - Tour Completo",
    description: "Visão geral de todos os módulos e funcionalidades principais",
    duration: "15:30",
    thumbnail: "/placeholder.svg",
    category: "Geral",
    views: 3200
  },
  {
    id: "2",
    title: "Realizando uma Auditoria Interna",
    description: "Passo a passo para conduzir auditorias usando o sistema",
    duration: "12:45",
    thumbnail: "/placeholder.svg",
    category: "Compliance",
    views: 1890
  },
  {
    id: "3",
    title: "Gestão de Manutenção Preventiva",
    description: "Como configurar e acompanhar planos de manutenção",
    duration: "18:20",
    thumbnail: "/placeholder.svg",
    category: "Manutenção",
    views: 1540
  }
];

export function KnowledgeHub() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFAQs = fallbackFAQs.filter((faq: FAQ) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-8 pb-8">
          <div className="max-w-2xl mx-auto text-center">
            <BookOpen className="h-12 w-12 mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-bold mb-2">Central de Conhecimento</h1>
            <p className="text-muted-foreground mb-6">
              Encontre respostas, tutoriais e documentação do sistema
            </p>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="O que você está procurando?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Artigos</p>
                <p className="text-3xl font-bold">{fallbackArticles.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">FAQs</p>
                <p className="text-3xl font-bold">{fallbackFAQs.length}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tutoriais</p>
                <p className="text-3xl font-bold">{fallbackTutorials.length}</p>
              </div>
              <Video className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visualizações</p>
                <p className="text-3xl font-bold">
                  {(fallbackArticles.reduce((a: number, b: Article) => a + b.views, 0) / 1000).toFixed(1)}k
                </p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Perguntas Frequentes
          </TabsTrigger>
          <TabsTrigger value="articles" className="gap-2">
            <FileText className="h-4 w-4" />
            Artigos
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="gap-2">
            <Video className="h-4 w-4" />
            Tutoriais em Vídeo
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 pb-4">
                      <p className="text-muted-foreground mb-3">{faq.answer}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="outline">{faq.category}</Badge>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {faq.views} visualizações
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            Isso ajudou?
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Articles Tab */}
        <TabsContent value="articles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fallbackArticles.map((article: Article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="outline">{article.category}</Badge>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {article.views}
                    </span>
                  </div>
                  <CardTitle className="text-base mt-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.content}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Atualizado {new Date(article.lastUpdated).toLocaleDateString("pt-BR")}
                    </span>
                    <Button variant="ghost" size="sm">
                      Ler mais
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tutorials Tab */}
        <TabsContent value="tutorials">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fallbackTutorials.map((tutorial: Tutorial) => (
              <Card key={tutorial.id} className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-4 rounded-full bg-primary/90 hover:bg-primary transition-colors">
                      <Play className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {tutorial.duration}
                  </div>
                </div>
                <CardContent className="pt-4">
                  <Badge variant="outline" className="mb-2">{tutorial.category}</Badge>
                  <h3 className="font-medium">{tutorial.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tutorial.description}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    {tutorial.views} visualizações
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Contact Support */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Não encontrou o que procurava?</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa equipe de suporte está disponível 24/7
                </p>
              </div>
            </div>
            <Button>
              <MessageCircle className="h-4 w-4 mr-2" />
              Falar com Suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default KnowledgeHub;
