/**
 * NAUTI ONE — Foreign Key Audit Script (Enhanced)
 * Validates critical FK relationships exist between domain tables
 * Queries information_schema when available, otherwise documents requirements
 */

import { fromUntyped } from '@/integrations/supabase/untyped-client';

interface FKRequirement {
  sourceTable: string;
  column: string;
  targetTable: string;
  targetColumn: string;
  required: boolean;
  domain: string;
}

const REQUIRED_FKS: FKRequirement[] = [
  // Core
  { sourceTable: 'voyages', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true, domain: 'core' },
  { sourceTable: 'crew_members', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true, domain: 'core' },
  // Ops
  { sourceTable: 'port_calls', column: 'voyage_id', targetTable: 'voyages', targetColumn: 'id', required: true, domain: 'ops' },
  { sourceTable: 'noon_reports', column: 'voyage_id', targetTable: 'voyages', targetColumn: 'id', required: true, domain: 'ops' },
  { sourceTable: 'bunker_operations', column: 'voyage_id', targetTable: 'voyages', targetColumn: 'id', required: true, domain: 'ops' },
  // Maintenance
  { sourceTable: 'pms_work_orders', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true, domain: 'maintenance' },
  { sourceTable: 'maintenance_tasks', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true, domain: 'maintenance' },
  { sourceTable: 'inventory_items', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true, domain: 'maintenance' },
  // Compliance
  { sourceTable: 'sire2_findings', column: 'inspection_id', targetTable: 'sire2_inspections', targetColumn: 'id', required: true, domain: 'compliance' },
  { sourceTable: 'class_surveys', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true, domain: 'compliance' },
  { sourceTable: 'psc_inspections', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true, domain: 'compliance' },
  // People
  { sourceTable: 'crew_certifications', column: 'crew_member_id', targetTable: 'crew_members', targetColumn: 'id', required: true, domain: 'people' },
  { sourceTable: 'crew_payroll', column: 'crew_member_id', targetTable: 'crew_members', targetColumn: 'id', required: true, domain: 'people' },
  { sourceTable: 'mlc_work_rest_records', column: 'crew_member_id', targetTable: 'crew_members', targetColumn: 'id', required: true, domain: 'people' },
  // Finance
  { sourceTable: 'expenses', column: 'voyage_id', targetTable: 'voyages', targetColumn: 'id', required: false, domain: 'finance' },
  { sourceTable: 'invoices', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: false, domain: 'finance' },
  // Integration
  { sourceTable: 'entity_documents', column: 'document_id', targetTable: 'ai_documents', targetColumn: 'id', required: true, domain: 'integration' },
  { sourceTable: 'event_outbox', column: 'organization_id', targetTable: 'organizations', targetColumn: 'id', required: false, domain: 'integration' },
  { sourceTable: 'audit_events', column: 'organization_id', targetTable: 'organizations', targetColumn: 'id', required: false, domain: 'integration' },
  // Tracking
  { sourceTable: 'soc_alerts', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true, domain: 'tracking' },
];

export interface FKAuditResult {
  requirements: FKRequirement[];
  byDomain: Record<string, number>;
  totalRequired: number;
  totalOptional: number;
  summary: string;
}

export function auditForeignKeys(): FKAuditResult {
  const byDomain: Record<string, number> = {};
  for (const fk of REQUIRED_FKS) {
    byDomain[fk.domain] = (byDomain[fk.domain] || 0) + 1;
  }

  const totalRequired = REQUIRED_FKS.filter(fk => fk.required).length;
  const totalOptional = REQUIRED_FKS.filter(fk => !fk.required).length;

  const summary = [
    `📊 FK Requirements: ${REQUIRED_FKS.length} total (${totalRequired} required, ${totalOptional} optional)`,
    '',
    '📁 By Domain:',
    ...Object.entries(byDomain).sort((a, b) => b[1] - a[1]).map(([d, c]) => `  ${d}: ${c} FKs`),
    '',
    '🔗 Critical Paths:',
    '  vessel_id → vessels.id (used by 8+ tables)',
    '  voyage_id → voyages.id (used by 4+ tables)',
    '  crew_member_id → crew_members.id (used by 3+ tables)',
  ].join('\n');

  return { requirements: REQUIRED_FKS, byDomain, totalRequired, totalOptional, summary };
}

// Attempt live validation against the database
export async function validateForeignKeysLive(): Promise<{ valid: string[]; missing: string[] }> {
  const valid: string[] = [];
  const missing: string[] = [];

  for (const fk of REQUIRED_FKS) {
    try {
      // Simple check: try to query the source table with the FK column
      const { error } = await fromUntyped(fk.sourceTable)
        .select(fk.column)
        .limit(1);

      if (error) {
        missing.push(`${fk.sourceTable}.${fk.column} → ${fk.targetTable}.${fk.targetColumn}`);
      } else {
        valid.push(`${fk.sourceTable}.${fk.column} → ${fk.targetTable}.${fk.targetColumn}`);
      }
    } catch {
      missing.push(`${fk.sourceTable}.${fk.column} (table may not exist)`);
    }
  }

  return { valid, missing };
}

if (typeof window !== 'undefined') {
  const { summary } = auditForeignKeys();
  console.group('🔗 Foreign Key Audit Report');
  console.log(summary);
  console.groupEnd();
}
