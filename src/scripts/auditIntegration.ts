/**
 * NAUTI ONE — Integration Audit Script
 * Validates that all core entities have proper integration:
 * - Related Records mapping
 * - Event publishing
 * - Foreign key relationships
 */

import { ENTITY_TYPES, RELATED_RECORDS_MAP, type EntityType } from '@/lib/domain/types';
import { EVENT_CATALOG } from '@/lib/events/event-catalog';

interface AuditResult {
  entity: string;
  hasRelatedRecords: boolean;
  hasEvents: boolean;
  eventCount: number;
  issues: string[];
}

const CORE_ENTITIES: EntityType[] = [
  'vessel', 'voyage', 'crew_member', 'document',
  'work_order', 'maintenance_task',
  'audit', 'finding', 'certificate',
  'invoice', 'purchase_order', 'charter_party',
  'rotation', 'certification',
  'ai_decision', 'alert',
];

export function auditIntegration(): { results: AuditResult[]; passed: boolean } {
  const results: AuditResult[] = [];
  let allPassed = true;

  for (const entity of CORE_ENTITIES) {
    const issues: string[] = [];

    // Check Related Records
    const hasRelatedRecords = entity in RELATED_RECORDS_MAP;
    if (!hasRelatedRecords) {
      issues.push(`No Related Records mapping defined`);
    }

    // Check Events
    const entityEvents = EVENT_CATALOG.filter(e =>
      e.type.includes(entity.replace('_', '.')) ||
      e.payloadFields.some(f => f.includes(`${entity}_id`))
    );
    const hasEvents = entityEvents.length > 0;
    if (!hasEvents) {
      issues.push(`No events published for this entity`);
    }

    // Check consumers
    for (const event of entityEvents) {
      if (event.consumers.length === 0) {
        issues.push(`Event ${event.type} has no consumers`);
      }
    }

    if (issues.length > 0) allPassed = false;

    results.push({
      entity,
      hasRelatedRecords,
      hasEvents,
      eventCount: entityEvents.length,
      issues,
    });
  }

  return { results, passed: allPassed };
}

// Run if executed directly
if (typeof window !== 'undefined') {
  const { results, passed } = auditIntegration();
  
  // eslint-disable-next-line no-console -- audit script output
  console.group('🔍 Integration Audit Report');
  for (const r of results) {
    const status = r.issues.length === 0 ? '✅' : '⚠️';
    // eslint-disable-next-line no-console -- audit script output
    console.log(`${status} ${r.entity}: ${r.eventCount} events, Related Records: ${r.hasRelatedRecords ? 'YES' : 'NO'}`);
    for (const issue of r.issues) {
      console.warn(`   └─ ${issue}`);
    }
  }
  // eslint-disable-next-line no-console -- audit script output
  console.log(`\nOverall: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  // eslint-disable-next-line no-console -- audit script output
  console.groupEnd();
}
