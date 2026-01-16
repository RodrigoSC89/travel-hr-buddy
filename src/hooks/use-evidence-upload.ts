/**
 * Evidence Upload Hook for PEOTRAM
 * PATCH: Implements file upload, camera capture, and audio recording
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EvidenceFile {
  id: string;
  type: 'photo' | 'document' | 'audio' | 'video';
  url: string;
  filename: string;
  size: number;
  uploadedAt: string;
  metadata?: Record<string, unknown>;
}

interface UseEvidenceUploadReturn {
  uploadFile: (file: File, auditId: string, itemId: string) => Promise<EvidenceFile | null>;
  capturePhoto: (auditId: string, itemId: string) => Promise<EvidenceFile | null>;
  startAudioRecording: () => Promise<void>;
  stopAudioRecording: (auditId: string, itemId: string) => Promise<EvidenceFile | null>;
  isUploading: boolean;
  isRecording: boolean;
  uploadProgress: number;
  error: string | null;
}

const BUCKET_NAME = 'peotram-evidence';

export function useEvidenceUpload(): UseEvidenceUploadReturn {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const getFileType = (file: File): EvidenceFile['type'] => {
    if (file.type.startsWith('image/')) return 'photo';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const uploadFile = useCallback(async (
    file: File,
    auditId: string,
    itemId: string
  ): Promise<EvidenceFile | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${auditId}/${itemId}/${timestamp}_${sanitizedName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(100);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      const evidence: EvidenceFile = {
        id: `evidence_${timestamp}`,
        type: getFileType(file),
        url: urlData.publicUrl,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        metadata: {
          mimeType: file.type,
          auditId,
          itemId,
          uploadedBy: user.id,
        },
      };

      toast.success('Evidência enviada com sucesso');
      return evidence;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar arquivo';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  const capturePhoto = useCallback(async (
    auditId: string,
    itemId: string
  ): Promise<EvidenceFile | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });

      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      await video.play();

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Stop stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to capture photo'));
        }, 'image/jpeg', 0.9);
      });

      // Create file and upload
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      return await uploadFile(file, auditId, itemId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao capturar foto';
      setError(message);
      toast.error(message);
      return null;
    }
  }, [user, uploadFile]);

  const startAudioRecording = useCallback(async (): Promise<void> => {
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

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      toast.info('Gravação iniciada');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar gravação';
      setError(message);
      toast.error(message);
    }
  }, []);

  const stopAudioRecording = useCallback(async (
    auditId: string,
    itemId: string
  ): Promise<EvidenceFile | null> => {
    if (!mediaRecorderRef.current || !isRecording) {
      return null;
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        
        const extension = mediaRecorder.mimeType.includes('webm') ? 'webm' : 'm4a';
        const file = new File([audioBlob], `audio_${Date.now()}.${extension}`, { 
          type: mediaRecorder.mimeType 
        });

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
        setIsRecording(false);

        const evidence = await uploadFile(file, auditId, itemId);
        resolve(evidence);
      };

      mediaRecorder.stop();
      toast.info('Gravação finalizada');
    });
  }, [isRecording, uploadFile]);

  return {
    uploadFile,
    capturePhoto,
    startAudioRecording,
    stopAudioRecording,
    isUploading,
    isRecording,
    uploadProgress,
    error,
  };
}
