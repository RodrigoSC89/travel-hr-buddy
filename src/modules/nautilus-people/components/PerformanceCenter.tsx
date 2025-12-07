/**
 * Performance Center - Avaliações de Desempenho e Feedback 360
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Target,
  Star,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Calendar,
  Award,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  Plus,
  Send,
  ThumbsUp,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Avaliacao {
  id: string;
  colaborador: string;
  cargo: string;
  departamento: string;
  ciclo: string;
  nota: number;
  status: 'pendente' | 'em_andamento' | 'concluida';
  autoAvaliacao: number;
  avaliacaoGestor: number;
  feedback360: number;
  metas: { titulo: string; progresso: number; peso: number }[];
}

interface OKR {
  id: string;
  objetivo: string;
  keyResults: { titulo: string; meta: number; atual: number; unidade: string }[];
  responsavel: string;
  prazo: string;
  progresso: number;
}

const PerformanceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('avaliacoes');
  const [selectedCiclo, setSelectedCiclo] = useState('q4-2025');

  const avaliacoes: Avaliacao[] = [
    {
      id: '1',
      colaborador: 'Carlos Eduardo Silva',
      cargo: 'Engenheiro de Produção',
      departamento: 'Operações',
      ciclo: 'Q4 2025',
      nota: 4.2,
      status: 'em_andamento',
      autoAvaliacao: 4.5,
      avaliacaoGestor: 4.0,
      feedback360: 4.2,
      metas: [
        { titulo: 'Reduzir tempo de setup em 15%', progresso: 85, peso: 30 },
        { titulo: 'Implementar Lean na linha A', progresso: 100, peso: 40 },
        { titulo: 'Treinar 5 operadores', progresso: 60, peso: 30 }
      ]
    },
    {
      id: '2',
      colaborador: 'Ana Paula Martins',
      cargo: 'Analista de RH Sênior',
      departamento: 'Recursos Humanos',
      ciclo: 'Q4 2025',
      nota: 4.8,
      status: 'concluida',
      autoAvaliacao: 4.7,
      avaliacaoGestor: 4.9,
      feedback360: 4.8,
      metas: [
        { titulo: 'Reduzir turnover em 20%', progresso: 100, peso: 35 },
        { titulo: 'Implementar novo onboarding', progresso: 100, peso: 35 },
        { titulo: 'Pesquisa de clima', progresso: 100, peso: 30 }
      ]
    },
    {
      id: '3',
      colaborador: 'Roberto Santos Filho',
      cargo: 'Técnico de Segurança',
      departamento: 'QSMS',
      ciclo: 'Q4 2025',
      nota: 0,
      status: 'pendente',
      autoAvaliacao: 0,
      avaliacaoGestor: 0,
      feedback360: 0,
      metas: [
        { titulo: 'Zero acidentes na área', progresso: 100, peso: 50 },
        { titulo: 'Treinamentos SIPAT', progresso: 75, peso: 25 },
        { titulo: 'Auditorias mensais', progresso: 90, peso: 25 }
      ]
    }
  ];

  const okrs: OKR[] = [
    {
      id: '1',
      objetivo: 'Aumentar eficiência operacional',
      keyResults: [
        { titulo: 'Reduzir tempo de parada', meta: 20, atual: 18, unidade: '%' },
        { titulo: 'Aumentar OEE', meta: 85, atual: 82, unidade: '%' },
        { titulo: 'Reduzir custos de manutenção', meta: 15, atual: 12, unidade: '%' }
      ],
      responsavel: 'Carlos Silva',
      prazo: '31/12/2025',
      progresso: 78
    },
    {
      id: '2',
      objetivo: 'Desenvolver cultura de inovação',
      keyResults: [
        { titulo: 'Ideias implementadas', meta: 50, atual: 42, unidade: 'un' },
        { titulo: 'Participação em hackathons', meta: 80, atual: 75, unidade: '%' },
        { titulo: 'Patentes registradas', meta: 3, atual: 2, unidade: 'un' }
      ],
      responsavel: 'Equipe TI',
      prazo: '31/12/2025',
      progresso: 82
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluida':
        return <Badge className="bg-green-500">Concluída</Badge>;
      case 'em_andamento':
        return <Badge className="bg-blue-500">Em Andamento</Badge>;
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return 'text-green-500';
    if (nota >= 3.5) return 'text-blue-500';
    if (nota >= 2.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">4.3</p>
                <p className="text-sm text-muted-foreground">Média Geral</p>
              </div>
              <Star className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">76%</p>
                <p className="text-sm text-muted-foreground">Metas Atingidas</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">142</p>
                <p className="text-sm text-muted-foreground">Feedbacks Dados</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">Avaliações Pendentes</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50 border p-1">
          <TabsTrigger value="avaliacoes" className="gap-2">
            <Star className="w-4 h-4" />
            Avaliações
          </TabsTrigger>
          <TabsTrigger value="okrs" className="gap-2">
            <Target className="w-4 h-4" />
            OKRs
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Feedback Contínuo
          </TabsTrigger>
          <TabsTrigger value="nine-box" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            9-Box
          </TabsTrigger>
        </TabsList>

        {/* Avaliações Tab */}
        <TabsContent value="avaliacoes" className="space-y-4">
          <div className="flex justify-between items-center">
            <Select value={selectedCiclo} onValueChange={setSelectedCiclo}>
              <SelectTrigger className="w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="q4-2025">Q4 2025</SelectItem>
                <SelectItem value="q3-2025">Q3 2025</SelectItem>
                <SelectItem value="q2-2025">Q2 2025</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Avaliação
            </Button>
          </div>

          <div className="space-y-4">
            {avaliacoes.map((avaliacao, index) => (
              <motion.div
                key={avaliacao.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:border-primary/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {avaliacao.colaborador.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{avaliacao.colaborador}</h3>
                          <p className="text-sm text-muted-foreground">{avaliacao.cargo} • {avaliacao.departamento}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(avaliacao.status)}
                        {avaliacao.nota > 0 && (
                          <p className={`text-2xl font-bold mt-1 ${getNotaColor(avaliacao.nota)}`}>
                            {avaliacao.nota.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>

                    {avaliacao.status !== 'pendente' && (
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Auto-avaliação</p>
                          <p className="text-lg font-semibold">{avaliacao.autoAvaliacao.toFixed(1)}</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Gestor</p>
                          <p className="text-lg font-semibold">{avaliacao.avaliacaoGestor.toFixed(1)}</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">360°</p>
                          <p className="text-lg font-semibold">{avaliacao.feedback360.toFixed(1)}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Metas do Ciclo</p>
                      {avaliacao.metas.map((meta, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{meta.titulo}</span>
                            <span>{meta.progresso}%</span>
                          </div>
                          <Progress value={meta.progresso} className="h-1.5" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Ver Detalhes
                      </Button>
                      <Button size="sm" className="flex-1">
                        {avaliacao.status === 'pendente' ? 'Iniciar Avaliação' : 'Continuar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* OKRs Tab */}
        <TabsContent value="okrs" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo OKR
            </Button>
          </div>

          <div className="space-y-4">
            {okrs.map((okr, index) => (
              <Card key={okr.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{okr.objetivo}</CardTitle>
                      <CardDescription>
                        {okr.responsavel} • Prazo: {okr.prazo}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{okr.progresso}%</p>
                      <Progress value={okr.progresso} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {okr.keyResults.map((kr, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{kr.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          Meta: {kr.meta}{kr.unidade} | Atual: {kr.atual}{kr.unidade}
                        </p>
                      </div>
                      <div className="w-32">
                        <Progress value={(kr.atual / kr.meta) * 100} className="h-2" />
                      </div>
                      <span className="ml-2 text-sm font-medium w-12 text-right">
                        {Math.round((kr.atual / kr.meta) * 100)}%
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Enviar Feedback
              </CardTitle>
              <CardDescription>Dê feedback construtivo para seus colegas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o colaborador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carlos">Carlos Eduardo Silva</SelectItem>
                  <SelectItem value="ana">Ana Paula Martins</SelectItem>
                  <SelectItem value="roberto">Roberto Santos</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Digite seu feedback..." rows={4} />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Reconhecimento
                </Button>
                <Button className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Feedback
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feedbacks Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((_, idx) => (
                <div key={idx} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">CS</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Carlos Silva</p>
                      <p className="text-xs text-muted-foreground">há 2 horas</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">Reconhecimento</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Excelente trabalho na apresentação do projeto! Sua preparação e clareza foram muito importantes para o sucesso da reunião.
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 9-Box Tab */}
        <TabsContent value="nine-box">
          <Card>
            <CardHeader>
              <CardTitle>Matriz 9-Box</CardTitle>
              <CardDescription>Análise de potencial vs performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 aspect-square max-w-2xl mx-auto">
                {['Alto Potencial\nBaixa Performance', 'Alto Potencial\nMédia Performance', 'Alto Potencial\nAlta Performance',
                  'Médio Potencial\nBaixa Performance', 'Médio Potencial\nMédia Performance', 'Médio Potencial\nAlta Performance',
                  'Baixo Potencial\nBaixa Performance', 'Baixo Potencial\nMédia Performance', 'Baixo Potencial\nAlta Performance'
                ].map((label, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center ${
                      idx === 2 ? 'bg-green-500/20 border-green-500/50' :
                      idx === 5 || idx === 1 ? 'bg-blue-500/20 border-blue-500/50' :
                      idx === 4 ? 'bg-yellow-500/20 border-yellow-500/50' :
                      idx === 6 ? 'bg-red-500/20 border-red-500/50' :
                      'bg-muted/50'
                    }`}
                  >
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{label}</p>
                    <p className="text-xl font-bold mt-2">
                      {idx === 2 ? 12 : idx === 5 ? 23 : idx === 4 ? 45 : idx === 1 ? 18 : idx === 3 ? 8 : idx === 6 ? 3 : idx === 7 ? 15 : idx === 8 ? 28 : 5}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
                <span>← Baixa Performance | Alta Performance →</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceCenter;
