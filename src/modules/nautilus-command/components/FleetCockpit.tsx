/**
 * Fleet Cockpit - Visualização em tempo real da frota
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Ship, Anchor, Navigation, Fuel, Thermometer, Activity,
  MapPin, Clock, AlertTriangle, CheckCircle, Radio, Waves
} from "lucide-react";

interface Vessel {
  id: string;
  name: string;
  imo_number?: string | null;
  vessel_type?: string | null;
  status: string;
  current_location?: string | null;
  fuel_level?: number;
  speed?: number;
  heading?: number;
  last_update?: Date;
}

interface FleetCockpitProps {
  vessels?: Vessel[];
  expanded?: boolean;
}

export const FleetCockpit: React.FC<FleetCockpitProps> = ({ vessels: propVessels, expanded = false }) => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propVessels && propVessels.length > 0) {
      setVessels(propVessels);
      setLoading(false);
    } else {
      loadVessels();
    }
  }, [propVessels]);

  const loadVessels = async () => {
    try {
      const { data } = await supabase.from('vessels').select('*').limit(20);
      
      // Enrich with mock operational data
      const enrichedVessels = (data || []).map(v => ({
        ...v,
        fuel_level: Math.floor(Math.random() * 40) + 60,
        speed: Math.floor(Math.random() * 15) + 5,
        heading: Math.floor(Math.random() * 360),
        last_update: new Date()
      }));
      
      setVessels(enrichedVessels);
    } catch (error) {
      console.error('Error loading vessels:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'docked': return 'bg-blue-500';
      case 'alert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Operando</Badge>;
      case 'maintenance': return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Manutenção</Badge>;
      case 'docked': return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Atracado</Badge>;
      case 'alert': return <Badge variant="destructive">Alerta</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={expanded ? "" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-blue-500" />
              Fleet Cockpit
            </CardTitle>
            <CardDescription>
              Monitoramento em tempo real de {vessels.length} embarcações
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Radio className="h-3 w-3 animate-pulse text-green-500" />
              Tempo Real
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {vessels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ship className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma embarcação cadastrada</p>
            <Button variant="outline" size="sm" className="mt-3">
              Adicionar Embarcação
            </Button>
          </div>
        ) : (
          <div className={`grid gap-4 ${expanded ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
            {vessels.slice(0, expanded ? vessels.length : 4).map((vessel, index) => (
              <motion.div
                key={vessel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="relative overflow-hidden hover:shadow-md transition-all cursor-pointer border-l-4"
                      style={{ borderLeftColor: getStatusColor(vessel.status).replace('bg-', '') }}>
                  {/* Status indicator */}
                  <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getStatusColor(vessel.status)} animate-pulse`} />
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{vessel.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          IMO: {vessel.imo_number || 'N/A'}
                        </p>
                      </div>
                      {getStatusBadge(vessel.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {/* Location */}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs truncate">
                          {vessel.current_location || 'Em trânsito'}
                        </span>
                      </div>

                      {/* Speed */}
                      <div className="flex items-center gap-2">
                        <Navigation className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{vessel.speed} kn</span>
                      </div>

                      {/* Heading */}
                      <div className="flex items-center gap-2">
                        <Waves className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{vessel.heading}°</span>
                      </div>

                      {/* Last update */}
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">Agora</span>
                      </div>
                    </div>

                    {/* Fuel level */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Fuel className="h-3 w-3" />
                          Combustível
                        </div>
                        <span className="text-xs font-medium">{vessel.fuel_level}%</span>
                      </div>
                      <Progress 
                        value={vessel.fuel_level} 
                        className="h-1.5"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!expanded && vessels.length > 4 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Ver todas as {vessels.length} embarcações
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
