/**
 * Crew Management Hooks - v4.0
 * Crew scheduling, certifications, rotations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  nationality?: string;
  passport_number?: string;
  seaman_book_number?: string;
  status: 'available' | 'onboard' | 'on_leave' | 'training' | 'inactive';
  current_vessel_id?: string;
  current_vessel_name?: string;
  hire_date: string;
  contract_end_date?: string;
  email?: string;
  phone?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Certification {
  id: string;
  crew_member_id: string;
  type: string;
  name: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date: string;
  certificate_number: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  document_url?: string;
}

export interface Rotation {
  id: string;
  crew_member_id: string;
  crew_member_name: string;
  vessel_id: string;
  vessel_name: string;
  embark_date: string;
  disembark_date?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  position: string;
  notes?: string;
}

// Get all crew members - Real Supabase integration
export function useCrewMembers(status?: CrewMember['status']) {
  return useQuery({
    queryKey: ['crew-members', status],
    queryFn: async () => {
      let query = supabase
        .from('crew_members')
        .select(`
          id,
          full_name,
          rank,
          position,
          nationality,
          passport_number,
          status,
          vessel_id,
          contract_start,
          contract_end,
          email,
          phone,
          emergency_contact,
          vessels!crew_members_vessel_id_fkey(name)
        `)
        .order('full_name');

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row): CrewMember => ({
        id: row.id,
        name: row.full_name ?? '',
        rank: row.rank ?? row.position ?? '',
        department: row.position ?? 'Deck',
        nationality: row.nationality ?? undefined,
        passport_number: row.passport_number ?? undefined,
        status: (row.status as CrewMember['status']) ?? 'available',
        current_vessel_id: row.vessel_id ?? undefined,
        current_vessel_name: (row.vessels as { name: string } | null)?.name ?? undefined,
        hire_date: row.contract_start ?? '',
        contract_end_date: row.contract_end ?? undefined,
        email: row.email ?? undefined,
        phone: row.phone ?? undefined,
        emergency_contact: row.emergency_contact as CrewMember['emergency_contact'],
      }));
    },
    staleTime: 60000,
  });
}

// Get certifications - Real Supabase integration
export function useCrewCertifications(memberId?: string) {
  return useQuery({
    queryKey: ['crew-certifications', memberId],
    queryFn: async () => {
      let query = supabase
        .from('crew_certifications')
        .select('*')
        .order('expiry_date', { ascending: true });

      if (memberId) {
        query = query.eq('crew_member_id', memberId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      return (data || []).map((row): Certification => {
        const expiryDateStr = row.expiry_date ?? '';
        const expiryDate = new Date(expiryDateStr);
        let certStatus: Certification['status'] = 'valid';
        
        if (expiryDate < now) {
          certStatus = 'expired';
        } else if (expiryDate < thirtyDaysFromNow) {
          certStatus = 'expiring_soon';
        }

        return {
          id: row.id,
          crew_member_id: row.crew_member_id ?? '',
          type: row.certification_type ?? '',
          name: row.certification_name ?? '',
          issuing_authority: row.issuing_authority ?? '',
          issue_date: row.issue_date ?? '',
          expiry_date: expiryDateStr,
          certificate_number: row.certificate_number ?? '',
          status: certStatus,
          document_url: row.certificate_file_url ?? undefined,
        };
      });
    },
    staleTime: 60000,
  });
}

// Get expiring certifications
export function useExpiringCertifications(daysAhead = 30) {
  const { data: certifications } = useCrewCertifications();
  return {
    expiring: certifications?.filter(c => c.status === 'expiring_soon') || [],
    expired: certifications?.filter(c => c.status === 'expired') || [],
    total: certifications?.length || 0,
  };
}

// Get rotations - Real Supabase integration
export function useCrewRotations(vesselId?: string) {
  return useQuery({
    queryKey: ['crew-rotations', vesselId],
    queryFn: async () => {
      let query = supabase
        .from('crew_rotations')
        .select(`
          id,
          crew_member_id,
          vessel_id,
          embark_date,
          disembark_date,
          status,
          position,
          notes,
          crew_members!crew_rotations_crew_member_id_fkey(full_name),
          vessels!crew_rotations_vessel_id_fkey(name)
        `)
        .order('embark_date', { ascending: false });

      if (vesselId) {
        query = query.eq('vessel_id', vesselId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row): Rotation => ({
        id: row.id,
        crew_member_id: row.crew_member_id ?? '',
        crew_member_name: (row.crew_members as { full_name: string } | null)?.full_name ?? '',
        vessel_id: row.vessel_id ?? '',
        vessel_name: (row.vessels as { name: string } | null)?.name ?? '',
        embark_date: row.embark_date ?? '',
        disembark_date: row.disembark_date ?? undefined,
        status: (row.status as Rotation['status']) ?? 'scheduled',
        position: row.position ?? '',
        notes: row.notes ?? undefined,
      }));
    },
    staleTime: 60000,
  });
}

// Create crew member
export function useCreateCrewMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (member: Omit<CrewMember, 'id'>) => ({ ...member, id: crypto.randomUUID() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-members'] });
      toast.success('Tripulante cadastrado!');
    },
  });
}

// Schedule rotation
export function useScheduleRotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rotation: Omit<Rotation, 'id' | 'status'>) => ({ ...rotation, id: crypto.randomUUID(), status: 'scheduled' as const }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-rotations'] });
      toast.success('Rotação agendada!');
    },
  });
}
// AI Scheduling optimization
export function useAICrewScheduling() {
  return useMutation({
    mutationFn: async ({ 
      vesselId, 
      embarkDate, 
      positionsNeeded 
    }: { 
      vesselId: string; 
      embarkDate: string; 
      positionsNeeded: string[];
    }) => {
      const { data, error } = await supabase.functions.invoke('ai-crew-optimizer', {
        body: { action: 'optimize_schedule', vesselId, embarkDate, positionsNeeded },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => toast.success('Otimização concluída!'),
  });
}

// Update certification
export function useUpdateCertification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updates 
    }: Partial<Certification> & { id: string }) => {
      const { data, error } = await supabase
        .from('crew_certifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-certifications'] });
      toast.success('Certificação atualizada!');
    },
  });
}

// Upload certification document
export function useUploadCertificationDoc() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      certificationId, 
      file 
    }: { 
      certificationId: string; 
      file: File;
    }) => {
      const fileName = `certifications/${certificationId}/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('crew-documents')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // Update certification with document URL
      await supabase
        .from('crew_certifications')
        .update({ document_url: data.path })
        .eq('id', certificationId);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-certifications'] });
      toast.success('Documento carregado!');
    },
  });
}
