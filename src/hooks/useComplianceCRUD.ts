/**
 * Compliance CRUD Hook - P1 Fix
 * Real CRUD operations for Audits, NCs, and Certificates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useToast } from '@/hooks/use-toast';

// ==================== INTERFACES ====================

export interface AuditInput {
  title: string;
  audit_type?: string;
  standard?: string;
  vessel_id?: string;
  scheduled_date?: string;
  auditor?: string;
  status?: string;
  score?: number;
  notes?: string;
}

export interface NonConformityInput {
  title: string;
  description?: string;
  category?: string;
  severity?: string;
  vessel_id?: string;
  audit_id?: string;
  due_date?: string;
  assigned_to?: string;
  status?: string;
}

export interface CertificateInput {
  name: string;
  certificate_number?: string;
  issuing_authority?: string;
  issue_date?: string;
  expiry_date?: string;
  vessel_id?: string;
  status?: string;
}

// ==================== HOOK ====================

export function useComplianceCRUD() {
  const queryClient = useQueryClient();
  const { toast: shadcnToast } = useToast();

  // ==================== AUDIT QUERIES ====================

  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ['internal-audits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_audits')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // ==================== AUDIT MUTATIONS ====================

  const createAudit = useMutation({
    mutationFn: async (audit: AuditInput) => {
      const { data, error } = await supabase
        .from('internal_audits')
        .insert([{
          audit_number: `AUD-${Date.now()}`,
          audit_type: audit.audit_type || 'internal',
          department: audit.standard || null,
          vessel_id: audit.vessel_id || null,
          scheduled_date: audit.scheduled_date || new Date().toISOString(),
          auditor_name: audit.auditor || null,
          status: audit.status || 'scheduled',
          score: audit.score || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-audits'] });
      shadcnToast({
        title: '✅ Auditoria Criada',
        description: 'Auditoria agendada com sucesso.',
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar auditoria: ${error.message}`);
    },
  });

  const updateAudit = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<AuditInput>) => {
      const { data, error } = await supabase
        .from('internal_audits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-audits'] });
      toast.success('Auditoria atualizada');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const deleteAudit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('internal_audits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internal-audits'] });
      toast.success('Auditoria removida');
    },
    onError: (error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });

  // ==================== NC QUERIES ====================

  const { data: nonConformities = [], isLoading: ncsLoading } = useQuery({
    queryKey: ['non-conformities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('non_conformities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // ==================== NC MUTATIONS ====================

  const createNC = useMutation({
    mutationFn: async (nc: NonConformityInput) => {
      const { data, error } = await supabase
        .from('non_conformities')
        .insert([{
          title: nc.title,
          description: nc.description || null,
          category: nc.category || 'general',
          severity: nc.severity || 'minor',
          vessel_id: nc.vessel_id || null,
          audit_id: nc.audit_id || null,
          due_date: nc.due_date || null,
          assigned_to: nc.assigned_to || null,
          status: nc.status || 'open',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-conformities'] });
      shadcnToast({
        title: '✅ NC Registrada',
        description: 'Não-conformidade registrada com sucesso.',
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar NC: ${error.message}`);
    },
  });

  const updateNC = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<NonConformityInput>) => {
      const { data, error } = await supabase
        .from('non_conformities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-conformities'] });
      toast.success('NC atualizada');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar NC: ${error.message}`);
    },
  });

  const closeNC = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('non_conformities')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['non-conformities'] });
      shadcnToast({
        title: '✅ NC Fechada',
        description: 'Não-conformidade encerrada.',
      });
    },
    onError: (error) => {
      toast.error(`Erro ao fechar NC: ${error.message}`);
    },
  });

  // ==================== CERTIFICATE QUERIES ====================

  const { data: certificates = [], isLoading: certificatesLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('expiry_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // ==================== CERTIFICATE MUTATIONS ====================

  const createCertificate = useMutation({
    mutationFn: async (cert: CertificateInput) => {
      const { data, error } = await supabase
        .from('certificates')
        .insert([{
          certificate_type: cert.name,
          certificate_number: cert.certificate_number || `CERT-${Date.now()}`,
          issuing_authority: cert.issuing_authority || 'Unknown',
          issue_date: cert.issue_date || new Date().toISOString().split('T')[0],
          expiry_date: cert.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: cert.status || 'valid',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      shadcnToast({
        title: '✅ Certificado Criado',
        description: 'Certificado registrado com sucesso.',
      });
    },
    onError: (error) => {
      toast.error(`Erro ao criar certificado: ${error.message}`);
    },
  });

  const updateCertificate = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CertificateInput>) => {
      const { data, error } = await supabase
        .from('certificates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Certificado atualizado');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  // ==================== EXPORT ====================

  const exportData = async (type: 'audits' | 'ncs' | 'certificates') => {
    let data: Record<string, unknown>[] = [];
    let filename = '';

    switch (type) {
      case 'audits':
        data = audits;
        filename = 'audits';
        break;
      case 'ncs':
        data = nonConformities;
        filename = 'non-conformities';
        break;
      case 'certificates':
        data = certificates;
        filename = 'certificates';
        break;
    }

    if (!data.length) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(h => {
        const value = row[h];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exportação concluída');
  };

  return {
    // Audit data and mutations
    audits,
    auditsLoading,
    createAudit,
    updateAudit,
    deleteAudit,

    // NC data and mutations
    nonConformities,
    ncsLoading,
    createNC,
    updateNC,
    closeNC,

    // Certificate data and mutations
    certificates,
    certificatesLoading,
    createCertificate,
    updateCertificate,

    // Export
    exportData,

    // Loading states
    isCreatingAudit: createAudit.isPending,
    isCreatingNC: createNC.isPending,
    isCreatingCert: createCertificate.isPending,
  };
}

export default useComplianceCRUD;
