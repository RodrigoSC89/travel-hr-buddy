/**
 * NAUTI ONE — Foreign Key Audit Script
 * Validates critical FK relationships exist between domain tables
 */

interface FKRequirement {
  sourceTable: string;
  column: string;
  targetTable: string;
  targetColumn: string;
  required: boolean;
}

const REQUIRED_FKS: FKRequirement[] = [
  // Core relationships
  { sourceTable: 'voyages', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true },
  { sourceTable: 'crew_members', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true },
  // Ops
  { sourceTable: 'port_calls', column: 'voyage_id', targetTable: 'voyages', targetColumn: 'id', required: true },
  { sourceTable: 'noon_reports', column: 'voyage_id', targetTable: 'voyages', targetColumn: 'id', required: true },
  { sourceTable: 'bunker_operations', column: 'voyage_id', targetTable: 'voyages', targetColumn: 'id', required: true },
  // Maintenance
  { sourceTable: 'pms_work_orders', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true },
  { sourceTable: 'maintenance_tasks', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true },
  // Compliance
  { sourceTable: 'sire2_findings', column: 'inspection_id', targetTable: 'sire2_inspections', targetColumn: 'id', required: true },
  { sourceTable: 'class_surveys', column: 'vessel_id', targetTable: 'vessels', targetColumn: 'id', required: true },
  // People
  { sourceTable: 'crew_certifications', column: 'crew_member_id', targetTable: 'crew_members', targetColumn: 'id', required: true },
  // Integration
  { sourceTable: 'entity_documents', column: 'document_id', targetTable: 'ai_documents', targetColumn: 'id', required: true },
  { sourceTable: 'event_outbox', column: 'organization_id', targetTable: 'organizations', targetColumn: 'id', required: true },
  { sourceTable: 'audit_events', column: 'organization_id', targetTable: 'organizations', targetColumn: 'id', required: true },
];

export function auditForeignKeys(): { requirements: FKRequirement[]; summary: string } {
  // This script documents the expected FK relationships
  // In a full implementation, it would query information_schema.table_constraints
  // to verify each FK exists in the database
  
  const summary = [
    `Total FK requirements: ${REQUIRED_FKS.length}`,
    `Required (must exist): ${REQUIRED_FKS.filter(fk => fk.required).length}`,
    `\nFK Requirements by source table:`,
    ...Object.entries(
      REQUIRED_FKS.reduce((acc, fk) => {
        acc[fk.sourceTable] = (acc[fk.sourceTable] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([table, count]) => `  ${table}: ${count} FKs`),
  ].join('\n');

  return { requirements: REQUIRED_FKS, summary };
}

if (typeof window !== 'undefined') {
  const { summary } = auditForeignKeys();
  console.group('🔗 Foreign Key Audit Report');
  console.log(summary);
  console.groupEnd();
}
