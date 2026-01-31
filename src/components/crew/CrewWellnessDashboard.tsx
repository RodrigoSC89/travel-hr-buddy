/**
 * Crew Wellness Dashboard - PATCH 1000
 * Visual interface for AI-powered wellness monitoring
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, 
  Brain, 
  Moon, 
  Users, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Calendar,
  RefreshCw,
  Smile,
  Frown,
  Meh,
  Activity,
  Shield,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  avatar?: string;
  daysOnboard: number;
  wellnessScore: number;
  burnoutRisk: number;
  trend: 'improving' | 'stable' | 'declining';
  lastCheckIn: Date;
  alerts: Array<{
    type: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }>;
}

interface Intervention {
  id: string;
  crewMember: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  actions: string[];
  scheduledDate?: Date;
}

// Mock data
const MOCK_CREW: CrewMember[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    rank: 'Chief Engineer',
    department: 'Engine',
    daysOnboard: 75,
    wellnessScore: 42,
    burnoutRisk: 68,
    trend: 'declining',
    lastCheckIn: new Date(Date.now() - 2 * 60 * 60 * 1000),
    alerts: [
      { type: 'burnout', severity: 'warning', message: 'Risco elevado de burnout' },
      { type: 'sleep', severity: 'warning', message: 'Qualidade de sono baixa' },
    ],
  },
  {
    id: '2',
    name: 'Ana Costa',
    rank: '2nd Officer',
    department: 'Deck',
    daysOnboard: 45,
    wellnessScore: 78,
    burnoutRisk: 22,
    trend: 'stable',
    lastCheckIn: new Date(Date.now() - 6 * 60 * 60 * 1000),
    alerts: [],
  },
  {
    id: '3',
    name: 'Roberto Ferreira',
    rank: 'Electrician',
    department: 'Engine',
    daysOnboard: 95,
    wellnessScore: 35,
    burnoutRisk: 75,
    trend: 'declining',
    lastCheckIn: new Date(Date.now() - 24 * 60 * 60 * 1000),
    alerts: [
      { type: 'burnout', severity: 'critical', message: 'Intervenção imediata necessária' },
    ],
  },
  {
    id: '4',
    name: 'Marina Santos',
    rank: 'Cook',
    department: 'Catering',
    daysOnboard: 30,
    wellnessScore: 85,
    burnoutRisk: 15,
    trend: 'improving',
    lastCheckIn: new Date(Date.now() - 1 * 60 * 60 * 1000),
    alerts: [],
  },
  {
    id: '5',
    name: 'João Oliveira',
    rank: 'AB Seaman',
    department: 'Deck',
    daysOnboard: 60,
    wellnessScore: 55,
    burnoutRisk: 45,
    trend: 'stable',
    lastCheckIn: new Date(Date.now() - 12 * 60 * 60 * 1000),
    alerts: [
      { type: 'stress', severity: 'info', message: 'Níveis de estresse moderados' },
    ],
  },
];

const urgencyColors = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-warning text-warning-foreground',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-success text-success-foreground',
};

export function CrewWellnessDashboard() {
  const [crew] = useState<CrewMember[]>(MOCK_CREW);
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [loading, setLoading] = useState(false);

  const stats = {
    total: crew.length,
    healthy: crew.filter(c => c.wellnessScore >= 70).length,
    atRisk: crew.filter(c => c.burnoutRisk > 50).length,
    critical: crew.filter(c => c.alerts.some(a => a.severity === 'critical')).length,
  };

  const avgWellness = Math.round(crew.reduce((sum, c) => sum + c.wellnessScore, 0) / crew.length);
  const avgBurnoutRisk = Math.round(crew.reduce((sum, c) => sum + c.burnoutRisk, 0) / crew.length);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMoodIcon = (score: number) => {
    if (score >= 70) return <Smile className="h-5 w-5 text-emerald-500" />;
    if (score >= 50) return <Meh className="h-5 w-5 text-amber-500" />;
    return <Frown className="h-5 w-5 text-destructive" />;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulação</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saudáveis</p>
                <p className="text-2xl font-bold text-success">{stats.healthy}</p>
              </div>
              <Heart className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Risco</p>
                <p className="text-2xl font-bold text-warning">{stats.atRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crítico</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wellness Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Wellness Médio</span>
              <span className="text-2xl font-bold">{avgWellness}%</span>
            </div>
            <Progress 
              value={avgWellness} 
              className={cn(
                "h-3",
                avgWellness >= 70 ? "[&>div]:bg-success" :
                avgWellness >= 50 ? "[&>div]:bg-warning" :
                "[&>div]:bg-destructive"
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Risco de Burnout</span>
              <span className="text-2xl font-bold">{avgBurnoutRisk}%</span>
            </div>
            <Progress 
              value={avgBurnoutRisk} 
              className={cn(
                "h-3",
                avgBurnoutRisk <= 30 ? "[&>div]:bg-success" :
                avgBurnoutRisk <= 50 ? "[&>div]:bg-warning" :
                "[&>div]:bg-destructive"
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crew List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Monitoramento da Tripulação
            </CardTitle>
            <CardDescription>
              Análise de bem-estar baseada em IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {crew.sort((a, b) => a.wellnessScore - b.wellnessScore).map((member) => (
                  <div
                    key={member.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      selectedMember?.id === member.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50",
                      member.alerts.some(a => a.severity === 'critical') && "border-destructive/50"
                    )}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{member.name}</span>
                          {getTrendIcon(member.trend)}
                          {member.alerts.some(a => a.severity === 'critical') && (
                            <Badge variant="destructive" className="text-xs">
                              Crítico
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.rank} • {member.department} • {member.daysOnboard} dias
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {getMoodIcon(member.wellnessScore)}
                            <span className="font-bold">{member.wellnessScore}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Wellness</p>
                        </div>
                        
                        <div className="text-right">
                          <span className={cn(
                            "font-bold",
                            member.burnoutRisk > 60 ? "text-destructive" :
                            member.burnoutRisk > 40 ? "text-warning" :
                            "text-success"
                          )}>
                            {member.burnoutRisk}%
                          </span>
                          <p className="text-xs text-muted-foreground">Burnout</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Análise Individual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMember ? (
              <div className="space-y-4">
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarFallback className="text-xl">
                      {selectedMember.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold">{selectedMember.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedMember.rank}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <Heart className="h-5 w-5 mx-auto mb-1 text-destructive" />
                    <p className="font-bold">{selectedMember.wellnessScore}%</p>
                    <p className="text-xs text-muted-foreground">Wellness</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <Brain className="h-5 w-5 mx-auto mb-1 text-secondary" />
                    <p className="font-bold">{selectedMember.burnoutRisk}%</p>
                    <p className="text-xs text-muted-foreground">Burnout</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dias a bordo</p>
                    <p className="font-medium">{selectedMember.daysOnboard} dias</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Último check-in</p>
                    <p className="font-medium">
                      {new Date(selectedMember.lastCheckIn).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                {selectedMember.alerts.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Alertas
                    </h5>
                    <div className="space-y-2">
                      {selectedMember.alerts.map((alert, i) => (
                        <div 
                          key={i}
                          className={cn(
                            "p-2 rounded text-sm",
                            alert.severity === 'critical' ? "bg-destructive/10 text-destructive" :
                            alert.severity === 'warning' ? "bg-amber-500/10 text-amber-600" :
                            "bg-blue-500/10 text-blue-600"
                          )}
                        >
                          {alert.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button className="w-full" onClick={() => {
                  toast.success(`Iniciando intervenção para ${selectedMember.name}`, {
                    description: "Plano de acompanhamento será criado"
                  });
                }}>
                  <Activity className="h-4 w-4 mr-2" />
                  Iniciar Intervenção
                </Button>
                <Button variant="outline" className="w-full mt-2" onClick={() => {
                  toast.info(`Agendando check-in com ${selectedMember.name}`);
                }}>
                  <Clock className="h-4 w-4 mr-2" />
                  Agendar Check-in
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um membro da tripulação</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CrewWellnessDashboard;
