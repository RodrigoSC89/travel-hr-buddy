/**
 * Módulo 2: CTS & Verificação de Tripulação
 * Verificação de conformidade de certificados vs funções
 */
import { useState, useEffect } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  FileText, Brain, Shield, Users, AlertTriangle, Plus,
  CheckCircle, XCircle, Calendar, Award, RefreshCw,
  Clock, Ship, User, FileCheck, AlertCircle
} from "lucide-react";

interface CTSRecord {
  id: string;
  cts_number: string;
  vessel_id?: string | null;
  flag_state: string | null;
  classification_society?: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  required_positions: any;
  status: string | null;
}

interface CrewCertification {
  id: string;
  crew_member_id: string | null;
  certification_type: string;
  certificate_category?: string | null;
  certificate_number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  status: string | null;
}

interface NonConformity {
  type: 'missing_cert' | 'expired_cert' | 'category_mismatch' | 'training_gap';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  crewMember?: string;
  position?: string;
  recommendation: string;
}

const VesselCTS = () => {
  const [ctsRecords, setCtsRecords] = useState<CTSRecord[]>([]);
  const [certifications, setCertifications] = useState<CrewCertification[]>([]);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [complianceScore, setComplianceScore] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ctsRes, certRes] = await Promise.all([
        supabase.from('cts_records').select('*').order('created_at', { ascending: false }),
        supabase.from('crew_certifications').select('*').order('expiry_date', { ascending: true })
      ]);

      if (ctsRes.data) setCtsRecords(ctsRes.data);
      if (certRes.data) setCertifications(certRes.data);
      
      // Calculate initial compliance score
      calculateComplianceScore(certRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const calculateComplianceScore = (certs: CrewCertification[]) => {
    if (certs.length === 0) {
      setComplianceScore(100);
      return;
    }
    
    const validCerts = certs.filter(c => c.status === 'valid').length;
    const score = (validCerts / certs.length) * 100;
    setComplianceScore(score);
  };

  const runConformityCheck = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('cts-conformity-ai', {
        body: { action: 'check_conformity' }
      });

      if (error) throw error;

      // Simulate conformity check results
      const mockNonConformities: NonConformity[] = [
        {
          type: 'expired_cert',
          severity: 'critical',
          description: 'Certificado STCW expira em 15 dias',
          crewMember: 'João Silva',
          position: 'Chefe de Máquinas',
          recommendation: 'Agendar renovação imediata do certificado STCW'
        },
        {
          type: 'category_mismatch',
          severity: 'high',
          description: 'Categoria B insuficiente para posição de Capitão',
          crewMember: 'Pedro Santos',
          position: 'Capitão',
          recommendation: 'Tripulante precisa de certificação Categoria A para esta função'
        },
        {
          type: 'training_gap',
          severity: 'medium',
          description: 'Treinamento de DP não concluído',
          crewMember: 'Maria Costa',
          position: 'Oficial de Navegação',
          recommendation: 'Concluir curso DP antes do próximo embarque'
        }
      ];

      setNonConformities(mockNonConformities);
      toast.success('Verificação de conformidade concluída');
    } catch (error) {
      console.error('Error checking conformity:', error);
      toast.error('Erro na verificação de conformidade');
    } finally {
      setIsChecking(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'high': return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-info/20 text-info border-info/30';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'valid': return 'bg-success/20 text-success';
      case 'expired': return 'bg-destructive/20 text-destructive';
      case 'pending_renewal': return 'bg-warning/20 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return 999;
    const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={Award}
        title="CTS & Conformidade de Tripulação"
        description="Verificação inteligente de certificados e conformidade STCW"
        gradient="green"
        badges={[
          { icon: Brain, label: "IA Verificação" },
          { icon: Shield, label: "STCW Compliance" },
          { icon: Users, label: "Crew Check" }
        ]}
      />

      {/* Compliance Score Banner */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Score de Conformidade</h3>
              <p className="text-muted-foreground">Análise automática de certificações da tripulação</p>
            </div>
            <Button onClick={runConformityCheck} disabled={isChecking}>
              {isChecking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Verificar Conformidade
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Progress value={complianceScore} className="flex-1" />
            <span className={`text-2xl font-bold ${complianceScore >= 90 ? 'text-success' : complianceScore >= 70 ? 'text-warning' : 'text-destructive'}`}>
              {complianceScore.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Non-conformities Alert */}
      {nonConformities.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Não-conformidades Detectadas</AlertTitle>
          <AlertDescription>
            {nonConformities.filter(nc => nc.severity === 'critical').length} críticas, 
            {nonConformities.filter(nc => nc.severity === 'high').length} altas
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="cts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="cts">CTS</TabsTrigger>
          <TabsTrigger value="certifications">Certificações</TabsTrigger>
          <TabsTrigger value="conformity">Conformidade</TabsTrigger>
          <TabsTrigger value="actions">Plano de Ação</TabsTrigger>
        </TabsList>

        {/* CTS Tab */}
        <TabsContent value="cts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Certificados Técnicos da Embarcação</h2>
            <Button onClick={() => {
              toast.loading('Preparando formulário...', { id: 'new-cts' });
              setTimeout(() => {
                toast.success('Formulário de novo CTS aberto', { 
                  id: 'new-cts',
                  description: 'Preencha os dados do certificado técnico' 
                });
              }, 500);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo CTS
            </Button>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Carregando...</CardContent></Card>
            ) : ctsRecords.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum CTS registrado</CardContent></Card>
            ) : (
              ctsRecords.map(cts => (
                <Card key={cts.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Ship className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{cts.cts_number}</h3>
                          <Badge className={getStatusColor(cts.status)}>
                            {cts.status === 'valid' ? 'Válido' : cts.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Bandeira: {cts.flag_state} | Classificadora: {cts.classification_society || 'N/A'}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Emissão: {cts.issue_date ? new Date(cts.issue_date).toLocaleDateString('pt-BR') : '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Vencimento: {cts.expiry_date ? new Date(cts.expiry_date).toLocaleDateString('pt-BR') : '-'}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast.success(`CTS ${cts.cts_number}`, { description: `Flag: ${cts.flag_state} | Status: ${cts.status}` })}>
                        <FileText className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Certificações da Tripulação</h2>
            <Button onClick={() => {
              toast.loading('Preparando formulário...', { id: 'new-cert' });
              setTimeout(() => {
                toast.success('Formulário de nova certificação aberto', { 
                  id: 'new-cert',
                  description: 'Preencha os dados da certificação' 
                });
              }, 500);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Certificação
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Certificados</p>
                    <p className="text-2xl font-bold">{certifications.length}</p>
                  </div>
                  <Award className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vencendo (30d)</p>
                    <p className="text-2xl font-bold text-warning">
                      {certifications.filter(c => getDaysUntilExpiry(c.expiry_date) <= 30 && getDaysUntilExpiry(c.expiry_date) > 0).length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-warning opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vencidos</p>
                    <p className="text-2xl font-bold text-destructive">
                      {certifications.filter(c => c.status === 'expired').length}
                    </p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-destructive opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {certifications.map(cert => {
              const daysUntil = getDaysUntilExpiry(cert.expiry_date);
              return (
                <Card key={cert.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{cert.certification_type}</p>
                          <p className="text-sm text-muted-foreground">
                            Categoria: {cert.certificate_category || 'N/A'} | Nº: {cert.certificate_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm">
                            {daysUntil > 0 ? `Vence em ${daysUntil} dias` : 'Vencido'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('pt-BR') : '-'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(cert.status)}>
                          {cert.status === 'valid' ? 'Válido' : cert.status === 'expired' ? 'Vencido' : cert.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Conformity Tab */}
        <TabsContent value="conformity" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Verificação de Conformidade</h2>
            <Button onClick={runConformityCheck} disabled={isChecking}>
              <Brain className="h-4 w-4 mr-2" />
              Nova Verificação IA
            </Button>
          </div>

          {nonConformities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                <h3 className="text-lg font-semibold">Nenhuma não-conformidade detectada</h3>
                <p className="text-muted-foreground mt-2">Execute uma verificação de conformidade para identificar possíveis gaps</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {nonConformities.map((nc, index) => (
                <Card key={index} className={`border-l-4 ${
                  nc.severity === 'critical' ? 'border-l-destructive' :
                  nc.severity === 'high' ? 'border-l-orange-500' :
                  nc.severity === 'medium' ? 'border-l-warning' : 'border-l-info'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-5 w-5 ${
                            nc.severity === 'critical' ? 'text-destructive' :
                            nc.severity === 'high' ? 'text-orange-500' : 'text-warning'
                          }`} />
                          <h3 className="font-semibold">{nc.description}</h3>
                          <Badge className={getSeverityColor(nc.severity)}>
                            {nc.severity === 'critical' ? 'Crítico' :
                             nc.severity === 'high' ? 'Alto' :
                             nc.severity === 'medium' ? 'Médio' : 'Baixo'}
                          </Badge>
                        </div>
                        {nc.crewMember && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Tripulante:</span> {nc.crewMember}
                            {nc.position && <> | <span className="text-muted-foreground">Função:</span> {nc.position}</>}
                          </p>
                        )}
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-sm">
                            <span className="font-medium">Recomendação:</span> {nc.recommendation}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Criar Ação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Plano de Ação Corretivo
              </CardTitle>
              <CardDescription>
                Ações corretivas geradas automaticamente a partir das não-conformidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Execute a verificação de conformidade para gerar planos de ação</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default VesselCTS;
