import { useRef, useState, useCallback } from "react";;

// PATCH 393 - Incident Reports: Enhanced with photo upload, GPS, and unique IDs
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Upload, X, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreateIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateIncidentDialog: React.FC<CreateIncidentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "medium",
    category: "operational",
    incident_type: "minor",
    incident_location: "",
    gps_coordinates: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Generate unique incident number: INC-{timestamp}-{random}
  const generateIncidentNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `INC-${timestamp}-${random}`;
  };

  // GPS capture via browser Geolocation API
  const captureGPS = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS não disponível",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive",
      });
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setFormData({ ...formData, gps_coordinates: coordinates });
        setGpsLoading(false);
        toast({
          title: "GPS capturado",
          description: `Localização: ${coordinates}`,
        });
      },
      (error) => {
        setGpsLoading(false);
        toast({
          title: "Erro ao capturar GPS",
          description: "Não foi possível obter sua localização",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Photo upload handler (max 5 photos, 5MB each)
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > 5) {
      toast({
        title: "Limite excedido",
        description: "Máximo de 5 fotos permitidas",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "Arquivo muito grande",
        description: "Cada foto deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const invalidTypes = files.filter(file => !file.type.startsWith("image/"));
    if (invalidTypes.length > 0) {
      toast({
        title: "Tipo inválido",
        description: "Apenas imagens são permitidas",
        variant: "destructive",
      });
      return;
    }

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPhotos([...photos, ...files]);
    setPhotoPreviews([...photoPreviews, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(photoPreviews[index]); // Clean up object URL
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const incidentNumber = generateIncidentNumber();
      const photoUrls: string[] = [];

      // Upload photos to Supabase storage if available
      if (photos.length > 0) {
        try {
          for (let i = 0; i < photos.length; i++) {
            const photo = photos[i];
            const fileName = `${incidentNumber}-${i}-${Date.now()}.${photo.name.split(".").pop()}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("incident-reports")
              .upload(fileName, photo);

            if (uploadError) {
            } else if (uploadData) {
              const { data: urlData } = supabase.storage
                .from("incident-reports")
                .getPublicUrl(fileName);
              photoUrls.push(urlData.publicUrl);
            }
          }
        } catch (uploadError) {
          console.error("Error uploading photos:", uploadError);
          console.error("Error uploading photos:", uploadError);
          // Continue without photos if upload fails
        }
      }

      const { error } = await supabase.from("incident_reports").insert({
        ...formData,
        incident_number: incidentNumber,
        reported_by: user.id,
        incident_date: new Date().toISOString(),
        status: "new",
        photo_urls: photoUrls.length > 0 ? photoUrls : null,
      });

      if (error) throw error;

      toast({
        title: "Incidente criado",
        description: `Número: ${incidentNumber}`,
      });

      onSuccess();
      onOpenChange(false);
      
      // Clean up
      photoPreviews.forEach(url => URL.revokeObjectURL(url));
      setFormData({
        title: "",
        description: "",
        severity: "medium",
        category: "operational",
        incident_type: "minor",
        incident_location: "",
        gps_coordinates: "",
      });
      setPhotos([]);
      setPhotoPreviews([]);
    } catch (error) {
      console.error("Error creating incident:", error);
      console.error("Error creating incident:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar relatório de incidente",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Relatório de Incidente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              required
              value={formData.title}
              onChange={handleChange})}
              placeholder="Descrição breve do incidente"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Incidente *</Label>
              <Select
                value={formData.incident_type}
                onValueChange={(value) => setFormData({ ...formData, incident_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severidade *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="personnel">Personnel</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Local</Label>
              <Input
                value={formData.incident_location}
                onChange={handleChange})}
                placeholder="Onde ocorreu o incidente?"
              />
            </div>

            <div className="space-y-2">
              <Label>Coordenadas GPS</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.gps_coordinates}
                  onChange={handleChange})}
                  placeholder="Lat, Long ou clique em capturar"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={captureGPS}
                  disabled={gpsLoading}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Textarea
              required
              value={formData.description}
              onChange={handleChange})}
              placeholder="Descrição detalhada do incidente..."
              rows={6}
            />
          </div>

          {/* Photo Upload Section - PATCH 393 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Fotos (Máx. 5, 5MB cada)</Label>
              <Badge variant="secondary">{photos.length}/5</Badge>
            </div>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={photos.length >= 5}
              >
                <Upload className="mr-2 h-4 w-4" />
                Adicionar Fotos {photos.length > 0 && `(${photos.length})`}
              </Button>
              
              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleremovePhoto}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleonOpenChange}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Criando..." : "Criar Incidente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
