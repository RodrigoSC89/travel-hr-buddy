import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCORS, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { getAuthenticatedUser } from "../_shared/auth.ts";
import { log } from "../_shared/logger.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCORS();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { user, error: authError } = await getAuthenticatedUser(supabase);
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') as string || 'documents';
    const folder = formData.get('folder') as string || '';
    const entityType = formData.get('entity_type') as string;
    const entityId = formData.get('entity_id') as string;

    if (!file || !(file instanceof File)) {
      return errorResponse('File is required', 400);
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return errorResponse('File size exceeds 50MB limit', 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = folder 
      ? `${folder}/${timestamp}_${sanitizedName}`
      : `${timestamp}_${sanitizedName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      log('error', 'file-upload-handler', 'Upload failed', { error: uploadError.message });
      return errorResponse('Failed to upload file', 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    // Log file metadata
    const fileRecord = {
      bucket,
      path: filePath,
      original_name: file.name,
      size: file.size,
      mime_type: file.type,
      entity_type: entityType,
      entity_id: entityId,
      uploaded_by: user.id,
      uploaded_at: new Date().toISOString(),
      public_url: urlData.publicUrl
    };

    await supabase.from('file_uploads').insert(fileRecord);

    log('info', 'file-upload-handler', 'File uploaded successfully', { 
      path: filePath, 
      size: file.size 
    });

    return jsonResponse({
      success: true,
      data: {
        path: filePath,
        bucket,
        size: file.size,
        mime_type: file.type,
        public_url: urlData.publicUrl
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log('error', 'file-upload-handler', 'Unexpected error', { error: message });
    return errorResponse(message, 500);
  }
});
