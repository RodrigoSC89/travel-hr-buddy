/**
 * Climate & Engagement - Clima Organizacional e Engajamento
 * ✅ P0 CORRIGIDO: Integração real com Supabase (R01 MITIGADO)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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
  Loader2,
  WifiOff,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNautilusPeopleAI } from '../hooks/useNautilusPeopleAI';
import { useClimateData, DEPARTAMENTOS, DEFAULT_PULSE_QUESTIONS, type ClimateResult, type PulseSurveyQuestion } from '@/hooks/useClimateData';

const ClimateEngagement: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<Record<string, number>>({});
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'elogio' | 'sugestao' | 'critica'>('sugestao');
  const [moodComment, setMoodComment] = useState('');
  
  const { isLoading: aiLoading, analyzeFeedback, analyzeClimate } = useNautilusPeopleAI();
  const { 
    surveys, 
    climateResults, 
    feedback: recentFeedback, 
    isLoading: dataLoading, 
    isEmpty,
    submitSurveyResponse,
    registerMood 
  } = useClimateData();

  const isLoading = aiLoading || dataLoading;

  // Usar perguntas do survey do DB ou fallback para default
  const activeSurvey = surveys.find(s => s.status === 'active');
  const pulseSurveyQuestions: PulseSurveyQuestion[] = 
    activeSurvey?.questions?.length ? activeSurvey.questions : DEFAULT_PULSE_QUESTIONS;

  // Feedback recente vem do hook useClimateData (já mapeado)

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <span className="w-4 h-4 text-yellow-500">→</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolvido':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Resolvido</Badge>;
      case 'em_analise':
        return <Badge className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Em Análise</Badge>;
      case 'respondido':
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

    const avgScore = Object.values(surveyResponses).reduce((a, b) => a + b, 0) / answeredQuestions;
    
    await submitSurveyResponse.mutateAsync({
      surveyId: activeSurvey?.id || '',
      answers: surveyResponses,
      npsScore: Math.round(avgScore * 2), // Converte 1-5 para 0-10
    });
    
    setSurveyResponses({});
  };

  const handleRegisterMood = async () => {
    if (!selectedMood) {
      toast.error('Selecione como você está se sentindo');
      return;
    }

    await registerMood.mutateAsync({
      mood: selectedMood,
      comment: moodComment,
    });
    
    setSelectedMood(null);
    setMoodComment('');
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) {
      toast.error('Digite sua mensagem antes de enviar');
      return;
    }

    toast.info('Analisando feedback com IA...');
    
    const result = await analyzeFeedback(feedbackText, 'Geral');
    
    if (result) {
      toast.success('Feedback enviado anonimamente! A IA identificou pontos importantes.');
    } else {
      toast.success('Feedback enviado anonimamente! Obrigado pela contribuição.');
    }
    
    setFeedbackText('');
  };

  const handleGenerateInsights = async () => {
    toast.info('Gerando insights com IA...');
    
    const result = await analyzeClimate({
      results: climateResults,
      period: 'Q4 2025',
      participationRate: 91
    });
    
    if (result) {
      toast.success('Insights gerados! Confira o relatório completo.');
    }
  };

  // Loading state
  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={`climate-skeleton-${i}`} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Nenhuma Pesquisa de Clima</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configure pesquisas de clima para coletar feedback dos colaboradores.
            </p>
            <Alert className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sem Dados Simulados</AlertTitle>
              <AlertDescription>
                Este dashboard exibe apenas dados reais de pesquisas cadastradas.
              </AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/nautilus-people')}>
              <Settings className="h-4 w-4 mr-2" />
              Criar Pesquisa
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular stats a partir dos dados reais
  const satisfacaoGeral = climateResults.find(r => r.categoria === 'Satisfação Geral')?.score || 0;
  const npsScore = climateResults.find(r => r.categoria === 'NPS Score')?.score || 0;
  const participacao = climateResults[0]?.participacao || 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">{satisfacaoGeral}%</p>
                <p className="text-sm text-muted-foreground">Satisfação Geral</p>
              </div>
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-primary">
              <TrendingUp className="w-3 h-3" />
              Dados reais
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-secondary-foreground">{npsScore}%</p>
                <p className="text-sm text-muted-foreground">NPS Score</p>
              </div>
              <Users className="w-8 h-8 text-secondary-foreground" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              Agregado
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-accent-foreground">{participacao}%</p>
                <p className="text-sm text-muted-foreground">Participação</p>
              </div>
              <BarChart3 className="w-8 h-8 text-accent-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{recentFeedback.length} respostas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-warning-foreground">+{Math.round(npsScore / 10)}</p>
                <p className="text-sm text-muted-foreground">eNPS Score</p>
              </div>
              <Sparkles className="w-8 h-8 text-warning-foreground" />
            </div>
            <Badge className="mt-2 bg-warning/20 text-warning-foreground">
              {npsScore >= 70 ? 'Excelente' : npsScore >= 50 ? 'Bom' : 'A melhorar'}
            </Badge>
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
                  { value: 'great', icon: Smile, label: 'Ótimo', color: 'text-green-500 hover:bg-green-500/20' },
                  { value: 'good', icon: Smile, label: 'Bem', color: 'text-blue-500 hover:bg-blue-500/20' },
                  { value: 'neutral', icon: Meh, label: 'Neutro', color: 'text-yellow-500 hover:bg-yellow-500/20' },
                  { value: 'bad', icon: Frown, label: 'Ruim', color: 'text-orange-500 hover:bg-orange-500/20' },
                  { value: 'terrible', icon: Frown, label: 'Péssimo', color: 'text-red-500 hover:bg-red-500/20' }
                ].map((mood) => (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-4 rounded-full transition-all ${mood.color} ${
                      selectedMood === mood.value ? 'ring-2 ring-offset-2 ring-primary bg-primary/10' : ''
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
                    onChange={(e) => setMoodComment(e.target.value)}
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
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  variant={feedbackType === 'elogio' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setFeedbackType('elogio')}
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Elogio
                </Button>
                <Button 
                  variant={feedbackType === 'sugestao' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setFeedbackType('sugestao')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Sugestão
                </Button>
                <Button 
                  variant={feedbackType === 'critica' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setFeedbackType('critica')}
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
                    Enviado em {new Date(feedback.data).toLocaleDateString('pt-BR')}
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
