/**
 * Enterprise Document Management Hook
 * Superior to SoftExpert, Fluig, Unisea, TMmaster
 * All-in-one with AI integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  is_system: boolean;
  parent_id: string | null;
}

export interface EnterpriseDocument {
  id: string;
  organization_id: string | null;
  vessel_id: string | null;
  category_id: string | null;
  title: string;
  description: string | null;
  document_code: string | null;
  document_type: string;
  file_name: string;
  file_type: string | null;
  file_size: number;
  storage_path: string | null;
  file_url: string | null;
  version: string;
  version_number: number;
  is_latest: boolean;
  status: 'draft' | 'pending_review' | 'approved' | 'published' | 'archived' | 'obsolete';
  review_status: string;
  access_level: string;
  regulatory_reference: string[] | null;
  valid_from: string | null;
  valid_until: string | null;
  review_date: string | null;
  review_frequency: string | null;
  ai_summary: string | null;
  ai_keywords: string[] | null;
  ai_classification: string | null;
  tags: string[] | null;
  download_count: number;
  view_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  category?: DocumentCategory;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  template_type: string;
  content_html: string | null;
  content_json: Record<string, unknown> | null;
  template_fields: Record<string, unknown> | null;
  is_active: boolean;
  is_system: boolean;
  requires_approval: boolean;
  usage_count: number;
}

export interface Checklist {
  id: string;
  title: string;
  description: string | null;
  checklist_type: string;
  items: ChecklistItem[];
  total_items: number;
  completed_items: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completion_percentage: number;
  scheduled_date: string | null;
  due_date: string | null;
  assigned_to: string | null;
  vessel_id: string | null;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  is_required: boolean;
  is_completed: boolean;
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  attachments?: string[];
}

export interface UploadDocumentParams {
  file: File;
  title: string;
  description?: string;
  document_type: string;
  category_id?: string;
  vessel_id?: string;
  tags?: string[];
  regulatory_reference?: string[];
  valid_from?: string;
  valid_until?: string;
  review_frequency?: string;
}

// Document Categories Hook
export function useDocumentCategories() {
  return useQuery({
    queryKey: ['document-categories'],
    queryFn: async (): Promise<DocumentCategory[]> => {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []) as DocumentCategory[];
    }
  });
}

// Enterprise Documents Hook
export function useEnterpriseDocuments(filters?: {
  category_id?: string;
  document_type?: string;
  status?: string;
  vessel_id?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['enterprise-documents', filters],
    queryFn: async (): Promise<EnterpriseDocument[]> => {
      let query = supabase
        .from('enterprise_documents')
        .select(`
          *,
          category:document_categories(id, name, slug, icon, color, description, is_system, parent_id)
        `)
        .is('deleted_at', null)
        .eq('is_latest', true)
        .order('created_at', { ascending: false });

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.document_type) {
        query = query.eq('document_type', filters.document_type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.vessel_id) {
        query = query.eq('vessel_id', filters.vessel_id);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        file_size: item.file_size || 0,
        version: item.version || '1.0',
        version_number: item.version_number || 1,
        is_latest: item.is_latest ?? true,
        status: (item.status || 'draft') as EnterpriseDocument['status'],
        download_count: item.download_count || 0,
        view_count: item.view_count || 0,
        category: item.category ? {
          ...item.category,
          description: item.category.description || null,
          is_system: item.category.is_system ?? false,
          parent_id: item.category.parent_id || null
        } as DocumentCategory : undefined
      })) as EnterpriseDocument[];
    }
  });
}

// Document Templates Hook
export function useDocumentTemplates(template_type?: string) {
  return useQuery({
    queryKey: ['document-templates-enterprise', template_type],
    queryFn: async (): Promise<DocumentTemplate[]> => {
      let query = supabase
        .from('document_templates_enterprise')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (template_type) {
        query = query.eq('template_type', template_type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as DocumentTemplate[];
    }
  });
}

// Enterprise Checklists Hook
export function useEnterpriseChecklists(filters?: {
  checklist_type?: string;
  status?: string;
  vessel_id?: string;
}) {
  return useQuery({
    queryKey: ['enterprise-checklists', filters],
    queryFn: async (): Promise<Checklist[]> => {
      let query = supabase
        .from('enterprise_checklists')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.checklist_type) {
        query = query.eq('checklist_type', filters.checklist_type);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.vessel_id) {
        query = query.eq('vessel_id', filters.vessel_id);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        checklist_type: item.checklist_type,
        items: (Array.isArray(item.items) ? item.items : []) as unknown as ChecklistItem[],
        total_items: item.total_items || 0,
        completed_items: item.completed_items || 0,
        status: (item.status || 'pending') as Checklist['status'],
        completion_percentage: Number(item.completion_percentage) || 0,
        scheduled_date: item.scheduled_date,
        due_date: item.due_date,
        assigned_to: item.assigned_to,
        vessel_id: item.vessel_id,
        created_at: item.created_at || new Date().toISOString()
      }));
    }
  });
}

// Training Documents Hook
export function useTrainingDocuments(course_id?: string) {
  return useQuery({
    queryKey: ['training-documents', course_id],
    queryFn: async () => {
      let query = supabase
        .from('training_documents')
        .select(`
          *,
          document:enterprise_documents(id, title, file_name, file_url, storage_path)
        `)
        .order('module_number');

      if (course_id) {
        query = query.eq('course_id', course_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    }
  });
}

// Upload Document Mutation
export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: UploadDocumentParams): Promise<EnterpriseDocument> => {
      const { file, title, description, document_type, category_id, vessel_id, tags, regulatory_reference, valid_from, valid_until, review_frequency } = params;

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${fileExt}`;
      const storagePath = `enterprise-documents/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);

      // Generate document code
      const docCode = `DOC-${Date.now().toString(36).toUpperCase()}`;

      // Insert document record
      const { data, error } = await supabase
        .from('enterprise_documents')
        .insert({
          title,
          description,
          document_type,
          document_code: docCode,
          category_id,
          vessel_id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          file_url: urlData.publicUrl,
          tags,
          regulatory_reference,
          valid_from,
          valid_until,
          review_frequency,
          status: 'draft',
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as EnterpriseDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-documents'] });
      toast.success('Documento enviado com sucesso!');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar documento');
    }
  });
}

// Update Document Mutation
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EnterpriseDocument> }) => {
      const { data, error } = await supabase
        .from('enterprise_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-documents'] });
      toast.success('Documento atualizado!');
    }
  });
}

// Delete Document Mutation (soft delete)
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('enterprise_documents')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-documents'] });
      toast.success('Documento removido!');
    }
  });
}

// Create Checklist Mutation
export function useCreateChecklist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description?: string;
      checklist_type: string;
      items: ChecklistItem[];
      vessel_id?: string;
      due_date?: string;
      assigned_to?: string;
    }) => {
      const { data, error } = await supabase
        .from('enterprise_checklists')
        .insert([{
          title: params.title,
          description: params.description || null,
          checklist_type: params.checklist_type,
          items: JSON.parse(JSON.stringify(params.items)),
          total_items: params.items.length,
          completed_items: 0,
          vessel_id: params.vessel_id || null,
          due_date: params.due_date || null,
          assigned_to: params.assigned_to || null,
          status: 'pending',
          created_by: user?.id || null
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-checklists'] });
      toast.success('Checklist criado com sucesso!');
    }
  });
}

// Update Checklist Mutation
export function useUpdateChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from('enterprise_checklists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-checklists'] });
    }
  });
}

// Log Document Access
export function useLogDocumentAccess() {
  return useMutation({
    mutationFn: async ({ document_id, action }: { document_id: string; action: string }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;
      
      const { error } = await supabase
        .from('document_access_logs')
        .insert({
          document_id,
          action,
          user_id: userId
        });

      if (error) {
        console.error('Failed to log document access:', error);
      }
    }
  });
}

// Document Types
export const DOCUMENT_TYPES = [
  { value: 'manual', label: 'Manual', icon: 'book-open' },
  { value: 'procedure', label: 'Procedimento', icon: 'clipboard-list' },
  { value: 'policy', label: 'Política', icon: 'shield' },
  { value: 'checklist', label: 'Checklist', icon: 'check-square' },
  { value: 'form', label: 'Formulário', icon: 'file-text' },
  { value: 'certificate', label: 'Certificado', icon: 'award' },
  { value: 'contract', label: 'Contrato', icon: 'file-signature' },
  { value: 'training_material', label: 'Material de Treinamento', icon: 'graduation-cap' },
  { value: 'report', label: 'Relatório', icon: 'bar-chart' },
  { value: 'compliance', label: 'Compliance', icon: 'shield-check' },
  { value: 'safety', label: 'Segurança', icon: 'alert-triangle' },
  { value: 'hr', label: 'RH', icon: 'users' },
  { value: 'other', label: 'Outro', icon: 'file' }
];

// Regulatory References
export const REGULATORY_REFERENCES = [
  'MLC 2006',
  'STCW',
  'ISM Code',
  'ISPS Code',
  'MARPOL',
  'SOLAS',
  'ISO 9001',
  'ISO 14001',
  'ISO 45001',
  'OCIMF SIRE',
  'OCIMF TMSA',
  'CDI-M',
  'OVID',
  'NR-30',
  'NR-33',
  'NR-35',
  'ANVISA RDC',
  'IMO Conventions'
];

// Review Frequencies
export const REVIEW_FREQUENCIES = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semi-annual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
  { value: 'biennial', label: 'Bienal' }
];
