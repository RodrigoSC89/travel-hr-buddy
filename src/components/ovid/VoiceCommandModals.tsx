import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Loader2, Save, FileText, Mic, Image } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId?: string;
  inspectionId?: string;
  onPhotoCaptured?: (photoData: { url: string; caption?: string }) => void;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  questionId,
  inspectionId,
  onPhotoCaptured,
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedPhoto]);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      logger.error('Camera error:', error);
      toast.error('Não foi possível acessar a câmera. Você pode fazer upload de uma imagem.');
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedPhoto(dataUrl);
      stopCamera();
      toast.success('Foto capturada!');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedPhoto(e.target?.result as string);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setCaption('');
    startCamera();
  };

  const savePhoto = async () => {
    if (!capturedPhoto) return;

    setIsUploading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      
      const { data: user } = await supabase.auth.getUser();
      const timestamp = Date.now();
      const filePath = `${user?.user?.id || 'anonymous'}/${inspectionId || 'temp'}/${questionId || 'general'}/${timestamp}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('ovid-evidence')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (uploadError) {
        logger.warn('Storage upload failed, using local data', { error: uploadError });
      }

      onPhotoCaptured?.({ url: capturedPhoto, caption });
      toast.success('Foto salva como evidência');
      handleClose();
    } catch (error) {
      logger.error('Save error', error);
      // Still call callback with local data
      onPhotoCaptured?.({ url: capturedPhoto, caption });
      toast.success('Foto registrada localmente');
      handleClose();
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedPhoto(null);
    setCaption('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Capturar Evidência Fotográfica
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {!capturedPhoto ? (
            <>
              {/* Camera view */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isCapturing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="text-center text-muted-foreground">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Iniciando câmera...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera controls */}
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Galeria
                </Button>
                <Button
                  size="lg"
                  onClick={capturePhoto}
                  disabled={!isCapturing}
                  className="w-32"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capturar
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Captured photo preview */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img
                  src={capturedPhoto}
                  alt="Captured evidence"
                  className="w-full h-full object-contain"
                />
                <Badge className="absolute top-2 right-2" variant="secondary">
                  <Image className="w-3 h-3 mr-1" />
                  Prévia
                </Badge>
              </div>

              {/* Caption input */}
              <div className="space-y-2">
                <Label htmlFor="caption">Legenda (opcional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Descreva a evidência..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}

          {questionId && (
            <Badge variant="outline" className="text-xs">
              Questão: {questionId}
            </Badge>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          {capturedPhoto && (
            <>
              <Button variant="secondary" onClick={retakePhoto}>
                <Camera className="w-4 h-4 mr-2" />
                Nova Foto
              </Button>
              <Button onClick={savePhoto} disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Observation Modal
interface ObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId?: string;
  initialText?: string;
  onSave?: (text: string) => void;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({
  isOpen,
  onClose,
  questionId,
  initialText = '',
  onSave,
}) => {
  const [text, setText] = useState(initialText);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText, isOpen]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionClass();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setText(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Reconhecimento de voz não suportado');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSave = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onSave?.(text.trim());
    toast.success('Observação salva');
    onClose();
  };

  const handleClose = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Adicionar Observação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="observation">Observação</Label>
              <Button
                type="button"
                variant={isListening ? 'destructive' : 'outline'}
                size="sm"
                onClick={toggleListening}
              >
                <Mic className={`w-4 h-4 mr-1 ${isListening ? 'animate-pulse' : ''}`} />
                {isListening ? 'Ouvindo...' : 'Ditar'}
              </Button>
            </div>
            <Textarea
              id="observation"
              placeholder="Digite ou dite sua observação sobre este item..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {text.length} caracteres
            </p>
          </div>

          {questionId && (
            <Badge variant="outline" className="text-xs">
              Questão: {questionId}
            </Badge>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!text.trim()}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Chapter Navigation Modal
interface ChapterNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChapter?: string;
  onNavigate?: (chapterId: string) => void;
}

export const ChapterNavigationModal: React.FC<ChapterNavigationModalProps> = ({
  isOpen,
  onClose,
  currentChapter,
  onNavigate,
}) => {
  const chapters = [
    { id: '1', name: 'Vessel/Unit Particulars' },
    { id: '2', name: 'Certification and Documentation' },
    { id: '3', name: 'Crew and Contractor Management' },
    { id: '4', name: 'Navigation' },
    { id: '5', name: 'Safety and Security Management' },
    { id: '6', name: 'Lifesaving Appliances' },
    { id: '7', name: 'Fire Fighting Equipment' },
    { id: '8', name: 'Pollution Prevention' },
    { id: '9', name: 'Structural Condition' },
    { id: '10', name: 'Operational Procedures' },
    { id: '11', name: 'Mooring and Anchoring' },
    { id: '12', name: 'Communications' },
    { id: '13', name: 'Machinery' },
    { id: '14', name: 'General Appearance' },
    { id: '15', name: 'Ice Operations' },
    { id: '16', name: 'Helicopter Operations' },
    { id: '17', name: 'Dynamic Positioning' },
  ];

  const handleSelect = (chapterId: string) => {
    onNavigate?.(chapterId);
    toast.success(`Navegando para Capítulo ${chapterId}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ir para Capítulo</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
          {chapters.map((chapter) => (
            <Button
              key={chapter.id}
              variant={currentChapter === chapter.id ? 'default' : 'outline'}
              className="justify-start text-left h-auto py-3"
              onClick={() => handleSelect(chapter.id)}
            >
              <Badge variant="secondary" className="mr-2 min-w-[28px] justify-center">
                {chapter.id}
              </Badge>
              <span className="text-sm truncate">{chapter.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
