/**
 * Geofencing Tab — Fleet Tracking Enhancement
 * Zone-based alerts for restricted areas, piracy, ECA, port proximity
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations/motion-variants";
import {
  Shield, AlertTriangle, MapPin, Plus, Bell, Globe,
  Anchor, Skull, Leaf, Navigation, Eye, Trash2
} from "lucide-react";

interface GeofenceZone {
  id: string;
  name: string;
  type: "eca" | "piracy" | "restricted" | "port" | "custom";
  lat: number;
  lng: number;
  radiusNm: number;
  alertOnEntry: boolean;
  alertOnExit: boolean;
  active: boolean;
  description?: string;
}

const ZONE_TYPES = [
  { value: "eca", label: "ECA (Emission Control)", icon: Leaf, color: "bg-success/20 text-success" },
  { value: "piracy", label: "Alto Risco / Pirataria", icon: Skull, color: "bg-destructive/20 text-destructive" },
  { value: "restricted", label: "Zona Restrita", icon: Shield, color: "bg-warning/20 text-warning" },
  { value: "port", label: "Proximidade de Porto", icon: Anchor, color: "bg-primary/20 text-primary" },
  { value: "custom", label: "Personalizada", icon: MapPin, color: "bg-muted text-muted-foreground" },
];

// Predefined high-risk zones (real maritime zones)
const PREDEFINED_ZONES: GeofenceZone[] = [
  { id: "hra-1", name: "HRA - Golfo de Aden", type: "piracy", lat: 12.0, lng: 45.0, radiusNm: 300, alertOnEntry: true, alertOnExit: false, active: true, description: "High Risk Area - UKMTO/IMO designated" },
  { id: "hra-2", name: "HRA - Estreito de Malaca", type: "piracy", lat: 2.5, lng: 101.5, radiusNm: 200, alertOnEntry: true, alertOnExit: false, active: true, description: "High Risk Area - ReCAAP designated" },
  { id: "hra-3", name: "HRA - Golfo da Guiné", type: "piracy", lat: 4.0, lng: 3.0, radiusNm: 400, alertOnEntry: true, alertOnExit: false, active: true, description: "High Risk Area - MDAT-GoG" },
  { id: "eca-1", name: "ECA - Mar do Norte / Báltico", type: "eca", lat: 56.0, lng: 10.0, radiusNm: 500, alertOnEntry: true, alertOnExit: true, active: true, description: "SOx ECA - 0.10% sulfur limit" },
  { id: "eca-2", name: "ECA - Costa dos EUA", type: "eca", lat: 38.0, lng: -75.0, radiusNm: 200, alertOnEntry: true, alertOnExit: true, active: true, description: "North America ECA - 200nm from coast" },
  { id: "eca-3", name: "ECA - Mar Mediterrâneo", type: "eca", lat: 36.0, lng: 18.0, radiusNm: 600, alertOnEntry: true, alertOnExit: true, active: true, description: "Med SOx ECA - effective 2025" },
  { id: "port-1", name: "Porto de Santos", type: "port", lat: -23.95, lng: -46.30, radiusNm: 25, alertOnEntry: true, alertOnExit: true, active: true, description: "Maior porto da América Latina" },
  { id: "port-2", name: "Porto de Singapura", type: "port", lat: 1.26, lng: 103.84, radiusNm: 20, alertOnEntry: true, alertOnExit: true, active: true, description: "Principal hub marítimo global" },
];

export function GeofencingTab() {
  const [zones, setZones] = useState<GeofenceZone[]>(PREDEFINED_ZONES);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [newZone, setNewZone] = useState<Partial<GeofenceZone>>({
    type: "custom", radiusNm: 50, alertOnEntry: true, alertOnExit: false, active: true,
  });

  // Fetch vessels for proximity check
  const { data: vessels = [] } = useQuery({
    queryKey: ["vessels-geofence"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vessels").select("id, name, current_position, status").limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const filteredZones = useMemo(() => {
    if (filterType === "all") return zones;
    return zones.filter(z => z.type === filterType);
  }, [zones, filterType]);

  const stats = useMemo(() => ({
    total: zones.length,
    active: zones.filter(z => z.active).length,
    piracy: zones.filter(z => z.type === "piracy").length,
    eca: zones.filter(z => z.type === "eca").length,
    alerts: zones.filter(z => z.active && z.alertOnEntry).length,
  }), [zones]);

  const handleCreateZone = () => {
    if (!newZone.name || !newZone.lat || !newZone.lng) {
      toast.error("Preencha nome, latitude e longitude");
      return;
    }
    const zone: GeofenceZone = {
      id: `custom-${Date.now()}`,
      name: newZone.name!,
      type: (newZone.type as GeofenceZone["type"]) || "custom",
      lat: newZone.lat!,
      lng: newZone.lng!,
      radiusNm: newZone.radiusNm || 50,
      alertOnEntry: newZone.alertOnEntry ?? true,
      alertOnExit: newZone.alertOnExit ?? false,
      active: true,
      description: newZone.description,
    };
    setZones(prev => [...prev, zone]);
    setShowCreateDialog(false);
    setNewZone({ type: "custom", radiusNm: 50, alertOnEntry: true, alertOnExit: false, active: true });
    toast.success(`Zona "${zone.name}" criada com sucesso`);
  };

  const toggleZone = (id: string) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, active: !z.active } : z));
  };

  const deleteZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
    toast.success("Zona removida");
  };

  const getZoneTypeInfo = (type: string) => ZONE_TYPES.find(z => z.value === type) || ZONE_TYPES[4];

  return (
    <motion.div variants={fadeUp} className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Zonas", value: stats.total, icon: Globe, color: "text-primary" },
          { label: "Ativas", value: stats.active, icon: Eye, color: "text-success" },
          { label: "Alto Risco", value: stats.piracy, icon: Skull, color: "text-destructive" },
          { label: "ECAs", value: stats.eca, icon: Leaf, color: "text-success" },
          { label: "Alertas Ativos", value: stats.alerts, icon: Bell, color: "text-warning" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-3 flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filtrar por tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as zonas</SelectItem>
            {ZONE_TYPES.map(z => <SelectItem key={z.value} value={z.value}>{z.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Nova Zona</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Zona de Geofencing</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={newZone.name || ""} onChange={e => setNewZone(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Zona de Exclusão - Porto XYZ" /></div>
              <div>
                <Label>Tipo</Label>
                <Select value={newZone.type} onValueChange={(v: GeofenceZone["type"]) => setNewZone(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ZONE_TYPES.map(z => <SelectItem key={z.value} value={z.value}>{z.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Latitude</Label><Input type="number" step="0.01" value={newZone.lat || ""} onChange={e => setNewZone(p => ({ ...p, lat: parseFloat(e.target.value) }))} /></div>
                <div><Label>Longitude</Label><Input type="number" step="0.01" value={newZone.lng || ""} onChange={e => setNewZone(p => ({ ...p, lng: parseFloat(e.target.value) }))} /></div>
                <div><Label>Raio (NM)</Label><Input type="number" value={newZone.radiusNm || 50} onChange={e => setNewZone(p => ({ ...p, radiusNm: parseInt(e.target.value) }))} /></div>
              </div>
              <div><Label>Descrição</Label><Input value={newZone.description || ""} onChange={e => setNewZone(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={newZone.alertOnEntry} onCheckedChange={v => setNewZone(p => ({ ...p, alertOnEntry: v }))} />
                  <Label className="text-sm">Alerta ao entrar</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={newZone.alertOnExit} onCheckedChange={v => setNewZone(p => ({ ...p, alertOnExit: v }))} />
                  <Label className="text-sm">Alerta ao sair</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateZone}>Criar Zona</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Zone List */}
      <div className="space-y-2">
        {filteredZones.map(zone => {
          const typeInfo = getZoneTypeInfo(zone.type);
          const TypeIcon = typeInfo.icon;
          return (
            <Card key={zone.id} className={`transition-all ${!zone.active ? "opacity-50" : ""}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{zone.name}</h4>
                      <Badge variant="outline" className="text-[10px]">{typeInfo.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {zone.lat.toFixed(2)}°, {zone.lng.toFixed(2)}° • Raio: {zone.radiusNm} NM
                      {zone.description && ` • ${zone.description}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {zone.alertOnEntry && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Navigation className="h-3 w-3 mr-1" />Entrada
                      </Badge>
                    )}
                    {zone.alertOnExit && (
                      <Badge variant="secondary" className="text-[10px]">
                        <Navigation className="h-3 w-3 mr-1 rotate-180" />Saída
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Switch checked={zone.active} onCheckedChange={() => toggleZone(zone.id)} />
                  {zone.id.startsWith("custom") && (
                    <Button variant="ghost" size="icon" onClick={() => deleteZone(zone.id)} aria-label="Excluir zona">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredZones.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma zona configurada para este filtro</p>
        </CardContent></Card>
      )}
    </motion.div>
  );
}
