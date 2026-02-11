/**
 * People Dashboard - KPIs e Visão Geral de RH
 * Refatorado para dados reais do Supabase
 */

import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  TrendingUp,
  Heart,
  Target,
  Award,
  AlertTriangle,
  Calendar,
  Briefcase,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePeopleKPIs, usePeopleAlerts, useBirthdays } from '@/hooks/usePeopleDashboardData';

const PeopleDashboard: FC = () => {
  const { data: kpis, isLoading: kpisLoading } = usePeopleKPIs();
  const { data: alertas = [], isLoading: alertsLoading } = usePeopleAlerts();
  const { data: aniversariantes = [], isLoading: birthdaysLoading } = useBirthdays();

  const getAlertClass = (tipo: string) => {
    switch (tipo) {
      case 'danger': return 'bg-destructive/10 border-destructive/30';
      case 'warning': return 'bg-warning/10 border-warning/30';
      case 'success': return 'bg-success/10 border-success/30';
      default: return 'bg-primary/10 border-primary/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-primary" />
                {kpisLoading ? <Skeleton className="h-6 w-12" /> : (
                  <Badge variant="secondary" className="bg-primary/20 text-primary">Ativo</Badge>
                )}
              </div>
              <div className="mt-3">
                {kpisLoading ? <Skeleton className="h-8 w-20" /> : (
                  <p className="text-2xl font-bold">{kpis?.totalColaboradores || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Total Colaboradores</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <UserPlus className="w-8 h-8 text-success" />
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="mt-3">
                {kpisLoading ? <Skeleton className="h-8 w-12" /> : (
                  <p className="text-2xl font-bold">{kpis?.novasContratacoes || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Novas Contratações</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <UserMinus className="w-8 h-8 text-destructive" />
                <span className="text-xs text-muted-foreground">{kpis?.turnover || 0}%</span>
              </div>
              <div className="mt-3">
                {kpisLoading ? <Skeleton className="h-8 w-12" /> : (
                  <p className="text-2xl font-bold">{kpis?.desligamentos || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Turnover Mensal</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Heart className="w-8 h-8 text-accent-foreground" />
                {kpis?.climaScore ? (
                  <Badge variant="secondary">Excelente</Badge>
                ) : null}
              </div>
              <div className="mt-3">
                {kpisLoading ? <Skeleton className="h-8 w-16" /> : (
                  <p className="text-2xl font-bold">{kpis?.climaScore || '—'}%</p>
                )}
                <p className="text-sm text-muted-foreground">Score de Clima</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Briefcase className="w-8 h-8 text-warning" />
                <span className="text-xs text-muted-foreground">{kpis?.candidatosPipeline || 0} candidatos</span>
              </div>
              <div className="mt-3">
                {kpisLoading ? <Skeleton className="h-8 w-12" /> : (
                  <p className="text-2xl font-bold">{kpis?.vagasAbertas || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Vagas Abertas</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas Inteligentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Alertas Inteligentes
            </CardTitle>
            <CardDescription>Insights baseados em dados reais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertsLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)
            ) : alertas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Nenhum alerta ativo</p>
              </div>
            ) : (
              alertas.map((alerta, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border flex items-center justify-between ${getAlertClass(alerta.tipo)}`}
                >
                  <span className="text-sm">{alerta.texto}</span>
                  <Badge variant={alerta.prioridade === 'critica' ? 'destructive' : alerta.prioridade === 'alta' ? 'default' : 'secondary'}>
                    {alerta.prioridade}
                  </Badge>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Aniversariantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-foreground" />
              Aniversariantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {birthdaysLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)
            ) : aniversariantes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhum aniversariante próximo</p>
            ) : (
              aniversariantes.map((pessoa: Record<string, string>, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{pessoa.nome}</p>
                    <p className="text-xs text-muted-foreground">{pessoa.departamento}</p>
                  </div>
                  <Badge variant={pessoa.data === 'Hoje' ? 'default' : 'secondary'}>{pessoa.data}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kpisLoading ? <Skeleton className="h-10 w-20" /> : (
              <div className="text-3xl font-bold text-primary">{kpis?.engajamento || 0}%</div>
            )}
            <Progress value={kpis?.engajamento || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4" />
              Metas Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kpisLoading ? <Skeleton className="h-10 w-20" /> : (
              <div className="text-3xl font-bold text-success">{kpis?.metasConcluidas || 0}%</div>
            )}
            <Progress value={kpis?.metasConcluidas || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Treinamentos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kpisLoading ? <Skeleton className="h-10 w-12" /> : (
              <div className="text-3xl font-bold text-primary">{kpis?.treinamentosAtivos || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-2">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Workforce Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure métricas para visualizar distribuição da força de trabalho
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PeopleDashboard;
