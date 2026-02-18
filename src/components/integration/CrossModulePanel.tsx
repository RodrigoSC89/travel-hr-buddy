/**
 * NAUTI ONE — CrossModulePanel
 * Drop-in panel that shows Related Records + Quick Actions + Activity Feed
 * for any entity. Designed to be added to ANY page with minimal effort.
 */

import React from "react";
import { RelatedRecordsPanel } from "./RelatedRecordsPanel";
import { QuickActions } from "./QuickActions";
import { EventActivityFeed } from "./EventActivityFeed";
import type { EntityType } from "@/lib/domain/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Link2 } from "lucide-react";
import { useState } from "react";

interface CrossModulePanelProps {
  entityType: EntityType;
  entityId: string;
  vesselId?: string;
  showQuickActions?: boolean;
  showActivityFeed?: boolean;
  className?: string;
}

export function CrossModulePanel({
  entityType,
  entityId,
  vesselId,
  showQuickActions = true,
  showActivityFeed = true,
  className = "",
}: CrossModulePanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" />
            Integração Cross-Module
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 mt-2">
        {showQuickActions && (
          <QuickActions entityType={entityType} entityId={entityId} vesselId={vesselId} />
        )}
        <RelatedRecordsPanel
          entityType={entityType}
          entityId={entityId}
          vesselId={vesselId}
        />
        {showActivityFeed && (
          <EventActivityFeed
            entityType={entityType}
            entityId={entityId}
            limit={5}
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
