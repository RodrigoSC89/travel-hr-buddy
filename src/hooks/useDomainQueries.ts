/**
 * NAUTI ONE — Domain Query Hooks
 * Standardized query hooks that go through Domain Services.
 * Ensures all reads use consistent query keys for cross-module invalidation.
 */

import { useQuery } from "@tanstack/react-query";
import {
  VesselsService,
  VoyagesService,
  MaintenanceService,
  FinanceService,
  DocumentsService,
  TrackingService,
  ComplianceService,
} from "@/services/domain";
import type { EntityType } from "@/lib/domain/types";

// ═══════════════════════════════════
// VESSELS
// ═══════════════════════════════════

export function useVessels(orgId?: string) {
  return useQuery({
    queryKey: ["vessels", orgId],
    queryFn: () => VesselsService.list(orgId),
    staleTime: 30_000,
  });
}

export function useVessel(id: string | undefined) {
  return useQuery({
    queryKey: ["vessels", id],
    queryFn: () => VesselsService.getById(id!),
    enabled: !!id,
  });
}

export function useVesselRelated(vesselId: string | undefined) {
  return useQuery({
    queryKey: ["related-records", "vessel", vesselId],
    queryFn: () => VesselsService.getRelatedRecords(vesselId!),
    enabled: !!vesselId,
    staleTime: 60_000,
  });
}

// ═══════════════════════════════════
// VOYAGES
// ═══════════════════════════════════

export function useVoyagesByVessel(vesselId: string | undefined) {
  return useQuery({
    queryKey: ["voyages", vesselId],
    queryFn: () => VoyagesService.listByVessel(vesselId!),
    enabled: !!vesselId,
  });
}

export function useVoyage(id: string | undefined) {
  return useQuery({
    queryKey: ["voyages", "detail", id],
    queryFn: () => VoyagesService.getById(id!),
    enabled: !!id,
  });
}

export function useVoyageCosts(voyageId: string | undefined) {
  return useQuery({
    queryKey: ["voyage-pnl", voyageId],
    queryFn: () => VoyagesService.getRelatedCosts(voyageId!),
    enabled: !!voyageId,
  });
}

// ═══════════════════════════════════
// MAINTENANCE
// ═══════════════════════════════════

export function useWorkOrdersByVessel(vesselId: string | undefined) {
  return useQuery({
    queryKey: ["work-orders", vesselId],
    queryFn: () => MaintenanceService.listByVessel(vesselId!),
    enabled: !!vesselId,
  });
}

// ═══════════════════════════════════
// TRACKING
// ═══════════════════════════════════

export function useVesselPositions(vesselId: string | undefined, limit = 100) {
  return useQuery({
    queryKey: ["tracking", "positions", vesselId],
    queryFn: () => TrackingService.getVesselPositions(vesselId!, limit),
    enabled: !!vesselId,
    refetchInterval: 60_000,
  });
}

// ═══════════════════════════════════
// FINANCE
// ═══════════════════════════════════

export function useVoyagePnL(voyageId: string | undefined) {
  return useQuery({
    queryKey: ["voyage-pnl", "detail", voyageId],
    queryFn: () => FinanceService.getVoyagePnL(voyageId!),
    enabled: !!voyageId,
  });
}

// ═══════════════════════════════════
// DOCUMENTS (cross-module)
// ═══════════════════════════════════

export function useLinkedDocuments(entityType: EntityType, entityId: string | undefined) {
  return useQuery({
    queryKey: ["entity-documents", entityType, entityId],
    queryFn: () => DocumentsService.getLinkedDocuments(entityType, entityId!),
    enabled: !!entityId,
  });
}

// ═══════════════════════════════════
// COMPLIANCE
// ═══════════════════════════════════

export function useExpiringCertificates(vesselId: string | undefined, daysAhead = 30) {
  return useQuery({
    queryKey: ["certificates", "expiring", vesselId, daysAhead],
    queryFn: () => ComplianceService.checkExpiringCertificates(vesselId!, daysAhead),
    enabled: !!vesselId,
    staleTime: 5 * 60_000,
  });
}
