/**
 * NAUTI ONE — Integration Sidebar
 * Combines Related Records + Quick Actions + Activity Feed
 * Drop this into any detail page for instant cross-module integration
 */

import React from "react";
import { RelatedRecordsPanel } from "./RelatedRecordsPanel";
import { QuickActions } from "./QuickActions";
import { EventActivityFeed } from "./EventActivityFeed";
import type { EntityType } from "@/lib/domain/types";

interface IntegrationSidebarProps {
  entityType: EntityType;
  entityId: string;
  vesselId?: string;
  className?: string;
  showQuickActions?: boolean;
  showRelatedRecords?: boolean;
  showActivityFeed?: boolean;
}

export function IntegrationSidebar({
  entityType,
  entityId,
  vesselId,
  className,
  showQuickActions = true,
  showRelatedRecords = true,
  showActivityFeed = true,
}: IntegrationSidebarProps) {
  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      {showQuickActions && (
        <QuickActions
          entityType={entityType}
          entityId={entityId}
          vesselId={vesselId}
        />
      )}

      {showRelatedRecords && (
        <RelatedRecordsPanel
          entityType={entityType}
          entityId={entityId}
          vesselId={vesselId}
        />
      )}

      {showActivityFeed && (
        <EventActivityFeed
          entityType={entityType}
          entityId={entityId}
          title="Histórico de Eventos"
          limit={15}
        />
      )}
    </div>
  );
}
