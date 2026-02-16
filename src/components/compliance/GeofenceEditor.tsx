/**
 * Geofence Editor Component
 * Visual editor for creating and managing custom geofence zones
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  MapPin, Plus, Trash2, Edit, Save, X, Target, Shield,
  AlertTriangle, Info, Check, RotateCcw, Globe, Crosshair
} from 'lucide-react';

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'inspection-required' | 'restricted' | 'warning';
  center: [number, number]; // [lng, lat]
  radiusKm: number;
  active: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GeofenceEditorProps {
  geofences: GeofenceZone[];
  onGeofencesChange: (geofences: GeofenceZone[]) => void;
  onSelectGeofence?: (geofence: GeofenceZone) => void;
}

const DEFAULT_GEOFENCES: GeofenceZone[] = [
  { id: 'gz-1', name: 'Port of Rotterdam', type: 'inspection-required', center: [4.4777, 51.9244], radiusKm: 15, active: true, description: 'Porto principal da Europa', createdAt: new Date(), updatedAt: new Date() },
  { id: 'gz-2', name: 'Port of Singapore', type: 'inspection-required', center: [103.8198, 1.2644], radiusKm: 20, active: true, description: 'Hub marítimo asiático', createdAt: new Date(), updatedAt: new Date() },
  { id: 'gz-3', name: 'Port of Santos', type: 'inspection-required', center: [-46.3042, -23.9608], radiusKm: 12, active: true, description: 'Maior porto da América Latina', createdAt: new Date(), updatedAt: new Date() },
  { id: 'gz-4', name: 'Restricted Zone - North Sea', type: 'restricted', center: [3.0, 56.0], radiusKm: 50, active: true, description: 'Área de navegação restrita', createdAt: new Date(), updatedAt: new Date() },
  { id: 'gz-5', name: 'Warning Zone - Gulf of Aden', type: 'warning', center: [48.0, 12.0], radiusKm: 100, active: true, description: 'Área de risco - pirataria', createdAt: new Date(), updatedAt: new Date() },
];

export function GeofenceEditor({ 
  geofences = DEFAULT_GEOFENCES, 
  onGeofencesChange,
  onSelectGeofence 
}: GeofenceEditorProps) {
  const [zones, setZones] = useState<GeofenceZone[]>(geofences);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<GeofenceZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'inspection-required' as GeofenceZone['type'],
    lng: 0,
    lat: 0,
    radiusKm: 10,
    description: '',
    active: true,
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'inspection-required',
      lng: 0,
      lat: 0,
      radiusKm: 10,
      description: '',
      active: true,
    });
    setEditingZone(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (zone: GeofenceZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      type: zone.type,
      lng: zone.center[0],
      lat: zone.center[1],
      radiusKm: zone.radiusKm,
      description: zone.description || '',
      active: zone.active,
    });
    setIsDialogOpen(true);
  };

  const saveZone = () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (formData.lat < -90 || formData.lat > 90) {
      toast.error('Latitude deve estar entre -90 e 90');
      return;
    }

    if (formData.lng < -180 || formData.lng > 180) {
      toast.error('Longitude deve estar entre -180 e 180');
      return;
    }

    const now = new Date();
    
    if (editingZone) {
      // Update existing
      const updated = zones.map(z => 
        z.id === editingZone.id 
          ? {
              ...z,
              name: formData.name,
              type: formData.type,
              center: [formData.lng, formData.lat] as [number, number],
              radiusKm: formData.radiusKm,
              description: formData.description,
              active: formData.active,
              updatedAt: now,
            }
          : z
      );
      setZones(updated);
      onGeofencesChange?.(updated);
      toast.success('Zona atualizada com sucesso');
    } else {
      // Create new
      const newZone: GeofenceZone = {
        id: `gz-custom-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        center: [formData.lng, formData.lat],
        radiusKm: formData.radiusKm,
        description: formData.description,
        active: formData.active,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [...zones, newZone];
      setZones(updated);
      onGeofencesChange?.(updated);
      toast.success('Nova zona de geofencing criada');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const deleteZone = (zoneId: string) => {
    const updated = zones.filter(z => z.id !== zoneId);
    setZones(updated);
    onGeofencesChange?.(updated);
    toast.success('Zona removida');
  };

  const toggleZoneActive = (zoneId: string) => {
    const updated = zones.map(z => 
      z.id === zoneId ? { ...z, active: !z.active, updatedAt: new Date() } : z
    );
    setZones(updated);
    onGeofencesChange?.(updated);
  };

  const getTypeIcon = (type: GeofenceZone['type']) => {
    switch (type) {
      case 'inspection-required': return <Target className="h-4 w-4 text-info" />;
      case 'restricted': return <Shield className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  const getTypeBadge = (type: GeofenceZone['type']) => {
    const styles: Record<string, string> = {
      'inspection-required': 'bg-info/10 text-info border-info/20',
      'restricted': 'bg-destructive/10 text-destructive border-destructive/20',
      'warning': 'bg-warning/10 text-warning border-warning/20',
    };
    const labels: Record<string, string> = {
      'inspection-required': 'Inspeção Obrigatória',
      'restricted': 'Área Restrita',
      'warning': 'Zona de Alerta',
    };
    return <Badge variant="outline" className={styles[type]}>{labels[type]}</Badge>;
  };

  // Stats
  const stats = {
    total: zones.length,
    active: zones.filter(z => z.active).length,
    inspectionRequired: zones.filter(z => z.type === 'inspection-required').length,
    restricted: zones.filter(z => z.type === 'restricted').length,
    warning: zones.filter(z => z.type === 'warning').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Editor de Geofencing
              </CardTitle>
              <CardDescription>
                Crie e gerencie zonas de geofencing personalizadas
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Zona
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingZone ? 'Editar Zona de Geofencing' : 'Nova Zona de Geofencing'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure os parâmetros da zona de geofencing
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome da Zona *</Label>
                    <Input
                      placeholder="Ex: Port of Miami"
                      value={formData.name}
                      onChange={(e) => updateFormData({ name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: GeofenceZone['type']) => updateFormData({ type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inspection-required">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-info" />
                            Inspeção Obrigatória
                          </div>
                        </SelectItem>
                        <SelectItem value="restricted">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-destructive" />
                            Área Restrita
                          </div>
                        </SelectItem>
                        <SelectItem value="warning">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            Zona de Alerta
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="-46.6333"
                        value={formData.lng}
                        onChange={(e) => updateFormData({ lng: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="-23.5505"
                        value={formData.lat}
                        onChange={(e) => updateFormData({ lat: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Raio (km)</Label>
                      <span className="text-sm font-medium">{formData.radiusKm} km</span>
                    </div>
                    <Slider
                      value={[formData.radiusKm]}
                      onValueChange={([value]) => updateFormData({ radiusKm: value })}
                      min={1}
                      max={200}
                      step={1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Área coberta: ~{Math.round(Math.PI * formData.radiusKm * formData.radiusKm)} km²
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input
                      placeholder="Descrição opcional"
                      value={formData.description}
                      onChange={(e) => updateFormData({ description: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Zona Ativa</span>
                    </div>
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(active) => updateFormData({ active })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveZone}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingZone ? 'Salvar Alterações' : 'Criar Zona'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total de Zonas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <div>
              <p className="text-2xl font-bold text-success">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-info" />
            <div>
              <p className="text-2xl font-bold text-info">{stats.inspectionRequired}</p>
              <p className="text-xs text-muted-foreground">Inspeção</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-destructive" />
            <div>
              <p className="text-2xl font-bold text-destructive">{stats.restricted}</p>
              <p className="text-xs text-muted-foreground">Restritas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <div>
              <p className="text-2xl font-bold text-warning">{stats.warning}</p>
              <p className="text-xs text-muted-foreground">Alerta</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Zone List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Zonas de Geofencing</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                    !zone.active ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getTypeIcon(zone.type)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{zone.name}</p>
                          {getTypeBadge(zone.type)}
                          {!zone.active && (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                        </div>
                        {zone.description && (
                          <p className="text-sm text-muted-foreground">{zone.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Crosshair className="h-3 w-3" />
                            {zone.center[1].toFixed(4)}, {zone.center[0].toFixed(4)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            Raio: {zone.radiusKm} km
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={zone.active}
                        onCheckedChange={() => toggleZoneActive(zone.id)}
                      />
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          onSelectGeofence?.(zone);
                        }}
                      >
                        <Globe className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => openEditDialog(zone)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => deleteZone(zone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
