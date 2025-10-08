import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  XCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  TrendingDown,
  Plus,
  Eye
} from 'lucide-react';

interface NonConformity {
  id: string;
  number: string;
  title: string;
  type: 'major' | 'minor' | 'observation';
  practice_id: number;
  practice_name: string;
  status: 'open' | 'in_treatment' | 'closed' | 'verified';
  severity: 'critical' | 'high' | 'medium' | 'low';
  identified_date: string;
  due_date: string;
  responsible: string;
  corrective_action?: string;
  preventive_action?: string;
  completion_percentage: number;
}

const SAMPLE_NCS: NonConformity[] = [
  {
    id: '1',
    number: 'NC-2024-001',
    title: 'Ausência de matriz de competências atualizada',
    type: 'major',
    practice_id: 4,
    practice_name: 'Prática 4 - Treinamento',
    status: 'in_treatment',
    severity: 'high',
    identified_date: '2024-09-15',
    due_date: '2024-11-15',
    responsible: 'Ana Paula - RH',
    corrective_action: 'Criar matriz de competências completa',
    completion_percentage: 65
  },
  {
    id: '2',
    number: 'NC-2024-002',
    title: 'Procedimento MOC não implementado',
    type: 'major',
    practice_id: 13,
    practice_name: 'Prática 13 - Gestão de Mudanças',
    status: 'open',
    severity: 'critical',
    identified_date: '2024-10-01',
    due_date: '2024-12-01',
    responsible: 'Eng. Roberto Santos',
    completion_percentage: 0
  },
  {
    id: '3',
    number: 'NC-2024-003',
    title: 'Plano de integridade mecânica desatualizado',
    type: 'major',
    practice_id: 17,
    practice_name: 'Prática 17 - Integridade Mecânica',
    status: 'in_treatment',
    severity: 'high',
    identified_date: '2024-09-20',
    due_date: '2024-11-20',
    responsible: 'Eng. João Oliveira',
    corrective_action: 'Atualizar plano com novos equipamentos',
    completion_percentage: 45
  },
  {
    id: '4',
    number: 'OBS-2024-001',
    title: 'Registros de treinamento incompletos',
    type: 'observation',
    practice_id: 4,
    practice_name: 'Prática 4 - Treinamento',
    status: 'closed',
    severity: 'medium',
    identified_date: '2024-08-10',
    due_date: '2024-09-10',
    responsible: 'Ana Paula - RH',
    corrective_action: 'Digitalizar todos os registros',
    completion_percentage: 100
  }
];

const getTypeConfig = (type: string) => {
  const configs = {
    major: {
      icon: XCircle,
      color: 'bg-red-600 text-white',
      label: 'NC Maior',
      badgeColor: 'bg-red-600'
    },
    minor: {
      icon: AlertTriangle,
      color: 'bg-yellow-600 text-white',
      label: 'NC Menor',
      badgeColor: 'bg-yellow-600'
    },
    observation: {
      icon: Eye,
      color: 'bg-blue-600 text-white',
      label: 'Observação',
      badgeColor: 'bg-blue-600'
    }
  };
  return configs[type as keyof typeof configs] || configs.observation;
};

const getStatusConfig = (status: string) => {
  const configs = {
    open: {
      color: 'bg-red-600 text-white',
      label: 'Aberta'
    },
    in_treatment: {
      color: 'bg-yellow-600 text-white',
      label: 'Em Tratamento'
    },
    closed: {
      color: 'bg-green-600 text-white',
      label: 'Fechada'
    },
    verified: {
      color: 'bg-blue-600 text-white',
      label: 'Verificada'
    }
  };
  return configs[status as keyof typeof configs] || configs.open;
};

export const NonConformityManager: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');

  const openCount = SAMPLE_NCS.filter(nc => nc.status === 'open').length;
  const inTreatmentCount = SAMPLE_NCS.filter(nc => nc.status === 'in_treatment').length;
  const closedCount = SAMPLE_NCS.filter(nc => nc.status === 'closed').length;
  const totalOpen = openCount + inTreatmentCount;

  const filteredNCs = selectedType === 'all'
    ? SAMPLE_NCS
    : SAMPLE_NCS.filter(nc => nc.type === selectedType);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
              <Badge className="bg-red-600 text-white font-bold">ABERTAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-red-700 mb-1">NCs Abertas</h3>
            <p className="text-3xl font-bold text-red-900">{openCount}</p>
            <p className="text-xs text-red-600 mt-2">Sem tratamento</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-10 w-10 text-yellow-600" />
              <Badge className="bg-yellow-600 text-white font-bold">TRATAMENTO</Badge>
            </div>
            <h3 className="text-sm font-medium text-yellow-700 mb-1">Em Tratamento</h3>
            <p className="text-3xl font-bold text-yellow-900">{inTreatmentCount}</p>
            <p className="text-xs text-yellow-600 mt-2">Em andamento</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
              <Badge className="bg-green-600 text-white font-bold">FECHADAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-green-700 mb-1">NCs Fechadas</h3>
            <p className="text-3xl font-bold text-green-900">{closedCount}</p>
            <p className="text-xs text-green-600 mt-2">Resolvidas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="h-10 w-10 text-blue-600" />
              <Badge className="bg-blue-600 text-white font-bold">TOTAL</Badge>
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">Total Ativas</h3>
            <p className="text-3xl font-bold text-blue-900">{totalOpen}</p>
            <p className="text-xs text-blue-600 mt-2">Requerem atenção</p>
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
              variant={selectedType === 'major' ? 'default' : 'outline'}
              onClick={() => setSelectedType('major')}
              className="min-h-[44px]"
            >
              NC Maior
            </Button>
            <Button
              variant={selectedType === 'minor' ? 'default' : 'outline'}
              onClick={() => setSelectedType('minor')}
              className="min-h-[44px]"
            >
              NC Menor
            </Button>
            <Button
              variant={selectedType === 'observation' ? 'default' : 'outline'}
              onClick={() => setSelectedType('observation')}
              className="min-h-[44px]"
            >
              Observações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* NC List */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Não Conformidades</CardTitle>
          <CardDescription>
            Tratamento e acompanhamento de não conformidades SGSO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNCs.map((nc) => {
              const typeConfig = getTypeConfig(nc.type);
              const statusConfig = getStatusConfig(nc.status);
              const TypeIcon = typeConfig.icon;

              return (
                <Card key={nc.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${typeConfig.color}`}>
                          <TypeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{nc.title}</h3>
                            <Badge className={typeConfig.badgeColor + ' text-white'}>
                              {typeConfig.label}
                            </Badge>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            <strong>{nc.number}</strong> - {nc.practice_name}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Data Identificação</p>
                              <p className="text-sm font-bold text-gray-900">
                                {new Date(nc.identified_date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Prazo</p>
                              <p className="text-sm font-bold text-gray-900">
                                {new Date(nc.due_date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Responsável</p>
                              <p className="text-sm font-bold text-gray-900">{nc.responsible}</p>
                            </div>
                          </div>
                          {nc.corrective_action && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-600 font-medium mb-1">Ação Corretiva:</p>
                              <p className="text-sm text-gray-900">{nc.corrective_action}</p>
                            </div>
                          )}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 font-medium">Progresso do Tratamento</span>
                              <span className="text-gray-900 font-bold">{nc.completion_percentage}%</span>
                            </div>
                            <Progress value={nc.completion_percentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] px-6"
                          onClick={() => console.log('Ver detalhes', nc.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                        {nc.status !== 'closed' && (
                          <Button
                            size="sm"
                            className="min-h-[44px] px-6 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => console.log('Atualizar NC', nc.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Atualizar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredNCs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Nenhuma não conformidade encontrada</p>
              <p className="text-sm">Selecione outro filtro</p>
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
              className="bg-red-600 hover:bg-red-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => console.log('Registrar NC')}
            >
              <Plus className="h-6 w-6" />
              <span className="font-semibold">Registrar NC</span>
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => console.log('Relatório NCs')}
            >
              <FileText className="h-6 w-6" />
              <span className="font-semibold">Relatório</span>
            </Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => console.log('NCs vencendo')}
            >
              <AlertTriangle className="h-6 w-6" />
              <span className="font-semibold">Vencendo</span>
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => console.log('Estatísticas')}
            >
              <TrendingDown className="h-6 w-6" />
              <span className="font-semibold">Estatísticas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NonConformityManager;
