/**
 * Hook para dados de auditoria do AuditAssistant
 * Substitui MOCK_PACKAGES e MOCK_DOCUMENTS
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditPackage {
  id: string;
  name: string;
  type: 'ANTAQ' | 'DPC' | 'IMO' | 'ISM' | 'ISPS' | 'MLC' | 'ESG' | 'ISO';
  status: 'ready' | 'generating' | 'pending' | 'incomplete';
  completeness: number;
  documents: number;
  lastGenerated?: Date;
  missingItems: string[];
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  status: 'valid' | 'expiring' | 'expired' | 'missing';
  expiryDate?: Date;
  vessel?: string;
}

// Hook para pacotes de auditoria
export function useAuditPackages() {
  return useQuery({
    queryKey: ["audit-packages"],
    queryFn: async (): Promise<AuditPackage[]> => {
      // Buscar do sgso_audits ou audits table
      const { data, error } = await supabase
        .from("sgso_audits")
        .select("id, audit_type, status, scope, findings, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map((audit: any) => {
        const findings = Array.isArray(audit.findings) ? audit.findings : [];
        const completeness = findings.length > 0 
          ? Math.round((findings.filter((f: any) => f.status === 'resolved').length / findings.length) * 100)
          : 100;

        return {
          id: audit.id,
          name: `Auditoria ${audit.audit_type || 'SGSO'} - ${new Date(audit.created_at).toLocaleDateString('pt-BR')}`,
          type: (audit.audit_type?.toUpperCase() || 'ISM') as AuditPackage['type'],
          status: audit.status === 'completed' ? 'ready' : audit.status === 'in_progress' ? 'generating' : 'pending',
          completeness,
          documents: findings.length || 0,
          lastGenerated: new Date(audit.updated_at || audit.created_at),
          missingItems: findings.filter((f: any) => f.status === 'open').map((f: any) => f.description || 'Item pendente')
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para documentos de certificação
export function useAuditDocuments() {
  return useQuery({
    queryKey: ["audit-documents"],
    queryFn: async (): Promise<DocumentItem[]> => {
      const { data, error } = await supabase
        .from("maritime_certificates")
        .select(`
          id,
          certificate_type,
          certificate_number,
          expiry_date,
          status,
          vessels:vessel_id (name)
        `)
        .order("expiry_date", { ascending: true })
        .limit(20);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      return data.map((cert: any) => {
        const expiryDate = cert.expiry_date ? new Date(cert.expiry_date) : undefined;
        let status: DocumentItem['status'] = 'valid';
        
        if (!expiryDate) {
          status = 'missing';
        } else if (expiryDate.getTime() < now) {
          status = 'expired';
        } else if (expiryDate.getTime() < now + thirtyDays) {
          status = 'expiring';
        }

        return {
          id: cert.id,
          name: cert.certificate_type || 'Certificado',
          category: getCertificateCategory(cert.certificate_type),
          status,
          expiryDate,
          vessel: cert.vessels?.name
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

function getCertificateCategory(type: string | null): string {
  if (!type) return 'Outros';
  const upper = type.toUpperCase();
  if (upper.includes('STCW') || upper.includes('MARÍTIMO')) return 'Tripulação';
  if (upper.includes('ISM') || upper.includes('ISPS') || upper.includes('SEGURANÇA')) return 'Segurança';
  if (upper.includes('IOPP') || upper.includes('AMBIENTAL') || upper.includes('MARPOL')) return 'Ambiental';
  if (upper.includes('CLASSE') || upper.includes('DNV') || upper.includes('ABS')) return 'Classificação';
  if (upper.includes('MLC') || upper.includes('TRABALH')) return 'Trabalhista';
  return 'Outros';
}
