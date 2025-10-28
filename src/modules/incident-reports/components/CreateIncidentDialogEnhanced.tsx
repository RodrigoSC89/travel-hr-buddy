// @ts-nocheck
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera, MapPin, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

interface CreateIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateIncidentDialogEnhanced: React.FC<CreateIncidentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    category: 'operational',
    incident_type: 'minor',
    incident_location: '',
    vessel_name: '',
    gps_coordinates: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      sonnerToast.error('Maximum 5 photos allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        sonnerToast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        sonnerToast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setPhotos([...photos, ...validFiles]);
      
      // Create preview URLs
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviewUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      sonnerToast.error('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setFormData({ ...formData, gps_coordinates: coordinates });
        sonnerToast.success('Location captured successfully');
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        sonnerToast.error('Failed to get location. Please enter manually.');
        setGettingLocation(false);
      }
    );
  };

  const uploadPhotos = async (incidentId: string) => {
    const uploadedUrls = [];
    
    for (const photo of photos) {
      try {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${incidentId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `incident-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('incident-reports')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('incident-reports')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Photo upload error:', error);
        sonnerToast.error(`Failed to upload ${photo.name}`);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate incident number
      const incidentNumber = `INC-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Insert incident record
      const { data: incident, error: insertError } = await supabase
        .from('incident_reports')
        .insert({
          incident_number: incidentNumber,
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
          category: formData.category,
          incident_type: formData.incident_type,
          incident_location: formData.incident_location,
          vessel_name: formData.vessel_name || null,
          gps_coordinates: formData.gps_coordinates || null,
          reported_by: user.id,
          incident_date: new Date().toISOString(),
          status: 'new',
          impact_level: formData.severity === 'critical' ? 'high' : formData.severity === 'high' ? 'medium' : 'low',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Upload photos if any
      if (photos.length > 0 && incident) {
        const photoUrls = await uploadPhotos(incident.id);
        
        // Update incident with photo URLs
        await supabase
          .from('incident_reports')
          .update({ photos: photoUrls })
          .eq('id', incident.id);
      }

      toast({
        title: 'Success',
        description: `Incident ${incidentNumber} created successfully`,
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to create incident report',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      category: 'operational',
      incident_type: 'minor',
      incident_location: '',
      vessel_name: '',
      gps_coordinates: '',
    });
    setPhotos([]);
    setPhotoPreviewUrls([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Incident Report</DialogTitle>
          <DialogDescription>
            Register a new incident with photos, location, and detailed information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the incident"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Severity *</Label>
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
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment Failure</SelectItem>
                  <SelectItem value="safety">Safety Incident</SelectItem>
                  <SelectItem value="personnel">Personnel Issue</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="near_miss">Near Miss</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Incident Type *</Label>
            <Select
              value={formData.incident_type}
              onValueChange={(value) => setFormData({ ...formData, incident_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor - No injuries or minor damage</SelectItem>
                <SelectItem value="moderate">Moderate - Requires attention</SelectItem>
                <SelectItem value="major">Major - Significant impact</SelectItem>
                <SelectItem value="critical">Critical - Emergency response required</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input
                required
                value={formData.incident_location}
                onChange={(e) => setFormData({ ...formData, incident_location: e.target.value })}
                placeholder="Deck 3, Engine Room, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Vessel Name</Label>
              <Input
                value={formData.vessel_name}
                onChange={(e) => setFormData({ ...formData, vessel_name: e.target.value })}
                placeholder="Enter vessel name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>GPS Coordinates</Label>
            <div className="flex gap-2">
              <Input
                value={formData.gps_coordinates}
                onChange={(e) => setFormData({ ...formData, gps_coordinates: e.target.value })}
                placeholder="Latitude, Longitude"
              />
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {gettingLocation ? 'Getting...' : 'Get Current'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of what happened, who was involved, actions taken..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label>Photos (Max 5, up to 5MB each)</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photos.length >= 5}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photos
                </Button>
                <Badge variant="secondary">
                  {photos.length} / 5 photos
                </Badge>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />
              
              {photoPreviewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {photoPreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => { onOpenChange(false); resetForm(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Incident Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIncidentDialogEnhanced;
