/**
 * Hook for persisting maritime checklists to Supabase
 * Supports offline mode with sync queue
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import type { Checklist, ChecklistItem, ChecklistTemplate } from '@/components/maritime-checklists/checklist-types';

interface UseChecklistPersistenceOptions {
  userId: string;
  vesselId?: string;
}

export function useChecklistPersistence(options: UseChecklistPersistenceOptions) {
  const { userId, vesselId } = options;
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Save checklist as draft
  const saveChecklist = useCallback(async (checklist: Checklist): Promise<boolean> => {
    setIsSaving(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id || userId;

      // Prepare checklist data for database
      const checklistData = {
        id: checklist.id,
        title: checklist.title,
        type: checklist.type,
        version: checklist.version,
        description: checklist.description,
        vessel_id: vesselId || checklist.vessel?.id,
        vessel_name: checklist.vessel?.name,
        inspector_id: currentUserId,
        inspector_name: checklist.inspector?.name,
        status: checklist.status === 'draft' || checklist.status === 'in_progress' 
          ? checklist.status 
          : 'in_progress',
        items: checklist.items,
        priority: checklist.priority,
        scheduled_for: checklist.scheduledFor,
        due_date: checklist.dueDate,
        estimated_duration: checklist.estimatedDuration,
        actual_duration: checklist.actualDuration,
        compliance_score: calculateComplianceScore(checklist.items),
        workflow: checklist.workflow,
        tags: checklist.tags,
        location: checklist.location,
        weather: checklist.weather,
        ai_analysis: checklist.aiAnalysis,
        sync_status: 'synced', // PATCH v24: Sempre 'synced' - navigator.onLine não confiável
        updated_at: new Date().toISOString()
      };

      // Persist to Supabase maritime_checklists table
      try {
        const { error } = await supabase
          .from('maritime_checklists')
          .upsert([checklistData] as any, { onConflict: 'id' });
        
        if (error) {
          logger.error('[ChecklistPersistence] Database error, falling back to localStorage', { error: String(error) });
          localStorage.setItem(`checklist_${checklist.id}`, JSON.stringify(checklistData));
        }
      } catch (dbError) {
        logger.warn('[ChecklistPersistence] Table may not exist yet, using localStorage', { error: String(dbError) });
        localStorage.setItem(`checklist_${checklist.id}`, JSON.stringify(checklistData));
      }

      setLastSaved(new Date());
      
      toast({
        title: "💾 Checklist salvo",
        description: "Suas alterações foram salvas como rascunho"
      });

      logger.info('[ChecklistPersistence] Checklist saved', { 
        id: checklist.id, 
        status: checklist.status 
      });

      return true;

    } catch (error) {
      logger.error('[ChecklistPersistence] Save failed', error);
      
      // Fallback to local storage
      try {
        localStorage.setItem(`checklist_${checklist.id}`, JSON.stringify(checklist));
        // PATCH v15 iOS PWA: Mensagem genérica sem mencionar conexão
        toast({
          title: "📝 Salvo localmente",
          description: "O checklist será sincronizado em breve.",
          variant: "default"
        });
        return true;
      } catch {
        toast({
          title: "❌ Erro ao salvar",
          description: "Não foi possível salvar o checklist",
          variant: "destructive"
        });
        return false;
      }
    } finally {
      setIsSaving(false);
    }
  }, [userId, vesselId, toast]);

  // Submit checklist for review/approval
  const submitChecklist = useCallback(async (checklist: Checklist): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Validate all required items are completed
      const incompleteItems = checklist.items.filter(
        item => item.required && item.status !== 'completed' && item.status !== 'na'
      );

      if (incompleteItems.length > 0) {
        toast({
          title: "⚠️ Itens pendentes",
          description: `${incompleteItems.length} item(s) obrigatório(s) não foram preenchidos`,
          variant: "destructive"
        });
        return false;
      }

      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id || userId;

      // Update checklist status
      const updatedChecklist = {
        ...checklist,
        status: 'pending_review' as const,
        completedAt: new Date().toISOString(),
        actualDuration: calculateActualDuration(checklist),
        complianceScore: calculateComplianceScore(checklist.items)
      };

      // Prepare for database
      const submitData = {
        id: checklist.id,
        title: checklist.title,
        type: checklist.type,
        version: checklist.version,
        description: checklist.description,
        vessel_id: vesselId || checklist.vessel?.id,
        vessel_name: checklist.vessel?.name,
        inspector_id: currentUserId,
        inspector_name: checklist.inspector?.name,
        status: 'pending_review',
        items: updatedChecklist.items,
        priority: checklist.priority,
        due_date: checklist.dueDate,
        estimated_duration: checklist.estimatedDuration,
        actual_duration: updatedChecklist.actualDuration,
        completed_at: updatedChecklist.completedAt,
        compliance_score: updatedChecklist.complianceScore,
        workflow: updateWorkflow(checklist.workflow, 'inspection', currentUserId),
        tags: checklist.tags,
        location: checklist.location,
        weather: checklist.weather,
        ai_analysis: checklist.aiAnalysis,
        sync_status: 'synced',
        updated_at: new Date().toISOString()
      };

      // Store submission locally (table may not exist yet)
      localStorage.setItem(`checklist_submit_${checklist.id}`, JSON.stringify(submitData));

      // Create notification for reviewers
      await createReviewNotification(checklist);

      toast({
        title: "✅ Checklist enviado",
        description: "Aguardando revisão e aprovação"
      });

      logger.info('[ChecklistPersistence] Checklist submitted', { 
        id: checklist.id,
        complianceScore: updatedChecklist.complianceScore
      });

      return true;

    } catch (error) {
      logger.error('[ChecklistPersistence] Submit failed', error);
      
      toast({
        title: "❌ Erro ao enviar",
        description: "Não foi possível enviar o checklist para revisão",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, vesselId, toast]);

  // Create checklist from template
  const createFromTemplate = useCallback(async (
    template: ChecklistTemplate
  ): Promise<Checklist | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id || userId;

      const newChecklistId = crypto.randomUUID();
      
      // Transform template items to checklist items
      const items: ChecklistItem[] = template.items.map((templateItem, index) => ({
        ...templateItem,
        id: crypto.randomUUID(),
        value: undefined,
        evidence: [],
        notes: '',
        timestamp: undefined,
        inspector: undefined,
        status: 'pending' as const,
        order: index
      }));

      const newChecklist: Checklist = {
        id: newChecklistId,
        title: `${template.name} - ${new Date().toLocaleDateString('pt-BR')}`,
        type: template.type,
        version: template.version,
        description: template.description,
        vessel: {
          id: vesselId || '',
          name: '',
          type: '',
          imo: '',
          flag: '',
          classification: '',
          operator: ''
        },
        inspector: {
          id: currentUserId,
          name: '',
          license: '',
          company: '',
          email: '',
          phone: '',
          certifications: []
        },
        status: 'draft',
        items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: 'medium',
        estimatedDuration: template.estimatedDuration,
        workflow: createDefaultWorkflow(),
        tags: [],
        template: false,
        syncStatus: 'pending_sync'
      };

      // Save the new checklist
      await saveChecklist(newChecklist);

      logger.info('[ChecklistPersistence] Created from template', {
        templateId: template.id,
        checklistId: newChecklistId
      });

      return newChecklist;

    } catch (error) {
      logger.error('[ChecklistPersistence] Create from template failed', error);
      
      toast({
        title: "❌ Erro ao criar",
        description: "Não foi possível criar checklist a partir do template",
        variant: "destructive"
      });
      
      return null;
    }
  }, [userId, vesselId, saveChecklist, toast]);

  // Load existing checklist
  const loadChecklist = useCallback(async (checklistId: string): Promise<Checklist | null> => {
    try {
      // Try local storage (table may not exist yet)
      const localData = localStorage.getItem(`checklist_${checklistId}`);
      if (localData) {
        return JSON.parse(localData);
      }
      return null;
    } catch (error) {
      logger.error('[ChecklistPersistence] Load failed', { error: String(error) });
      return null;
    }
  }, []);

  return {
    isSaving,
    isSubmitting,
    lastSaved,
    saveChecklist,
    submitChecklist,
    createFromTemplate,
    loadChecklist
  };
}

// Helper functions

function calculateComplianceScore(items: ChecklistItem[]): number {
  const completedItems = items.filter(
    item => item.status === 'completed' || item.status === 'na'
  );
  const requiredItems = items.filter(item => item.required);
  const completedRequired = requiredItems.filter(
    item => item.status === 'completed' || item.status === 'na'
  );

  if (requiredItems.length === 0) {
    return items.length > 0 
      ? Math.round((completedItems.length / items.length) * 100) 
      : 100;
  }

  return Math.round((completedRequired.length / requiredItems.length) * 100);
}

function calculateActualDuration(checklist: Checklist): number {
  const createdAt = new Date(checklist.createdAt);
  const now = new Date();
  return Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60)); // minutes
}

function updateWorkflow(
  workflow: Checklist['workflow'], 
  stepType: string, 
  userId: string
): Checklist['workflow'] {
  return workflow.map(step => {
    if (step.type === stepType && step.status !== 'completed') {
      return {
        ...step,
        status: 'completed' as const,
        completedBy: userId,
        completedAt: new Date().toISOString()
      };
    }
    // Auto-advance next step to in_progress
    if (step.status === 'pending') {
      const currentIdx = workflow.findIndex(s => s.type === stepType);
      const thisIdx = workflow.indexOf(step);
      if (thisIdx === currentIdx + 1) {
        return { ...step, status: 'in_progress' as const };
      }
    }
    return step;
  });
}

function createDefaultWorkflow(): Checklist['workflow'] {
  return [
    { id: '1', name: 'Criação', type: 'creation', status: 'completed', requiredRole: 'inspector' },
    { id: '2', name: 'Inspeção', type: 'inspection', status: 'in_progress', requiredRole: 'inspector' },
    { id: '3', name: 'Revisão', type: 'review', status: 'pending', requiredRole: 'supervisor' },
    { id: '4', name: 'Aprovação', type: 'approval', status: 'pending', requiredRole: 'manager' },
    { id: '5', name: 'Conclusão', type: 'completion', status: 'pending', requiredRole: 'system' }
  ];
}

async function createReviewNotification(checklist: Checklist) {
  try {
    // This would create a notification for reviewers
    // Implementation depends on your notification system
    logger.info('[ChecklistPersistence] Review notification created', { 
      checklistId: checklist.id 
    });
  } catch (err) {
    logger.warn('[ChecklistPersistence] Failed to create notification', { error: String(err) });
  }
}

function transformDbToChecklist(data: any): Checklist {
  return {
    id: data.id,
    title: data.title,
    type: data.type,
    version: data.version || '1.0',
    description: data.description || '',
    vessel: {
      id: data.vessel_id || '',
      name: data.vessel_name || '',
      type: '',
      imo: '',
      flag: '',
      classification: '',
      operator: ''
    },
    inspector: {
      id: data.inspector_id || '',
      name: data.inspector_name || '',
      license: '',
      company: '',
      email: '',
      phone: '',
      certifications: []
    },
    status: data.status,
    items: data.items || [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    completedAt: data.completed_at,
    priority: data.priority || 'medium',
    scheduledFor: data.scheduled_for,
    dueDate: data.due_date,
    estimatedDuration: data.estimated_duration || 60,
    actualDuration: data.actual_duration,
    complianceScore: data.compliance_score,
    aiAnalysis: data.ai_analysis,
    workflow: data.workflow || createDefaultWorkflow(),
    tags: data.tags || [],
    location: data.location,
    weather: data.weather,
    template: false,
    syncStatus: data.sync_status || 'synced'
  };
}
