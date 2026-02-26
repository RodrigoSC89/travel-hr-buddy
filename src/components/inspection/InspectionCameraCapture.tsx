/**
 * Inspection Camera Capture
 * Photo capture for inspections with annotations,
 * stored in Supabase Storage, linked to work orders/findings
 */
import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera, Upload, Image, X, MapPin, Tag, FileText,
  CheckCircle2, AlertTriangle, Loader2
} from "lucide-react";

interface CapturedPhoto {
  file: File;
  preview: string;
  annotation: string;
  severity: string;
  location: string;
}

export function InspectionCameraCapture() {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [linkedType, setLinkedType] = useState<string>('work_order');
  const [linkedId, setLinkedId] = useState<string>('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Get work orders for linking
  const { data: workOrders = [] } = useQuery({
    queryKey: ['wo-for-photos'],
    queryFn: async () => {
      const { data } = await fromUntyped('pms_work_orders')
        .select('id, title, status')
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(30);
      return (data || []) as Array<{ id: string; title: string; status: string }>;
    },
    staleTime: 1000 * 60 * 10,
  });

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    const newPhotos: CapturedPhoto[] = [];
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      newPhotos.push({
        file,
        preview: URL.createObjectURL(file),
        annotation: '',
        severity: 'observation',
        location: '',
      });
    });
    setPhotos(prev => [...prev, ...newPhotos]);
  }, []);

  const removePhoto = useCallback((index: number) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updatePhoto = useCallback((index: number, field: keyof CapturedPhoto, value: string) => {
    setPhotos(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }, []);

  // Upload all photos
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (photos.length === 0) throw new Error('Nenhuma foto para enviar');

      const results: string[] = [];
      for (const photo of photos) {
        const ext = photo.file.name.split('.').pop() || 'jpg';
        const path = `inspections/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('inspection-photos')
          .upload(path, photo.file, { contentType: photo.file.type });

        if (uploadError) {
          // If bucket doesn't exist, still save metadata
          console.warn('Storage upload failed, saving metadata only:', uploadError.message);
        }

        // Save inspection record
        await fromUntyped('inspection_photos').insert({
          file_path: path,
          file_name: photo.file.name,
          file_size: photo.file.size,
          mime_type: photo.file.type,
          annotation: photo.annotation || null,
          severity: photo.severity,
          location_description: photo.location || null,
          linked_type: linkedType,
          linked_id: linkedId || null,
          description: description || null,
        });

        results.push(path);
      }
      return results.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} foto(s) enviada(s) com sucesso`);
      photos.forEach(p => URL.revokeObjectURL(p.preview));
      setPhotos([]);
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['inspection-photos'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Erro ao enviar fotos');
    },
  });

  // Auto-fill GPS location
  const captureLocation = useCallback((index: number) => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updatePhoto(index, 'location', `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        toast.success('Localização capturada');
      },
      () => toast.error('GPS indisponível')
    );
  }, [updatePhoto]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Camera className="h-4 w-4 text-primary" />
          Captura de Fotos — Inspeção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Capture buttons — touch-optimized */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-14 flex-col gap-1"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-5 w-5 text-primary" />
            <span className="text-xs">Câmera</span>
          </Button>
          <Button
            variant="outline"
            className="h-14 flex-col gap-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-5 w-5 text-primary" />
            <span className="text-xs">Galeria</span>
          </Button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => handleFileSelect(e.target.files)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFileSelect(e.target.files)}
          />
        </div>

        {/* Photo list */}
        {photos.length > 0 && (
          <div className="space-y-3">
            {photos.map((photo, i) => (
              <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-3">
                  <img
                    src={photo.preview}
                    alt={`Foto ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-md shrink-0"
                  />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate">{photo.file.name}</span>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => removePhoto(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Select value={photo.severity} onValueChange={v => updatePhoto(i, 'severity', v)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="observation">Observação</SelectItem>
                        <SelectItem value="minor">NC Menor</SelectItem>
                        <SelectItem value="major">NC Maior</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Input
                  placeholder="Anotação / descrição do achado..."
                  className="h-10 text-xs"
                  value={photo.annotation}
                  onChange={e => updatePhoto(i, 'annotation', e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Localização"
                    className="h-9 text-xs flex-1"
                    value={photo.location}
                    onChange={e => updatePhoto(i, 'location', e.target.value)}
                  />
                  <Button size="sm" variant="ghost" className="h-9 px-2" onClick={() => captureLocation(i)}>
                    <MapPin className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link to entity */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Vincular a</Label>
            <Select value={linkedType} onValueChange={setLinkedType}>
              <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="work_order">Ordem de Serviço</SelectItem>
                <SelectItem value="finding">Finding</SelectItem>
                <SelectItem value="nc">Não Conformidade</SelectItem>
                <SelectItem value="inspection">Inspeção</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Referência</Label>
            {linkedType === 'work_order' ? (
              <Select value={linkedId} onValueChange={setLinkedId}>
                <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Selecionar OS..." /></SelectTrigger>
                <SelectContent>
                  {workOrders.map(wo => (
                    <SelectItem key={wo.id} value={wo.id}>{wo.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input className="h-10 text-xs" placeholder="ID de referência" value={linkedId} onChange={e => setLinkedId(e.target.value)} />
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label className="text-xs">Descrição geral</Label>
          <Textarea className="min-h-[50px] text-xs" placeholder="Contexto da inspeção..." value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        {/* Submit */}
        <Button
          className="w-full h-12"
          onClick={() => uploadMutation.mutate()}
          disabled={uploadMutation.isPending || photos.length === 0}
        >
          {uploadMutation.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
          ) : (
            <><Upload className="h-4 w-4 mr-2" /> Enviar {photos.length} Foto(s)</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default InspectionCameraCapture;
