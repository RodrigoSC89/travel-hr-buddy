/**
 * useDocumentsCRUD - Full CRUD hook for documents table
 * Replaces mock data in AdvancedDocumentCenter
 * Integrates with Supabase Storage bucket 'documents'
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DocumentRecord {
  id: string;
  title: string;
  document_type: string;
  content: string | null;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  vessel_id: string | null;
  crew_member_id: string | null;
  expiry_date: string | null;
  status: string;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentInput {
  title: string;
  document_type: string;
  content?: string;
  status?: string;
  vessel_id?: string;
  expiry_date?: string;
}

const QUERY_KEY = 'documents-crud';

export function useDocumentsCRUD(filters?: {
  category?: string;
  status?: string;
  search?: string;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all documents
  const documentsQuery = useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async (): Promise<DocumentRecord[]> => {
      let query = supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('document_type', filters.category);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as DocumentRecord[];
    },
    staleTime: 30000,
  });

  // Create document
  const createDocument = useMutation({
    mutationFn: async (input: CreateDocumentInput) => {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: input.title,
          document_type: input.document_type,
          content: input.content || null,
          status: input.status || 'active',
          vessel_id: input.vessel_id || null,
          expiry_date: input.expiry_date || null,
          uploaded_by: user?.id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Documento criado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar documento: ${error.message}`);
    },
  });

  // Upload file to Storage + create record
  const uploadDocument = useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata?: Partial<CreateDocumentInput> }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to storage bucket
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create database record
      const { data, error: insertError } = await supabase
        .from('documents')
        .insert({
          title: metadata?.title || file.name.replace(/\.[^/.]+$/, ''),
          document_type: metadata?.document_type || mapMimeToType(file.type),
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          status: 'active',
          uploaded_by: user?.id || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Arquivo enviado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro no upload: ${error.message}`);
    },
  });

  // Update document
  const updateDocument = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DocumentRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('documents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Documento atualizado');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  // Delete document
  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      // Get file path first to clean up storage
      const { data: doc } = await supabase
        .from('documents')
        .select('file_url')
        .eq('id', id)
        .single();

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      if (error) throw error;

      // Clean up storage if file exists
      if (doc?.file_url) {
        try {
          const path = new URL(doc.file_url).pathname.split('/documents/')[1];
          if (path) {
            await supabase.storage.from('documents').remove([path]);
          }
        } catch {
          // Storage cleanup is best-effort
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Documento excluído');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  // Stats
  const stats = {
    total: documentsQuery.data?.length || 0,
    active: documentsQuery.data?.filter(d => d.status === 'active').length || 0,
    expired: documentsQuery.data?.filter(d => {
      if (!d.expiry_date) return false;
      return new Date(d.expiry_date) < new Date();
    }).length || 0,
    certificates: documentsQuery.data?.filter(d => d.document_type === 'certificate').length || 0,
  };

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    stats,
    createDocument,
    uploadDocument,
    updateDocument,
    deleteDocument,
    refetch: documentsQuery.refetch,
  };
}

function mapMimeToType(mime: string): string {
  if (mime.includes('pdf')) return 'report';
  if (mime.includes('word') || mime.includes('document')) return 'manual';
  if (mime.includes('sheet') || mime.includes('excel')) return 'report';
  if (mime.includes('image')) return 'photo';
  if (mime.includes('presentation')) return 'presentation';
  return 'other';
}
