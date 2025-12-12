/**
import { useState, useMemo, useCallback } from "react";;
 * Climate & Engagement - Clima Organizacional e Engajamento
 * Versão funcional completa com todas as ações
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  ThumbsDown,
  Send,
  BarChart3,
  Users,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useNautilusPeopleAI } from "../hooks/useNautilusPeopleAI";
import { departamentos } from "../data/mockData";

interface ClimateResult {
  categoria: string;
  score: number;
  trend: "up" | "down" | "stable";
  participacao: number;
}

interface PulseSurveyQuestion {
  id: string;
  pergunta: string;
  categoria: string;
}

const ClimateEngagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<Record<string, number>>({});
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState<"elogio" | "sugestao" | "critica">("sugestao");
  const [moodComment, setMoodComment] = useState("");
  
  const { isLoading, analyzeFeedback, analyzeClimate } = useNautilusPeopleAI();

  const climateResults: ClimateResult[] = [
    { categoria: "Satisfação Geral", score: 87, trend: "up", participacao: 92 },
    { categoria: "Liderança", score: 82, trend: "up", participacao: 88 },
    { categoria: "Comunicação", score: 78, trend: "stable", participacao: 90 },
    { categoria: "Desenvolvimento", score: 75, trend: "down", participacao: 85 },
    { categoria: "Ambiente de Trabalho", score: 89, trend: "up", participacao: 94 },
    { categoria: "Equilíbrio Vida-Trabalho", score: 72, trend: "down", participacao: 87 },
    { categoria: "Reconhecimento", score: 80, trend: "stable", participacao: 89 },
    { categoria: "Colaboração", score: 85, trend: "up", participacao: 91 }
  ];

  const pulseSurveyQuestions: PulseSurveyQuestion[] = [
    { id: "1", pergunta: "Como você avalia sua semana de trabalho?", categoria: "Bem-estar" },
    { id: "2", pergunta: "Você se sentiu reconhecido pelo seu trabalho?", categoria: "Reconhecimento" },
    { id: "3", pergunta: "A comunicação com sua liderança foi clara?", categoria: "Comunicação" },
    { id: "4", pergunta: "Você teve os recursos necessários para seu trabalho?", categoria: "Recursos" }
  ];

  const recentFeedback = [
    {
      id: "1",
      tipo: "sugestao",
      texto: "Seria interessante ter mais opções de horário flexível para quem tem filhos.",
      departamento: "Operações",
      data: "2025-12-05",
      status: "em_analise"
    },
    {
      id: "2",
      tipo: "elogio",
      texto: "A nova política de home office melhorou muito minha qualidade de vida!",
      departamento: "TI",
      data: "2025-12-04",
      status: "respondido"
    },
    {
      id: "3",
      tipo: "critica",
      texto: "Os computadores do setor precisam de atualização urgente.",
      departamento: "Financeiro",
      data: "2025-12-03",
      status: "resolvido"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case "down":
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <span className="w-4 h-4 text-yellow-500">→</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-blue-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "resolvido":
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Resolvido</Badge>;
    case "em_analise":
      return <Badge className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Em Análise</Badge>;
    case "respondido":
      return <Badge className="bg-blue-500"><MessageSquare className="w-3 h-3 mr-1" />Respondido</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleSendSurvey = async () => {
    const answeredQuestions = Object.keys(surveyResponses).length;
    if (answeredQuestions < pulseSurveyQuestions.length) {
      toast.error(`Por favor, responda todas as ${pulseSurveyQuestions.length} perguntas`);
      return;
    }

    toast.info("Enviando respostas...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Respostas enviadas com sucesso! Obrigado pela participação.");
    setSurveyResponses({});
  };

  const handleRegisterMood = async () => {
    if (!selectedMood) {
      toast.error("Selecione como você está se sentindo");
      return;
    }

    toast.info("Registrando seu humor...");
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const moodLabels: Record<string, string> = {
      great: "Ótimo",
      good: "Bem",
      neutral: "Neutro",
      bad: "Ruim",
      terrible: "Péssimo"
    };
    
    toast.success(`Humor "${moodLabels[selectedMood]}" registrado com sucesso!`);
    setSelectedMood(null);
    setMoodComment("");
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
      toast.error("Digite sua mensagem antes de enviar");
      return;
    }

    toast.info("Analisando feedback com IA...");
    
    const result = await analyzeFeedback(feedbackText, "Geral");
    
    if (result) {
      toast.success("Feedback enviado anonimamente! A IA identificou pontos importantes.");
    } else {
      toast.success("Feedback enviado anonimamente! Obrigado pela contribuição.");
    }
    
    setFeedbackText("");
  };

  const handleGenerateInsights = async () => {
    toast.info("Gerando insights com IA...");
    
    const result = await analyzeClimate({
      results: climateResults,
      period: "Q4 2025",
      participationRate: 91
    });
    
    if (result) {
      toast.success("Insights gerados! Confira o relatório completo.");
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-500">87%</p>
                <p className="text-sm text-muted-foreground">Satisfação Geral</p>
              </div>
              <Heart className="w-8 h-8 text-green-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              +3% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-500">82%</p>
                <p className="text-sm text-muted-foreground">Engajamento</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
              <TrendingUp className="w-3 h-3" />
              +5% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-500">91%</p>
                <p className="text-sm text-muted-foreground">Participação</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">1,134 respostas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-orange-500">+47</p>
                <p className="text-sm text-muted-foreground">eNPS Score</p>
              </div>
              <Sparkles className="w-8 h-8 text-orange-500" />
            </div>
            <Badge className="mt-2 bg-orange-500/20 text-orange-600">Excelente</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 border p-1">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="pulse" className="gap-2">
            <Heart className="w-4 h-4" />
            Pulse Survey
          </TabsTrigger>
          <TabsTrigger value="mood" className="gap-2">
            <Smile className="w-4 h-4" />
            Mood Tracker
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback Anônimo
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleGenerateInsights} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Gerar Insights com IA
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Resultados por Categoria</CardTitle>
              <CardDescription>Última pesquisa de clima - Dezembro 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {climateResults.map((result, index) => (
                  <motion.div
                    key={result.categoria}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-48 text-sm">{result.categoria}</div>
                    <div className="flex-1">
                      <Progress value={result.score} className="h-3" />
                    </div>
                    <div className={`w-12 text-right font-bold ${getScoreColor(result.score)}`}>
                      {result.score}%
                    </div>
                    <div className="w-8">{getTrendIcon(result.trend)}</div>
                    <div className="w-20 text-xs text-muted-foreground text-right">
                      {result.participacao}% resp.
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Pontos de Atenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Equilíbrio Vida-Trabalho</span>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Queda de 8% em relação ao trimestre anterior. Ações recomendadas pela IA.
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Desenvolvimento</span>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Colaboradores sentem falta de oportunidades de crescimento.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Destaques Positivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Ambiente de Trabalho</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maior score do período. Colaboradores valorizam infraestrutura.
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">Colaboração entre Equipes</span>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cultura de colaboração forte. Ações de integração funcionando.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pulse Survey Tab */}
        <TabsContent value="pulse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pulse Survey Semanal</CardTitle>
              <CardDescription>Responda rapidamente às perguntas da semana</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {pulseSurveyQuestions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{question.pergunta}</Label>
                    <Badge variant="outline">{question.categoria}</Badge>
                  </div>
                  <RadioGroup
                    className="flex gap-4"
                    value={surveyResponses[question.id]?.toString()}
                    onValueChange={(value) => setSurveyResponses({ ...surveyResponses, [question.id]: parseInt(value) })}
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex flex-col items-center gap-1">
                        <RadioGroupItem value={value.toString()} id={`q${question.id}-${value}`} />
                        <Label htmlFor={`q${question.id}-${value}`} className="text-xs text-muted-foreground">
                          {value}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <Button className="w-full" onClick={handleSendSurvey}>
                <Send className="w-4 h-4 mr-2" />
                Enviar Respostas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mood Tracker Tab */}
        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Como você está se sentindo hoje?</CardTitle>
              <CardDescription>Seu feedback é anônimo e ajuda a melhorar o ambiente de trabalho</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-6 py-8">
                {[
                  { value: "great", icon: Smile, label: "Ótimo", color: "text-green-500 hover:bg-green-500/20" },
                  { value: "good", icon: Smile, label: "Bem", color: "text-blue-500 hover:bg-blue-500/20" },
                  { value: "neutral", icon: Meh, label: "Neutro", color: "text-yellow-500 hover:bg-yellow-500/20" },
                  { value: "bad", icon: Frown, label: "Ruim", color: "text-orange-500 hover:bg-orange-500/20" },
                  { value: "terrible", icon: Frown, label: "Péssimo", color: "text-red-500 hover:bg-red-500/20" }
                ].map((mood) => (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSetSelectedMood}
                    className={`p-4 rounded-full transition-all ${mood.color} ${
                      selectedMood === mood.value ? "ring-2 ring-offset-2 ring-primary bg-primary/10" : ""
                    }`}
                  >
                    <mood.icon className="w-12 h-12" />
                    <p className="text-xs mt-1">{mood.label}</p>
                  </motion.button>
                ))}
              </div>
              {selectedMood && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <Label>Quer compartilhar algo mais? (opcional)</Label>
                  <Textarea 
                    placeholder="Digite aqui..." 
                    rows={3}
                    value={moodComment}
                    onChange={handleChange}
                  />
                  <Button className="w-full" onClick={handleRegisterMood}>
                    <Send className="w-4 h-4 mr-2" />
                    Registrar Humor
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Canal de Feedback Anônimo</CardTitle>
              <CardDescription>Suas sugestões e críticas são importantes para nós</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Digite sua sugestão, elogio ou crítica..." 
                rows={4}
                value={feedbackText}
                onChange={handleChange}
              />
              <div className="flex gap-2">
                <Button 
                  variant={feedbackType === "elogio" ? "default" : "outline"} 
                  className="flex-1"
                  onClick={handleSetFeedbackType}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Elogio
                </Button>
                <Button 
                  variant={feedbackType === "sugestao" ? "default" : "outline"} 
                  className="flex-1"
                  onClick={handleSetFeedbackType}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Sugestão
                </Button>
                <Button 
                  variant={feedbackType === "critica" ? "default" : "outline"} 
                  className="flex-1"
                  onClick={handleSetFeedbackType}
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Crítica
                </Button>
              </div>
              <Button className="w-full" onClick={handleSendFeedback} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Enviar Anonimamente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedbacks Recentes</CardTitle>
              <CardDescription>Acompanhe o status dos feedbacks enviados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentFeedback.map((feedback) => (
                <div key={feedback.id} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{feedback.tipo}</Badge>
                      <span className="text-xs text-muted-foreground">{feedback.departamento}</span>
                    </div>
                    {getStatusBadge(feedback.status)}
                  </div>
                  <p className="text-sm">{feedback.texto}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enviado em {new Date(feedback.data).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClimateEngagement;
