/**
 * Audit Modules Hooks - v4.0 PRODUCTION
 * PEO-DP, PEOTRAM, SGSO, IMCA, Pre-OVID, MLC, PSC
 * PATCH 900: Connected to real Supabase tables
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

// === PEO-DP Hooks - Connected to peotram_audits with type filter ===
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

      return (data || []).map(d => ({
        id: d.id,
        type: 'peo_dp' as const,
        vessel_id: d.vessel_id,
        vessel_name: d.vessels?.name || 'N/A',
        status: d.status as Audit['status'],
        compliance_score: d.score || 0,
        total_items: Object.keys(d.checklist_items || {}).length,
        completed_items: Object.values(d.checklist_items || {}).filter(v => v !== 'not_checked').length,
        non_conformities: d.findings_count || 0,
        created_at: d.created_at,
        scheduled_date: d.scheduled_date,
      })) as Audit[];
    },
    staleTime: 60000,
  });
}

export function usePEODPAuditItems(auditId: string) {
  return useQuery({
    queryKey: ['peo-dp-items', auditId],
    queryFn: async () => {
      const { data } = await supabase
        .from('peotram_audits')
        .select('checklist_items')
        .eq('id', auditId)
        .single();

      const items = data?.checklist_items || {};
      return Object.entries(items).map(([key, value], idx) => ({
        id: `${auditId}-${idx}`,
        category: 'Sistema DP',
        item_number: `${idx + 1}.1`,
        description: key,
        status: value === 'ok' ? 'compliant' : value === 'fail' ? 'non_compliant' : 'pending',
        evidence_count: 0,
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

      return (data || []).map(d => ({
        id: d.id,
        type: 'peotram' as const,
        vessel_id: d.vessel_id,
        vessel_name: d.vessels?.name || 'N/A',
        status: d.status as Audit['status'],
        compliance_score: d.score || 0,
        total_items: Object.keys(d.checklist_items || {}).length,
        completed_items: Object.values(d.checklist_items || {}).filter(v => v !== 'not_checked').length,
        non_conformities: d.findings_count || 0,
        created_at: d.created_at,
        scheduled_date: d.scheduled_date,
      })) as Audit[];
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

      return (data || []).map(d => ({
        id: d.id,
        type: 'sgso' as const,
        vessel_name: d.vessels?.name || 'N/A',
        status: d.status as Audit['status'],
        compliance_score: d.score || 0,
        total_items: Object.keys(d.checklist_items || {}).length,
        completed_items: Object.values(d.checklist_items || {}).filter(v => v !== 'not_checked').length,
        non_conformities: d.findings_count || 0,
        created_at: d.created_at,
      })) as Audit[];
    },
    staleTime: 60000,
  });
}

export function useSGSOItems(auditId: string) {
  return useQuery({
    queryKey: ['sgso-items', auditId],
    queryFn: async () => {
      const { data } = await supabase
        .from('peotram_audits')
        .select('checklist_items')
        .eq('id', auditId)
        .single();

      const items = data?.checklist_items || {};
      return Object.entries(items).map(([key, value], idx) => ({
        id: `${auditId}-${idx}`,
        category: 'Prática SGSO',
        item_number: `${idx + 1}.1`,
        description: key,
        status: value === 'ok' ? 'compliant' : value === 'fail' ? 'non_compliant' : 'pending',
        evidence_count: 0,
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

      return (data || []).map(d => ({
        id: d.id,
        type: 'pre_ovid' as const,
        vessel_name: d.vessels?.name || 'N/A',
        status: d.status as Audit['status'],
        compliance_score: d.score || 0,
        total_items: Object.keys(d.checklist_items || {}).length,
        completed_items: Object.values(d.checklist_items || {}).filter(v => v !== 'not_checked').length,
        non_conformities: d.findings_count || 0,
        created_at: d.created_at,
      })) as Audit[];
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
        .select('*, vessels(name)')
        .order('inspection_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(d => ({
        id: d.id,
        type: 'mlc' as const,
        vessel_id: d.vessel_id,
        vessel_name: d.vessels?.name || 'N/A',
        status: d.status as Audit['status'],
        compliance_score: d.compliance_score || 0,
        total_items: Object.keys(d.compliance_areas || {}).length,
        completed_items: Object.keys(d.compliance_areas || {}).length,
        non_conformities: d.deficiencies || 0,
        created_at: d.inspection_date,
        auditor_name: d.inspection_type,
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
      const { data, error } = await supabase
        .from('psc_packages')
        .select('*, vessels(name)')
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not exist, return empty
        return [];
      }

      return (data || []).map(d => ({
        id: d.id,
        vessel_name: d.vessels?.name || 'N/A',
        port: d.port,
        scheduled_date: d.scheduled_date,
        documents_ready: d.documents_ready || 0,
        documents_total: d.documents_total || 0,
        status: d.status,
      }));
    },
    staleTime: 60000,
  });
}

// === Generic Audit Mutations ===
export function useCreateAudit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (audit: Partial<Audit> & { type: Audit['type'] }) => {
      const { data, error } = await supabase
        .from('peotram_audits')
        .insert({
          audit_type: audit.type.toUpperCase().replace('_', '-'),
          vessel_id: audit.vessel_id,
          status: 'scheduled',
          scheduled_date: audit.scheduled_date || new Date().toISOString(),
          checklist_items: {},
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
      notes 
    }: { 
      auditId: string; 
      itemId: string; 
      status: AuditItem['status']; 
      notes?: string;
    }) => {
      const { data: current } = await supabase
        .from('peotram_audits')
        .select('checklist_items')
        .eq('id', auditId)
        .single();

      const items = current?.checklist_items || {};
      items[itemId] = status === 'compliant' ? 'ok' : status === 'non_compliant' ? 'fail' : 'not_checked';

      const { error } = await supabase
        .from('peotram_audits')
        .update({ checklist_items: items })
        .eq('id', auditId);

      if (error) throw error;
      return { auditId, itemId, status, notes };
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
