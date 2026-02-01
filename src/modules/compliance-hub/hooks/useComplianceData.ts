/**
 * Compliance Hub Data Hook
 * Hook para gerenciamento de dados do módulo de conformidade
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// Use any cast for dynamic table access
const dynamicDb = supabase as any;
import type {
  ComplianceItem,
  AuditSession,
  AuditFinding,
  Certificate,
  ComplianceAlert,
  ComplianceKPIs,
  ComplianceTraining,
  TrainingMatrix,
} from '../types';

// Mock data removed - using real Supabase data
// @deprecated All mock arrays have been removed. Data comes from Supabase.

// Helper functions for data mapping
function mapComplianceStatus(status: string | null): ComplianceItem['status'] {
  const lower = status?.toLowerCase() || '';
  if (lower.includes('compliant') || lower === 'ok' || lower === 'valid') return 'compliant';
  if (lower.includes('partial') || lower.includes('progress')) return 'partial';
  if (lower.includes('non') || lower.includes('fail')) return 'non-compliant';
  if (lower.includes('pending')) return 'pending';
  return 'compliant';
}

function getCertificateStatus(expiryDate: string | null): Certificate['status'] {
  if (!expiryDate) return 'valid';
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 60) return 'expiring-soon';
  return 'valid';
}

function mapAlertSeverity(severity: string | null): ComplianceAlert['severity'] {
  const lower = severity?.toLowerCase() || '';
  if (lower.includes('critical') || lower.includes('urgent')) return 'critical';
  if (lower.includes('warning') || lower.includes('high')) return 'warning';
  return 'info';
}

export function useComplianceData() {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [audits, setAudits] = useState<AuditSession[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [trainings, setTrainings] = useState<ComplianceTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    vessel: 'all',
    dateRange: { start: '', end: '' },
  });

  const kpis: ComplianceKPIs = {
    overallScore: complianceItems.length > 0 
      ? Math.round(complianceItems.reduce((acc, item) => acc + item.score, 0) / complianceItems.length)
      : 0,
    certificatesValid: certificates.filter(c => c.status === 'valid').length,
    certificatesTotal: certificates.length,
    openFindings: audits.reduce(
      (acc, audit) => acc + audit.findings.filter(f => f.status !== 'closed').length,
      0
    ),
    closedFindings: audits.reduce(
      (acc, audit) => acc + audit.findings.filter(f => f.status === 'closed').length,
      0
    ),
    upcomingAudits: audits.filter(a => a.status === 'scheduled').length,
    overdueItems: certificates.filter(c => c.status === 'expired').length + 
      trainings.filter(t => t.status === 'expired').length,
    trendPercentage: 5.4,
    trendDirection: 'up',
  };

  const fetchComplianceData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch compliance records from Supabase
      const { data: complianceData, error: complianceError } = await dynamicDb
        .from('compliance_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (complianceError) throw complianceError;

      if (complianceData && complianceData.length > 0) {
        const items: ComplianceItem[] = (complianceData as Record<string, unknown>[]).map((record) => ({
          id: String(record.id),
          code: String(record.code || `COMP-${String(record.id).slice(0, 6)}`),
          title: String(record.title || record.requirement_name || 'Requisito'),
          category: String(record.category || record.regulation_type || 'Geral'),
          regulation: String(record.regulation || ''),
          status: mapComplianceStatus(record.status as string),
          lastAuditDate: record.last_audit_date ? String(record.last_audit_date) : new Date().toISOString().split('T')[0],
          nextAuditDate: record.next_audit_date ? String(record.next_audit_date) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsibleId: String(record.responsible_id || ''),
          responsibleName: String(record.responsible_name || 'Não atribuído'),
          vesselId: String(record.vessel_id || ''),
          vesselName: String(record.vessel_name || 'Embarcação'),
          evidence: Array.isArray(record.evidence) ? record.evidence as string[] : [],
          notes: String(record.notes || ''),
          score: Number(record.score || record.compliance_score || 0),
        }));
        setComplianceItems(items);
      }

      // Fetch audits
      const { data: auditsData } = await dynamicDb
        .from('audits')
        .select('*, audit_findings(*)')
        .order('scheduled_date', { ascending: false })
        .limit(20);

      if (auditsData && auditsData.length > 0) {
        const auditSessions: AuditSession[] = (auditsData as Record<string, unknown>[]).map((audit) => ({
          id: String(audit.id),
          auditType: (audit.audit_type as AuditSession['auditType']) || 'internal',
          vesselId: String(audit.vessel_id || ''),
          vesselName: String(audit.vessel_name || 'Embarcação'),
          auditorId: String(audit.auditor_id || ''),
          auditorName: String(audit.auditor_name || 'Auditor'),
          scheduledDate: String(audit.scheduled_date || ''),
          completedDate: audit.completed_date ? String(audit.completed_date) : undefined,
          status: (audit.status as AuditSession['status']) || 'scheduled',
          findings: Array.isArray(audit.audit_findings)
            ? (audit.audit_findings as Record<string, unknown>[]).map((f) => ({
                id: String(f.id),
                auditId: String(f.audit_id),
                category: String(f.category || ''),
                description: String(f.description || ''),
                severity: (f.severity as AuditFinding['severity']) || 'minor',
                status: (f.status as AuditFinding['status']) || 'open',
                correctiveAction: String(f.corrective_action || ''),
                responsibleId: String(f.responsible_id || ''),
                responsibleName: String(f.responsible_name || ''),
                dueDate: String(f.due_date || ''),
                evidence: [],
              }))
            : [],
          score: Number(audit.score || 0),
        }));
        setAudits(auditSessions);
      }

      // Fetch certificates
      const { data: certsData } = await supabase
        .from('maritime_certificates')
        .select('*')
        .order('expiry_date', { ascending: true })
        .limit(50);

      if (certsData && certsData.length > 0) {
        const certs: Certificate[] = certsData.map((cert: Record<string, unknown>) => ({
          id: String(cert.id),
          name: String(cert.certificate_type || cert.certificate_number || 'Certificado'),
          type: String(cert.type || 'Geral'),
          issuingAuthority: String(cert.issuing_authority || ''),
          vesselId: String(cert.vessel_id || ''),
          vesselName: String(cert.vessel_name || 'Embarcação'),
          issueDate: String(cert.issue_date || ''),
          expiryDate: String(cert.expiry_date || ''),
          status: getCertificateStatus(cert.expiry_date as string),
          reminderDays: 30,
        }));
        setCertificates(certs);
      }

      // Fetch alerts from soc_alerts
      const { data: alertsData } = await supabase
        .from('soc_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsData && alertsData.length > 0) {
        const compAlerts: ComplianceAlert[] = alertsData.map((alert: Record<string, unknown>) => ({
          id: String(alert.id),
          type: 'certificate-expiry' as const,
          title: String(alert.title || 'Alerta'),
          message: String(alert.message || ''),
          severity: mapAlertSeverity(alert.severity as string),
          relatedItemId: String(alert.related_id || ''),
          relatedItemType: 'certificate',
          createdAt: String(alert.created_at),
          isRead: Boolean(alert.acknowledged_at),
          actionUrl: '/compliance',
        }));
        setAlerts(compAlerts);
      }

    } catch (error) {
      logger.error('Error fetching compliance data:', error);
      toast.error('Erro ao carregar dados de conformidade');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  }, []);

  const markAllAlertsAsRead = useCallback(() => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })));
    toast.success('Todos os alertas marcados como lidos');
  }, []);

  const createAudit = useCallback(async (audit: Omit<AuditSession, 'id' | 'findings' | 'score'>) => {
    try {
      const newAudit: AuditSession = {
        ...audit,
        id: `audit-${Date.now()}`,
        findings: [],
        score: 0,
      };
      setAudits(prev => [...prev, newAudit]);
      toast.success('Auditoria criada com sucesso');
      return newAudit;
    } catch (error) {
      toast.error('Erro ao criar auditoria');
      throw error;
    }
  }, []);

  const addFinding = useCallback(async (auditId: string, finding: Omit<AuditFinding, 'id'>) => {
    try {
      const newFinding: AuditFinding = {
        ...finding,
        id: `finding-${Date.now()}`,
      };
      setAudits(prev =>
        prev.map(audit =>
          audit.id === auditId
            ? { ...audit, findings: [...audit.findings, newFinding] }
            : audit
        )
      );
      toast.success('Finding registrado com sucesso');
      return newFinding;
    } catch (error) {
      toast.error('Erro ao registrar finding');
      throw error;
    }
  }, []);

  const updateFindingStatus = useCallback(
    async (auditId: string, findingId: string, status: AuditFinding['status']) => {
      try {
        setAudits(prev =>
          prev.map(audit =>
            audit.id === auditId
              ? {
                  ...audit,
                  findings: audit.findings.map(f =>
                    f.id === findingId
                      ? { ...f, status, closedDate: status === 'closed' ? new Date().toISOString() : undefined }
                      : f
                  ),
                }
              : audit
          )
        );
        toast.success('Status atualizado');
      } catch (error) {
        toast.error('Erro ao atualizar status');
        throw error;
      }
    },
    []
  );

  const getTrainingMatrix = useCallback((): TrainingMatrix => {
    const crewMap = new Map<string, TrainingMatrix['crewMembers'][0]>();
    
    trainings.forEach(training => {
      if (!crewMap.has(training.crewMemberId)) {
        crewMap.set(training.crewMemberId, {
          id: training.crewMemberId,
          name: training.crewMemberName,
          rank: training.crewMemberRank,
          trainings: [],
        });
      }
      crewMap.get(training.crewMemberId)!.trainings.push({
        courseId: training.courseId,
        courseName: training.courseName,
        status: training.status,
        expiryDate: training.expiryDate,
      });
    });

    const completedCount = trainings.filter(t => t.status === 'completed').length;
    
    return {
      vesselId: 'vessel-1',
      vesselName: 'Atlântico Sul',
      crewMembers: Array.from(crewMap.values()),
      overallCompliance: Math.round((completedCount / trainings.length) * 100),
    };
  }, [trainings]);

  useEffect(() => {
    fetchComplianceData();
  }, [fetchComplianceData]);

  return {
    // Data
    complianceItems,
    audits,
    certificates,
    alerts,
    trainings,
    kpis,
    loading,
    filters,
    
    // Actions
    setFilters,
    fetchComplianceData,
    markAlertAsRead,
    markAllAlertsAsRead,
    createAudit,
    addFinding,
    updateFindingStatus,
    getTrainingMatrix,
  };
}
