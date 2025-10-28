/**
 * PATCH 348: Mission Control v2 - Autonomy Dashboard
 * Autonomous task management and monitoring
 */

import { useQuery, useMutation, useQueryClient } from '@tantml:function_calls>import { Check, X, Play, Settings, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AutonomyService } from '@/services/autonomy.service';

export const AutonomyDashboard = () => {
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ['autonomy-stats'],
    queryFn: () => AutonomyService.getDashboardStats(),
    refetchInterval: 10000,
  });

  const { data: pendingTasks = [] } = useQuery({
    queryKey: ['pending-tasks'],
    queryFn: () => AutonomyService.getPendingTasks(),
  });

  const approveMutation = useMutation({
    mutationFn: (data: { task_id: string; approved: boolean }) =>
      AutonomyService.approveTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['autonomy-stats'] });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8" />
            Mission Control v2 - Autonomia
          </h1>
          <p className="text-muted-foreground">
            Sistema autônomo de gerenciamento de tarefas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tarefas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_tasks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aguardando Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pending_approval || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completadas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.completed_today || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.success_rate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tarefas Pendentes de Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma tarefa pendente
              </p>
            ) : (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{task.task_name}</h3>
                      <Badge>{task.task_type}</Badge>
                      <Badge variant={
                        task.priority === 'critical' ? 'destructive' :
                        task.priority === 'high' ? 'default' : 'secondary'
                      }>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confiança: {((task.decision_confidence || 0) * 100).toFixed(0)}% 
                      | Nível de Autonomia: {task.autonomy_level}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        approveMutation.mutate({
                          task_id: task.id,
                          approved: true,
                        })
                      }
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        approveMutation.mutate({
                          task_id: task.id,
                          approved: false,
                        })
                      }
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tarefas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.recent_tasks.slice(0, 10).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <p className="font-medium text-sm">{task.task_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(task.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Badge
                  variant={
                    task.status === 'completed'
                      ? 'default'
                      : task.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
