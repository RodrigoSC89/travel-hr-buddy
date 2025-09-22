import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  BarChart3,
  PieChart,
  FileBarChart,
  Users,
  Plane,
  Building,
  DollarSign,
  Clock,
  Target
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'financial' | 'operational' | 'analytical' | 'compliance';
  description: string;
  lastGenerated: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  status: 'ready' | 'generating' | 'scheduled';
  size: string;
}

const mockReports: Report[] = [
  {
    id: 'RPT001',
    title: 'Relatório Financeiro Mensal',
    type: 'financial',
    description: 'Análise completa de gastos, economia e ROI das viagens corporativas',
    lastGenerated: '2024-01-15T10:30:00',
    frequency: 'monthly',
    status: 'ready',
    size: '2.3 MB'
  },
  {
    id: 'RPT002',
    title: 'Performance por Departamento',
    type: 'operational',
    description: 'Métricas de utilização e eficiência por departamento',
    lastGenerated: '2024-01-14T14:20:00',
    frequency: 'weekly',
    status: 'ready',
    size: '1.8 MB'
  },
  {
    id: 'RPT003',
    title: 'Análise de Destinos',
    type: 'analytical',
    description: 'Relatório detalhado dos destinos mais visitados e custos associados',
    lastGenerated: '2024-01-12T09:15:00',
    frequency: 'monthly',
    status: 'ready',
    size: '3.1 MB'
  },
  {
    id: 'RPT004',
    title: 'Compliance e Políticas',
    type: 'compliance',
    description: 'Auditoria de conformidade com políticas de viagem',
    lastGenerated: '2024-01-10T16:45:00',
    frequency: 'quarterly',
    status: 'generating',
    size: '4.2 MB'
  },
  {
    id: 'RPT005',
    title: 'Tendências Anuais',
    type: 'analytical',
    description: 'Análise de tendências e projeções para o próximo período',
    lastGenerated: '2024-01-01T08:00:00',
    frequency: 'annual',
    status: 'scheduled',
    size: '5.7 MB'
  }
];

const quickReports = [
  {
    title: 'Gastos por Funcionário',
    description: 'Top 10 funcionários com maiores gastos',
    icon: Users,
    color: 'primary'
  },
  {
    title: 'Economia por Rota',
    description: 'Rotas com maior economia gerada',
    icon: Plane,
    color: 'success'
  },
  {
    title: 'Ocupação Hoteleira',
    description: 'Taxa de ocupação e satisfação',
    icon: Building,
    color: 'warning'
  },
  {
    title: 'ROI Trimestral',
    description: 'Retorno sobre investimento',
    icon: TrendingUp,
    color: 'info'
  }
];

export const ReportsDashboard = () => {
  const [reports] = useState<Report[]>(mockReports);
  const [activeTab, setActiveTab] = useState('all');

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'financial': return 'bg-success text-white';
      case 'operational': return 'bg-primary text-white';
      case 'analytical': return 'bg-warning text-white';
      case 'compliance': return 'bg-info text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'ready': return 'bg-success text-white';
      case 'generating': return 'bg-warning text-white';
      case 'scheduled': return 'bg-info text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: Report['status']) => {
    switch (status) {
      case 'ready': return 'Pronto';
      case 'generating': return 'Gerando';
      case 'scheduled': return 'Agendado';
      default: return 'N/A';
    }
  };

  const filteredReports = activeTab === 'all' 
    ? reports 
    : reports.filter(report => report.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
            Relatórios & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Geração e visualização de relatórios executivos
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline">
            <Calendar className="mr-2" size={18} />
            Agendar
          </Button>
          <Button className="gradient-ocean">
            <FileText className="mr-2" size={18} />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickReports.map((report, index) => (
          <Card key={index} className="p-6 hover:shadow-nautical transition-all duration-300 cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${report.color}/10`}>
                <report.icon className={`text-${report.color}`} size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-4">
              <Download size={16} className="mr-2" />
              Gerar
            </Button>
          </Card>
        ))}
      </div>

      {/* Report Tabs */}
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="operational">Operacional</TabsTrigger>
            <TabsTrigger value="analytical">Analítico</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="p-6 hover:shadow-nautical transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                        <FileBarChart size={24} className="text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold">{report.title}</h3>
                          <Badge className={getTypeColor(report.type)}>
                            {report.type}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusLabel(report.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{report.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Clock size={16} className="mr-2" />
                            Última geração: {new Date(report.lastGenerated).toLocaleString('pt-BR')}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Calendar size={16} className="mr-2" />
                            Frequência: {report.frequency}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <FileText size={16} className="mr-2" />
                            Tamanho: {report.size}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={report.status !== 'ready'}
                      >
                        <Download size={16} className="mr-2" />
                        Download
                      </Button>
                      <Button 
                        size="sm" 
                        className="gradient-ocean"
                        disabled={report.status === 'generating'}
                      >
                        <BarChart3 size={16} className="mr-2" />
                        {report.status === 'generating' ? 'Gerando...' : 'Visualizar'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Report Generator */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Gerador de Relatório Personalizado</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Período</label>
            <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <option>Últimos 30 dias</option>
              <option>Últimos 3 meses</option>
              <option>Últimos 6 meses</option>
              <option>Último ano</option>
              <option>Personalizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Departamento</label>
            <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <option>Todos</option>
              <option>Vendas</option>
              <option>Executivo</option>
              <option>Operações</option>
              <option>TI</option>
              <option>RH</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Formato</label>
            <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <option>PDF</option>
              <option>Excel</option>
              <option>PowerPoint</option>
              <option>CSV</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button className="gradient-ocean">
            <FileText className="mr-2" size={18} />
            Gerar Relatório
          </Button>
        </div>
      </Card>
    </div>
  );
};