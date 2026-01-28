/**
 * Vessel Overview Component
 * Shows key specifications and status
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Anchor, 
  Ruler, 
  Gauge, 
  Fuel, 
  Users, 
  Calendar,
  Building,
  Shield,
  Navigation
} from 'lucide-react';
import type { VesselSpecifications } from '@/hooks/use-vessel-digital-twin';

interface VesselOverviewProps {
  vessel: any;
  specifications: VesselSpecifications | null;
}

// Type-safe specs accessor
type SpecsType = VesselSpecifications | Record<string, never>;

export default function VesselOverview({ vessel, specifications }: VesselOverviewProps) {
  const specs: SpecsType = specifications || {} as Record<string, never>;
  
  const s = specs as VesselSpecifications;
  
  const dimensionItems = [
    { label: 'Comprimento Total', value: s.length_overall, unit: 'm', icon: Ruler },
    { label: 'Boca', value: s.beam, unit: 'm', icon: Ruler },
    { label: 'Calado', value: s.draft, unit: 'm', icon: Anchor },
    { label: 'Pontal', value: s.depth, unit: 'm', icon: Ruler },
  ];

  const capacityItems = [
    { label: 'Arqueação Bruta (GT)', value: s.gross_tonnage, icon: Anchor },
    { label: 'Arqueação Líquida (NT)', value: s.net_tonnage, icon: Anchor },
    { label: 'Porte Bruto (DWT)', value: s.deadweight, icon: Anchor },
    { label: 'Capacidade de Carga', value: s.cargo_capacity, unit: 't', icon: Anchor },
  ];

  const propulsionItems = [
    { label: 'Tipo de Propulsão', value: s.propulsion_type, icon: Navigation },
    { label: 'Motor Principal', value: s.main_engine_type, icon: Gauge },
    { label: 'Potência', value: s.main_engine_power, icon: Gauge },
    { label: 'Velocidade Máxima', value: s.speed_max, unit: 'kn', icon: Gauge },
    { label: 'Velocidade de Serviço', value: s.speed_service, unit: 'kn', icon: Gauge },
    { label: 'Autonomia', value: s.range_nautical_miles, unit: 'NM', icon: Navigation },
  ];

  const tankItems = [
    { label: 'Combustível', value: s.fuel_capacity, unit: 'm³', icon: Fuel },
    { label: 'Água Doce', value: s.fresh_water_capacity, unit: 'm³', icon: Fuel },
    { label: 'Lastro', value: s.ballast_capacity, unit: 'm³', icon: Fuel },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">IMO</p>
              <p className="font-medium">{vessel.imo_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium">{vessel.vessel_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bandeira</p>
              <p className="font-medium">{vessel.flag || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ano de Construção</p>
              <p className="font-medium">{s.build_year || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estaleiro</p>
              <p className="font-medium">{s.builder || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Material do Casco</p>
              <p className="font-medium">{s.hull_material || 'N/A'}</p>
            </div>
          </div>
          
          {/* Classification */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium">Classificação</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sociedade</p>
                <p className="font-medium">{s.classification_society || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Notação</p>
                <p className="font-medium">{s.class_notation || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Dimensões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {dimensionItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">
                    {item.value != null ? `${item.value} ${item.unit || ''}` : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Capacity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            Capacidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {capacityItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">
                    {item.value != null ? `${item.value.toLocaleString()} ${item.unit || ''}` : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Crew */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">Tripulação</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Capacidade Tripulação</p>
                <p className="font-medium">{s.crew_capacity || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacidade Passageiros</p>
                <p className="font-medium">{s.passenger_capacity || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Propulsion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Propulsão & Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {propulsionItems.map((item, i) => (
              <div key={i}>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-medium">
                  {item.value != null ? `${item.value} ${item.unit || ''}` : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tanks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Tanques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tankItems.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium">
                    {item.value != null ? `${item.value} ${item.unit}` : 'N/A'}
                  </span>
                </div>
                <Progress value={item.value ? 75 : 0} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dry Dock Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Docagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Última Docagem</p>
              <p className="font-medium">
                {s.last_dry_dock 
                  ? new Date(s.last_dry_dock).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Próxima Docagem</p>
              <p className="font-medium">
                {s.next_dry_dock 
                  ? new Date(s.next_dry_dock).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </p>
              {s.next_dry_dock && (
                <Badge variant="outline" className="mt-1">
                  Em {Math.ceil((new Date(s.next_dry_dock).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
