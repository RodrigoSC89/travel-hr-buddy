/**
 * Maritime Audits CRUD Hook - P0 IMPLEMENTATION
 * Unified CRUD for all 12 maritime audits with real Supabase backend
 * 
 * Supports:
 * - PEO-DP (IMCA M-117)
 * - PEOTRAM (ANP 13E)
 * - ISM Code (IMO SMS)
 * - ISPS Security (SOLAS XI-2)
 * - SOLAS/LSA/FFE
 * - MARPOL I-VI
 * - Pre-OVID (OCIMF)
 * - Pre-MLC 2006 (ILO)
 * - PSC Package (MoU)
 * - SGSO ANP (17P)
 * - Pre-SIRE 2.0 (OCIMF)
 * - TMSA (OCIMF)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUniversalExport, type ExportColumn, type ExportFormat } from './useUniversalExport';

// Audit type definitions
export type AuditType = 
  | 'peo-dp' 
  | 'peotram' 
  | 'ism' 
  | 'isps' 
  | 'solas' 
  | 'marpol' 
  | 'pre-ovid' 
  | 'pre-mlc' 
  | 'psc' 
  | 'sgso' 
  | 'pre-sire' 
  | 'tmsa';

// Table mapping for each audit type
const AUDIT_TABLE_MAP: Record<AuditType, string> = {
  'peo-dp': 'internal_audits', // Uses internal_audits with audit_type filter
  'peotram': 'peotram_audits',
  'ism': 'internal_audits',
  'isps': 'internal_audits',
  'solas': 'internal_audits',
  'marpol': 'internal_audits',
  'pre-ovid': 'preovid_audits',
  'pre-mlc': 'mlc_inspections',
  'psc': 'psc_inspections',
  'sgso': 'sgso_audits',
  'pre-sire': 'internal_audits', // SIRE uses internal_audits
  'tmsa': 'internal_audits', // TMSA uses internal_audits
};

const AUDIT_LABELS: Record<AuditType, string> = {
  'peo-dp': 'PEO-DP (IMCA M-117)',
  'peotram': 'PEOTRAM (ANP 13E)',
  'ism': 'ISM Code (SMS)',
  'isps': 'ISPS Security (SSP)',
  'solas': 'SOLAS/LSA/FFE',
  'marpol': 'MARPOL I-VI',
  'pre-ovid': 'Pre-OVID (OCIMF)',
  'pre-mlc': 'Pre-MLC 2006 (ILO)',
  'psc': 'PSC Package (MoU)',
  'sgso': 'SGSO ANP (17P)',
  'pre-sire': 'Pre-SIRE 2.0 (OCIMF)',
  'tmsa': 'TMSA (OCIMF)',
};

// Common audit interface
export interface MaritimeAudit {
  id: string;
  audit_type: AuditType;
  vessel_id?: string;
  vessel_name?: string;
  vessel_imo?: string;
  audit_date: string;
  status: 'draft' | 'in_progress' | 'completed' | 'approved' | 'closed';
  compliance_score?: number;
  auditor_name?: string;
  inspector_name?: string;
  port_location?: string;
  non_conformities_count?: number;
  findings?: string;
  recommendations?: string;
  notes?: string;
  next_audit_date?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface CreateAuditInput {
  audit_type: AuditType;
  vessel_id?: string;
  vessel_name?: string;
  vessel_imo?: string;
  audit_date?: string;
  status?: string;
  auditor_name?: string;
  port_location?: string;
  notes?: string;
}

export interface UpdateAuditInput extends Partial<CreateAuditInput> {
  id: string;
  compliance_score?: number;
  non_conformities_count?: number;
  findings?: string;
  recommendations?: string;
  next_audit_date?: string;
}

/**
 * Hook for fetching all audits of a specific type
 */
export function useMaritimeAudits(auditType: AuditType) {
  const tableName = AUDIT_TABLE_MAP[auditType];
  
  return useQuery({
    queryKey: ['maritime-audits', auditType],
    queryFn: async () => {
      // For specialized tables
      if (['peotram', 'pre-ovid', 'psc', 'sgso'].includes(auditType)) {
        const { data, error } = await (supabase.from as Function)(tableName)
          .select('*')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map((item: Record<string, unknown>) => normalizeAuditData(item));
      }
      
      // For MLC inspections
      if (auditType === 'pre-mlc') {
        const { data, error } = await supabase
          .from('mlc_inspections')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return (data || []).map((item: Record<string, unknown>) => ({
          ...normalizeAuditData(item),
          audit_type: 'pre-mlc' as AuditType,
          audit_date: (item.inspection_date as string) || (item.audit_date as string),
        }));
      }
      
      // For internal_audits with type filter
      const { data, error } = await supabase
        .from('internal_audits')
        .select('*')
        .eq('audit_type', auditType.toUpperCase().replace('-', '_'))
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map((item: Record<string, unknown>) => ({
        ...normalizeAuditData(item),
        audit_type: auditType,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching a single audit by ID
 */
export function useMaritimeAudit(auditType: AuditType, auditId: string) {
  const tableName = AUDIT_TABLE_MAP[auditType];
  
  return useQuery({
    queryKey: ['maritime-audit', auditType, auditId],
    queryFn: async () => {
      if (!auditId) return null;
      
      const { data, error } = await (supabase.from as Function)(tableName)
        .select('*')
        .eq('id', auditId)
        .eq('id', auditId)
        .single();
      
      if (error) throw error;
      return normalizeAuditData(data);
    },
    enabled: !!auditId,
  });
}

/**
 * Hook for creating a new audit
 */
export function useCreateMaritimeAudit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateAuditInput) => {
      const tableName = AUDIT_TABLE_MAP[input.audit_type];
      const label = AUDIT_LABELS[input.audit_type];
      
      // Build insert data based on table structure
      const insertData: Record<string, unknown> = {
        status: input.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Add audit_date or inspection_date based on table
      if (tableName === 'mlc_inspections' || tableName === 'psc_inspections') {
        insertData.inspection_date = input.audit_date || new Date().toISOString().split('T')[0];
      } else {
        insertData.audit_date = input.audit_date || new Date().toISOString().split('T')[0];
      }
      
      // Add vessel info
      if (input.vessel_id) insertData.vessel_id = input.vessel_id;
      if (input.vessel_name) insertData.vessel_name = input.vessel_name;
      if (input.vessel_imo) insertData.vessel_imo = input.vessel_imo;
      
      // Add auditor/inspector info based on table structure
      if (tableName === 'psc_inspections' || tableName === 'preovid_audits') {
        if (input.auditor_name) insertData.inspector_name = input.auditor_name;
      } else {
        if (input.auditor_name) insertData.auditor_name = input.auditor_name;
      }
      
      // Add port location
      if (input.port_location) {
        if (tableName === 'psc_inspections') {
          insertData.port_name = input.port_location;
        } else if (tableName === 'preovid_audits') {
          insertData.port_location = input.port_location;
        } else if (tableName === 'peotram_audits') {
          insertData.shore_location = input.port_location;
        }
      }
      
      // Add notes
      if (input.notes) insertData.notes = input.notes;
      
      // For internal_audits, add audit_type
      if (tableName === 'internal_audits') {
        insertData.audit_type = input.audit_type.toUpperCase().replace('-', '_');
        insertData.audit_number = `${input.audit_type.toUpperCase()}-${Date.now()}`;
      }
      
      const { data, error } = await (supabase.from as Function)(tableName)
        .insert(insertData)
        .select()
        .select()
        .single();
      
      if (error) throw error;
      
      return { data: normalizeAuditData(data), label };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['maritime-audits'] });
      toast.success(`${result.label} criada`, {
        description: 'Nova auditoria registrada com sucesso',
      });
    },
    onError: (error: Error) => {
      logger.error('Create audit error:', error);
      toast.error('Erro ao criar auditoria', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook for updating an existing audit
 */
export function useUpdateMaritimeAudit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateAuditInput) => {
      const auditType = input.audit_type || 'sgso'; // Default fallback
      const tableName = AUDIT_TABLE_MAP[auditType];
      const label = AUDIT_LABELS[auditType];
      
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      
      // Map fields to table structure
      if (input.status) updateData.status = input.status;
      if (input.compliance_score !== undefined) updateData.compliance_score = input.compliance_score;
      if (input.non_conformities_count !== undefined) updateData.non_conformities_count = input.non_conformities_count;
      if (input.findings) updateData.findings = input.findings;
      if (input.recommendations) updateData.recommendations = input.recommendations;
      if (input.notes) updateData.notes = input.notes;
      if (input.next_audit_date) updateData.next_audit_date = input.next_audit_date;
      
      const { data, error } = await (supabase.from as Function)(tableName)
        .update(updateData)
        .eq('id', input.id)
        .eq('id', input.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data: normalizeAuditData(data), label };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['maritime-audits'] });
      toast.success(`${result.label} atualizada`, {
        description: 'Auditoria atualizada com sucesso',
      });
    },
    onError: (error: Error) => {
      logger.error('Update audit error:', error);
      toast.error('Erro ao atualizar auditoria', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook for deleting an audit
 */
export function useDeleteMaritimeAudit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ auditType, auditId }: { auditType: AuditType; auditId: string }) => {
      const tableName = AUDIT_TABLE_MAP[auditType];
      const label = AUDIT_LABELS[auditType];
      
      const { error } = await (supabase.from as Function)(tableName)
        .delete()
        .eq('id', auditId);
      
      if (error) throw error;
      
      return { label };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['maritime-audits'] });
      toast.success(`${result.label} removida`, {
        description: 'Auditoria removida com sucesso',
      });
    },
    onError: (error: Error) => {
      logger.error('Delete audit error:', error);
      toast.error('Erro ao remover auditoria', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook for exporting audit data
 */
export function useMaritimeAuditExport(auditType: AuditType) {
  const { exportData, isExporting, exportProgress } = useUniversalExport<MaritimeAudit>();
  const label = AUDIT_LABELS[auditType];
  
  const exportColumns: ExportColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'vessel_name', label: 'Embarcação' },
    { key: 'vessel_imo', label: 'IMO' },
    { key: 'audit_date', label: 'Data Auditoria' },
    { key: 'status', label: 'Status' },
    { key: 'compliance_score', label: 'Score (%)' },
    { key: 'auditor_name', label: 'Auditor' },
    { key: 'non_conformities_count', label: 'NCs' },
    { key: 'findings', label: 'Achados' },
    { key: 'recommendations', label: 'Recomendações' },
    { key: 'next_audit_date', label: 'Próxima Auditoria' },
  ];
  
  const doExport = async (data: MaritimeAudit[], format: ExportFormat) => {
    await exportData(data, format, {
      filename: `${auditType}-audits-${new Date().toISOString().split('T')[0]}`,
      columns: exportColumns,
      title: label,
      subtitle: `Exportado em ${new Date().toLocaleDateString('pt-BR')}`,
    });
  };
  
  return {
    exportAudits: doExport,
    isExporting,
    exportProgress,
  };
}

/**
 * Aggregate hook for all 12 maritime audits
 */
export function useAllMaritimeAudits() {
  return useQuery({
    queryKey: ['all-maritime-audits'],
    queryFn: async () => {
      // Fetch from all tables in parallel
      const [internalAudits, peotramAudits, preovidAudits, pscInspections, sgsoAudits, mlcInspections] = await Promise.all([
        supabase.from('internal_audits').select('*').order('created_at', { ascending: false }),
        supabase.from('peotram_audits').select('*').order('created_at', { ascending: false }),
        supabase.from('preovid_audits').select('*').order('created_at', { ascending: false }),
        supabase.from('psc_inspections').select('*').order('created_at', { ascending: false }),
        supabase.from('sgso_audits').select('*').order('created_at', { ascending: false }),
        supabase.from('mlc_inspections').select('*').order('created_at', { ascending: false }),
      ]);
      
      const allAudits: MaritimeAudit[] = [];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- normalizing heterogeneous audit table schemas
      type AuditRow = Record<string, any>;
      
      // Normalize and combine all audit data
      if (internalAudits.data) {
        allAudits.push(...(internalAudits.data as AuditRow[]).map((a) => ({
          ...normalizeAuditData(a),
          audit_type: (a.audit_type?.toLowerCase().replace('_', '-') || 'ism') as AuditType,
        })));
      }
      
      if (peotramAudits.data) {
        allAudits.push(...(peotramAudits.data as AuditRow[]).map((a) => ({
          ...normalizeAuditData(a),
          audit_type: 'peotram' as AuditType,
        })));
      }
      
      if (preovidAudits.data) {
        allAudits.push(...(preovidAudits.data as AuditRow[]).map((a) => ({
          ...normalizeAuditData(a),
          audit_type: 'pre-ovid' as AuditType,
          auditor_name: a.inspector_name,
        })));
      }
      
      if (pscInspections.data) {
        allAudits.push(...(pscInspections.data as AuditRow[]).map((a) => ({
          ...normalizeAuditData(a),
          audit_type: 'psc' as AuditType,
          audit_date: a.inspection_date,
          port_location: a.port_name,
          non_conformities_count: a.deficiencies_count,
        })));
      }
      
      if (sgsoAudits.data) {
        allAudits.push(...(sgsoAudits.data as AuditRow[]).map((a) => ({
          ...normalizeAuditData(a),
          audit_type: 'sgso' as AuditType,
        })));
      }
      
      if (mlcInspections.data) {
        allAudits.push(...(mlcInspections.data as AuditRow[]).map((a) => ({
          ...normalizeAuditData(a),
          audit_type: 'pre-mlc' as AuditType,
          audit_date: a.inspection_date,
        })));
      }
      
      // Sort by date descending
      return allAudits.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * KPIs for compliance dashboard
 */
export function useMaritimeAuditKPIs() {
  const { data: audits, isLoading, error } = useAllMaritimeAudits();
  
  if (isLoading || error || !audits) {
    return {
      totalAudits: 0,
      completedAudits: 0,
      averageScore: 0,
      totalNCs: 0,
      overdueAudits: 0,
      auditsByType: {} as Record<AuditType, number>,
      isLoading,
      error,
    };
  }
  
  const completedAudits = audits.filter(a => 
    a.status === 'completed' || a.status === 'approved' || a.status === 'closed'
  );
  
  const withScores = audits.filter(a => a.compliance_score !== undefined && a.compliance_score !== null);
  const averageScore = withScores.length > 0 
    ? Math.round(withScores.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / withScores.length)
    : 0;
  
  const totalNCs = audits.reduce((sum, a) => sum + (a.non_conformities_count || 0), 0);
  
  const now = new Date();
  const overdueAudits = audits.filter(a => 
    a.next_audit_date && new Date(a.next_audit_date) < now && a.status !== 'completed'
  ).length;
  
  const auditsByType = audits.reduce((acc, a) => {
    acc[a.audit_type] = (acc[a.audit_type] || 0) + 1;
    return acc;
  }, {} as Record<AuditType, number>);
  
  return {
    totalAudits: audits.length,
    completedAudits: completedAudits.length,
    averageScore,
    totalNCs,
    overdueAudits,
    auditsByType,
    isLoading,
    error,
  };
}

// Helper to normalize data from different table structures
function normalizeAuditData(data: Record<string, unknown>): MaritimeAudit {
  return {
    id: data.id as string,
    audit_type: (data.audit_type as AuditType) || 'sgso',
    vessel_id: data.vessel_id as string | undefined,
    vessel_name: data.vessel_name as string | undefined,
    vessel_imo: data.vessel_imo as string | undefined,
    audit_date: (data.audit_date as string) || (data.inspection_date as string) || (data.created_at as string)?.split('T')[0],
    status: (data.status as MaritimeAudit['status']) || 'draft',
    compliance_score: (data.compliance_score as number) || (data.overall_score as number) || (data.risk_score as number),
    auditor_name: (data.auditor_name as string) || (data.inspector_name as string),
    inspector_name: data.inspector_name as string | undefined,
    port_location: (data.port_location as string) || (data.port_name as string) || (data.shore_location as string),
    non_conformities_count: (data.non_conformities_count as number) || (data.non_compliant_count as number) || (data.deficiencies_count as number) || 0,
    findings: data.findings as string | undefined,
    recommendations: data.recommendations as string | undefined,
    notes: data.notes as string | undefined,
    next_audit_date: data.next_audit_date as string | undefined,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
    metadata: data.metadata as Record<string, unknown> | undefined,
  };
}

export { AUDIT_LABELS, AUDIT_TABLE_MAP };
