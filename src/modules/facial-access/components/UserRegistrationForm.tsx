/**
 * UserRegistrationForm - Complete facial recognition user registration
 * With real form state, validation, and camera integration
 */

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Camera, UserPlus, XCircle, CheckCircle, Loader2, Image } from "lucide-react";

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  capturedAt: Date;
}

interface UserFormData {
  fullName: string;
  position: string;
  employeeId: string;
  accessLevel: 'low' | 'medium' | 'high' | 'critical';
  department: string;
}

export function UserRegistrationForm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    position: '',
    employeeId: '',
    accessLevel: 'medium',
    department: ''
  });

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCapturing(true);
      toast.success("Câmera ativada para captura facial");
    } catch (error) {
      toast.error("Erro ao acessar câmera", {
        description: "Verifique as permissões do navegador"
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsCapturing(false);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      dataUrl,
      capturedAt: new Date()
    };
    
    setCapturedPhotos(prev => {
      if (prev.length >= 3) {
        toast.warning("Máximo de 3 fotos atingido");
        return prev;
      }
      toast.success(`Foto ${prev.length + 1}/3 capturada`);
      return [...prev, newPhoto];
    });
  }, []);

  const removePhoto = (photoId: string) => {
    setCapturedPhotos(prev => prev.filter(p => p.id !== photoId));
    toast.info("Foto removida");
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast.error("Nome completo é obrigatório");
      return false;
    }
    if (!formData.position.trim()) {
      toast.error("Cargo é obrigatório");
      return false;
    }
    if (!formData.employeeId.trim()) {
      toast.error("Matrícula é obrigatória");
      return false;
    }
    if (capturedPhotos.length < 3) {
      toast.error("É necessário capturar 3 fotos para cadastro facial");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call for user registration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would:
      // 1. Send photos to facial recognition API
      // 2. Generate biometric template
      // 3. Store user in database with access credentials
      
      toast.success("Usuário cadastrado com sucesso!", {
        description: `${formData.fullName} agora tem acesso biométrico`
      });
      
      // Reset form
      setFormData({
        fullName: '',
        position: '',
        employeeId: '',
        accessLevel: 'medium',
        department: ''
      });
      setCapturedPhotos([]);
      stopCamera();
      
    } catch (error) {
      toast.error("Erro ao cadastrar usuário", {
        description: "Tente novamente ou contate o suporte"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Cadastrar Novo Usuário
        </CardTitle>
        <CardDescription>
          Registre dados biométricos para controle de acesso em áreas restritas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo *</Label>
            <Input 
              id="fullName"
              placeholder="Digite o nome completo" 
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Cargo *</Label>
            <Input 
              id="position"
              placeholder="Digite o cargo" 
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employeeId">Matrícula *</Label>
            <Input 
              id="employeeId"
              placeholder="Digite a matrícula" 
              value={formData.employeeId}
              onChange={(e) => handleInputChange('employeeId', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <Input 
              id="department"
              placeholder="Digite o departamento" 
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="accessLevel">Nível de Acesso *</Label>
            <Select 
              value={formData.accessLevel} 
              onValueChange={(value) => handleInputChange('accessLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixo - Áreas comuns</SelectItem>
                <SelectItem value="medium">Médio - Áreas operacionais</SelectItem>
                <SelectItem value="high">Alto - Praça de Máquinas</SelectItem>
                <SelectItem value="critical">Crítico - Ponte de Comando / Paiol</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Nível selecionado:</span>
              <Badge className={getAccessLevelColor(formData.accessLevel)}>
                {formData.accessLevel === 'critical' ? 'Crítico' :
                 formData.accessLevel === 'high' ? 'Alto' :
                 formData.accessLevel === 'medium' ? 'Médio' : 'Baixo'}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Photo Capture Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Captura Facial ({capturedPhotos.length}/3 fotos)</Label>
            {capturedPhotos.length >= 3 && (
              <Badge className="bg-green-500/20 text-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completo
              </Badge>
            )}
          </div>
          
          {/* Captured Photos Grid */}
          {capturedPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {capturedPhotos.map((photo, idx) => (
                <div key={photo.id} className="relative group">
                  <img 
                    src={photo.dataUrl} 
                    alt={`Captura ${idx + 1}`} 
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(photo.id)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                  <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">
                    {idx + 1}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          {/* Camera Preview */}
          {isCapturing ? (
            <div className="space-y-2">
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-4 border-primary/30 rounded-lg pointer-events-none" />
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={capturePhoto}
                  disabled={capturedPhotos.length >= 3}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar Foto ({capturedPhotos.length}/3)
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Fechar Câmera
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="p-6 border border-dashed rounded-lg text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={startCamera}
            >
              <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Capture 3 fotos para cadastro facial
              </p>
              <p className="text-xs text-muted-foreground">
                Clique para ativar a câmera
              </p>
              <Button variant="outline" className="mt-3" onClick={startCamera}>
                <Camera className="h-4 w-4 mr-2" />
                Iniciar Captura
              </Button>
            </div>
          )}
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Submit Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting || capturedPhotos.length < 3}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando biometria...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Usuário
            </>
          )}
        </Button>
        
        {capturedPhotos.length < 3 && (
          <p className="text-xs text-center text-muted-foreground">
            * É necessário capturar 3 fotos em diferentes ângulos para garantir precisão no reconhecimento
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default UserRegistrationForm;
