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

// Get all crew members
export function useCrewMembers(status?: CrewMember['status']) {
  return useQuery({
    queryKey: ['crew-members', status],
    queryFn: async () => {
      // Mock data for now
      const mockMembers: CrewMember[] = [
        { id: '1', name: 'Carlos Silva', rank: 'Chief Engineer', department: 'Engine', status: 'onboard', current_vessel_name: 'OSV Atlântico', hire_date: '2020-01-15' },
        { id: '2', name: 'Ana Costa', rank: '2nd Officer', department: 'Deck', status: 'onboard', current_vessel_name: 'OSV Atlântico', hire_date: '2021-03-20' },
        { id: '3', name: 'Pedro Santos', rank: 'Master', department: 'Deck', status: 'on_leave', hire_date: '2018-06-10' },
      ];
      return status ? mockMembers.filter(m => m.status === status) : mockMembers;
    },
    staleTime: 60000,
  });
}

// Get certifications
export function useCrewCertifications(memberId?: string) {
  return useQuery({
    queryKey: ['crew-certifications', memberId],
    queryFn: async () => {
      const mockCerts: Certification[] = [
        { id: '1', crew_member_id: '1', type: 'STCW', name: 'STCW Basic Safety', issuing_authority: 'DPC', issue_date: '2023-01-01', expiry_date: '2028-01-01', certificate_number: 'STCW-001', status: 'valid' },
        { id: '2', crew_member_id: '1', type: 'Medical', name: 'Medical Certificate', issuing_authority: 'ANS', issue_date: '2024-01-01', expiry_date: '2025-02-15', certificate_number: 'MED-001', status: 'expiring_soon' },
      ];
      return memberId ? mockCerts.filter(c => c.crew_member_id === memberId) : mockCerts;
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

// Get rotations
export function useCrewRotations(vesselId?: string) {
  return useQuery({
    queryKey: ['crew-rotations', vesselId],
    queryFn: async () => {
      const mockRotations: Rotation[] = [
        { id: '1', crew_member_id: '1', crew_member_name: 'Carlos Silva', vessel_id: 'v1', vessel_name: 'OSV Atlântico', embark_date: '2024-12-01', status: 'active', position: 'Chief Engineer' },
      ];
      return mockRotations;
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

// AI Scheduling
export function useAICrewScheduling() {
  return useMutation({
    mutationFn: async ({ vesselId, embarkDate, positionsNeeded }: { vesselId: string; embarkDate: string; positionsNeeded: string[] }) => {
      const { data, error } = await supabase.functions.invoke('ai-crew-optimizer', {
        body: { action: 'optimize_schedule', vesselId, embarkDate, positionsNeeded },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => toast.success('Otimização concluída!'),
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
        body: {
          action: 'optimize_schedule',
          vesselId,
          embarkDate,
          positionsNeeded,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Otimização concluída!');
    },
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
