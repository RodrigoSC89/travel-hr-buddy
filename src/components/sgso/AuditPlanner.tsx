import { useMaritimeActions } from '@/hooks/useMaritimeActions';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Target,
  TrendingUp,
  Plus
} from 'lucide-react';

interface Audit {
  id: string;
  type: 'internal' | 'external' | 'regulatory' | 'certification';
  title: string;
  scope: string;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  scheduled_date: string;
  completion_date?: string;
  auditor: string;
  findings_count?: number;
  non_conformities?: number;
  practices_covered: number[];
}

const SAMPLE_AUDITS: Audit[] = [
  {
    id: '1',
    type: 'internal',
    title: 'Auditoria Prática 13 - Gestão de Mudanças',
    scope: 'Verificação MOC procedures',
    status: 'planned',
    scheduled_date: '2024-10-15',
    auditor: 'Eng. Roberto Santos',
    practices_covered: [13]
  },
  {
    id: '2',
    type: 'regulatory',
    title: 'Auditoria ANP - Compliance Geral',
    scope: 'Verificação 17 práticas ANP',
    status: 'in_progress',
    scheduled_date: '2024-10-08',
    auditor: 'Auditor ANP - Maria Costa',
    findings_count: 5,
    practices_covered: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  },
  {
    id: '3',
    type: 'internal',
    title: 'Auditoria Integridade Mecânica',
    scope: 'Prática 17 - Equipamentos críticos',
    status: 'overdue',
    scheduled_date: '2024-09-30',
    auditor: 'Eng. João Oliveira',
    practices_covered: [17]
  },
  {
    id: '4',
    type: 'certification',
    title: 'ISO 45001 - Recertificação',
    scope: 'Sistema de gestão completo',
    status: 'completed',
    scheduled_date: '2024-09-15',
    completion_date: '2024-09-20',
    auditor: 'Bureau Veritas - Carlos Lima',
    findings_count: 3,
    non_conformities: 0,
    practices_covered: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12]
  },
  {
    id: '5',
    type: 'internal',
    title: 'Auditoria Treinamento e Competência',
    scope: 'Prática 4 - Compliance treinamentos',
    status: 'planned',
    scheduled_date: '2024-11-05',
    auditor: 'RH - Ana Paula',
    practices_covered: [4]
  }
];

const getStatusConfig = (status: string) => {
  const configs = {
    planned: {
      icon: Calendar,
      color: 'bg-blue-600 text-white',
      label: 'Planejada',
      badgeVariant: 'default' as const
    },
    in_progress: {
      icon: Clock,
      color: 'bg-yellow-600 text-white',
      label: 'Em Andamento',
      badgeVariant: 'default' as const
    },
    completed: {
      icon: CheckCircle,
      color: 'bg-green-600 text-white',
      label: 'Concluída',
      badgeVariant: 'default' as const
    },
    overdue: {
      icon: AlertTriangle,
      color: 'bg-red-600 text-white',
      label: 'Atrasada',
      badgeVariant: 'destructive' as const
    }
  };
  return configs[status as keyof typeof configs] || configs.planned;
};

const getTypeLabel = (type: string) => {
  const labels = {
    internal: 'Interna',
    external: 'Externa',
    regulatory: 'Regulatória',
    certification: 'Certificação'
  };
  return labels[type as keyof typeof labels] || type;
};

export const AuditPlanner: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');

  const plannedCount = SAMPLE_AUDITS.filter(a => a.status === 'planned').length;
  const inProgressCount = SAMPLE_AUDITS.filter(a => a.status === 'in_progress').length;
  const completedCount = SAMPLE_AUDITS.filter(a => a.status === 'completed').length;
  const overdueCount = SAMPLE_AUDITS.filter(a => a.status === 'overdue').length;

  const filteredAudits = selectedType === 'all'
    ? SAMPLE_AUDITS
    : SAMPLE_AUDITS.filter(a => a.type === selectedType);

  const totalAudits = SAMPLE_AUDITS.length;
  const completionRate = Math.round((completedCount / totalAudits) * 100);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-10 w-10 text-blue-600" />
              <Badge className="bg-blue-600 text-white font-bold">PLANEJADAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">Auditorias Planejadas</h3>
            <p className="text-3xl font-bold text-blue-900">{plannedCount}</p>
            <p className="text-xs text-blue-600 mt-2">Aguardando execução</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-10 w-10 text-yellow-600" />
              <Badge className="bg-yellow-600 text-white font-bold">ATIVAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-yellow-700 mb-1">Em Andamento</h3>
            <p className="text-3xl font-bold text-yellow-900">{inProgressCount}</p>
            <p className="text-xs text-yellow-600 mt-2">Em execução</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
              <Badge className="bg-green-600 text-white font-bold">CONCLUÍDAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-green-700 mb-1">Auditorias Concluídas</h3>
            <p className="text-3xl font-bold text-green-900">{completedCount}</p>
            <p className="text-xs text-green-600 mt-2">Taxa: {completionRate}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
              <Badge className="bg-red-600 text-white font-bold">ATRASADAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-red-700 mb-1">Auditorias Atrasadas</h3>
            <p className="text-3xl font-bold text-red-900">{overdueCount}</p>
            <p className="text-xs text-red-600 mt-2">Requer ação</p>
          </CardContent>
        </Card>
      </div>

      {/* Type Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedType('all')}
              className="min-h-[44px]"
            >
              Todas
            </Button>
            <Button
              variant={selectedType === 'internal' ? 'default' : 'outline'}
              onClick={() => setSelectedType('internal')}
              className="min-h-[44px]"
            >
              Internas
            </Button>
            <Button
              variant={selectedType === 'external' ? 'default' : 'outline'}
              onClick={() => setSelectedType('external')}
              className="min-h-[44px]"
            >
              Externas
            </Button>
            <Button
              variant={selectedType === 'regulatory' ? 'default' : 'outline'}
              onClick={() => setSelectedType('regulatory')}
              className="min-h-[44px]"
            >
              Regulatórias
            </Button>
            <Button
              variant={selectedType === 'certification' ? 'default' : 'outline'}
              onClick={() => setSelectedType('certification')}
              className="min-h-[44px]"
            >
              Certificação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit List */}
      <Card>
        <CardHeader>
          <CardTitle>Planejamento de Auditorias</CardTitle>
          <CardDescription>
            Gestão de auditorias internas, externas e regulatórias SGSO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAudits.map((audit) => {
              const statusConfig = getStatusConfig(audit.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={audit.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${statusConfig.color}`}>
                          <StatusIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{audit.title}</h3>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                            <Badge variant="outline" className="bg-white">
                              {getTypeLabel(audit.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            <Target className="h-3 w-3 inline mr-1" />
                            {audit.scope}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Data Agendada</p>
                              <p className="text-sm font-bold text-gray-900">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {new Date(audit.scheduled_date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Auditor</p>
                              <p className="text-sm font-bold text-gray-900">
                                <Users className="h-3 w-3 inline mr-1" />
                                {audit.auditor}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Práticas Cobertas</p>
                              <p className="text-sm font-bold text-gray-900">
                                {audit.practices_covered.length} de 17
                              </p>
                            </div>
                            {audit.findings_count !== undefined && (
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Achados</p>
                                <p className="text-sm font-bold text-gray-900">
                                  <FileText className="h-3 w-3 inline mr-1" />
                                  {audit.findings_count} ({audit.non_conformities || 0} NC)
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] px-6"
                          onClick={() => handleViewDetails('audit', audit.id)} disabled={isLoading}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                        {audit.status !== 'completed' && (
                          <Button
                            size="sm"
                            className="min-h-[44px] px-6 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => showInfo('Iniciando Auditoria', 'Preparando auditoria')} disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {audit.status === 'in_progress' ? 'Continuar' : 'Iniciar'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAudits.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Nenhuma auditoria encontrada</p>
              <p className="text-sm">Selecione outro tipo ou crie uma nova auditoria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => handleCreate('Auditoria')} disabled={isLoading}
            >
              <Plus className="h-6 w-6" />
              <span className="font-semibold">Nova Auditoria</span>
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => showInfo('Calendário', 'Abrindo calendário de auditorias')} disabled={isLoading}
            >
              <Calendar className="h-6 w-6" />
              <span className="font-semibold">Calendário</span>
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => handleGenerateReport('Relatório de Auditorias')} disabled={isLoading}
            >
              <FileText className="h-6 w-6" />
              <span className="font-semibold">Relatório</span>
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => showInfo('Tendências', 'Abrindo análise de tendências')} disabled={isLoading}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="font-semibold">Tendências</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditPlanner;
