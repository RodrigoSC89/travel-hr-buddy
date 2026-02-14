/**
 * Fatigue Risk Predictor - Enterprise Intelligence Suite
 * Predição de fadiga da tripulação com ML + MLC 2006
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  Calendar,
  TrendingUp,
  Brain,
  Moon,
  Sun,
  Coffee,
  Zap,
  BarChart3,
  Target,
  RefreshCw,
  FileText,
  Bell,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  avatar?: string;
  fatigueScore: number;
  workHoursToday: number;
  workHoursWeek: number;
  restHoursLast24h: number;
  lastBreak: string;
  mlcCompliant: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictions: {
    nextHighRisk: string;
    recommendation: string;
  };
}

interface MLCViolation {
  id: string;
  crewId: string;
  crewName: string;
  type: string;
  description: string;
  date: string;
  severity: 'warning' | 'violation';
}

const CREW_DATA: CrewMember[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    rank: 'Capitão',
    department: 'Ponte',
    fatigueScore: 25,
    workHoursToday: 6,
    workHoursWeek: 42,
    restHoursLast24h: 10,
    lastBreak: '2h atrás',
    mlcCompliant: true,
    riskLevel: 'low',
    predictions: {
      nextHighRisk: 'Sexta-feira, 18:00',
      recommendation: 'Manter rotina atual',
    },
  },
  {
    id: '2',
    name: 'Roberto Santos',
    rank: '1º Oficial',
    department: 'Ponte',
    fatigueScore: 65,
    workHoursToday: 10,
    workHoursWeek: 56,
    restHoursLast24h: 6,
    lastBreak: '5h atrás',
    mlcCompliant: false,
    riskLevel: 'high',
    predictions: {
      nextHighRisk: 'Hoje, 22:00',
      recommendation: 'Intervalo imediato recomendado',
    },
  },
  {
    id: '3',
    name: 'Ana Costa',
    rank: '2º Oficial',
    department: 'Ponte',
    fatigueScore: 45,
    workHoursToday: 8,
    workHoursWeek: 48,
    restHoursLast24h: 8,
    lastBreak: '3h atrás',
    mlcCompliant: true,
    riskLevel: 'medium',
    predictions: {
      nextHighRisk: 'Quinta-feira, 14:00',
      recommendation: 'Programar descanso adicional',
    },
  },
  {
    id: '4',
    name: 'João Oliveira',
    rank: 'Chefe de Máquinas',
    department: 'Máquinas',
    fatigueScore: 85,
    workHoursToday: 12,
    workHoursWeek: 68,
    restHoursLast24h: 4,
    lastBreak: '8h atrás',
    mlcCompliant: false,
    riskLevel: 'critical',
    predictions: {
      nextHighRisk: 'AGORA',
      recommendation: 'DESCANSO OBRIGATÓRIO',
    },
  },
];

const MLC_VIOLATIONS: MLCViolation[] = [
  {
    id: '1',
    crewId: '2',
    crewName: 'Roberto Santos',
    type: 'Horas de Trabalho',
    description: 'Excedeu 14 horas em período de 24h',
    date: 'Hoje, 10:00',
    severity: 'violation',
  },
  {
    id: '2',
    crewId: '4',
    crewName: 'João Oliveira',
    type: 'Descanso Mínimo',
    description: 'Menos de 6 horas de descanso contínuo',
    date: 'Ontem, 22:00',
    severity: 'violation',
  },
  {
    id: '3',
    crewId: '4',
    crewName: 'João Oliveira',
    type: 'Horas Semanais',
    description: 'Aproximando-se do limite de 72h semanais',
    date: 'Hoje, 08:00',
    severity: 'warning',
  },
];

const getRiskColor = (level: CrewMember['riskLevel']) => {
  switch (level) {
    case 'low': return 'bg-success';
    case 'medium': return 'bg-warning';
    case 'high': return 'bg-warning';
    case 'critical': return 'bg-destructive';
  }
};

const getRiskBadgeColor = (level: CrewMember['riskLevel']) => {
  switch (level) {
    case 'low': return 'bg-success/10 text-success border-success/20';
    case 'medium': return 'bg-warning/10 text-warning border-warning/20';
    case 'high': return 'bg-warning/10 text-warning border-warning/20';
    case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
  }
};

export default function FatigueRiskPage() {
  const [crew] = useState<CrewMember[]>(CREW_DATA);
  const [violations] = useState<MLCViolation[]>(MLC_VIOLATIONS);

  const stats = {
    avgFatigue: crew.reduce((acc, c) => acc + c.fatigueScore, 0) / crew.length,
    highRisk: crew.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length,
    mlcViolations: violations.filter(v => v.severity === 'violation').length,
    compliant: crew.filter(c => c.mlcCompliant).length,
  };

  return (
    <>
      <Helmet>
        <title>Fatigue Risk Predictor | Nauti One</title>
        <meta name="description" content="Predição de fadiga da tripulação com ML + MLC 2006" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Fatigue Risk Predictor
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Brain className="h-3 w-3 mr-1" />
                  ML + MLC 2006
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Monitoramento em tempo real e predição de fadiga da tripulação
              </p>
            </div>
          </div>

          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-3xl font-bold",
                    stats.avgFatigue > 60 ? 'text-destructive' : stats.avgFatigue > 40 ? 'text-warning' : 'text-success'
                  )}>
                    {stats.avgFatigue.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Fadiga Média</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-destructive">{stats.highRisk}</p>
                  <p className="text-xs text-muted-foreground">Alto Risco</p>
                </div>
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-amber-500">{stats.mlcViolations}</p>
                  <p className="text-xs text-muted-foreground">Violações MLC</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <FileText className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-success">{stats.compliant}/{crew.length}</p>
                  <p className="text-xs text-muted-foreground">Conformes MLC</p>
                </div>
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="crew">
          <TabsList>
            <TabsTrigger value="crew">Tripulação</TabsTrigger>
            <TabsTrigger value="violations">Violações MLC ({violations.length})</TabsTrigger>
            <TabsTrigger value="predictions">Predições IA</TabsTrigger>
            <TabsTrigger value="schedule">Otimização de Escala</TabsTrigger>
          </TabsList>

          <TabsContent value="crew" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crew.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={cn(
                    "border-2",
                    member.riskLevel === 'critical' && "border-destructive/50 bg-destructive/5",
                    member.riskLevel === 'high' && "border-warning/30"
                  )}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.rank} • {member.department}</p>
                            </div>
                            <Badge variant="outline" className={getRiskBadgeColor(member.riskLevel)}>
                              {member.riskLevel === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {member.riskLevel.toUpperCase()}
                            </Badge>
                          </div>

                          {/* Fatigue Score */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Índice de Fadiga</span>
                              <span className="font-medium">{member.fatigueScore}%</span>
                            </div>
                            <Progress value={member.fatigueScore} className={cn(
                              "h-2",
                              member.fatigueScore > 70 && "[&>div]:bg-destructive",
                              member.fatigueScore > 50 && member.fatigueScore <= 70 && "[&>div]:bg-warning",
                              member.fatigueScore <= 50 && "[&>div]:bg-success"
                            )} />
                          </div>

                          {/* Work Stats */}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Clock className="h-3 w-3" />
                                Hoje
                              </div>
                              <span className="font-medium">{member.workHoursToday}h</span>
                            </div>
                            <div className="p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Calendar className="h-3 w-3" />
                                Semana
                              </div>
                              <span className={cn(
                                "font-medium",
                                member.workHoursWeek > 60 && "text-destructive"
                              )}>{member.workHoursWeek}h</span>
                            </div>
                            <div className="p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Moon className="h-3 w-3" />
                                Descanso 24h
                              </div>
                              <span className={cn(
                                "font-medium",
                                member.restHoursLast24h < 6 && "text-destructive"
                              )}>{member.restHoursLast24h}h</span>
                            </div>
                          </div>

                          {/* MLC Status */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2">
                              {member.mlcCompliant ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                              <span className="text-xs">
                                MLC 2006: {member.mlcCompliant ? 'Conforme' : 'Não Conforme'}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Último intervalo: {member.lastBreak}
                            </span>
                          </div>

                          {/* Prediction */}
                          {member.riskLevel !== 'low' && (
                            <div className={cn(
                              "mt-3 p-2 rounded text-xs",
                              member.riskLevel === 'critical' ? 'bg-destructive/20' : 'bg-warning/10'
                            )}>
                              <div className="flex items-center gap-1 font-medium mb-1">
                                <Brain className="h-3 w-3" />
                                Predição IA:
                              </div>
                              <p className="text-muted-foreground">{member.predictions.recommendation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="violations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Violações MLC 2006
                </CardTitle>
                <CardDescription>
                  Registro de não conformidades com regulamentos de trabalho marítimo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {violations.map((violation) => (
                    <motion.div
                      key={violation.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className={cn(
                        "flex items-start gap-4 p-4 border rounded-lg",
                        violation.severity === 'violation' ? 'border-destructive/30 bg-destructive/5' : 'border-warning/30 bg-warning/5'
                      )}>
                        <div className={cn(
                          "p-2 rounded-full",
                          violation.severity === 'violation' ? 'bg-destructive/20' : 'bg-warning/20'
                        )}>
                          {violation.severity === 'violation' ? (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          ) : (
                            <Bell className="h-4 w-4 text-warning" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{violation.type}</h4>
                            <Badge variant={violation.severity === 'violation' ? 'destructive' : 'secondary'}>
                              {violation.severity === 'violation' ? 'Violação' : 'Alerta'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{violation.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Tripulante: {violation.crewName}</span>
                            <span>{violation.date}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Predições de Fadiga com Machine Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 mx-auto text-primary/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Modelo ML Ativo</h3>
                  <p className="text-muted-foreground mb-4">
                    Analisando padrões de trabalho, descanso e performance para predizer picos de fadiga
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">94%</p>
                      <p className="text-xs text-muted-foreground">Precisão</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">6h</p>
                      <p className="text-xs text-muted-foreground">Antecedência</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">1.2k</p>
                      <p className="text-xs text-muted-foreground">Dados analisados</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Otimização de Escala
                </CardTitle>
                <CardDescription>
                  Sugestões de escala para minimizar fadiga e maximizar compliance MLC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto text-primary/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Otimizador de Escala</h3>
                  <p className="text-muted-foreground mb-4">
                    A IA está analisando as melhores combinações de turnos para sua tripulação
                  </p>
                  <Button>
                    <Zap className="h-4 w-4 mr-2" />
                    Gerar Escala Otimizada
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
