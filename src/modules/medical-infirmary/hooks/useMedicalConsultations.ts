/**
 * Hook for Medical Consultations - Sistema de Atendimentos
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VitalSigns {
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
}

export interface PrescribedMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface MedicalConsultation {
  id: string;
  crew_member_id?: string;
  crew_member_name: string;
  consultation_type: 'consultation' | 'emergency' | 'routine' | 'telemedicine' | 'first_aid';
  chief_complaint: string;
  symptoms: string[];
  vital_signs: VitalSigns;
  diagnosis?: string;
  treatment?: string;
  prescribed_medications: PrescribedMedication[];
  ai_suggestions: string[];
  follow_up_date?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'referred' | 'monitoring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  attending_officer?: string;
  attending_officer_id?: string;
  notes?: string;
  vessel_id?: string;
  created_at: string;
  updated_at: string;
}

export function useMedicalConsultations(filters?: { status?: string; severity?: string }) {
  return useQuery({
    queryKey: ['medical-consultations', filters],
    queryFn: async (): Promise<MedicalConsultation[]> => {
      let query = supabase
        .from('medical_consultations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(row => ({
        id: row.id,
        crew_member_id: row.crew_member_id || undefined,
        crew_member_name: row.crew_member_name,
        consultation_type: row.consultation_type as MedicalConsultation['consultation_type'],
        chief_complaint: row.chief_complaint,
        symptoms: (row.symptoms as string[]) || [],
        vital_signs: (row.vital_signs as VitalSigns) || {},
        diagnosis: row.diagnosis || undefined,
        treatment: row.treatment || undefined,
        prescribed_medications: Array.isArray(row.prescribed_medications) ? (row.prescribed_medications as unknown as PrescribedMedication[]) : [],
        ai_suggestions: (row.ai_suggestions as string[]) || [],
        follow_up_date: row.follow_up_date || undefined,
        status: row.status as MedicalConsultation['status'],
        severity: row.severity as MedicalConsultation['severity'],
        attending_officer: row.attending_officer || undefined,
        attending_officer_id: row.attending_officer_id || undefined,
        notes: row.notes || undefined,
        vessel_id: row.vessel_id || undefined,
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at || new Date().toISOString()
      }));
    },
    staleTime: 2 * 60 * 1000
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consultation: Omit<MedicalConsultation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('medical_consultations')
        .insert({
          crew_member_name: consultation.crew_member_name,
          consultation_type: consultation.consultation_type,
          chief_complaint: consultation.chief_complaint,
          symptoms: consultation.symptoms as unknown as Record<string, unknown>,
          vital_signs: consultation.vital_signs as unknown as Record<string, unknown>,
          diagnosis: consultation.diagnosis || null,
          treatment: consultation.treatment || null,
          prescribed_medications: consultation.prescribed_medications as unknown as Record<string, unknown>,
          ai_suggestions: consultation.ai_suggestions as unknown as Record<string, unknown>,
          follow_up_date: consultation.follow_up_date || null,
          status: consultation.status || 'pending',
          severity: consultation.severity || 'low',
          attending_officer: consultation.attending_officer || null,
          attending_officer_id: user?.id || null,
          notes: consultation.notes || null,
          vessel_id: consultation.vessel_id || null
        } as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-consultations'] });
      toast.success('Atendimento registrado com sucesso');
    },
    onError: () => toast.error('Erro ao registrar atendimento')
  });
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MedicalConsultation> & { id: string }) => {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (updates.status) updateData.status = updates.status;
      if (updates.diagnosis) updateData.diagnosis = updates.diagnosis;
      if (updates.treatment) updateData.treatment = updates.treatment;
      if (updates.notes) updateData.notes = updates.notes;
      if (updates.severity) updateData.severity = updates.severity;

      const { data, error } = await supabase
        .from('medical_consultations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-consultations'] });
      toast.success('Atendimento atualizado');
    },
    onError: () => toast.error('Erro ao atualizar atendimento')
  });
}

export function useConsultationStats() {
  return useQuery({
    queryKey: ['consultation-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_consultations')
        .select('status, severity, consultation_type, created_at');

      if (error) throw error;

      const records = data || [];
      const stats = {
        total: records.length,
        pending: records.filter(c => c.status === 'pending').length,
        inProgress: records.filter(c => c.status === 'in_progress').length,
        resolved: records.filter(c => c.status === 'resolved').length,
        emergencies: records.filter(c => c.consultation_type === 'emergency').length,
        critical: records.filter(c => c.severity === 'critical').length,
        thisMonth: records.filter(c => {
          if (!c.created_at) return false;
          const date = new Date(c.created_at);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length
      };

      return stats;
    },
    staleTime: 5 * 60 * 1000
  });
}
