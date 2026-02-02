/**
 * Reports Tab
 * INTEGRADO: Usa useMedicalReportsData hook para dados reais do Supabase
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Shield, BarChart3, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useMedicalReportsData } from '@/hooks/useMedicalReportsData';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ReportsTab() {
  const { reports, isLoading, refetch, generateReport, isGenerating } = useMedicalReportsData();

  const handleGenerate = (type: string) => {
    generateReport(type);
  };

  const handleDownload = (id: string) => {
    toast.success('Baixando relatório...');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando relatórios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Generation Cards */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gerar Novo Relatório</h3>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors" 
          onClick={() => !isGenerating && handleGenerate('MLC 2006')}
        >
          <CardContent className="pt-6 text-center">
            {isGenerating ? (
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            ) : (
              <Shield className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            )}
            <h3 className="font-medium">Relatório MLC 2006</h3>
            <p className="text-sm text-muted-foreground">Conformidade Maritime Labour Convention</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors" 
          onClick={() => !isGenerating && handleGenerate('Port State')}
        >
          <CardContent className="pt-6 text-center">
            {isGenerating ? (
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            ) : (
              <FileText className="h-12 w-12 mx-auto mb-4 text-green-500" />
            )}
            <h3 className="font-medium">Relatório Port State</h3>
            <p className="text-sm text-muted-foreground">Inspeção de Estado do Porto</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors" 
          onClick={() => !isGenerating && handleGenerate('Mensal')}
        >
          <CardContent className="pt-6 text-center">
            {isGenerating ? (
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            ) : (
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-purple-500" />
            )}
            <h3 className="font-medium">Relatório Mensal</h3>
            <p className="text-sm text-muted-foreground">Resumo de atendimentos</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Gerados</CardTitle>
          <CardDescription>Histórico de relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum relatório gerado"
              description="Clique em um dos tipos de relatório acima para gerar seu primeiro relatório."
            />
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Gerado em {new Date(report.generatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={report.status === 'completed' ? 'default' : report.status === 'draft' ? 'secondary' : 'outline'}>
                      {report.status === 'completed' ? 'Concluído' : report.status === 'draft' ? 'Rascunho' : 'Pendente'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(report.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
