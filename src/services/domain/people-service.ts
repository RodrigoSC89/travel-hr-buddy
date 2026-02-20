/**
 * NAUTI ONE — People Domain Service
 */

import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { publishEvent } from "@/lib/events/event-bus";

export const PeopleService = {
  async publishRotation(rotationId: string) {
    const { data, error } = await fromUntyped('crew_rotations')
      .update({ status: 'published' })
      .eq('id', rotationId)
      .select()
      .single();
    if (error) throw error;

    await publishEvent({
      type: 'people.rotation.published',
      payload: {
        rotation_id: data.id,
        vessel_id: data.vessel_id,
        start_date: data.start_date,
        end_date: data.end_date,
      },
      sourceEntityType: 'rotation',
      sourceEntityId: data.id,
    });

    return data;
  },

  async checkExpiringCertifications(daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await fromUntyped('crew_certifications')
      .select('*, crew_members(full_name, vessel_id)')
      .lte('expiry_date', futureDate.toISOString())
      .gte('expiry_date', new Date().toISOString());

    if (error) throw error;

    // Publish events for each expiring cert
    for (const cert of data ?? []) {
      const daysRemaining = Math.ceil(
        (new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      await publishEvent({
        type: 'people.certification.expiring',
        payload: {
          certification_id: cert.id,
          crew_id: cert.crew_member_id,
          cert_type: cert.certification_type,
          expiry_date: cert.expiry_date,
          days_remaining: daysRemaining,
        },
        sourceEntityType: 'certification',
        sourceEntityId: cert.id,
      });
    }

    return data ?? [];
  },
};
