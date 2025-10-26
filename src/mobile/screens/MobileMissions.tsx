/**
 * PATCH 187.0 - Mobile Missions Screen
 * 
 * Mission management and tracking for mobile app
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Users,
} from 'lucide-react';
import { structuredLogger } from '@/lib/logger/structured-logger';

interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed' | 'pending';
  progress: number;
  startDate: Date;
  endDate?: Date;
  location: string;
  teamSize: number;
  priority: 'high' | 'medium' | 'low';
}

export const MobileMissions: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: '1',
      title: 'Inspeção de Segurança - Embarcação Alpha',
      description: 'Inspeção completa de todos os sistemas de segurança',
      status: 'active',
      progress: 65,
      startDate: new Date(),
      location: 'Porto de Santos',
      teamSize: 4,
      priority: 'high',
    },
    {
      id: '2',
      title: 'Manutenção Preventiva - Motor Principal',
      description: 'Manutenção programada do motor principal',
      status: 'active',
      progress: 30,
      startDate: new Date(),
      location: 'Embarcação Beta',
      teamSize: 3,
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Treinamento de Emergência',
      description: 'Simulação de procedimentos de emergência',
      status: 'pending',
      progress: 0,
      startDate: new Date(Date.now() + 86400000),
      location: 'Base Naval',
      teamSize: 8,
      priority: 'medium',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredMissions = missions.filter((mission) => {
    if (filter === 'all') return true;
    if (filter === 'active') return mission.status === 'active';
    if (filter === 'completed') return mission.status === 'completed';
    return true;
  });

  const getStatusIcon = (status: Mission['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: Mission['status']) => {
    const variants = {
      active: 'default',
      completed: 'default',
      failed: 'destructive',
      pending: 'secondary',
    } as const;

    const labels = {
      active: 'Em andamento',
      completed: 'Concluída',
      failed: 'Falhou',
      pending: 'Pendente',
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityColor = (priority: Mission['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Target className="h-6 w-6" />
          Missões
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie e acompanhe suas missões
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Ativas
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Concluídas
        </Button>
      </div>

      {/* Missions List */}
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-3">
          {filteredMissions.map((mission) => (
            <Card key={mission.id} className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {getStatusIcon(mission.status)}
                    <div>
                      <CardTitle className="text-base">{mission.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {mission.description}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(mission.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Progress */}
                {mission.status === 'active' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold">{mission.progress}%</span>
                    </div>
                    <Progress value={mission.progress} />
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{mission.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{mission.teamSize} membros</span>
                  </div>
                </div>

                {/* Priority & Date */}
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${getPriorityColor(mission.priority)}`}>
                    Prioridade: {mission.priority === 'high' ? 'Alta' : mission.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                  <span className="text-muted-foreground">
                    {mission.startDate.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{missions.filter(m => m.status === 'active').length}</p>
            <p className="text-xs text-muted-foreground">Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{missions.filter(m => m.status === 'pending').length}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-500">{missions.filter(m => m.status === 'completed').length}</p>
            <p className="text-xs text-muted-foreground">Concluídas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
