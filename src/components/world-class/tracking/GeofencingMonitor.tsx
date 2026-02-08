/**
 * Geofencing Monitor - World-Class Component
 * Virtual boundaries, zone alerts, vessel proximity warnings, compliance zones
 */

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MapPin, Shield, AlertTriangle, CheckCircle2, RefreshCw,
  Target, Radar, Bell, Navigation, CircleDot, Anchor, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { trackingIntelligence, type VesselTrackingPosition } from '@/services/tracking/tracking-intelligence.service';

interface GeofenceZone {
  id: string;
  name: string;
  type: 'restricted' | 'anchorage' | 'port' | 'eca' | 'custom';
  centerLat: number;
  centerLng: number;
  radiusNm: number;
  active: boolean;
  vesselsInside: number;
}

const ZONE_TYPES = {
  restricted: { color: 'bg-destructive/10 text-destructive border-destructive/30', icon: Shield, label: 'Restrita' },
  anchorage: { color: 'bg-amber-500/10 text-amber-600 border-amber-500/30', icon: Anchor, label: 'Fundeio' },
  port: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: Navigation, label: 'Porto' },
  eca: { color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', icon: Shield, label: 'ECA' },
  custom: { color: 'bg-violet-500/10 text-violet-600 border-violet-500/30', icon: Target, label: 'Custom' },
};

export function GeofencingMonitor() {
  const [positions, setPositions] = useState<VesselTrackingPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [zones] = useState<GeofenceZone[]>([
    { id: 'z1', name: 'Porto de Santos', type: 'port', centerLat: -23.96, centerLng: -46.30, radiusNm: 5, active: true, vesselsInside: 0 },
    { id: 'z2', name: 'Área de Fundeio - Paranaguá', type: 'anchorage', centerLat: -25.50, centerLng: -48.50, radiusNm: 3, active: true, vesselsInside: 0 },
    { id: 'z3', name: 'ECA - Litoral Sul', type: 'eca', centerLat: -25.0, centerLng: -47.0, radiusNm: 50, active: true, vesselsInside: 0 },
    { id: 'z4', name: 'Zona Restrita - Área Militar', type: 'restricted', centerLat: -22.90, centerLng: -43.17, radiusNm: 2, active: true, vesselsInside: 0 },
    { id: 'z5', name: 'Terminal Petroquímico', type: 'custom', centerLat: -23.85, centerLng: -46.35, radiusNm: 1, active: true, vesselsInside: 0 },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await trackingIntelligence.getDashboardData();
      setPositions(data.positions);
    } catch (err) {
      logger.error('Geofencing error:', err);
      toast.error('Erro ao carregar dados de geofencing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Calculate vessels inside each zone
  const zonesWithVessels = zones.map(zone => {
    const vesselsInside = positions.filter(p => {
      const dist = haversineNm(zone.centerLat, zone.centerLng, p.latitude, p.longitude);
      return dist <= zone.radiusNm;
    }).length;
    return { ...zone, vesselsInside };
  });

  const totalInZones = zonesWithVessels.reduce((a, z) => a + z.vesselsInside, 0);
  const restrictedViolations = zonesWithVessels
    .filter(z => z.type === 'restricted' && z.vesselsInside > 0);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 rounded-xl">
            <Radar className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Geofencing Monitor</h2>
            <p className="text-sm text-muted-foreground">Zonas virtuais e alertas de proximidade</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-1" /> Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Radar className="h-5 w-5 text-rose-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{zones.length}</p>
            <p className="text-xs text-muted-foreground">Zonas Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Navigation className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{positions.length}</p>
            <p className="text-xs text-muted-foreground">Embarcações Rastreadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalInZones}</p>
            <p className="text-xs text-muted-foreground">Em Zonas</p>
          </CardContent>
        </Card>
        <Card className={restrictedViolations.length > 0 ? 'border-destructive/30' : ''}>
          <CardContent className="p-4 text-center">
            <Shield className={`h-5 w-5 mx-auto mb-1 ${restrictedViolations.length > 0 ? 'text-destructive' : 'text-emerald-500'}`} />
            <p className="text-2xl font-bold">{restrictedViolations.length}</p>
            <p className="text-xs text-muted-foreground">Violações</p>
          </CardContent>
        </Card>
      </div>

      {/* Restricted Zone Violations */}
      {restrictedViolations.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              ⚠️ Violações de Zona Restrita
            </CardTitle>
          </CardHeader>
          <CardContent>
            {restrictedViolations.map(zone => (
              <div key={zone.id} className="flex items-center justify-between p-2 rounded border border-destructive/30 bg-destructive/10">
                <span className="text-sm font-medium">{zone.name}</span>
                <Badge variant="destructive">{zone.vesselsInside} embarcação(ões)</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {zonesWithVessels.map(zone => {
          const config = ZONE_TYPES[zone.type];
          const IconComp = config.icon;
          return (
            <Card key={zone.id} className={`border ${zone.vesselsInside > 0 && zone.type === 'restricted' ? 'border-destructive/50' : 'border-border/50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${config.color.split(' ')[0]}`}>
                      <IconComp className={`h-4 w-4 ${config.color.split(' ')[1]}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{zone.name}</p>
                      <Badge variant="outline" className="text-xs mt-0.5">{config.label}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{zone.vesselsInside}</p>
                    <p className="text-xs text-muted-foreground">dentro</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">Centro:</span>
                    <span className="block font-mono">{zone.centerLat.toFixed(2)}°, {zone.centerLng.toFixed(2)}°</span>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">Raio:</span>
                    <span className="block font-bold">{zone.radiusNm} NM</span>
                  </div>
                  <div className="p-2 rounded bg-muted/30">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`block font-bold ${zone.active ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      {zone.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                {/* Visual zone indicator */}
                <div className="mt-3 relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                      zone.vesselsInside > 0
                        ? zone.type === 'restricted' ? 'bg-destructive' : 'bg-primary'
                        : 'bg-muted-foreground/20'
                    }`}
                    style={{ width: `${Math.min((zone.vesselsInside / Math.max(positions.length, 1)) * 100, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Haversine formula in nautical miles
function haversineNm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3440.065; // Earth radius in NM
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
