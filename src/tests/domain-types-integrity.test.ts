/**
 * Domain Types & Entity Integrity Test
 * Validates that ENTITY_TYPES, ENTITY_DOMAIN_MAP, and RELATED_RECORDS_MAP are consistent
 */
import { describe, it, expect } from "vitest";
import { ENTITY_TYPES, ENTITY_DOMAIN_MAP, DOMAINS, RELATED_RECORDS_MAP } from "@/lib/domain/types";
import type { EntityType, Domain } from "@/lib/domain/types";

describe("Domain Types Integrity", () => {
  const allEntityTypes = Object.values(ENTITY_TYPES) as EntityType[];
  const allDomains = Object.values(DOMAINS) as Domain[];

  it("every ENTITY_TYPE should have a domain mapping", () => {
    const unmapped: string[] = [];
    for (const et of allEntityTypes) {
      if (!(et in ENTITY_DOMAIN_MAP)) {
        unmapped.push(et);
      }
    }
    expect(unmapped).toEqual([]);
  });

  it("every domain mapping should reference a valid domain", () => {
    const invalidDomains: string[] = [];
    for (const [entity, domain] of Object.entries(ENTITY_DOMAIN_MAP)) {
      if (!allDomains.includes(domain as Domain)) {
        invalidDomains.push(`${entity} -> ${domain}`);
      }
    }
    expect(invalidDomains).toEqual([]);
  });

  it("RELATED_RECORDS_MAP should only reference valid entity types", () => {
    const invalidRefs: string[] = [];
    for (const [parent, configs] of Object.entries(RELATED_RECORDS_MAP)) {
      if (!allEntityTypes.includes(parent as EntityType)) {
        invalidRefs.push(`Parent: ${parent}`);
      }
      for (const config of configs ?? []) {
        if (!allEntityTypes.includes(config.entityType)) {
          invalidRefs.push(`${parent} -> ${config.entityType}`);
        }
      }
    }
    expect(invalidRefs).toEqual([]);
  });

  it("should have at least 30 entity types", () => {
    expect(allEntityTypes.length).toBeGreaterThanOrEqual(30);
  });

  it("should have all 9 domains", () => {
    expect(allDomains.length).toBe(9);
  });
});
