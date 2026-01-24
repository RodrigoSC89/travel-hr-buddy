/**
 * Hook for fetching Maritime HR data from Supabase
 * Replaces mock crew data with real database queries
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CrewMember {
  id: string;
  name: string;
  rank: string;
  nationality: string;
  vessel?: string;
  status: "onboard" | "on_leave" | "available" | "training" | "medical_leave";
  email?: string;
  phone?: string;
  contract_start?: string;
  contract_end?: string;
}

export interface Certification {
  id: string;
  crew_member_id: string;
  name: string;
  type: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
  certificate_number: string;
  status: "valid" | "expiring" | "expired";
}

export function useCrewMembers() {
  return useQuery({
    queryKey: ['crew-members'],
    queryFn: async (): Promise<CrewMember[]> => {
      const { data, error } = await supabase
        .from('crew_members')
        .select(`
          id,
          full_name,
          rank,
          nationality,
          email,
          phone,
          status,
          vessel_id,
          vessels(name)
        `)
        .order('full_name', { ascending: true });

      if (error) throw error;

      return (data || []).map(crew => ({
        id: crew.id,
        name: crew.full_name || 'Unknown',
        rank: crew.rank || 'Unknown',
        nationality: crew.nationality || 'Unknown',
        vessel: (crew.vessels as any)?.name,
        status: (crew.status as any) || 'available',
        email: crew.email || undefined,
        phone: crew.phone || undefined
      }));
    }
  });
}

export function useCrewCertifications(crewMemberId?: string) {
  return useQuery({
    queryKey: ['crew-certifications', crewMemberId],
    queryFn: async (): Promise<Certification[]> => {
      let query = supabase
        .from('crew_certifications')
        .select('*')
        .order('expiry_date', { ascending: true });

      if (crewMemberId) {
        query = query.eq('crew_member_id', crewMemberId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      return (data || []).map(cert => {
        const expiryDateStr = cert.expiry_date || new Date().toISOString();
        const expiryDate = new Date(expiryDateStr);
        let status: 'valid' | 'expiring' | 'expired' = 'valid';
        
        if (expiryDate < now) {
          status = 'expired';
        } else if (expiryDate < thirtyDaysFromNow) {
          status = 'expiring';
        }

        return {
          id: cert.id,
          crew_member_id: cert.crew_member_id,
          name: cert.certification_name || cert.certification_type,
          type: cert.certification_type,
          issue_date: cert.issue_date || '',
          expiry_date: expiryDateStr,
          issuing_authority: cert.issuing_authority || 'Unknown',
          certificate_number: cert.certificate_number || '',
          status
        };
      });
    },
    enabled: true
  });
}

export function useCrewStats() {
  return useQuery({
    queryKey: ['crew-stats'],
    queryFn: async () => {
      const { data: crew, error } = await supabase
        .from('crew_members')
        .select('id, status');

      if (error) throw error;

      const total = crew?.length || 0;
      const onboard = crew?.filter(c => c.status === 'onboard').length || 0;
      const onLeave = crew?.filter(c => c.status === 'on_leave').length || 0;
      const available = crew?.filter(c => c.status === 'available').length || 0;

      return { total, onboard, onLeave, available };
    }
  });
}
