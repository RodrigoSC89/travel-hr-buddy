import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDebounce } from './use-debounce';
import { logger } from '@/lib/logger';

export interface OVIDInspection {
  id: string;
  vessel_name: string;
  imo_number: string;
  vessel_type: string;
  operator?: string;
  inspector_name: string;
  inspection_date: string;
  location?: string;
  status: 'in_progress' | 'completed' | 'cancelled';
  compliance_score: number;
  compliant_count: number;
  non_compliant_count: number;
  not_applicable_count: number;
  total_questions: number;
  created_at: string;
  updated_at?: string;
}

export interface OVIDAnswer {
  question_id: string;
  chapter_id: string;
  answer: 'yes' | 'no' | 'na' | null;
  observation: string;
}

export interface OVIDPhoto {
  id: string;
  question_id: string;
  file_path: string;
  file_name: string;
  caption?: string;
}

export function useOVIDInspection(inspectionId?: string) {
  const [inspection, setInspection] = useState<OVIDInspection | null>(null);
  const [answers, setAnswers] = useState<Record<string, OVIDAnswer>>({});
  const [photos, setPhotos] = useState<OVIDPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, OVIDAnswer>>({});
  
  const debouncedUpdates = useDebounce(pendingUpdates, 1000);

  // Load inspection data
  const loadInspection = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // Use dynamic table access for tables not yet in generated types
      const { data: inspData, error: inspError } = await (supabase.from as Function)('ovid_inspections')
        .select('*')
        .eq('id', id)
        .single();

      if (inspError) throw inspError;
      setInspection(inspData as OVIDInspection);

      const { data: ansData, error: ansError } = await (supabase.from as Function)('ovid_answers')
        .select('*')
        .eq('inspection_id', id);

      if (ansError) throw ansError;
      
      type AnswerRow = Record<string, unknown>;
      const answersMap: Record<string, OVIDAnswer> = {};
      (ansData || []).forEach((ans: AnswerRow) => {
        answersMap[ans.question_id as string] = {
          question_id: ans.question_id as string,
          chapter_id: ans.chapter_id as string,
          answer: ans.answer as OVIDAnswer['answer'],
          observation: (ans.observation as string) || '',
        };
      });
      setAnswers(answersMap);

      // Load photos
      const { data: photoData } = await (supabase.from as Function)('ovid_evidence_photos')
        .select('*')
        .eq('inspection_id', id);
      
      setPhotos((photoData || []) as OVIDPhoto[]);
    } catch (error) {
      logger.error('Error loading inspection:', error);
      toast.error('Erro ao carregar inspeção');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new inspection
  const createInspection = useCallback(async (data: {
    vessel_name: string;
    imo_number: string;
    vessel_type: string;
    inspector_name: string;
    inspection_date: string;
    operator?: string;
    location?: string;
    total_questions: number;
  }): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: newInsp, error } = await (supabase.from as Function)('ovid_inspections')
        .insert({
          ...data,
          user_id: user.user.id,
          status: 'in_progress',
        })
        .select()
        .single();

      if (error) throw error;
      setInspection(newInsp as OVIDInspection);
      toast.success('Inspeção criada com sucesso');
      return newInsp?.id || null;
    } catch (error) {
      logger.error('Error creating inspection:', error);
      toast.error('Erro ao criar inspeção');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update answer (with debounced auto-save)
  const updateAnswer = useCallback((questionId: string, chapterId: string, answer: OVIDAnswer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setPendingUpdates(prev => ({ ...prev, [questionId]: { ...answer, chapter_id: chapterId } }));
  }, []);

  // Save pending updates
  useEffect(() => {
    if (!inspection?.id || Object.keys(debouncedUpdates).length === 0) return;

    const saveAnswers = async () => {
      setIsSaving(true);
      try {
        const updates = Object.entries(debouncedUpdates).map(([qId, ans]) => ({
          inspection_id: inspection.id,
          question_id: qId,
          chapter_id: ans.chapter_id,
          answer: ans.answer,
          observation: ans.observation,
        }));

        const { error } = await (supabase.from as Function)('ovid_answers')
          .upsert(updates, { onConflict: 'inspection_id,question_id' });

        if (error) throw error;
        
        // Update inspection counts
        const compliant = Object.values(answers).filter(a => a.answer === 'yes').length;
        const nonCompliant = Object.values(answers).filter(a => a.answer === 'no').length;
        const notApplicable = Object.values(answers).filter(a => a.answer === 'na').length;
        const answered = compliant + nonCompliant + notApplicable;
        const score = answered > 0 ? Math.round(((compliant + notApplicable) / answered) * 100) : 0;

        await (supabase.from as Function)('ovid_inspections')
          .update({
            compliant_count: compliant,
            non_compliant_count: nonCompliant,
            not_applicable_count: notApplicable,
            compliance_score: score,
          })
          .eq('id', inspection.id);

        setPendingUpdates({});
      } catch (error) {
        logger.error('Error saving answers:', error);
      } finally {
        setIsSaving(false);
      }
    };

    saveAnswers();
  }, [debouncedUpdates, inspection?.id, answers]);

  // Complete inspection
  const completeInspection = useCallback(async () => {
    if (!inspection?.id) return false;
    
    try {
      const { error } = await (supabase.from as Function)('ovid_inspections')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', inspection.id);

      if (error) throw error;
      setInspection(prev => prev ? { ...prev, status: 'completed' } : null);
      toast.success('Inspeção finalizada!');
      return true;
    } catch (error) {
      logger.error('Error completing inspection:', error);
      toast.error('Erro ao finalizar inspeção');
      return false;
    }
  }, [inspection?.id]);

  // Load inspection history
  const loadHistory = useCallback(async (): Promise<OVIDInspection[]> => {
    try {
      const { data, error } = await (supabase.from as Function)('ovid_inspections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as OVIDInspection[];
    } catch (error) {
      logger.error('Error loading history:', error);
      return [];
    }
  }, []);

  // Upload photo evidence
  const uploadPhoto = useCallback(async (questionId: string, file: File): Promise<string | null> => {
    if (!inspection?.id) return null;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const filePath = `${user.user.id}/${inspection.id}/${questionId}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ovid-evidence')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await (supabase.from as Function)('ovid_evidence_photos')
        .insert({
          inspection_id: inspection.id,
          question_id: questionId,
          file_path: filePath,
          file_name: file.name,
        });

      if (dbError) throw dbError;
      
      setPhotos(prev => [...prev, {
        id: Date.now().toString(),
        question_id: questionId,
        file_path: filePath,
        file_name: file.name,
      }]);
      
      toast.success('Foto anexada');
      return filePath;
    } catch (error) {
      logger.error('Error uploading photo:', error);
      toast.error('Erro ao anexar foto');
      return null;
    }
  }, [inspection?.id]);

  // Get photos for question
  const getPhotosForQuestion = useCallback((questionId: string): OVIDPhoto[] => {
    return photos.filter(p => p.question_id === questionId);
  }, [photos]);

  // Load on mount if ID provided
  useEffect(() => {
    if (inspectionId) {
      loadInspection(inspectionId);
    }
  }, [inspectionId, loadInspection]);

  return {
    inspection,
    answers,
    photos,
    isLoading,
    isSaving,
    loadInspection,
    createInspection,
    updateAnswer,
    completeInspection,
    loadHistory,
    uploadPhoto,
    getPhotosForQuestion,
  };
}
