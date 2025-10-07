import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Plus,
  FileText,
  CheckCircle,
  Users,
  ClipboardCheck,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface SgsoAudit {
  id: string;
  installation_name: string;
  audit_period: string;
  audit_date: string;
  status: string;
  compliance_score?: number;
  auditor_name: string;
}

// 17 Práticas Obrigatórias ANP - Resolução ANP nº 43/2007
const ANP_PRACTICES = [
  { number: 1, name: 'Liderança, Comprometimento e Responsabilização' },
  { number: 2, name: 'Política de SMS' },
  { number: 3, name: 'Conformidade Legal e Outros Requisitos' },
  { number: 4, name: 'Análise e Gestão de Riscos' },
  { number: 5, name: 'Procedimentos' },
  { number: 6, name: 'Capacitação, Treinamento e Qualificação' },
  { number: 7, name: 'Comunicação, Participação e Consulta' },
  { number: 8, name: 'Gestão de Mudanças' },
  { number: 9, name: 'Aquisição de Bens e Serviços' },
  { number: 10, name: 'Resposta a Emergências' },
  { number: 11, name: 'Gestão de Integridade de Poços' },
  { number: 12, name: 'Gestão de Integridade de Instalações' },
  { number: 13, name: 'Registros, Documentação e Gestão da Informação' },
  { number: 14, name: 'Investigação e Análise de Incidentes' },
  { number: 15, name: 'Monitoramento e Medição de Desempenho' },
  { number: 16, name: 'Auditoria e Revisão do SGSO' },
  { number: 17, name: 'Melhoria Contínua' }
];

export const SgsoAuditManager: React.FC = () => {
  const [audits, setAudits] = useState<SgsoAudit[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    setLoading(true);
    try {
      // Dados de exemplo para demonstração
      const mockAudits: SgsoAudit[] = [
        {
          id: '1',
          installation_name: 'FPSO Santos',
          audit_period: '2024-Q4',
          audit_date: '2024-10-08',
          status: 'in_progress',
          compliance_score: 88,
          auditor_name: 'Auditor SGSO ANP'
        }
      ];
      setAudits(mockAudits);
    } catch (error) {
      console.error('Erro ao carregar auditorias:', error);
      toast.error('Erro ao carregar dados das auditorias SGSO');
    } finally {
      setLoading(false);
    }
  };

  const createNewAudit = () => {
    toast.info('Funcionalidade de criação de auditoria em desenvolvimento');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      preparation: { label: 'Preparação', variant: 'secondary' as const },
      in_progress: { label: 'Em Andamento', variant: 'default' as const },
      completed: { label: 'Concluída', variant: 'success' as const },
      approved: { label: 'Aprovada', variant: 'success' as const },
      rejected: { label: 'Rejeitada', variant: 'destructive' as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SGSO - Sistema de Gestão de Segurança Operacional</h2>
          <p className="text-muted-foreground">
            Conformidade com Resolução ANP nº 43/2007 - Operações Offshore
          </p>
        </div>
        <Button onClick={createNewAudit} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Auditoria SGSO
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auditorias Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{audits.length}</div>
            <p className="text-xs text-muted-foreground">Total em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conformidade ANP</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88%</div>
            <p className="text-xs text-muted-foreground">Média geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Práticas ANP</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">17</div>
            <p className="text-xs text-muted-foreground">Práticas obrigatórias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Conformidades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="practices">17 Práticas ANP</TabsTrigger>
          <TabsTrigger value="audits">Auditorias</TabsTrigger>
          <TabsTrigger value="reports">Relatórios ANP</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o SGSO</CardTitle>
              <CardDescription>
                Sistema de Gestão de Segurança Operacional conforme ANP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Objetivo do SGSO
                </h4>
                <p className="text-sm text-muted-foreground">
                  O Sistema de Gestão de Segurança Operacional (SGSO) é um conjunto de práticas 
                  gerenciais obrigatórias estabelecidas pela ANP (Agência Nacional do Petróleo, 
                  Gás Natural e Biocombustíveis) através da Resolução ANP nº 43/2007, aplicável 
                  a todas as instalações offshore.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Resolução ANP nº 43/2007
                </h4>
                <p className="text-sm text-muted-foreground">
                  Regulamenta o SGSO para as instalações e atividades de perfuração e produção 
                  de petróleo e gás natural, definindo 17 práticas obrigatórias que devem ser 
                  implementadas, documentadas e mantidas atualizadas.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Aplicabilidade
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Plataformas fixas e flutuantes</li>
                  <li>FPSOs (Floating Production Storage and Offloading)</li>
                  <li>Sondas de perfuração</li>
                  <li>Semi-submersíveis</li>
                  <li>Instalações submarinas</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documentação Requerida
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Manual do SGSO atualizado</li>
                  <li>Procedimentos operacionais documentados</li>
                  <li>Registros de treinamento e qualificação</li>
                  <li>Análises de riscos e HAZOP</li>
                  <li>Relatórios de incidentes e ações corretivas</li>
                  <li>Evidências de auditorias internas e externas</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>17 Práticas Obrigatórias ANP</CardTitle>
              <CardDescription>
                Resolução ANP nº 43/2007 - Requisitos do SGSO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ANP_PRACTICES.map((practice) => (
                  <div key={practice.number} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                        {practice.number}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{practice.name}</h4>
                        <Progress value={Math.random() * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Compliance: {Math.floor(Math.random() * 30 + 70)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auditorias SGSO</CardTitle>
              <CardDescription>
                Histórico e status das auditorias de segurança operacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : audits.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhuma auditoria SGSO cadastrada</p>
                  <Button onClick={createNewAudit}>Criar primeira auditoria</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {audits.map((audit) => (
                    <div key={audit.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{audit.installation_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Período: {audit.audit_period} | Auditor: {audit.auditor_name}
                          </p>
                        </div>
                        {getStatusBadge(audit.status)}
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span>Conformidade: {audit.compliance_score || 0}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Regulamentares ANP</CardTitle>
              <CardDescription>
                Geração de relatórios para ANP e IBAMA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Módulo de relatórios regulamentares em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
