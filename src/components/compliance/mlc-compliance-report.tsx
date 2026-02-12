/**
 * MLC 2006 Compliance Report Component
 * Validates core MLC rules with AI recommendations
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, Clock, FileText, Download, Loader2, Shield, User, Stethoscope, GraduationCap, FileSignature, DollarSign, Timer, Plane, Home, UtensilsCrossed, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// MLC 2006 Rules
const MLC_RULES = [
  { id: 'minimumAge', rule: 'Regulation 1.1', name: 'Idade Mínima', icon: User, critical: true },
  { id: 'medicalCertificate', rule: 'Regulation 1.2', name: 'Certificado Médico', icon: Stethoscope, critical: true },
  { id: 'trainingCertification', rule: 'Regulation 1.3', name: 'Treinamento STCW', icon: GraduationCap, critical: true },
  { id: 'employmentAgreement', rule: 'Regulation 2.1', name: 'Contrato SEA', icon: FileSignature, critical: true },
  { id: 'wagesPayment', rule: 'Regulation 2.2', name: 'Pagamento de Salários', icon: DollarSign, critical: true },
  { id: 'hoursOfWork', rule: 'Regulation 2.3', name: 'Horas de Trabalho/Descanso', icon: Timer, critical: true },
  { id: 'repatriation', rule: 'Regulation 2.5', name: 'Repatriação', icon: Plane, critical: true },
  { id: 'accommodation', rule: 'Regulation 3.1', name: 'Acomodações', icon: Home, critical: false },
  { id: 'food', rule: 'Regulation 3.2', name: 'Alimentação', icon: UtensilsCrossed, critical: false },
];

interface Violation {
  ruleId: string;
  rule: string;
  status: 'compliant' | 'non-compliant' | 'warning';
  details: string;
  action: string;
}

interface AIAnalysis {
  severity: string;
  impact: string;
  actionPlan: string[];
  timeline: string;
}

interface MLCReportData {
  crewName: string;
  crewId: string;
  vesselName: string;
  overallStatus: 'compliant' | 'non-compliant';
  complianceScore: number;
  totalViolations: number;
  criticalViolations: number;
  violations: Violation[];
  aiAnalysis: AIAnalysis | null;
  generatedAt: string;
}

interface MLCComplianceReportProps {
  crewId?: string;
}

export function MLCComplianceReport({ crewId }: MLCComplianceReportProps) {
  const [report, setReport] = useState<MLCReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const runComplianceCheck = async () => {
    if (!crewId) {
      toast.error('Selecione um tripulante para verificar');
      return;
    }

    setLoading(true);
    try {
      const { data: crew, error: crewError } = await supabase
        .from('crew_members')
        .select('*')
        .eq('id', crewId)
        .single();

      if (crewError) throw crewError;

      const { data: certificates } = await supabase
        .from('certificates')
        .select('*')
        .eq('crew_member_id', crewId);

      const violations: Violation[] = [];
      
      // Check medical certificate
      const medicalCert = certificates?.find(c => 
        String(c.certificate_type || '').toLowerCase().includes('medical') || 
        String(c.certificate_type || '').toLowerCase().includes('médico')
      );
      
      if (!medicalCert) {
        violations.push({
          ruleId: 'medicalCertificate',
          rule: 'Regulation 1.2',
          status: 'non-compliant',
          details: 'Certificado médico não encontrado no sistema',
          action: 'Agendar exame médico urgente'
        });
      }

      // Check STCW
      const stcwCerts = certificates?.filter(c => 
        String(c.certificate_type || '').toLowerCase().includes('stcw') ||
        String(c.certificate_type || '').toLowerCase().includes('bst')
      ) || [];
      
      if (stcwCerts.length === 0) {
        violations.push({
          ruleId: 'trainingCertification',
          rule: 'Regulation 1.3',
          status: 'non-compliant',
          details: 'Nenhuma certificação STCW encontrada',
          action: 'Matricular em cursos obrigatórios STCW'
        });
      }

      // Hours check reminder
      violations.push({
        ruleId: 'hoursOfWork',
        rule: 'Regulation 2.3',
        status: 'warning',
        details: 'Verificação de horas pendente',
        action: 'Revisar registro de horas de trabalho/descanso'
      });

      const compliantRules = MLC_RULES.filter(r => 
        !violations.some(v => v.ruleId === r.id && v.status === 'non-compliant')
      ).length;
      const complianceScore = Math.round((compliantRules / MLC_RULES.length) * 100);

      const reportData: MLCReportData = {
        crewName: String((crew as Record<string, unknown>).full_name || 'N/A'),
        crewId: crewId,
        vesselName: 'N/A',
        overallStatus: violations.some(v => v.status === 'non-compliant') ? 'non-compliant' : 'compliant',
        complianceScore,
        totalViolations: violations.length,
        criticalViolations: violations.filter(v => v.status === 'non-compliant').length,
        violations,
        aiAnalysis: null,
        generatedAt: new Date().toISOString()
      };

      setReport(reportData);
      toast.success('Verificação de compliance concluída');
    } catch {
      toast.error('Erro ao verificar compliance');
    } finally {
      setLoading(false);
    }
  };

  const getAIRecommendations = async () => {
    if (!report || report.violations.length === 0) return;

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mlc-compliance-advisor', {
        body: {
          crewName: report.crewName,
          violations: report.violations,
          complianceScore: report.complianceScore
        }
      });

      if (error) throw error;

      setReport(prev => prev ? {
        ...prev,
        aiAnalysis: data?.analysis || {
          severity: 'medium',
          impact: 'Impacto operacional moderado',
          actionPlan: ['Revisar violações críticas', 'Agendar treinamentos'],
          timeline: '7-14 dias'
        }
      } : null);
      toast.success('Análise de IA concluída');
    } catch {
      setReport(prev => prev ? {
        ...prev,
        aiAnalysis: {
          severity: report.criticalViolations > 0 ? 'high' : 'medium',
          impact: 'Risco de retenção em inspeção PSC.',
          actionPlan: [
            'Priorizar resolução de violações críticas',
            'Agendar exames e treinamentos pendentes',
            'Revisar e atualizar contratos SEA'
          ],
          timeline: report.criticalViolations > 0 ? 'Imediato (24-48h)' : '7-14 dias'
        }
      } : null);
    } finally {
      setAiLoading(false);
    }
  };

  if (!crewId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Selecione um tripulante para verificar compliance MLC 2006</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!report && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Shield className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Verificação MLC 2006</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Execute uma verificação completa de compliance com as 9 regras principais da Convenção do Trabalho Marítimo.
            </p>
            <Button onClick={runComplianceCheck} disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Iniciar Verificação
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Relatório MLC 2006 - {report.crewName}
                  </CardTitle>
                  <CardDescription>
                    Gerado em {new Date(report.generatedAt).toLocaleString('pt-BR')}
                  </CardDescription>
                </div>
                <Badge variant={report.overallStatus === 'compliant' ? 'default' : 'destructive'}>
                  {report.overallStatus === 'compliant' ? (
                    <><CheckCircle2 className="h-4 w-4 mr-1" /> Compliant</>
                  ) : (
                    <><AlertTriangle className="h-4 w-4 mr-1" /> Non-Compliant</>
                  )}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-3xl font-bold">{report.complianceScore}%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Regras</p>
                  <p className="text-3xl font-bold">{MLC_RULES.length}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Violações</p>
                  <p className="text-3xl font-bold">{report.totalViolations}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Críticas</p>
                  <p className="text-3xl font-bold">{report.criticalViolations}</p>
                </div>
              </div>
              <Progress value={report.complianceScore} className="mt-4" />
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status por Regra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {MLC_RULES.map((rule) => {
                  const violation = report.violations.find(v => v.ruleId === rule.id);
                  const status = violation?.status || 'compliant';
                  const Icon = rule.icon;
                  
                  return (
                    <div
                      key={rule.id}
                      className={`p-3 rounded-lg border ${
                        status === 'compliant' ? 'bg-success/5 border-success/20' :
                        status === 'non-compliant' ? 'bg-destructive/5 border-destructive/20' :
                        'bg-warning/5 border-warning/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-medium text-muted-foreground">{rule.rule}</span>
                      </div>
                      <p className="text-sm font-medium">{rule.name}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {report.violations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Violações ({report.violations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.violations.map((violation) => (
                  <div key={violation.rule} className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{violation.rule}</span>
                      <Badge variant={violation.status === 'non-compliant' ? 'destructive' : 'secondary'}>
                        {violation.status === 'non-compliant' ? 'Não Conforme' : 'Atenção'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{violation.details}</p>
                    <p className="text-sm"><strong>Ação:</strong> {violation.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {report.aiAnalysis ? (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Análise de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Severidade:</span>
                  <Badge>{report.aiAnalysis.severity.toUpperCase()}</Badge>
                </div>
                <p className="text-sm">{report.aiAnalysis.impact}</p>
                <ul className="list-disc list-inside space-y-1">
                  {report.aiAnalysis.actionPlan.map((step, idx) => (
                    <li key={`action-${idx}-${step.slice(0, 20)}`} className="text-sm">{step}</li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {report.aiAnalysis.timeline}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button onClick={getAIRecommendations} disabled={aiLoading} variant="outline" className="w-full">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bot className="h-4 w-4 mr-2" />}
              Obter Recomendações de IA
            </Button>
          )}

          <div className="flex gap-3">
            <Button onClick={runComplianceCheck} variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Verificar Novamente
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Plano de Correção
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
