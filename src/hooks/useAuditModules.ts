/**
 * Audit Modules Hooks - v4.0
 * PEO-DP, PEOTRAM, SGSO, IMCA, Pre-OVID, MLC, PSC
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

// === PEO-DP Hooks ===
export function usePEODPAudits() {
  return useQuery({
    queryKey: ['peo-dp-audits'],
    queryFn: async () => {
      // Return mock data for now
      const mockAudits: Audit[] = [
        {
          id: '1',
          type: 'peo_dp',
          vessel_name: 'OSV Atlântico Sul',
          status: 'in_progress',
          compliance_score: 78,
          total_items: 85,
          completed_items: 66,
          non_conformities: 2,
          created_at: new Date().toISOString(),
        },
      ];
      return mockAudits;
    },
    staleTime: 60000,
  });
}

export function usePEODPAuditItems(auditId: string) {
  return useQuery({
    queryKey: ['peo-dp-items', auditId],
    queryFn: async () => {
      const mockItems: AuditItem[] = [
        { id: '1', category: 'Sistema DP', item_number: '1.1', description: 'Verificação do sistema de posicionamento dinâmico', status: 'compliant', evidence_count: 2 },
        { id: '2', category: 'Sistema DP', item_number: '1.2', description: 'Testes de redundância', status: 'pending', evidence_count: 0 },
        { id: '3', category: 'Documentação', item_number: '2.1', description: 'FMEA atualizado', status: 'non_compliant', evidence_count: 1, severity: 'major' },
      ];
      return mockItems;
    },
    enabled: !!auditId,
  });
}

// === PEOTRAM Hooks ===
export function usePEOTRAMAudits() {
  return useQuery({
    queryKey: ['peotram-audits'],
    queryFn: async () => {
      const mockAudits: Audit[] = [
        {
          id: '1',
          type: 'peotram',
          vessel_name: 'OSV Atlântico Sul',
          status: 'in_progress',
          compliance_score: 85,
          total_items: 150,
          completed_items: 127,
          non_conformities: 3,
          created_at: new Date().toISOString(),
          scheduled_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      return mockAudits;
    },
    staleTime: 60000,
  });
}

// === SGSO Hooks ===
export function useSGSOAudits() {
  return useQuery({
    queryKey: ['sgso-audits'],
    queryFn: async () => {
      const mockAudits: Audit[] = [
        {
          id: '1',
          type: 'sgso',
          vessel_name: 'Platform Support Vessel',
          status: 'completed',
          compliance_score: 92,
          total_items: 170,
          completed_items: 170,
          non_conformities: 1,
          created_at: new Date().toISOString(),
        },
      ];
      return mockAudits;
    },
    staleTime: 60000,
  });
}

export function useSGSOItems(auditId: string) {
  return useQuery({
    queryKey: ['sgso-items', auditId],
    queryFn: async () => {
      const mockItems: AuditItem[] = [
        { id: '1', category: 'Prática 1', item_number: '1.1', description: 'Política de segurança', status: 'compliant', evidence_count: 3 },
      ];
      return mockItems;
    },
    enabled: !!auditId,
  });
}

// === Pre-OVID Hooks ===
export function usePreOVIDAudits() {
  return useQuery({
    queryKey: ['pre-ovid-audits'],
    queryFn: async () => {
      const mockAudits: Audit[] = [
        {
          id: '1',
          type: 'pre_ovid',
          vessel_name: 'MV Ocean Star',
          status: 'in_progress',
          compliance_score: 88,
          total_items: 200,
          completed_items: 176,
          non_conformities: 2,
          created_at: new Date().toISOString(),
        },
      ];
      return mockAudits;
    },
    staleTime: 60000,
  });
}

// === MLC Hooks ===
export function useMLCInspections() {
  return useQuery({
    queryKey: ['mlc-inspections'],
    queryFn: async () => {
      // MLC data from existing table or mock
      const mockInspections: Audit[] = [
        {
          id: '1',
          type: 'mlc',
          vessel_name: 'MV Santos Star',
          status: 'completed',
          compliance_score: 92,
          total_items: 89,
          completed_items: 89,
          non_conformities: 1,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          auditor_name: 'DNV GL',
        },
      ];
      return mockInspections;
    },
    staleTime: 60000,
  });
}

// === PSC Package Hooks ===
export function usePSCPackages() {
  return useQuery({
    queryKey: ['psc-packages'],
    queryFn: async () => {
      const mockPackages = [
        {
          id: '1',
          vessel_name: 'OSV Atlântico Norte',
          port: 'Rotterdam',
          scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          documents_ready: 45,
          documents_total: 50,
          status: 'preparing',
        },
      ];
      return mockPackages;
    },
    staleTime: 60000,
  });
}

// === Generic Audit Mutations ===
export function useCreateAudit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (audit: Partial<Audit> & { type: Audit['type'] }) => {
      const tableName = `${audit.type.replace('_', '-')}-audits`;
      
      // For now, return mock
      return { 
        ...audit, 
        id: crypto.randomUUID(), 
        created_at: new Date().toISOString(),
        status: 'draft',
        compliance_score: 0,
        total_items: 0,
        completed_items: 0,
        non_conformities: 0,
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`${variables.type}-audits`] });
      toast.success('Auditoria criada com sucesso!');
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
      // Upload to Supabase Storage
      const fileName = `${auditId}/${itemId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('audit-evidence')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // Get blockchain hash for compliance
      const { data: hashData } = await supabase.functions.invoke('blockchain-compliance', {
        body: { action: 'hash', fileUrl: data.path },
      });
      
      return { 
        file_url: data.path, 
        file_name: file.name,
        blockchain_hash: hashData?.hash,
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
        body: { 
          action: 'analyze',
          auditId,
        },
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
