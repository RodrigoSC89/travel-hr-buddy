/**
 * NAUTI ONE — Event Consumer Audit Script
 * Validates every published event type has at least one consumer
 */

import { EVENT_CATALOG } from '@/lib/events/event-catalog';
import { EVENT_TYPES } from '@/lib/events/event-bus';

interface ConsumerAuditResult {
  eventType: string;
  domain: string;
  consumerCount: number;
  consumers: string[];
  hasConsumer: boolean;
}

export function auditEventConsumers(): { results: ConsumerAuditResult[]; passed: boolean; orphanedEvents: string[] } {
  const results: ConsumerAuditResult[] = [];
  const orphanedEvents: string[] = [];

  // Check all registered event types
  const allEventTypes = Object.keys(EVENT_TYPES);
  
  for (const eventType of allEventTypes) {
    const catalogEntry = EVENT_CATALOG.find(e => e.type === eventType);
    
    const result: ConsumerAuditResult = {
      eventType,
      domain: catalogEntry?.domain ?? 'unknown',
      consumerCount: catalogEntry?.consumers.length ?? 0,
      consumers: catalogEntry?.consumers ?? [],
      hasConsumer: (catalogEntry?.consumers.length ?? 0) > 0,
    };

    if (!result.hasConsumer) {
      orphanedEvents.push(eventType);
    }

    results.push(result);
  }

  // Check for catalog entries not in EVENT_TYPES
  const registeredTypes = new Set(allEventTypes);
  const undeclaredEvents = EVENT_CATALOG
    .filter(e => !registeredTypes.has(e.type))
    .map(e => e.type);

  if (undeclaredEvents.length > 0) {
    console.warn('Events in catalog but not in EVENT_TYPES:', undeclaredEvents);
  }

  return {
    results,
    passed: orphanedEvents.length === 0,
    orphanedEvents,
  };
}

if (typeof window !== 'undefined') {
  const { results, passed, orphanedEvents } = auditEventConsumers();

  console.group('📡 Event Consumer Audit Report');
  
  for (const r of results) {
    const status = r.hasConsumer ? '✅' : '❌';
    console.log(`${status} ${r.eventType} (${r.domain}): ${r.consumerCount} consumers`);
    if (r.consumers.length > 0) {
      for (const c of r.consumers) {
        console.log(`   └─ ${c}`);
      }
    }
  }

  console.log(`\nTotal events: ${results.length}`);
  console.log(`With consumers: ${results.filter(r => r.hasConsumer).length}`);
  console.log(`Orphaned: ${orphanedEvents.length}`);
  console.log(`\nOverall: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (orphanedEvents.length > 0) {
    console.warn('Orphaned events:', orphanedEvents);
  }
  
  console.groupEnd();
}
