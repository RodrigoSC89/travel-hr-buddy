/**
 * CTSCompliancePanel - Real-time CTS compliance validation
 * Integrates with Supabase for crew data and AI for STCW validation
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/lib/logger';
import {
  Users, Brain, Shield, AlertTriangle, CheckCircle2, 
  RefreshCw, FileCheck, UserCheck, GraduationCap, Clock
} from "lucide-react";

interface CTSPosition {
  position: string;
  required_count: number;
  current_count: number;
  crew_members: Array<{
    id: string;
    name: string;
    category: string;
    has_valid_certificate: boolean;
    expiry_date?: string;
  }>;
}

interface CTSViolation {
  type: 'overstaffed' | 'understaffed' | 'wrong_category' | 'expired_certificate' | 'missing_qualification';
  severity: 'critical' | 'high' | 'medium';
  position: string;
  details: string;
  crew_affected: string[];
  remediation: string;
}

interface ComplianceResult {
  compliant: boolean;
  violations: CTSViolation[];
  positions: CTSPosition[];
  recommendations: string[];
  compliance_score: number;
  risk_level: string;
}

// Database types
interface CTSData {
  approved_positions?: Record<string, number>;
  [key: string]: unknown;
}

interface CrewMemberData {
  id: string;
  full_name: string;
  rank?: string;
  category?: string;
  crew_certifications?: Array<{ expiry_date?: string }>;
}

interface CertificationData {
  expiry_date?: string;
}

interface Props {
  vesselId?: string;
  vesselName?: string;
  onComplianceCheck?: (result: ComplianceResult) => void;
}

export function CTSCompliancePanel({ vesselId, vesselName, onComplianceCheck }: Props) {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [ctsRecord, setCtsRecord] = useState<any>(null);
  const [crew, setCrew] = useState<any[]>([]);

  useEffect(() => {
    if (vesselId) loadData();
  }, [vesselId]);

  const loadData = async () => {
    if (!vesselId) return;
    setLoading(true);
    try {
      // Load crew data
      const crewRes = await supabase
        .from('crew_members')
        .select('id, full_name, rank, status, vessel_id')
        .eq('vessel_id', vesselId)
        .eq('status', 'onboard');

      // Load real CTS record from database
      const ctsRes = await supabase
        .from('cts_records')
        .select('*')
        .eq('vessel_id', vesselId)
        .eq('status', 'valid')
        .order('expiry_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Use real data or fallback to mock
      const ctsData = ctsRes.data ? {
        id: ctsRes.data.id,
        vessel_id: ctsRes.data.vessel_id,
        cts_number: ctsRes.data.cts_number,
        approved_positions: (ctsRes.data.required_positions as Record<string, number>) || { captain: 1, chief_engineer: 1, officer: 3, crew: 8 },
        expiry_date: ctsRes.data.expiry_date,
        flag_state: ctsRes.data.flag_state,
        classification_society: ctsRes.data.classification_society
      } : {
        id: '1',
        vessel_id: vesselId,
        cts_number: 'CTS-2024-001',
        approved_positions: { captain: 1, chief_engineer: 1, officer: 3, crew: 8 },
        expiry_date: '2025-12-31',
        flag_state: 'Brazil',
        classification_society: 'DNV'
      };
      
      setCtsRecord(ctsData);
      
      // Transform crew data
      const crewData = (crewRes.data || []).map(c => ({
        ...c,
        crew_certifications: []
      }));
      
      setCrew(crewData);

      // Run compliance check
      runLocalComplianceCheck(ctsData, crewData);
    } catch (error: unknown) {
      logger.error('Error loading CTS data:', error);
      toast.error('Erro ao carregar dados CTS');
    } finally {
      setLoading(false);
    }
  };

  const runLocalComplianceCheck = (cts: CTSData, crewData: CrewMemberData[]) => {
    const violations: CTSViolation[] = [];
    const positions: CTSPosition[] = [];
    
    const approvedPositions = cts.approved_positions || {};
    
    Object.entries(approvedPositions).forEach(([position, requiredCount]) => {
      const crewInPosition = crewData.filter(c => 
        c.rank?.toLowerCase() === position.toLowerCase()
      );
      const currentCount = crewInPosition.length;

      positions.push({
        position,
        required_count: requiredCount as number,
        current_count: currentCount,
        crew_members: crewInPosition.map(c => ({
          id: c.id,
          name: c.full_name,
          category: c.category,
          has_valid_certificate: checkValidCertifications(c.crew_certifications),
          expiry_date: getNextExpiry(c.crew_certifications)
        }))
      });

      // Check violations
      if (currentCount > (requiredCount as number)) {
        violations.push({
          type: 'overstaffed',
          severity: 'high',
          position,
          details: `${currentCount} tripulantes na posição "${position}", CTS permite ${requiredCount}`,
          crew_affected: crewInPosition.map(c => c.id),
          remediation: `Desembarcar ${currentCount - (requiredCount as number)} tripulante(s)`
        });
      }

      if (currentCount < (requiredCount as number)) {
        violations.push({
          type: 'understaffed',
          severity: 'critical',
          position,
          details: `Apenas ${currentCount} tripulantes na posição "${position}", CTS exige ${requiredCount}`,
          crew_affected: [],
          remediation: `Embarcar ${(requiredCount as number) - currentCount} tripulante(s) qualificado(s)`
        });
      }

      // Check certifications
      crewInPosition.forEach(c => {
        if (!checkValidCertifications(c.crew_certifications)) {
          violations.push({
            type: 'expired_certificate',
            severity: 'critical',
            position,
            details: `${c.full_name} possui certificações expiradas ou ausentes`,
            crew_affected: [c.id],
            remediation: 'Renovar certificações obrigatórias'
          });
        }
      });
    });

    const totalViolations = violations.length;
    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    const complianceScore = Math.max(0, 100 - (criticalCount * 20) - (totalViolations * 5));
    
    const result: ComplianceResult = {
      compliant: violations.length === 0,
      violations,
      positions,
      recommendations: generateRecommendations(violations),
      compliance_score: complianceScore,
      risk_level: criticalCount > 0 ? 'critical' : totalViolations > 0 ? 'high' : 'low'
    };

    setCompliance(result);
    onComplianceCheck?.(result);
  };

  const runAIComplianceCheck = async () => {
    if (!ctsRecord || crew.length === 0) {
      toast.error('Dados insuficientes para análise IA');
      return;
    }

    setChecking(true);
    try {
      const crewCertifications = crew.map(c => ({
        crew_name: c.full_name,
        certification_type: c.crew_certifications?.[0]?.certification_name || 'N/A',
        certificate_number: c.crew_certifications?.[0]?.certification_number || 'N/A',
        expiry_date: c.crew_certifications?.[0]?.expiry_date || 'N/A'
      }));

      const { data, error } = await supabase.functions.invoke('cts-conformity', {
        body: {
          cts_record: ctsRecord,
          crew_certifications: crewCertifications,
          vessel_name: vesselName || 'Embarcação'
        }
      });

      if (error) throw error;

      toast.success('Análise IA CTS concluída');
      
      // Merge AI analysis with local compliance check
      if (compliance) {
        setCompliance({
          ...compliance,
          recommendations: [
            ...compliance.recommendations,
            ...(data.corrective_actions || [])
          ]
        });
      }
    } catch (error: unknown) {
      toast.error('Erro na análise IA de conformidade');
    } finally {
      setChecking(false);
    }
  };

  const checkValidCertifications = (certs: CertificationData[] | undefined): boolean => {
    if (!certs || certs.length === 0) return false;
    const now = new Date();
    return certs.some(cert => {
      if (!cert.expiry_date) return false;
      return new Date(cert.expiry_date) > now;
    });
  };

  const getNextExpiry = (certs: CertificationData[] | undefined): string | undefined => {
    if (!certs || certs.length === 0) return undefined;
    const validCerts = certs.filter(c => c.expiry_date);
    if (validCerts.length === 0) return undefined;
    validCerts.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
    return validCerts[0].expiry_date;
  };

  const generateRecommendations = (violations: CTSViolation[]): string[] => {
    const recs: string[] = [];
    
    const critical = violations.filter(v => v.severity === 'critical');
    if (critical.length > 0) {
      recs.push(`⚠️ ${critical.length} violações CRÍTICAS - OPERAÇÃO DEVE SER SUSPENSA`);
    }

    const understaffed = violations.filter(v => v.type === 'understaffed');
    if (understaffed.length > 0) {
      recs.push(`Embarcar tripulantes: ${understaffed.map(v => v.position).join(', ')}`);
    }

    const expired = violations.filter(v => v.type === 'expired_certificate');
    if (expired.length > 0) {
      recs.push(`${expired.length} tripulante(s) com certificações expiradas - renovar URGENTE`);
    }

    return recs;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-info" />
            Conformidade CTS / STCW
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={runAIComplianceCheck} disabled={checking}>
              {checking ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Verificar IA
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!ctsRecord ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>CTS não cadastrado para esta embarcação</p>
          </div>
        ) : (
          <Tabs defaultValue="status" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="positions">Posições</TabsTrigger>
              <TabsTrigger value="violations">Violações</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              {/* Compliance Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {compliance?.compliant ? (
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  )}
                  <div>
                    <p className="font-semibold text-lg">
                      {compliance?.compliant ? 'CONFORME' : 'NÃO CONFORME'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      CTS: {ctsRecord.cts_number}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{compliance?.compliance_score || 0}%</p>
                  <p className="text-sm text-muted-foreground">Compliance Score</p>
                </div>
              </div>

              <Progress value={compliance?.compliance_score || 0} className="h-3" />

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-info" />
                  <p className="text-xl font-bold">{crew.length}</p>
                  <p className="text-xs text-muted-foreground">A Bordo</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <UserCheck className="h-5 w-5 mx-auto mb-1 text-success" />
                  <p className="text-xl font-bold">
                    {compliance?.positions.filter(p => p.current_count >= p.required_count).length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Posições OK</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-destructive" />
                  <p className="text-xl font-bold">{compliance?.violations.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Violações</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
                  <p className="text-xl font-bold">
                    {crew.filter(c => {
                      const exp = getNextExpiry(c.crew_certifications);
                      if (!exp) return false;
                      const days = (new Date(exp).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                      return days <= 30 && days > 0;
                    }).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Expirando</p>
                </div>
              </div>

              {/* Recommendations */}
              {compliance?.recommendations && compliance.recommendations.length > 0 && (
                <div className="p-4 border rounded-lg space-y-2">
                  <p className="font-medium">Recomendações:</p>
                  {compliance.recommendations.map((rec, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">• {rec}</p>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="positions">
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {compliance?.positions.map((pos, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{pos.position}</span>
                        <Badge variant={pos.current_count >= pos.required_count ? 'default' : 'destructive'}>
                          {pos.current_count} / {pos.required_count}
                        </Badge>
                      </div>
                      {pos.crew_members.length > 0 && (
                        <div className="space-y-1">
                          {pos.crew_members.map(cm => (
                            <div key={cm.id} className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{cm.name}</span>
                              {!cm.has_valid_certificate && (
                                <Badge variant="destructive" className="text-xs">
                                  Cert. Inválida
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="violations">
              <ScrollArea className="h-[300px]">
                {compliance?.violations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success opacity-50" />
                    <p>Nenhuma violação detectada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {compliance?.violations.map((v, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(v.severity)}>
                            {v.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium capitalize">{v.type.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm">{v.details}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          <strong>Remediação:</strong> {v.remediation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

export default CTSCompliancePanel;
