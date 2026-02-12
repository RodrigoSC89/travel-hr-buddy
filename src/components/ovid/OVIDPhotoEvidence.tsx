import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, Upload, X, Image, Loader2, Trash2, ZoomIn } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface OVIDPhotoEvidenceProps {
  inspectionId?: string;
  questionId: string;
  photos?: Array<{ file_path: string; file_name: string; caption?: string }>;
  onPhotoUploaded?: (filePath: string) => void;
  disabled?: boolean;
}

export const OVIDPhotoEvidence: React.FC<OVIDPhotoEvidenceProps> = ({
  inspectionId,
  questionId,
  photos = [],
  onPhotoUploaded,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Tamanho máximo: 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filePath = `${user.user.id}/${inspectionId || 'temp'}/${questionId}/${timestamp}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from('ovid-evidence')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Save to database if inspectionId exists
      if (inspectionId) {
        await (supabase
          .from('ovid_evidence_photos' as any)
          .insert({
            inspection_id: inspectionId,
            question_id: questionId,
            file_path: filePath,
            file_name: file.name,
          }) as any);
      }

      toast.success('Foto anexada com sucesso');
      onPhotoUploaded?.(filePath);
    } catch (error) {
      logger.error('Upload error:', error);
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [inspectionId, questionId, onPhotoUploaded]);

  const getPhotoUrl = useCallback(async (filePath: string) => {
    const { data } = await supabase.storage
      .from('ovid-evidence')
      .createSignedUrl(filePath, 3600);
    return data?.signedUrl;
  }, []);

  const handlePreview = async (filePath: string) => {
    const url = await getPhotoUrl(filePath);
    if (url) {
      setPreviewUrl(url);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-1" />
              Foto
            </>
          )}
        </Button>

        {photos.length > 0 && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                <Image className="w-4 h-4 mr-1" />
                {photos.length} foto{photos.length > 1 ? 's' : ''}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Evidências Fotográficas</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.file_path}
                      className="relative group rounded-lg border bg-muted/50 p-2 cursor-pointer hover:border-primary"
                      onClick={() => handlePreview(photo.file_path)}
                    >
                      <div className="aspect-square flex items-center justify-center bg-muted rounded">
                        <Image className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-xs truncate mt-1">{photo.file_name}</p>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Preview Dialog */}
      {previewUrl && (
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Visualização</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Evidence preview"
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
