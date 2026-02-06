/**
 * useComplianceRoadmapData - Real data from Supabase for Compliance Roadmap
 * Replaces generateComplianceItems, generateNonConformities, generateAlerts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ComplianceItem {
  id: string;
  itemId: string;
  elementId: string;
  lvId: string;
  requisito: string;
  evidencia: string;
  status: 'conforme' | 'nao_conforme' | 'pendente' | 'em_analise';
  criticidade: 'critico' | 'alto' | 'medio' | 'baixo';
  peso: number;
  ultimaAuditoria: string;
  proximaAuditoria: string;
  responsavel: string;
  departamento: string;
  modulo: 'PEOTRAM' | 'PEO-DP' | 'MLC' | 'SGSO' | 'Pre-OVID';
  tendencia: 'up' | 'down' | 'stable';
  diasAteVencimento?: number;
}

interface NonConformity {
  id: string;
  ncId: string;
  titulo: string;
  descricao: string;
  itemId: string;
  elementoAfetado: string;
  lvViolada: string;
  classificacao: 'A' | 'B' | 'C' | 'D';
  status: 'aberta' | 'em_pac' | 'em_execucao' | 'aguardando_validacao' | 'fechada';
  causaRaiz: string;
  planoAcao: string;
  responsavel: string;
  prazo: string;
  dataCriacao: string;
  diasAberta: number;
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  modulo: string;
  evidenciaCorretiva?: string;
  percentualConcluido: number;
}

interface ComplianceAlert {
  id: string;
  tipo: 'certificado_vencendo' | 'nc_sem_acao' | 'auditoria_atrasada' | 'evidencia_pendente' | 'nc_critica' | 'prazo_vencido';
  titulo: string;
  mensagem: string;
  modulo: string;
  criticidade: 'critica' | 'alta' | 'media' | 'baixa';
  dataCriacao: string;
  lido: boolean;
  diasAteVencimento?: number;
}

interface DepartmentScore {
  departamento: string;
  score: number;
  meta: number;
  tendencia: 'up' | 'down' | 'stable';
  ncsAbertas: number;
  totalItens: number;
}

const mapStatus = (status: string | null): ComplianceItem['status'] => {
  switch (status?.toLowerCase()) {
    case 'completed': case 'passed': return 'conforme';
    case 'failed': case 'non_compliant': return 'nao_conforme';
    case 'in_progress': case 'in_review': return 'em_analise';
    default: return 'pendente';
  }
};

const mapNCStatus = (status: string | null): NonConformity['status'] => {
  switch (status?.toLowerCase()) {
    case 'closed': case 'resolved': return 'fechada';
    case 'in_progress': return 'em_execucao';
    case 'pending_validation': case 'review': return 'aguardando_validacao';
    case 'action_plan': return 'em_pac';
    default: return 'aberta';
  }
};

const mapNCClassification = (severity: string | null): NonConformity['classificacao'] => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'A';
    case 'major': case 'high': return 'B';
    case 'moderate': case 'medium': return 'C';
    default: return 'D';
  }
};

export function useComplianceItems() {
  return useQuery({
    queryKey: ['compliance-roadmap-items'],
    queryFn: async () => {
      const { data: audits, error } = await supabase
        .from('internal_audits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const modulos: ComplianceItem['modulo'][] = ['PEOTRAM', 'PEO-DP', 'MLC', 'SGSO', 'Pre-OVID'];
      const departamentos = ['Operação', 'RH', 'Segurança', 'Manutenção', 'Logística', 'Administrativo'];

      const items: ComplianceItem[] = (audits || []).map((audit, i) => {
        // internal_audits has: audit_number, department, audit_type, auditor_name, scheduled_date, completed_date, status, findings_count, score
        const score = audit.score ? Number(audit.score) : 80;
        const criticidade: ComplianceItem['criticidade'] = score < 50 ? 'critico' : score < 70 ? 'alto' : score < 85 ? 'medio' : 'baixo';
        const status = mapStatus(audit.status);
        const pesosMap = { critico: 10, alto: 5, medio: 3, baixo: 1 };
        const scheduledDate = audit.scheduled_date ? new Date(audit.scheduled_date) : null;
        const diasAteVencimento = scheduledDate
          ? Math.floor((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : undefined;

        return {
          id: audit.id,
          itemId: audit.audit_number || `ITEM-${String(i + 1).padStart(3, '0')}`,
          elementId: `ELEM-${String(Math.floor(i / 4) + 1).padStart(2, '0')}`,
          lvId: `LV-${String(i + 1).padStart(3, '0')}`,
          requisito: `Auditoria ${audit.audit_type || 'interna'} - ${audit.audit_number}`,
          evidencia: audit.report_url || '',
          status,
          criticidade,
          peso: pesosMap[criticidade],
          ultimaAuditoria: audit.completed_date || audit.created_at || '',
          proximaAuditoria: audit.scheduled_date || '',
          responsavel: audit.auditor_name || `Auditor ${i % 5 + 1}`,
          departamento: audit.department || departamentos[i % departamentos.length],
          modulo: (audit.audit_type as ComplianceItem['modulo']) || modulos[i % modulos.length],
          tendencia: status === 'conforme' ? 'up' : status === 'nao_conforme' ? 'down' : 'stable',
          diasAteVencimento,
        };
      });

      return items;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNonConformities() {
  return useQuery({
    queryKey: ['compliance-roadmap-ncs'],
    queryFn: async () => {
      const { data: ncs, error } = await supabase
        .from('non_conformities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items: NonConformity[] = (ncs || []).map((nc, i) => {
        // non_conformities has: nc_number, title, description, category, severity, source, standard_reference, requirement_code, status, priority, due_date, assigned_to, root_cause, corrective_action
        const classificacao = mapNCClassification(nc.severity);
        const status = mapNCStatus(nc.status);
        const createdAt = nc.created_at ? new Date(nc.created_at) : new Date();
        const diasAberta = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: nc.id,
          ncId: nc.nc_number || `NC-${String(i + 1).padStart(5, '0')}`,
          titulo: nc.title || `NC ${i + 1}`,
          descricao: nc.description || '',
          itemId: nc.source_reference || `ITEM-${String(i + 1).padStart(3, '0')}`,
          elementoAfetado: nc.category || `Elemento ${i + 1}`,
          lvViolada: nc.standard_reference || nc.requirement_code || '',
          classificacao,
          status,
          causaRaiz: nc.root_cause || '',
          planoAcao: nc.corrective_action || '',
          responsavel: nc.assigned_to || `Responsável ${i % 5 + 1}`,
          prazo: nc.due_date || nc.action_deadline || '',
          dataCriacao: nc.created_at || '',
          diasAberta,
          prioridade: nc.priority === 'critical' ? 'critica' : nc.priority === 'high' ? 'alta' : nc.priority === 'medium' ? 'media' : 'baixa',
          modulo: nc.source || 'SGSO',
          percentualConcluido: status === 'fechada' ? 100 : status === 'aguardando_validacao' ? 90 : status === 'em_execucao' ? 50 : status === 'em_pac' ? 20 : 0,
        };
      });

      return items;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useComplianceAlerts() {
  return useQuery({
    queryKey: ['compliance-roadmap-alerts'],
    queryFn: async () => {
      const [certsResult, ncsResult] = await Promise.all([
        supabase.from('certificates').select('*').order('expiry_date', { ascending: true }).limit(20),
        supabase.from('non_conformities').select('id, nc_number, title, severity, due_date, created_at').neq('status', 'closed').order('created_at', { ascending: false }).limit(10),
      ]);

      const alerts: ComplianceAlert[] = [];

      (certsResult.data || []).forEach((cert) => {
        const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : null;
        const daysToExpiry = expiryDate ? Math.floor((expiryDate.getTime() - Date.now()) / 86400000) : null;

        if (daysToExpiry !== null && daysToExpiry <= 90) {
          alerts.push({
            id: `cert-alert-${cert.id}`,
            tipo: daysToExpiry <= 0 ? 'prazo_vencido' : 'certificado_vencendo',
            titulo: `Certificado ${cert.certificate_type || 'N/A'} ${daysToExpiry <= 0 ? 'vencido' : 'expirando'}`,
            mensagem: `${cert.certificate_type} vence em ${daysToExpiry} dias`,
            modulo: 'MLC',
            criticidade: daysToExpiry <= 0 ? 'critica' : daysToExpiry <= 30 ? 'alta' : 'media',
            dataCriacao: new Date().toISOString(),
            lido: false,
            diasAteVencimento: daysToExpiry,
          });
        }
      });

      (ncsResult.data || []).forEach((nc) => {
        const dueDate = nc.due_date ? new Date(nc.due_date) : null;
        const overdue = dueDate ? dueDate.getTime() < Date.now() : false;

        if (overdue || nc.severity === 'critical') {
          alerts.push({
            id: `nc-alert-${nc.id}`,
            tipo: overdue ? 'prazo_vencido' : 'nc_critica',
            titulo: `NC ${nc.nc_number || nc.id}: ${nc.title}`,
            mensagem: overdue ? 'Prazo de correção vencido' : 'Não conformidade crítica aberta',
            modulo: 'SGSO',
            criticidade: overdue ? 'critica' : 'alta',
            dataCriacao: nc.created_at || new Date().toISOString(),
            lido: false,
          });
        }
      });

      return alerts;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDepartmentScores() {
  return useQuery({
    queryKey: ['compliance-roadmap-dept-scores'],
    queryFn: async () => {
      const { data: audits } = await supabase
        .from('internal_audits')
        .select('department, status, score');

      const departamentos = ['Operação', 'RH', 'Segurança', 'Manutenção', 'Logística', 'Administrativo'];

      const scores: DepartmentScore[] = departamentos.map(dept => {
        const deptAudits = (audits || []).filter(a => a.department === dept);
        const totalScore = deptAudits.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
        const avgScore = deptAudits.length > 0 ? Math.round(totalScore / deptAudits.length) : 85;

        return {
          departamento: dept,
          score: avgScore,
          meta: 85,
          tendencia: avgScore >= 85 ? 'up' as const : avgScore >= 70 ? 'stable' as const : 'down' as const,
          ncsAbertas: 0,
          totalItens: deptAudits.length || 0,
        };
      });

      return scores;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateNCStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('non_conformities')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-roadmap-ncs'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-roadmap-alerts'] });
    },
  });
}
