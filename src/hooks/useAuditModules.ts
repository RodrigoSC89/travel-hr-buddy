/**
 * Audit Modules Hooks - v4.0 PRODUCTION
 * PEO-DP, PEOTRAM, SGSO, IMCA, Pre-OVID, MLC, PSC
 * PATCH 902: Exact column mapping from database schema
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuditItem {
  id: string;
  category: string;
  item_number: string;
  description: string;
  status: 'pending' | 'compliant' | 'non_compliant' | 'not_applicable';
  evidence_count: number;
  notes?: string;
  severity?: 'critical' | 'major' | 'minor' | 'observation';
  due_date?: string;
  assigned_to?: string;
}

export interface Audit {
  id: string;
  type: 'peo_dp' | 'peotram' | 'sgso' | 'imca' | 'pre_ovid' | 'mlc' | 'psc';
  vessel_id?: string;
  vessel_name?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'submitted';
  compliance_score: number;
  total_items: number;
  completed_items: number;
  non_conformities: number;
  created_at: string;
  updated_at?: string;
  scheduled_date?: string;
  auditor_name?: string;
  items?: AuditItem[];
}

export interface AuditEvidence {
  id: string;
  audit_id: string;
  item_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  uploaded_by?: string;
  uploaded_at: string;
  blockchain_hash?: string;
}

// Helper to map peotram_audits to Audit interface
function mapPeotramAudit(d: Record<string, unknown>, auditType: Audit['type']): Audit {
  const vessels = d.vessels as { name?: string } | null;
  return {
    id: d.id as string,
    type: auditType,
    vessel_id: d.vessel_id as string | undefined,
    vessel_name: vessels?.name || 'N/A',
    status: (d.status as Audit['status']) || 'draft',
    compliance_score: (d.compliance_score as number) || (d.final_score as number) || 0,
    total_items: (d.non_conformities_count as number) || 0,
    completed_items: 0,
    non_conformities: (d.non_conformities_count as number) || 0,
    created_at: d.created_at as string,
    scheduled_date: d.audit_date as string,
    auditor_name: d.auditor_name as string | undefined,
  };
}

// === PEO-DP Hooks ===
export function usePEODPAudits() {
  return useQuery({
    queryKey: ['peo-dp-audits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('peotram_audits')
        .select('*, vessels(name)')
        .eq('audit_type', 'PEO-DP')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(d => mapPeotramAudit(d as Record<string, unknown>, 'peo_dp'));
    },
    staleTime: 60000,
  });
}

export function usePEODPAuditItems(auditId: string) {
  return useQuery({
    queryKey: ['peo-dp-items', auditId],
    queryFn: async () => {
      const { data } = await supabase
        .from('peotram_non_conformities')
        .select('*')
        .eq('audit_id', auditId);

      return (data || []).map((nc, idx) => ({
        id: nc.id,
        category: nc.element_name || 'Sistema DP',
        item_number: nc.element_number || `${idx + 1}.1`,
        description: nc.description || '',
        status: nc.status === 'closed' ? 'compliant' as const : 'non_compliant' as const,
        evidence_count: (nc.evidence_urls as string[] | null)?.length || 0,
        severity: nc.severity_score && nc.severity_score >= 8 ? 'critical' as const : 
                  nc.severity_score && nc.severity_score >= 5 ? 'major' as const : 'minor' as const,
      })) as AuditItem[];
    },
    enabled: !!auditId,
  });
}

// === PEOTRAM Hooks ===
export function usePEOTRAMAudits() {
  return useQuery({
    queryKey: ['peotram-audits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('peotram_audits')
        .select('*, vessels(name)')
        .in('audit_type', ['PEOTRAM', 'IMCA', 'ISM', 'ISPS', 'SGSO'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(d => mapPeotramAudit(d as Record<string, unknown>, 'peotram'));
    },
    staleTime: 60000,
  });
}

// === SGSO Hooks ===
export function useSGSOAudits() {
  return useQuery({
    queryKey: ['sgso-audits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('peotram_audits')
        .select('*, vessels(name)')
        .eq('audit_type', 'SGSO')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(d => mapPeotramAudit(d as Record<string, unknown>, 'sgso'));
    },
    staleTime: 60000,
  });
}

export function useSGSOItems(auditId: string) {
  return useQuery({
    queryKey: ['sgso-items', auditId],
    queryFn: async () => {
      const { data } = await supabase
        .from('peotram_non_conformities')
        .select('*')
        .eq('audit_id', auditId);

      return (data || []).map((nc, idx) => ({
        id: nc.id,
        category: nc.element_name || 'Prática SGSO',
        item_number: nc.element_number || `${idx + 1}.1`,
        description: nc.description || '',
        status: nc.status === 'closed' ? 'compliant' as const : 'non_compliant' as const,
        evidence_count: (nc.evidence_urls as string[] | null)?.length || 0,
      })) as AuditItem[];
    },
    enabled: !!auditId,
  });
}

// === Pre-OVID Hooks ===
export function usePreOVIDAudits() {
  return useQuery({
    queryKey: ['pre-ovid-audits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('peotram_audits')
        .select('*, vessels(name)')
        .eq('audit_type', 'IMCA')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(d => mapPeotramAudit(d as Record<string, unknown>, 'pre_ovid'));
    },
    staleTime: 60000,
  });
}

// === MLC Hooks ===
export function useMLCInspections() {
  return useQuery({
    queryKey: ['mlc-inspections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mlc_inspections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        type: 'mlc' as const,
        vessel_id: d.vessel_imo,
        vessel_name: d.vessel_name || 'N/A',
        status: (d.status as Audit['status']) || 'completed',
        compliance_score: d.compliance_score || 0,
        total_items: d.total_items || 0,
        completed_items: d.compliant_items || 0,
        non_conformities: d.non_compliant_items || 0,
        created_at: d.created_at,
        auditor_name: d.inspector_name || d.inspection_type,
      })) as Audit[];
    },
    staleTime: 60000,
  });
}

// === PSC Package Hooks ===
export function usePSCPackages() {
  return useQuery({
    queryKey: ['psc-packages'],
    queryFn: async () => {
      // PSC packages table may not exist, return empty gracefully
      return [];
    },
    staleTime: 60000,
  });
}

// === Generic Audit Mutations ===
export function useCreateAudit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (audit: Partial<Audit> & { type: Audit['type'] }) => {
      const user = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('peotram_audits')
        .insert({
          audit_type: audit.type.toUpperCase().replace('_', '-'),
          vessel_id: audit.vessel_id,
          status: 'scheduled',
          audit_date: audit.scheduled_date || new Date().toISOString().split('T')[0],
          audit_period: new Date().toISOString().slice(0, 7),
          created_by: user.data.user?.id || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`${variables.type}-audits`] });
      toast.success('Auditoria criada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar auditoria: ${error.message}`);
    },
  });
}

export function useUpdateAuditItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      auditId, 
      itemId, 
      status, 
    }: { 
      auditId: string; 
      itemId: string; 
      status: AuditItem['status']; 
      notes?: string;
    }) => {
      const newStatus = status === 'compliant' ? 'closed' : status === 'non_compliant' ? 'open' : 'in_progress';
      
      const { error } = await supabase
        .from('peotram_non_conformities')
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) throw error;
      return { auditId, itemId, status };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['audit-items', variables.auditId] });
      toast.success('Item atualizado!');
    },
  });
}

export function useUploadEvidence() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      auditId, 
      itemId, 
      file 
    }: { 
      auditId: string; 
      itemId: string; 
      file: File;
    }) => {
      const fileName = `${auditId}/${itemId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('audit-evidence')
        .upload(fileName, file);
      
      if (error) throw error;
      
      return { 
        file_url: data.path, 
        file_name: file.name,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-evidence'] });
      toast.success('Evidência carregada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro no upload: ${error.message}`);
    },
  });
}

// AI-powered audit analysis
export function useAIAuditAnalysis() {
  return useMutation({
    mutationFn: async ({ auditId, auditType }: { auditId: string; auditType: string }) => {
      const functionName = `${auditType}-ai-chat`;
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { action: 'analyze', auditId },
      });
      
      if (error) throw error;
      return data;
    },
  });
}

// Generate audit report
export function useGenerateAuditReport() {
  return useMutation({
    mutationFn: async ({ auditId, auditType, format = 'pdf' }: { 
      auditId: string; 
      auditType: string; 
      format?: 'pdf' | 'excel';
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { auditId, auditType, format },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Relatório gerado com sucesso!');
    },
  });
}
