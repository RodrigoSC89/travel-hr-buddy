/**
 * Hook para dados de auditoria do AuditAssistant
 * Substitui MOCK_PACKAGES e MOCK_DOCUMENTS
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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

interface FindingItem {
  status?: string;
  description?: string;
}

function parseFindings(raw: string | null): FindingItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Hook para pacotes de auditoria
export function useAuditPackages() {
  return useQuery({
    queryKey: ["audit-packages"],
    queryFn: async (): Promise<AuditPackage[]> => {
      const { data, error } = await supabase
        .from("sgso_audits")
        .select("id, audit_type, status, findings, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map((audit) => {
        const findings = parseFindings(audit.findings);
        const resolvedCount = findings.filter(f => f.status === 'resolved').length;
        const completeness = findings.length > 0
          ? Math.round((resolvedCount / findings.length) * 100)
          : 100;

        return {
          id: audit.id,
          name: `Auditoria ${audit.audit_type || 'SGSO'} - ${new Date(audit.created_at || Date.now()).toLocaleDateString('pt-BR')}`,
          type: (audit.audit_type?.toUpperCase() || 'ISM') as AuditPackage['type'],
          status: audit.status === 'completed' ? 'ready' : audit.status === 'in_progress' ? 'generating' : 'pending',
          completeness,
          documents: findings.length || 0,
          lastGenerated: new Date(audit.updated_at || audit.created_at || Date.now()),
          missingItems: findings.filter(f => f.status === 'open').map(f => f.description || 'Item pendente')
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
        .select("id, certificate_number, expiry_date, status, issuing_authority")
        .order("expiry_date", { ascending: true })
        .limit(20);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      return data.map((cert) => {
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
          name: cert.certificate_number || cert.issuing_authority || 'Certificado',
          category: getCertificateCategory(cert.issuing_authority),
          status,
          expiryDate,
          vessel: undefined
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
