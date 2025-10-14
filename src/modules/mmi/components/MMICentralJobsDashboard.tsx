/**
 * MMI Central Jobs Dashboard
 * Central panel for intelligent maintenance management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Ship,
  Filter,
  Search,
  Plus,
  BarChart3,
  Settings,
} from 'lucide-react';
import { jobsService, dashboardService } from '../services/mmiService';
import type { MMIJobExtended, MMIDashboardStats, JobStatus, JobPriority } from '@/types/mmi';
import { toast } from 'sonner';

export const MMICentralJobsDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<MMIJobExtended[]>([]);
  const [stats, setStats] = useState<MMIDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<JobPriority | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, statsData] = await Promise.all([
        jobsService.getAll(),
        dashboardService.getStats(),
      ]);
      setJobs(jobsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load MMI data:', error);
      toast.error('Erro ao carregar dados de manutenção');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: JobStatus) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      em_andamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      concluido: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      postergado: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: JobPriority) => {
    const colors = {
      baixa: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
      normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      alta: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      crítica: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-8 w-8 text-primary" />
            Central de Jobs - MMI
          </h1>
          <p className="text-muted-foreground mt-1">
            Módulo de Manutenção Inteligente
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Job
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Jobs</p>
                  <p className="text-2xl font-bold">{stats.total_jobs}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{stats.pending_jobs}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                  <p className="text-2xl font-bold">{stats.in_progress_jobs}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Críticos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.critical_jobs}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as JobStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="postergado">Postergado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as JobPriority | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Prioridades</SelectItem>
                <SelectItem value="crítica">Crítica</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum job encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <Badge className={getPriorityColor(job.priority)}>
                        {job.priority}
                      </Badge>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>

                    {job.component && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Settings className="h-4 w-4" />
                        <span>{job.component.name}</span>
                        {job.component.asset && (
                          <>
                            <span>•</span>
                            <Ship className="h-4 w-4" />
                            <span>{job.component.asset.vessel || job.component.asset.name}</span>
                          </>
                        )}
                      </div>
                    )}

                    {job.suggestion_ia && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                          <strong>💡 Sugestão IA:</strong> {job.suggestion_ia}
                        </p>
                      </div>
                    )}

                    {job.due_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Vencimento: {new Date(job.due_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    {job.status === 'pendente' && (
                      <Button size="sm">
                        Iniciar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
