/**
 * useAuditedMutation - Wraps useIntegratedMutation with automatic audit trail logging
 * Every mutation automatically gets logged to system_audit_trail
 */

import { useIntegratedMutation } from "./useIntegratedMutation";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { EventType } from "@/lib/events/event-bus";
import type { EntityType } from "@/lib/domain/types";

interface AuditedMutationConfig<TInput, TOutput> {
  mutationFn: (input: TInput) => Promise<TOutput>;
  eventType: EventType;
  entityType: EntityType;
  module: string;
  actionType: "create" | "update" | "delete" | "approve" | "reject";
  getEntityId?: (output: TOutput) => string;
  getDescription?: (input: TInput, output: TOutput) => string;
  getChanges?: (input: TInput) => Record<string, { old: unknown; new: unknown }>;
  buildPayload?: (input: TInput, output: TOutput) => Record<string, unknown>;
  invalidateKeys?: string[][];
  successMessage?: string;
  errorMessage?: string;
}

export function useAuditedMutation<TInput, TOutput>(
  config: AuditedMutationConfig<TInput, TOutput>
) {
  return useIntegratedMutation<TInput, TOutput>({
    mutationFn: async (input: TInput) => {
      const result = await config.mutationFn(input);

      // Fire-and-forget audit trail entry
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await (supabase.from("system_audit_trail") as any).insert({
          user_id: user?.id,
          action_type: config.actionType,
          module: config.module,
          resource_type: config.entityType,
          resource_id: config.getEntityId?.(result),
          description: config.getDescription?.(input, result) || `${config.actionType} on ${config.entityType}`,
          changes: config.getChanges?.(input),
          metadata: { event_type: config.eventType, user_agent: navigator.userAgent },
          severity: config.actionType === "delete" ? "warning" : "info",
        });
      } catch (err) {
        logger.warn("[AuditedMutation] Audit log failed (non-blocking)", { error: String(err) });
      }

      return result;
    },
    eventType: config.eventType,
    entityType: config.entityType,
    getEntityId: config.getEntityId,
    buildPayload: config.buildPayload,
    invalidateKeys: config.invalidateKeys,
    successMessage: config.successMessage,
    errorMessage: config.errorMessage,
  });
}
