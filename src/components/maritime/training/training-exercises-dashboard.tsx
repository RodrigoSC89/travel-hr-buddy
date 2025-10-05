import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  FileText, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Flame,
  LifeBuoy,
  Zap,
  Download,
  Plus,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrainingExercise {
  id: string;
  type: 'fire' | 'abandon' | 'mob' | 'blackout' | 'medical';
  name: string;
  date: Date;
  status: 'completed' | 'scheduled' | 'overdue';
  participants: number;
  duration: number;
  performance: number;
}

interface CrewMember {
  id: string;
  name: string;
  position: string;
  trainings: number;
  performance: number;
  certifications: string[];
  expiringCerts: number;
}

export const TrainingExercisesDashboard: React.FC = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('calendar');

  const exercises: TrainingExercise[] = [
    {
      id: '1',
      type: 'fire',
      name: 'Exercício de Incêndio - Praça de Máquinas',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'scheduled',
      participants: 24,
      duration: 45,
      performance: 0
    },
    {
      id: '2',
      type: 'abandon',
      name: 'Abandono de Embarcação',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      status: 'completed',
      participants: 28,
      duration: 60,
      performance: 92
    },
    {
      id: '3',
      type: 'mob',
      name: 'Homem ao Mar (MOB)',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'completed',
      participants: 22,
      duration: 30,
      performance: 88
    },
    {
      id: '4',
      type: 'blackout',
      name: 'Simulação de Blackout Total',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'scheduled',
      participants: 26,
      duration: 50,
      performance: 0
    }
  ];

  const crewMembers: CrewMember[] = [
    {
      id: '1',
      name: 'João Silva',
      position: 'Capitão',
      trainings: 12,
      performance: 95,
      certifications: ['STCW', 'ISM', 'ISPS'],
      expiringCerts: 0
    },
    {
      id: '2',
      name: 'Maria Santos',
      position: 'Oficial de Máquinas',
      trainings: 10,
      performance: 88,
      certifications: ['STCW', 'ISM'],
      expiringCerts: 1
    },
    {
      id: '3',
      name: 'Pedro Costa',
      position: 'Marinheiro',
      trainings: 8,
      performance: 82,
      certifications: ['STCW'],
      expiringCerts: 2
    }
  ];

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'fire': return <Flame className="w-5 h-5 text-red-500" />;
      case 'abandon': return <LifeBuoy className="w-5 h-5 text-blue-500" />;
      case 'mob': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'blackout': return <Zap className="w-5 h-5 text-yellow-500" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const generateAIReport = (exerciseId: string) => {
    toast({
      title: "🤖 Relatório IA Gerado",
      description: "Relatório técnico IMCA/ISM gerado com sucesso pela IA",
    });
  };

  const generateAnnualPlan = () => {
    toast({
      title: "📅 Plano Anual Gerado",
      description: "Plano de treinamentos SOLAS/ISM criado automaticamente",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            Treinamentos e Exercícios SOLAS/ISM
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema inteligente de gestão de treinamentos marítimos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateAnnualPlan}>
            <Plus className="w-4 h-4 mr-2" />
            Plano Anual
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Exercícios Realizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">75% do planejado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">88%</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
              <TrendingUp className="w-3 h-3" />
              +5% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Certificações Vencendo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">8</div>
            <p className="text-xs text-muted-foreground mt-2">Próximos 90 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tripulantes Treinados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32/34</div>
            <Progress value={94} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">94% da tripulação</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="exercises">
            <FileText className="w-4 h-4 mr-2" />
            Exercícios
          </TabsTrigger>
          <TabsTrigger value="crew">
            <Users className="w-4 h-4 mr-2" />
            Tripulação
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="w-4 h-4 mr-2" />
            IA Assistente
          </TabsTrigger>
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Exercícios</CardTitle>
              <CardDescription>
                Programação automática conforme SOLAS e ISM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exercises.map((exercise) => (
                  <div 
                    key={exercise.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getExerciseIcon(exercise.type)}
                      <div>
                        <h4 className="font-semibold">{exercise.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {exercise.date.toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {exercise.participants} participantes
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        exercise.status === 'completed' ? 'default' :
                        exercise.status === 'scheduled' ? 'outline' : 'destructive'
                      }>
                        {exercise.status === 'completed' ? 'Concluído' :
                         exercise.status === 'scheduled' ? 'Agendado' : 'Atrasado'}
                      </Badge>
                      {exercise.status === 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateAIReport(exercise.id)}
                        >
                          <Brain className="w-4 h-4 mr-1" />
                          Relatório IA
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Modelos de Relatórios</CardTitle>
                <CardDescription>Templates automáticos para exercícios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Flame className="w-4 h-4 mr-2" />
                  Exercício de Incêndio
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <LifeBuoy className="w-4 h-4 mr-2" />
                  Abandono de Embarcação
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Homem ao Mar (MOB)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Blackout Total
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance por Tipo</CardTitle>
                <CardDescription>Análise de eficácia dos treinamentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Incêndio</span>
                    <span className="font-semibold">92%</span>
                  </div>
                  <Progress value={92} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Abandono</span>
                    <span className="font-semibold">88%</span>
                  </div>
                  <Progress value={88} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>MOB</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <Progress value={85} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Blackout</span>
                    <span className="font-semibold">90%</span>
                  </div>
                  <Progress value={90} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crew Tab */}
        <TabsContent value="crew" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico Individual</CardTitle>
              <CardDescription>
                Performance e métricas por tripulante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crewMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.position}</p>
                      <div className="flex gap-2 mt-2">
                        {member.certifications.map((cert) => (
                          <Badge key={cert} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{member.trainings}</div>
                        <div className="text-muted-foreground">Treinamentos</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{member.performance}%</div>
                        <div className="text-muted-foreground">Performance</div>
                      </div>
                      {member.expiringCerts > 0 && (
                        <Badge variant="destructive">
                          {member.expiringCerts} vencendo
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Assistente IA para Treinamentos
              </CardTitle>
              <CardDescription>
                IA integrada para análise e suporte a treinamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Geração de Relatórios</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>✓ Linguagem técnica IMCA/ISM automática</p>
                    <p>✓ Análise de performance e métricas</p>
                    <p>✓ Recomendações de melhorias</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Explicação de Procedimentos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>✓ Procedimentos corretos de cada drill</p>
                    <p>✓ Requisitos regulamentares</p>
                    <p>✓ Melhores práticas do setor</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Simulações Interativas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>✓ Avaliação de respostas em tempo real</p>
                    <p>✓ Feedback personalizado</p>
                    <p>✓ Scores e rankings</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Emergências Dinâmicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>✓ Cenários adaptativos</p>
                    <p>✓ Treinamento virtual imersivo</p>
                    <p>✓ Análise de decisões</p>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <Brain className="w-4 h-4 mr-2" />
                  Iniciar Sessão com IA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
