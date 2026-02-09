/**
 * Analytics & Feedback Dashboard
 * Dashboard de métricas, NPS integrado, bug tracking
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BarChart3, 
  Users, 
  Ship, 
  TrendingUp, 
  TrendingDown,
  MessageSquare,
  Bug,
  Lightbulb,
  Star,
  Send,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

// Mock Analytics Data
const ANALYTICS_DATA = {
  totalUsers: 1250,
  activeUsers: 890,
  totalVessels: 47,
  activeVessels: 42,
  npsScore: 72,
  npsTrend: '+5',
  avgSessionTime: '24min',
  supportTickets: 12,
  resolvedTickets: 8,
  featureRequests: 28,
};

const NPS_HISTORY = [
  { month: 'Set', score: 65 },
  { month: 'Out', score: 68 },
  { month: 'Nov', score: 70 },
  { month: 'Dez', score: 67 },
  { month: 'Jan', score: 72 },
];

const RECENT_FEEDBACK = [
  {
    id: '1',
    type: 'nps',
    score: 9,
    comment: 'Excelente sistema, a integração com IA é fantástica!',
    user: 'João Silva',
    vessel: 'MV Ocean Pioneer',
    date: '2025-01-14',
  },
  {
    id: '2',
    type: 'bug',
    title: 'Erro ao exportar PDF no mobile',
    description: 'Quando tento exportar relatório PEOTRAM no iPhone, o download não inicia.',
    status: 'investigating',
    priority: 'high',
    date: '2025-01-13',
  },
  {
    id: '3',
    type: 'feature',
    title: 'Integração com sistema de AIS',
    description: 'Gostaríamos de ver a posição das embarcações em tempo real no mapa.',
    votes: 15,
    status: 'planned',
    date: '2025-01-12',
  },
  {
    id: '4',
    type: 'nps',
    score: 7,
    comment: 'Bom, mas poderia melhorar a velocidade de carregamento.',
    user: 'Maria Santos',
    vessel: 'MV Atlantic Star',
    date: '2025-01-11',
  },
];

const TOP_FEATURE_REQUESTS = [
  { id: '1', title: 'Integração com AIS', votes: 45, status: 'planned' },
  { id: '2', title: 'App nativo iOS/Android', votes: 38, status: 'in_progress' },
  { id: '3', title: 'Relatórios customizáveis', votes: 32, status: 'planned' },
  { id: '4', title: 'Modo offline melhorado', votes: 28, status: 'done' },
  { id: '5', title: 'Dashboard personalizado', votes: 24, status: 'review' },
];

export default function AnalyticsFeedback() {
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'bug' | 'feature'>('feedback');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitNPS = async () => {
    if (npsScore === null) {
      toast.error('Por favor, selecione uma nota');
      return;
    }

    setIsSubmitting(true);
    // Submit NPS feedback
    
    toast.success('Obrigado pelo seu feedback!');
    setNpsScore(null);
    setFeedbackComment('');
    setIsSubmitting(false);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackComment.trim()) {
      toast.error('Por favor, descreva seu feedback');
      return;
    }

    setIsSubmitting(true);
    // Submit feedback
    
    toast.success(
      feedbackType === 'bug' 
        ? 'Bug reportado com sucesso!' 
        : feedbackType === 'feature'
        ? 'Sugestão enviada!'
        : 'Feedback enviado!'
    );
    setFeedbackComment('');
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      planned: 'bg-primary/10 text-primary',
      in_progress: 'bg-warning/10 text-warning',
      done: 'bg-success/10 text-success',
      review: 'bg-info/10 text-info',
      investigating: 'bg-warning/10 text-warning',
    };
    return styles[status] || styles.planned;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Analytics & Feedback</h1>
          <p className="text-muted-foreground">
            Métricas de uso, NPS e gestão de feedback
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{ANALYTICS_DATA.activeUsers}</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +12% este mês
                  </p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Embarcações Ativas</p>
                  <p className="text-2xl font-bold">{ANALYTICS_DATA.activeVessels}</p>
                  <p className="text-xs text-muted-foreground">de {ANALYTICS_DATA.totalVessels} total</p>
                </div>
                <Ship className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">NPS Score</p>
                  <p className="text-2xl font-bold text-green-500">{ANALYTICS_DATA.npsScore}</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {ANALYTICS_DATA.npsTrend} pts
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tickets Abertos</p>
                  <p className="text-2xl font-bold">{ANALYTICS_DATA.supportTickets - ANALYTICS_DATA.resolvedTickets}</p>
                  <p className="text-xs text-muted-foreground">{ANALYTICS_DATA.resolvedTickets} resolvidos</p>
                </div>
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="nps" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              NPS
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Feature Requests
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico NPS</CardTitle>
                  <CardDescription>Últimos 5 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {NPS_HISTORY.map((item) => (
                      <div key={item.month} className="flex items-center gap-4">
                        <span className="w-12 text-sm text-muted-foreground">{item.month}</span>
                        <Progress value={item.score} className="flex-1" />
                        <span className="w-8 text-sm font-medium">{item.score}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Últimas interações</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-4">
                      {RECENT_FEEDBACK.slice(0, 4).map((item) => (
                        <div key={item.id} className="flex items-start gap-3 text-sm">
                          {item.type === 'nps' && <Star className="h-4 w-4 text-yellow-500 mt-0.5" />}
                          {item.type === 'bug' && <Bug className="h-4 w-4 text-red-500 mt-0.5" />}
                          {item.type === 'feature' && <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />}
                          <div className="flex-1">
                            <p className="font-medium">
                              {item.type === 'nps' ? `NPS ${item.score}` : item.title}
                            </p>
                            <p className="text-muted-foreground text-xs">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Activity className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{ANALYTICS_DATA.avgSessionTime}</p>
                    <p className="text-sm text-muted-foreground">Sessão Média</p>
                  </div>
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">4.2</p>
                    <p className="text-sm text-muted-foreground">Logins/Semana</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold">89%</p>
                    <p className="text-sm text-muted-foreground">Task Completion</p>
                  </div>
                  <div className="text-center">
                    <ThumbsUp className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                    <p className="text-2xl font-bold">4.6/5</p>
                    <p className="text-sm text-muted-foreground">Satisfação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NPS Tab */}
          <TabsContent value="nps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Avalie sua experiência</CardTitle>
                <CardDescription>
                  Em uma escala de 0 a 10, o quanto você recomendaria o Nauti One?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center gap-2 flex-wrap">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      onClick={() => setNpsScore(score)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        npsScore === score
                          ? 'bg-primary text-primary-foreground scale-110'
                          : score <= 6
                          ? 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : score <= 8
                          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>😞 Não recomendaria</span>
                  <span>🤩 Recomendo totalmente</span>
                </div>

                <div>
                  <Label>Comentário (opcional)</Label>
                  <Textarea
                    placeholder="Conte-nos mais sobre sua experiência..."
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button 
                  onClick={handleSubmitNPS} 
                  disabled={npsScore === null || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Feedback</CardTitle>
                <CardDescription>Sua opinião nos ajuda a melhorar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={feedbackType}
                  onValueChange={(v) => setFeedbackType(v as any)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="feedback" id="feedback" />
                    <Label htmlFor="feedback" className="flex items-center gap-1 cursor-pointer">
                      <MessageSquare className="h-4 w-4" /> Feedback
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bug" id="bug" />
                    <Label htmlFor="bug" className="flex items-center gap-1 cursor-pointer">
                      <Bug className="h-4 w-4" /> Bug
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="feature" id="feature" />
                    <Label htmlFor="feature" className="flex items-center gap-1 cursor-pointer">
                      <Lightbulb className="h-4 w-4" /> Sugestão
                    </Label>
                  </div>
                </RadioGroup>

                <div>
                  <Label>
                    {feedbackType === 'bug' ? 'Descreva o problema' : 
                     feedbackType === 'feature' ? 'Descreva sua sugestão' : 
                     'Seu feedback'}
                  </Label>
                  <Textarea
                    placeholder={
                      feedbackType === 'bug' 
                        ? 'O que aconteceu? Onde você estava? O que você esperava que acontecesse?'
                        : feedbackType === 'feature'
                        ? 'Qual funcionalidade você gostaria de ver no Nauti One?'
                        : 'Compartilhe sua opinião sobre o sistema...'
                    }
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <Button 
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackComment.trim() || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar'}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Requests Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Feature Requests</CardTitle>
                <CardDescription>Funcionalidades mais solicitadas pela comunidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {TOP_FEATURE_REQUESTS.map((feature, index) => (
                    <div 
                      key={feature.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium">{feature.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusBadge(feature.status)}>
                              {feature.status === 'planned' && 'Planejado'}
                              {feature.status === 'in_progress' && 'Em Desenvolvimento'}
                              {feature.status === 'done' && 'Concluído'}
                              {feature.status === 'review' && 'Em Revisão'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-lg font-bold">{feature.votes}</p>
                          <p className="text-xs text-muted-foreground">votos</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
