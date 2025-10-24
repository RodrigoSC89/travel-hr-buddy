/**
 * PATCH 91.0 - Document Hub Supabase Service
 * Handle document storage and metadata in Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { DocumentMetadata, UploadResult } from '../types';

/**
 * Upload a document to Supabase Storage
 */
export async function uploadDocument(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}-${file.name}`;
    
    // Upload to storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      logger.error('Document upload error:', uploadError);
      return {
        success: false,
        error: uploadError.message,
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Store metadata in database
    const metadata: Partial<DocumentMetadata> = {
      owner_id: userId,
      filename: file.name,
      file_size: file.size,
      file_type: file.type,
      storage_url: publicUrl,
      created_at: new Date().toISOString(),
    };

    const { data: metadataData, error: metadataError } = await supabase
      .from('document_metadata')
      .insert(metadata)
      .select()
      .single();

    if (metadataError) {
      logger.error('Metadata storage error:', metadataError);
      // Try to clean up uploaded file
      await supabase.storage.from('documents').remove([fileName]);
      return {
        success: false,
        error: metadataError.message,
      };
    }

    return {
      success: true,
      metadata: metadataData as DocumentMetadata,
    };
  } catch (error) {
    logger.error('Document upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all documents for a user
 */
export async function listDocuments(
  userId?: string
): Promise<DocumentMetadata[]> {
  try {
    let query = supabase
      .from('document_metadata')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('owner_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Document listing error:', error);
      return [];
    }

    return (data || []) as DocumentMetadata[];
  } catch (error) {
    logger.error('Document listing exception:', error);
    return [];
  }
}

/**
 * Get a single document by ID
 */
export async function getDocument(docId: string): Promise<DocumentMetadata | null> {
  try {
    const { data, error } = await supabase
      .from('document_metadata')
      .select('*')
      .eq('doc_id', docId)
      .single();

    if (error) {
      logger.error('Document fetch error:', error);
      return null;
    }

    return data as DocumentMetadata;
  } catch (error) {
    logger.error('Document fetch exception:', error);
    return null;
  }
}

/**
 * Update document metadata (e.g., after AI analysis)
 */
export async function updateDocumentMetadata(
  docId: string,
  updates: Partial<DocumentMetadata>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('document_metadata')
      .update(updates)
      .eq('doc_id', docId);

    if (error) {
      logger.error('Document update error:', error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Document update exception:', error);
    return false;
  }
}

/**
 * Delete a document and its metadata
 */
export async function deleteDocument(docId: string): Promise<boolean> {
  try {
    // Get document metadata to find storage path
    const doc = await getDocument(docId);
    if (!doc) {
      return false;
    }

    // Extract file path from URL
    const urlParts = doc.storage_url.split('/documents/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        logger.warn('Storage deletion warning:', storageError);
      }
    }

    // Delete metadata
    const { error: metadataError } = await supabase
      .from('document_metadata')
      .delete()
      .eq('doc_id', docId);

    if (metadataError) {
      logger.error('Metadata deletion error:', metadataError);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Document deletion exception:', error);
    return false;
  }
}
