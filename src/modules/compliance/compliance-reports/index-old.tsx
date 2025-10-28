import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { FileText, Download, Calendar, Clock, Filter, Send, FileJson, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

const ComplianceReports = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    title: '',
    template: '',
    format: 'pdf',
    schedule: 'manual'
  });

  const [reports, setReports] = useState([
    {
      id: '1',
      title: 'Relatório Mensal SGSO',
      template: 'SGSO Compliance',
      format: 'pdf',
      status: 'completed',
      generated_at: '2025-01-15T10:00:00',
      scheduled: false
    },
    {
      id: '2',
      title: 'Auditoria Trimestral',
      template: 'Full Audit',
      format: 'excel',
      status: 'scheduled',
      generated_at: '2025-01-20T09:00:00',
      scheduled: true,
      next_run: '2025-02-01'
    }
  ]);

  const templates = [
    'SGSO Compliance',
    'Full Audit',
    'Environmental Report',
    'Safety Metrics',
    'Training Summary'
  ];

  const handleCreateReport = () => {
    if (!reportConfig.title || !reportConfig.template) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título e template',
        variant: 'destructive'
      });
      return;
    }

    const report = {
      id: Date.now().toString(),
      ...reportConfig,
      status: reportConfig.schedule === 'manual' ? 'pending' : 'scheduled',
      generated_at: new Date().toISOString(),
      scheduled: reportConfig.schedule !== 'manual',
      next_run: reportConfig.schedule !== 'manual' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined
    };

    setReports([report, ...reports]);
    setShowForm(false);
    setReportConfig({ title: '', template: '', format: 'pdf', schedule: 'manual' });
    
    toast({
      title: 'Relatório configurado',
      description: report.scheduled ? 'Será gerado automaticamente' : 'Iniciando geração'
    });
  };

  const handleDownload = (report: any) => {
    toast({
      title: 'Baixando relatório',
      description: `Formato: ${report.format.toUpperCase()}`
    });
  };

  const handleGenerateNow = (reportId: string) => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: 'generating' } : r
    ));

    setTimeout(() => {
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: 'completed', generated_at: new Date().toISOString() } : r
      ));
      toast({
        title: 'Relatório gerado',
        description: 'Disponível para download'
      });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-500',
      generating: 'bg-blue-500',
      scheduled: 'bg-amber-500',
      pending: 'bg-muted',
      error: 'bg-destructive'
    };
    return colors[status] || 'bg-muted';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      completed: 'Concluído',
      generating: 'Gerando',
      scheduled: 'Agendado',
      pending: 'Pendente',
      error: 'Erro'
    };
    return texts[status] || status;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Compliance Reports</h1>
            <p className="text-muted-foreground">Geração e gerenciamento de relatórios de compliance</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <FileText className="mr-2 h-4 w-4" />
          Novo Relatório
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Gerados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Agendados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.scheduled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Novo Relatório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Título do Relatório</Label>
              <Input
                value={reportConfig.title}
                onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
                placeholder="Ex: Relatório Mensal de Compliance"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template</Label>
                <Select 
                  value={reportConfig.template} 
                  onValueChange={(v) => setReportConfig({ ...reportConfig, template: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template} value={template}>
                        {template}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Formato</Label>
                <Select 
                  value={reportConfig.format} 
                  onValueChange={(v) => setReportConfig({ ...reportConfig, format: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Agendamento</Label>
              <Select 
                value={reportConfig.schedule} 
                onValueChange={(v) => setReportConfig({ ...reportConfig, schedule: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateReport}>Criar Relatório</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{report.title}</h3>
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusText(report.status)}
                    </Badge>
                    {report.scheduled && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Agendado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Template: {report.template}</span>
                    <span>Formato: {report.format.toUpperCase()}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(report.generated_at).toLocaleDateString('pt-BR')}
                    </span>
                    {report.next_run && (
                      <span>Próxima: {new Date(report.next_run).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {report.status === 'scheduled' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleGenerateNow(report.id)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Gerar Agora
                    </Button>
                  )}
                  {report.status === 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(report)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceReports;
