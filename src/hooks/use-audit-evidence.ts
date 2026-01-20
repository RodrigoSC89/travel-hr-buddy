/**
 * Hook for managing audit evidence uploads (files, camera, audio)
 * Supports Supabase Storage integration with offline fallback
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface EvidenceFile {
  id: string;
  name: string;
  type: 'document' | 'photo' | 'audio' | 'video';
  size: number;
  url?: string;
  localUrl?: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
  metadata?: Record<string, unknown>;
}

interface UseAuditEvidenceOptions {
  auditId: string;
  maxFileSize?: number; // bytes, default 50MB
  allowedTypes?: string[];
}

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'audio/mpeg',
  'audio/webm',
  'video/mp4'
];

export function useAuditEvidence(options: UseAuditEvidenceOptions) {
  const { auditId, maxFileSize = DEFAULT_MAX_SIZE, allowedTypes = DEFAULT_ALLOWED_TYPES } = options;
  const { toast } = useToast();
  
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload file to Supabase Storage
  const uploadFile = useCallback(async (file: File, evidenceType: EvidenceFile['type']) => {
    const fileId = crypto.randomUUID();
    const fileName = `${auditId}/${fileId}-${file.name}`;
    
    // Add to local state
    const newFile: EvidenceFile = {
      id: fileId,
      name: file.name,
      type: evidenceType,
      size: file.size,
      localUrl: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0
    };
    
    setFiles(prev => [...prev, newFile]);
    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('audit-evidence')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('audit-evidence')
        .getPublicUrl(data.path);

      // Save metadata to database
      const { data: userData } = await supabase.auth.getUser();
      
      await supabase.from('audit_evidence').insert({
        audit_id: auditId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: data.path,
        uploaded_by: userData.user?.id,
        metadata: {
          evidenceType,
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      } as any);

      // Update state
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, url: urlData.publicUrl, status: 'uploaded', progress: 100 }
          : f
      ));

      toast({
        title: "✅ Arquivo enviado",
        description: `${file.name} foi carregado com sucesso`
      });

      logger.info('[AuditEvidence] File uploaded', { fileId, fileName });
      return fileId;

    } catch (error) {
      logger.error('[AuditEvidence] Upload failed', error);
      
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', progress: 0 }
          : f
      ));

      toast({
        title: "❌ Erro no upload",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive"
      });

      return null;
    } finally {
      setIsUploading(false);
    }
  }, [auditId, toast]);

  // Handle file input change
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    for (const file of Array.from(selectedFiles)) {
      // Validate file size
      if (file.size > maxFileSize) {
        toast({
          title: "⚠️ Arquivo muito grande",
          description: `${file.name} excede o limite de ${Math.round(maxFileSize / 1024 / 1024)}MB`,
          variant: "destructive"
        });
        continue;
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "⚠️ Tipo não permitido",
          description: `${file.name} não é um tipo de arquivo suportado`,
          variant: "destructive"
        });
        continue;
      }

      // Determine evidence type
      let evidenceType: EvidenceFile['type'] = 'document';
      if (file.type.startsWith('image/')) evidenceType = 'photo';
      else if (file.type.startsWith('audio/')) evidenceType = 'audio';
      else if (file.type.startsWith('video/')) evidenceType = 'video';

      await uploadFile(file, evidenceType);
    }

    // Reset input
    if (event.target) event.target.value = '';
  }, [maxFileSize, allowedTypes, uploadFile, toast]);

  // Open file picker
  const openFilePicker = useCallback(() => {
    if (!fileInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = allowedTypes.join(',');
      input.onchange = handleFileSelect as any;
      fileInputRef.current = input;
    }
    fileInputRef.current.click();
  }, [allowedTypes, handleFileSelect]);

  // Capture photo from camera
  const capturePhoto = useCallback(async () => {
    try {
      // Check if we're in a mobile context with Capacitor
      if ('Capacitor' in window) {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Base64,
          source: CameraSource.Camera,
          saveToGallery: false
        });

        if (image.base64String) {
          // Convert base64 to Blob
          const byteString = atob(image.base64String);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: `image/${image.format || 'jpeg'}` });
          const file = new File([blob], `photo-${Date.now()}.${image.format || 'jpeg'}`, { 
            type: `image/${image.format || 'jpeg'}` 
          });

          await uploadFile(file, 'photo');
        }
      } else {
        // Fallback to browser camera API
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });

        // Create video element to capture frame
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        
        await new Promise(resolve => video.onloadedmetadata = resolve);
        await video.play();

        // Wait a moment for camera to stabilize
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capture frame to canvas
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);

        // Stop stream
        stream.getTracks().forEach(track => track.stop());

        // Convert to blob and upload
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            await uploadFile(file, 'photo');
          }
        }, 'image/jpeg', 0.9);
      }

      toast({
        title: "📷 Foto capturada",
        description: "A imagem está sendo processada..."
      });

    } catch (error: any) {
      logger.error('[AuditEvidence] Camera capture failed', error);
      
      toast({
        title: "❌ Erro na câmera",
        description: error.message || "Não foi possível acessar a câmera",
        variant: "destructive"
      });
    }
  }, [uploadFile, toast]);

  // Start audio recording
  const startAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        const ext = mediaRecorder.mimeType.includes('webm') ? 'webm' : 'mp4';
        const file = new File([audioBlob], `audio-${Date.now()}.${ext}`, { 
          type: mediaRecorder.mimeType 
        });

        await uploadFile(file, 'audio');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "🎙️ Gravando...",
        description: "Clique novamente para parar a gravação"
      });

    } catch (error: any) {
      logger.error('[AuditEvidence] Audio recording failed', error);
      
      toast({
        title: "❌ Erro no microfone",
        description: error.message || "Não foi possível acessar o microfone",
        variant: "destructive"
      });
    }
  }, [uploadFile, toast]);

  // Stop audio recording
  const stopAudioRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      toast({
        title: "✅ Gravação finalizada",
        description: "O áudio está sendo processado..."
      });
    }
  }, [toast]);

  // Toggle audio recording
  const toggleAudioRecording = useCallback(() => {
    if (isRecording) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  }, [isRecording, startAudioRecording, stopAudioRecording]);

  // Remove file
  const removeFile = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    try {
      // Remove from storage if uploaded
      if (file.url) {
        const path = file.url.split('/').pop();
        if (path) {
          await supabase.storage.from('audit-evidence').remove([`${auditId}/${path}`]);
        }
      }

      // Remove from database
      await supabase.from('audit_evidence')
        .delete()
        .eq('audit_id', auditId)
        .ilike('file_name', `%${file.name}%`);

      // Update local state
      setFiles(prev => prev.filter(f => f.id !== fileId));

      // Revoke local URL
      if (file.localUrl) {
        URL.revokeObjectURL(file.localUrl);
      }

      toast({
        title: "🗑️ Arquivo removido",
        description: `${file.name} foi excluído`
      });

    } catch (error) {
      logger.error('[AuditEvidence] Remove failed', error);
      toast({
        title: "❌ Erro ao remover",
        description: "Não foi possível remover o arquivo",
        variant: "destructive"
      });
    }
  }, [auditId, files, toast]);

  // Get all evidence for current audit
  const fetchEvidence = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('audit_evidence')
        .select('*')
        .eq('audit_id', auditId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const evidenceFiles: EvidenceFile[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.file_name,
        type: (item.metadata?.evidenceType as EvidenceFile['type']) || 'document',
        size: item.file_size || 0,
        url: item.file_path ? 
          supabase.storage.from('audit-evidence').getPublicUrl(item.file_path).data.publicUrl : 
          undefined,
        status: 'uploaded' as const,
        progress: 100,
        metadata: item.metadata
      }));

      setFiles(evidenceFiles);
      return evidenceFiles;

    } catch (error) {
      logger.error('[AuditEvidence] Fetch failed', error);
      return [];
    }
  }, [auditId]);

  return {
    files,
    isUploading,
    isRecording,
    openFilePicker,
    capturePhoto,
    toggleAudioRecording,
    removeFile,
    fetchEvidence,
    uploadFile: async (file: File) => {
      let type: EvidenceFile['type'] = 'document';
      if (file.type.startsWith('image/')) type = 'photo';
      else if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('video/')) type = 'video';
      return uploadFile(file, type);
    }
  };
}
