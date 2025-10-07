import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ship, 
  Activity, 
  Shield, 
  TrendingUp, 
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface PeoDpAudit {
  id: string;
  vessel_id?: string;
  audit_period: string;
  audit_date: string;
  status: string;
  dp_class?: string;
  compliance_score?: number;
  auditor_name: string;
}

export const PeoDpAuditManager: React.FC = () => {
  const [audits, setAudits] = useState<PeoDpAudit[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    setLoading(true);
    try {
      // Dados de exemplo para demonstração
      const mockAudits: PeoDpAudit[] = [
        {
          id: '1',
          audit_period: '2024-Q4',
          audit_date: '2024-10-08',
          status: 'in_progress',
          dp_class: 'DP2',
          compliance_score: 85,
          auditor_name: 'Auditor PEO-DP'
        }
      ];
      setAudits(mockAudits);
    } catch (error) {
      console.error('Erro ao carregar auditorias:', error);
      toast.error('Erro ao carregar dados das auditorias PEO-DP');
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
          <h2 className="text-3xl font-bold tracking-tight">PEO-DP - Posicionamento Dinâmico</h2>
          <p className="text-muted-foreground">
            Sistema de Auditoria Petrobras para Sistemas de Posicionamento Dinâmico
          </p>
        </div>
        <Button onClick={createNewAudit} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Auditoria PEO-DP
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
            <CardTitle className="text-sm font-medium">Compliance Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Conformidade geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistemas DP</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Embarcações com DP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Conformidades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Pendentes de correção</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="audits">Auditorias</TabsTrigger>
          <TabsTrigger value="systems">Sistemas DP</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre PEO-DP</CardTitle>
              <CardDescription>
                Auditoria Específica da Petrobras para Sistemas de Posicionamento Dinâmico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Ship className="h-4 w-4" />
                  Elementos Auditados
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Sistema de Posicionamento Dinâmico (DP)</li>
                  <li>Propulsores (Thrusters) - principais, proa e popa</li>
                  <li>Sistemas de energia (Power Management)</li>
                  <li>Sistemas de controle e redundância</li>
                  <li>Capability Plots e análise de performance</li>
                  <li>FMEA (Failure Mode and Effects Analysis)</li>
                  <li>Sensores de posição e referência</li>
                  <li>Limitações operacionais e weather limits</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Classes de DP
                </h4>
                <div className="grid gap-2 text-sm">
                  <div className="p-3 border rounded-lg">
                    <strong>DP1:</strong> Posicionamento automático com um sistema, perda de posição em caso de falha única
                  </div>
                  <div className="p-3 border rounded-lg">
                    <strong>DP2:</strong> Redundância parcial, mantém posição com falha única
                  </div>
                  <div className="p-3 border rounded-lg">
                    <strong>DP3:</strong> Redundância total com segregação física, mantém posição com falha única ou incêndio
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Padrões Petrobras
                </h4>
                <p className="text-sm text-muted-foreground">
                  As auditorias PEO-DP seguem os padrões e normas técnicas da Petrobras para operações 
                  offshore com sistemas de posicionamento dinâmico, garantindo conformidade com requisitos 
                  específicos de segurança e operação.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auditorias PEO-DP</CardTitle>
              <CardDescription>
                Histórico e status das auditorias de posicionamento dinâmico
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Carregando...</p>
              ) : audits.length === 0 ? (
                <div className="text-center py-8">
                  <Ship className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhuma auditoria PEO-DP cadastrada</p>
                  <Button onClick={createNewAudit}>Criar primeira auditoria</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {audits.map((audit) => (
                    <div key={audit.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">Auditoria {audit.audit_period}</h4>
                          <p className="text-sm text-muted-foreground">
                            Auditor: {audit.auditor_name}
                          </p>
                        </div>
                        {getStatusBadge(audit.status)}
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span>Classe: {audit.dp_class || 'N/A'}</span>
                        </div>
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

        <TabsContent value="systems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistemas de Posicionamento Dinâmico</CardTitle>
              <CardDescription>
                Gerenciamento de sistemas DP e equipamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Módulo de gestão de sistemas DP em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Petrobras</CardTitle>
              <CardDescription>
                Geração de relatórios oficiais para a Petrobras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Módulo de relatórios em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
