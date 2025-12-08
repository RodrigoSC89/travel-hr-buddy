/**
 * Compliance Hub Data Hook
 * Hook para gerenciamento de dados do módulo de conformidade
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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

// Mock data for demonstration
const mockComplianceItems: ComplianceItem[] = [
  {
    id: '1',
    code: 'ISM-001',
    title: 'Sistema de Gestão de Segurança',
    category: 'ISM Code',
    regulation: 'ISM Code Chapter 9',
    status: 'compliant',
    lastAuditDate: '2024-10-15',
    nextAuditDate: '2025-04-15',
    responsibleId: 'user-1',
    responsibleName: 'Capitão Silva',
    vesselId: 'vessel-1',
    vesselName: 'Atlântico Sul',
    evidence: ['sms-manual.pdf', 'audit-report-2024.pdf'],
    notes: 'SMS atualizado conforme última auditoria',
    score: 95,
  },
  {
    id: '2',
    code: 'SOLAS-001',
    title: 'Equipamentos de Salvatagem',
    category: 'SOLAS',
    regulation: 'SOLAS Chapter III',
    status: 'compliant',
    lastAuditDate: '2024-11-01',
    nextAuditDate: '2025-05-01',
    responsibleId: 'user-2',
    responsibleName: 'Imediato Santos',
    vesselId: 'vessel-1',
    vesselName: 'Atlântico Sul',
    evidence: ['lifesaving-inspection.pdf'],
    notes: 'Todos equipamentos inspecionados e certificados',
    score: 100,
  },
  {
    id: '3',
    code: 'MLC-001',
    title: 'Condições de Trabalho a Bordo',
    category: 'MLC 2006',
    regulation: 'MLC 2006 Title 3',
    status: 'partial',
    lastAuditDate: '2024-09-20',
    nextAuditDate: '2025-03-20',
    responsibleId: 'user-3',
    responsibleName: 'Chefe de Máquinas',
    vesselId: 'vessel-1',
    vesselName: 'Atlântico Sul',
    evidence: ['mlc-inspection.pdf'],
    notes: 'Pendente atualização de alojamentos',
    score: 78,
  },
  {
    id: '4',
    code: 'ISPS-001',
    title: 'Plano de Proteção do Navio',
    category: 'ISPS Code',
    regulation: 'ISPS Code Part A',
    status: 'compliant',
    lastAuditDate: '2024-08-10',
    nextAuditDate: '2025-02-10',
    responsibleId: 'user-1',
    responsibleName: 'Capitão Silva',
    vesselId: 'vessel-1',
    vesselName: 'Atlântico Sul',
    evidence: ['ssp-2024.pdf', 'security-drills.pdf'],
    notes: 'SSP atualizado e exercícios em dia',
    score: 92,
  },
];

const mockAudits: AuditSession[] = [
  {
    id: 'audit-1',
    auditType: 'internal',
    vesselId: 'vessel-1',
    vesselName: 'Atlântico Sul',
    auditorId: 'auditor-1',
    auditorName: 'Auditor Interno - João Pereira',
    scheduledDate: '2025-01-15',
    status: 'scheduled',
    findings: [],
    score: 0,
  },
  {
    id: 'audit-2',
    auditType: 'class',
    vesselId: 'vessel-2',
    vesselName: 'Nordeste Explorer',
    auditorId: 'auditor-2',
    auditorName: 'Bureau Veritas',
    scheduledDate: '2024-12-20',
    completedDate: '2024-12-20',
    status: 'completed',
    findings: [
      {
        id: 'finding-1',
        auditId: 'audit-2',
        category: 'Manutenção',
        description: 'Registro de manutenção preventiva incompleto',
        severity: 'minor',
        status: 'in-progress',
        correctiveAction: 'Atualizar todos registros pendentes',
        responsibleId: 'user-4',
        responsibleName: 'Chefe de Máquinas',
        dueDate: '2025-01-20',
        evidence: [],
      },
    ],
    score: 88,
  },
];

const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    name: 'Documento de Conformidade (DOC)',
    type: 'ISM',
    issuingAuthority: 'DPC/Marinha do Brasil',
    vesselId: 'vessel-1',
    vesselName: 'Atlântico Sul',
    issueDate: '2023-06-15',
    expiryDate: '2028-06-14',
    status: 'valid',
    reminderDays: 90,
  },
  {
    id: 'cert-2',
    name: 'Certificado de Segurança de Construção',
    type: 'SOLAS',
    issuingAuthority: 'Bureau Veritas',
    vesselId: 'vessel-1',
    vesselName: 'Atlântico Sul',
    issueDate: '2022-03-01',
    expiryDate: '2025-02-28',
    status: 'expiring-soon',
    reminderDays: 60,
  },
  {
    id: 'cert-3',
    name: 'Certificado Internacional de Proteção do Navio (ISSC)',
    type: 'ISPS',
    issuingAuthority: 'DPC/Marinha do Brasil',
    vesselId: 'vessel-1',
    vesselName: 'Atlântico Sul',
    issueDate: '2023-01-10',
    expiryDate: '2028-01-09',
    status: 'valid',
    reminderDays: 90,
  },
  {
    id: 'cert-4',
    name: 'Certificado de Trabalho Marítimo (MLC)',
    type: 'MLC',
    issuingAuthority: 'Autoridade Marítima',
    vesselId: 'vessel-1',
    vesselName: 'Atlântico Sul',
    issueDate: '2024-02-01',
    expiryDate: '2024-12-31',
    status: 'expired',
    reminderDays: 30,
  },
];

const mockAlerts: ComplianceAlert[] = [
  {
    id: 'alert-1',
    type: 'certificate-expiry',
    title: 'Certificado MLC Expirado',
    message: 'O Certificado de Trabalho Marítimo expirou em 31/12/2024. Renovação urgente necessária.',
    severity: 'critical',
    relatedItemId: 'cert-4',
    relatedItemType: 'certificate',
    createdAt: new Date().toISOString(),
    isRead: false,
    actionUrl: '/compliance/certificates',
  },
  {
    id: 'alert-2',
    type: 'certificate-expiry',
    title: 'Certificado SOLAS Expirando',
    message: 'O Certificado de Segurança de Construção expira em 28/02/2025.',
    severity: 'warning',
    relatedItemId: 'cert-2',
    relatedItemType: 'certificate',
    createdAt: new Date().toISOString(),
    isRead: false,
    actionUrl: '/compliance/certificates',
  },
  {
    id: 'alert-3',
    type: 'audit-due',
    title: 'Auditoria Interna Programada',
    message: 'Auditoria interna do Atlântico Sul agendada para 15/01/2025.',
    severity: 'info',
    relatedItemId: 'audit-1',
    relatedItemType: 'audit',
    createdAt: new Date().toISOString(),
    isRead: true,
    actionUrl: '/compliance/audits',
  },
  {
    id: 'alert-4',
    type: 'finding-overdue',
    title: 'Finding Pendente',
    message: 'Ação corretiva para registro de manutenção vence em 20/01/2025.',
    severity: 'warning',
    relatedItemId: 'finding-1',
    relatedItemType: 'finding',
    createdAt: new Date().toISOString(),
    isRead: false,
    actionUrl: '/compliance/findings',
  },
];

const mockTrainings: ComplianceTraining[] = [
  {
    id: 'training-1',
    crewMemberId: 'crew-1',
    crewMemberName: 'Carlos Silva',
    crewMemberRank: 'Capitão',
    courseId: 'course-1',
    courseName: 'ISM Code Awareness',
    category: 'ISM',
    status: 'completed',
    progress: 100,
    startDate: '2024-06-01',
    completedDate: '2024-06-15',
    expiryDate: '2026-06-15',
    score: 95,
    certificateNumber: 'ISM-2024-001',
    isMandatory: true,
  },
  {
    id: 'training-2',
    crewMemberId: 'crew-2',
    crewMemberName: 'Roberto Santos',
    crewMemberRank: 'Imediato',
    courseId: 'course-2',
    courseName: 'STCW Basic Safety',
    category: 'STCW',
    status: 'in-progress',
    progress: 65,
    startDate: '2024-11-01',
    isMandatory: true,
  },
  {
    id: 'training-3',
    crewMemberId: 'crew-3',
    crewMemberName: 'Paulo Ferreira',
    crewMemberRank: 'Chefe de Máquinas',
    courseId: 'course-3',
    courseName: 'Fire Fighting Advanced',
    category: 'Safety',
    status: 'expired',
    progress: 100,
    completedDate: '2022-03-10',
    expiryDate: '2024-03-10',
    score: 88,
    isMandatory: true,
  },
];

export function useComplianceData() {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>(mockComplianceItems);
  const [audits, setAudits] = useState<AuditSession[]>(mockAudits);
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>(mockAlerts);
  const [trainings, setTrainings] = useState<ComplianceTraining[]>(mockTrainings);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    vessel: 'all',
    dateRange: { start: '', end: '' },
  });

  const kpis: ComplianceKPIs = {
    overallScore: Math.round(
      complianceItems.reduce((acc, item) => acc + item.score, 0) / complianceItems.length
    ),
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
      // Simulated fetch - in production, fetch from Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      // Data is already set from mock
    } catch (error) {
      console.error('Error fetching compliance data:', error);
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
