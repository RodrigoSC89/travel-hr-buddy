/**
 * Hook para dados do Document Center
 * Usa tabela documents do Supabase (colunas: title, document_type, etc.)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  status: 'draft' | 'pending' | 'approved' | 'expired' | 'archived';
  version: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  uploadedBy?: string;
  uploadedByName?: string;
  fileUrl?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface DocumentStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  expired: number;
  archived: number;
  expiringIn30Days: number;
}

export interface DocumentCategory {
  name: string;
  count: number;
  icon: string;
}

export function useDocumentCenterData(options?: {
  category?: string;
  status?: string;
  search?: string;
  vesselId?: string;
}) {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ['documents-center', options],
    queryFn: async (): Promise<Document[]> => {
      // Use correct column names from documents table
      let query = supabase
        .from('documents')
        .select(`
          id,
          title,
          document_type,
          file_size,
          status,
          created_at,
          updated_at,
          expiry_date,
          uploaded_by,
          file_url,
          vessel_id,
          crew_member_id,
          content,
          mime_type
        `)
        .order('updated_at', { ascending: false });

      if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }

      if (options?.search) {
        query = query.ilike('title', `%${options.search}%`);
      }

      if (options?.vesselId) {
        query = query.eq('vessel_id', options.vesselId);
      }

      const { data, error } = await query.limit(200);
      if (error) throw error;

      return (data || []).map(doc => ({
        id: doc.id,
        name: doc.title || 'Untitled',
        type: doc.document_type || 'other',
        category: getCategoryFromType(doc.document_type),
        size: doc.file_size || 0,
        status: mapStatus(doc.status),
        version: '1.0',
        createdAt: doc.created_at || new Date().toISOString(),
        updatedAt: doc.updated_at || new Date().toISOString(),
        expiresAt: doc.expiry_date ?? undefined,
        uploadedBy: doc.uploaded_by ?? undefined,
        uploadedByName: undefined, // Would need join
        fileUrl: doc.file_url ?? undefined,
        tags: [],
        metadata: {},
      }));
    },
    staleTime: 2 * 60 * 1000,
  });

  const statsQuery = useQuery({
    queryKey: ['documents-stats'],
    queryFn: async (): Promise<DocumentStats> => {
      const { data, error } = await supabase
        .from('documents')
        .select('status, expiry_date');

      if (error) throw error;

      const docs = data || [];
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const expiringIn30Days = docs.filter(d => {
        if (!d.expiry_date) return false;
        const expiry = new Date(d.expiry_date);
        return expiry >= now && expiry <= thirtyDaysFromNow;
      }).length;

      return {
        total: docs.length,
        draft: docs.filter(d => d.status === 'draft').length,
        pending: docs.filter(d => d.status === 'pending' || d.status === 'pending_review').length,
        approved: docs.filter(d => d.status === 'approved' || d.status === 'active').length,
        expired: docs.filter(d => d.status === 'expired').length,
        archived: docs.filter(d => d.status === 'archived').length,
        expiringIn30Days,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const categoriesQuery = useQuery({
    queryKey: ['documents-categories'],
    queryFn: async (): Promise<DocumentCategory[]> => {
      const { data, error } = await supabase
        .from('documents')
        .select('document_type');

      if (error) throw error;

      const categoryMap = new Map<string, number>();
      (data || []).forEach(doc => {
        const cat = getCategoryFromType(doc.document_type);
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });

      const categoryIcons: Record<string, string> = {
        'Certificates': 'award',
        'Contracts': 'file-text',
        'Safety': 'shield',
        'Training': 'graduation-cap',
        'Compliance': 'check-circle',
        'Operations': 'settings',
        'HR': 'users',
        'General': 'folder',
      };

      return Array.from(categoryMap.entries())
        .map(([name, count]) => ({
          name,
          count,
          icon: categoryIcons[name] || 'file',
        }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 10 * 60 * 1000,
  });

  const uploadDocument = useMutation({
    mutationFn: async (doc: Partial<Document> & { file?: File }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let fileUrl: string | undefined;
      
      if (doc.file) {
        const fileName = `${Date.now()}-${doc.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, doc.file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);
        
        fileUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: doc.name,
          document_type: doc.type,
          file_size: doc.size || doc.file?.size,
          status: 'draft',
          uploaded_by: user?.id,
          file_url: fileUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents-center'] });
      queryClient.invalidateQueries({ queryKey: ['documents-stats'] });
      queryClient.invalidateQueries({ queryKey: ['documents-categories'] });
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Document> & { id: string }) => {
      const { error } = await supabase
        .from('documents')
        .update({
          title: updates.name,
          document_type: updates.type,
          status: updates.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents-center'] });
      queryClient.invalidateQueries({ queryKey: ['documents-stats'] });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents-center'] });
      queryClient.invalidateQueries({ queryKey: ['documents-stats'] });
      queryClient.invalidateQueries({ queryKey: ['documents-categories'] });
    },
  });

  return {
    documents: documentsQuery.data || [],
    stats: statsQuery.data,
    categories: categoriesQuery.data || [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    uploadDocument: uploadDocument.mutate,
    updateDocument: updateDocument.mutate,
    deleteDocument: deleteDocument.mutate,
    isUploading: uploadDocument.isPending,
    refetch: documentsQuery.refetch,
  };
}

function getCategoryFromType(type: string | null): string {
  if (!type) return 'General';
  
  const typeUpper = type.toUpperCase();
  if (typeUpper.includes('CERT') || typeUpper.includes('LICENSE')) return 'Certificates';
  if (typeUpper.includes('CONTRACT') || typeUpper.includes('AGREEMENT')) return 'Contracts';
  if (typeUpper.includes('SAFETY') || typeUpper.includes('ISM') || typeUpper.includes('SMS')) return 'Safety';
  if (typeUpper.includes('TRAIN') || typeUpper.includes('COURSE')) return 'Training';
  if (typeUpper.includes('COMPLIANCE') || typeUpper.includes('AUDIT')) return 'Compliance';
  if (typeUpper.includes('OPER') || typeUpper.includes('LOG')) return 'Operations';
  if (typeUpper.includes('HR') || typeUpper.includes('CREW') || typeUpper.includes('PERSONAL')) return 'HR';
  
  return 'General';
}

function mapStatus(status: string | null): Document['status'] {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'draft';
    case 'pending':
    case 'pending_review':
    case 'in_review':
      return 'pending';
    case 'approved':
    case 'active':
    case 'valid':
      return 'approved';
    case 'expired':
      return 'expired';
    case 'archived':
    case 'deleted':
      return 'archived';
    default:
      return 'draft';
  }
}
