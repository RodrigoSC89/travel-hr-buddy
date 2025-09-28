import React, { useState, useEffect } from 'react';
import { MaritimeChecklistSystem } from '@/components/maritime-checklists/maritime-checklist-system';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Ship, 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Calendar,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MaritimeStats {
  totalChecklists: number;
  completedChecklists: number;
  pendingChecklists: number;
  activeVessels: number;
  averageCompliance: number;
  criticalIssues: number;
}

export default function MaritimeChecklists() {
  // Mock user for development
  const user = { id: 'demo-user-id' };
  const [view, setView] = useState<'dashboard' | 'checklists'>('dashboard');
  const [stats, setStats] = useState<MaritimeStats>({
    totalChecklists: 0,
    completedChecklists: 0,
    pendingChecklists: 0,
    activeVessels: 0,
    averageCompliance: 0,
    criticalIssues: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMaritimeStats();
    }
  }, [user]);

  const fetchMaritimeStats = async () => {
    try {
      setLoading(true);
      
      // Fetch checklists stats
      const { data: checklists, error: checklistsError } = await supabase
        .from('operational_checklists')
        .select('status, compliance_score')
        .eq('created_by', user?.id);

      if (checklistsError) throw checklistsError;

      // Fetch vessels count
      const { data: vessels, error: vesselsError } = await supabase
        .from('vessels')
        .select('id', { count: 'exact' });

      if (vesselsError) throw vesselsError;

      // Calculate stats
      const total = checklists?.length || 0;
      const completed = checklists?.filter(c => c.status === 'completed').length || 0;
      const pending = checklists?.filter(c => c.status === 'in_progress' || c.status === 'draft').length || 0;
      const avgCompliance = checklists?.length > 0 
        ? checklists.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / checklists.length 
        : 0;

      setStats({
        totalChecklists: total,
        completedChecklists: completed,
        pendingChecklists: pending,
        activeVessels: vessels?.length || 0,
        averageCompliance: Math.round(avgCompliance),
        criticalIssues: 0 // TODO: Calculate from checklist items
      });
    } catch (error) {
      console.error('Error fetching maritime stats:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'checklists') {
    return (
      <MaritimeChecklistSystem
        userId={user?.id || ''}
        userRole="inspector"
        vesselId={undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Ship className="w-8 h-8 text-blue-600" />
                Sistema Marítimo
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestão completa de inspeções e checklists marítimos
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setView('dashboard')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button onClick={() => setView('checklists')}>
                <FileText className="w-4 h-4 mr-2" />
                Checklists
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Checklists</p>
                  <p className="text-2xl font-bold">{stats.totalChecklists}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedChecklists}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingChecklists}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Navios Ativos</p>
                  <p className="text-2xl font-bold">{stats.activeVessels}</p>
                </div>
                <Ship className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conformidade</p>
                  <p className="text-2xl font-bold">{stats.averageCompliance}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Issues Críticos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalIssues}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Compliance Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Conformidade Geral
              </CardTitle>
              <CardDescription>
                Percentual médio de conformidade dos checklists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Conformidade Atual</span>
                  <span className="font-medium">{stats.averageCompliance}%</span>
                </div>
                <Progress value={stats.averageCompliance} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((stats.completedChecklists / Math.max(stats.totalChecklists, 1)) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa de Conclusão</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.averageCompliance}%
                  </div>
                  <div className="text-sm text-muted-foreground">Qualidade Média</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Acesso direto às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setView('checklists')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Novo Checklist
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setView('checklists')}
              >
                <Users className="w-4 h-4 mr-2" />
                Gerenciar Inspetores
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setView('checklists')}
              >
                <Ship className="w-4 h-4 mr-2" />
                Cadastrar Navio
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => setView('checklists')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: 'completed',
                  title: 'Checklist DP finalizado',
                  description: 'MV Ocean Explorer - Inspeção Dynamic Positioning',
                  time: '2 horas atrás',
                  icon: CheckCircle,
                  color: 'text-green-600'
                },
                {
                  type: 'started',
                  title: 'Nova inspeção iniciada',
                  description: 'PSV Atlantic - Rotina de Máquinas',
                  time: '4 horas atrás',
                  icon: Clock,
                  color: 'text-blue-600'
                },
                {
                  type: 'alert',
                  title: 'Anomalia detectada',
                  description: 'AHTS Pacific - Sistema de segurança',
                  time: '6 horas atrás',
                  icon: AlertTriangle,
                  color: 'text-orange-600'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <activity.icon className={`w-5 h-5 mt-0.5 ${activity.color}`} />
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}