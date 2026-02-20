/**
 * NAUTI ONE — Documents Domain Service
 * Universal document linking via entity_documents
 */

import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { publishEvent } from "@/lib/events/event-bus";
import type { EntityType } from "@/lib/domain/types";

export const DocumentsService = {
  async linkDocument(params: {
    documentId: string;
    entityType: EntityType;
    entityId: string;
    purpose?: string;
    organizationId?: string;
  }) {
    const user = (await supabase.auth.getUser()).data.user;

    const { data, error } = await fromUntyped('entity_documents').insert({
      document_id: params.documentId,
      entity_type: params.entityType,
      entity_id: params.entityId,
      purpose: params.purpose,
      organization_id: params.organizationId,
      linked_by: user?.id,
    }).select().single();

    if (error) throw error;

    await publishEvent({
      type: 'document.linked',
      payload: {
        document_id: params.documentId,
        entity_type: params.entityType,
        entity_id: params.entityId,
        purpose: params.purpose,
        linked_by: user?.id,
      },
      sourceEntityType: 'document',
      sourceEntityId: params.documentId,
    });

    return data;
  },

  async getLinkedDocuments(entityType: EntityType, entityId: string) {
    const { data, error } = await fromUntyped('entity_documents')
      .select('*, ai_documents(*)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);
    if (error) throw error;
    return data ?? [];
  },

  async unlinkDocument(linkId: string) {
    const { error } = await fromUntyped('entity_documents').delete().eq('id', linkId);
    if (error) throw error;
  },
};
